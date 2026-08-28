import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Bot, FileText, CheckCircle, ArrowRight, Sparkles, ChevronDown, ChevronUp, Layers, Users, Zap, ShieldCheck, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Home({ onOpenChat }) {
  const { t } = useLanguage();
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
      question: "How does SUVIDHA 2.0 determine my scheme eligibility?",
      answer: "SUVIDHA 2.0 uses a strict deterministic hard eligibility pipeline that matches your age, state, district, gender, income, category, and occupation against verified government guidelines."
    },
    {
      question: "Does SUVIDHA 2.0 fabricate or hallucinate government schemes?",
      answer: "Never. SUVIDHA 2.0 only queries verified government datasets (like MyScheme and DBT portals). Every recommendation includes direct links to official government websites."
    },
    {
      question: "How does the Explainable AI feature work?",
      answer: "Clicking 'Why am I seeing this?' displays an easy-to-understand breakdown showing exactly which criteria you passed (e.g. ✓ Age, ✓ Income, ✓ State) and any missing document requirements."
    },
    {
      question: "Is SUVIDHA 2.0 available in my language?",
      answer: "Yes! You can toggle between English, Hindi (हिंदी), and Bengali (বাংলা) anytime from the top navigation bar."
    }
  ];

  return (
    <div className="space-y-20 pb-16 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Hero Section */}
      <section className="relative pt-16 lg:pt-24 text-center max-w-5xl mx-auto px-4">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>AI-Powered Civic Welfare & Scheme Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-outfit leading-tight mb-6 text-slate-900 dark:text-white">
          {t('heroTitle')}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
          {t('heroSubtitle')}
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            to="/finder"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2"
          >
            <span>{t('ctaCheckEligibility')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/finder"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
          >
            <span>{t('ctaExploreSchemes')}</span>
          </Link>
        </div>

        {/* Natural Language Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl flex items-center shadow-xl border border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('aiSearchPlaceholder')}
              className="flex-1 bg-transparent border-none px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shrink-0 transition-colors"
            >
              {t('searchBtn')}
            </button>
          </div>
        </form>
      </section>

      {/* How SUVIDHA 2.0 Works Step-by-Step */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold font-outfit mb-3">How SUVIDHA 2.0 Works</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Simple 4-step journey from discovery to official government application.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold flex items-center justify-center text-sm mb-4">1</div>
            <h3 className="font-bold text-base mb-2">Build Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Enter state, age, category, income, and occupation to personalize filtering.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center text-sm mb-4">2</div>
            <h3 className="font-bold text-base mb-2">Hard Eligibility Filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Our 6-stage deterministic rule engine evaluates state boundaries and income ceilings.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-sm mb-4">3</div>
            <h3 className="font-bold text-base mb-2">Explainable AI Match</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Understand exactly why you are eligible with clear breakdown factors.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold flex items-center justify-center text-sm mb-4">4</div>
            <h3 className="font-bold text-base mb-2">Track & Apply</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Use our Document Checklist Assistant and Application Tracker to apply safely.</p>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('trustBadgeTitle')}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-outfit">Guaranteed Data Integrity & Transparency</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('trustBadgeDesc')}
            </p>
          </div>
          <button
            onClick={onOpenChat}
            className="px-6 py-3.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shrink-0 flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Consult RAG Assistant</span>
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold font-outfit mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Everything you need to know about SUVIDHA 2.0 scheme discovery.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 text-sm hover:text-indigo-600 transition-colors"
              >
                <span>{faq.question}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
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
