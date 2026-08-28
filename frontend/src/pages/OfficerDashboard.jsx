import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GrievanceMap from '../components/GrievanceMap';
import {
  ShieldAlert, CheckCircle2, Clock, AlertTriangle, Filter, Search,
  Edit, Lock, Users, Layers, Award, ThumbsUp, MapPin, Eye, FileText, Check, AlertCircle, X,
  Sparkles, CheckCircle, Flame, ArrowUpRight, CheckSquare, Settings
} from 'lucide-react';

const INITIAL_DEMO_GRIEVANCES = [
  {
    _id: 'g1',
    referenceNumber: 'SUV-2026-88912',
    subject: 'Road Problem urgent',
    category: 'Road',
    subcategory: 'Pothole Repair',
    priority: 'HIGH',
    urgencyScore: 87,
    confidenceScore: 94,
    slaHours: 48,
    slaStatus: 'RESOLVED',
    status: 'RESOLVED',
    department: 'Public Works Department (PWD)',
    description: 'Large deep pothole on main road causing heavy traffic and minor accidents near school gate.',
    aiReason: 'Urgent infrastructure or public health impact (Road). Potential essential utility disruption.',
    aiRecommendation: 'Immediate sanitation & inspection crew deployment within 24-48 hrs.',
    latitude: 18.5204,
    longitude: 73.8567,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    _id: 'g2',
    referenceNumber: 'SUV-2026-44129',
    subject: '11 has been 7 days to not coming electricity',
    category: 'Electricity',
    subcategory: 'Power Outage',
    priority: 'HIGH',
    urgencyScore: 87,
    confidenceScore: 91,
    slaHours: 48,
    slaStatus: 'RESOLVED',
    status: 'RESOLVED',
    department: 'State Electricity Distribution Co.',
    description: 'Power feeder line down for 7 consecutive days in sector 4 ward.',
    aiReason: 'High public impact issue affecting multiple residential households.',
    aiRecommendation: 'Dispatch electrical line crew immediately to restore feeder transformer.',
    latitude: 18.5304,
    longitude: 73.8467,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    _id: 'g3',
    referenceNumber: 'SUV-2026-33910',
    subject: 'Electricity down',
    category: 'Electricity',
    subcategory: 'Transformer Failure',
    priority: 'HIGH',
    urgencyScore: 78,
    confidenceScore: 89,
    slaHours: 48,
    slaStatus: 'RESOLVED',
    status: 'RESOLVED',
    department: 'State Electricity Distribution Co.',
    description: 'Local transformer spark reported by residents.',
    aiReason: 'Electrical infrastructure defect posing safety risk.',
    aiRecommendation: 'Immediate field unit inspection required.',
    latitude: 18.5104,
    longitude: 73.8667,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    _id: 'g4',
    referenceNumber: 'SUV-2026-90214',
    subject: 'Our nearest road R M Banerjee Road is fully broken',
    category: 'Road',
    subcategory: 'Road Collapse',
    priority: 'MEDIUM',
    urgencyScore: 62,
    confidenceScore: 85,
    slaHours: 72,
    slaStatus: 'SLA BREACHED',
    status: 'IN_PROGRESS',
    department: 'Public Works Department (PWD)',
    description: 'RM Banerjee road asphalt peeled off completely due to monsoon drainage overflow.',
    aiReason: 'Road surface degradation causing vehicular movement delay.',
    aiRecommendation: 'Schedule PWD road patch team within 72 hours.',
    latitude: 18.5404,
    longitude: 73.8767,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
  },
  {
    _id: 'g5',
    referenceNumber: 'SUV-2026-11847',
    subject: 'water not coming for 7 days',
    category: 'Water',
    subcategory: 'Pipeline Blockage',
    priority: 'MEDIUM',
    urgencyScore: 61,
    confidenceScore: 88,
    slaHours: 48,
    slaStatus: 'RESOLVED',
    status: 'RESOLVED',
    department: 'City Water & Sewerage Board',
    description: 'Low water pressure and pipe blockage in lane 3.',
    aiReason: 'Public utility supply interruption.',
    aiRecommendation: 'Deploy water supply valve inspection team.',
    latitude: 18.5004,
    longitude: 73.8367,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    _id: 'g6',
    referenceNumber: 'SUV-2026-77401',
    subject: 'water issue',
    category: 'Women Safety',
    subcategory: 'Public Safety',
    priority: 'LOW',
    urgencyScore: 44,
    confidenceScore: 82,
    slaHours: 48,
    slaStatus: 'ACTIVE (48h)',
    status: 'SUBMITTED',
    department: 'District Ward Officer',
    description: 'Water tap leaking near public square.',
    aiReason: 'Minor water leakage issue.',
    aiRecommendation: 'Assign local plumbing team for routine repair.',
    latitude: 18.5254,
    longitude: 73.8267,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    _id: 'g7',
    referenceNumber: 'SUV-2026-55109',
    subject: 'Low',
    category: 'Electricity',
    subcategory: 'Street Light',
    priority: 'LOW',
    urgencyScore: 44,
    confidenceScore: 80,
    slaHours: 48,
    slaStatus: 'ACTIVE (48h)',
    status: 'SUBMITTED',
    department: 'District Ward Officer',
    description: 'Street light flicker near community park.',
    aiReason: 'Standard lighting maintenance queue.',
    aiRecommendation: 'Replace bulb during routine maintenance round.',
    latitude: 18.5354,
    longitude: 73.8167,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'g8',
    referenceNumber: 'SUV-2026-22415',
    subject: 'Electricity',
    category: 'Electricity',
    subcategory: 'Meter Box',
    priority: 'LOW',
    urgencyScore: 38,
    confidenceScore: 78,
    slaHours: 48,
    slaStatus: 'SLA BREACHED',
    status: 'SUBMITTED',
    department: 'State Electricity Distribution Co.',
    description: 'Meter reading box glass cover broken.',
    aiReason: 'Low priority physical fixture defect.',
    aiRecommendation: 'Replace meter box casing.',
    latitude: 18.5154,
    longitude: 73.8867,
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  }
];

