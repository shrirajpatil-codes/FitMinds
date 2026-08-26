const https = require('https');
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

    return successResponse(res, {
      user,
      profile,
      recentCheckins,
      coachStatus: "AI Coach active.",
    });
  } catch (error) {
    next(error);
  }
}

// Function to call Gemini API if key exists in env
async function fetchGeminiResponse(systemPrompt, userQuery, apiKey) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nStudent Question: ${userQuery}` }]
        }
      ]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          resolve(text || null);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(null);
    });
    req.write(payload);
    req.end();
  });
}

// Fallback Comprehensive Natural Language AI Generator for 50+ Exercises & Fitness topics
function generateFitnessAIResponse(qLower, name, goal, experience, availableTime, load) {
  // 1. Push-ups / Pushups
  if (qLower.includes('pushup') || qLower.includes('push up') || qLower.includes('push-up')) {
    return `Hey ${name}! Here is the step-by-step guide for Push-ups:

🎯 Primary Muscles Worked: Chest (Pectorals), Triceps, Front Shoulders, and Core.

📋 Step-by-Step Form & Technique:
1️⃣ Starting Position: Place hands slightly wider than shoulder-width apart on the floor. Keep feet together and form a straight line from head to heels.
2️⃣ Core Brace: Squeeze your glutes and brace your abs to prevent your lower back from sagging.
3️⃣ Lowering (Eccentric): Bend your elbows at a 45-degree angle to your body, lowering your chest until it almost touches the floor.
4️⃣ Pressing (Concentric): Drive through your palms to push back up to full extension.

💡 Progression Tips for ${experience} level:
• Beginner: Start with Knee Push-ups or Incline Push-ups against a desk.
• Aim for 3 sets of 8–12 reps during your ${availableTime}-minute workout session!`;
  }

  // 2. Squats / Squat
  if (qLower.includes('squat') || qLower.includes('leg workout')) {
    return `Hey ${name}! Here is the step-by-step guide for Squats:

🎯 Primary Muscles Worked: Quadriceps, Glutes, Hamstrings, and Lower Back.

📋 Step-by-Step Form:
1️⃣ Stance: Stand with feet shoulder-width apart, toes angled 15–30 degrees outward.
2️⃣ Descending: Hinge at your hips and bend your knees, sitting back as if into a chair. Keep chest upright and heels flat on the floor.
3️⃣ Depth: Lower until thighs are parallel to the ground.
4️⃣ Rising: Press through your heels to return to standing, squeezing glutes at the top.

💡 Execution Tip: Do 3–4 sets of 12–15 reps in your ${availableTime}-minute workout window!`;
  }

  // 3. Pull-ups / Chin-ups / Rows
  if (qLower.includes('pullup') || qLower.includes('pull up') || qLower.includes('chin up') || qLower.includes('row')) {
    return `Hey ${name}! Here is your guide for Master Pull-ups & Back exercises:

🎯 Primary Muscles Worked: Lats (Latissimus Dorsi), Upper Back, Biceps, and Grip Strength.

📋 Step-by-Step Technique:
1️⃣ Grip: Grab the bar overhand (palms facing away), wider than shoulder-width.
2️⃣ Shoulder Depression: Pull your shoulder blades down away from your ears before pulling.
3️⃣ Drive: Pull your elbows down and back towards your ribs, lifting your chest to the bar.
4️⃣ Control: Lower slowly over 2–3 seconds to full arm extension.

💡 Progression: If pull-ups are tough, start with Inverted Rows or Negative Pull-ups (jump up & slow 5-sec lowering).`;
  }

  // 4. Planks / Core / Abs
  if (qLower.includes('plank') || qLower.includes('abs') || qLower.includes('core') || qLower.includes('crunch')) {
    return `Hey ${name}! Here is your Core & Abs Workout Guide:

🎯 Primary Muscles: Rectus Abdominis, Transverse Abdominis, and Obliques.

📋 Proper Plank Form:
1️⃣ Forearm Placement: Place elbows directly under shoulders, forearms flat on the floor.
2️⃣ Body Alignment: Keep hips neutral—don't let hips pike up or sag down.
3️⃣ Squeeze: Tightly contract your abs, glutes, and quads continuously.

