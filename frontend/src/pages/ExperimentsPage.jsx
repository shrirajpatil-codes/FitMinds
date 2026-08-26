import React, { useState } from 'react';
import { FlaskConical, Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { activeExperiments, pastExperiments } from '../data/experiments';

export const ExperimentsPage = () => {
  const [experimentsList, setExperimentsList] = useState(activeExperiments);

  const handleEndExperiment = (id) => {
    setExperimentsList(prev => prev.map(exp => exp.id === id ? { ...exp, status: 'COMPLETED', badgeVariant: 'healthy' } : exp));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="brand" icon={FlaskConical}>
            BEHAVIOURAL EXPERIMENTAL ENGINE
          </Badge>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100">Fitness Strategy Experiments</h2>
        <p className="text-xs text-slate-400">
          FITMINDS tests micro-adjustments in session length and timing to discover what yields your highest consistency.
        </p>
      </div>

      <Alert variant="ai">
        "FITMINDS can try small changes to understand what works better for your student schedule."
      </Alert>

      {/* Active Experiments */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Experiment</h3>

        {experimentsList.map(exp => (
          <Card key={exp.id} variant="aiInsight" className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">{exp.title}</h4>
                  <span className="text-xs text-purple-300 font-mono">Duration: {exp.durationDays} days ({exp.startDate})</span>
                </div>
              </div>

              <Badge variant={exp.badgeVariant}>{exp.status}</Badge>
            </div>

            {/* Strategy Comparison Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 font-medium">BASELINE STRATEGY</span>
                <p className="font-semibold text-slate-300 mt-1">{exp.currentStrategy}</p>
              </div>

              <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-900/60">
                <span className="text-purple-400 font-medium">EXPERIMENTAL STRATEGY</span>
                <p className="font-semibold text-purple-200 mt-1">{exp.testStrategy}</p>
              </div>
            </div>

            {/* Rationale */}
            <div className="text-xs text-slate-300">
              <strong className="text-purple-300">Why this experiment?</strong> "{exp.reason}"
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-center">
              <div>
                <span className="text-slate-400">Completion</span>
                <p className="font-bold text-emerald-400 mt-0.5">{exp.metrics.completionRate}</p>
              </div>
              <div>
                <span className="text-slate-400">Exertion</span>
                <p className="font-bold text-brand mt-0.5">{exp.metrics.perceivedExertion}</p>
              </div>
              <div>
                <span className="text-slate-400">Schedule Fit</span>
                <p className="font-bold text-purple-300 mt-0.5">{exp.metrics.scheduleFitScore}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {exp.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={XCircle}
                  onClick={() => handleEndExperiment(exp.id)}
                >
                  End Experiment
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                rightIcon={ArrowRight}
              >
                View Experiment Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Completed Experiments */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Past Adopted Experiments</h3>
        {pastExperiments.map(exp => (
          <Card key={exp.id} variant="default" className="p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-200">{exp.title}</h4>
                <p className="text-slate-400 mt-0.5">{exp.outcome}</p>
              </div>
            </div>
            <Badge variant="healthy">{exp.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
};
