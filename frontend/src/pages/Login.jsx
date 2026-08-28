import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(redirect);
    } else {
      setError(res.error || 'Login failed.');
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');
    const res = await login(demoEmail, demoPass);
    setLoading(false);
    if (res.success) navigate(redirect);
    else setError(res.error);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 mx-auto">
            <Shield className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-outfit">Citizen & Officer Sign In</h1>
          <p className="text-xs text-slate-400">Access personalized welfare recommendations and grievance status.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@suvidha.gov.in"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn-primary w-full py-3 rounded-xl text-xs font-bold text-slate-950 flex items-center justify-center space-x-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">Quick Demo Credentials</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('citizen@suvidha.gov.in', 'Citizen@123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-semibold text-teal-300 text-center"
            >
              Citizen
            </button>
            <button
              onClick={() => handleQuickLogin('officer@suvidha.gov.in', 'Officer@123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-semibold text-indigo-300 text-center"
            >
              Officer
            </button>
            <button
              onClick={() => handleQuickLogin('admin@suvidha.gov.in', 'Admin@123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-semibold text-red-300 text-center"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-400 hover:underline font-semibold">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}
