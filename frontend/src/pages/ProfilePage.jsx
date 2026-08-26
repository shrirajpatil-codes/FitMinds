import React from 'react';
import { User, Mail, Calendar, Clock, Dumbbell, ShieldCheck, Edit3 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { useApp } from '../context/AppContext';

export const ProfilePage = () => {
  const { userProfile } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <Card variant="highlighted" className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Avatar name={userProfile.name} size="xl" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-slate-100">{userProfile.name}</h2>
              <Badge variant="ready">ACTIVE STUDENT</Badge>
            </div>
            <p className="text-xs text-slate-400">{userProfile.role}</p>
            <p className="text-xs text-brand font-medium">{userProfile.email}</p>
          </div>
          <Button variant="outline" size="sm" leftIcon={Edit3}>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Fitness Preferences Breakdown */}
      <Card variant="default" title="Student Fitness Profile" className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Primary Goal</span>
            <p className="font-semibold text-slate-200">{userProfile.goal}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Fitness Experience</span>
            <p className="font-semibold text-slate-200">{userProfile.fitnessLevel}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Available Workout Window</span>
            <p className="font-semibold text-slate-200">{userProfile.availableTime} ({userProfile.preferredWindow})</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Available Equipment</span>
            <p className="font-semibold text-slate-200">{userProfile.equipment}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Onboarding Status: <strong className="text-emerald-400">Completed</strong></span>
          <Button variant="secondary" size="sm">
            Update Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
};
