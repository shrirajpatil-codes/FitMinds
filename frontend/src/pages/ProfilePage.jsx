import React, { useState, useEffect } from 'react';
import { User, Mail, Edit3, Save, CheckCircle2, AlertCircle, Scale, Ruler, Activity, Target } from 'lucide-react';
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
    name: userProfile.name || currentUser?.name || 'Student User',
    age: userProfile.age || 21,
    heightCm: userProfile.heightCm || 175,
    weightKg: userProfile.weightKg || 70,
    targetWeightKg: userProfile.targetWeightKg || 65,
    fitnessExperience: userProfile.fitnessLevel || 'INTERMEDIATE',
    fitnessGoal: userProfile.goal || 'WEIGHT_LOSS',
    availableWorkoutTime: userProfile.availableTimeMinutes || 20,
    preferredWorkoutWindow: userProfile.workoutWindow || 'EVENING',
    equipment: userProfile.equipment || 'BASIC',
    lifestyleLoad: userProfile.lifestyleLoad || 'MODERATE',
  });

  useEffect(() => {
    setFormData({
      name: userProfile.name || currentUser?.name || 'Student User',
      age: userProfile.age || 21,
      heightCm: userProfile.heightCm || 175,
      weightKg: userProfile.weightKg || 70,
      targetWeightKg: userProfile.targetWeightKg || 65,
      fitnessExperience: userProfile.fitnessLevel || 'INTERMEDIATE',
      fitnessGoal: userProfile.goal || 'WEIGHT_LOSS',
      availableWorkoutTime: userProfile.availableTimeMinutes || 20,
      preferredWorkoutWindow: userProfile.workoutWindow || 'EVENING',
      equipment: userProfile.equipment || 'BASIC',
      lifestyleLoad: userProfile.lifestyleLoad || 'MODERATE',
    });
  }, [userProfile, currentUser]);

  // Compute live BMI & Category preview
  const hM = parseFloat(formData.heightCm) / 100.0;
  const wKg = parseFloat(formData.weightKg);
  const liveBmi = (hM > 0 && wKg > 0) ? (wKg / (hM * hM)).toFixed(1) : userProfile.bmi || null;

  let bmiCat = userProfile.bmiCategory || 'Normal weight';
  let catColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (liveBmi) {
    const val = parseFloat(liveBmi);
    if (val < 18.5) {
      bmiCat = 'Underweight';
      catColor = 'text-sky-400 border-sky-500/30 bg-sky-500/10';
    } else if (val >= 18.5 && val < 25.0) {
      bmiCat = 'Normal weight';
      catColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    } else if (val >= 25.0 && val < 30.0) {
      bmiCat = 'Overweight';
      catColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    } else {
      bmiCat = 'Obese';
      catColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    }
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    setErrorMsg('');

    try {
      await updateProfileData({
        name: formData.name,
        age: parseInt(formData.age, 10) || 21,
        heightCm: parseFloat(formData.heightCm),
        weightKg: parseFloat(formData.weightKg),
        targetWeightKg: parseFloat(formData.targetWeightKg),
        fitnessLevel: formData.fitnessExperience,
        goal: formData.fitnessGoal,
        availableTimeMinutes: parseInt(formData.availableWorkoutTime, 10) || 20,
        workoutWindow: formData.preferredWorkoutWindow,
        equipment: formData.equipment,
        lifestyleLoad: formData.lifestyleLoad,
      });

      setLoading(false);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {saveSuccess && (
        <Alert variant="success" title="Profile & BMI Metrics Updated" icon={CheckCircle2}>
          Your body measurements and profile updates have been saved to PostgreSQL. FITMINDS ML Workout Engine has updated your recommendations!
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
            <p className="text-xs text-slate-400">FITMINDS Registered Student Profile</p>
            <p className="text-xs text-brand font-medium">{currentUser?.email || userProfile.email}</p>
          </div>
          <Button
            variant={isEditing ? 'secondary' : 'outline'}
            size="sm"
            leftIcon={isEditing ? Save : Edit3}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile & Body Metrics'}
          </Button>
        </div>

        {/* Live BMI Highlight Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Height</span>
            <span className="font-bold text-slate-100 text-sm">{formData.heightCm} cm</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Current Weight</span>
            <span className="font-bold text-slate-100 text-sm">{formData.weightKg} kg</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Target Weight</span>
            <span className="font-bold text-indigo-400 text-sm">{formData.targetWeightKg} kg</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">BMI Score</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-slate-100 text-sm">{liveBmi || 22.8}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${catColor}`}>
                {bmiCat}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Form / View */}
      {isEditing ? (
        <Card variant="default" title="Edit Body Metrics & Student Profile" className="p-6">
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

            {/* Body Metrics Section */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                Body Measurements & BMI Calculator
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Height (cm)"
                  type="number"
                  placeholder="175"
                  leftIcon={Ruler}
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  required
                />

                <Input
                  label="Current Weight (kg)"
                  type="number"
                  placeholder="70"
                  leftIcon={Scale}
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  required
                />

                <Input
                  label="Target Weight (kg)"
                  type="number"
                  placeholder="65"
                  leftIcon={Target}
                  value={formData.targetWeightKg}
                  onChange={(e) => setFormData({ ...formData, targetWeightKg: e.target.value })}
                />
              </div>

              {liveBmi && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Auto Calculated BMI: <strong>{liveBmi} kg/m²</strong></span>
                  <span className={`px-2 py-0.5 rounded font-bold border ${catColor}`}>{bmiCat}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Primary Goal</label>
                <select
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-brand focus:outline-none"
                >
                  <option value="WEIGHT_LOSS">WEIGHT LOSS (Fat Loss & Lean Tone)</option>
                  <option value="WEIGHT_GAIN">WEIGHT GAIN (Muscle Hypertrophy)</option>
                  <option value="STRENGTH">BUILD STRENGTH</option>
                  <option value="CONSISTENCY">CONSISTENCY</option>
                  <option value="ACTIVE">STAY ACTIVE</option>
                  <option value="FITNESS">GENERAL FITNESS</option>
                </select>
              </div>

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
                {loading ? 'Saving Body Metrics...' : 'Save & Update ML Engine'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card variant="default" title="Student Fitness & Body Metrics Profile" className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Primary Goal</span>
              <p className="font-semibold text-slate-200">{formData.fitnessGoal.replace('_', ' ')}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Calculated BMI & Category</span>
              <p className="font-semibold text-slate-200">{liveBmi || 22.8} kg/m² ({bmiCat})</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Height / Weight</span>
              <p className="font-semibold text-slate-200">{formData.heightCm} cm / {formData.weightKg} kg (Target: {formData.targetWeightKg} kg)</p>
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
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Database Storage: <strong className="text-emerald-400">fitminds_db (PostgreSQL)</strong></span>
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit Body Metrics & Goal
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
