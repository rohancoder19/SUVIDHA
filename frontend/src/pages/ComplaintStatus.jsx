import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, CheckCircle2, Clock, AlertCircle, FileText, ArrowRight, UserCheck, ShieldCheck, ChevronRight, MessageSquare } from 'lucide-react';

export default function ComplaintStatus() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [searchId, setSearchId] = useState(searchParams.get('id') || '');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch logged-in user's complaints
  useEffect(() => {
    if (user) {
      axios.get('/api/complaints/my')
        .then((res) => {
          if (res.data && res.data.complaints) {
            setMyComplaints(res.data.complaints);
            if (!searchId && res.data.complaints.length > 0) {
              setTrackedComplaint(res.data.complaints[0]);
            }
          }
        })
        .catch((err) => console.error('My complaints fetch error:', err));
    }
  }, [user]);

  // Track complaint by ID
  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/complaints/track/${searchId.trim()}`);
      if (res.data && res.data.complaint) {
        setTrackedComplaint(res.data.complaint);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'No grievance record found with this ID.');
      setTrackedComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('id')) {
      handleTrack();
    }
  }, []);

  const getTimelineSteps = (currentStatus) => {
    const steps = [
      { key: 'Pending', label: 'Grievance Submitted' },
      { key: 'In Progress', label: 'Under Officer Review' },
      { key: 'Resolved', label: 'Resolved / Redressed' }
    ];

    if (currentStatus === 'Rejected') {
      return [
        { key: 'Pending', label: 'Grievance Submitted', completed: true },
        { key: 'In Progress', label: 'Under Officer Review', completed: true },
        { key: 'Rejected', label: 'Rejected / Closed', failed: true }
      ];
    }

    const order = ['Pending', 'In Progress', 'Resolved'];
    const currentIndex = order.indexOf(currentStatus);

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIndex,
      active: idx === currentIndex
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header & Search */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold mb-2">
            <Clock className="w-4 h-4" />
            <span>Transparent Public Audit Trail</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 font-outfit">Track Grievance Redressal Status</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Enter your unique Complaint ID (e.g. COMP-94821) to trace real-time resolution stages and official logs.
          </p>
        </div>

        <form onSubmit={handleTrack} className="max-w-md mx-auto flex items-center gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Complaint ID (COMP-XXXXX)..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="glow-btn-primary px-6 py-3 rounded-2xl text-xs font-bold text-slate-950 shrink-0"
          >
            {loading ? 'Searching...' : 'Track Status'}
          </button>
        </form>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Tracked Complaint Detail & Timeline (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {trackedComplaint ? (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8 animate-fadeIn">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">Tracking Record</span>
                  <h2 className="text-2xl font-black text-slate-100 font-outfit mt-0.5">
                    {trackedComplaint.complaintId}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">{trackedComplaint.title}</p>
                </div>

                <div className="text-left sm:text-right">
                  <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
                    trackedComplaint.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    trackedComplaint.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    trackedComplaint.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                    'bg-slate-700/50 text-slate-300 border-slate-600'
                  }`}>
                    {trackedComplaint.status}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Priority: {trackedComplaint.priority || 'Medium'}</p>
                </div>
              </div>

              {/* Step-by-Step Progress Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Resolution Progress Timeline</h4>
                <div className="grid grid-cols-3 gap-2">
                  {getTimelineSteps(trackedComplaint.status).map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                        step.failed
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : step.completed
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                        step.failed ? 'bg-rose-500 text-white' : step.completed ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="text-xs font-bold">{step.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details & Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Associated Scheme</span>
                  <span>{trackedComplaint.schemeName || 'General Civic Grievance'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Category</span>
                  <span>{trackedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">State / Pincode</span>
                  <span>{trackedComplaint.state || 'All India'} {trackedComplaint.pincode ? `(${trackedComplaint.pincode})` : ''}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Date Filed</span>
                  <span>{new Date(trackedComplaint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Grievance Description</h4>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
                  {trackedComplaint.description}
                </p>
              </div>

              {/* Audit Log Trail */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <span>Official Officer Remarks & Audit Log</span>
                </h4>

                <div className="space-y-3">
                  {trackedComplaint.logs && trackedComplaint.logs.length > 0 ? (
                    trackedComplaint.logs.map((log, lIdx) => (
                      <div key={lIdx} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-teal-400 uppercase">{log.status}</span>
                          <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">{log.remark}</p>
                        <div className="text-[10px] text-slate-500 pt-1">
                          Logged by: {log.updatedBy?.name || 'Authorized Officer'} ({log.updatedBy?.role || 'Nodal Officer'})
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No remark updates logged yet.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
              <FileText className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-300 font-outfit">No Grievance Selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Search using a Complaint ID above or select one of your filed complaints from the sidebar.
              </p>
            </div>
          )}
        </div>

        {/* My Filed Complaints Sidebar (4 Cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 h-fit">
          <h3 className="font-bold text-slate-100 text-sm flex items-center justify-between pb-3 border-b border-slate-800">
            <span>My Filed Complaints</span>
            <span className="bg-slate-800 text-teal-400 text-xs px-2 py-0.5 rounded-full font-bold">
              {myComplaints.length}
            </span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {myComplaints.length > 0 ? (
              myComplaints.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setTrackedComplaint(c)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                    trackedComplaint?.complaintId === c.complaintId
                      ? 'bg-teal-500/15 border-teal-500 text-slate-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-teal-400">{c.complaintId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                      c.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">{c.title}</div>
                  <div className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</div>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                You haven't filed any complaints yet.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
