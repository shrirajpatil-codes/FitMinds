import cv2

from pose_detector import PoseDetector
from exercise_analyzer import ExerciseEngine


# ============================================================
# SETTINGS
# ============================================================

EXERCISE = "bicep"
# Change to "squat" when testing squats


# ============================================================
# INITIALIZE
# ============================================================

detector = PoseDetector()
engine = ExerciseEngine(EXERCISE)

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise RuntimeError("❌ Could not open webcam")

print("\n===================================")
print("       FITNESS MIRROR CV")
print("===================================")
print(f"Exercise : {EXERCISE}")
print("Press Q to stop")
print("===================================\n")


# ============================================================
# CAMERA LOOP
# ============================================================

try:

    while True:

        ret, frame = cap.read()

        if not ret:
            print("❌ Failed to read frame")
            break

        # Pose detection
        result = detector.process(frame)
        # Draw pose skeleton
        if result and len(result.pose_landmarks) > 0:

            landmarks = result.pose_landmarks[0]

    # MediaPipe pose connections
            connections = [
            # Face
            (0, 1), (1, 2), (2, 3), (3, 7),
            (0, 4), (4, 5), (5, 6), (6, 8),

            # Torso
            (11, 12),
            (11, 23),
            (12, 24),
            (23, 24),

            # Left arm
            (11, 13),
            (13, 15),

            # Right arm
            (12, 14),
            (14, 16),

            # Left leg
            (23, 25),
            (25, 27),

            # Right leg
            (24, 26),
            (26, 28),
        ]

        h, w, _ = frame.shape

        # Draw joints
        for landmark in landmarks:

            x = int(landmark.x * w)
            y = int(landmark.y * h)

            if 0 <= x < w and 0 <= y < h:
                cv2.circle(
                    frame,
                    (x, y),
                    5,
                    (0, 255, 0),
                    -1
                )

        # Draw bones
        for start, end in connections:

            x1 = int(landmarks[start].x * w)
            y1 = int(landmarks[start].y * h)

            x2 = int(landmarks[end].x * w)
            y2 = int(landmarks[end].y * h)

            cv2.line(
                frame,
                (x1, y1),
                (x2, y2),
                (255, 255, 255),
                2
            )

        # Exercise analysis
        if result and len(result.pose_landmarks) > 0:

            landmarks = result.pose_landmarks[0]

            data = engine.update(landmarks)

            # Display
            cv2.putText(
                frame,
                f"Exercise: {data['exercise']}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Reps: {data['reps']}",
                (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Angle: {data['angle']}",
                (20, 120),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Feedback: {data['feedback']}",
                (20, 160),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            if EXERCISE == "squat":

                cv2.putText(
                    frame,
                    f"Depth: {data['depth']}",
                    (20, 200),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 255, 0),
                    2
                )

        else:

            cv2.putText(
                frame,
                "No person detected",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                2
            )

        # Show webcam
        cv2.imshow(
            "Fitness Mirror - CV Demo",
            frame
        )

        # Press Q to quit
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break


finally:

    cap.release()
    cv2.destroyAllWindows()
    detector.close()

    print("\n===================================")
    print("       WORKOUT SUMMARY")
    print("===================================")
    print(f"Exercise : {EXERCISE}")
    print(f"Total Reps: {engine.get_reps()}")
    print("===================================")