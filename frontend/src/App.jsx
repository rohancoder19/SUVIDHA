import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RAGChatbotModal from './components/RAGChatbotModal';
import ProtectedRoute from './components/ProtectedRoute';
import MobileBottomNav from './components/MobileBottomNav';

import Home from './pages/Home';
import WelfareFinder from './pages/WelfareFinder';
import Dashboard from './pages/Dashboard';
import ApplicationTracker from './pages/ApplicationTracker';
import GrievancePortal from './pages/GrievancePortal';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

export default function App() {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans pb-16 md:pb-0">
          <Navbar onOpenChat={() => setIsChatOpen(true)} />
          
          <main className="flex-1">
            <Routes>
              {/* Public Unauthenticated Gateway Routes ONLY */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected Application Routes (Requires Verified Session) */}
              <Route path="/" element={<ProtectedRoute><Home onOpenChat={() => setIsChatOpen(true)} /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/finder" element={<ProtectedRoute><WelfareFinder /></ProtectedRoute>} />
              <Route path="/tracker" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
              <Route path="/grievances" element={<ProtectedRoute><GrievancePortal /></ProtectedRoute>} />
              <Route path="/grievances/track" element={<ProtectedRoute><GrievancePortal /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Officer / Admin Protected Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['Officer', 'Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>

          <Footer />

          {/* Touch-Friendly Mobile Bottom Bar */}
          {user && <MobileBottomNav />}

          <RAGChatbotModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            userProfile={user?.profile}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
