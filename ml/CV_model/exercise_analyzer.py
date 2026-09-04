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
            self.value = (
                self.alpha * new_value
                + (1 - self.alpha) * self.value
            )

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

        # MediaPipe landmark indexes
        LEFT_SHOULDER = 11
        LEFT_ELBOW = 13
        LEFT_WRIST = 15

        RIGHT_SHOULDER = 12
        RIGHT_ELBOW = 14
        RIGHT_WRIST = 16

        # ----------------------------------------------------
        # Select arm
        # ----------------------------------------------------

        left_shoulder = landmarks[LEFT_SHOULDER]
        left_elbow = landmarks[LEFT_ELBOW]
        left_wrist = landmarks[LEFT_WRIST]

        right_shoulder = landmarks[RIGHT_SHOULDER]
        right_elbow = landmarks[RIGHT_ELBOW]
        right_wrist = landmarks[RIGHT_WRIST]

        left_visibility = (
            left_shoulder.visibility +
            left_elbow.visibility +
            left_wrist.visibility
        )

        right_visibility = (
            right_shoulder.visibility +
            right_elbow.visibility +
            right_wrist.visibility
        )

        if right_visibility >= left_visibility:

            self.active_arm = "Right"

            shoulder = right_shoulder
            elbow = right_elbow
            wrist = right_wrist

        else:

            self.active_arm = "Left"

            shoulder = left_shoulder
            elbow = left_elbow
            wrist = left_wrist

        # ----------------------------------------------------
        # Calculate elbow angle
        # ----------------------------------------------------

        a = [shoulder.x, shoulder.y]
        b = [elbow.x, elbow.y]
        c = [wrist.x, wrist.y]

        raw_angle = calculate_angle(a, b, c)

        angle = self.angle_smoother.update(raw_angle)

        # Track ROM
        self.min_angle = min(self.min_angle, angle)
        self.max_angle = max(self.max_angle, angle)

        # ----------------------------------------------------
        # Rep counting
        # ----------------------------------------------------

        # Arm extended
        if angle > 150:

            self.stage = "down"

        # Arm contracted
        if angle < 50 and self.stage == "down":

            self.stage = "up"
            self.reps += 1

        # ----------------------------------------------------
        # Feedback
        # ----------------------------------------------------

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

        # MediaPipe landmark indexes
        LEFT_HIP = 23
        LEFT_KNEE = 25
        LEFT_ANKLE = 27

        RIGHT_HIP = 24
        RIGHT_KNEE = 26
        RIGHT_ANKLE = 28

        # ----------------------------------------------------
        # Left knee
        # ----------------------------------------------------

        left_angle = calculate_angle(
            [landmarks[LEFT_HIP].x, landmarks[LEFT_HIP].y],
            [landmarks[LEFT_KNEE].x, landmarks[LEFT_KNEE].y],
            [landmarks[LEFT_ANKLE].x, landmarks[LEFT_ANKLE].y]
        )

        # ----------------------------------------------------
        # Right knee
        # ----------------------------------------------------

        right_angle = calculate_angle(
            [landmarks[RIGHT_HIP].x, landmarks[RIGHT_HIP].y],
            [landmarks[RIGHT_KNEE].x, landmarks[RIGHT_KNEE].y],
            [landmarks[RIGHT_ANKLE].x, landmarks[RIGHT_ANKLE].y]
        )

        left_angle = self.left_smoother.update(left_angle)
        right_angle = self.right_smoother.update(right_angle)

        # Average knee angle
        angle = (left_angle + right_angle) / 2

        # ----------------------------------------------------
        # Rep counting
        # ----------------------------------------------------

        # Going down
        if angle < 110:

            self.stage = "down"

        # Coming back up = one rep
        if angle > 160 and self.stage == "down":

            self.stage = "up"
            self.reps += 1

        # ----------------------------------------------------
        # Depth feedback
        # ----------------------------------------------------

        if angle < 90:

            depth = "Deep"

        elif angle < 110:

            depth = "Good"

        else:

            depth = "Shallow"

        # ----------------------------------------------------
        # Feedback
        # ----------------------------------------------------

        if depth == "Deep":

            feedback = "Excellent squat depth"

        elif depth == "Good":

            feedback = "Good squat depth"

        else:

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

        else:

            raise ValueError(
                f"Unsupported exercise: {exercise}"
            )

    def update(self, landmarks):

        return self.analyzer.update(landmarks)

    def get_reps(self):

        return self.analyzer.reps

    def reset(self):

        self.set_exercise(self.exercise)