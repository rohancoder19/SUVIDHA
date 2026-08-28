import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Search, FileText, CheckCircle, Bot, User, LogOut, Lock, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenChat }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 font-outfit">
                SUVIDHA
              </span>
              <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-widest">
                AI 2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">Civic Welfare & Scheme Portal</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
          <Link
            to="/"
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-2 ${
              isActive('/') ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Home</span>
          </Link>

          <Link
            to="/finder"
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-2 ${
              isActive('/finder') ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Welfare Finder</span>
          </Link>

          <Link
            to="/complaint"
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-2 ${
              isActive('/complaint') ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>File Grievance</span>
          </Link>

          <Link
            to="/tracker"
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-2 ${
              isActive('/tracker') ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Track Status</span>
          </Link>

          {(user?.role === 'Officer' || user?.role === 'Admin') && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-2 ${
                isActive('/admin') ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20' : 'text-indigo-300 hover:text-white hover:bg-indigo-900/40'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Officer Portal</span>
            </Link>
          )}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          
          {/* AI Assistant Button */}
          <button
            onClick={onOpenChat}
            className="px-3.5 py-2 rounded-full bg-slate-900/90 border border-teal-500/30 text-teal-300 hover:bg-teal-500/10 hover:border-teal-400 text-xs font-semibold flex items-center space-x-2 transition-all duration-200 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* User Auth Info */}
          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <Link to="/profile" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold group-hover:border-teal-500 transition-colors">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition-colors">
                    {user.name}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                    user.role === 'Admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    user.role === 'Officer' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="glow-btn-primary px-4 py-2 rounded-full text-xs font-semibold text-slate-950"
              >
                Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
