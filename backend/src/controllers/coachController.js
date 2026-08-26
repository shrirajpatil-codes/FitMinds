const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

async function getCoachContext(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    const recentCheckins = await prisma.dailyCheckIn.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentWorkouts = await prisma.workoutPlan.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentSessions = await prisma.workoutSession.findMany({
      where: { userId: req.userId },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    const recentDecisions = await prisma.decisionRecord.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return successResponse(res, {
      user,
      profile,
      recentCheckins,
      recentWorkouts,
      recentSessions,
      recentDecisions,
      coachStatus: "AI Coach context prepared and ready.",
    });
  } catch (error) {
    next(error);
  }
}

async function askCoach(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return errorResponse(res, 'Question message is required', 400);
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true },
    });

    const goal = profile?.fitnessGoal || 'FITNESS';
    const experience = profile?.fitnessExperience || 'BEGINNER';
    const availableTime = profile?.availableWorkoutTime || 20;
    const load = profile?.lifestyleLoad || 'MODERATE';
    const name = user?.name || 'Student';

    const qLower = message.toLowerCase();
    let reply = '';

    if (qLower.includes('weight gain') || qLower.includes('gain weight') || qLower.includes('muscle mass') || qLower.includes('bulk')) {
      reply = `Hey ${name}! Here is your personalized Weight Gain & Muscle Building strategy:
1️⃣ Caloric Surplus: Consume 300–500 calories above your maintenance level. Focus on nutrient-dense foods (eggs, oats, milk, paneer/chicken, peanut butter, and rice).
2️⃣ Progressive Hypertrophy: Aim for 8–12 reps per set with progressive weight or resistance.
3️⃣ Workout Schedule: Stick to your ${availableTime}-minute workout sessions 4–5 days a week.
4️⃣ Student Recovery: Sleep 7–8 hours to allow muscle growth and prevent mental exhaustion during classes.`;
    } else if (qLower.includes('weight loss') || qLower.includes('fat loss') || qLower.includes('lose weight') || qLower.includes('slim') || qLower.includes('diet')) {
      reply = `Hey ${name}! Here is your personalized Weight Loss & Fat Burning protocol:
1️⃣ Caloric Deficit: Maintain a moderate 300–400 kcal deficit while keeping protein high (1.6g per kg of body weight) to retain lean muscle.
2️⃣ High-Intensity Circuits: Perform bodyweight or dumbbell circuits during your ${availableTime}-minute workout sessions.
3️⃣ Daily Steps: Aim for 8,000–10,000 steps daily walking around campus.
4️⃣ Hydration & Stress: Drink 3L of water daily and manage exam stress to keep cortisol levels low.`;
    } else if (qLower.includes('exam') || qLower.includes('busy') || qLower.includes('study') || qLower.includes('test') || qLower.includes('schedule') || qLower.includes('time')) {
      reply = `Hey ${name}! When academic workload is high (${load}):
1️⃣ Express Micro-Workouts: Don't drop workouts completely—do a 10–15 minute quick session to boost blood flow to your brain.
2️⃣ Active Stress Relief: A brief workout improves study focus and reduces exam anxiety.
3️⃣ Flexible Window: Use your preferred ${profile?.preferredWorkoutWindow || 'flexible'} window whenever you get a break between study blocks.`;
    } else if (qLower.includes('pain') || qLower.includes('hurt') || qLower.includes('knee') || qLower.includes('sore') || qLower.includes('injury')) {
      reply = `Hey ${name}! Safety and injury prevention are top priority:
1️⃣ Deload: Reduce intensity or take 1–2 rest days.
2️⃣ Warm-Up: Spend 3–5 minutes doing dynamic warm-ups and mobility movements before lifting.
3️⃣ Check Form: Slow down control on rep lowering. If pain persists, consult a qualified healthcare provider.`;
    } else if (qLower.includes('diet') || qLower.includes('protein') || qLower.includes('food') || qLower.includes('nutrition') || qLower.includes('eat')) {
      reply = `Hey ${name}! Quick Student Nutrition Guidelines for your goal (${goal}):
• Protein: 1.4–1.8g per kg bodyweight (eggs, dal, paneer, soy, whey, chicken).
• Pre-Workout: A banana or toast 30 minutes before your ${availableTime}-minute session.
• Post-Workout: Hydrate and eat a balanced meal containing protein and complex carbs within 1-2 hours.`;
    } else {
      reply = `Hey ${name}! Based on your student profile (Goal: ${goal}, Experience: ${experience}, Workload: ${load}):
• Recommended Session Length: ${availableTime} minutes.
• Strategy Advice: Focus on consistency over perfection! Even short sessions on busy class days build long-term momentum.
Feel free to ask me anything about weight loss/gain, workout adjustments, nutrition, or managing exercise around your exams!`;
    }

    return successResponse(res, {
      reply,
      userContext: { goal, experience, availableTime, load },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCoachContext,
  askCoach,
};
