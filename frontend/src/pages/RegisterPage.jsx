import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, Mail, Lock, ArrowRight, AlertCircle, Scale, Ruler, Target, Activity, Dumbbell, Award } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { useApp } from '../context/AppContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Fitness Experience & Equipment
  const [fitnessExperience, setFitnessExperience] = useState('BEGINNER');
  const [equipment, setEquipment] = useState('NONE');
  
  // Body Metrics
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('70');
  
  // Primary Goal
  const [fitnessGoal, setFitnessGoal] = useState('WEIGHT_LOSS');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const { registerUser } = useApp();

  // Compute live BMI & Category preview
  const hM = parseFloat(heightCm) / 100.0;
  const wKg = parseFloat(weightKg);
  const liveBmi = (hM > 0 && wKg > 0) ? (wKg / (hM * hM)).toFixed(1) : null;

  let bmiCat = 'Normal weight';
  let catColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (liveBmi) {
    const val = parseFloat(liveBmi);
    if (val < 18.5) {
      bmiCat = 'Underweight';
      catColor = 'text-sky-400 border-sky-500/30 bg-sky-500/10';
    } else if (val >= 18.5 && val < 25.0) {
      bmiCat = 'Normal weight';
      catColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    } else if (val >= 25.0 && val < 30.0) {
      bmiCat = 'Overweight';
      catColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    } else {
      bmiCat = 'Obese';
      catColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (!heightCm || !weightKg) {
      setErrorMsg('Please enter your height and weight.');
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password, {
      fitnessExperience,
      equipment,
      heightCm: parseFloat(heightCm),
      weightKg: parseFloat(weightKg),
      fitnessGoal,
    });
    setLoading(false);

    if (result && result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 my-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand flex items-center justify-center text-slate-950 font-bold shadow-brand-glow">
              <Zap className="w-6 h-6 fill-slate-950 stroke-none" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-slate-100">FITMINDS</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100">Student Account Registration</h2>
          <p className="text-xs text-slate-400">Fill in your profile details & fitness goals to personalize your ML workout strategy</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <Alert variant="danger" title="Registration Error" icon={AlertCircle}>
            {errorMsg}
          </Alert>
        )}

        {/* Register Form Card */}
        <Card variant="default" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Ayush Mane"
                leftIcon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Student Email"
                type="email"
                placeholder="user@fitminds.edu"
                leftIcon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                leftIcon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Fitness Level & Equipment */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-3">
                Fitness Experience & Equipment Access
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-brand" />
                    Fitness Level
                  </label>
                  <select
                    value={fitnessExperience}
                    onChange={(e) => setFitnessExperience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-brand"
                  >
                    <option value="BEGINNER">🌱 Beginner (Just Starting)</option>
                    <option value="INTERMEDIATE">⚡ Intermediate (Regular Workouts)</option>
                    <option value="ADVANCED">🔥 Advanced (Experienced Athlete)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-brand" />
                    Equipment Access
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-brand"
                  >
                    <option value="NONE">🧘 None (Bodyweight Only)</option>
                    <option value="BASIC">🏋️ Basic (Dumbbells / Bands)</option>
                    <option value="GYM">🏢 Full Gym Access</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Body Metrics Row */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-3">
                Body Metrics & Fitness Goal
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <Input
                  label="Height (cm)"
                  type="number"
                  placeholder="175"
                  leftIcon={Ruler}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  required
                />

                <Input
                  label="Weight (kg)"
                  type="number"
                  placeholder="70"
                  leftIcon={Scale}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  required
                />
              </div>

              {/* Primary Fitness Goal */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-brand" />
                  Primary Fitness Goal
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-brand"
                >
                  <option value="WEIGHT_LOSS">🔥 Weight Loss (Fat Loss & Toning)</option>
                  <option value="WEIGHT_GAIN">💪 Weight Gain (Muscle Mass Building)</option>
                  <option value="STRENGTH">🏋️ Build Strength & Hypertrophy</option>
                  <option value="FITNESS">⚡ General Fitness & Stamina</option>
                  <option value="CONSISTENCY">🎯 Habit & Workout Consistency</option>
                  <option value="ACTIVE">🧘 Stay Active & Stress Relief</option>
                </select>
              </div>

              {/* Live BMI Preview Card */}
              {liveBmi && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Calculated Baseline BMI</span>
                      <span className="text-sm font-extrabold text-slate-100">{liveBmi} kg/m²</span>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${catColor}`}>
                    {bmiCat}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" fullWidth rightIcon={ArrowRight} disabled={loading}>
              {loading ? 'Creating Account & Training Profile...' : 'Complete Registration'}
            </Button>
          </form>
        </Card>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
