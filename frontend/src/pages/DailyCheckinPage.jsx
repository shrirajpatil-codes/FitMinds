import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Textarea } from '../components/common/Textarea';
import { Alert } from '../components/common/Alert';
import { useApp } from '../context/AppContext';

export const DailyCheckinPage = () => {
  const navigate = useNavigate();
  const { dailyContext, updateDailyCheckin } = useApp();
  const [isAdapting, setIsAdapting] = useState(false);

  const [energy, setEnergy] = useState(dailyContext.energyLevel || 'Good');
  const [readiness, setReadiness] = useState(dailyContext.readiness || 'READY');
  const [availableTime, setAvailableTime] = useState(dailyContext.availableTimeMinutes || 20);
  const [academicLoad, setAcademicLoad] = useState(dailyContext.academicLoad || 'Moderate');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsAdapting(true);

    updateDailyCheckin({
      energy,
      readiness,
      availableTime,
      academicLoad,
      notes
    });

    setTimeout(() => {
      setIsAdapting(false);
      navigate('/today');
    }, 1200);
  };

  if (isAdapting) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-brand/20 border border-brand text-brand flex items-center justify-center animate-spin">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">FITMINDS is adapting today's plan...</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Recalibrating workout duration and volume to match your {energy.toLowerCase()} energy and {availableTime}-min window.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-brand" />
          Daily Context Check-in
        </h2>
        <p className="text-xs text-slate-400">
          Tell FITMINDS about your available time and energy today so your plan adapts automatically.
        </p>
      </div>

      <Card variant="default" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Energy Rating */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              1. Energy Level Today
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Okay', 'Good', 'High'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setEnergy(opt)}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all ${
                    energy === opt
                      ? 'border-brand bg-cyan-950/40 text-brand shadow-brand-glow'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Readiness State */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              2. Workout Readiness State
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { state: 'Low', label: 'Fatigued / Rest Needed' },
                { state: 'Moderate', label: 'Moderate Energy' },
                { state: 'READY', label: 'Fully Ready' }
              ].map(opt => (
                <button
                  key={opt.state}
                  type="button"
                  onClick={() => setReadiness(opt.state)}
                  className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                    readiness === opt.state
                      ? 'border-brand bg-cyan-950/40 text-brand'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>{opt.state}</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Available Time */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              3. Available Time Today
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[10, 15, 20, 30, 45].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAvailableTime(t)}
                  className={`p-3 rounded-xl text-xs font-bold border text-center transition-all ${
                    availableTime === t
                      ? 'border-brand bg-cyan-950/40 text-brand'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>

          {/* Academic Load */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              4. Today's Academic / Daily Load
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Moderate', 'High'].map(load => (
                <button
                  key={load}
                  type="button"
                  onClick={() => setAcademicLoad(load)}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all ${
                    academicLoad === load
                      ? 'border-brand bg-cyan-950/40 text-brand'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {load} Load
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <Textarea
            label="Anything affecting today's workout? (Optional)"
            placeholder="e.g. Midterm exam tonight at 7 PM, sore shoulders, etc."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />

          <Alert variant="ai">
            FITMINDS will use these signals to adjust exercise count and volume without interrupting your weekly consistency streak.
          </Alert>

          <Button type="submit" variant="primary" fullWidth rightIcon={ArrowRight} size="lg">
            Update My Plan
          </Button>
        </form>
      </Card>
    </div>
  );
};