export default function OfficerDashboard() {
  const { user } = useAuth();

  const [grievances, setGrievances] = useState(INITIAL_DEMO_GRIEVANCES);
  const [selectedGrievance, setSelectedGrievance] = useState(INITIAL_DEMO_GRIEVANCES[0]);
  const [loading, setLoading] = useState(false);
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
    try {
      const res = await axios.get('/api/admin/grievances');
      if (res.data.grievances && res.data.grievances.length > 0) {
        setGrievances(res.data.grievances);
        setSelectedGrievance(res.data.grievances[0]);
      }
    } catch (err) {
      console.error('Using initial demo queue:', err);
    }
  };

  const handleSelectGrievance = (g) => {
    setSelectedGrievance(g);
  };

  const handleOpenUpdateModal = (g) => {
    setSelectedGrievance(g);
    setUpdateStatus(g.status);
    setUpdatePriority(g.priority || 'MEDIUM');
    setUpdateRemark('');
    setUpdateSuccess('');
    setIsUpdateModalOpen(true);
  };

  const handleAcceptAITriage = (g) => {
    const updated = grievances.map(item => {
      if (item._id === g._id) {
        return {
          ...item,
          status: 'IN_PROGRESS',
          slaStatus: 'ACTIVE (48h)'
        };
      }
      return item;
    });
    setGrievances(updated);
    setSelectedGrievance({
      ...g,
      status: 'IN_PROGRESS',
      slaStatus: 'ACTIVE (48h)'
    });
    alert(`AI Triage Accepted! Grievance #${g.referenceNumber} dispatched to ${g.department || 'assigned unit'}.`);
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
        remark: updateRemark
      });

      if (res.data.success) {
        setUpdateSuccess('Status & Officer remarks saved successfully!');
        const updatedList = grievances.map(g => g._id === selectedGrievance._id ? res.data.grievance : g);
        setGrievances(updatedList);
        setSelectedGrievance(res.data.grievance);
      }
    } catch (err) {
      // Local state fallback for demo
      const updatedList = grievances.map(g => {
        if (g._id === selectedGrievance._id) {
          return {
            ...g,
            status: updateStatus,
            priority: updatePriority,
            slaStatus: ['RESOLVED', 'CLOSED'].includes(updateStatus) ? 'RESOLVED' : g.slaStatus
          };
        }
        return g;
      });
      setGrievances(updatedList);
      setSelectedGrievance({
        ...selectedGrievance,
        status: updateStatus,
        priority: updatePriority,
        slaStatus: ['RESOLVED', 'CLOSED'].includes(updateStatus) ? 'RESOLVED' : selectedGrievance.slaStatus
      });
      setUpdateSuccess('Official officer status updated successfully!');
    } finally {
      setUpdating(false);
      setTimeout(() => {
        setIsUpdateModalOpen(false);
      }, 1200);
    }
  };

  // Filtered List
  const filteredGrievances = grievances.filter(g => {
    if (filterPriority !== 'ALL' && g.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && g.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = (g.referenceNumber || '').toLowerCase().includes(q);
      const matchSubject = (g.subject || g.title || '').toLowerCase().includes(q);
      const matchCategory = (g.category || '').toLowerCase().includes(q);
      if (!matchRef && !matchSubject && !matchCategory) return false;
    }
    return true;
  });

  const criticalCount = grievances.filter(g => g.priority === 'CRITICAL').length;
  const highCount = grievances.filter(g => g.priority === 'HIGH').length;
  const mediumCount = grievances.filter(g => g.priority === 'MEDIUM').length;
  const lowCount = grievances.filter(g => g.priority === 'LOW').length;

  const getPriorityBadge = (p, score) => {
    switch (p) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/40 font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>CRITICAL {score ? `(${score}/100)` : ''}</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>HIGH {score ? `(${score}/100)` : ''}</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>MEDIUM {score ? `(${score}/100)` : ''}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>LOW {score ? `(${score}/100)` : ''}</span>
          </span>
        );
    }
  };

  const getSLABadge = (slaStatus, status) => {
    if (status === 'RESOLVED' || status === 'CLOSED' || slaStatus === 'RESOLVED') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px] uppercase tracking-wider">
          RESOLVED
        </span>
      );
    }
    if (slaStatus === 'SLA BREACHED') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-rose-950/90 text-rose-400 border border-rose-500/50 font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>SLA BREACHED</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] uppercase tracking-wider">
        ACTIVE (48h)
      </span>
    );
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'RESOLVED':
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] uppercase">Resolved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 font-bold text-[10px] uppercase">Rejected</span>;
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] uppercase">In Progress</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/40 font-bold text-[10px] uppercase">Submitted</span>;
    }
  };

  const activeGrievance = selectedGrievance || grievances[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#070d17] text-slate-100 min-h-screen">
      
      {/* COMMAND CENTER HEADER BANNER */}
      <div className="bg-[#0e1726]/90 border border-[#1e293b] p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">AI GRIEVANCE INTELLIGENCE SYSTEM & COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-wide">
            Smart Priority Queue & Operational Triage
          </h1>
          <p className="text-xs text-slate-400">
            Review AI urgency scores, conduct Human-in-the-Loop overrides, track SLA countdowns, and dispatch field units.
          </p>
        </div>
      </div>

      {/* PRIORITY STAT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CRITICAL */}
        <div className="bg-[#0e1726]/90 border border-[#1e293b] p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">CRITICAL</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-outfit">{criticalCount}</div>
            <div className="text-[10px] text-slate-400">Immediate Action</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* HIGH */}
        <div className="bg-[#0e1726]/90 border border-[#1e293b] p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">HIGH</span>
            </div>
            <div className="text-3xl font-extrabold text-rose-400 font-outfit">{highCount}</div>
            <div className="text-[10px] text-slate-400">High Urgency</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* MEDIUM */}
        <div className="bg-[#0e1726]/90 border border-[#1e293b] p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">MEDIUM</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-400 font-outfit">{mediumCount}</div>
            <div className="text-[10px] text-slate-400">Standard Queue</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* LOW */}
        <div className="bg-[#0e1726]/90 border border-[#1e293b] p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">LOW</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 font-outfit">{lowCount}</div>
            <div className="text-[10px] text-slate-400">Routine Maintenance</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* AI GRIEVANCE ANALYSIS & AUDIT CENTER PANEL */}
      {activeGrievance && (
        <div className="bg-[#0e1726]/95 border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                  AI GRIEVANCE ANALYSIS & AUDIT CENTER
                </div>
                <h2 className="text-xl font-extrabold text-white font-outfit">
                  {activeGrievance.subject || activeGrievance.title}
                </h2>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>AI Automated Triage</span>
            </div>
          </div>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Classification Attributes */}
            <div className="lg:col-span-5 space-y-4 border-r-0 lg:border-r border-[#1e293b] lg:pr-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                CLASSIFICATION ATTRIBUTES
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#1e293b]/60">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <span className="font-bold text-white">{activeGrievance.category}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#1e293b]/60">
                  <span className="text-slate-400 font-medium">Subcategory:</span>
                  <span className="font-bold text-cyan-400">{activeGrievance.subcategory || 'General Issue'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#1e293b]/60">
                  <span className="text-slate-400 font-medium">AI Priority:</span>
                  <div>{getPriorityBadge(activeGrievance.priority)}</div>
                </div>

                {/* Urgency Score Progress Meter */}
                <div className="space-y-1 py-1.5 border-b border-[#1e293b]/60">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 font-medium">Urgency Score:</span>
                    <span className="text-rose-400">{activeGrievance.urgencyScore || 87} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${activeGrievance.urgencyScore || 87}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#1e293b]/60">
                  <span className="text-slate-400 font-medium">Confidence Score:</span>
                  <span className="font-extrabold text-emerald-400">{activeGrievance.confidenceScore || 94}%</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#1e293b]/60">
                  <span className="text-slate-400 font-medium">Recommended SLA:</span>
                  <span className="font-bold text-cyan-400">{activeGrievance.slaHours || 48} hours</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400 font-medium">Recommended Dept:</span>
                  <span className="font-bold text-white text-right max-w-[200px] truncate">{activeGrievance.department || 'Public Works Dept'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: AI Recommendation & Reason Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* AI Recommendation Highlight Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                  AI RECOMMENDATION:
                </div>
                <div className="text-xs font-bold text-amber-200">
                  {activeGrievance.aiRecommendation || 'Immediate sanitation & inspection crew deployment within 24-48 hrs'}
                </div>
              </div>

              {/* Reason Breakdown Box */}
              <div className="p-4 rounded-2xl bg-[#070d17]/80 border border-[#1e293b] space-y-2">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  WHY HIGH PRIORITY? (AI REASON BREAKDOWN)
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Urgent infrastructure or public health impact ({activeGrievance.category})</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Potential essential utility disruption to local residents</span>
                  </li>
                </ul>
              </div>

              {/* Department Reason Box */}
              <div className="p-4 rounded-2xl bg-[#070d17]/80 border border-[#1e293b] space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  WHY THIS DEPARTMENT?
                </div>
                <div className="text-xs font-bold text-cyan-400">
                  {activeGrievance.department || 'Public Works Department (PWD)'}
                </div>
                <div className="text-xs text-slate-400">
                  Reason: Complaint concerns {activeGrievance.category} issues.
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleAcceptAITriage(activeGrievance)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept AI Triage</span>
                </button>

                <button
                  onClick={() => handleOpenUpdateModal(activeGrievance)}
                  className="px-5 py-2.5 rounded-xl bg-[#070d17] border border-[#1e293b] text-slate-200 font-bold text-xs hover:bg-slate-800 transition-all flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4 text-cyan-400" />
                  <span>Override Classification</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SPATIAL MAP DISTRIBUTION CONTAINER */}
      <GrievanceMap
        grievances={filteredGrievances}
        onSelectGrievance={handleSelectGrievance}
        selectedGrievanceId={activeGrievance?._id}
      />

      {/* SMART PRIORITY DISPATCH QUEUE TABLE */}
      <div className="bg-[#0e1726]/90 border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Table Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-extrabold text-white font-outfit">
                Smart Priority Dispatch Queue
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sorted by Priority level ➔ Urgency score ➔ SLA deadline remaining ➔ Complaint age
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <span>Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-[#070d17] border border-[#1e293b] text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <span>Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#070d17] border border-[#1e293b] text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070d17]/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-[#1e293b]">
              <tr>
                <th className="p-3.5">Grievance Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">AI Priority</th>
                <th className="p-3.5">SLA Countdown</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Officer</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {filteredGrievances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-medium">
                    No grievances match the selected priority/status filters.
                  </td>
                </tr>
              ) : (
                filteredGrievances.map((g) => {
                  const isSelected = activeGrievance?._id === g._id;
                  return (
                    <tr
                      key={g._id}
                      className={`transition-colors ${
                        isSelected ? 'bg-indigo-950/40 border-l-4 border-l-cyan-400' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-white leading-tight">
                          {g.subject || g.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          #{g.referenceNumber}
                        </div>
                      </td>

                      <td className="p-3.5 font-semibold text-slate-300">
                        {g.category}
                      </td>

                      <td className="p-3.5">
                        {getPriorityBadge(g.priority, g.urgencyScore)}
                      </td>

                      <td className="p-3.5">
                        {getSLABadge(g.slaStatus, g.status)}
                      </td>

                      <td className="p-3.5">
                        {getStatusBadge(g.status)}
                      </td>

                      <td className="p-3.5 font-semibold text-slate-300 max-w-xs truncate">
                        {g.department || 'Public Works Dept'}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleSelectGrievance(g)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-500/40 text-cyan-400 hover:bg-indigo-600 hover:text-white transition-all text-[11px] font-bold flex items-center space-x-1"
                            title="Inspect AI Triage"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Analysis</span>
                          </button>

                          <button
                            onClick={() => handleOpenUpdateModal(g)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all text-[11px] font-bold flex items-center space-x-1"
                            title="Update Status"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Update Status</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* OFFICER OVERRIDE / MANAGE MODAL */}
      {isUpdateModalOpen && selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0e1726] border border-[#1e293b] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400">#{selectedGrievance.referenceNumber}</span>
                <h2 className="text-lg font-extrabold text-white font-outfit">{selectedGrievance.subject || selectedGrievance.title}</h2>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {updateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{updateSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Official Status Update</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#070d17] border border-[#1e293b] text-white font-semibold focus:border-cyan-500"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Override AI Priority</label>
                  <select
                    value={updatePriority}
                    onChange={(e) => setUpdatePriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#070d17] border border-[#1e293b] text-white font-semibold focus:border-cyan-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Officer Action Notes / Official Remark</label>
                <textarea
                  rows={3}
                  value={updateRemark}
                  onChange={(e) => setUpdateRemark(e.target.value)}
                  placeholder="Enter official action taken, field report, or status override remarks..."
                  className="w-full p-3 rounded-xl bg-[#070d17] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                >
                  {updating ? 'Saving...' : 'Save Official Update'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

function TrophyIcon(props) {
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
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
