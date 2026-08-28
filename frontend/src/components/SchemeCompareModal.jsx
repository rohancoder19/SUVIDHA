import React from 'react';
import { X, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SchemeCompareModal({ isOpen, onClose, schemes = [] }) {
  const { t } = useLanguage();
  if (!isOpen || schemes.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              ⚖️ Scheme Comparison Matrix ({schemes.length} selected)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Compare benefits, eligibility criteria, and document requirements side-by-side.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table Body */}
        <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Feature</th>
                {schemes.map(s => (
                  <th key={s.slug || s._id} className="p-3 text-sm font-bold text-slate-900 dark:text-white w-1/3">
                    <div className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase mb-1">
                      {s.level || 'Central'} • {s.state || 'All India'}
                    </div>
                    {s.title || s.scheme_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              <tr>
                <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">Match Score</td>
                {schemes.map(s => (
                  <td key={s.slug || s._id} className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {s.match_percentage || 85}% Match
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">Primary Benefit</td>
                {schemes.map(s => (
                  <td key={s.slug || s._id} className="p-3 text-slate-700 dark:text-slate-300">
                    {s.benefits || 'Financial & welfare support'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">Age Range</td>
                {schemes.map(s => (
                  <td key={s.slug || s._id} className="p-3 text-slate-700 dark:text-slate-300">
                    {s.minAge || s.min_age || 0} to {s.maxAge || s.max_age || 100} Years
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">Income Limit</td>
                {schemes.map(s => (
                  <td key={s.slug || s._id} className="p-3 text-slate-700 dark:text-slate-300">
                    {s.maxIncome ? `Up to ₹${s.maxIncome.toLocaleString('en-IN')}/yr` : 'No strict ceiling'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">Gender Eligibility</td>
                {schemes.map(s => (
                  <td key={s.slug || s._id} className="p-3 text-slate-700 dark:text-slate-300">
                    {s.gender || 'All Genders'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">Target Category</td>
                {schemes.map(s => (
                  <td key={s.slug || s._id} className="p-3 text-slate-700 dark:text-slate-300">
                    {s.allowedCategories ? (Array.isArray(s.allowedCategories) ? s.allowedCategories.join(', ') : s.allowedCategories) : 'All Categories'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">Required Proofs</td>
                {schemes.map(s => (
                  <td key={s.slug || s._id} className="p-3 text-xs text-slate-600 dark:text-slate-400">
                    {s.requiredDocuments && s.requiredDocuments.length > 0
                      ? s.requiredDocuments.join(', ')
                      : 'Aadhaar, Income Proof, Residence Proof'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">Official Portal</td>
                {schemes.map(s => (
                  <td key={s.slug || s._id} className="p-3">
                    <a
                      href={s.officialSource || s.application_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Visit Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
