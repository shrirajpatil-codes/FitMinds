const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FITMINDS Database Seeding...');

  // 1. Clean existing demo data safely
  await prisma.experiment.deleteMany({});
  await prisma.decisionRecord.deleteMany({});
  await prisma.strategySnapshot.deleteMany({});
  await prisma.weeklyReflection.deleteMany({});
  await prisma.workoutSession.deleteMany({});
  await prisma.workoutPlan.deleteMany({});
  await prisma.dailyCheckIn.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Demo User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Rivers',
      email: 'alex@fitminds.app',
      passwordHash,
      profile: {
        create: {
          age: 21,
          fitnessExperience: 'INTERMEDIATE',
          fitnessGoal: 'CONSISTENCY',
          availableWorkoutTime: 20,
          preferredWorkoutWindow: 'EVENING',
          equipment: 'BASIC',
          lifestyleLoad: 'HIGH',
          onboardingCompleted: true,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log(`✅ Demo User created: ${demoUser.email} (ID: ${demoUser.id})`);

  // 3. Create Daily Check-Ins
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const today = new Date();

  await prisma.dailyCheckIn.createMany({
    data: [
      {
        userId: demoUser.id,
        date: twoDaysAgo,
        energyLevel: 4,
        readinessLevel: 4,
        availableTimeMinutes: 30,
        academicLoad: 'MODERATE',
        note: 'Felt energetic after morning lecture.',
      },
      {
        userId: demoUser.id,
        date: yesterday,
        energyLevel: 2,
        readinessLevel: 3,
        availableTimeMinutes: 15,
        academicLoad: 'HIGH',
        note: 'Late night study session, compressed workout window.',
      },
      {
        userId: demoUser.id,
        date: today,
        energyLevel: 3,
        readinessLevel: 4,
        availableTimeMinutes: 20,
        academicLoad: 'HIGH',
        note: 'Preparing for midterm exam, focus on micro-session.',
      },
    ],
  });

  console.log('✅ Daily Check-ins created.');

  // 4. Create Workout Plans
  const workoutPlan1 = await prisma.workoutPlan.create({
    data: {
      userId: demoUser.id,
      date: today,
      title: "Adaptive Upper Body & Core Micro-Session",
      durationMinutes: 20,
      difficulty: "Moderate",
      goal: "Upper Body Strength & Posture",
      status: "PLANNED",
      source: "ADAPTED",
      exercises: [
        {
          id: "ex_1",
          name: "Push-ups",
          sets: 3,
          reps: 15,
          targetMuscle: "Chest & Triceps",
          restSeconds: 45,
          completed: false,
        },
        {
          id: "ex_2",
          name: "Dumbbell Rows",
          sets: 3,
          reps: 12,
          targetMuscle: "Upper Back",
          restSeconds: 45,
          completed: false,
        },
        {
          id: "ex_3",
          name: "Plank Hold",
          sets: 3,
          reps: 45,
          targetMuscle: "Core",
          restSeconds: 30,
          completed: false,
        },
      ],
    },
  });

  const workoutPlan2 = await prisma.workoutPlan.create({
    data: {
      userId: demoUser.id,
      date: yesterday,
      title: "Express Core & Bodyweight Reset",
      durationMinutes: 15,
      difficulty: "Light",
      goal: "Active Recovery",
      status: "COMPLETED",
      source: "ADAPTED",
      exercises: [
        {
          id: "ex_10",
          name: "Bodyweight Squats",
          sets: 3,
          reps: 20,
          targetMuscle: "Quads & Glutes",
          restSeconds: 30,
          completed: true,
        },
        {
          id: "ex_11",
          name: "Mountain Climbers",
          sets: 3,
          reps: 30,
          targetMuscle: "Core & Cardio",
          restSeconds: 30,
          completed: true,
        },
      ],
    },
  });

  console.log('✅ Workout Plans created.');

  // 5. Create Workout Sessions
  await prisma.workoutSession.create({
    data: {
      userId: demoUser.id,
      workoutId: workoutPlan2.id,
      startedAt: yesterday,
      completedAt: new Date(yesterday.getTime() + 15 * 60 * 1000),
      actualDurationMinutes: 14,
      exercisesCompleted: 2,
      setsCompleted: 6,
      repsCompleted: 150,
      completionPercentage: 100.0,
      status: 'COMPLETED',
      userFeedback: 'GOOD',
      notes: 'Quick session between classes, felt renewed energy.',
    },
  });

  console.log('✅ Workout Sessions created.');

  // 6. Create Decision Records
  await prisma.decisionRecord.createMany({
    data: [
      {
        userId: demoUser.id,
        workoutId: workoutPlan1.id,
        date: today,
        decisionType: 'DURATION_ADAPTATION',
        previousValue: '35 minutes',
        newValue: '20 minutes',
        reason: 'High academic workload & moderate energy level reported.',
        signals: ['Academic Load: HIGH', 'Available Time: 20 min', 'Energy: 3/5'],
        outcome: 'Plan updated to micro-session preserving consistency.',
      },
      {
        userId: demoUser.id,
        workoutId: workoutPlan2.id,
        date: yesterday,
        decisionType: 'EXPRESS_PRESET_APPLIED',
        previousValue: '30 minutes',
        newValue: '15 minutes',
        reason: 'User selected express preset due to study deadline.',
        signals: ['Manual user override: Express 15-min'],
        outcome: 'Successfully completed 100% of adjusted exercises.',
      },
    ],
  });

  console.log('✅ Decision Records created.');

  // 7. Create Strategy Snapshots
  await prisma.strategySnapshot.create({
    data: {
      userId: demoUser.id,
      periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      periodEnd: today,
      completionRate: 85.7,
      modificationRate: 28.5,
      skipRate: 0.0,
      averageDuration: 18.5,
      status: 'HEALTHY',
    },
  });

  console.log('✅ Strategy Snapshot created.');

  // 8. Create Weekly Reflections
  const lastMonday = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await prisma.weeklyReflection.create({
    data: {
      userId: demoUser.id,
      weekStart: lastMonday,
      consistencyRating: 4,
      easierFactors: 'Adaptive 20-minute windows prevented missed workouts during exam week.',
      difficultyFactors: 'Late night study sessions reduced sleep quality on Tuesdays.',
      desiredStrategyChange: 'Keep sessions under 25 minutes during heavy assignment weeks.',
      note: 'Felt much less guilty about short workouts since they keep my streak intact.',
    },
  });

  console.log('✅ Weekly Reflection created.');

  // 9. Create Experiments
  await prisma.experiment.create({
    data: {
      userId: demoUser.id,
      name: 'Evening Micro-Sessions vs Morning Workouts',
      description: 'Comparing consistency when scheduling 20-min sessions at 6 PM vs 7 AM during exam periods.',
      hypothesis: 'Evening sessions will have higher completion rates due to flexible post-study energy recovery.',
      baselineStrategy: 'Morning 30-min fixed sessions',
      testStrategy: 'Evening 20-min adaptive micro-sessions',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      metrics: {
        completionRate: 90,
        perceivedStressRatio: 0.3,
      },
      outcome: 'Ongoing - early data shows 100% completion in evening window.',
    },
  });

  console.log('✅ Experiment created.');
  console.log('🎉 FITMINDS Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