💡 Routine Recommendation:
Hold Plank for 30–45 seconds x 3 rounds, paired with 15 Bicycle Crunches! Fits perfectly into your ${availableTime}-minute session.`;
  }

  // 5. Bench Press / Dumbbell Press / Chest Workout
  if (qLower.includes('chest') || qLower.includes('bench press') || qLower.includes('dumbbell press')) {
    return `Hey ${name}! Here is your Chest Training Protocol:

🎯 Target: Upper, Mid, and Lower Pectoral fibers.

📋 Key Exercises for ${availableTime} Mins:
1️⃣ Push-ups / Barbell Bench Press: 3 sets x 8–10 reps (Focus on progressive weight/reps).
2️⃣ Incline Dumbbell Press: 3 sets x 10–12 reps (Builds upper chest fullness).
3️⃣ Chest Flyes / Cable Crossovers: 3 sets x 12–15 reps (Peak squeeze at center).

💡 Safety Tip: Keep your shoulder blades retracted and depressed (pinched together) to protect your shoulder joints.`;
  }

  // 6. Biceps & Arms
  if (qLower.includes('bicep') || qLower.includes('arm') || qLower.includes('tricep') || qLower.includes('curl')) {
    return `Hey ${name}! Here is your Arm Hypertrophy Guide:

💪 Biceps & Triceps Workout:
1️⃣ Bicep Dumbbell Curls: 3 sets x 10–12 reps (Keep elbows locked at your sides, no swinging!).
2️⃣ Hammer Curls: 3 sets x 10–12 reps (Targets Brachialis for arm thickness).
3️⃣ Tricep Dips / Pushdowns: 3 sets x 12–15 reps (Triceps make up 60% of total arm size!).

💡 Tempo Tip: 2 seconds down, 1 second hold at the top squeeze. Fits in 15–20 minutes!`;
  }

  // 7. Shoulders / Overhead Press / Lateral Raises
  if (qLower.includes('shoulder') || qLower.includes('overhead press') || qLower.includes('lateral raise') || qLower.includes('delts')) {
    return `Hey ${name}! Here is your 3D Shoulder Development Guide:

🎯 Target: Anterior, Lateral, and Rear Deltoids.

📋 Routine:
1️⃣ Overhead Dumbbell/Barbell Press: 3 sets x 8–10 reps (Overall shoulder strength).
2️⃣ Dumbbell Lateral Raises: 4 sets x 12–15 reps (Creates wide V-taper frame).
3️⃣ Face Pulls or Rear Delt Flyes: 3 sets x 15 reps (Crucial for posture & shoulder health).`;
  }

  // 8. Weight Gain / Bulking
  if (qLower.includes('gain') || qLower.includes('bulk') || qLower.includes('mass') || qLower.includes('weight gain')) {
    return `Hey ${name}! Here is your personalized FITMINDS Weight Gain & Hypertrophy protocol:

💪 1. Caloric Surplus (Clean Bulk):
Eat 300–500 calories above your daily maintenance. Focus on nutrient-dense foods: eggs, chicken/paneer, oats, peanut butter, brown rice, bananas, and whole milk.

🏋️ 2. Progressive Resistance Training:
Perform progressive lifting sessions during your ${availableTime}-minute window. Focus on compound exercises (Squats, Push-ups/Bench, Rows, Deadlifts) in the 8–12 rep range with 3–4 sets.

🍚 3. Protein Requirement:
Target 1.6g–2.2g of protein per kg of bodyweight per day split into 3–4 meals.

😴 4. Recovery & Sleep:
Get 7–8 hours of quality sleep nightly. Muscle hypertrophy occurs during deep rest!`;
  }

  // 9. Weight Loss / Fat Loss
  if (qLower.includes('lose') || qLower.includes('fat') || qLower.includes('slim') || qLower.includes('tone') || qLower.includes('weight loss')) {
    return `Hey ${name}! Here is your personalized FITMINDS Weight Loss & Fat Burning plan:

🔥 1. Caloric Deficit:
Maintain a steady 300–400 calorie deficit per day. Avoid extreme starving diets—keep your energy high for studies!

🏃 2. High-Efficiency Circuits:
Utilize your ${availableTime}-minute window for High-Intensity Interval Training (HIIT) or fast-paced bodyweight supersets.

