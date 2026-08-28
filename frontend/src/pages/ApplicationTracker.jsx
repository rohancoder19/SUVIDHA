import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, FileText, AlertTriangle, ArrowRight, Trash2, Edit3, Save } from 'lucide-react';

export default function ApplicationTracker() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  const stages = ['Saved', 'Preparing Documents', 'Ready to Apply', 'Applied', 'Under Review', 'Approved', 'Rejected'];

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await axios.get('/api/applications');
        if (res.data.data && res.data.data.applications) {
          setApplications(res.data.data.applications);
        }
      } else {
        const localSaved = JSON.parse(localStorage.getItem('suvidha_guest_saved') || '[]');
        const localApps = JSON.parse(localStorage.getItem('suvidha_guest_apps') || '[]');
        
        // Merge guest saved schemes into local tracker apps if not present
        const mergedApps = localSaved.map(scheme => {
          const existing = localApps.find(a => (a.scheme?._id || a.scheme?.id || a.scheme?.slug) === (scheme._id || scheme.id || scheme.slug));
          if (existing) return existing;
          return {
            scheme,
            status: 'Saved',
            notes: '',
            updatedAt: new Date().toISOString()
          };
        });

        setApplications(mergedApps);
        localStorage.setItem('suvidha_guest_apps', JSON.stringify(mergedApps));
      }
    } catch (err) {
      console.error('Error loading tracked applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (schemeId, newStatus) => {
    if (user) {
      try {
        const res = await axios.post('/api/applications/update', { schemeId, status: newStatus });
        if (res.data.data) {
          setApplications(res.data.data.applications);
        }
      } catch (err) {
        console.error('Error updating status:', err);
      }
    } else {
      const updatedApps = applications.map(app => {
        const id = app.scheme?._id || app.scheme?.id || app.scheme?.slug;
        if (id === schemeId) {
          return { ...app, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return app;
      });
      setApplications(updatedApps);
      localStorage.setItem('suvidha_guest_apps', JSON.stringify(updatedApps));
    }
  };

  const handleSaveNotes = async (schemeId) => {
    if (user) {
      try {
        await axios.post('/api/applications/update', { schemeId, notes: editNotes });
        setEditingId(null);
        fetchApplications();
      } catch (err) {
        console.error('Error saving notes:', err);
      }
    } else {
      const updatedApps = applications.map(app => {
        const id = app.scheme?._id || app.scheme?.id || app.scheme?.slug;
        if (id === schemeId) {
          return { ...app, notes: editNotes, updatedAt: new Date().toISOString() };
        }
        return app;
      });
      setApplications(updatedApps);
      localStorage.setItem('suvidha_guest_apps', JSON.stringify(updatedApps));
      setEditingId(null);
    }
  };

  const handleDeleteTracker = async (schemeId) => {
    if (!window.confirm('Remove this scheme from your application tracker?')) return;
    if (user) {
      try {
        await axios.delete(`/api/applications/${schemeId}`);
        fetchApplications();
      } catch (err) {
        console.error('Error deleting tracker item:', err);
      }
    } else {
      const updatedApps = applications.filter(app => (app.scheme?._id || app.scheme?.id || app.scheme?.slug) !== schemeId);
      setApplications(updatedApps);
      localStorage.setItem('suvidha_guest_apps', JSON.stringify(updatedApps));
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-indigo-600" />
          Application Pipeline Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Follow your active scheme applications through every stage from preparation to official government approval.
        </p>
      </div>

      {/* Tracker List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <Clock className="w-8 h-8 mx-auto text-slate-400" />
          <h3 className="font-bold text-base">No Tracked Applications Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Explore government schemes and save them to track document preparation and submission status.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map(appItem => {
            const scheme = appItem.scheme || {};
            const schemeId = scheme._id || scheme.id;
            const currentStageIndex = stages.indexOf(appItem.status);

            return (
              <div key={appItem._id || schemeId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Scheme info header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {scheme.level || 'Central'} • {scheme.state || 'All India'}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {scheme.title || 'Government Scheme'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={appItem.status}
                      onChange={(e) => handleStatusChange(schemeId, e.target.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    >
                      {stages.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDeleteTracker(schemeId)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Remove from tracker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Multi-step Visual Pipeline Progress */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {stages.map((st, idx) => {
                    const isPassed = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div
                        key={st}
                        className={`p-2.5 rounded-xl text-center border text-xs font-semibold transition-all ${
                          isCurrent ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' :
                          isPassed ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                          'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-80 mb-0.5">Step {idx + 1}</div>
                        <div className="truncate">{st}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Notes & Timestamp Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-4">
                  <div className="flex-1">
                    {editingId === schemeId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add notes (e.g. Application No: APP12345)"
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-full max-w-md focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveNotes(schemeId)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Notes:</span>
                        <span>{appItem.notes || 'No notes added yet.'}</span>
                        <button
                          onClick={() => { setEditingId(schemeId); setEditNotes(appItem.notes || ''); }}
                          className="p-1 text-slate-400 hover:text-indigo-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    Last updated: {new Date(appItem.updatedAt || Date.now()).toLocaleDateString('en-IN')}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
