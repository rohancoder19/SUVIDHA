import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Search, PlusCircle, Sparkles, CheckCircle2, Clock,
  AlertCircle, Shield, Upload, Download, ArrowRight, Eye, Calendar,
  Building, MapPin, Tag, ChevronRight, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AIGrievanceAssistantModal from '../components/AIGrievanceAssistantModal';

export default function GrievancePortal() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Tab State: 'my-grievances', 'raise', 'track'
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/track')) return 'track';
    return 'my-grievances';
  });

  // Form State
  const [category, setCategory] = useState('Scheme Benefit Not Received');
  const [schemeName, setSchemeName] = useState('');
  const [department, setDepartment] = useState('Department of Revenue & Public Grievances');
  const [state, setState] = useState('Madhya Pradesh');
  const [district, setDistrict] = useState('Bhopal');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [formError, setFormError] = useState('');

  // My Grievances State
  const [myGrievances, setMyGrievances] = useState([]);
  const [loadingMy, setLoadingMy] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  // Tracking State
  const [trackRefInput, setTrackRefInput] = useState('');
  const [trackedGrievance, setTrackedGrievance] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyGrievances();
    }
    const params = new URLSearchParams(location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setActiveTab('track');
      setTrackRefInput(refParam);
      trackByRef(refParam);
    }
  }, [location.search, isAuthenticated]);

  const trackByRef = async (refNum) => {
    if (!refNum) return;
    setTrackingLoading(true);
    setTrackError('');
    setTrackedGrievance(null);

    try {
      const res = await axios.get(`/api/grievances/track/${refNum.trim().toUpperCase()}`);
      if (res.data.success) {
        setTrackedGrievance(res.data.grievance);
      }
    } catch (err) {
      setTrackError(err.response?.data?.error || 'No grievance found for this reference number.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const fetchMyGrievances = async () => {
    setLoadingMy(true);
    try {
      const res = await axios.get('/api/grievances/my-grievances');
      if (res.data.success) {
        setMyGrievances(res.data.grievances || []);
      }
    } catch (err) {
      console.error('Error loading grievances:', err);
    } finally {
      setLoadingMy(false);
    }
  };

  const handleApplyAiClassification = (aiData) => {
    if (aiData.category) setCategory(aiData.category);
    if (aiData.department) setDepartment(aiData.department);
    if (aiData.priority) setPriority(aiData.priority);
    if (aiData.description) setDescription(aiData.description);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('schemeName', schemeName);
      formData.append('department', department);
      formData.append('state', state);
      formData.append('district', district);
      formData.append('subject', subject);
      formData.append('description', description);
      if (incidentDate) formData.append('incidentDate', incidentDate);
      formData.append('applicationNumber', applicationNumber);
      formData.append('priority', priority);

      for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i]);
      }

      const res = await axios.post('/api/grievances/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSubmittedRef(res.data.referenceNumber);
        fetchMyGrievances();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit grievance.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackRefInput.trim()) return;
    setTrackingLoading(true);
    setTrackError('');
    setTrackedGrievance(null);

    try {
      const res = await axios.get(`/api/grievances/track/${trackRefInput.trim()}`);
      if (res.data.success) {
        setTrackedGrievance(res.data.grievance);
      }
    } catch (err) {
      setTrackError(err.response?.data?.error || 'No grievance found for this reference number.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase">✓ Resolved</span>;
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
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Civic Redressal & Resolution Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit">Citizen Grievance Management</h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl leading-relaxed">
            Register complaints regarding scheme benefit delays, rejected applications, or payment issues. Track resolution status in real-time with unique SUV-2026 reference numbers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          <Link
            to="/grievances/create"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File Civic Grievance</span>
          </Link>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
            <span>Launch AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('my-grievances')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'my-grievances' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Grievances ({myGrievances.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('raise'); setSubmittedRef(null); }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'raise' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise a Grievance</span>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'track' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Track Status</span>
        </button>
      </div>

      {/* TAB 1: MY GRIEVANCES */}
      {activeTab === 'my-grievances' && (
        <div className="space-y-6">
          {loadingMy ? (
            <div className="text-center py-12 text-xs text-slate-500">Loading your registered grievances...</div>
          ) : myGrievances.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold">No Grievances Registered Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                If you have experienced delayed scheme payments, incorrect rejection, or documentation issues, raise a formal grievance.
              </p>
              <button
                onClick={() => setActiveTab('raise')}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs inline-flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Raise New Grievance</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myGrievances.map((g) => (
                <div key={g._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900">
                      #{g.referenceNumber}
                    </span>
                    {getStatusBadge(g.status)}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{g.subject}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{g.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {g.category}</span>
                    <button
                      onClick={() => setSelectedGrievance(g)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Timeline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RAISE A GRIEVANCE */}
      {activeTab === 'raise' && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
          
          {submittedRef ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold font-outfit">Grievance Registered Successfully</h2>
              <p className="text-xs text-slate-500">Your unique reference number for official tracking:</p>
              
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center inline-block">
                <span className="font-mono text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {submittedRef}
                </span>
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={() => { setTrackRefInput(submittedRef); setActiveTab('track'); }}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Status Timeline</span>
                </button>
                <button
                  onClick={() => setActiveTab('my-grievances')}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs"
                >
                  Back to My Grievances
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold font-outfit">File a Civic Grievance</h2>
                  <p className="text-xs text-slate-500">All submitted grievances are routed to district nodal officers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Auto-Classify with AI</span>
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grievance Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="Scheme Benefit Not Received">Scheme Benefit Not Received</option>
                    <option value="Application Rejected">Application Rejected</option>
                    <option value="Application Delayed">Application Delayed</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Scholarship Issue">Scholarship Issue</option>
                    <option value="Pension Issue">Pension Issue</option>
                    <option value="Subsidy Issue">Subsidy Issue</option>
                    <option value="Documentation Problem">Documentation Problem</option>
                    <option value="Eligibility Dispute">Eligibility Dispute</option>
                    <option value="Government Service Issue">Government Service Issue</option>
                    <option value="Corruption/Irregularity">Corruption/Irregularity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Related Scheme Name</label>
                  <input
                    type="text"
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                    placeholder="e.g. PM Kisan Samman Nidhi"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Bhopal"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short summary of your issue..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Problem Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information regarding dates, reference IDs, and specific issues faced..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Existing Application / Reg Ref # (Optional)</label>
                  <input
                    type="text"
                    value={applicationNumber}
                    onChange={(e) => setApplicationNumber(e.target.value)}
                    placeholder="e.g. APP-849204"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supporting Document Upload (PDF, JPG, PNG)</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full p-2 text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
              >
                {submitting ? 'Registering Grievance...' : 'Submit Official Grievance'}
              </button>
            </form>
          )}

        </div>
      )}

      {/* TAB 3: TRACK STATUS */}
      {activeTab === 'track' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-xl font-extrabold font-outfit">Track Grievance Timeline</h2>
            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <input
                type="text"
                required
                value={trackRefInput}
                onChange={(e) => setTrackRefInput(e.target.value)}
                placeholder="Enter Reference # (e.g. SUV-2026-104829)"
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono uppercase"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>{trackingLoading ? 'Searching...' : 'Track'}</span>
              </button>
            </form>

            {trackError && (
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{trackError}</span>
              </div>
            )}
          </div>

          {/* Grievance Timeline Stepper Result */}
          {trackedGrievance && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">#{trackedGrievance.referenceNumber}</span>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{trackedGrievance.subject}</h3>
                </div>
                {getStatusBadge(trackedGrievance.status)}
              </div>

              {/* Status Timeline Stepper */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Official Status Timeline</h4>
                <div className="relative pl-6 space-y-6 border-l-2 border-indigo-200 dark:border-indigo-900">
                  {trackedGrievance.statusHistory.map((step, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950 flex items-center justify-center text-white text-[9px] font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{step.status}</span>
                          <span className="text-[10px] text-slate-400">{new Date(step.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{step.remark}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Assistant Modal */}
      <AIGrievanceAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyClassification={handleApplyAiClassification}
      />

    </div>
  );
}
