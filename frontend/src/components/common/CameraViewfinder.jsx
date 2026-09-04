import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  RefreshCw,
  VideoOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Aperture,
  ShieldCheck,
  Activity,
  AlertTriangle,
  UserX
} from 'lucide-react';
import { Button } from './Button';
import { analyzeExercisePosture } from '../../utils/postureAnalyzer';
import { CVExerciseEngine } from '../../utils/cvExerciseEngine';
import { Pose } from '@mediapipe/pose';

export const CameraViewfinder = ({
  onRepDetected,
  activeExerciseName = 'Squats',
  targetReps = 15,
  autoStart = false,
  className = ''
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const poseRef = useRef(null);

  const [permissionState, setPermissionState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showHudOverlay, setShowHudOverlay] = useState(true);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Fully Automatic Human Detection State
  const [isHumanDetected, setIsHumanDetected] = useState(false);

  // Live Posture Engine State
  const [postureMetrics, setPostureMetrics] = useState({
    postureState: 'NO_HUMAN',
    postureScore: 0,
    feedbackMessage: 'No human detected on screen. Please step into camera view.',
    keyAngle: 0,
    angleName: 'Posture Angle',
    targetAngleRange: 'N/A'
  });

  const [formLog, setFormLog] = useState([]);
  const cvEngineRef = useRef(new CVExerciseEngine(activeExerciseName));
  const lastRepsRef = useRef(0);
  const latestLandmarksRef = useRef(null);
  const isProcessingFrameRef = useRef(false);

  useEffect(() => {
    if (cvEngineRef.current) {
      cvEngineRef.current.setExercise(activeExerciseName);
      lastRepsRef.current = 0;
    }
  }, [activeExerciseName]);

  // Initialize Real MediaPipe Pose Model
  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results) => {
      isProcessingFrameRef.current = false;
      if (results.poseLandmarks && results.poseLandmarks.length > 0) {
        latestLandmarksRef.current = results.poseLandmarks;
        setIsHumanDetected(true);
      } else {
        latestLandmarksRef.current = null;
        setIsHumanDetected(false);
      }
    });

    poseRef.current = pose;

    return () => {
      if (poseRef.current) {
        try {
          poseRef.current.close();
        } catch (e) {
          console.warn('Pose close warning:', e);
        }
      }
    };
  }, []);

  const getDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devices.filter(d => d.kind === 'videoinput');
        setAvailableDevices(videoDevs);
      }
    } catch (err) {
      console.warn('Unable to enumerate camera devices:', err);
    }
  };

  useEffect(() => {
    getDevices();
    if (autoStart) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    latestLandmarksRef.current = null;
    setIsCameraOn(false);
    setIsHumanDetected(false);
  };

  const startCamera = async (deviceIdOverride, facingModeOverride) => {
    setPermissionState('requesting');
    setErrorMessage('');
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState('error');
      setErrorMessage('Camera access is not supported by your current browser.');
      return;
    }

    try {
      const mode = facingModeOverride || facingMode;
      const deviceId = deviceIdOverride !== undefined ? deviceIdOverride : selectedDeviceId;

      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.warn('Video play error:', e));
          setIsCameraOn(true);
          setPermissionState('granted');
          getDevices();
          startPostureMeshLoop();
        };
      } else {
        setIsCameraOn(true);
        setPermissionState('granted');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraOn(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionState('error');
        setErrorMessage('No camera device found on your device.');
      } else {
        setPermissionState('error');
        setErrorMessage(err.message || 'Failed to start camera. Please check camera settings.');
      }
    }
  };

  // Real-Time Posture Correction Loop using Official MediaPipe Pose ML Model
  const startPostureMeshLoop = () => {
    const draw = async () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video || video.paused || video.ended) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Send live video frame to MediaPipe Pose ML Model
      if (poseRef.current && !isProcessingFrameRef.current && video.readyState >= 2) {
        isProcessingFrameRef.current = true;
        try {
          await poseRef.current.send({ image: video });
        } catch (err) {
          console.warn('MediaPipe Pose frame send error:', err);
          isProcessingFrameRef.current = false;
        }
      }

      const ctx = canvas.getContext('2d');
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const landmarks = latestLandmarksRef.current;

      if (!landmarks || landmarks.length === 0) {
        // Render No person detected (matching main.py fallback)
        if (showHudOverlay) {
          ctx.font = 'bold 22px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#ff0000';
          ctx.fillText('No person detected', 20, 42);
        }

        setPostureMetrics({
          postureState: 'NO_HUMAN',
          postureScore: 0,
          feedbackMessage: 'No person detected on screen. Step into camera view.',
          keyAngle: 0,
          angleName: 'Posture Angle',
          targetAngleRange: 'N/A'
        });

        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Execute CV Engine analysis on real MediaPipe Pose landmarks
      const cvResult = cvEngineRef.current.update(landmarks);

      if (cvResult.reps > lastRepsRef.current) {
        lastRepsRef.current = cvResult.reps;
        if (onRepDetected) onRepDetected(cvResult);
      }

      const analysis = {
        postureState: cvResult.postureState || 'PERFECT',
        postureScore: cvResult.formScore || 96,
        feedbackMessage: cvResult.feedback || 'Good form! Keep going.',
        keyAngle: cvResult.angle || 160,
        angleName: cvResult.keyAngleName || 'Joint Angle',
        targetAngleRange: cvResult.targetRange || 'Standard',
        voiceCue: cvResult.voiceCue || '',
        reps: cvResult.reps,
        stage: cvResult.stage,
        depth: cvResult.depth,
        rom: cvResult.rom
      };

      setPostureMetrics(analysis);

      if (showHudOverlay) {
        // Convert MediaPipe normalized landmark coordinates (0..1) to canvas pixel coordinates
        // Handle horizontal mirroring when facingMode === 'user' (matching -scale-x-100 on video)
        const isMirrored = facingMode === 'user';
        const lmPx = (idx) => {
          if (!landmarks[idx]) return { x: 0, y: 0 };
          const normX = isMirrored ? (1 - landmarks[idx].x) : landmarks[idx].x;
          return {
            x: normX * w,
            y: landmarks[idx].y * h
          };
        };

        // MediaPipe Pose Connections (matching ml/CV_model/main.py connections)
        const connections = [
          // Face Connections
          [0, 1], [1, 2], [2, 3], [3, 7],
          [0, 4], [4, 5], [5, 6], [6, 8],
          // Torso Connections
          [11, 12], [11, 23], [12, 24], [23, 24],
          // Left Arm Connections
          [11, 13], [13, 15],
          // Right Arm Connections
          [12, 14], [14, 16],
          // Left Leg Connections
          [23, 25], [25, 27],
          // Right Leg Connections
          [24, 26], [26, 28]
        ];

        // Draw Solid White Bones (matching cv2.line(frame, (x1,y1), (x2,y2), (255,255,255), 2))
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        connections.forEach(([s, e]) => {
          if (landmarks[s] && landmarks[e] && (landmarks[s].visibility === undefined || landmarks[s].visibility > 0.3)) {
            const p1 = lmPx(s);
            const p2 = lmPx(e);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        });
        ctx.stroke();

        // Render Green Filled Joint Circles for ALL detected landmarks (matching cv2.circle(frame, (x,y), 5, (0,255,0), -1))
        landmarks.forEach(landmark => {
          if (landmark && (landmark.visibility === undefined || landmark.visibility > 0.3)) {
            const normX = isMirrored ? (1 - landmark.x) : landmark.x;
            const x = normX * w;
            const y = landmark.y * h;
            if (x >= 0 && x < w && y >= 0 && y < h) {
              ctx.fillStyle = '#00ff00';
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });

        // Render CV Model Main.py Telemetry Overlay (Top-Left HUD - matching OpenCV cv2.putText)
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'left';

        // Exercise Name (Green)
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`Exercise: ${activeExerciseName}`, 20, 42);

        // Reps (Green)
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`Reps: ${analysis.reps}`, 20, 80);

        // Angle (White)
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Angle: ${analysis.keyAngle}`, 20, 116);

        // Feedback (Green)
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`Feedback: ${analysis.feedbackMessage}`, 20, 152);

        // Depth (Yellow, if Squat)
        if (analysis.depth) {
          ctx.fillStyle = '#ffff00';
          ctx.fillText(`Depth: ${analysis.depth}`, 20, 188);
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (permissionState === 'granted' || isCameraOn) {
      startCamera(null, nextMode);
    }
  };

  const handleDeviceChange = (e) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    if (permissionState === 'granted' || isCameraOn) {
      startCamera(devId);
    }
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !isCameraOn) return;

    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedPhoto(dataUrl);
    setShowPhotoModal(true);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl ${className}`}>
      {/* Video Viewfinder Container */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Flash Effect on Snapshot */}
        {isFlashActive && (
          <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
        )}

        {/* Real Live HTML5 Webcam Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            facingMode === 'user' ? '-scale-x-100' : ''
          } ${isCameraOn ? 'opacity-100' : 'opacity-0 hidden'}`}
        />

        {/* Real-time Posture Mesh HUD Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
            isCameraOn ? 'block' : 'hidden'
          }`}
        />



        {/* ACTIVE CAMERA CONTROLS (TOP RIGHT) */}
        {isCameraOn && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setShowHudOverlay(!showHudOverlay)}
              className={`p-2 rounded-xl text-xs font-medium backdrop-blur-md transition-colors border ${
                showHudOverlay
                  ? 'bg-brand/20 border-brand/40 text-brand'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle AI Skeleton Overlay"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleFacingMode}
              className="p-2 rounded-xl text-xs font-medium bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Flip Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* IDLE STATE */}
        {permissionState === 'idle' && !isCameraOn && (
          <div
            onClick={() => startCamera()}
            className="group cursor-pointer text-center space-y-4 p-6 z-10 max-w-md mx-auto transition-transform hover:scale-105 duration-200"
          >
            <div className="w-20 h-20 rounded-3xl bg-brand/10 border border-brand/30 group-hover:border-brand group-hover:bg-brand/20 flex items-center justify-center text-brand mx-auto shadow-brand-glow transition-all">
              <Camera className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-brand transition-colors">
                Live AI Posture Correction Camera
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Click here or press the button below to grant camera permission. Real-time automatic human detection & posture correction will start immediately.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              leftIcon={Camera}
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
              className="w-full sm:w-auto px-8 py-3 shadow-brand-glow"
            >
              Open Camera & Start Posture Analysis
            </Button>
          </div>
        )}

        {/* REQUESTING PERMISSION STATE */}
        {permissionState === 'requesting' && (
          <div className="text-center space-y-4 p-6 z-10 max-w-sm mx-auto animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-brand/50 text-brand flex items-center justify-center mx-auto animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">Requesting Camera Access...</h4>
              <p className="text-xs text-slate-400 mt-1">
                Please click <strong className="text-brand">"Allow"</strong> on your browser's camera permission prompt.
              </p>
            </div>
          </div>
        )}

        {/* DENIED / ERROR STATE */}
        {(permissionState === 'denied' || permissionState === 'error') && (
          <div className="text-center space-y-4 p-6 z-10 max-w-md mx-auto animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">Camera Access Blocked or Unavailable</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {errorMessage || 'Camera permission was denied. Please allow camera access in browser site settings.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={RefreshCw}
                onClick={() => startCamera()}
              >
                Grant Permission / Try Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION & TOOLBAR */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Local Biomechanical Processing — 100% Private</span>
        </div>

        <div className="flex items-center gap-2">
          {availableDevices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand"
            >
              {availableDevices.map((dev, idx) => (
                <option key={dev.deviceId} value={dev.deviceId}>
                  {dev.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          {isCameraOn ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Aperture}
                onClick={handleTakeSnapshot}
              >
                Form Snapshot
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={VideoOff}
                onClick={stopCamera}
                className="text-rose-400 hover:text-rose-300 border-rose-900/50 hover:bg-rose-950/40"
              >
                Turn Off Camera
              </Button>
            </>
          ) : (
            <Button
              variant="brand"
              size="sm"
              leftIcon={Camera}
              onClick={() => startCamera()}
            >
              Turn On Camera
            </Button>
          )}
        </div>
      </div>

      {/* SNAPSHOT PREVIEW MODAL */}
      {showPhotoModal && capturedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Posture Check Snapshot Captured
              </h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <img src={capturedPhoto} alt="Captured Workout Snapshot" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Form Accuracy: {postureMetrics.postureScore}%</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `fitmirror-posture-${Date.now()}.jpg`;
                  link.href = capturedPhoto;
                  link.click();
                }}
              >
                Download Photo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
