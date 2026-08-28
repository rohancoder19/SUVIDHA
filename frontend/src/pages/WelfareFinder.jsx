import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sliders, Search, ArrowUpDown, ExternalLink, Bot, CheckCircle, AlertCircle, Info, Sparkles, X, Shield, Filter } from 'lucide-react';

const INDIAN_STATES = [
  'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const GENDERS = ['All', 'Male', 'Female', 'Transgender'];

export default function WelfareFinder({ onOpenChat }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Demographic filter state
  const [profile, setProfile] = useState({
    state: user?.profile?.state || 'Madhya Pradesh',
    age: user?.profile?.age || 25,
    gender: user?.profile?.gender || 'All',
    income: user?.profile?.income || 250000,
    category: user?.profile?.category || 'General',
    isStudent: user?.profile?.isStudent || false,
    occupation: user?.profile?.occupation || 'All'
  });

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [textSearch, setTextSearch] = useState(searchParams.get('search') || '');

  // Fetch schemes from recommendation API
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/schemes/recommend', profile);
      if (res.data && res.data.schemes) {
        setSchemes(res.data.schemes);
      }
    } catch (err) {
      console.error('Recommendation fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [profile]);

  // Client-side text filter on top of eligible schemes
  const filteredSchemes = schemes.filter((s) => {
    if (!textSearch.trim()) return true;
    const term = textSearch.toLowerCase();
    const title = (s.scheme_name || s.title || '').toLowerCase();
    const desc = (s.description || '').toLowerCase();
    const dept = (s.department || '').toLowerCase();
    return title.includes(term) || desc.includes(term) || dept.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Filter className="w-4 h-4" />
            <span>Deterministic 6-Stage Hard Filter Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-outfit">
            Welfare Scheme Discovery Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time hard filtering with match scores sorted in <strong className="text-teal-300">Ascending Order</strong>.
          </p>
        </div>

        <button
          onClick={onOpenChat}
          className="glow-btn-indigo px-5 py-3 rounded-2xl text-xs font-bold text-white flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Dual Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Filter Drawer (4 Cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>Demographic Filter Parameters</span>
            </h3>
            <button
              onClick={() => setProfile({ state: 'All India', age: 25, gender: 'All', income: 250000, category: 'General', isStudent: false, occupation: 'All' })}
              className="text-[11px] text-slate-400 hover:text-teal-400 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* State Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">State / Territory Isolation</label>
            <select
              value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Age Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Age: <span className="text-teal-400 font-bold">{profile.age} years</span></label>
              <span className="text-[10px] text-slate-500">0 - 100 yrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) })}
              className="w-full accent-teal-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Gender Identity</label>
            <div className="grid grid-cols-2 gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setProfile({ ...profile, gender: g })}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    profile.gender === g
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Household Income Ceiling */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Annual Household Income (₹)</label>
            <input
              type="number"
              value={profile.income}
              onChange={(e) => setProfile({ ...profile, income: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              placeholder="e.g. 250000"
            />
          </div>

          {/* Social Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Social Category Quota</label>
            <select
              value={profile.category}
              onChange={(e) => setProfile({ ...profile, category: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Occupation Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Occupation</label>
            <input
              type="text"
              value={profile.occupation}
              onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
              placeholder="e.g. Farmer, Artisan, Unemployed, Student"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Student Checkbox */}
          <div className="flex items-center space-x-3 pt-2 border-t border-slate-800">
            <input
              type="checkbox"
              id="isStudentCheck"
              checked={profile.isStudent}
              onChange={(e) => setProfile({ ...profile, isStudent: e.target.checked })}
              className="w-4 h-4 accent-teal-400 bg-slate-900 border-slate-700 rounded cursor-pointer"
            />
            <label htmlFor="isStudentCheck" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
              Currently Enrolled Student
            </label>
          </div>

        </div>

        {/* Right Results View (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Bar Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                placeholder="Filter results..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
              <span>Sorting: <strong className="text-teal-300">Ascending Match %</strong></span>
              <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/30">
                {filteredSchemes.length} Eligible Schemes
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="glass-panel p-12 rounded-3xl text-center text-teal-400 space-y-3">
              <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Running 6-Stage Hard Filter Engine...</p>
            </div>
          )}

          {/* Scheme Cards Grid */}
          {!loading && filteredSchemes.length > 0 && (
            <div className="space-y-4">
              {filteredSchemes.map((scheme, idx) => {
                const title = scheme.scheme_name || scheme.title;
                const matchScore = scheme.match_percentage || 50;
                const level = scheme.level || 'Central';
                const stateName = scheme.state_name || scheme.state || 'All India';
                const dept = scheme.department || 'Government of India';

                return (
                  <div
                    key={idx}
                    className="glass-panel glass-panel-hover p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start justify-between gap-6 relative overflow-hidden"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Match Percentage Badge (Ascending Order) */}
                        <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                          <span>Match Score: {matchScore}%</span>
                        </span>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                          level === 'Central' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        }`}>
                          {level} ({stateName})
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-100 font-outfit">{title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{scheme.description}</p>
                      
                      <div className="text-[11px] text-slate-500 font-medium">
                        Department: <span className="text-slate-300">{dept}</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <button
                        onClick={() => setSelectedScheme(scheme)}
                        className="glow-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 w-full md:w-auto text-center"
                      >
                        View Details & Apply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredSchemes.length === 0 && (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-200 font-outfit">No Matching Schemes Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No schemes survived the hard income, age, or state isolation filters for these specific criteria. Try adjusting your demographic profile sliders.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel max-w-2xl w-full max-h-[85vh] rounded-3xl p-6 border border-teal-500/30 space-y-6 overflow-y-auto relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Match Score: {selectedScheme.match_percentage}%
                </span>
                <h2 className="text-xl font-bold text-slate-100 font-outfit mt-2">
                  {selectedScheme.scheme_name || selectedScheme.title}
                </h2>
                <p className="text-xs text-teal-400 font-medium">
                  {selectedScheme.department} • {selectedScheme.level} ({selectedScheme.state_name || selectedScheme.state})
                </p>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 border-t border-b border-slate-800 py-4">
              <div>
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] mb-1">Description</h4>
                <p className="leading-relaxed text-slate-400">{selectedScheme.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] mb-1">Eligibility Criteria</h4>
                <p className="leading-relaxed text-slate-400">{selectedScheme.eligibility_text || selectedScheme.eligibilityText}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] mb-1">Benefits Provided</h4>
                <p className="leading-relaxed text-teal-300 font-semibold">{selectedScheme.benefits}</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <a
                href={selectedScheme.application_url || selectedScheme.applicationUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="glow-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 flex items-center space-x-2"
              >
                <span>Proceed to Official Application Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
