import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Sliders, CheckCircle2, Save, MapPin } from 'lucide-react';

const INDIAN_STATES = [
  'Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh', 'West Bengal', 'Telangana',
  'Karnataka', 'Tamil Nadu', 'Odisha', 'Gujarat', 'Delhi', 'All India'
];

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [profile, setProfile] = useState({
    state: user?.profile?.state || 'Madhya Pradesh',
    age: user?.profile?.age || 25,
    gender: user?.profile?.gender || 'All',
    income: user?.profile?.income || 250000,
    category: user?.profile?.category || 'General',
    isStudent: user?.profile?.isStudent || false,
    occupation: user?.profile?.occupation || 'Farmer',
    pincode: user?.profile?.pincode || ''
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const res = await updateProfile({ name, profile });
    setLoading(false);
    if (res?.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-teal-500 flex items-center justify-center text-2xl font-black text-teal-400">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 font-outfit">{user?.name}</h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/30 uppercase mt-1">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {saved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile defaults updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-4 h-4" />
              <span>Demographic Defaults (Pre-fills Welfare Finder)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">State</label>
                <select
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Household Income (₹)</label>
                <input
                  type="number"
                  value={profile.income}
                  onChange={(e) => setProfile({ ...profile, income: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={profile.category}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Occupation</label>
                <input
                  type="text"
                  value={profile.occupation}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Pincode</label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="glow-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Demographic Profile'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
