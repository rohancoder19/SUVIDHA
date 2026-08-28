import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, X, Send, Sparkles, User, ExternalLink, Loader2, BookOpen, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RAGChatbotModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const isOfficerOrAdmin = user?.role === 'Officer' || user?.role === 'Admin';

  const defaultGreeting = isOfficerOrAdmin
    ? `Namaste Officer ${user?.name || ''}! I am your SUVIDHA Operational AI Assistant. Ask me about SLA rules, department triage guidelines, grievance escalations, or scheme verification policies.`
    : `Namaste ${user?.name || 'Citizen'}! I am your SUVIDHA AI Welfare Assistant powered by Gemini 2.5 & ChromaDB. Ask me anything about 3,400+ government schemes, eligibility, required documents, or grievance tracking!`;

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: defaultGreeting,
      citedSchemes: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const citizenPrompts = [
    "Schemes for female farmers in Madhya Pradesh?",
    "Scholarships for SC/ST/OBC students?",
    "Business loans under MUDRA scheme?",
    "How to track my filed grievance status?"
  ];

  const officerPrompts = [
    "What are the resolution SLA hours for Critical vs High priority complaints?",
    "How does the AI urgency score calculate priority (0-100)?",
    "What are the procedures for overriding AI department assignments?",
    "How to process citizen clarification responses?"
  ];

  const quickPrompts = isOfficerOrAdmin ? officerPrompts : citizenPrompts;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (queryText = inputQuery) => {
    const textToSend = queryText.trim();
    if (!textToSend || loading) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chatbot/query', {
        query: textToSend,
        userRole: user?.role || 'Citizen',
        userProfile: user?.profile
      });

      if (res.data && res.data.answer) {
        const aiMsg = {
          sender: 'ai',
          text: res.data.answer,
          citedSchemes: res.data.cited_schemes || [],
          sources: res.data.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      // Fallback AI responses if backend endpoint timeout
      let fallbackText = 'I am here to assist you with SUVIDHA government schemes and grievance redressal.';
      const queryLower = textToSend.toLowerCase();

      if (queryLower.includes('sla') || queryLower.includes('priority')) {
        fallbackText = 'SUVIDHA Resolution SLA Standards:\n- CRITICAL Hazard: 24 Hours SLA\n- HIGH Priority: 48 Hours SLA\n- MEDIUM Priority: 120 Hours (5 Days) SLA\n- LOW Priority: 168 Hours (7 Days) SLA';
      } else if (queryLower.includes('farmer') || queryLower.includes('kisan')) {
        fallbackText = 'Key Agricultural Welfare Schemes:\n1. PM-Kisan Samman Nidhi (₹6,000/yr direct transfer)\n2. PM Fasal Bima Yojana (Crop Insurance)\n3. Kisan Credit Card (KCC @ low interest)\n4. Soil Health Card Scheme';
      } else if (queryLower.includes('scholarship') || queryLower.includes('student')) {
        fallbackText = 'Key Student Scholarships:\n1. Post-Matric Scholarship for SC/ST/OBC\n2. PM Uchchatar Shiksha Protsahan (PM-USP)\n3. Pragati Scholarship Scheme for Girls in Technical Education';
      } else if (queryLower.includes('track') || queryLower.includes('grievance') || queryLower.includes('status')) {
        fallbackText = 'To track your grievance:\n1. Click "Track Status" in the navigation bar or top banner.\n2. Enter your unique SUV-2026-XXXXXX reference number.\n3. View real-time AI triage explanations, officer dispatch logs, and resolution timeline.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: fallbackText,
          citedSchemes: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">

      <div className="w-full max-w-lg h-[85vh] sm:h-[90vh] bg-[#0e1726] rounded-3xl border border-[#1e293b] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 bg-[#070d17] border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-white text-sm font-outfit">SUVIDHA AI Assistant</h3>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  {user?.role || 'Citizen'} AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">3,400+ Schemes & Civic Redressal Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#070d17]/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-[#0e1726] text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="max-w-[85%] space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-400 text-slate-950 font-bold rounded-tr-none shadow-md'
                      : 'bg-[#0e1726] border border-[#1e293b] text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Cited Schemes Badges */}
                  {msg.citedSchemes && msg.citedSchemes.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-cyan-400 mb-1.5 flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Cited Government Schemes:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citedSchemes.map((schemeName, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-slate-900 text-cyan-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-cyan-500/30"
                          >
                            {schemeName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`text-[10px] text-slate-500 px-1 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-cyan-400 text-xs bg-[#0e1726] p-3 rounded-xl border border-[#1e293b] max-w-[75%]">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Querying ChromaDB vector store & Gemini 2.5...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-[#070d17] border-t border-[#1e293b]">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Suggested Inquiries</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] bg-[#0e1726] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 px-2.5 py-1 rounded-lg border border-[#1e293b] hover:border-cyan-500/40 transition-all text-left font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#0e1726] border-t border-[#1e293b] flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isOfficerOrAdmin ? "Ask AI about SLA rules, escalation guidelines..." : "Ask AI about schemes, eligibility, documents required..."}
            className="flex-1 bg-[#070d17] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="w-10 h-10 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 flex items-center justify-center font-bold transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
