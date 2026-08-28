import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      const userRole = res.user?.role;
      let target = redirectTarget;
      if (userRole === 'Officer') {
        target = '/officer/dashboard';
      } else if (userRole === 'Admin') {
        target = '/admin/dashboard';
      }
      navigate(target, { replace: true });
    } else {
      setError(res.error || 'Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#070d17] text-slate-100 transition-colors">
      <div className="max-w-md w-full bg-[#0e1726]/90 border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-emerald-500/40 p-2 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <img src="/logo.svg" alt="SUVIDHA Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold font-outfit text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your welfare recommendations and civic grievance portal.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@suvidha.gov.in"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">Password *</label>
              <Link to="/forgot-password" className="text-xs text-emerald-400 font-semibold hover:underline">
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
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 font-extrabold text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In →'}</span>
          </button>
        </form>



        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-400 hover:underline">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
