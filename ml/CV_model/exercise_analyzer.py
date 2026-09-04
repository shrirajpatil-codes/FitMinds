import math

# ============================================================
# ANGLE CALCULATION
# ============================================================

def calculate_angle(a, b, c):
    """
    Calculate angle ABC using three (x, y) points.
    """
    angle = math.degrees(
        math.atan2(c[1] - b[1], c[0] - b[0])
        -
        math.atan2(a[1] - b[1], a[0] - b[0])
    )
    angle = abs(angle)
    if angle > 180:
        angle = 360 - angle
    return angle

# ============================================================
# ANGLE SMOOTHER
# ============================================================

class AngleSmoother:
    def __init__(self, alpha=0.35):
        self.alpha = alpha
        self.value = None

    def update(self, new_value):
        if self.value is None:
            self.value = new_value
        else:
            self.value = self.alpha * new_value + (1 - self.alpha) * self.value
        return self.value

# ============================================================
# BICEP CURL ANALYZER
# ============================================================

class BicepCurlAnalyzer:
    def __init__(self):
        self.reps = 0
        self.stage = "down"
        self.angle_smoother = AngleSmoother(alpha=0.35)
        self.min_angle = 180
        self.max_angle = 0
        self.active_arm = None

    def update(self, landmarks):
        LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST = 11, 13, 15
        RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST = 12, 14, 16

        left_shoulder, left_elbow, left_wrist = landmarks[LEFT_SHOULDER], landmarks[LEFT_ELBOW], landmarks[LEFT_WRIST]
        right_shoulder, right_elbow, right_wrist = landmarks[RIGHT_SHOULDER], landmarks[RIGHT_ELBOW], landmarks[RIGHT_WRIST]

        left_vis = getattr(left_shoulder, 'visibility', 0.9) + getattr(left_elbow, 'visibility', 0.9) + getattr(left_wrist, 'visibility', 0.9)
        right_vis = getattr(right_shoulder, 'visibility', 0.9) + getattr(right_elbow, 'visibility', 0.9) + getattr(right_wrist, 'visibility', 0.9)

        if right_vis >= left_vis:
            self.active_arm = "Right"
            shoulder, elbow, wrist = right_shoulder, right_elbow, right_wrist
        else:
            self.active_arm = "Left"
            shoulder, elbow, wrist = left_shoulder, left_elbow, left_wrist

        a = [shoulder.x, shoulder.y]
        b = [elbow.x, elbow.y]
        c = [wrist.x, wrist.y]

        raw_angle = calculate_angle(a, b, c)
        angle = self.angle_smoother.update(raw_angle)

        self.min_angle = min(self.min_angle, angle)
        self.max_angle = max(self.max_angle, angle)

        if angle > 150:
            self.stage = "down"

        if angle < 50 and self.stage == "down":
            self.stage = "up"
            self.reps += 1

        if angle > 150:
            feedback = "Extend your arm"
        elif angle < 50:
            feedback = "Good contraction"
        else:
            feedback = "Keep curling"

        rom = self.max_angle - self.min_angle

        return {
            "exercise": "Bicep Curl",
            "angle": round(angle, 2),
            "reps": self.reps,
            "stage": self.stage,
            "arm": self.active_arm,
            "rom": round(rom, 2),
            "feedback": feedback
        }

# ============================================================
# SQUAT ANALYZER
# ============================================================

