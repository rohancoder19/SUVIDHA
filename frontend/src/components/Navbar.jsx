import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationDrawer from './NotificationDrawer';
import { Search, LayoutDashboard, CheckCircle, FileText, Globe, Sun, Moon, Sparkles, LogOut, X, Menu, AlertTriangle, User as UserIcon } from 'lucide-react';

export default function Navbar({ onOpenChat }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070d17]/95 border-b border-slate-800/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-emerald-500/40 p-1.5 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-200">
            <img
              src="/logo.svg"
              alt="SUVIDHA Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-wider text-emerald-400 font-outfit">
                SUVIDHA
              </span>
            </div>
            <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">AI WELFARE & GRIEVANCE PLATFORM</p>
          </div>
        </Link>

        {/* Desktop Navigation Links Pill Container */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#0e1726]/90 border border-[#1e293b] p-1.5 rounded-2xl shadow-xl">
          <Link
            to="/"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/') ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </Link>

          <Link
            to="/schemes"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              isActive('/schemes') || isActive('/finder') ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Scheme Recommender</span>
          </Link>

          <Link
            to="/grievances/create"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              isActive('/grievances/create') ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>File Grievance</span>
          </Link>

          <Link
            to="/grievances/track"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              isActive('/grievances/track') ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Track Status</span>
          </Link>

          {(user?.role === 'Officer' || user?.role === 'Admin') && (
            <Link
              to="/officer/dashboard"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive('/officer/dashboard') || isActive('/officer') ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <span>Officer Portal</span>
            </Link>
          )}

          {user?.role === 'Admin' && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive('/admin') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* Right Side User Pill & Controls */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              
              {/* Notifications */}
              <NotificationDrawer />

              {/* User Identity Box */}
              <Link to="/dashboard" className="flex items-center space-x-2.5 bg-[#0e1726]/90 border border-[#1e293b] px-3.5 py-1.5 rounded-2xl hover:border-emerald-500/50 transition-all">
                <div className="w-7 h-7 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-extrabold text-xs flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] font-semibold text-cyan-400 leading-tight">{user.role || 'Citizen'}</div>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-[#0e1726] border border-[#1e293b] text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>

            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0e1726] border border-[#1e293b] text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 hover:scale-105 transition-all shadow-md shadow-emerald-500/20"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#0e1726] border border-[#1e293b] text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070d17] border-b border-slate-800 p-4 space-y-2 text-xs font-bold">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl bg-slate-900 text-white">Home</Link>
          <Link to="/schemes" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl bg-slate-900 text-emerald-400">✨ Scheme Recommender</Link>
          <Link to="/grievances/create" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl bg-slate-900 text-rose-400">⚠️ File Grievance</Link>
          <Link to="/grievances/track" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl bg-slate-900 text-cyan-400">📑 Track Status</Link>
          <Link to="/grievances" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl bg-slate-900 text-slate-300">My Grievances</Link>
          {user?.role === 'Officer' || user?.role === 'Admin' ? (
            <Link to="/officer/dashboard" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl bg-amber-500 text-slate-950 font-bold">Officer Portal</Link>
          ) : null}
        </div>
      )}
    </header>
  );
}
