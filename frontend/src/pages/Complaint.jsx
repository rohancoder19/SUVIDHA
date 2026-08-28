import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Paperclip } from 'lucide-react';

const CATEGORIES = [
  'Benefit Not Received',
  'Delay in Processing',
  'Application Rejected Unfairly',
  'Corruption / Irregularity',
  'Incorrect Information / Documentation Error',
  'Other Issues'
];

export default function Complaint() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    schemeName: '',
    category: CATEGORIES[0],
    description: '',
    state: user?.profile?.state || 'Madhya Pradesh',
    pincode: user?.profile?.pincode || '',
    priority: 'Medium'
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdComplaint, setCreatedComplaint] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (!user) {
      navigate('/login?redirect=/complaint');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('schemeName', formData.schemeName);
      uploadData.append('category', formData.category);
      uploadData.append('description', formData.description);
      uploadData.append('state', formData.state);
      uploadData.append('pincode', formData.pincode);
      uploadData.append('priority', formData.priority);

      for (let i = 0; i < files.length; i++) {
        uploadData.append('attachments', files[i]);
      }

      const res = await axios.post('/api/complaints', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setCreatedComplaint(res.data.complaint);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to file grievance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Public Grievance Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 font-outfit">File a Scheme Grievance</h1>
        <p className="text-xs text-slate-400">
          Directly lodge complaints regarding scheme delays or benefit rejections with full officer audit trails.
        </p>
      </div>

      {/* Success Banner */}
      {createdComplaint ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-emerald-400 tracking-widest">Grievance Registered</span>
            <h2 className="text-3xl font-black text-slate-100 font-outfit mt-1">
              ID: {createdComplaint.complaintId}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-2">
              Your complaint has been assigned to the Nodal Grievance Officer. Save your Complaint ID for real-time progress updates.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate(`/tracker?id=${createdComplaint.complaintId}`)}
              className="glow-btn-primary px-6 py-3 rounded-2xl text-xs font-bold text-slate-950 flex items-center space-x-2"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCreatedComplaint(null);
                setFormData({ title: '', schemeName: '', category: CATEGORIES[0], description: '', state: 'Madhya Pradesh', pincode: '', priority: 'Medium' });
                setFiles([]);
              }}
              className="px-6 py-3 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800"
            >
              File Another Grievance
            </button>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Grievance Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. PM Kisan 16th Installment Not Credited to Bank Account"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Scheme Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Associated Welfare Scheme</label>
              <input
                type="text"
                value={formData.schemeName}
                onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
                placeholder="e.g. PM Kisan, Ladli Behna Yojana"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category of Issue *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">State / Location</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Madhya Pradesh"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="e.g. 462001"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Detailed Explanation *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide complete details including application reference numbers, dates, and local CSC/office interactions..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* File Attachments */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Upload Supporting Proofs / Documents (Optional)</label>
              <div className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-2xl p-6 text-center bg-slate-900/40 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">Click to choose image/document attachments</p>
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  className="mt-3 text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="glow-btn-primary px-8 py-3 rounded-2xl text-xs font-bold text-slate-950 flex items-center space-x-2"
            >
              {loading ? (
                <span>Submitting Grievance...</span>
              ) : (
                <>
                  <span>Submit Grievance</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
