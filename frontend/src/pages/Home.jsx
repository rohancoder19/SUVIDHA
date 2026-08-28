import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Bot, FileText, CheckCircle, ArrowRight, Sparkles, ChevronDown, ChevronUp, Layers, Users, Zap, ShieldCheck, HelpCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Home({ onOpenChat }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

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
      
      {/* Hero Section */}
      <section className="relative pt-16 lg:pt-24 text-center max-w-5xl mx-auto px-4">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Hero Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold mb-8 shadow-lg shadow-emerald-500/10">
          <img src="/logo.svg" alt="Badge logo" className="w-4 h-4 object-contain" />
          <span className="uppercase tracking-wider">AI-POWERED WELFARE SCHEME & CIVIC GOVERNANCE ENGINE</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-7xl font-black font-outfit tracking-tight leading-none mb-6">
          <span className="block text-white">Empowering Citizens with</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold py-1">
            Smart Schemes & Urgent
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 font-extrabold py-1">
            Grievance Redressal
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          Discover customized Government Schemes based on your income, occupation & demographic profile, or file civic complaints with instant NLP Priority Triage.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            to="/schemes"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 hover:scale-105 shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Find Eligible Schemes (AI Match)</span>
          </Link>

          <Link
            to="/grievances/create"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-xs sm:text-sm bg-[#0f172a] border border-[#1e293b] text-rose-400 hover:bg-rose-950/30 hover:border-rose-500/50 shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>File Urgent Grievance</span>
          </Link>
        </div>

        {/* Natural Language Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
          <div className="bg-[#0e1726]/90 p-2 rounded-2xl flex items-center shadow-2xl border border-[#1e293b]">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 3,400+ schemes or grievances (e.g. scholarship, pension, road repair)..."
              className="flex-1 bg-transparent border-none px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shrink-0 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Floating Bottom-Right AI Assistant Widget */}
      <button
        onClick={onOpenChat}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-extrabold text-xs px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center space-x-2"
      >
        <Bot className="w-4 h-4 text-slate-950" />
        <span>AI Welfare Assistant</span>
        <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
      </button>

      {/* How SUVIDHA Works Step-by-Step */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit mb-3 text-white">How SUVIDHA Works</h2>
          <p className="text-xs sm:text-sm text-slate-400">Simple 4-step journey from discovery to official government application and grievance resolution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0e1726]/80 p-6 rounded-3xl border border-[#1e293b] shadow-xl relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center text-sm mb-4 border border-indigo-800">1</div>
            <h3 className="font-bold text-base mb-2 text-white">Build Profile</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Enter state, age, category, income, and occupation to personalize filtering.</p>
          </div>

          <div className="bg-[#0e1726]/80 p-6 rounded-3xl border border-[#1e293b] shadow-xl relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center text-sm mb-4 border border-emerald-800">2</div>
            <h3 className="font-bold text-base mb-2 text-white">Hard Eligibility Filter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Our 6-stage deterministic rule engine evaluates state boundaries and income ceilings.</p>
          </div>

          <div className="bg-[#0e1726]/80 p-6 rounded-3xl border border-[#1e293b] shadow-xl relative">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-sm mb-4 border border-cyan-800">3</div>
            <h3 className="font-bold text-base mb-2 text-white">Explainable AI Match</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Understand exactly why you are eligible with clear breakdown factors.</p>
          </div>

          <div className="bg-[#0e1726]/80 p-6 rounded-3xl border border-[#1e293b] shadow-xl relative">
            <div className="w-10 h-10 rounded-2xl bg-rose-950 text-rose-400 font-bold flex items-center justify-center text-sm mb-4 border border-rose-800">4</div>
            <h3 className="font-bold text-base mb-2 text-white">Track & Resolve</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Use our GPS Map Grievance Portal & Status Timeline to resolve civic issues.</p>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-outfit mb-2 text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about SUVIDHA scheme discovery and grievance triage.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#0e1726]/80 rounded-2xl border border-[#1e293b] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-semibold text-slate-200 text-xs sm:text-sm hover:text-emerald-400 transition-colors"
              >
                <span>{faq.question}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
