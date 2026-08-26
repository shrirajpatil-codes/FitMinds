/**
 * FITMINDS Mock Workouts & Exercise Data
 */
export const todayWorkoutPlan = {
  id: 'plan_today_01',
  title: 'Full Body Strength & Mobility',
  category: 'Strength & Core',
  durationMinutes: 20,
  difficulty: 'Adaptive Intermediate',
  targetFocus: 'Lower Body & Core Stability',
  status: 'Ready',
  exercises: [
    {
      id: 'ex_1',
      name: 'Dynamic Bodyweight Squats',
      sets: 3,
      reps: 12,
      restSeconds: 30,
      duration: '4 min',
      instructions: 'Keep your chest tall and lower down with controlled tempo.',
      targetReps: 12,
    },
    {
      id: 'ex_2',
      name: 'Incline Push-Ups',
      sets: 3,
      reps: 10,
      restSeconds: 30,
      duration: '5 min',
      instructions: 'Maintain a rigid core from head to heel.',
      targetReps: 10,
    },
    {
      id: 'ex_3',
      name: 'Alternating Reverse Lunges',
      sets: 3,
      reps: 12,
      restSeconds: 30,
      duration: '5 min',
      instructions: 'Step back with control, keeping front knee aligned over ankle.',
      targetReps: 12,
    },
    {
      id: 'ex_4',
      name: 'Forearm Plank Hold',
      sets: 3,
      reps: '45 sec hold',
      restSeconds: 30,
      duration: '4 min',
      instructions: 'Engage glutes and brace your abdomen throughout the hold.',
      targetReps: 1,
    },
    {
      id: 'ex_5',
      name: 'Cool-down Shoulder & Hip Stretch',
      sets: 1,
      reps: '60 sec per stretch',
      restSeconds: 0,
      duration: '2 min',
      instructions: 'Slow deep breathing to transition to study mode.',
      targetReps: 1,
    }
  ]
};

export const workoutAdjustmentPresets = [
  {
    id: 'adj_time',
    label: 'I have less time',
    description: 'Reduce workout duration from 20 to 12 minutes.',
    reducedDuration: 12,
    actionText: 'Apply 12-Min Express Plan'
  },
  {
    id: 'adj_energy',
    label: 'I\'m low on energy',
    description: 'Switch to mobility and low-impact active recovery.',
    reducedDuration: 15,
    actionText: 'Switch to Low-Impact Recovery'
  },
  {
    id: 'adj_academic',
    label: 'High academic workload today',
    description: 'Shorten session and focus on posture relief.',
    reducedDuration: 15,
    actionText: 'Apply Posture Relief Micro-Plan'
  },
  {
    id: 'adj_keep',
    label: 'Keep current 20-min plan',
    description: 'Proceed with today\'s standard adaptive workout.',
    reducedDuration: 20,
    actionText: 'Keep Current Plan'
  }
];
