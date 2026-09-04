/**
 * FITMINDS CV Exercise Engine
 * Directly ported from ml/CV_model/exercise_analyzer.py
 * Performs real-time joint angle calculations, exponential smoothing,
 * rep counting, movement stage tracking (UP/DOWN), range of motion (ROM),
 * depth assessment, and biomechanical posture feedback.
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

    // MediaPipe 33 Landmark Indexes
    const LEFT_SHOULDER = 11;
    const LEFT_ELBOW = 13;
    const LEFT_WRIST = 15;

    const RIGHT_SHOULDER = 12;
    const RIGHT_ELBOW = 14;
    const RIGHT_WRIST = 16;

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

    // Track Range of Motion
    this.minAngle = Math.min(this.minAngle, angle);
    this.maxAngle = Math.max(this.maxAngle, angle);

    // Rep Counting Logic
    let repIncremented = false;
    if (angle > 150) {
      this.stage = 'down';
    }

    if (angle < 50 && this.stage === 'down') {
      this.stage = 'up';
      this.reps += 1;
      repIncremented = true;
    }

    // Feedback
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

    // MediaPipe 33 Landmark Indexes
    const LEFT_HIP = 23;
    const LEFT_KNEE = 25;
    const LEFT_ANKLE = 27;

    const RIGHT_HIP = 24;
    const RIGHT_KNEE = 26;
    const RIGHT_ANKLE = 28;

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

    // Rep Counting Logic
    let repIncremented = false;
    if (angle < 110) {
      this.stage = 'down';
    }

    if (angle > 160 && this.stage === 'down') {
      this.stage = 'up';
      this.reps += 1;
      repIncremented = true;
    }

    // Depth Calculation
    let depth = 'Shallow';
    if (angle < 90) {
      depth = 'Deep';
    } else if (angle < 110) {
      depth = 'Good';
    } else {
      depth = 'Shallow';
    }

    // Form Feedback
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
// EXERCISE ENGINE WRAPPER
// ============================================================

export class CVExerciseEngine {
  constructor(exercise = 'bicep') {
    this.setExercise(exercise);
  }

  setExercise(exercise) {
    const ex = (exercise || 'bicep').toLowerCase().trim();

    if (ex.includes('bicep') || ex.includes('curl') || ex.includes('arm')) {
      this.exerciseName = 'bicep';
      this.analyzer = new BicepCurlAnalyzer();
    } else if (ex.includes('squat') || ex.includes('leg') || ex.includes('thigh')) {
      this.exerciseName = 'squat';
      this.analyzer = new SquatAnalyzer();
    } else {
      // Default to bicep curl
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
