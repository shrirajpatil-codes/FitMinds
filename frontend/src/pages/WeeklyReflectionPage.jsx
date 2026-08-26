import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Textarea } from '../components/common/Textarea';
import { Alert } from '../components/common/Alert';

export const WeeklyReflectionPage = () => {
  const navigate = useNavigate();
  const [consistencyRating, setConsistencyRating] = useState('Good');
  const [whatHelped, setWhatHelped] = useState('');
  const [selectedObstacles, setSelectedObstacles] = useState(['Time', 'Academic workload']);
  const [nextWeekPreference, setNextWeekPreference] = useState('Shorter sessions');

  const toggleObstacle = (obs) => {
    if (selectedObstacles.includes(obs)) {
      setSelectedObstacles(selectedObstacles.filter(item => item !== obs));
    } else {
      setSelectedObstacles([...selectedObstacles, obs]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    navigate('/strategy-health');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-2">
          <BookOpen className="w-6 h-6 text-brand" />
          Weekly Student Reflection
        </h2>
        <p className="text-xs text-slate-400">
          How did your week actually go? FITMINDS uses your reflection to refine your workout plan.
        </p>
      </div>

      <Card variant="default" className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Question 1 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              1. How consistent did you feel this week?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Low', 'Okay', 'Good', 'Very good'].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setConsistencyRating(rating)}
                  className={`p-3.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    consistencyRating === rating
                      ? 'border-brand bg-cyan-950/40 text-brand shadow-brand-glow'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2 */}
          <Textarea
            label="2. What made workouts easier for you this week?"
            placeholder="e.g. 20-minute sessions after lectures were easy to start without dread."
            value={whatHelped}
            onChange={e => setWhatHelped(e.target.value)}
            rows={2}
          />

          {/* Question 3 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              3. What got in the way of your workouts?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Time', 'Energy', 'Academic workload', 'Motivation', 'Schedule', 'Other'].map(obs => {
                const isSelected = selectedObstacles.includes(obs);
                return (
                  <button
                    key={obs}
                    type="button"
                    onClick={() => toggleObstacle(obs)}
                    className={`p-3 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-brand bg-cyan-950/40 text-brand'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{obs}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 4 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              4. What should FITMINDS change next week?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Keep similar (20-min routine working well)',
                'Shorter sessions during exam week',
                'More flexible schedule windows',
                'More challenging strength work',
                'More recovery & stretch sessions'
              ].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setNextWeekPreference(opt)}
                  className={`p-3 rounded-xl text-xs font-medium border text-left transition-all ${
                    nextWeekPreference === opt
                      ? 'border-brand bg-cyan-950/40 text-brand'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <Alert variant="ai">
            FITMINDS will update your strategy health metrics and adjust next week's plan based on your responses.
          </Alert>

          <Button type="submit" variant="primary" fullWidth size="lg" rightIcon={ArrowRight}>
            Save Reflection & Update Strategy
          </Button>
        </form>
      </Card>
    </div>
  );
};
