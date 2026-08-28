import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RAGChatbotModal from './components/RAGChatbotModal';

import Home from './pages/Home';
import WelfareFinder from './pages/WelfareFinder';
import Complaint from './pages/Complaint';
import ComplaintStatus from './pages/ComplaintStatus';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

export default function App() {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenChat={() => setIsChatOpen(true)} />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onOpenChat={() => setIsChatOpen(true)} />} />
          <Route path="/finder" element={<WelfareFinder onOpenChat={() => setIsChatOpen(true)} />} />
          <Route path="/complaint" element={<Complaint />} />
          <Route path="/tracker" element={<ComplaintStatus />} />
          <Route
            path="/admin"
            element={
              user?.role === 'Officer' || user?.role === 'Admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login?redirect=/admin" replace />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>

      <Footer />

      <RAGChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userProfile={user?.profile}
      />
    </div>
  );
}
