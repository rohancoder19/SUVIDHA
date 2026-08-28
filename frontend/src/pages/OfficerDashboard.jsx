import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, CheckCircle2, Clock, AlertTriangle, Filter, Search,
  Edit, Lock, Users, Layers, Award, ThumbsUp, MapPin, Eye, FileText, Check, AlertCircle, X
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Update Form State
  const [updateStatus, setUpdateStatus] = useState('');
  const [updatePriority, setUpdatePriority] = useState('');
  const [updateRemark, setUpdateRemark] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    fetchOfficerGrievances();
  }, []);

  const fetchOfficerGrievances = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/grievances');
      if (res.data.grievances) {
        setGrievances(res.data.grievances);
      }
    } catch (err) {
      console.error('Error loading officer grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGrievance = (g) => {
    setSelectedGrievance(g);
    setUpdateStatus(g.status);
    setUpdatePriority(g.priority || 'MEDIUM');
    setUpdateRemark('');
    setUpdateSuccess('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrievance) return;

    setUpdating(true);
    setUpdateSuccess('');

    try {
      const res = await axios.put(`/api/grievances/${selectedGrievance._id}/status`, {
        status: updateStatus,
        priority: updatePriority,
        remark: updateRemark
      });

      if (res.data.success) {
        setUpdateSuccess('Grievance status updated successfully!');
        setSelectedGrievance(res.data.grievance);
        fetchOfficerGrievances();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update grievance status.');
    } finally {
      setUpdating(false);
    }
  };

  // Filtered List
  const filteredGrievances = grievances.filter(g => {
    if (filterPriority !== 'ALL' && g.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && g.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = (g.referenceNumber || '').toLowerCase().includes(q);
      const matchSubject = (g.subject || '').toLowerCase().includes(q);
      const matchCategory = (g.category || '').toLowerCase().includes(q);
      if (!matchRef && !matchSubject && !matchCategory) return false;
    }
    return true;
  });

  const totalCount = grievances.length;
  const criticalCount = grievances.filter(g => g.priority === 'CRITICAL').length;
  const highCount = grievances.filter(g => g.priority === 'HIGH').length;
  const pendingCount = grievances.filter(g => ['SUBMITTED', 'UNDER_REVIEW'].includes(g.status)).length;
  const resolvedCount = grievances.filter(g => ['RESOLVED', 'CLOSED'].includes(g.status)).length;

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider animate-pulse">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider">HIGH</span>;
      case 'LOW':
        return <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase">LOW</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] uppercase">MEDIUM</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'RESOLVED':
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase">✓ {s}</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px] uppercase">Rejected</span>;
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] uppercase">In Progress</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px] uppercase">Under Review</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      
      {/* Officer Control Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Nodal Officer Triage & Control Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit">
            Civic Grievance Resolution Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong className="text-slate-900 dark:text-white">{user?.name}</strong> ({user?.role})
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Grievances</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold font-outfit">{totalCount}</div>
          <div className="text-[10px] text-slate-400">Total registered</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Critical Hazards</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 font-outfit">{criticalCount}</div>
          <div className="text-[10px] text-slate-400">Immediate action needed</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>High Priority</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-outfit">{highCount}</div>
          <div className="text-[10px] text-slate-400">Public impact issue</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 font-outfit">{pendingCount}</div>
          <div className="text-[10px] text-slate-400">Awaiting officer update</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-outfit">{resolvedCount}</div>
          <div className="text-[10px] text-slate-400">Action completed</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference # or subject..."
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            Showing {filteredGrievances.length} of {totalCount} Grievances
          </span>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Reference #</th>
                <th className="p-3">Subject / Issue</th>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Department</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400">Loading grievance queue...</td>
                </tr>
              ) : filteredGrievances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400">No grievances match the selected filters.</td>
                </tr>
              ) : (
                filteredGrievances.map(g => (
                  <tr key={g._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">#{g.referenceNumber}</td>
                    <td className="p-3 font-medium line-clamp-1 max-w-xs">{g.subject}</td>
                    <td className="p-3">{g.category}</td>
                    <td className="p-3">{getPriorityBadge(g.priority)}</td>
                    <td className="p-3 text-[11px] text-slate-500">{g.department || 'Unassigned'}</td>
                    <td className="p-3">{getStatusBadge(g.status)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleOpenGrievance(g)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-500 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICER GRIEVANCE MANAGE MODAL */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">#{selectedGrievance.referenceNumber}</span>
                <h2 className="text-xl font-extrabold font-outfit">{selectedGrievance.subject}</h2>
              </div>
              <button
                onClick={() => setSelectedGrievance(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Triage Information Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  AI Triage Score & Suggestion
                </span>
                <span className="text-xs font-bold text-indigo-600">Urgency: {selectedGrievance.urgencyScore || 50}%</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                AI Category: <strong>{selectedGrievance.aiCategory || selectedGrievance.category}</strong> • AI Priority: <strong>{selectedGrievance.aiPriority || selectedGrievance.priority}</strong>
              </p>
              {selectedGrievance.aiReason && (
                <p className="text-xs text-slate-500 italic">"{selectedGrievance.aiReason}"</p>
              )}
            </div>

            {/* Description & Citizen Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Problem Description</span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedGrievance.description}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Citizen & Geolocation Data</span>
                <p className="text-slate-700 dark:text-slate-300">Landmark: <strong>{selectedGrievance.address || 'N/A'}</strong></p>
                <p className="text-slate-700 dark:text-slate-300">GPS Lat/Lng: <strong>{selectedGrievance.latitude ? `${selectedGrievance.latitude.toFixed(4)}°, ${selectedGrievance.longitude.toFixed(4)}°` : 'N/A'}</strong></p>
                <p className="text-slate-700 dark:text-slate-300">Submitted On: <strong>{new Date(selectedGrievance.createdAt).toLocaleString()}</strong></p>
              </div>
            </div>

            {/* Evidence Image Preview */}
            {selectedGrievance.attachments && selectedGrievance.attachments.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Uploaded Evidence Proof</span>
                <div className="flex flex-wrap gap-3">
                  {selectedGrievance.attachments.map((imgUrl, i) => (
                    <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 hover:opacity-90">
                      <img src={imgUrl} alt="Evidence" className="w-32 h-24 object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Officer Action Form */}
            <form onSubmit={handleUpdateSubmit} className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="font-bold text-sm">Officer Action & Status Override</h3>

              {updateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{updateSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Update Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="ACTION_REQUIRED">ACTION_REQUIRED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Override Priority</label>
                  <select
                    value={updatePriority}
                    onChange={(e) => setUpdatePriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Officer Official Remark / Action Notes</label>
                <textarea
                  rows={3}
                  value={updateRemark}
                  onChange={(e) => setUpdateRemark(e.target.value)}
                  placeholder="Enter official action taken or reason for status update..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGrievance(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  {updating ? 'Saving Changes...' : 'Save Official Status Update'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
