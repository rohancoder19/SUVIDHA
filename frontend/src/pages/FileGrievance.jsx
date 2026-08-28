import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Sparkles, MapPin, Navigation, Upload, CheckCircle2,
  AlertCircle, Shield, ArrowRight, X, Image as ImageIcon, Copy, Check, Clock, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FileGrievance() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [category, setCategory] = useState('Road & Infrastructure');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(18.5204); // Default: Pune / Central
  const [longitude, setLongitude] = useState(73.8567);
  const [gpsLoading, setGpsLoading] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');

  // AI Classification State
  const [aiData, setAiData] = useState(null);
  const [aiClassifying, setAiClassifying] = useState(false);

  // Submission & Modal State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedRef, setSubmittedRef] = useState(null);
  const [copied, setCopied] = useState(false);

  // Map reference
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const categories = [
    'Road & Infrastructure',
    'Electricity',
    'Water Supply',
    'Drainage & Sewage',
    'Garbage & Sanitation',
    'Street Light',
    'Public Safety',
    'Welfare Scheme',
    'Scholarship',
    'Pension',
    'Subsidy',
    'Healthcare',
    'Government Service',
    'Application Delay',
    'Payment Issue',
    'Documentation Issue',
    'Other'
  ];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (window.L && !mapInstanceRef.current) {
      const L = window.L;
      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
      markerRef.current = marker;

      // Handle marker drag
      marker.on('dragend', function (event) {
        const position = marker.getLatLng();
        setLatitude(position.lat);
        setLongitude(position.lng);
        reverseGeocode(position.lat, position.lng);
      });

      // Handle map click
      map.on('click', function (e) {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setLatitude(lat);
        setLongitude(lng);
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map marker when latitude/longitude change externally
  const updateMapPosition = (lat, lng) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  // Reverse Geocoding via Nominatim OSM
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err.message);
    }
  };

  // GPS Auto-Detect Button
  const handleAutoDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        updateMapPosition(lat, lng);
        reverseGeocode(lat, lng);
        setGpsLoading(false);
      },
      (error) => {
        alert('Unable to retrieve your location. Please check browser permissions.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // File Selection Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');

    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setFileError('Invalid file format. Only JPEG, JPG, and PNG images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError('');
  };

  // Trigger AI Classification preview
  const handleRunAiClassification = async () => {
    if (!description && !title) return;
    setAiClassifying(true);
    try {
      const res = await axios.post('/api/grievances/classify', {
        title,
        description,
        category,
        location: address
      });

      if (res.data) {
        setAiData(res.data);
        if (res.data.category) setCategory(res.data.category);
      }
    } catch (err) {
      console.warn('AI classification notice:', err.message);
    } finally {
      setAiClassifying(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (title.length < 5 || title.length > 150) {
      setSubmitError('Issue title must be between 5 and 150 characters.');
      return;
    }

    if (description.length < 20 || description.length > 3000) {
      setSubmitError('Detailed description must be between 20 and 3000 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('subject', title);
      formData.append('description', description);
      formData.append('address', address);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('state', user?.profile?.state || 'All India');
      formData.append('district', user?.profile?.district || '');

      if (aiData) {
        formData.append('aiCategory', aiData.category || category);
        formData.append('aiPriority', aiData.priority || 'MEDIUM');
        formData.append('aiDepartment', aiData.department || '');
        formData.append('aiReason', aiData.reason || '');
        formData.append('urgencyScore', aiData.urgencyScore || 50);
        formData.append('priority', aiData.priority || 'MEDIUM');
      }

      if (selectedFile) {
        formData.append('attachments', selectedFile);
      }

      const res = await axios.post('/api/grievances/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSubmittedRef(res.data.referenceNumber);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>AI COMPLAINT TRIAGE & PRIORITY DETECTOR</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-outfit tracking-tight">
            File Civic Grievance Complaint
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Report public infrastructure hazards, welfare-service problems, civic issues, safety concerns or other government-service grievances. Our AI system analyzes the complaint, identifies priority and routes it to the appropriate authority.
          </p>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Grievance Details Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Grievance Details Form</span>
            </h2>
            <button
              type="button"
              onClick={handleRunAiClassification}
              disabled={aiClassifying || (!title && !description)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{aiClassifying ? 'Analyzing...' : 'Auto-Triage with AI'}</span>
            </button>
          </div>

          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{submitError}</span>
            </div>
          )}

          {aiData && (
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Triage Breakdown</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  aiData.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                  aiData.priority === 'HIGH' ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'
                }`}>
                  Priority: {aiData.priority} (Urgency: {aiData.urgencyScore}%)
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">{aiData.reason}</p>
              <p className="text-[10px] text-slate-400 italic">Suggested Department: <strong>{aiData.department}</strong></p>
              <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold">{aiData.disclaimer || 'AI-generated classification — subject to officer verification.'}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Complaint Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Issue Title */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Issue Title / Short Summary *
                </label>
                <span className="text-[10px] text-slate-400">{title.length} / 150</span>
              </div>
              <input
                type="text"
                required
                minLength={5}
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. High Voltage Open Transformer near school"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Detailed Description *
                </label>
                <span className="text-[10px] text-slate-400">{description.length} / 3000</span>
              </div>
              <textarea
                rows={5}
                required
                minLength={20}
                maxLength={3000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the exact issue, severity, landmark and potential hazard..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Location Address / Landmark */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Location Address / Landmark
                </label>
                <button
                  type="button"
                  onClick={handleAutoDetectGps}
                  disabled={gpsLoading}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{gpsLoading ? 'Detecting GPS...' : '📍 Auto-Detect GPS'}</span>
                </button>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Park Street, Ward 63, Pune"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* GPS Coordinates readout */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 dark:text-slate-400">GPS Latitude: <strong>{latitude ? latitude.toFixed(6) : 'N/A'}° N</strong></span>
              <span className="text-slate-600 dark:text-slate-400">GPS Longitude: <strong>{longitude ? longitude.toFixed(6) : 'N/A'}° E</strong></span>
            </div>

            {/* Attach Photo Evidence */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Attach Photo Evidence (Optional - Max 5MB)
              </label>

              {fileError && (
                <p className="text-xs text-rose-500 font-semibold mb-2">{fileError}</p>
              )}

              {filePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 max-h-48 group">
                  <img src={filePreview} alt="Evidence preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="photo-evidence-input"
                  />
                  <label htmlFor="photo-evidence-input" className="cursor-pointer space-y-2 block">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Upload Photo Proof (JPEG, PNG)
                    </div>
                    <p className="text-[10px] text-slate-400">Select clear photo showing hazard or issue site</p>
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Submitting & Classifying Grievance...' : 'Submit Grievance with AI Classification →'}</span>
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: Interactive Geolocation Map */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>Select Geolocation Coordinates on Map</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click anywhere on the map or drag the marker to pin exact location.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoDetectGps}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors shrink-0"
            >
              My Live GPS
            </button>
          </div>

          {/* Map Container */}
          <div className="flex-1 min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-10 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
          </div>

          {/* Location Summary Readout */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Selected Landmark Address:
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {address || 'Click map to resolve address via OpenStreetMap reverse geocoding...'}
            </p>
          </div>
        </div>

      </div>

      {/* SUBMISSION SUCCESS MODAL */}
      {submittedRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold font-outfit">Grievance Submitted Successfully</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your complaint has been registered and assigned an official tracking reference number.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
              <span className="font-mono text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                #{submittedRef}
              </span>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-indigo-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Summary Details */}
            <div className="text-left text-xs space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between"><span className="text-slate-400">Category:</span> <span className="font-bold">{category}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Priority:</span> <span className="font-bold text-amber-600">{aiData?.priority || 'MEDIUM'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Assigned Department:</span> <span className="font-bold">{aiData?.department || 'Department of Public Grievances'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Date:</span> <span className="font-bold">{new Date().toLocaleDateString()}</span></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate(`/grievances/track?ref=${submittedRef}`)}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <Clock className="w-4 h-4" />
                <span>Track Status Timeline</span>
              </button>
              <button
                onClick={() => navigate('/grievances')}
                className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs"
              >
                Back to My Grievances
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
