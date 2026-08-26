import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Brain } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { ProgressBar } from '../components/common/ProgressBar';
import { useApp } from '../context/AppContext';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { userProfile, saveOnboardingProfile } = useApp();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: userProfile.name || 'Alex Chen',
    age: userProfile.age || 21,
    fitnessExperience: 'INTERMEDIATE',
    goal: 'WEIGHT_LOSS',
    availableTime: '20',
    preferredWindow: 'EVENING',
    equipment: 'BASIC',
    lifestyleLoad: 'MODERATE',
  });

  const totalSteps = 6;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      // Final Step Submission
      setIsGenerating(true);

      const timeNum = parseInt(formData.availableTime, 10) || 20;

      await saveOnboardingProfile({
        name: formData.name,
        age: parseInt(formData.age, 10) || 21,
        fitnessExperience: formData.fitnessExperience,
        fitnessGoal: formData.goal,
        availableWorkoutTime: timeNum,
        preferredWorkoutWindow: formData.preferredWindow,
        equipment: formData.equipment,
        lifestyleLoad: formData.lifestyleLoad,
        onboardingCompleted: true,
      });

      setTimeout(() => {
        setIsGenerating(false);
        navigate('/dashboard');
      }, 1200);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 mb-6 shadow-ai-glow animate-pulse">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100 mb-2">Saving Strategy to PostgreSQL...</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Calibrating exercise duration, recovery buffers, and schedule friction parameters in your database.
        </p>
        <div className="w-64">
          <ProgressBar value={90} variant="ai" showValue />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand flex items-center justify-center text-slate-950 font-bold shadow-brand-glow">
              <Zap className="w-5 h-5 fill-slate-950 stroke-none" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-slate-100">FITMINDS</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Personalize Your Fitness Strategy</h2>
          <p className="text-xs text-slate-400">Step {step} of {totalSteps} — Help FITMINDS understand your student routine</p>
          <ProgressBar value={(step / totalSteps) * 100} variant="brand" size="sm" />
        </div>

        {/* Wizard Card */}
        <Card variant="default" className="p-6 md:p-8 min-h-[360px] flex flex-col justify-between">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-semibold text-slate-100">Step 1: Basic Profile</h3>
              <Input
                label="Full Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Fitness Experience</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Beginner', val: 'BEGINNER' },
                    { label: 'Intermediate', val: 'INTERMEDIATE' },
                    { label: 'Advanced', val: 'ADVANCED' },
                  ].map(exp => (
                    <button
                      key={exp.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, fitnessExperience: exp.val })}
                      className={`p-3 rounded-xl text-xs font-medium border transition-all ${
                        formData.fitnessExperience === exp.val
                          ? 'border-brand bg-cyan-950/40 text-brand'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-semibold text-slate-100">Step 2: Primary Fitness Goal</h3>
              <div className="space-y-2">
                {[
                  { label: '🔥 Weight Loss (Fat Loss & Toning)', val: 'WEIGHT_LOSS' },
                  { label: '💪 Weight Gain (Muscle & Mass Building)', val: 'WEIGHT_GAIN' },
                  { label: '⚡ Build strength around classes', val: 'STRENGTH' },
                  { label: '📅 Improve workout consistency', val: 'CONSISTENCY' },
                  { label: '🧘 Stay active & relieve stress', val: 'ACTIVE' },
                  { label: '🏃 General fitness & mobility', val: 'FITNESS' },
                ].map(g => (
                  <button
                    key={g.val}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: g.val })}
                    className={`w-full p-3.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      formData.goal === g.val
                        ? 'border-brand bg-cyan-950/40 text-brand'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{g.label}</span>
                    {formData.goal === g.val && <CheckCircle2 className="w-4 h-4 text-brand" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-semibold text-slate-100">Step 3: Available Workout Time</h3>
              <p className="text-xs text-slate-400">How much time can you realistically give to a workout on busy days?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: '10 min', val: '10' },
                  { label: '15 min', val: '15' },
                  { label: '20 min', val: '20' },
                  { label: '30 min', val: '30' },
                  { label: '45+ min', val: '45' },
                ].map(t => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setFormData({ ...formData, availableTime: t.val })}
                    className={`p-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                      formData.availableTime === t.val
                        ? 'border-brand bg-cyan-950/40 text-brand shadow-brand-glow'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-semibold text-slate-100">Step 4: Preferred Workout Window</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Morning', val: 'MORNING' },
                  { label: 'Afternoon', val: 'AFTERNOON' },
                  { label: 'Evening', val: 'EVENING' },
                  { label: 'Flexible', val: 'FLEXIBLE' },
                ].map(w => (
                  <button
                    key={w.val}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredWindow: w.val })}
                    className={`p-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                      formData.preferredWindow === w.val
                        ? 'border-brand bg-cyan-950/40 text-brand'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-semibold text-slate-100">Step 5: Available Equipment</h3>
              <div className="space-y-2">
                {[
                  { label: 'No equipment (Bodyweight only)', val: 'NONE' },
                  { label: 'Basic equipment (Dumbbells, resistance bands)', val: 'BASIC' },
                  { label: 'Full gym access', val: 'GYM' },
                ].map(eq => (
                  <button
                    key={eq.val}
                    type="button"
                    onClick={() => setFormData({ ...formData, equipment: eq.val })}
                    className={`w-full p-3.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      formData.equipment === eq.val
                        ? 'border-brand bg-cyan-950/40 text-brand'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{eq.label}</span>
                    {formData.equipment === eq.val && <CheckCircle2 className="w-4 h-4 text-brand" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-semibold text-slate-100">Step 6: Daily Student Workload</h3>
              <p className="text-xs text-slate-400">How demanding is your typical academic day?</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { level: 'Low', val: 'LOW', desc: 'Light classes' },
                  { level: 'Moderate', val: 'MODERATE', desc: 'Regular lectures' },
                  { level: 'High', val: 'HIGH', desc: 'Exams & labs' }
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setFormData({ ...formData, lifestyleLoad: item.val })}
                    className={`p-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                      formData.lifestyleLoad === item.val
                        ? 'border-brand bg-cyan-950/40 text-brand'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>{item.level}</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={step === 1}
              leftIcon={ArrowLeft}
            >
              Back
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={step === totalSteps ? Sparkles : ArrowRight}
            >
              {step === totalSteps ? 'Save to PostgreSQL Plan' : 'Continue'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
