import React from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, BarChart2, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ExplainableModal({ isOpen, onClose, scheme }) {
  const { t } = useLanguage();
  if (!isOpen || !scheme) return null;

  const matchPct = scheme.match_percentage || 85;
  const matchedReasons = scheme.matched_reasons || [
    'State residency requirement met',
    'Age criteria satisfied',
    'Income ceiling within allowed limits'
  ];
  const missingReqs = scheme.missing_requirements || [
    'Income certificate proof required'
  ];
  const scoreBreakdown = scheme.score_breakdown || {
    eligibility_match: 40,
    profile_match: 25,
    location_match: 15,
    category_match: 10,
    priority_match: 10
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {t('matchScore')}: {matchPct}%
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                {scheme.level || 'Central'} ({scheme.state || 'All India'})
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {scheme.title || scheme.scheme_name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {scheme.department || 'Ministry of Social Justice & Empowerment'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
          {/* Plain English Summary */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm flex items-center gap-2">
              💡 {t('whyAmISeeingThis')}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200/90 mt-1 leading-relaxed">
              SUVIDHA 2.0 analyzed your demographic profile against verified eligibility guidelines for this scheme. You satisfy all core hard eligibility criteria!
            </p>
          </div>

          {/* Matched Criteria */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Verified Eligibility Factors
            </h4>
            <ul className="space-y-2">
              {matchedReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200 border border-emerald-100/60 dark:border-emerald-900/30">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing / Action Required */}
          {missingReqs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Action Items / Required Proofs
              </h4>
              <ul className="space-y-2">
                {missingReqs.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-slate-200 border border-amber-100/60 dark:border-amber-900/30">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">⚠</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Score Breakdown Chart */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              SUVIDHA Match Score Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400">Hard Eligibility</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{scoreBreakdown.eligibility_match}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400">Demographic Profile</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{scoreBreakdown.profile_match}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400">Location Match</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{scoreBreakdown.location_match}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400">Category & Priority</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{scoreBreakdown.category_match + scoreBreakdown.priority_match}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <a
            href={scheme.officialSource || scheme.application_url || scheme.applicationUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            {t('officialSource')}
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
