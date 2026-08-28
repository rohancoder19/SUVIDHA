import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Bot, FileText, CheckCircle, ArrowRight, Sparkles, ChevronDown, ChevronUp, Layers, Users, Zap } from 'lucide-react';

export default function Home({ onOpenChat }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/finder?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const faqs = [
    {
      question: "How does the SUVIDHA Hard Eligibility Filter engine work?",
      answer: "SUVIDHA uses a strict 6-stage deterministic hard filter algorithm evaluating state isolation, gender rules, age boundaries, income ceilings, student status, and category quotas before any sorting takes place."
    },
    {
      question: "Why are schemes sorted in Ascending Order by match percentage?",
      answer: "Per our transparency protocol, surviving schemes are sorted in ascending order of demographic affinity score, ensuring citizens view base eligibility criteria alongside specialized priority matches."
    },
    {
      question: "How do I file and track a government scheme grievance?",
      answer: "Navigate to 'File Grievance', fill in your scheme details, upload supporting documents, and receive a unique COMP-XXXXX tracking ID to follow real-time progress through our officer audit trail."
    },
    {
      question: "What is the ChromaDB + Gemini 2.5 RAG Assistant?",
      answer: "Our AI assistant uses ChromaDB vector embeddings of official guidelines paired with Gemini 2.5 Flash to provide instant answers with scheme citations and step-by-step application guidance."
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 text-center max-w-5xl mx-auto px-4">
        {/* Glow ambient circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6 shadow-inner">
          <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
          <span>AI-Powered Civic Welfare & Grievance Redressal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight font-outfit leading-tight mb-6">
          Democratizing Access Across <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400">
            3,400+ Government Schemes
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
          Discover eligible central and state benefits using our deterministic 6-stage hard filter engine, consult our Gemini 2.5 RAG assistant, and resolve issues with transparent grievance tracking.
        </p>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-12">
          <div className="glass-panel p-2 rounded-2xl flex items-center shadow-2xl border border-teal-500/20">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scheme name, state, or benefit (e.g., PM Kisan, Ladli Behna, Scholarship)..."
              className="flex-1 bg-transparent border-none px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="glow-btn-primary px-6 py-3 rounded-xl text-xs font-bold text-slate-950 flex items-center space-x-2 shrink-0"
            >
              <span>Explore Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Live Statistics Counter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <div className="text-3xl font-extrabold text-teal-400 font-outfit mb-1">3,400+</div>
            <div className="text-xs font-semibold text-slate-300">Central & State Schemes</div>
            <div className="text-[10px] text-slate-500 mt-1">Normalized metadata dataset</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <div className="text-3xl font-extrabold text-emerald-400 font-outfit mb-1">100%</div>
            <div className="text-xs font-semibold text-slate-300">Transparent Hard Filters</div>
            <div className="text-[10px] text-slate-500 mt-1">6-stage deterministic engine</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <div className="text-3xl font-extrabold text-cyan-400 font-outfit mb-1">Real-Time</div>
            <div className="text-xs font-semibold text-slate-300">Grievance Audit Trail</div>
            <div className="text-[10px] text-slate-500 mt-1">Official officer logs & remarks</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-outfit mb-3">
            Integrated Civic Microservices
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Powered by Node.js Express Backend, Python FastAPI ML Microservice, and ChromaDB Vector Store.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-outfit">Hard Eligibility Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filters out ineligible schemes based on State isolation, age bounds, gender, income ceilings, student status, and category quotas.
            </p>
            <Link
              to="/finder"
              className="inline-flex items-center text-xs font-bold text-teal-400 hover:text-teal-300 space-x-1 pt-2"
            >
              <span>Launch Welfare Finder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-outfit">Vector RAG Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask natural language questions to receive instant AI guidance powered by Gemini 2.5 Flash citing exact scheme names and document requirements.
            </p>
            <button
              onClick={onOpenChat}
              className="inline-flex items-center text-xs font-bold text-indigo-400 hover:text-indigo-300 space-x-1 pt-2"
            >
              <span>Ask AI Chatbot</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-outfit">Grievance Redressal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              File complaints for delayed benefits or rejected applications. Track step-by-step progress with officer remark logs and status timelines.
            </p>
            <Link
              to="/complaint"
              className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 space-x-1 pt-2"
            >
              <span>File Grievance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-100 font-outfit mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400">Everything you need to know about SUVIDHA system mechanics.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-semibold text-slate-200 text-sm hover:text-teal-400 transition-colors"
              >
                <span>{faq.question}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-teal-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
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
