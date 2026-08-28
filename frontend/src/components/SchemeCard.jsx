import React from 'react';
import { Bookmark, Sparkles, ArrowRight, ExternalLink, Check, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SchemeCard({ scheme, onExplain, onToggleSave, isSaved, onToggleCompare, isComparing }) {
  const { t } = useLanguage();
  if (!scheme) return null;

  const matchPct = scheme.match_percentage || 85;
  const isCentral = (scheme.level || 'Central') === 'Central';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              {matchPct}% {t('matchScore')}
            </span>
            <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${
              isCentral
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            }`}>
              {scheme.level || 'Central'} • {scheme.state || scheme.state_name || 'All India'}
            </span>
          </div>

          {/* Save Bookmark Button */}
          <button
            onClick={() => onToggleSave && onToggleSave(scheme)}
            className={`p-2 rounded-xl border transition-all ${
              isSaved
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={isSaved ? 'Saved' : 'Save Scheme'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {scheme.title || scheme.scheme_name}
        </h3>

        {/* Department & Category */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {scheme.department || 'Government Welfare Department'}
        </p>

        {/* Benefits text */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
          <span className="font-semibold text-slate-900 dark:text-white">Benefit: </span>
          {scheme.benefits || scheme.description || 'Provides financial assistance and welfare benefits to eligible beneficiaries.'}
        </div>

        {/* Eligibility Highlights */}
        {scheme.matched_reasons && scheme.matched_reasons.length > 0 && (
          <div className="mt-3 space-y-1">
            {scheme.matched_reasons.slice(0, 2).map((reason, idx) => (
              <div key={idx} className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <span>✓</span>
                <span className="truncate">{reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Explain button */}
          <button
            onClick={() => onExplain && onExplain(scheme)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('whyAmISeeingThis')}</span>
          </button>

          {/* Compare toggle */}
          {onToggleCompare && (
            <label className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(isComparing)}
                onChange={() => onToggleCompare(scheme)}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>Compare</span>
            </label>
          )}
        </div>

        <a
          href={scheme.officialSource || scheme.application_url || scheme.applicationUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <span>{t('viewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
