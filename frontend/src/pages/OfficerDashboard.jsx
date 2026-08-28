import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GrievanceMap from '../components/GrievanceMap';
import {
  ShieldAlert, CheckCircle2, Clock, AlertTriangle, Filter, Search,
  Edit, Lock, Users, Layers, Award, ThumbsUp, MapPin, Eye, FileText, Check, AlertCircle, X,
  Sparkles, CheckCircle, Flame, ArrowUpRight, CheckSquare, Settings, RefreshCw
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();

  const [grievances, setGrievances] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Update Form State Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
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
    setFetchError('');
    try {
      const endpoint = user?.role === 'Admin' ? '/api/admin/grievances' : '/api/grievances/officer/queue';
      const res = await axios.get(endpoint);
      const list = res.data.grievances || res.data.data?.grievances || [];
      setGrievances(list);
      if (list.length > 0) {
        setSelectedGrievance(list[0]);
      } else {
        setSelectedGrievance(null);
      }
    } catch (err) {
      console.error('Error fetching officer queue:', err);
      setFetchError('Unable to load grievances. Please check the server connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGrievance = (g) => {
    setSelectedGrievance(g);
  };

  const handleOpenUpdateModal = (g) => {
    setSelectedGrievance(g);
    setUpdateStatus(g.status || 'IN_PROGRESS');
    setUpdatePriority(g.priority || 'MEDIUM');
    setUpdateRemark(g.officerRemarks || '');
    setUpdateSuccess('');
    setIsUpdateModalOpen(true);
  };

  const handleAcceptAITriage = async (g) => {
    try {
      const res = await axios.put(`/api/grievances/${g._id}/status`, {
        status: 'IN_PROGRESS',
        remark: 'AI Triage Accepted & Dispatched to Field Unit'
      });

      if (res.data.success) {
        alert(`AI Triage Accepted! Grievance #${g.referenceNumber} status updated to IN_PROGRESS in MongoDB Atlas.`);
        fetchOfficerGrievances();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept AI Triage.');
    }
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
        remark: updateRemark,
        comment: updateRemark
      });

      if (res.data.success) {
        setUpdateSuccess(`Status updated to ${updateStatus} successfully!`);
        fetchOfficerGrievances();
        setTimeout(() => setIsUpdateModalOpen(false), 1200);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to update status in database.');
    } finally {
      setUpdating(false);
    }
  };

  // Filter Logic
  const filteredGrievances = grievances.filter(g => {
    const matchesPriority = filterPriority === 'ALL' || g.priority === filterPriority;
    const matchesStatus = filterStatus === 'ALL' || g.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      g.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPriority && matchesStatus && matchesSearch;
  });

  const criticalCount = grievances.filter(g => g.priority === 'CRITICAL').length;
  const highCount = grievances.filter(g => g.priority === 'HIGH').length;
  const mediumCount = grievances.filter(g => g.priority === 'MEDIUM').length;
  const lowCount = grievances.filter(g => g.priority === 'LOW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#070d17] text-slate-100 min-h-screen">
      
      {/* HEADER BANNER */}
      <div className="bg-[#0e1726]/90 border border-[#1e293b] p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">AI GRIEVANCE INTELLIGENCE SYSTEM & COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-wide">
            Smart Priority Queue & Operational Triage
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Nodal Officer Command Portal — Logged in as <strong className="text-white">{user?.name}</strong> ({user?.role} - {user?.profile?.occupation || 'Nodal Officer'})
          </p>
        </div>

        <button
          onClick={fetchOfficerGrievances}
          className="px-4 py-2.5 rounded-2xl bg-[#070d17] border border-[#1e293b] text-slate-300 hover:text-white font-bold text-xs flex items-center space-x-2 shadow-md shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Sync Database</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e1726]/90 border border-rose-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider">
            <span>CRITICAL</span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-white font-outfit">{criticalCount}</div>
          <div className="text-[10px] text-slate-400 font-semibold">Immediate hazard response</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1726]/90 border border-amber-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
            <span>HIGH PRIORITY</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-outfit">{highCount}</div>
          <div className="text-[10px] text-slate-400 font-semibold">24-48h target SLA</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1726]/90 border border-cyan-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <span>MEDIUM</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-outfit">{mediumCount}</div>
          <div className="text-[10px] text-slate-400 font-semibold">Routine maintenance queue</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1726]/90 border border-emerald-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <span>LOW</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-outfit">{lowCount}</div>
          <div className="text-[10px] text-slate-400 font-semibold">Standard service queue</div>
        </div>
      </div>

      {/* AI GRIEVANCE ANALYSIS & AUDIT CENTER (FOR ACTIVE SELECTED GRIEVANCE) */}
      {selectedGrievance ? (
        <div className="bg-[#0e1726]/95 border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                AI GRIEVANCE ANALYSIS & AUDIT CENTER — #{selectedGrievance.referenceNumber}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-outfit mt-1">
                {selectedGrievance.subject}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAcceptAITriage(selectedGrievance)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept Triage & Dispatch</span>
              </button>

              <button
                onClick={() => handleOpenUpdateModal(selectedGrievance)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all flex items-center space-x-1.5"
              >
                <Edit className="w-4 h-4" />
                <span>Update Status</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-[#070d17] border border-[#1e293b] space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Classification</div>
              <div className="text-sm font-extrabold text-cyan-400">{selectedGrievance.category}</div>
              <div className="text-slate-400">Department: <strong className="text-slate-200">{selectedGrievance.department || 'Nodal Office'}</strong></div>
            </div>

            <div className="p-4 rounded-2xl bg-[#070d17] border border-[#1e293b] space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgency Score & Priority</div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-amber-400">{selectedGrievance.priority}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono text-[10px]">
                  Score: {selectedGrievance.urgencyScore || 50}/100
                </span>
              </div>
              <div className="text-slate-400">Current Status: <strong className="text-emerald-400">{selectedGrievance.status}</strong></div>
            </div>

            <div className="p-4 rounded-2xl bg-[#070d17] border border-[#1e293b] space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Complaint Site Location</div>
              <div className="text-slate-200 font-semibold truncate">{selectedGrievance.address || 'Registered Location'}</div>
              <div className="text-slate-400 font-mono">
                {selectedGrievance.latitude ? `${selectedGrievance.latitude.toFixed(4)}° N, ${selectedGrievance.longitude?.toFixed(4)}° E` : 'GPS captured'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-[#0e1726] border border-[#1e293b] text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Grievances Found in Queue</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            New Civic grievances submitted through the platform will appear here automatically.
          </p>
        </div>
      )}

      {/* GIS SPATIAL MAP CONTAINER */}
      <GrievanceMap grievances={filteredGrievances} />

      {/* SMART PRIORITY DISPATCH QUEUE TABLE */}
      <div className="bg-[#0e1726]/95 border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
          <h3 className="font-extrabold text-base text-white font-outfit uppercase tracking-wider">
            Smart Priority Dispatch Queue ({filteredGrievances.length})
          </h3>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference # or category..."
              className="px-3.5 py-2 rounded-xl bg-[#070d17] border border-[#1e293b] text-xs text-white placeholder-slate-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070d17] text-slate-400 uppercase text-[10px] font-extrabold border-b border-[#1e293b]">
              <tr>
                <th className="p-3">Reference #</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Category</th>
                <th className="p-3">Department</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500">Loading live grievance queue from database...</td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-rose-500 font-bold">{fetchError}</td>
                </tr>
              ) : filteredGrievances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500 italic">
                    No grievances found matching active filter criteria. New Civic grievances submitted through the platform will appear here automatically.
                  </td>
                </tr>
              ) : (
                filteredGrievances.map(g => (
                  <tr key={g._id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-400">#{g.referenceNumber}</td>
                    <td className="p-3 font-semibold text-white line-clamp-1 max-w-xs">{g.subject}</td>
                    <td className="p-3">{g.category}</td>
                    <td className="p-3 text-slate-400">{g.department || 'Nodal Office'}</td>
                    <td className="p-3 font-bold text-amber-400">{g.priority}</td>
                    <td className="p-3 font-bold text-emerald-400">{g.status}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleSelectGrievance(g)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-bold text-[11px]"
                        >
                          Inspect
                        </button>

                        <button
                          onClick={() => handleOpenUpdateModal(g)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-[11px] shadow-sm"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICER UPDATE STATUS MODAL */}
      {isUpdateModalOpen && selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0e1726] border border-[#1e293b] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-xs">
            
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400">#{selectedGrievance.referenceNumber}</span>
                <h2 className="text-lg font-bold font-outfit text-white">Update Grievance Status & Field Remarks</h2>
              </div>
              <button onClick={() => setIsUpdateModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {updateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{updateSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Status *</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#070d17] border border-[#1e293b] text-white font-bold"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="ACTION_TAKEN">ACTION_TAKEN</option>
                  <option value="NEED_CLARIFICATION">NEED_CLARIFICATION</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="ESCALATED">ESCALATED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Field Inspection / Officer Remark *</label>
                <textarea
                  rows={3}
                  required
                  value={updateRemark}
                  onChange={(e) => setUpdateRemark(e.target.value)}
                  placeholder="Provide status update notes or resolution proof details..."
                  className="w-full p-3 rounded-xl bg-[#070d17] border border-[#1e293b] text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold shadow-md hover:bg-emerald-400">
                  {updating ? 'Saving to Database...' : 'Confirm Update Status'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
