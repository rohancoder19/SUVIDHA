import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, X, Bot, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AIGrievanceAssistantModal({ isOpen, onClose, onApplyClassification }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClassify = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/grievances/classify', { description });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'AI classification service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApplyClassification({
        category: result.category,
        department: result.department,
        priority: result.suggestedPriority,
        description
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-outfit">AI Grievance Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Describe your issue in plain words to auto-classify category & department.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleClassify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Describe your issue or grievance *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., My PM-KISAN installment payment has not arrived in my bank account for the past 6 months even though my status is active..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-indigo-200" />
            <span>{loading ? 'Analyzing with AI...' : 'Analyze & Classify Issue'}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Classification Result Card */}
        {result && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>AI Classification Suggested:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Category</span>
                <span className="font-bold text-slate-800 dark:text-white">{result.category}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Suggested Priority</span>
                <span className={`font-bold ${result.suggestedPriority === 'URGENT' || result.suggestedPriority === 'HIGH' ? 'text-amber-600' : 'text-emerald-600'}`}>{result.suggestedPriority}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 text-xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Target Department</span>
              <span className="font-bold text-slate-800 dark:text-white">{result.department}</span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
              "{result.aiExplanation}"
            </p>

            <button
              onClick={handleApply}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20"
            >
              <span>Apply AI Classification to Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
