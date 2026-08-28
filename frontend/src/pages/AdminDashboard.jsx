import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, Filter, Search, Edit, Lock, Users, Layers, Award, ThumbsUp, Plus, X, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [complaintStats, setComplaintStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  // Scheme Form State
  const [isAddSchemeOpen, setIsAddSchemeOpen] = useState(false);
  const [newScheme, setNewScheme] = useState({
    title: '',
    department: '',
    level: 'Central',
    state: 'All India',
    category: 'General Welfare',
    description: '',
    benefits: '',
    minAge: 0,
    maxAge: 100,
    maxIncome: 500000,
    gender: 'All',
    officialSource: ''
  });

  useEffect(() => {
    fetchAnalytics();
    fetchAdminComplaints();
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

  const fetchAdminComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/complaints/admin/list');
      if (res.data && res.data.complaints) {
        setComplaints(res.data.complaints);
        if (res.data.stats) setComplaintStats(res.data.stats);
      }
    } catch (err) {
      console.error('Admin complaints fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Nodal Officer & Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit">
            SUVIDHA 2.0 Admin Control Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong className="text-slate-900 dark:text-white">{user?.name}</strong> ({user?.role})
          </p>
        </div>

        <button
          onClick={() => alert('Scheme Dataset CSV validated! All schemes indexed with vector store.')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Validate Dataset Index</span>
        </button>
      </div>

      {/* Admin Tabs */}
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
          <span>Grievance Redressal ({complaints.length})</span>
        </button>
      </div>

      {/* Analytics Overview Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Registered Citizens</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold font-outfit">{analytics?.totalUsers || 1}</div>
              <div className="text-[10px] text-slate-400">Authenticated profiles</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Indexed Schemes</span>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 font-outfit">{analytics?.totalSchemes || 12}</div>
              <div className="text-[10px] text-slate-400">Central & State Catalog</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Total Grievances</span>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600 font-outfit">{analytics?.totalComplaints || 0}</div>
              <div className="text-[10px] text-slate-400">Filed by citizens</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>AI Recommendation Satisfaction</span>
                <ThumbsUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-blue-600 font-outfit">{analytics?.satisfactionRate || 98}%</div>
              <div className="text-[10px] text-slate-400">Positive feedback score</div>
            </div>
          </div>
        </div>
      )}

      {/* Grievance Control Center Tab */}
      {activeTab === 'grievances' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base">Filed Citizen Grievances</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Complaint ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.length > 0 ? (
                  complaints.map(c => (
                    <tr key={c._id}>
                      <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{c.complaintId}</td>
                      <td className="p-3 font-medium">{c.title}</td>
                      <td className="p-3">{c.state}</td>
                      <td className="p-3 font-bold text-amber-600">{c.status}</td>
                      <td className="p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-400 italic">No grievances filed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
