import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, Filter, Search, Edit, Lock, Users, Layers, Award, ThumbsUp, Plus, X, BarChart3, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign Modal State
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [assignDepartment, setAssignDepartment] = useState('');
  const [assignOfficerId, setAssignOfficerId] = useState('');
  const [assignRemark, setAssignRemark] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Update Status Modal State
  const [statusModalGrievance, setStatusModalGrievance] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState('');

  const VALID_STATUSES = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'ACTION_TAKEN',
    'RESOLVED',
    'CLOSED',
    'NEED_CLARIFICATION',
    'ESCALATED',
    'REOPENED',
    'REJECTED'
  ];

  useEffect(() => {
    fetchAnalytics();
    fetchAdminGrievances();
    fetchOfficersList();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/admin/analytics');
      if (res.data.data) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    }
  };

  const fetchAdminGrievances = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/grievances');
      if (res.data && res.data.grievances) {
        setGrievances(res.data.grievances);
      }
    } catch (err) {
      console.error('Admin grievances fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficersList = async () => {
    try {
      const res = await axios.get('/api/admin/officers');
      if (res.data && res.data.officers) {
        setOfficers(res.data.officers);
      }
    } catch (err) {
      console.error('Officers fetch error:', err);
    }
  };

  const handleOpenStatusModal = (g) => {
    setStatusModalGrievance(g);
    setNewStatus(g.status || 'IN_PROGRESS');
    setStatusComment('');
    setStatusUpdateMessage('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalGrievance) return;

    setUpdatingStatus(true);
    setStatusUpdateMessage('');

    try {
      const res = await axios.put(`/api/grievances/${statusModalGrievance._id}/status`, {
        status: newStatus,
        comment: statusComment,
        remark: statusComment
      });

      if (res.data.success) {
        setStatusUpdateMessage(`Status updated to ${newStatus} successfully!`);
        fetchAdminGrievances();
        fetchAnalytics();
        setTimeout(() => setStatusModalGrievance(null), 1200);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to update grievance status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenAssignModal = (g) => {
    setSelectedGrievance(g);
    setAssignDepartment(g.department || '');
    setAssignOfficerId(g.assignedOfficer?._id || '');
    setAssignRemark(g.adminRemarks || '');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrievance) return;

    setAssigning(true);

    try {
      const res = await axios.put(`/api/admin/grievances/${selectedGrievance._id}/assign`, {
        department: assignDepartment,
        officerId: assignOfficerId,
        remark: assignRemark
      });

      if (res.data.success) {
        alert('Grievance assigned successfully!');
        fetchAdminGrievances();
        fetchAnalytics();
        setSelectedGrievance(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign grievance.');
    } finally {
      setAssigning(false);
    }
  };

  const handleEscalateGrievance = async (g) => {
    if (!window.confirm(`Escalate grievance #${g.referenceNumber} to CRITICAL priority?`)) return;

    try {
      const res = await axios.put(`/api/admin/grievances/${g._id}/escalate`, {
        reason: 'Admin priority escalation.'
      });

      if (res.data.success) {
        alert(`Grievance #${g.referenceNumber} escalated to CRITICAL priority.`);
        fetchAdminGrievances();
        fetchAnalytics();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to escalate grievance.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Nodal Officer & Administration Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit">
            SUVIDHA 2.0 Admin Control Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong className="text-slate-900 dark:text-white">{user?.name}</strong> ({user?.role})
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => { fetchAnalytics(); fetchAdminGrievances(); }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Database</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Real-time Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('grievances')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'grievances'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Grievance Master Redressal ({grievances.length})</span>
        </button>
      </div>

      {/* Analytics Overview Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Total Grievances</span>
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold font-outfit text-indigo-600">{analytics?.totalGrievances || grievances.length}</div>
              <div className="text-[10px] text-slate-400">Database total count</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>In Progress</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-amber-500 font-outfit">{analytics?.inProgressCount || 0}</div>
              <div className="text-[10px] text-slate-400">Active investigation</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Resolved & Closed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-500 font-outfit">{analytics?.resolvedCount || 0}</div>
              <div className="text-[10px] text-slate-400">Completed redressals</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Escalated Cases</span>
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
              </div>
              <div className="text-3xl font-extrabold text-rose-600 font-outfit">{analytics?.escalatedCount || 0}</div>
              <div className="text-[10px] text-slate-400">Critical priority escalations</div>
            </div>
          </div>

          {/* Department Workload Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Department Workload Distribution</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics?.departmentWorkload && analytics.departmentWorkload.length > 0 ? (
                analytics.departmentWorkload.map((dept, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{dept._id || 'Unassigned'}</span>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                      {dept.count} cases
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No departmental data recorded.</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Master Grievance Control Center Tab */}
      {activeTab === 'grievances' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-base">All Registered Public Grievances</h3>
            <span className="text-xs text-slate-500">Showing {grievances.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Reference #</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-400">Loading master grievance records...</td>
                  </tr>
                ) : grievances.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-400">No grievances registered yet.</td>
                  </tr>
                ) : (
                  grievances.map(g => (
                    <tr key={g._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">#{g.referenceNumber}</td>
                      <td className="p-3 font-medium line-clamp-1 max-w-xs">{g.subject}</td>
                      <td className="p-3">{g.category}</td>
                      <td className="p-3 text-slate-500">{g.department || 'Unassigned'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          g.priority === 'CRITICAL' ? 'bg-rose-500 text-white' : g.priority === 'HIGH' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800'
                        }`}>
                          {g.priority}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-indigo-600 dark:text-indigo-400">{g.status}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenStatusModal(g)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500 transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Update Status</span>
                          </button>

                          <button
                            onClick={() => handleOpenAssignModal(g)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-500 transition-colors flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>

                          <button
                            onClick={() => handleEscalateGrievance(g)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-500 transition-colors flex items-center gap-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Escalate</span>
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
      )}

      {/* UPDATE STATUS MODAL */}
      {statusModalGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">#{statusModalGrievance.referenceNumber}</span>
                <h2 className="text-lg font-bold font-outfit">Update Grievance Status & History Log</h2>
              </div>
              <button onClick={() => setStatusModalGrievance(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              {statusUpdateMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{statusUpdateMessage}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Current Status: <strong className="text-indigo-600">{statusModalGrievance.status}</strong></label>
                <label className="block font-semibold mb-1">Select New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                >
                  {VALID_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Status Update Comment / Official Remark</label>
                <textarea
                  rows={3}
                  required
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="e.g. The complaint has been forwarded to the concerned department for immediate investigation."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setStatusModalGrievance(null)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={updatingStatus} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-500">
                  {updatingStatus ? 'Updating Database...' : 'Confirm Update Status'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ADMIN ASSIGNMENT MODAL */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">#{selectedGrievance.referenceNumber}</span>
                <h2 className="text-lg font-bold font-outfit">Assign Grievance to Department / Officer</h2>
              </div>
              <button onClick={() => setSelectedGrievance(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Department</label>
                <input
                  type="text"
                  value={assignDepartment}
                  onChange={(e) => setAssignDepartment(e.target.value)}
                  placeholder="e.g. Public Works Department (PWD)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Select Specific Nodal Officer</label>
                <select
                  value={assignOfficerId}
                  onChange={(e) => setAssignOfficerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="">-- Unassigned (Department Level) --</option>
                  {officers.map(off => (
                    <option key={off._id} value={off._id}>
                      {off.name} ({off.role}) - {off.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Admin Remarks / Directions</label>
                <textarea
                  rows={3}
                  value={assignRemark}
                  onChange={(e) => setAssignRemark(e.target.value)}
                  placeholder="Enter administrative instructions for officer..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedGrievance(null)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={assigning} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-md">
                  {assigning ? 'Saving...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
