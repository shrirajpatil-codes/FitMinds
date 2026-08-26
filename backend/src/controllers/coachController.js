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
      coachStatus: "AI Coach context active.",
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

    const qLower = message.toLowerCase().trim();
    let reply = '';

    // 1. Weight Gain / Muscle Mass / Bulking
    if (qLower.includes('gain') || qLower.includes('bulk') || qLower.includes('mass') || qLower.includes('weight gain')) {
      reply = `Hey ${name}! Here is your personalized FITMINDS Weight Gain & Hypertrophy protocol:

💪 1. Caloric Surplus (Clean Bulk):
Eat 300–500 calories above your daily maintenance. Focus on nutrient-dense foods: eggs, chicken/paneer, oats, peanut butter, brown rice, bananas, and whole milk.

🏋️ 2. Progressive Resistance Training:
Perform progressive lifting sessions during your ${availableTime}-minute window. Focus on compound exercises (Squats, Push-ups/Bench, Rows, Deadlifts) in the 8–12 rep range with 3–4 sets.

🍚 3. Protein Requirement:
Target 1.6g–2.2g of protein per kg of bodyweight per day split into 3–4 meals.

😴 4. Recovery & Sleep:
Get 7–8 hours of quality sleep nightly. Muscle hypertrophy occurs during deep rest, not during the workout itself!`;
    }
    // 2. Weight Loss / Fat Loss / Toning
    else if (qLower.includes('lose') || qLower.includes('fat') || qLower.includes('slim') || qLower.includes('tone') || qLower.includes('weight loss')) {
      reply = `Hey ${name}! Here is your personalized FITMINDS Weight Loss & Fat Burning plan:

🔥 1. Caloric Deficit:
Maintain a steady 300–400 calorie deficit per day. Avoid extreme starving diets—keep your energy high for studies!

🏃 2. High-Efficiency Circuits:
Utilize your ${availableTime}-minute window for High-Intensity Interval Training (HIIT) or fast-paced bodyweight supersets (Jumping jacks, Burpees, Mountain climbers, Squat jumps).

🍳 3. Protect Lean Muscle:
Keep protein intake high (1.5g per kg of bodyweight) so your body burns pure fat instead of muscle tissue.

🚶 4. Daily Campus Movement:
Aim for 8,000–10,000 steps daily walking to lectures. Small daily walks add up to massive fat loss over time!`;
    }
    // 3. Exam Stress / Academic Workload / Time Management
    else if (qLower.includes('exam') || qLower.includes('study') || qLower.includes('busy') || qLower.includes('time') || qLower.includes('schedule') || qLower.includes('test')) {
      reply = `Hey ${name}! Managing fitness during high academic load (${load}):

⚡ 1. Micro-Sessions over Skipping:
Never drop workouts completely during exams. A 10–12 minute express session boosts oxygen to your brain, enhances memory retention, and lowers cortisol.

🧠 2. Study Break Reset:
Use your ${profile?.preferredWorkoutWindow || 'flexible'} workout window right between study blocks to clear brain fog.

🧘 3. Active Recovery:
On intense project submission days, swap heavy lifting for light mobility, yoga stretches, or brisk walking.`;
    }
    // 4. Chest / Biceps / Muscle Specific Questions
    else if (qLower.includes('chest') || qLower.includes('bicep') || qLower.includes('arm') || qLower.includes('leg') || qLower.includes('abs') || qLower.includes('core')) {
      reply = `Hey ${name}! For targeted muscle development (${qLower.includes('chest') ? 'Chest' : qLower.includes('bicep') ? 'Biceps/Arms' : qLower.includes('abs') ? 'Core/Abs' : 'Legs'}):

🎯 1. Mind-Muscle Connection:
Focus on controlled tempo—2 seconds down (eccentric) and 1 second explosive push/pull. Quality of reps matters more than weight.

⏱️ 2. Frequency in ${availableTime} Mins:
Train this muscle group 2x per week with 3–4 targeted exercises (3 sets of 10–12 reps).

🥗 3. Fuel:
Consume a protein-rich snack (e.g. protein shake, boiled eggs, or Greek yogurt) within 90 minutes post-workout for repair.`;
    }
    // 5. Soreness / Pain / Knee / Joint / Injury
    else if (qLower.includes('pain') || qLower.includes('hurt') || qLower.includes('sore') || qLower.includes('knee') || qLower.includes('injury') || qLower.includes('back')) {
      reply = `Hey ${name}! Safety and recovery are paramount:

⚠️ 1. Dynamic Deload:
If you feel sharp pain, stop the exercise immediately. Soreness (DOMS) is normal, but sharp joint pain means you need rest.

🧊 2. Warm-Up & Mobility:
Spend 4–5 minutes warming up joint fluid before any exercise. Use dynamic leg swings, arm circles, and cat-cow stretches.

💧 3. Hydration & Compression:
Drink plenty of water and elevate/ice any inflamed joints. If pain lasts >48 hours, consult a physician.`;
    }
    // 6. Diet / Protein / Creatine / Supplements
    else if (qLower.includes('diet') || qLower.includes('protein') || qLower.includes('creatine') || qLower.includes('eat') || qLower.includes('supplement') || qLower.includes('food')) {
      reply = `Hey ${name}! Essential Student Nutrition Tips:

🥛 1. Accessible Protein Sources:
Boiled eggs, Paneer, Chicken breast, Tofu/Soy chunks, Greek yogurt, Lentils/Chana, and Whey protein powder.

🍌 2. Pre & Post Workout Fuel:
- Pre-Workout (30 min before): 1 Banana or PB Toast for instant glycogen.
- Post-Workout (within 1 hr): Protein + Complex Carbs for fast recovery.

💦 3. Hydration Rule:
Drink at least 3 Liters of water daily. Dehydration reduces strength output by up to 15%!`;
    }
    // 7. Plan Changes / Adaptive System
    else if (qLower.includes('plan') || qLower.includes('why') || qLower.includes('change') || qLower.includes('adap')) {
      reply = `Hey ${name}! FITMINDS adaptively updates your workout plan based on:
• Your daily check-in energy & readiness ratings.
• Your current academic workload (${load}).
• Your target goal (${goal}) and available time (${availableTime} mins).

When stress is high, FITMINDS shortens session duration to prevent burnout while keeping your workout streak active!`;
    }
    // 8. General / Custom Query Fallback
    else {
      reply = `Hey ${name}! Thanks for asking about "${message}".

📌 FITMINDS Recommendation for your profile (Goal: ${goal}, Experience: ${experience}):
1️⃣ Consistency: Stick to your ${availableTime}-minute workout window 4–5 days a week.
2️⃣ Adaptability: Adjust workout intensity on days when academic workload is ${load}.
3️⃣ Execution: Keep rest intervals to 45–60 seconds between sets for maximum efficiency.

Feel free to ask me specifically about weight gain, fat loss, chest/leg routines, student diets, or workout timing anytime!`;
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
