import React, { useState } from 'react';
import { Settings, Bell, Lock, Moon, Sliders, Shield } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const SettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAdaptation, setAutoAdaptation] = useState(true);
  const [privacySharing, setPrivacySharing] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand" />
          Application Settings
        </h2>
        <p className="text-xs text-slate-400">
          Manage your FITMINDS account, adaptation preferences, and notification controls.
        </p>
      </div>

      <div className="space-y-4">
        {/* Adaptive Preferences */}
        <Card variant="default" title="Adaptive Strategy Controls" className="p-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Automated Plan Adaptation</h4>
              <p className="text-[11px] text-slate-400">Allow FITMINDS to dynamically adjust workout duration during high exam load.</p>
            </div>
            <button
              onClick={() => setAutoAdaptation(!autoAdaptation)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${autoAdaptation ? 'bg-brand' : 'bg-slate-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${autoAdaptation ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </Card>

        {/* Notifications */}
        <Card variant="default" title="Notification Preferences" className="p-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Daily Check-in Reminders</h4>
              <p className="text-[11px] text-slate-400">Receive a gentle prompt before your preferred workout window.</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${notificationsEnabled ? 'bg-brand' : 'bg-slate-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </Card>

        {/* Privacy & Appearance */}
        <Card variant="default" title="Privacy & Appearance" className="p-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Anonymized Habit Telemetry</h4>
              <p className="text-[11px] text-slate-400">Help improve FITMINDS completion algorithms with anonymous statistics.</p>
            </div>
            <button
              onClick={() => setPrivacySharing(!privacySharing)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${privacySharing ? 'bg-brand' : 'bg-slate-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${privacySharing ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
