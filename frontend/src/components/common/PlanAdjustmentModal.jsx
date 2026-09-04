import React, { useState } from 'react';
import { Clock, BatteryLow, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { workoutAdjustmentPresets } from '../../data/workouts';
import { useApp } from '../../context/AppContext';

export const PlanAdjustmentModal = ({ isOpen, onClose }) => {
  const { currentPlan, applyPlanAdjustment } = useApp();
  const [selectedPreset, setSelectedPreset] = useState(workoutAdjustmentPresets[0]);

  const handleApply = () => {
    applyPlanAdjustment(selectedPreset);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Today's Plan"
      description="FitMirror AI adapts your workout workload to fit your immediate real-life constraints."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Keep Current Plan
          </Button>
          <Button variant="primary" onClick={handleApply}>
            {selectedPreset.actionText}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Preset Selector List */}
        <div className="space-y-2">
          {workoutAdjustmentPresets.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-brand bg-cyan-950/30 shadow-brand-glow'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand/20 text-brand' : 'bg-slate-800 text-slate-400'}`}>
                    {preset.id === 'adj_time' ? <Clock className="w-4 h-4" /> : <BatteryLow className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{preset.label}</h4>
                    <p className="text-xs text-slate-400">{preset.description}</p>
                  </div>
                </div>

                {isSelected && <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* FITMIRROR AI Preview Response */}
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-purple-300 uppercase tracking-wide text-[10px]">
              FitMirror AI Adaptive Response Preview
            </span>
            <p className="text-slate-200 leading-relaxed">
              "Reduce today's session from {currentPlan.durationMinutes} minutes to {selectedPreset.reducedDuration} minutes? Exercise reps will be recalibrated to prioritize posture & core stability."
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