class SquatAnalyzer:
    def __init__(self):
        self.reps = 0
        self.stage = "up"
        self.left_smoother = AngleSmoother(alpha=0.35)
        self.right_smoother = AngleSmoother(alpha=0.35)

    def update(self, landmarks):
        LEFT_HIP, LEFT_KNEE, LEFT_ANKLE = 23, 25, 27
        RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE = 24, 26, 28

        left_angle = calculate_angle(
            [landmarks[LEFT_HIP].x, landmarks[LEFT_HIP].y],
            [landmarks[LEFT_KNEE].x, landmarks[LEFT_KNEE].y],
            [landmarks[LEFT_ANKLE].x, landmarks[LEFT_ANKLE].y]
        )

        right_angle = calculate_angle(
            [landmarks[RIGHT_HIP].x, landmarks[RIGHT_HIP].y],
            [landmarks[RIGHT_KNEE].x, landmarks[RIGHT_KNEE].y],
            [landmarks[RIGHT_ANKLE].x, landmarks[RIGHT_ANKLE].y]
        )

        left_angle = self.left_smoother.update(left_angle)
        right_angle = self.right_smoother.update(right_angle)

        angle = (left_angle + right_angle) / 2

        if angle < 110:
            self.stage = "down"

        if angle > 160 and self.stage == "down":
            self.stage = "up"
            self.reps += 1

        if angle < 90:
            depth = "Deep"
            feedback = "Excellent squat depth"
        elif angle < 110:
            depth = "Good"
            feedback = "Good squat depth"
        else:
            depth = "Shallow"
            feedback = "Squat deeper"

        return {
            "exercise": "Squat",
            "angle": round(angle, 2),
            "left_knee": round(left_angle, 2),
            "right_knee": round(right_angle, 2),
            "reps": self.reps,
            "stage": self.stage,
            "depth": depth,
            "feedback": feedback
        }

# ============================================================
# PUSH-UP ANALYZER
# ============================================================

class PushupAnalyzer:
    def __init__(self):
        self.reps = 0
        self.stage = "up"
        self.elbow_smoother = AngleSmoother(alpha=0.35)
        self.hip_smoother = AngleSmoother(alpha=0.35)

    def update(self, landmarks):
        SHOULDER = landmarks[12] if len(landmarks) > 12 else landmarks[11]
        ELBOW = landmarks[14] if len(landmarks) > 14 else landmarks[13]
        WRIST = landmarks[16] if len(landmarks) > 16 else landmarks[15]
        HIP = landmarks[24] if len(landmarks) > 24 else landmarks[23]
        ANKLE = landmarks[28] if len(landmarks) > 28 else landmarks[27]

        elbow_angle = calculate_angle([SHOULDER.x, SHOULDER.y], [ELBOW.x, ELBOW.y], [WRIST.x, WRIST.y])
        hip_angle = calculate_angle([SHOULDER.x, SHOULDER.y], [HIP.x, HIP.y], [ANKLE.x, ANKLE.y])

        elbow_angle = self.elbow_smoother.update(elbow_angle)
        hip_angle = self.hip_smoother.update(hip_angle)

        if elbow_angle < 95:
            self.stage = "down"

        if elbow_angle > 155 and self.stage == "down":
            self.stage = "up"
            self.reps += 1

        if hip_angle < 155 or hip_angle > 195:
            feedback = "Sagging or arched hips! Keep body straight."
        elif elbow_angle < 90:
            feedback = "Great push-up depth!"
        else:
            feedback = "Lower chest closer to floor"

        return {
            "exercise": "Push-up",
            "elbow_angle": round(elbow_angle, 2),
            "hip_angle": round(hip_angle, 2),
            "reps": self.reps,
            "stage": self.stage,
            "feedback": feedback
        }

# ============================================================
# EXERCISE ENGINE
# ============================================================

class ExerciseEngine:
    def __init__(self, exercise="bicep"):
        self.set_exercise(exercise)

    def set_exercise(self, exercise):
        exercise = exercise.lower().strip()

        if exercise in ["bicep", "bicep curl", "curl"]:
            self.exercise = "bicep"
            self.analyzer = BicepCurlAnalyzer()
        elif exercise in ["squat", "squats"]:
            self.exercise = "squat"
            self.analyzer = SquatAnalyzer()
        elif exercise in ["pushup", "push-up", "pushups"]:
            self.exercise = "pushup"
            self.analyzer = PushupAnalyzer()
        else:
            self.exercise = "bicep"
            self.analyzer = BicepCurlAnalyzer()

    def update(self, landmarks):
        return self.analyzer.update(landmarks)

    def get_reps(self):
        return self.analyzer.reps

    def reset(self):
        self.set_exercise(self.exercise)