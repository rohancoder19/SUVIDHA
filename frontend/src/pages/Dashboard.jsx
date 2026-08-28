import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Bookmark, CheckCircle2, FileText, Sparkles, ArrowRight, Shield, Award, Clock, AlertTriangle } from 'lucide-react';
import SchemeCard from '../components/SchemeCard';
import ExplainableModal from '../components/ExplainableModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [trackedApps, setTrackedApps] = useState([]);
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
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch recommendations based on user profile or guest default profile
      const userProfile = user?.profile || { state: 'All India', age: 25, income: 250000, category: 'General', occupation: 'All' };
      const recRes = await axios.post('/api/schemes/recommend', userProfile);
      if (recRes.data.schemes) {
        setRecommendedSchemes(recRes.data.schemes.slice(0, 6));
      }

      // 2. Fetch saved schemes & document status
      if (user) {
        try {
          const bmRes = await axios.get('/api/bookmarks');
          if (bmRes.data.data) {
            setSavedSchemes(bmRes.data.data.savedSchemes || []);
            setDocStatuses(bmRes.data.data.documentStatuses || {});
          }
          const appRes = await axios.get('/api/applications');
          if (appRes.data.data) {
            setTrackedApps(appRes.data.data.applications || []);
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


  // Calculate profile completeness
  const calculateCompleteness = () => {
    if (!user?.profile) return 60;
    let score = 50;
    if (user.profile.state) score += 10;
    if (user.profile.income) score += 10;
    if (user.profile.category) score += 10;
    if (user.profile.occupation) score += 10;
    if (user.profile.pincode) score += 10;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      
      {/* User Greeting & Completeness Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-outfit">Welcome back, {user?.name || 'Citizen'}!</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              State: <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.profile?.state || 'All India'}</span> • 
              Role: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.role}</span>
            </p>
          </div>
        </div>

        {/* Completeness Card */}
        <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span>Eligibility Profile Completeness</span>
            <span className="text-indigo-600 dark:text-indigo-400">{completeness}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
          </div>
          <Link to="/profile" className="block text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-right">
            Update Profile →
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
          <span>Document Checklist</span>
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
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
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
        /* Document Checklist Assistant Tab */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
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
