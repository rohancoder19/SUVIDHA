import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, X, Send, Sparkles, User, ExternalLink, Loader2, BookOpen } from 'lucide-react';

export default function RAGChatbotModal({ isOpen, onClose, userProfile }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! I am your SUVIDHA AI Welfare Assistant powered by Gemini 2.5 & ChromaDB. Ask me anything about 3,400+ government schemes, eligibility, or application steps!',
      citedSchemes: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    "Schemes for female farmers in Madhya Pradesh?",
    "Scholarships for SC/ST students?",
    "Business loans for unemployed youth under MUDRA?",
    "How to claim pension under NSAP?"
  ];

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
        userProfile
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
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Apologies, I encountered a temporary connection issue. Please verify your query or try selecting one of the suggested prompts below.',
          citedSchemes: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg h-[90vh] glass-panel rounded-3xl border border-teal-500/30 flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-100 text-sm">SUVIDHA RAG Assistant</h3>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500/30">
                  Gemini 2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400">3,400+ Schemes Intelligent Search</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
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
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 text-teal-400 border border-teal-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="max-w-[85%] space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Cited Schemes Badges */}
                  {msg.citedSchemes && msg.citedSchemes.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80">
                      <p className="text-[10px] uppercase font-bold text-teal-400 mb-1.5 flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Cited Government Schemes:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citedSchemes.map((schemeName, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-slate-800/90 text-teal-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-teal-500/20"
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
            <div className="flex items-center space-x-2 text-teal-400 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800 max-w-[70%]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Querying ChromaDB vector index & Gemini RAG...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-slate-900/50 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>Suggested Inquiries</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] bg-slate-800/60 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 px-2.5 py-1 rounded-lg border border-slate-700/60 hover:border-teal-500/30 transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI about eligibility, guidelines, documents required..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="w-10 h-10 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 flex items-center justify-center font-bold transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
