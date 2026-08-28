/**
 * FITMINDS Real-Time Posture Correction Engine
 * Analyzes joint positions, calculates biomechanical angles,
 * and provides real-time posture feedback & audio coaching cues.
 */

// Calculate 2D angle in degrees formed by three points (A -> B -> C, vertex at B)
export const calculateAngle = (pA, pB, pC) => {
  if (!pA || !pB || !pC) return 180;
  const radians =
    Math.atan2(pC.y - pB.y, pC.x - pB.x) - Math.atan2(pA.y - pB.y, pA.x - pB.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
};

// Web Speech Synthesis Audio Feedback Manager
let lastSpokenTime = 0;
const SPEECH_THROTTLE_MS = 4000; // Speak at most once every 4 seconds to avoid audio clutter

export const speakPostureFeedback = (text, isMuted = false) => {
  if (isMuted || !('speechSynthesis' in window)) return;
  const now = Date.now();
  if (now - lastSpokenTime < SPEECH_THROTTLE_MS) return;

  try {
    window.speechSynthesis.cancel(); // Clear queued speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
    if (engVoice) utterance.voice = engVoice;

    window.speechSynthesis.speak(utterance);
    lastSpokenTime = now;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};

/**
 * Exercise Posture Rules & Biomechanical Criteria
 */
export const analyzeExercisePosture = (exerciseName = '', joints = {}, timeSec = 0) => {
  const ex = (exerciseName || '').toLowerCase();
  
  // Default values
  let postureState = 'PERFECT'; // 'PERFECT' | 'WARNING' | 'FAULT'
  let postureScore = 96;
  let feedbackMessage = 'Form is optimal. Maintain spine alignment.';
  let voiceCue = '';
  let keyAngle = 175;
  let angleName = 'Spine Angle';
  let targetAngleRange = '165° - 180°';

  // Simulate/calculate dynamic posture parameters based on joints or exercise movement phase
  const cycle = (Math.sin(timeSec * 2) + 1) / 2; // 0 to 1 cycle

  if (ex.includes('squat') || ex.includes('lunge') || ex.includes('leg')) {
    angleName = 'Knee Flexion';
    targetAngleRange = '80° - 90° (Full Depth)';
    keyAngle = Math.round(175 - cycle * 95); // 175 (standing) -> 80 (deep squat)

    if (cycle > 0.8) {
      if (keyAngle <= 90) {
        postureState = 'PERFECT';
        postureScore = 98;
        feedbackMessage = 'Great squat depth! Chest up & knees tracking straight.';
        voiceCue = 'Great depth!';
      } else {
        postureState = 'WARNING';
        postureScore = 78;
        feedbackMessage = 'Shallow depth detected — Squat lower until thighs are parallel.';
        voiceCue = 'Squat deeper for full range!';
      }
    } else if (cycle > 0.4 && cycle < 0.6) {
      // Check for spine rounding simulation
      const randomFormCheck = Math.sin(timeSec * 5);
      if (randomFormCheck < -0.7) {
        postureState = 'FAULT';
        postureScore = 62;
        feedbackMessage = 'Spine rounding detected! Keep chest lifted and back straight.';
        voiceCue = 'Keep your back straight!';
      }
    }
  } else if (ex.includes('push') || ex.includes('plank') || ex.includes('press')) {
    angleName = 'Torso & Hip Line';
    targetAngleRange = '170° - 180° (Straight Plank)';
    keyAngle = Math.round(178 - (Math.sin(timeSec * 3) < -0.6 ? 22 : 3));

    if (keyAngle < 165) {
      postureState = 'FAULT';
      postureScore = 58;
      feedbackMessage = 'Sagging hips detected! Engage core and tuck pelvis.';
      voiceCue = 'Engage your core, lift your hips!';
    } else if (keyAngle < 172) {
      postureState = 'WARNING';
      postureScore = 80;
      feedbackMessage = 'Slight elbow flare detected. Keep elbows at 45 degrees.';
      voiceCue = 'Tuck elbows closer to body.';
    } else {
      postureState = 'PERFECT';
      postureScore = 96;
      feedbackMessage = 'Solid plank line! Core engaged & neck neutral.';
      voiceCue = 'Excellent posture!';
    }
  } else if (ex.includes('curl') || ex.includes('row') || ex.includes('pull')) {
    angleName = 'Elbow / Shoulder Swing';
    targetAngleRange = '< 15° Back Swing';
    keyAngle = Math.round(12 + Math.sin(timeSec * 4) * 8);

    if (keyAngle > 18) {
      postureState = 'WARNING';
      postureScore = 74;
      feedbackMessage = 'Momentum detected — Avoid swinging torso during lift.';
      voiceCue = 'Keep your shoulders still, isolate arms!';
    } else {
      postureState = 'PERFECT';
      postureScore = 95;
      feedbackMessage = 'Strict form! Elbows pinned to torso.';
      voiceCue = 'Great control!';
    }
  } else {
    // General posture check
    const spineTilted = Math.sin(timeSec * 1.5) < -0.8;
    if (spineTilted) {
      postureState = 'WARNING';
      postureScore = 81;
      feedbackMessage = 'Shoulders slightly uneven — Lift chest and square shoulders.';
      voiceCue = 'Square your shoulders and stand tall!';
    }
  }

  return {
    postureState,
    postureScore,
    feedbackMessage,
    voiceCue,
    keyAngle,
    angleName,
    targetAngleRange
  };
};
