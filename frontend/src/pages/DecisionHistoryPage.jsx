import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Sparkles, Filter } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { useApp } from '../context/AppContext';

export const DecisionHistoryPage = () => {
  const { decisions } = useApp();
  const [expandedId, setExpandedId] = useState(decisions[0]?.id || null);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-brand" />
            AI Decision History Timeline
          </h2>
          <p className="text-xs text-slate-400">
            Transparent record explaining why your fitness plan was adapted by FITMINDS.
          </p>
        </div>

        <Badge variant="brand" icon={Sparkles}>
          TRANSPARENT ADAPTATION
        </Badge>
      </div>

      <Alert variant="ai">
        FITMINDS logs every workload adjustment so you can inspect how your context signals shaped your fitness strategy.
      </Alert>

      {/* Timeline List */}
      <div className="relative space-y-4 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
        {decisions.map((dec) => {
          const isExpanded = expandedId === dec.id;
          return (
            <div key={dec.id} className="relative pl-10">
              {/* Timeline Dot */}
              <div className="absolute left-2.5 top-5 w-3 h-3 rounded-full bg-brand ring-4 ring-slate-950 border border-slate-900" />

              <Card
                variant={isExpanded ? 'highlighted' : 'default'}
                className="p-5 transition-all cursor-pointer"
                onClick={() => toggleExpand(dec.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-400">{dec.date}</span>
                      <Badge variant={dec.badgeVariant || 'brand'} size="sm">
                        {dec.badge}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{dec.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      <strong>Reason:</strong> {dec.reason}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(dec.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs animate-in fade-in duration-200">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <strong className="text-brand uppercase text-[10px]">What Changed:</strong>
                      <p className="text-slate-200 mt-0.5">{dec.whatChanged}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <strong className="text-purple-300 uppercase text-[10px]">Why It Changed:</strong>
                      <p className="text-slate-200 mt-0.5">{dec.whyItChanged}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <strong className="text-slate-400 uppercase text-[10px]">Signals Influenced:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {dec.signalsInfluenced.map((sig, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                            {sig}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-emerald-300">
                      <strong className="uppercase text-[10px] text-emerald-400">Observed Outcome:</strong>
                      <p className="mt-0.5">{dec.outcome}</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
