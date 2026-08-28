import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, FileText, CheckCircle2, User, ShieldAlert, Shield } from 'lucide-react';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isOfficerOrAdmin = user?.role === 'Officer' || user?.role === 'Admin';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 shadow-lg flex items-center justify-around text-[10px] font-semibold">
      
      {!isOfficerOrAdmin ? (
        <>
          <Link
            to="/dashboard"
            className={`flex flex-col items-center space-y-0.5 p-1 transition-colors ${
              isActive('/dashboard') ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/finder"
            className={`flex flex-col items-center space-y-0.5 p-1 transition-colors ${
              isActive('/finder') ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Schemes</span>
          </Link>

          <Link
            to="/grievances"
            className={`flex flex-col items-center space-y-0.5 p-1 transition-colors ${
              isActive('/grievances') ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Grievances</span>
          </Link>

          <Link
            to="/tracker"
            className={`flex flex-col items-center space-y-0.5 p-1 transition-colors ${
              isActive('/tracker') ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Tracker</span>
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/admin/dashboard"
            className={`flex flex-col items-center space-y-0.5 p-1 transition-colors ${
              isActive('/admin/dashboard') || isActive('/admin') || isActive('/officer/dashboard') ? 'text-amber-500 font-extrabold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Control Portal</span>
          </Link>
        </>
      )}

      <Link
        to="/profile"
        className={`flex flex-col items-center space-y-0.5 p-1 transition-colors ${
          isActive('/profile') ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>

    </nav>
  );
}
