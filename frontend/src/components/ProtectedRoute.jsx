import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles } from 'lucide-react';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Show full-screen bootstrap loading screen while resolving authentication state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center animate-bounce shadow-xl shadow-indigo-600/30">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center space-x-2 text-sm font-bold tracking-wider text-indigo-400">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>SUVIDHA 2.0 Authenticating Session...</span>
        </div>
        <p className="text-xs text-slate-400">Verifying secure server-side credentials</p>
      </div>
    );
  }

  // 2. Unauthenticated check -> Redirect to /login with original destination saved
  if (!isAuthenticated || !user) {
    const redirectTarget = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectTarget}`} replace />;
  }

  // 3. Role-based Authorization check
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
