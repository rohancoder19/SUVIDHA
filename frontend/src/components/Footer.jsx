import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Shield className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-extrabold text-xl tracking-wider text-slate-100 font-outfit">
                SUVIDHA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Civic Welfare & Scheme Recommendation Platform. Democratizing government benefits and grievance redressal across 3,400+ Central & State schemes.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Quick Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/finder" className="hover:text-teal-400 transition-colors">Welfare Scheme Finder</Link></li>
              <li><Link to="/complaint" className="hover:text-teal-400 transition-colors">File Public Grievance</Link></li>
              <li><Link to="/tracker" className="hover:text-teal-400 transition-colors">Track Complaint Status</Link></li>
              <li><Link to="/admin" className="hover:text-teal-400 transition-colors">Officer Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Government Schemes</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>PM Kisan Samman Nidhi</li>
              <li>PM Awas Yojana (Urban & Rural)</li>
              <li>Sukanya Samriddhi Yojana</li>
              <li>Ladli Behna & State Welfare</li>
              <li>PM MUDRA & Vishwakarma</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Help & Support</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-teal-400" />
                <span>Toll-Free Helpline: 1800-11-2026</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>support@suvidha.gov.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <span>National Portal of India</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 SUVIDHA Platform. All rights reserved. 100% Transparent Eligibility Engine.</p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span>Built for Civic Impact</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1" />
            <span>Powered by Gemini 2.5 Flash & ChromaDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
