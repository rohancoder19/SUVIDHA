import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Bot, FileText, CheckCircle, ArrowRight, Sparkles, ChevronDown, ChevronUp, Layers, Users, Zap, ShieldCheck, HelpCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Home({ onOpenChat }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'Officer') {
      navigate('/officer/dashboard', { replace: true });
    } else if (user?.role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const faqs = [
    {
      question: "How does SUVIDHA 2.0 determine my scheme eligibility?",
      answer: "SUVIDHA 2.0 uses a strict deterministic hard eligibility pipeline that matches your age, state, district, gender, income, category, and occupation against verified government guidelines."
    },
    {
      question: "Does SUVIDHA 2.0 fabricate or hallucinate government schemes?",
      answer: "Never. SUVIDHA 2.0 only queries verified government datasets (like MyScheme and DBT portals). Every recommendation includes direct links to official government websites."
    },
    {
      question: "How does the AI Grievance Classification feature work?",
      answer: "When you submit a civic issue, our AI engine analyzes the complaint text and location to classify category, detect priority level (LOW, MEDIUM, HIGH, CRITICAL), and route it to the appropriate department."
    },
    {
      question: "Is SUVIDHA 2.0 available in my language?",
      answer: "Yes! You can toggle between English, Hindi (हिंदी), and Bengali (বাংলা) anytime from the top navigation bar."
    }
  ];

  return (
    <div className="space-y-20 pb-20 bg-[#070d17] text-slate-100 min-h-screen transition-colors relative">
      
      {/* Hero Section with Glassmorphism Search */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0e1726] border border-[#1e293b] text-cyan-400 text-xs font-bold shadow-xl">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>SUVIDHA 2.0 • AI-Powered Democratic Welfare & Grievance Governance</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-outfit tracking-tight leading-tight max-w-4xl mx-auto text-white">
          Empowering Citizens with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Smart Welfare Discovery</span> & Grievance Redressal
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Discover verified central & state welfare schemes, calculate deterministic eligibility, and track real-time AI civic grievance redressal—all in one transparent portal.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes by name, category, state (e.g. MSME, Housing, West Bengal)..."
              className="w-full pl-12 pr-36 py-4 rounded-2xl bg-[#0e1726]/90 border border-[#1e293b] text-xs sm:text-sm text-white placeholder-slate-500 shadow-2xl focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4" />
            <button
              type="submit"
              className="absolute right-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-extrabold text-xs shadow-md hover:scale-105 transition-transform"
            >
              Explore
            </button>
          </div>
        </form>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-bold text-slate-400 pt-4">
          <span className="px-3.5 py-1.5 rounded-full bg-[#0e1726] border border-[#1e293b] text-emerald-400 flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>3,400+ Central & State Schemes</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#0e1726] border border-[#1e293b] text-cyan-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Hallucination AI Matching</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#0e1726] border border-[#1e293b] text-amber-400 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Real-time Grievance SLA Tracking</span>
          </span>
        </div>
      </section>

      {/* 3 Main Action Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#0e1726]/90 border border-[#1e293b] p-8 rounded-3xl space-y-4 hover:border-emerald-500/50 transition-all shadow-xl group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-outfit text-white">Smart Scheme Recommender</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Answer a few quick questions to receive personalized welfare recommendations matched against verified government rules.
          </p>
          <Link to="/finder" className="inline-flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            Find Schemes <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-[#0e1726]/90 border border-[#1e293b] p-8 rounded-3xl space-y-4 hover:border-cyan-500/50 transition-all shadow-xl group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-outfit text-white">Live Grievance Redressal</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            File municipal complaints with automatic AI category, urgency classification, and direct dispatch to nodal officers.
          </p>
          <Link to="/grievances/create" className="inline-flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
            File Grievance <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-[#0e1726]/90 border border-[#1e293b] p-8 rounded-3xl space-y-4 hover:border-amber-500/50 transition-all shadow-xl group">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-outfit text-white">24/7 AI Civic Assistant</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ask questions about government schemes, document prerequisites, application status, or grievance tracking anytime.
          </p>
          <button onClick={onOpenChat} className="inline-flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            Chat with AI <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-outfit text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about the SUVIDHA platform.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#0e1726] border border-[#1e293b] rounded-2xl p-5 space-y-2">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-sm text-white"
              >
                <span>{faq.question}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openFaq === idx && (
                <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
