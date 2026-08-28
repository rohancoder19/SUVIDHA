import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Search, PlusCircle, Sparkles, CheckCircle2, Clock,
  AlertCircle, Shield, Upload, Download, ArrowRight, Eye, Calendar,
  Building, MapPin, Tag, ChevronRight, User, RefreshCw, AlertTriangle,
  Check, Flame, Layers, Lock, Cpu, Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AIGrievanceAssistantModal from '../components/AIGrievanceAssistantModal';

export default function GrievancePortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Tab State: 'tracker', 'raise'
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/create')) return 'raise';
    return 'tracker';
  });

  // Grievance Queue & Active Selected Grievance
  const [grievances, setGrievances] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchRefQuery, setSearchRefQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  // Form State
  const [category, setCategory] = useState('Road & Infrastructure');
  const [schemeName, setSchemeName] = useState('');
  const [department, setDepartment] = useState('Public Works Department (PWD)');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [formError, setFormError] = useState('');

  // AI Assistant Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    fetchMyGrievances();
    const params = new URLSearchParams(location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setSearchRefQuery(refParam);
      trackByReferenceNumber(refParam);
    }
  }, [isAuthenticated, location.search]);

  const fetchMyGrievances = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/grievances/my-grievances');
      if (res.data.success && res.data.grievances && res.data.grievances.length > 0) {
        setGrievances(res.data.grievances);
        setSelectedGrievance(res.data.grievances[0]);
      } else {
        setGrievances([]);
        setSelectedGrievance(null);
      }
    } catch (err) {
      console.warn('My grievances endpoint notice:', err.message);
      setGrievances([]);
      setSelectedGrievance(null);
    } finally {
      setLoading(false);
    }
  };

  const trackByReferenceNumber = async (refNum) => {
    if (!refNum) return;
    setLoading(true);
    setSearchError('');

    try {
      const res = await axios.get(`/api/grievances/track/${refNum.trim().toUpperCase()}`);
      if (res.data && res.data.grievance) {
        setSelectedGrievance(res.data.grievance);
        
        // Append to list if not present
        setGrievances(prev => {
          const exists = prev.some(g => g._id === res.data.grievance._id || g.referenceNumber === res.data.grievance.referenceNumber);
          return exists ? prev.map(g => g.referenceNumber === res.data.grievance.referenceNumber ? res.data.grievance : g) : [res.data.grievance, ...prev];
        });
      }
    } catch (err) {
      setSearchError(err.response?.data?.error || `No grievance found matching reference ${refNum}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGrievance = (g) => {
    setSelectedGrievance(g);
  };

  const handleSearchRef = (e) => {
    e.preventDefault();
    if (!searchRefQuery.trim()) return;
    trackByReferenceNumber(searchRefQuery);
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
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('address', address);
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

  // Stepper Status Resolution Logic (6-step stepper)
  const getStepperActiveIndex = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 1;
      case 'UNDER_REVIEW':
      case 'AI_ANALYZED':
        return 2;
      case 'ASSIGNED':
        return 3;
      case 'IN_PROGRESS':
        return 4;
      case 'ACTION_TAKEN':
      case 'ACTION_REQUIRED':
      case 'NEED_CLARIFICATION':
        return 5;
      case 'RESOLVED':
      case 'CLOSED':
        return 6;
      default:
        return 1;
    }
  };

  const getPriorityBadge = (p, score) => {
    switch (p) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/40 font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>CRITICAL Priority {score ? `(${score}/100)` : ''}</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>HIGH Priority {score ? `(${score}/100)` : ''}</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>MEDIUM Priority {score ? `(${score}/100)` : ''}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>LOW Priority {score ? `(${score}/100)` : ''}</span>
          </span>
        );
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'RESOLVED':
      case 'CLOSED':
        return <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] uppercase">Resolved</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 font-bold text-[10px] uppercase">Rejected</span>;
      case 'IN_PROGRESS':
      case 'ASSIGNED':
      case 'ACTION_TAKEN':
        return <span className="px-3 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/40 font-bold text-[10px] uppercase">In Progress</span>;
      case 'NEED_CLARIFICATION':
        return <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 font-bold text-[10px] uppercase">Need Clarification</span>;
      case 'ESCALATED':
        return <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 font-bold text-[10px] uppercase animate-pulse">Escalated</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 font-bold text-[10px] uppercase">Submitted</span>;
    }
  };

  const activeGrievance = selectedGrievance || grievances[0];
  const currentStepIndex = activeGrievance ? getStepperActiveIndex(activeGrievance.status) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#070d17] text-slate-100 min-h-screen">
      
      {/* PAGE HEADER BANNER */}
      <div className="bg-[#0e1726]/90 border border-[#1e293b] p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">TRANSPARENT CIVIC GRIEVANCE TRACKING TIMELINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-wide">
            Live Grievance & AI Triage Tracker
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Track automated AI triage results, officer dispatch logs, department assignments, and resolution SLAs directly from MongoDB Atlas.
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10 shrink-0">
          <button
            onClick={() => fetchMyGrievances()}
            className="px-4 py-2.5 rounded-2xl bg-[#070d17] border border-[#1e293b] text-slate-300 hover:text-white font-bold text-xs flex items-center space-x-2 shadow-md"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Refresh Live Database</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR FOR TRACKING SPECIFIC REFERENCE ID */}
      <form onSubmit={handleSearchRef} className="bg-[#0e1726] border border-[#1e293b] p-3 rounded-2xl flex gap-2 shadow-xl">
        <input
          type="text"
          value={searchRefQuery}
          onChange={(e) => setSearchRefQuery(e.target.value)}
          placeholder="Enter Grievance Reference ID (e.g. SUV-2026-000003)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#070d17] border border-[#1e293b] text-xs font-mono uppercase text-white placeholder-slate-500"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
        >
          <Search className="w-4 h-4" />
          <span>Track Status</span>
        </button>
      </form>

      {searchError && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-500/40 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center space-x-2 border-b border-[#1e293b] pb-2">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'tracker' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Live Grievance Tracker ({grievances.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('raise'); setSubmittedRef(null); }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'raise' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>File New Grievance</span>
        </button>
      </div>

      {/* TAB 1: LIVE GRIEVANCE TRACKER (TWO-COLUMN DASHBOARD) */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: FILED GRIEVANCES SIDEBAR LIST (4/12 SPAN) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <span>Filed Grievances</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-extrabold text-[10px]">
                  {grievances.length}
                </span>
              </h2>
            </div>

            {/* List of Grievance Cards */}
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-12 text-xs text-slate-500">Loading grievances from database...</div>
              ) : grievances.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#0e1726] text-center text-xs text-slate-400 italic border border-[#1e293b]">
                  No grievances found. Try searching a reference ID like SUV-2026-000003 above.
                </div>
              ) : (
                grievances.map((g) => {
                  const isSelected = activeGrievance?._id === g._id || activeGrievance?.referenceNumber === g.referenceNumber;
                  return (
                    <div
                      key={g._id || g.referenceNumber}
                      onClick={() => handleSelectGrievance(g)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-[#0e1726] border-emerald-500/60 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                          : 'bg-[#0e1726]/60 border-[#1e293b] hover:border-slate-700'
                      }`}
                    >
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-extrabold text-[10px] uppercase">
                          {g.category}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          {getPriorityBadge(g.priority, g.urgencyScore)}
                          {getStatusBadge(g.status)}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-extrabold text-sm text-white leading-snug line-clamp-1">
                          {g.subject || g.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-medium">
                          {g.description}
                        </p>
                      </div>

                      {/* Location & Department Metadata */}
                      <div className="space-y-1 text-[11px] text-slate-400 border-t border-[#1e293b]/60 pt-2.5">
                        <div className="flex items-center space-x-1.5 truncate text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{g.address || 'Location registered'}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 truncate text-cyan-400 font-semibold">
                          <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{g.department || 'Nodal Department'}</span>
                        </div>
                      </div>

                      {/* Footer Row */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span className="font-mono">#{g.referenceNumber}</span>
                        <span className="text-indigo-400 font-extrabold flex items-center space-x-1">
                          <span>Track Live Timeline</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE GRIEVANCE DETAILED TRACKER (8/12 SPAN) */}
          {activeGrievance && (
            <div className="lg:col-span-8 space-y-6">
              
              {/* HEADER BANNER CARD */}
              <div className="bg-[#0e1726]/95 border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                      GRIEVANCE REF: #{activeGrievance.referenceNumber}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white font-outfit mt-1">
                      {activeGrievance.subject || activeGrievance.title}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    {getPriorityBadge(activeGrievance.priority)}
                    {getStatusBadge(activeGrievance.status)}
                  </div>
                </div>

                {/* RESOLUTION SLA GUARANTEE BAR */}
                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Resolution SLA Guarantee: {activeGrievance.slaHours || 120} Hours</span>
                  </div>
                  <span className="font-extrabold uppercase text-emerald-400 tracking-wider">
                    {activeGrievance.status === 'RESOLVED' || activeGrievance.status === 'CLOSED' ? 'RESOLVED' : (activeGrievance.slaStatus || 'ACTIVE')}
                  </span>
                </div>

                {/* CIVIC RESOLUTION LIFECYCLE STEPPER (6 HORIZONTAL STEPS) */}
                <div className="space-y-3 pt-2">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    CIVIC RESOLUTION LIFECYCLE STEPPER
                  </div>

                  <div className="grid grid-cols-6 gap-2 relative">
                    {[
                      { num: 1, label: 'Complaint Submitted' },
                      { num: 2, label: 'AI Analyzed' },
                      { num: 3, label: 'Department Assigned' },
                      { num: 4, label: 'Officer Reviewing' },
                      { num: 5, label: 'Action Taken' },
                      { num: 6, label: 'Resolved' }
                    ].map((step) => {
                      const isDone = currentStepIndex >= step.num;
                      return (
                        <div key={step.num} className="flex flex-col items-center text-center space-y-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30'
                              : 'bg-[#070d17] border border-[#1e293b] text-slate-500'
                          }`}>
                            {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                          </div>
                          <span className={`text-[10px] font-bold leading-tight ${
                            isDone ? 'text-emerald-400' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI GRIEVANCE TRIAGE EXPLANATION CARD */}
                <div className="p-5 rounded-2xl bg-[#070d17]/90 border border-[#1e293b] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI GRIEVANCE TRIAGE EXPLANATION</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold">
                      Urgency Score: {activeGrievance.urgencyScore || 50}/100
                    </span>
                  </div>

                  {/* Why Priority */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Why {activeGrievance.priority || 'MEDIUM'} Priority?
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      {activeGrievance.aiReason || 'Public infrastructure inquiry or utility maintenance complaint.'}
                    </p>
                  </div>

                  {/* Why Department */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Assigned Nodal Department
                    </div>
                    <div className="text-xs font-bold text-cyan-400">
                      {activeGrievance.department || 'Public Works Department (PWD)'}
                    </div>
                  </div>
                </div>

                {/* ASSIGNED OFFICER & LOCATION CARDS (2 GRID BOX) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#070d17]/80 border border-[#1e293b] space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      ASSIGNED MUNICIPAL OFFICER / FIELD UNIT
                    </span>
                    <div className="font-bold text-emerald-400 flex items-center space-x-2 pt-1">
                      <Building className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{activeGrievance.department || 'Municipal Nodal Unit'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#070d17]/80 border border-[#1e293b] space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      LOCATION LANDMARK
                    </span>
                    <div className="font-bold text-slate-200 flex items-center space-x-2 pt-1">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate">{activeGrievance.address || 'Location registered via GPS'}</span>
                    </div>
                  </div>
                </div>

                {/* PERMANENT AUDITABLE ACTION LOGS (IMMUTABLE AUDIT TRAIL FROM MONGO DB) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>PERMANENT AUDITABLE ACTION LOGS</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">
                      IMMUTABLE AUDIT TRAIL
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-4 border-l-2 border-indigo-500/30">
                    {activeGrievance.statusHistory && activeGrievance.statusHistory.length > 0 ? (
                      activeGrievance.statusHistory.map((log, idx) => (
                        <div key={idx} className="relative space-y-1 bg-[#070d17] p-4 rounded-2xl border border-[#1e293b]">
                          <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 flex items-center justify-center text-slate-950 font-black text-[9px]">
                            ✓
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-white flex items-center space-x-2">
                              <span>{log.status || 'LOG ENTRY'}</span>
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                {log.updatedByRole || 'Nodal Officer'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 font-medium pt-1">
                            {log.remark}
                          </p>

                          <div className="text-[10px] text-slate-500 pt-1">
                            Actor: <strong>{log.updatedByName || 'Admin/System'}</strong>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 italic">No audit log entries recorded yet.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: RAISE A GRIEVANCE FORM */}
      {activeTab === 'raise' && (
        <div className="max-w-3xl mx-auto bg-[#0e1726]/95 border border-[#1e293b] rounded-3xl p-8 shadow-2xl space-y-6">
          
          {submittedRef ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold font-outfit text-white">Grievance Registered Successfully</h2>
              <p className="text-xs text-slate-400">Your unique reference number for official tracking:</p>
              
              <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-center inline-block">
                <span className="font-mono text-2xl font-extrabold text-cyan-400 tracking-wider">
                  {submittedRef}
                </span>
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={() => { setSearchRefQuery(submittedRef); setActiveTab('tracker'); trackByReferenceNumber(submittedRef); }}
                  className="px-6 py-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-2xl font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Live Timeline</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
                <div>
                  <h2 className="text-xl font-extrabold font-outfit text-white">File a Civic Grievance</h2>
                  <p className="text-xs text-slate-400">All submitted grievances are routed directly to MongoDB Atlas & nodal officers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-950 text-cyan-300 font-bold text-xs border border-indigo-500/40 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Auto-Classify with AI</span>
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-500/40 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Grievance Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#070d17] border border-[#1e293b] text-white"
                  >
                    <option value="Road & Infrastructure">Road & Infrastructure</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Drainage & Sewage">Drainage & Sewage</option>
                    <option value="Garbage & Sanitation">Garbage & Sanitation</option>
                    <option value="Street Light">Street Light</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Welfare Scheme">Welfare Scheme</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Pension">Pension</option>
                    <option value="Subsidy">Subsidy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Public Works Department (PWD)"
                    className="w-full p-3 rounded-xl bg-[#070d17] border border-[#1e293b] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Subject / Issue Summary *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short summary of your issue..."
                  className="w-full p-3 rounded-xl bg-[#070d17] border border-[#1e293b] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Problem Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed description of problem..."
                  className="w-full p-3.5 rounded-xl bg-[#070d17] border border-[#1e293b] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Landmark / Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter location landmark..."
                  className="w-full p-3 rounded-xl bg-[#070d17] border border-[#1e293b] text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30"
              >
                {submitting ? 'Registering Grievance...' : 'Submit Official Grievance'}
              </button>
            </form>
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

function Globe(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
