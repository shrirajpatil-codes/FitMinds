import os
import time
import cv2
import mediapipe as mp


class PoseDetector:
    """
    Lightweight MediaPipe Pose Landmarker wrapper.

    Input:
        OpenCV BGR frame

    Output:
        MediaPipe pose detection result
    """

    def __init__(self, model_path=None):

        if model_path is None:
            model_path = os.path.join(
                os.path.dirname(__file__),
                "pose_landmarker_lite.task"
            )

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Pose model not found: {model_path}"
            )

        BaseOptions = mp.tasks.BaseOptions
        PoseLandmarker = mp.tasks.vision.PoseLandmarker
        PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        options = PoseLandmarkerOptions(
            base_options=BaseOptions(
                model_asset_path=model_path
            ),
            running_mode=VisionRunningMode.VIDEO,
            num_poses=1
        )

        self.landmarker = PoseLandmarker.create_from_options(options)

        # MediaPipe VIDEO mode requires monotonically increasing timestamps.
        self.start_time = time.monotonic()
        self.last_timestamp_ms = -1

        print("✅ Pose Detector ready")

    def process(self, frame):
        """
        Process one OpenCV frame.

        Returns:
            MediaPipe PoseLandmarkerResult
        """

        if frame is None:
            return None

        # OpenCV uses BGR, MediaPipe expects RGB.
        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        # Generate monotonically increasing timestamp.
        timestamp_ms = int(
            (time.monotonic() - self.start_time) * 1000
        )

        # Safety check against timestamp errors.
        if timestamp_ms <= self.last_timestamp_ms:
            timestamp_ms = self.last_timestamp_ms + 1

        self.last_timestamp_ms = timestamp_ms

        result = self.landmarker.detect_for_video(
            mp_image,
            timestamp_ms
        )

        return result

    def close(self):
        """Release MediaPipe resources."""

        if self.landmarker is not None:
            self.landmarker.close()

        print("✅ Pose Detector closed")