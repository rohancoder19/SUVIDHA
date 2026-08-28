import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Sparkles, MapPin, ArrowLeft, Clock, CheckCircle2,
  AlertCircle, Shield, AlertTriangle, Building, Calendar, User, Eye, Copy, Check, MessageSquare, Star, Send, RotateCcw, ThumbsUp
} from 'lucide-react';

export default function GrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Clarification Reply Form State
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replySuccess, setReplySuccess] = useState('');

  // Feedback Form State
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isHelpful, setIsHelpful] = useState(true);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Reopen Form State
  const [reopenReason, setReopenReason] = useState('');
  const [reopenSubmitting, setReopenSubmitting] = useState(false);
  const [reopenSuccess, setReopenSuccess] = useState('');

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
        setHistory(res.data.history || []);
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

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setReplySubmitting(true);
    setReplySuccess('');

    try {
      const res = await axios.post(`/api/grievances/${id}/reply`, {
        message: replyMessage
      });

      if (res.data.success) {
        setReplySuccess('Clarification response submitted successfully.');
        setReplyMessage('');
        fetchGrievanceDetail();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit response.');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setFeedbackSuccess('');

    try {
      const res = await axios.post(`/api/grievances/${id}/feedback`, {
        rating,
        comment: feedbackComment,
        isHelpful
      });

      if (res.data.success) {
        setFeedbackSuccess('Rating & feedback submitted successfully. Thank you!');
        fetchGrievanceDetail();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setReopenSubmitting(true);
    setReopenSuccess('');

    try {
      const res = await axios.post(`/api/grievances/${id}/reopen`, {
        reason: reopenReason
      });

      if (res.data.success) {
        setReopenSuccess('Grievance reopened for administrative review.');
        setReopenReason('');
        fetchGrievanceDetail();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reopen grievance.');
    } finally {
      setReopenSubmitting(false);
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
      case 'ACTION_TAKEN':
        return <span className="px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">In Progress</span>;
      case 'NEED_CLARIFICATION':
      case 'ACTION_REQUIRED':
        return <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase animate-pulse">Action Required</span>;
      case 'REOPENED':
        return <span className="px-3.5 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase">Reopened</span>;
      default:
        return <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase">Submitted</span>;
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
            Assigned Department: <strong>{grievance.department || grievance.aiDepartment || 'Department of Public Grievances'}</strong>
          </p>
          {grievance.aiReason && (
            <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{grievance.aiReason}"</p>
          )}
        </div>
      </div>

      {/* Grid: Left Problem & Map / Right Timeline & Interactive Actions */}
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

          {/* Citizen Replies / Clarifications Timeline */}
          {grievance.citizenReplies && grievance.citizenReplies.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Citizen Clarification Replies</span>
              </h3>
              <div className="space-y-3">
                {grievance.citizenReplies.map((r, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-500 font-semibold">
                      <span>Clarification Reply</span>
                      <span>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">{r.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form: Submit Clarification if requested */}
          {['NEED_CLARIFICATION', 'ACTION_REQUIRED'].includes(grievance.status) && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Officer Requested Clarification</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-300">
                Please provide the additional information requested by the nodal officer below to proceed.
              </p>

              {replySuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{replySuccess}</span>
                </div>
              )}

              <form onSubmit={handleReplySubmit} className="space-y-3">
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Enter clarification response or additional details..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{replySubmitting ? 'Submitting...' : 'Submit Response to Officer'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Form: Rating & Feedback if Resolved */}
          {['RESOLVED', 'CLOSED'].includes(grievance.status) && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-base">
                <ThumbsUp className="w-5 h-5 text-emerald-600" />
                <span>Citizen Resolution Satisfaction Feedback</span>
              </div>

              {grievance.feedback && grievance.feedback.rating ? (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 space-y-2 text-xs">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= grievance.feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    ))}
                    <span className="text-slate-900 dark:text-white font-bold ml-2">({grievance.feedback.rating}/5)</span>
                  </div>
                  {grievance.feedback.comment && (
                    <p className="text-slate-700 dark:text-slate-300 italic">"{grievance.feedback.comment}"</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  {feedbackSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      {feedbackSuccess}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold">Rate Resolution:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-slate-400'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Provide feedback on the officer resolution quality..."
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-xs"
                  />

                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                  >
                    {feedbackSubmitting ? 'Submitting...' : 'Submit Resolution Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Form: Reopen / Appeal Option if Resolved or Rejected */}
          {['RESOLVED', 'REJECTED', 'CLOSED'].includes(grievance.status) && (
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
                <RotateCcw className="w-5 h-5 text-indigo-500" />
                <span>Dispute Resolution / Appeal Reopen</span>
              </div>
              <p className="text-xs text-slate-500">
                If the problem persists or resolution was incomplete, you may appeal to reopen this grievance.
              </p>

              {reopenSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  {reopenSuccess}
                </div>
              )}

              <form onSubmit={handleReopenSubmit} className="space-y-3">
                <textarea
                  rows={2}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="State reason for reopening or appealing resolution..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                />
                <button
                  type="submit"
                  disabled={reopenSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md"
                >
                  {reopenSubmitting ? 'Reopening...' : 'Appeal & Reopen Grievance'}
                </button>
              </form>
            </div>
          )}

          {/* Location & Map */}
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
              {history && history.length > 0 ? (
                history.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950 flex items-center justify-center text-white text-[9px] font-bold">
                      ✓
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{step.action || step.newStatus}</span>
                        <span className="text-[10px] text-slate-400">{new Date(step.timestamp || step.createdAt).toLocaleDateString()}</span>
                      </div>
                      {step.comment && <p className="text-xs text-slate-600 dark:text-slate-300">{step.comment}</p>}
                      <p className="text-[10px] text-slate-400">By: {step.actorName || 'System'} ({step.actorRole || 'Nodal'})</p>
                    </div>
                  </div>
                ))
              ) : (
                grievance.statusHistory && grievance.statusHistory.map((step, idx) => (
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
                    </div>
                  </div>
                ))
              )}
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
