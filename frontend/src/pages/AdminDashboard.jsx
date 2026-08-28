import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, Filter, Search, Edit, Lock, UserCheck, MessageSquare, X } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0, resolutionRate: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('In Progress');
  const [updatePriority, setUpdatePriority] = useState('Medium');
  const [updateRemark, setUpdateRemark] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAdminComplaints = async () => {
    setLoading(true);
    try {
      let url = `/api/complaints/admin/list?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await axios.get(url);
      if (res.data && res.data.complaints) {
        setComplaints(res.data.complaints);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Admin complaints fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminComplaints();
  }, [statusFilter, priorityFilter, searchQuery]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setUpdating(true);
    try {
      const res = await axios.put(`/api/admin/complaints/${editingComplaint._id}/status`, {
        status: updateStatus,
        priority: updatePriority,
        remark: updateRemark || `Status set to ${updateStatus}`
      });

      if (res.data.success) {
        setEditingComplaint(null);
        setUpdateRemark('');
        fetchAdminComplaints();
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-indigo-500/30">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Nodal Officer & Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-outfit">
            Grievance Redressal Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-indigo-300">{user?.name}</strong> ({user?.role})
          </p>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Grievances</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100 font-outfit">{stats.total}</div>
          <div className="text-[10px] text-slate-500">Across all categories</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-outfit">{stats.pending}</div>
          <div className="text-[10px] text-slate-500">Awaiting officer action</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>In Progress</span>
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-outfit">{stats.inProgress}</div>
          <div className="text-[10px] text-slate-500">Under active investigation</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-outfit">{stats.resolutionRate}%</div>
          <div className="text-[10px] text-slate-500">{stats.resolved} complaints resolved</div>
        </div>

      </div>

      {/* Filterable Complaints Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Complaint ID or Title..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Complaint ID</th>
                <th className="px-4 py-3">Citizen</th>
                <th className="px-4 py-3">Scheme & Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-4 font-bold text-indigo-300">{c.complaintId}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-200">{c.user?.name || 'Citizen'}</div>
                      <div className="text-[10px] text-slate-500">{c.state}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-200">{c.title}</div>
                      <div className="text-[10px] text-teal-400">{c.category}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.priority === 'Urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        c.priority === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {c.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        c.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        c.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingComplaint(c);
                          setUpdateStatus(c.status);
                          setUpdatePriority(c.priority || 'Medium');
                        }}
                        className="p-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/30 transition-colors"
                        title="Update Grievance Status"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 italic">
                    No complaints matching filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Update Status Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 border border-indigo-500/40 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase">Officer Update Action</span>
                <h3 className="text-lg font-bold text-slate-100 font-outfit">
                  {editingComplaint.complaintId}
                </h3>
              </div>
              <button
                onClick={() => setEditingComplaint(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Set Resolution Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Priority Tier</label>
                <select
                  value={updatePriority}
                  onChange={(e) => setUpdatePriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Officer Remark Log *</label>
                <textarea
                  required
                  rows={3}
                  value={updateRemark}
                  onChange={(e) => setUpdateRemark(e.target.value)}
                  placeholder="Enter official investigation details, action taken, or reason for rejection..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="glow-btn-indigo px-6 py-2.5 rounded-xl text-xs font-bold text-white"
                >
                  {updating ? 'Saving Log...' : 'Submit Official Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
