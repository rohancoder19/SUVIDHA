import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User, Bookmark, CheckCircle2, FileText, Sparkles, ArrowRight, Shield, Award, Clock, AlertTriangle, PlusCircle, Search
} from 'lucide-react';
import SchemeCard from '../components/SchemeCard';
import ExplainableModal from '../components/ExplainableModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [docStatuses, setDocStatuses] = useState({});
  const [activeTab, setActiveTab] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [explainScheme, setExplainScheme] = useState(null);

  const standardDocuments = [
    'Aadhaar Card', 'Income Certificate', 'Residence / Domicile Certificate',
    'Bank Account Passbook', 'Caste Certificate (if applicable)', 'Passport Size Photo'
  ];

  useEffect(() => {
    if (user?.role === 'Officer' || user?.role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userProfile = user?.profile || { state: 'All India', age: 25, income: 250000, category: 'General', occupation: 'All' };
      const recRes = await axios.post('/api/schemes/recommend', userProfile);
      if (recRes.data.schemes) {
        setRecommendedSchemes(recRes.data.schemes.slice(0, 6));
      }

      if (user) {
        try {
          const bmRes = await axios.get('/api/bookmarks');
          if (bmRes.data.data) {
            setSavedSchemes(bmRes.data.data.savedSchemes || []);
            setDocStatuses(bmRes.data.data.documentStatuses || {});
          }
          const grRes = await axios.get('/api/grievances/my-grievances');
          if (grRes.data.success) {
            setGrievances(grRes.data.grievances || []);
          }
        } catch (err) {
          console.warn('Dashboard API call note:', err.message);
        }
      } else {
        const localSaved = JSON.parse(localStorage.getItem('suvidha_guest_saved') || '[]');
        setSavedSchemes(localSaved);
        const localDocs = JSON.parse(localStorage.getItem('suvidha_guest_docs') || '{}');
        setDocStatuses(localDocs);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocStatusChange = async (docName, status) => {
    const updatedDocs = { ...docStatuses, [docName]: status };
    setDocStatuses(updatedDocs);

    if (user) {
      try {
        await axios.post('/api/bookmarks/document-status', { docName, status });
      } catch (err) {
        console.error('Failed to update document status:', err);
      }
    } else {
      localStorage.setItem('suvidha_guest_docs', JSON.stringify(updatedDocs));
    }
  };

  const activeGrievanceCount = grievances.filter(g => ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'ACTION_REQUIRED'].includes(g.status)).length;
  const resolvedGrievanceCount = grievances.filter(g => ['RESOLVED', 'CLOSED'].includes(g.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold uppercase tracking-wider mb-1">
              <span>Verified Account</span>
              <span>•</span>
              <span className="text-emerald-400 font-extrabold">{user?.role || 'Citizen'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit">Welcome back, {user?.name || 'Citizen'}</h1>
            <p className="text-xs sm:text-sm text-slate-300">Manage your welfare services and civic grievances in one unified portal.</p>
          </div>
        </div>

        {/* Profile Action Button */}
        <Link
          to="/profile"
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shrink-0 z-10"
        >
          Update Profile →
        </Link>
      </div>

      {/* 4 Glassmorphism Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: AI Scheme Recommendations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 relative group hover:border-indigo-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Recommendations</span>
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold font-outfit">{recommendedSchemes.length}+</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Verified schemes matching your profile</p>
          <Link to="/finder" className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1">
            Explore Schemes <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Card 2: Saved Schemes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 relative group hover:border-indigo-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Schemes</span>
            <Bookmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-outfit">{savedSchemes.length}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bookmarked for quick reference</p>
          <button onClick={() => setActiveTab('saved')} className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1">
            View Bookmarks <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Card 3: Active Grievances */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 relative group hover:border-amber-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Grievances</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-500 font-outfit">{activeGrievanceCount}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Under active review or action</p>
          <Link to="/grievances" className="inline-flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline pt-1">
            Track Status <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Card 4: Resolved Grievances */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 relative group hover:border-blue-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Grievances</span>
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-outfit">{resolvedGrievanceCount}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed & closed complaints</p>
          <Link to="/grievances" className="inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1">
            View History <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

      </div>

      {/* Quick Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Citizen Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/finder"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <Search className="w-4 h-4 text-indigo-600" />
            <span>Find Welfare Scheme</span>
          </Link>

          <Link
            to="/finder"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Check Eligibility</span>
          </Link>

          <Link
            to="/grievances/create"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-rose-500" />
            <span>File Grievance</span>
          </Link>

          <Link
            to="/grievances/track"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Track Grievance</span>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'recommended'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Recommended for You ({recommendedSchemes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'saved'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Schemes ({savedSchemes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Document Readiness</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-60 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'recommended' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedSchemes.map(scheme => (
            <SchemeCard
              key={scheme.slug || scheme._id || scheme.id}
              scheme={scheme}
              onExplain={(s) => setExplainScheme(s)}
              isSaved={savedSchemes.some(s => s._id === (scheme._id || scheme.id))}
            />
          ))}
        </div>
      ) : activeTab === 'saved' ? (
        savedSchemes.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
            <Bookmark className="w-8 h-8 mx-auto text-slate-400" />
            <h3 className="font-bold text-base">No Saved Schemes Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bookmark schemes from the explorer to view them anytime here.</p>
            <Link to="/finder" className="inline-block px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl">
              Explore Schemes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSchemes.map(scheme => (
              <SchemeCard
                key={scheme._id || scheme.slug}
                scheme={scheme}
                onExplain={(s) => setExplainScheme(s)}
                isSaved={true}
              />
            ))}
          </div>
        )
      ) : (
        /* Document Readiness Assistant Tab */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Document Readiness Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mark document availability to streamline your official scheme applications.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {standardDocuments.map(doc => {
              const currentStatus = docStatuses[doc] || 'not_available';
              return (
                <div key={doc} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{doc}</div>
                    <div className="text-xs text-slate-400">Essential proof required for central/state verification</div>
                  </div>

                  <select
                    value={currentStatus}
                    onChange={(e) => handleDocStatusChange(doc, e.target.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                      currentStatus === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                      currentStatus === 'uploaded' ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <option value="not_available">Not Available ❌</option>
                    <option value="ready">Ready in Hand 🟢</option>
                    <option value="uploaded">Uploaded / Verified 🔵</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explainable AI Modal */}
      <ExplainableModal
        isOpen={Boolean(explainScheme)}
        onClose={() => setExplainScheme(null)}
        scheme={explainScheme}
      />
    </div>
  );
}
