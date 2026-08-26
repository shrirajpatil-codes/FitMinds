import React, { useState } from 'react';
import { User, Mail, Edit3, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { useApp } from '../context/AppContext';

export const ProfilePage = () => {
  const { userProfile, updateProfileData, currentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: userProfile.name || currentUser?.name || 'Alex Rivers',
    age: userProfile.age || 21,
    fitnessExperience: userProfile.fitnessLevel || 'INTERMEDIATE',
    fitnessGoal: userProfile.goal || 'CONSISTENCY',
    availableWorkoutTime: userProfile.availableTimeMinutes || 20,
    preferredWorkoutWindow: userProfile.workoutWindow || 'EVENING',
    equipment: userProfile.equipment || 'BASIC',
    lifestyleLoad: userProfile.lifestyleLoad || 'MODERATE',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    setErrorMsg('');

    const res = await updateProfileData({
      name: formData.name,
      age: parseInt(formData.age, 10) || 21,
      fitnessExperience: formData.fitnessExperience,
      fitnessGoal: formData.fitnessGoal,
      availableWorkoutTime: parseInt(formData.availableWorkoutTime, 10) || 20,
      preferredWorkoutWindow: formData.preferredWorkoutWindow,
      equipment: formData.equipment,
      lifestyleLoad: formData.lifestyleLoad,
    });

    setLoading(false);
    if (res && res.success) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMsg(res?.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {saveSuccess && (
        <Alert variant="success" title="Profile Saved" icon={CheckCircle2}>
          Your profile updates have been safely persisted in PostgreSQL.
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="danger" title="Update Error" icon={AlertCircle}>
          {errorMsg}
        </Alert>
      )}

      {/* Header Profile Card */}
      <Card variant="highlighted" className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Avatar name={formData.name} size="xl" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-slate-100">{formData.name}</h2>
              <Badge variant="ready">ACTIVE STUDENT</Badge>
            </div>
            <p className="text-xs text-slate-400">Computer Science Undergraduate</p>
            <p className="text-xs text-brand font-medium">{currentUser?.email || userProfile.email}</p>
          </div>
          <Button
            variant={isEditing ? 'secondary' : 'outline'}
            size="sm"
            leftIcon={isEditing ? Save : Edit3}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      {/* Profile Form / View */}
      {isEditing ? (
        <Card variant="default" title="Edit Student Profile & Preferences" className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Fitness Experience</label>
                <select
                  value={formData.fitnessExperience}
                  onChange={(e) => setFormData({ ...formData, fitnessExperience: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-brand focus:outline-none"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Primary Goal</label>
                <select
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-brand focus:outline-none"
                >
                  <option value="STRENGTH">STRENGTH</option>
                  <option value="FITNESS">FITNESS</option>
                  <option value="CONSISTENCY">CONSISTENCY</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Available Workout Time (min)</label>
                <input
                  type="number"
                  value={formData.availableWorkoutTime}
                  onChange={(e) => setFormData({ ...formData, availableWorkoutTime: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-brand focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Preferred Workout Window</label>
                <select
                  value={formData.preferredWorkoutWindow}
                  onChange={(e) => setFormData({ ...formData, preferredWorkoutWindow: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-brand focus:outline-none"
                >
                  <option value="MORNING">MORNING</option>
                  <option value="AFTERNOON">AFTERNOON</option>
                  <option value="EVENING">EVENING</option>
                  <option value="FLEXIBLE">FLEXIBLE</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Equipment Access</label>
                <select
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-brand focus:outline-none"
                >
                  <option value="NONE">NONE (Bodyweight only)</option>
                  <option value="BASIC">BASIC (Dumbbells/bands)</option>
                  <option value="GYM">GYM (Full gym access)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Academic / Lifestyle Load</label>
                <select
                  value={formData.lifestyleLoad}
                  onChange={(e) => setFormData({ ...formData, lifestyleLoad: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-brand focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button type="submit" variant="primary" disabled={loading} leftIcon={Save}>
                {loading ? 'Saving to Database...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card variant="default" title="Student Fitness Profile" className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Primary Goal</span>
              <p className="font-semibold text-slate-200">{formData.fitnessGoal}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Fitness Experience</span>
              <p className="font-semibold text-slate-200">{formData.fitnessExperience}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Available Workout Window</span>
              <p className="font-semibold text-slate-200">{formData.availableWorkoutTime} min ({formData.preferredWorkoutWindow})</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Available Equipment</span>
              <p className="font-semibold text-slate-200">{formData.equipment}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Academic Load</span>
              <p className="font-semibold text-slate-200">{formData.lifestyleLoad}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Age</span>
              <p className="font-semibold text-slate-200">{formData.age} years</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Database Storage: <strong className="text-emerald-400">fitminds_db (PostgreSQL)</strong></span>
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Update Preferences
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