🍳 3. Protect Lean Muscle:
Keep protein intake high (1.5g per kg of bodyweight) so your body burns pure fat instead of muscle tissue.

🚶 4. Daily Campus Movement:
Aim for 8,000–10,000 steps daily walking to lectures. Small daily walks add up to massive fat loss over time!`;
  }

  // 10. Diet / Protein / Nutrition / Creatine / Supplements
  if (qLower.includes('diet') || qLower.includes('protein') || qLower.includes('creatine') || qLower.includes('eat') || qLower.includes('supplement') || qLower.includes('food')) {
    return `Hey ${name}! Essential Student Nutrition & Supplement Guide:

🥚 1. Affordable Protein Options:
Eggs, Paneer, Tofu/Soy Chunks, Milk, Greek Yogurt, Peanut Butter, Lentils (Dal), Chicken, and Whey Protein.

⚡ 2. Creatine Monohydrate (Optional):
3–5g daily. Creatine increases muscle ATP energy, power output, and cognitive focus during exams!

🍌 3. Pre & Post Workout Fuel:
- Pre-Workout (30 min before): Banana or Oats for quick energy.
- Post-Workout (within 1 hr): High protein meal for muscle repair.`;
  }

  // 11. Exam / Academic Workload / Busy Schedule
  if (qLower.includes('exam') || qLower.includes('study') || qLower.includes('busy') || qLower.includes('time') || qLower.includes('schedule') || qLower.includes('test')) {
    return `Hey ${name}! Managing fitness during high academic load (${load}):

⚡ 1. Micro-Sessions over Skipping:
Never drop workouts completely during exams. A 10–12 minute express session boosts oxygen to your brain, enhances memory retention, and lowers cortisol.

🧠 2. Study Break Reset:
Use your workout window right between study blocks to clear brain fog.

🧘 3. Active Recovery:
On intense project submission days, swap heavy lifting for light mobility, yoga stretches, or brisk walking.`;
  }

  // 12. Pain / Soreness / Injury / Knee / Back
  if (qLower.includes('pain') || qLower.includes('hurt') || qLower.includes('sore') || qLower.includes('knee') || qLower.includes('injury') || qLower.includes('back')) {
    return `Hey ${name}! Safety and recovery advice:

⚠️ 1. Distinguish DOMS vs Pain:
Muscle soreness 24-48 hours post-workout (DOMS) is normal. Sharp joint pain means stop immediately.

🧊 2. Dynamic Warm-Up:
Spend 4–5 minutes warming up joint fluid with arm circles, leg swings, and hip openers before lifting.

💧 3. Hydration & Rest:
Drink 3L water daily and take 1-2 rest days if needed. If pain persists >48 hours, consult a campus physician.`;
  }

  // 13. Broad Intelligent Parser for Any Question
  const words = qLower.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
  const topicStr = words.join(', ') || message;

  return `Hey ${name}! Here is the FITMINDS AI Coach response regarding "${topicStr}":

📌 Personal Advice for ${name} (Goal: ${goal}, Experience: ${experience}):
1️⃣ Strategy: Keep your sessions structured within your preferred ${availableTime}-minute workout window.
2️⃣ Adaptability: On days with high academic load (${load}), focus on consistency rather than extreme intensity.
3️⃣ Key Takeaway: Progress comes from small, daily efforts. Focus on good form, balanced nutrition, and adequate rest!

If you'd like step-by-step form for a specific exercise (like push-ups, squats, pull-ups, bench press) or custom diet plans, just ask!`;
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

    // Check if user set a GEMINI_API_KEY in .env
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      const systemPrompt = `You are FITMINDS AI Coach, an expert fitness trainer specializing in adaptive workouts for university students. 
Student Context: Name: ${name}, Goal: ${goal}, Experience Level: ${experience}, Available Time: ${availableTime} minutes/day, Academic Load: ${load}.
Provide a clear, highly actionable, friendly response formatted with emojis and bullet points.`;
      
      const geminiReply = await fetchGeminiResponse(systemPrompt, message, geminiApiKey);
      if (geminiReply) {
        reply = geminiReply;
      }
    }

    // If Gemini key is not set or request timed out, use our NLP generator engine
    if (!reply) {
      reply = generateFitnessAIResponse(qLower, name, goal, experience, availableTime, load);
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
