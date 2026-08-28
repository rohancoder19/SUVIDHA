import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, ArrowRight, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('Citizen'); // 'Citizen' or 'Officer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [income, setIncome] = useState(240000);
  const [occupation, setOccupation] = useState('Farmer / Agriculture');
  const [age, setAge] = useState(24);
  const [gender, setGender] = useState('Female');
  const [category, setCategory] = useState('OBC');
  const [education, setEducation] = useState('Undergraduate');
  const [state, setState] = useState('Maharashtra');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const profileData = {
      state,
      age: Number(age),
      gender,
      income: Number(income),
      category,
      occupation,
      education
    };

    const res = await register(name, email, password, accountType, profileData);
    if (res.success) {
      if (accountType === 'Officer' || accountType === 'Admin') {
        navigate('/officer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(res.error || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#070d17] text-slate-100 transition-colors relative">
      <div className="max-w-xl w-full bg-[#0e1726]/90 border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Logo Banner */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-emerald-500/40 p-2 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <img src="/logo.svg" alt="SUVIDHA Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold font-outfit text-white">Create SUVIDHA Account</h2>
          <p className="text-xs text-slate-400">
            Register to access AI welfare scheme recommendations & grievance tracking
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Register Account As Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Register Account As *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType('Citizen')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
                  accountType === 'Citizen'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>General Applicant</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('Officer')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
                  accountType === 'Officer'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-400 shadow-md'
                    : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Municipal Officer / Admin</span>
              </button>
            </div>
          </div>

          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Verma"
                className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@gmail.com"
                className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Password & Income */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Annual Household Income (₹)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="240000"
                className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 3: Occupation & Age/Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Farmer / Agriculture">Farmer / Agriculture</option>
                <option value="Student">Student</option>
                <option value="Self Employed / Artisan">Self Employed / Artisan</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Government Service">Government Service</option>
                <option value="Private Job">Private Job</option>
                <option value="Daily Wage Laborer">Daily Wage Laborer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: Category/Education & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white"
                >
                  <option value="OBC">OBC</option>
                  <option value="General">General</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Education</label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">State Residency</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-white"
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Delhi">Delhi</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="West Bengal">West Bengal</option>
                <option value="All India">All India</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 font-extrabold text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Processing Registration...' : 'Complete Registration & Start AI Match →'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-400 hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
