import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract redirect query parameter
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      navigate(redirectTarget, { replace: true });
    } else {
      setError(res.error || 'Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Column: Branding Showcase */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
          <div className="space-y-4 z-10">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="SUVIDHA 2.0" className="w-10 h-10 object-contain" />
              <span className="font-extrabold text-2xl tracking-wider font-outfit">SUVIDHA 2.0</span>
            </div>
            <h3 className="text-xl font-bold font-outfit leading-tight pt-4">
              AI-Powered Civic Welfare & Scheme Discovery Platform
            </h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Sign in to access personalized scheme recommendations, hard eligibility filters, document checklists, and application status tracking across 3,400+ government schemes.
            </p>
          </div>

          <div className="space-y-3 z-10 pt-8 border-t border-indigo-800/60 text-xs text-indigo-200/90">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Deterministic Hard Eligibility Filters</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Explainable AI Match Breakdown</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>100% Encrypted HTTP-Only Cookie Session</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="p-8 space-y-6 flex flex-col justify-center">
          <div>
            <h2 className="text-2xl font-extrabold font-outfit">Sign In to SUVIDHA</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your account credentials to access your civic dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@suvidha.gov.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Demo Accounts:</span>
            <div>• Citizen: <code className="font-mono text-indigo-700 dark:text-indigo-300">citizen@suvidha.gov.in</code> / <code className="font-mono text-indigo-700 dark:text-indigo-300">Citizen@123</code></div>
            <div>• Admin: <code className="font-mono text-indigo-700 dark:text-indigo-300">admin@suvidha.gov.in</code> / <code className="font-mono text-indigo-700 dark:text-indigo-300">Admin@123</code></div>
          </div>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
