/**
 * FitMirror AI Mock Workouts & Exercise Data
 */

export const compulsoryBicepExercise = {
  id: 'ex_bicep_compulsory',
  name: 'Dumbbell Bicep Curls',
  sets: 3,
  reps: 12,
  restSeconds: 30,
  duration: '4 min',
  instructions: 'Keep elbows pinned to your sides, curl weights upward with controlled squeeze.',
  targetReps: 12,
  isCompulsory: true
};

export const todayWorkoutPlan = {
  id: 'plan_today_01',
  title: 'Full Body Strength & Mobility',
  category: 'Strength & Core',
  durationMinutes: 20,
  difficulty: 'Adaptive Intermediate',
  targetFocus: 'Bicep Hypertrophy & Full Body Balance',
  status: 'Ready',
  exercises: [
    compulsoryBicepExercise,
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
      name: 'Dumbbell Bent-Over Rows',
      sets: 3,
      reps: 12,
      restSeconds: 30,
      duration: '4 min',
      instructions: 'Hinge at hips with neutral spine and pull dumbbells to waist.',
      targetReps: 12,
    },
    {
      id: 'ex_4',
      name: 'Forearm Plank Hold',
      sets: 3,
      reps: '45 sec hold',
      restSeconds: 30,
      duration: '3 min',
      instructions: 'Engage glutes and brace your abdomen throughout the hold.',
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
    title: 'Express 12-Min Burn',
    targetFocus: 'Arm & Core High-Efficiency',
    actionText: 'Apply 12-Min Express Plan',
    exercises: [
      { ...compulsoryBicepExercise, sets: 3, reps: 10, targetReps: 10 },
      {
        id: 'ex_express_squat',
        name: 'Dynamic Bodyweight Squats',
        sets: 2,
        reps: 10,
        restSeconds: 25,
        duration: '4 min',
        instructions: 'Keep your chest tall and lower down with controlled tempo.',
        targetReps: 10,
      },
      {
        id: 'ex_express_plank',
        name: 'Forearm Plank Hold',
        sets: 2,
        reps: '30 sec hold',
        restSeconds: 20,
        duration: '3 min',
        instructions: 'Engage glutes and brace your abdomen throughout the hold.',
        targetReps: 1,
      }
    ]
  },
  {
    id: 'adj_energy',
    label: "I'm low on energy",
    description: 'Switch to mobility and low-impact active recovery.',
    reducedDuration: 15,
    title: 'Active Mobility & Low-Impact Recovery',
    targetFocus: 'Light Bicep Form & Gentle Joint Mobility',
    actionText: 'Switch to Low-Impact Recovery',
    exercises: [
      { ...compulsoryBicepExercise, sets: 2, reps: 10, targetReps: 10, instructions: 'Light weight or slow tempo bicep curls focusing on form precision.' },
      {
        id: 'ex_recovery_squat',
        name: 'Standing Bodyweight Squats (Controlled)',
        sets: 2,
        reps: 8,
        restSeconds: 40,
        duration: '5 min',
        instructions: 'Slow controlled squats at easy depth.',
        targetReps: 8,
      },
      {
        id: 'ex_recovery_stretch',
        name: 'Cool-down Shoulder & Spinal Mobility Stretch',
        sets: 2,
        reps: '45 sec hold',
        restSeconds: 20,
        duration: '4 min',
        instructions: 'Gentle spinal twists and chest opening stretch.',
        targetReps: 1,
      }
    ]
  },
  {
    id: 'adj_academic',
    label: 'High academic workload today',
    description: 'Shorten session and focus on upper body posture relief.',
    reducedDuration: 15,
    title: 'Upper Body & Posture Relief Micro-Plan',
    targetFocus: 'Desk Fatigue & Bicep/Back Realignment',
    actionText: 'Apply Posture Relief Micro-Plan',
    exercises: [
      compulsoryBicepExercise,
      {
        id: 'ex_academic_pushup',
        name: 'Incline Push-Ups',
        sets: 3,
        reps: 8,
        restSeconds: 30,
        duration: '4 min',
        instructions: 'Decompress shoulders and engage chest.',
        targetReps: 8,
      },
      {
        id: 'ex_academic_row',
        name: 'Dumbbell Bent-Over Rows',
        sets: 3,
        reps: 10,
        restSeconds: 30,
        duration: '4 min',
        instructions: 'Squeeze shoulder blades to reverse desk hunch.',
        targetReps: 10,
      }
    ]
  },
  {
    id: 'adj_keep',
    label: 'Keep current 20-min plan',
    description: 'Proceed with today\'s standard adaptive workout.',
    reducedDuration: 20,
    title: 'Full Body Strength & Mobility',
    targetFocus: 'Bicep Hypertrophy & Full Body Balance',
    actionText: 'Keep Current Plan',
    exercises: todayWorkoutPlan.exercises
  }
];
