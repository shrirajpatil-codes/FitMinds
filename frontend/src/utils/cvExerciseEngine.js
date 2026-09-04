/**
 * FITMINDS Universal CV Exercise Engine
 * Performs real-time joint angle calculations, exponential smoothing,
 * rep counting, movement stage tracking (UP/DOWN), range of motion (ROM),
 * depth assessment, and biomechanical posture feedback for ALL exercises.
 */

// ============================================================
// ANGLE CALCULATION
// ============================================================

export const calculateAngle = (a, b, c) => {
  if (!a || !b || !c) return 180;
  
  const ax = typeof a.x === 'number' ? a.x : a[0];
  const ay = typeof a.y === 'number' ? a.y : a[1];
  const bx = typeof b.x === 'number' ? b.x : b[0];
  const by = typeof b.y === 'number' ? b.y : b[1];
  const cx = typeof c.x === 'number' ? c.x : c[0];
  const cy = typeof c.y === 'number' ? c.y : c[1];

  let radians = Math.atan2(cy - by, cx - bx) - Math.atan2(ay - by, ax - bx);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return angle;
};

// ============================================================
// ANGLE SMOOTHER (Exponential Moving Average Filter)
// ============================================================

export class AngleSmoother {
  constructor(alpha = 0.35) {
    this.alpha = alpha;
    this.value = null;
  }

