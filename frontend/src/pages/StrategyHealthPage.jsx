import React from 'react';
import { Activity, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Alert } from '../components/common/Alert';
import { useApp } from '../context/AppContext';

export const StrategyHealthPage = () => {
  const navigate = useNavigate();
  const { strategyHealth } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <Card variant="highlighted" className="p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="healthy" icon={Activity}>
                STRATEGY HEALTH STATUS
              </Badge>
              <Badge variant="brand">{strategyHealth.status}</Badge>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100">{strategyHealth.headline}</h2>
            <p className="text-xs text-slate-400 max-w-xl">{strategyHealth.detail}</p>
          </div>

          <Button
            variant="primary"
            rightIcon={ArrowRight}
            onClick={() => navigate('/decision-history')}
          >
            View Decision History
          </Button>
        </div>
      </Card>

      {/* Signals Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Monitored Strategy Signals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategyHealth.signals.map(sig => (
            <StatCard
              key={sig.label}
              label={sig.label}
              value={sig.value}
              subtitle={sig.detail}
              icon={CheckCircle2}
              change={sig.status}
              changeType="positive"
            />
          ))}
        </div>
      </div>

      {/* Upcoming Adaptations Section */}
      <Card variant="aiInsight" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="ai" icon={Sparkles}>
            WHAT COULD CHANGE NEXT?
          </Badge>
          <span className="text-xs text-purple-300">Predictive Workload Adjustment</span>
        </div>

        <div className="space-y-2">
          {strategyHealth.upcomingAdaptations.map((note, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/60 text-xs text-purple-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Non-medical Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Note:</strong> Strategy Health measures behavioural consistency and workload friction. It does not provide medical or clinical diagnostics.
        </span>
      </div>
    </div>
  );
};
