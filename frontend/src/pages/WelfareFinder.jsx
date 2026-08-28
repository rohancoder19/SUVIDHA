import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, RefreshCw, Bookmark, Sparkles, AlertCircle, Scale, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SchemeCard from '../components/SchemeCard';
import ExplainableModal from '../components/ExplainableModal';
import SchemeCompareModal from '../components/SchemeCompareModal';

export default function WelfareFinder() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState(user?.profile?.state || 'All India');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState(user?.profile?.gender || 'All');
  const [incomeInput, setIncomeInput] = useState(user?.profile?.income || 250000);
  const [ageInput, setAgeInput] = useState(user?.profile?.age || 25);
  const [selectedOccupation, setSelectedOccupation] = useState(user?.profile?.occupation || 'All');

  // Datasets & Results
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals & Comparison State
  const [explainScheme, setExplainScheme] = useState(null);
  const [savedSchemeIds, setSavedSchemeIds] = useState([]);
  const [compareSchemes, setCompareSchemes] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // States & Categories options
  const indianStates = [
    'All India', 'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
    'Gujarat', 'Haryana', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
    'Uttar Pradesh', 'West Bengal'
  ];

  const categories = [
    'All', 'General Welfare', 'Agriculture & Farmer Welfare', 'Education & Scholarships',
    'Women & Child Welfare', 'Healthcare & Health Insurance', 'Employment & Skill Development',
    'Housing & Sanitation', 'Social Security & Pension'
  ];

  useEffect(() => {
    // Parse URL params if present
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    fetchRecommendations();
    fetchUserBookmarks();
  }, [location.search]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const profilePayload = {
        state: selectedState,
        age: Number(ageInput),
        gender: selectedGender,
        income: Number(incomeInput),
        category: selectedCategory === 'All' ? 'General' : selectedCategory,
        isStudent: selectedOccupation === 'Student',
        occupation: selectedOccupation
      };

      const res = await axios.post('/api/schemes/recommend', profilePayload);
      if (res.data.schemes) {
        let fetched = res.data.schemes;

        // Apply keyword filter if search query present
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          fetched = fetched.filter(s =>
            (s.title || s.scheme_name || '').toLowerCase().includes(q) ||
            (s.description || '').toLowerCase().includes(q) ||
            (s.benefits || '').toLowerCase().includes(q)
          );
        }

        setSchemes(fetched);
      }
    } catch (err) {
      console.error('Error fetching scheme recommendations:', err);
      setError('Unable to fetch recommendations. Please check API server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookmarks = async () => {
    if (user) {
      try {
        const res = await axios.get('/api/bookmarks');
        if (res.data.data && res.data.data.savedSchemes) {
          setSavedSchemeIds(res.data.data.savedSchemes.map(s => s._id || s.id || s.slug));
        }
      } catch (err) {
        console.warn('Could not fetch bookmarks:', err.message);
      }
    } else {
      const localSaved = JSON.parse(localStorage.getItem('suvidha_guest_saved') || '[]');
      setSavedSchemeIds(localSaved.map(s => s._id || s.id || s.slug));
    }
  };

  const handleToggleSave = async (scheme) => {
    const schemeId = scheme._id || scheme.id || scheme.slug;

    if (user) {
      try {
        const res = await axios.post('/api/bookmarks/toggle', { schemeId });
        if (res.data.success) {
          fetchUserBookmarks();
        }
      } catch (err) {
        console.error('Bookmark error:', err);
      }
    } else {
      let localSaved = JSON.parse(localStorage.getItem('suvidha_guest_saved') || '[]');
      const index = localSaved.findIndex(s => (s._id || s.id || s.slug) === schemeId);
      if (index > -1) {
        localSaved.splice(index, 1);
      } else {
        localSaved.push(scheme);
      }
      localStorage.setItem('suvidha_guest_saved', JSON.stringify(localSaved));
      setSavedSchemeIds(localSaved.map(s => s._id || s.id || s.slug));
    }
  };


  const handleToggleCompare = (scheme) => {
    const exists = compareSchemes.some(s => (s.slug || s._id) === (scheme.slug || scheme._id));
    if (exists) {
      setCompareSchemes(prev => prev.filter(s => (s.slug || s._id) !== (scheme.slug || scheme._id)));
    } else {
      if (compareSchemes.length >= 4) {
        alert('You can compare up to 4 schemes at a time.');
        return;
      }
      setCompareSchemes(prev => [...prev, scheme]);
    }
  };

  const handleNaturalSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/schemes/natural-search', { query: searchQuery });
      if (res.data.schemes) {
        setSchemes(res.data.schemes);
      }
    } catch (err) {
      console.warn('Natural search fallback to basic filter:', err.message);
      fetchRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedState('All India');
    setSelectedCategory('All');
    setSelectedGender('All');
    setIncomeInput(250000);
    setAgeInput(25);
    setSelectedOccupation('All');
    fetchRecommendations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Deterministic Eligibility & RAG Discovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit">Smart Scheme Explorer</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Filter through verified government schemes ranked strictly by your profile match score.
            </p>
          </div>

          {/* Natural Language AI Search */}
          <form onSubmit={handleNaturalSearchSubmit} className="w-full md:w-96">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('aiSearchPlaceholder')}
                className="w-full pl-10 pr-20 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                {t('searchBtn')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Scheme Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              Demographic Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              {t('clearFilters')}
            </button>
          </div>

          {/* State Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('filterState')}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              {indianStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('filterCategory')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Income Ceiling Range */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>{t('filterIncome')}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">₹{Number(incomeInput).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1500000"
              step="25000"
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Age Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>{t('filterAge')}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{ageInput} Yrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('filterGender')}
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
            </select>
          </div>

          <button
            onClick={fetchRecommendations}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>

        {/* Schemes Output Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  </div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-center text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : schemes.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">{t('noResultsTitle')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {t('noResultsDesc')}
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                <span>Showing {schemes.length} verified recommendations (Sorted by Match Score)</span>
                <span>Sorted: Highest Match First</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schemes.map(scheme => (
                  <SchemeCard
                    key={scheme.slug || scheme._id || scheme.id}
                    scheme={scheme}
                    onExplain={(s) => setExplainScheme(s)}
                    onToggleSave={(s) => handleToggleSave(s)}
                    isSaved={savedSchemeIds.includes(scheme._id || scheme.id)}
                    onToggleCompare={(s) => handleToggleCompare(s)}
                    isComparing={compareSchemes.some(c => (c.slug || c._id) === (scheme.slug || scheme._id))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Comparison Drawer */}
      {compareSchemes.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white border border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-slideUp">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>{compareSchemes.length} Schemes Selected for Comparison</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md"
            >
              Compare Side-by-Side
            </button>
            <button
              onClick={() => setCompareSchemes([])}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Explainable AI Modal */}
      <ExplainableModal
        isOpen={Boolean(explainScheme)}
        onClose={() => setExplainScheme(null)}
        scheme={explainScheme}
      />

      {/* Scheme Comparison Matrix Modal */}
      <SchemeCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        schemes={compareSchemes}
      />
    </div>
  );
}
