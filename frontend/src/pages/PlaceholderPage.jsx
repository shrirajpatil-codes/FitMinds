import React from 'react';
import { Layers, Clock, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { StatCard } from '../components/common/StatCard';

export const PlaceholderPage = ({ title = 'Page Title', step = '3' }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <Alert variant="ai" title={`${title} Foundation Ready`}>
        FITMINDS frontend design system is initialized. Full interactive features for {title} will be connected in Step {step}.
      </Alert>

      {/* KPI Stat Cards Demonstration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Adaptive Status"
          value="System Ready"
          icon={Sparkles}
          subtitle="Design token system loaded"
          variant="highlighted"
        />
        <StatCard
          label="Next Milestones"
          value={`Step ${step}`}
          icon={Clock}
          subtitle="Feature implementation"
          change="On Track"
          changeType="positive"
        />
        <StatCard
          label="UI Foundation"
          value="100%"
          icon={Layers}
          subtitle="Design tokens & components"
        />
      </div>

      {/* Main Placeholder Container */}
      <Card variant="default" className="min-h-[300px] flex flex-col items-center justify-center text-center p-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-brand mb-4 border border-slate-700">
          <Layers className="w-6 h-6" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold text-slate-100">{title}</h2>
          <Badge variant="brand">STEP {step} PLACEHOLDER</Badge>
        </div>

        <p className="text-sm text-slate-400 max-w-md">
          {title} UI layout and logic will be implemented progressively in Step {step}.
        </p>
      </Card>
    </div>
  );
};