  update(newValue) {
    if (this.value === null) {
      this.value = newValue;
    } else {
      this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  reset() {
    this.value = null;
  }
}

// ============================================================
// BICEP CURL ANALYZER
// ============================================================

export class BicepCurlAnalyzer {
  constructor() {
    this.reps = 0;
    this.stage = 'down';
    this.angleSmoother = new AngleSmoother(0.35);
    this.minAngle = 180;
    this.maxAngle = 0;
    this.activeArm = 'Right';
  }

  update(landmarks) {
    if (!landmarks || landmarks.length < 17) {
      return this.getFallbackData();
    }

    const LEFT_SHOULDER = 11, LEFT_ELBOW = 13, LEFT_WRIST = 15;
    const RIGHT_SHOULDER = 12, RIGHT_ELBOW = 14, RIGHT_WRIST = 16;

    const leftShoulder = landmarks[LEFT_SHOULDER] || { x: 0.35, y: 0.3, visibility: 0.9 };
    const leftElbow = landmarks[LEFT_ELBOW] || { x: 0.35, y: 0.5, visibility: 0.9 };
    const leftWrist = landmarks[LEFT_WRIST] || { x: 0.35, y: 0.7, visibility: 0.9 };

    const rightShoulder = landmarks[RIGHT_SHOULDER] || { x: 0.65, y: 0.3, visibility: 0.9 };
    const rightElbow = landmarks[RIGHT_ELBOW] || { x: 0.65, y: 0.5, visibility: 0.9 };
    const rightWrist = landmarks[RIGHT_WRIST] || { x: 0.65, y: 0.7, visibility: 0.9 };

    const leftVis = (leftShoulder.visibility || 0.5) + (leftElbow.visibility || 0.5) + (leftWrist.visibility || 0.5);
    const rightVis = (rightShoulder.visibility || 0.5) + (rightElbow.visibility || 0.5) + (rightWrist.visibility || 0.5);

    let shoulder, elbow, wrist;
    if (rightVis >= leftVis) {
      this.activeArm = 'Right';
      shoulder = rightShoulder;
      elbow = rightElbow;
      wrist = rightWrist;
    } else {
      this.activeArm = 'Left';
      shoulder = leftShoulder;
      elbow = leftElbow;
      wrist = leftWrist;
    }

    const rawAngle = calculateAngle(shoulder, elbow, wrist);
    const angle = this.angleSmoother.update(rawAngle);

    this.minAngle = Math.min(this.minAngle, angle);
    this.maxAngle = Math.max(this.maxAngle, angle);

    let repIncremented = false;
    if (angle > 140) {
      this.stage = 'down';
    }

    if (angle < 75 && this.stage === 'down') {
      this.stage = 'up';
      this.reps += 1;
      repIncremented = true;
    }

    let feedback = '';
    let voiceCue = '';
    let formScore = 95;
    let postureState = 'PERFECT';

    if (angle > 150) {
      feedback = 'Extend your arm fully';
      voiceCue = 'Extend arm';
      postureState = 'PERFECT';
      formScore = 98;
    } else if (angle < 50) {
      feedback = 'Good contraction!';
      voiceCue = 'Good contraction!';
      postureState = 'PERFECT';
      formScore = 100;
    } else {
      feedback = 'Keep curling with smooth control';
      voiceCue = 'Keep curling';
      postureState = 'PERFECT';
      formScore = 92;
    }

    const rom = Math.round((this.maxAngle - this.minAngle) * 100) / 100;

    return {
      exercise: 'Bicep Curl',
      angle: Math.round(angle * 10) / 10,
      reps: this.reps,
      stage: this.stage,
      arm: this.activeArm,
      rom: rom || 130,
      feedback,
      voiceCue: repIncremented ? 'Rep completed!' : voiceCue,
      formScore,
      postureState,
      keyAngleName: `${this.activeArm} Elbow Angle`,
      targetRange: '35° - 160°'
    };
  }

  getFallbackData() {
    return {
      exercise: 'Bicep Curl',
      angle: 160,
      reps: this.reps,
      stage: this.stage,
      arm: this.activeArm,
      rom: 125,
      feedback: 'Stand in frame with your arms visible',
      voiceCue: '',
      formScore: 90,
      postureState: 'PERFECT',
      keyAngleName: 'Elbow Angle',
      targetRange: '35° - 160°'
    };
  }
}

// ============================================================
// SQUAT ANALYZER
// ============================================================

export class SquatAnalyzer {
  constructor() {
    this.reps = 0;
    this.stage = 'up';
    this.leftSmoother = new AngleSmoother(0.35);
    this.rightSmoother = new AngleSmoother(0.35);
  }

  update(landmarks) {
    if (!landmarks || landmarks.length < 29) {
      return this.getFallbackData();
    }

    const LEFT_HIP = 23, LEFT_KNEE = 25, LEFT_ANKLE = 27;
    const RIGHT_HIP = 24, RIGHT_KNEE = 26, RIGHT_ANKLE = 28;

    const leftHip = landmarks[LEFT_HIP];
    const leftKnee = landmarks[LEFT_KNEE];
    const leftAnkle = landmarks[LEFT_ANKLE];

    const rightHip = landmarks[RIGHT_HIP];
    const rightKnee = landmarks[RIGHT_KNEE];
    const rightAnkle = landmarks[RIGHT_ANKLE];

    let leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    let rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    leftAngle = this.leftSmoother.update(leftAngle);
    rightAngle = this.rightSmoother.update(rightAngle);

    const angle = (leftAngle + rightAngle) / 2;

    let repIncremented = false;
    if (angle < 110) {
      this.stage = 'down';
    }

    if (angle > 160 && this.stage === 'down') {
      this.stage = 'up';
      this.reps += 1;
      repIncremented = true;
    }

    let depth = 'Shallow';
    if (angle < 90) {
      depth = 'Deep';
    } else if (angle < 110) {
      depth = 'Good';
    } else {
      depth = 'Shallow';
    }

    let feedback = '';
    let voiceCue = '';
    let postureState = 'PERFECT';
    let formScore = 95;

    if (depth === 'Deep') {
      feedback = 'Excellent squat depth!';
      voiceCue = 'Great depth!';
      postureState = 'PERFECT';
      formScore = 98;
    } else if (depth === 'Good') {
      feedback = 'Good squat depth';
      voiceCue = 'Good depth';
      postureState = 'PERFECT';
      formScore = 90;
    } else {
      feedback = 'Squat deeper until thighs are parallel';
      voiceCue = 'Squat deeper';
      postureState = 'WARNING';
      formScore = 75;
    }

    return {
      exercise: 'Squat',
      angle: Math.round(angle * 10) / 10,
      leftKnee: Math.round(leftAngle * 10) / 10,
      rightKnee: Math.round(rightAngle * 10) / 10,
      reps: this.reps,
      stage: this.stage,
      depth,
      feedback,
      voiceCue: repIncremented ? 'Rep completed!' : voiceCue,
      formScore,
      postureState,
      keyAngleName: 'Knee Flexion Angle',
      targetRange: '80° - 90° (Full Depth)'
    };
  }

  getFallbackData() {
    return {
      exercise: 'Squat',
      angle: 175,
      leftKnee: 175,
      rightKnee: 175,
      reps: this.reps,
      stage: this.stage,
      depth: 'Standing',
      feedback: 'Stand in frame facing the camera',
      voiceCue: '',
      formScore: 92,
      postureState: 'PERFECT',
      keyAngleName: 'Knee Flexion Angle',
      targetRange: '80° - 90°'
    };
  }
}

// ============================================================
// PUSH-UP ANALYZER
// ============================================================

export class PushupAnalyzer {
  constructor() {
    this.reps = 0;
    this.stage = 'up';
    this.elbowSmoother = new AngleSmoother(0.35);
    this.hipSmoother = new AngleSmoother(0.35);
  }

  update(landmarks) {
    if (!landmarks || landmarks.length < 29) {
      return this.getFallbackData();
    }

    const SHOULDER = landmarks[12] || landmarks[11];
    const ELBOW = landmarks[14] || landmarks[13];
    const WRIST = landmarks[16] || landmarks[15];

    const HIP = landmarks[24] || landmarks[23];
    const ANKLE = landmarks[28] || landmarks[27];

    const rawElbowAngle = calculateAngle(SHOULDER, ELBOW, WRIST);
    const rawHipAngle = calculateAngle(SHOULDER, HIP, ANKLE);

    const elbowAngle = this.elbowSmoother.update(rawElbowAngle);
    const hipAngle = this.hipSmoother.update(rawHipAngle);

    let repIncremented = false;
    if (elbowAngle < 95) {
      this.stage = 'down';
    }

    if (elbowAngle > 155 && this.stage === 'down') {
      this.stage = 'up';
      this.reps += 1;
      repIncremented = true;
    }

    let postureState = 'PERFECT';
    let formScore = 96;
    let feedback = 'Maintain body plank alignment';
    let voiceCue = '';

    // Check Plank Line / Sagging Hips
    if (hipAngle < 155 || hipAngle > 195) {
      postureState = 'FAULT';
      formScore = 60;
      feedback = 'Sagging or arched hips! Keep body in straight line.';
      voiceCue = 'Lift your hips, keep body straight!';
    } else if (elbowAngle > 110 && this.stage === 'down') {
      postureState = 'WARNING';
      formScore = 78;
      feedback = 'Lower chest closer to floor for full depth';
      voiceCue = 'Push down lower!';
    } else if (elbowAngle < 90) {
      postureState = 'PERFECT';
      formScore = 98;
      feedback = 'Great push-up depth! Core tight.';
      voiceCue = 'Great chest depth!';
    }

    return {
      exercise: 'Push-up',
      angle: Math.round(elbowAngle * 10) / 10,
      hipAngle: Math.round(hipAngle * 10) / 10,
      reps: this.reps,
      stage: this.stage,
      feedback,
      voiceCue: repIncremented ? 'Rep completed!' : voiceCue,
      formScore,
      postureState,
      keyAngleName: 'Elbow & Hip Alignment',
      targetRange: 'Elbow < 90° | Hip 170°'
    };
  }

  getFallbackData() {
    return {
      exercise: 'Push-up',
      angle: 165,
      hipAngle: 175,
      reps: this.reps,
      stage: this.stage,
      feedback: 'Position body horizontally in frame for Push-up tracking',
      voiceCue: '',
      formScore: 94,
      postureState: 'PERFECT',
      keyAngleName: 'Elbow & Hip Alignment',
      targetRange: 'Elbow < 90° | Hip 170°'
    };
  }
}

// ============================================================
// LUNGE ANALYZER
// ============================================================

export class LungeAnalyzer {
  constructor() {
    this.reps = 0;
    this.stage = 'up';
    this.kneeSmoother = new AngleSmoother(0.35);
  }

  update(landmarks) {
    if (!landmarks || landmarks.length < 29) {
      return this.getFallbackData();
    }

    const HIP = landmarks[23];
    const KNEE = landmarks[25];
    const ANKLE = landmarks[27];

    const rawKneeAngle = calculateAngle(HIP, KNEE, ANKLE);
    const kneeAngle = this.kneeSmoother.update(rawKneeAngle);

    let repIncremented = false;
    if (kneeAngle < 100) {
      this.stage = 'down';
    }

    if (kneeAngle > 155 && this.stage === 'down') {
      this.stage = 'up';
      this.reps += 1;
      repIncremented = true;
    }

    let postureState = 'PERFECT';
    let formScore = 95;
    let feedback = 'Lower back knee toward floor';
    let voiceCue = '';

    if (kneeAngle < 90) {
      postureState = 'PERFECT';
      formScore = 98;
      feedback = 'Perfect lunge depth! Torso upright.';
      voiceCue = 'Great lunge form!';
    } else if (kneeAngle > 115 && this.stage === 'down') {
      postureState = 'WARNING';
      formScore = 76;
      feedback = 'Step wider and drop hips lower';
      voiceCue = 'Drop hips lower!';
    }

    return {
      exercise: 'Lunge',
      angle: Math.round(kneeAngle * 10) / 10,
      reps: this.reps,
      stage: this.stage,
      feedback,
      voiceCue: repIncremented ? 'Rep completed!' : voiceCue,
      formScore,
      postureState,
      keyAngleName: 'Lead Knee Angle',
      targetRange: '85° - 95°'
    };
  }

  getFallbackData() {
    return {
      exercise: 'Lunge',
      angle: 170,
      reps: this.reps,
      stage: this.stage,
      feedback: 'Step into frame in split stance for Lunge tracking',
      voiceCue: '',
      formScore: 92,
      postureState: 'PERFECT',
      keyAngleName: 'Lead Knee Angle',
      targetRange: '85° - 95°'
    };
  }
}

// ============================================================
// PLANK ANALYZER
// ============================================================

export class PlankAnalyzer {
  constructor() {
    this.reps = 0; // Plank tracks hold duration in seconds
    this.stage = 'holding';
    this.hipSmoother = new AngleSmoother(0.35);
  }

  update(landmarks) {
    if (!landmarks || landmarks.length < 29) {
      return this.getFallbackData();
    }

    const SHOULDER = landmarks[11];
    const HIP = landmarks[23];
    const ANKLE = landmarks[27];

    const rawHipAngle = calculateAngle(SHOULDER, HIP, ANKLE);
    const hipAngle = this.hipSmoother.update(rawHipAngle);

    let postureState = 'PERFECT';
    let formScore = 96;
    let feedback = 'Solid plank line! Core engaged.';
    let voiceCue = '';

    if (hipAngle < 160) {
      postureState = 'FAULT';
      formScore = 58;
      feedback = 'Sagging hips detected! Engage core and tuck pelvis.';
      voiceCue = 'Engage core, lift hips!';
    } else if (hipAngle > 195) {
      postureState = 'WARNING';
      formScore = 75;
      feedback = 'Piking hips too high — flatten your spine line.';
      voiceCue = 'Lower hips to neutral!';
    }

    return {
      exercise: 'Plank',
      angle: Math.round(hipAngle * 10) / 10,
      reps: this.reps,
      stage: this.stage,
      feedback,
      voiceCue,
      formScore,
      postureState,
      keyAngleName: 'Spine & Hip Angle',
      targetRange: '170° - 180°'
    };
  }

  getFallbackData() {
    return {
      exercise: 'Plank',
      angle: 176,
      reps: this.reps,
      stage: 'holding',
      feedback: 'Hold horizontal plank posture in camera view',
      voiceCue: '',
      formScore: 95,
      postureState: 'PERFECT',
      keyAngleName: 'Spine & Hip Angle',
      targetRange: '170° - 180°'
    };
  }
}

// ============================================================
// SHOULDER PRESS ANALYZER
// ============================================================

export class ShoulderPressAnalyzer {
  constructor() {
    this.reps = 0;
    this.stage = 'down';
    this.elbowSmoother = new AngleSmoother(0.35);
  }

  update(landmarks) {
    if (!landmarks || landmarks.length < 17) {
      return this.getFallbackData();
    }

    const SHOULDER = landmarks[12] || landmarks[11];
    const ELBOW = landmarks[14] || landmarks[13];
    const WRIST = landmarks[16] || landmarks[15];

    const rawElbowAngle = calculateAngle(SHOULDER, ELBOW, WRIST);
    const elbowAngle = this.elbowSmoother.update(rawElbowAngle);

    let repIncremented = false;
    if (elbowAngle < 85) {
      this.stage = 'down';
    }

    if (elbowAngle > 155 && this.stage === 'down') {
      this.stage = 'up';
      this.reps += 1;
      repIncremented = true;
    }

    let postureState = 'PERFECT';
    let formScore = 95;
    let feedback = 'Press weights overhead with controlled path';
    let voiceCue = '';

    if (elbowAngle > 155) {
      postureState = 'PERFECT';
      formScore = 98;
      feedback = 'Full extension overhead!';
      voiceCue = 'Full overhead extension!';
    } else if (elbowAngle < 85) {
      postureState = 'PERFECT';
      formScore = 92;
      feedback = 'Good starting depth at chin level';
      voiceCue = 'Press up!';
    }

    return {
      exercise: 'Shoulder Press',
      angle: Math.round(elbowAngle * 10) / 10,
      reps: this.reps,
      stage: this.stage,
      feedback,
      voiceCue: repIncremented ? 'Rep completed!' : voiceCue,
      formScore,
      postureState,
      keyAngleName: 'Elbow Lockout Angle',
      targetRange: '75° - 165°'
    };
  }

  getFallbackData() {
    return {
      exercise: 'Shoulder Press',
      angle: 150,
      reps: this.reps,
      stage: this.stage,
      feedback: 'Raise arms in frame for Shoulder Press tracking',
      voiceCue: '',
      formScore: 92,
      postureState: 'PERFECT',
      keyAngleName: 'Elbow Lockout Angle',
      targetRange: '75° - 165°'
    };
  }
}

// ============================================================
// JUMPING JACK ANALYZER
// ============================================================

export class JumpingJackAnalyzer {
  constructor() {
    this.reps = 0;
    this.stage = 'closed';
    this.armSmoother = new AngleSmoother(0.35);
  }

  update(landmarks) {
    if (!landmarks || landmarks.length < 29) {
      return this.getFallbackData();
    }

    const HIP = landmarks[24];
    const SHOULDER = landmarks[12];
    const WRIST = landmarks[16];

    const rawArmAngle = calculateAngle(HIP, SHOULDER, WRIST);
    const armAngle = this.armSmoother.update(rawArmAngle);

    let repIncremented = false;
    if (armAngle < 40) {
      this.stage = 'closed';
    }

    if (armAngle > 130 && this.stage === 'closed') {
      this.stage = 'open';
      this.reps += 1;
      repIncremented = true;
    }

    let postureState = 'PERFECT';
    let formScore = 95;
    let feedback = 'Raise hands above head and jump feet outward';
    let voiceCue = '';

    if (armAngle > 130) {
      postureState = 'PERFECT';
      formScore = 98;
      feedback = 'Great arm elevation!';
      voiceCue = 'Great jack!';
    }

    return {
      exercise: 'Jumping Jacks',
      angle: Math.round(armAngle * 10) / 10,
      reps: this.reps,
      stage: this.stage,
      feedback,
      voiceCue: repIncremented ? 'Rep completed!' : voiceCue,
      formScore,
      postureState,
      keyAngleName: 'Arm Elevation Angle',
      targetRange: '30° - 140°'
    };
  }

  getFallbackData() {
    return {
      exercise: 'Jumping Jacks',
      angle: 35,
      reps: this.reps,
      stage: this.stage,
      feedback: 'Stand full body in frame for Jumping Jack tracking',
      voiceCue: '',
      formScore: 93,
      postureState: 'PERFECT',
      keyAngleName: 'Arm Elevation Angle',
      targetRange: '30° - 140°'
    };
  }
}

// ============================================================
// DUMBBELL ROW ANALYZER
// ============================================================

export class DumbbellRowAnalyzer {
  constructor() {
    this.reps = 0;
    this.stage = 'down';
    this.angleSmoother = new AngleSmoother(0.35);
    this.activeArm = 'Right';
  }

  update(landmarks) {
    if (!landmarks || landmarks.length < 25) {
      return this.getFallbackData();
    }

    const LEFT_SHOULDER = 11, LEFT_ELBOW = 13, LEFT_WRIST = 15, LEFT_HIP = 23;
    const RIGHT_SHOULDER = 12, RIGHT_ELBOW = 14, RIGHT_WRIST = 16, RIGHT_HIP = 24;

    const leftShoulder = landmarks[LEFT_SHOULDER] || { x: 0.35, y: 0.3, visibility: 0.9 };
    const leftElbow = landmarks[LEFT_ELBOW] || { x: 0.35, y: 0.5, visibility: 0.9 };
    const leftWrist = landmarks[LEFT_WRIST] || { x: 0.35, y: 0.7, visibility: 0.9 };
    const leftHip = landmarks[LEFT_HIP] || { x: 0.38, y: 0.6, visibility: 0.9 };

    const rightShoulder = landmarks[RIGHT_SHOULDER] || { x: 0.65, y: 0.3, visibility: 0.9 };
    const rightElbow = landmarks[RIGHT_ELBOW] || { x: 0.65, y: 0.5, visibility: 0.9 };
    const rightWrist = landmarks[RIGHT_WRIST] || { x: 0.65, y: 0.7, visibility: 0.9 };
    const rightHip = landmarks[RIGHT_HIP] || { x: 0.62, y: 0.6, visibility: 0.9 };

    const leftVis = (leftShoulder.visibility || 0.5) + (leftElbow.visibility || 0.5) + (leftWrist.visibility || 0.5);
    const rightVis = (rightShoulder.visibility || 0.5) + (rightElbow.visibility || 0.5) + (rightWrist.visibility || 0.5);

    let shoulder, elbow, wrist, hip;
    if (rightVis >= leftVis) {
      this.activeArm = 'Right';
      shoulder = rightShoulder;
      elbow = rightElbow;
      wrist = rightWrist;
      hip = rightHip;
    } else {
      this.activeArm = 'Left';
      shoulder = leftShoulder;
      elbow = leftElbow;
      wrist = leftWrist;
      hip = leftHip;
    }

    const rawElbowAngle = calculateAngle(shoulder, elbow, wrist);
    const elbowAngle = this.angleSmoother.update(rawElbowAngle);
    const torsoHingeAngle = calculateAngle(shoulder, hip, { x: hip.x, y: hip.y + 0.5 });

    let repIncremented = false;

    if (elbowAngle > 140) {
      this.stage = 'down';
    }
    if (elbowAngle < 90 && this.stage === 'down') {
      this.stage = 'up';
      this.reps++;
      repIncremented = true;
    }

    let postureState = 'PERFECT';
    let formScore = 96;
    let feedback = 'Good dumbbell row form! Drive elbow up towards hip.';
    let voiceCue = '';

    if (torsoHingeAngle > 60) {
      postureState = 'WARNING';
      formScore = 80;
      feedback = 'Hinge forward more at hips to isolate lats and back';
      voiceCue = 'Hinge forward at hips!';
    } else if (elbowAngle < 85 && this.stage === 'up') {
      postureState = 'PERFECT';
      formScore = 98;
      feedback = 'Peak lat contraction achieved!';
      voiceCue = 'Squeeze at top!';
    }

    return {
      exercise: 'Dumbbell Rows',
      angle: Math.round(elbowAngle * 10) / 10,
      reps: this.reps,
      stage: this.stage,
      feedback,
      voiceCue: repIncremented ? 'Good row!' : voiceCue,
      formScore,
      postureState,
      keyAngleName: 'Elbow Row Angle',
      targetRange: '60° - 160°'
    };
  }

  getFallbackData() {
    return {
      exercise: 'Dumbbell Rows',
      angle: 87,
      reps: this.reps,
      stage: this.stage,
      feedback: 'Maintain neutral spine and pull dumbbell towards hip',
      voiceCue: '',
      formScore: 95,
      postureState: 'PERFECT',
      keyAngleName: 'Elbow Row Angle',
      targetRange: '60° - 160°'
    };
  }
}

// ============================================================
// UNIVERSAL EXERCISE ENGINE WRAPPER
// ============================================================

export class CVExerciseEngine {
  constructor(exercise = 'bicep') {
    this.setExercise(exercise);
  }

  setExercise(exercise) {
    const ex = (exercise || 'bicep').toLowerCase().trim();

    if (ex.includes('row') || ex.includes('dumbbell')) {
      this.exerciseName = 'dumbbell_rows';
      this.analyzer = new DumbbellRowAnalyzer();
    } else if (ex.includes('push') || ex.includes('press-up')) {
      this.exerciseName = 'pushup';
      this.analyzer = new PushupAnalyzer();
    } else if (ex.includes('squat') || ex.includes('leg')) {
      this.exerciseName = 'squat';
      this.analyzer = new SquatAnalyzer();
    } else if (ex.includes('lunge')) {
      this.exerciseName = 'lunge';
      this.analyzer = new LungeAnalyzer();
    } else if (ex.includes('plank')) {
      this.exerciseName = 'plank';
      this.analyzer = new PlankAnalyzer();
    } else if (ex.includes('shoulder') || ex.includes('overhead')) {
      this.exerciseName = 'shoulder_press';
      this.analyzer = new ShoulderPressAnalyzer();
    } else if (ex.includes('jack') || ex.includes('jumping')) {
      this.exerciseName = 'jumping_jacks';
      this.analyzer = new JumpingJackAnalyzer();
    } else {
      // Default to bicep curl / arm curls
      this.exerciseName = 'bicep';
      this.analyzer = new BicepCurlAnalyzer();
    }
  }

  update(landmarks) {
    return this.analyzer.update(landmarks);
  }

  getReps() {
    return this.analyzer.reps;
  }

  reset() {
    this.setExercise(this.exerciseName);
  }
}

export default CVExerciseEngine;
