import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, Scale, Ruler, Target, Activity, Dumbbell, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { ProgressBar } from '../components/common/ProgressBar';
import { useApp } from '../context/AppContext';

export const RegisterPage = () => {
  const [step, setStep] = useState(1);

  // Step 1: Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Experience & Equipment
  const [fitnessExperience, setFitnessExperience] = useState('BEGINNER');
  const [equipment, setEquipment] = useState('NONE');

  // Step 3: Body Metrics
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('70');

  // Step 4: Primary Goal
  const [fitnessGoal, setFitnessGoal] = useState('WEIGHT_LOSS');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const { registerUser } = useApp();

  const totalSteps = 4;

  // Safe Live BMI calculation
  const hM = (heightCm && parseFloat(heightCm) > 0) ? parseFloat(heightCm) / 100.0 : 0;
  const wKg = (weightKg && parseFloat(weightKg) > 0) ? parseFloat(weightKg) : 0;
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

  const validateCurrentStep = () => {
    setErrorMsg('');

    if (step === 1) {
      if (!name || !name.trim()) {
        setErrorMsg('Please enter your full name.');
        return false;
      }
      if (!email || !email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid student email address.');
        return false;
      }
      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return false;
      }
    }

    if (step === 3) {
      if (!heightCm || parseFloat(heightCm) <= 0) {
        setErrorMsg('Please enter a valid height in cm.');
        return false;
      }
      if (!weightKg || parseFloat(weightKg) <= 0) {
        setErrorMsg('Please enter a valid weight in kg.');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (validateCurrentStep()) {
      if (step < totalSteps) {
        setStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevStep = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    // Full validation before submission
    if (!name || !name.trim()) {
      setStep(1);
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email || !email.trim() || !email.includes('@')) {
      setStep(1);
      setErrorMsg('Please enter a valid student email address.');
      return;
    }
    if (!password || password.length < 6) {
      setStep(1);
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setStep(1);
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!heightCm || parseFloat(heightCm) <= 0) {
      setStep(3);
      setErrorMsg('Please enter a valid height in cm.');
      return;
    }
    if (!weightKg || parseFloat(weightKg) <= 0) {
      setStep(3);
      setErrorMsg('Please enter a valid weight in kg.');
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
      setErrorMsg(result?.message || result?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 my-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand flex items-center justify-center text-slate-950 font-bold shadow-brand-glow">
              <Zap className="w-6 h-6 fill-slate-950 stroke-none" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-slate-100">FITMINDS</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100">Student Registration Wizard</h2>
          <p className="text-xs text-slate-400">Step {step} of {totalSteps} — Fill your details step by step</p>
          
          <div className="pt-2">
            <ProgressBar value={(step / totalSteps) * 100} variant="brand" size="sm" />
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <Alert variant="danger" title="Registration Error" icon={AlertCircle}>
            {errorMsg}
          </Alert>
        )}

        {/* Register Form Card */}
        <Card variant="default" className="p-6 md:p-8 min-h-[380px] flex flex-col justify-between">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 flex-1 flex flex-col justify-between">
            
            {/* STEP 1: Account Credentials */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="pb-2 border-b border-slate-800">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand" />
                    Step 1: Student Account Info
                  </h3>
                  <p className="text-xs text-slate-400">Enter your name and login credentials</p>
                </div>

                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Ayush Mane"
                  leftIcon={User}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Input
                  label="Student Email"
                  type="email"
                  placeholder="user@fitminds.edu"
                  leftIcon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={Lock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Fitness Level & Equipment */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="pb-2 border-b border-slate-800">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand" />
                    Step 2: Experience & Gym Equipment
                  </h3>
                  <p className="text-xs text-slate-400">Select your workout experience and available gear</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Fitness Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Beginner', val: 'BEGINNER', desc: 'Just Starting' },
                      { label: 'Intermediate', val: 'INTERMEDIATE', desc: 'Regular Workouts' },
                      { label: 'Advanced', val: 'ADVANCED', desc: 'Athlete' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setFitnessExperience(item.val)}
                        className={`p-3 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          fitnessExperience === item.val
                            ? 'border-brand bg-cyan-950/40 text-brand shadow-brand-glow'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-bold">{item.label}</span>
                        <span className="text-[10px] text-slate-500">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-300 block">Equipment Access</label>
                  <div className="space-y-2">
                    {[
                      { label: '🧘 No Equipment (Bodyweight only)', val: 'NONE', desc: 'Zero gear needed' },
                      { label: '🏋️ Basic Equipment (Dumbbells / Bands)', val: 'BASIC', desc: 'Home dumbbell set' },
                      { label: '🏢 Full Gym Access (Gym machines & barbells)', val: 'GYM', desc: 'Commercial gym membership' },
                    ].map((eq) => (
                      <button
                        key={eq.val}
                        type="button"
                        onClick={() => setEquipment(eq.val)}
                        className={`w-full p-3.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                          equipment === eq.val
                            ? 'border-brand bg-cyan-950/40 text-brand'
                            : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block">{eq.label}</span>
                          <span className="text-[10px] text-slate-500 block">{eq.desc}</span>
                        </div>
                        {equipment === eq.val && <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Body Metrics & Live BMI */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="pb-2 border-b border-slate-800">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-brand" />
                    Step 3: Body Metrics & BMI Calculator
                  </h3>
                  <p className="text-xs text-slate-400">Enter your height and weight for ML body composition modeling</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Height (cm)"
                    type="number"
                    placeholder="175"
                    leftIcon={Ruler}
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                  />

                  <Input
                    label="Weight (kg)"
                    type="number"
                    placeholder="70"
                    leftIcon={Scale}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>

                {/* Live BMI Preview Card */}
                {liveBmi && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Calculated BMI Score</span>
                          <span className="text-base font-extrabold text-slate-100">{liveBmi} kg/m²</span>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${catColor}`}>
                        {bmiCat}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      FITMINDS ML Engine uses your BMI category to calibrate calorie targets and exercise intensities.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Primary Fitness Goal */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="pb-2 border-b border-slate-800">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand" />
                    Step 4: Primary Fitness Goal
                  </h3>
                  <p className="text-xs text-slate-400">Select what you want to achieve with FITMINDS</p>
                </div>

                <div className="space-y-2">
                  {[
                    { label: '🔥 Weight Loss (Fat Loss & Lean Toning)', val: 'WEIGHT_LOSS', desc: 'Caloric deficit workouts & fat burn' },
                    { label: '💪 Weight Gain (Muscle Mass & Hypertrophy)', val: 'WEIGHT_GAIN', desc: 'Progressive strength & muscle building' },
                    { label: '🏋️ Build Strength & Athletic Power', val: 'STRENGTH', desc: 'Heavy resistance & power exercises' },
                    { label: '⚡ General Fitness & Daily Energy', val: 'FITNESS', desc: 'Balanced cardio & endurance' },
                    { label: '🎯 Workout Consistency & Streak', val: 'CONSISTENCY', desc: 'Short low-friction routine builder' },
                    { label: '🧘 Stay Active & Stress Relief', val: 'ACTIVE', desc: 'Mobility, posture & exam decompression' },
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setFitnessGoal(g.val)}
                      className={`w-full p-3 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                        fitnessGoal === g.val
                          ? 'border-brand bg-cyan-950/40 text-brand shadow-brand-glow'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{g.label}</span>
                        <span className="text-[10px] text-slate-500 block">{g.desc}</span>
                      </div>
                      {fitnessGoal === g.val && <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-800 mt-4">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  leftIcon={ArrowLeft}
                  onClick={handlePrevStep}
                  disabled={loading}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  rightIcon={ArrowRight}
                  onClick={handleNextStep}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  rightIcon={ArrowRight}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creating Account & ML Strategy...' : 'Complete Registration'}
                </Button>
              )}
            </div>
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
