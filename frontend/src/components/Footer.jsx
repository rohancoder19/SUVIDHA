import React from 'react';
import { Shield, ExternalLink, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="SUVIDHA 2.0 Logo" className="w-10 h-10 object-contain" />
              <span className="font-extrabold text-xl text-white font-outfit">SUVIDHA 2.0</span>
            </div>

            <p className="text-xs leading-relaxed max-w-md text-slate-400">
              SUVIDHA 2.0 is an AI-powered civic platform democratizing welfare discovery and streamlining grievance redressal across 3,400+ Central & State schemes with 100% deterministic hard eligibility rules.
            </p>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <span className="text-amber-400 font-bold">ℹ</span>
              <span>SUVIDHA 2.0 is an independent civic portal providing citations to verified MyScheme and Government portals.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Core Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/finder" className="hover:text-white transition-colors">Explore All Schemes</a></li>
              <li><a href="/tracker" className="hover:text-white transition-colors">Application Tracker</a></li>
              <li><a href="/complaint" className="hover:text-white transition-colors">Grievance Redressal</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Citizen Login</a></li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Official Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
                  MyScheme.gov.in <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://dbtbharat.gov.in" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
                  DBT Bharat Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
                  CPGRAMS Grievance Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SUVIDHA 2.0. Built for Democratic Welfare Access.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Citizens
          </p>
        </div>
      </div>
    </footer>
  );
}
