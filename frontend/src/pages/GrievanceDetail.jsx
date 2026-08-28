import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Sparkles, MapPin, ArrowLeft, Clock, CheckCircle2,
  AlertCircle, Shield, AlertTriangle, Building, Calendar, User, Eye, Copy, Check
} from 'lucide-react';

export default function GrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    fetchGrievanceDetail();
  }, [id]);

  const fetchGrievanceDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/grievances/${id}`);
      if (res.data.success) {
        setGrievance(res.data.grievance);
      }
    } catch (err) {
      console.error('Error fetching grievance details:', err);
      setError(err.response?.data?.error || 'Unable to access grievance details.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Leaflet Map for complaint coordinates
  useEffect(() => {
    if (!grievance || !mapContainerRef.current) return;

    const lat = grievance.latitude || 18.5204;
    const lng = grievance.longitude || 73.8567;

    if (window.L && !mapInstanceRef.current) {
      const L = window.L;
      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${grievance.subject}</b><br/>${grievance.address || 'Grievance Site'}`)
        .openPopup();

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [grievance]);

  const copyRefNumber = () => {
    if (grievance?.referenceNumber) {
      navigator.clipboard.writeText(grievance.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider animate-pulse">CRITICAL HAZARD</span>;
      case 'HIGH':
        return <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider">HIGH PRIORITY</span>;
      case 'LOW':
        return <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase">LOW PRIORITY</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">MEDIUM PRIORITY</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'RESOLVED':
      case 'CLOSED':
        return <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase flex items-center gap-1">✓ {s}</span>;
      case 'REJECTED':
        return <span className="px-3.5 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase">Rejected</span>;
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return <span className="px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">In Progress</span>;
      default:
        return <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase">Under Review</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-bounce mx-auto flex items-center justify-center text-white font-bold">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-xs text-slate-400 font-semibold">Loading official grievance details...</p>
      </div>
    );
  }

  if (error || !grievance) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
          <h2 className="text-xl font-bold font-outfit">Access Denied / Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => navigate('/grievances')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Grievances</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => navigate('/grievances')}
          className="text-xs text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Grievances</span>
        </button>

        <div className="flex items-center space-x-2">
          {getPriorityBadge(grievance.priority)}
          {getStatusBadge(grievance.status)}
        </div>
      </div>

      {/* Main Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                #{grievance.referenceNumber}
              </span>
              <button
                onClick={copyRefNumber}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                title="Copy Reference ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit">{grievance.subject}</h1>
          </div>

          <div className="text-left md:text-right text-xs text-slate-500 space-y-1">
            <div>Submitted On: <strong className="text-slate-900 dark:text-white">{new Date(grievance.createdAt).toLocaleString()}</strong></div>
            <div>Category: <strong className="text-indigo-600 dark:text-indigo-400">{grievance.category}</strong></div>
          </div>
        </div>

        {/* AI Triage Information Box */}
        <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Triage & Urgency Score Analysis</span>
            </span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              Urgency: {grievance.urgencyScore || 50}%
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Suggested Department: <strong>{grievance.department || grievance.aiDepartment || 'Department of Public Grievances'}</strong>
          </p>
          {grievance.aiReason && (
            <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{grievance.aiReason}"</p>
          )}
          <p className="text-[10px] text-slate-400 font-medium pt-1">
            SUVIDHA is an independent citizen-support platform. Final eligibility, approvals and grievance resolutions are determined by the concerned authorities.
          </p>
        </div>
      </div>

      {/* Grid: Left Problem & Map / Right Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Details & Location Map */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Detailed Problem Statement</span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {grievance.description}
            </p>
          </div>

          {/* Location & Interactive Map */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>Pinned Complaint Site Geolocation</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {grievance.latitude ? `${grievance.latitude.toFixed(4)}° N, ${grievance.longitude.toFixed(4)}° E` : 'No GPS captured'}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Landmark / Address: {grievance.address || 'Location registered via mobile GPS'}
            </p>

            <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-10 shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
          </div>

          {/* Photo Evidence */}
          {grievance.attachments && grievance.attachments.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-bold text-base">Uploaded Photo Evidence</h3>
              <div className="flex flex-wrap gap-4">
                {grievance.attachments.map((imgUrl, idx) => (
                  <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity">
                    <img src={imgUrl} alt="Photo proof" className="w-48 h-36 object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Vertical Timeline & Status History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Official Status Timeline Log</span>
            </h3>

            <div className="relative pl-6 space-y-6 border-l-2 border-indigo-200 dark:border-indigo-900">
              {grievance.statusHistory && grievance.statusHistory.map((step, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950 flex items-center justify-center text-white text-[9px] font-bold">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{step.status}</span>
                      <span className="text-[10px] text-slate-400">{new Date(step.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{step.remark}</p>
                    {step.updatedBy && (
                      <p className="text-[10px] text-slate-400">By: {step.updatedBy.name || 'Officer Desk'}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {grievance.officerRemarks && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">Official Officer Remark</span>
                <p className="text-xs text-amber-900 dark:text-amber-300">{grievance.officerRemarks}</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
