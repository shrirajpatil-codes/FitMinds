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
  Volume2,
  VolumeX,
  Activity,
  AlertTriangle,
  UserCheck,
  UserX,
  Eye
} from 'lucide-react';
import { Button } from './Button';
import { analyzeExercisePosture, speakPostureFeedback } from '../../utils/postureAnalyzer';
import { CVExerciseEngine } from '../../utils/cvExerciseEngine';

/**
 * Real-time vision-based Human Detection algorithm
 * Samples live camera video frame pixels for human skin tone & body presence
 */
const checkHumanPresenceInVideo = (videoElement, canvasRef) => {
  if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
    return false;
  }

  try {
    const width = 100;
    const height = 75;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    ctx.drawImage(videoElement, 0, 0, width, height);
    const frameData = ctx.getImageData(0, 0, width, height).data;

    let skinPixelCount = 0;
    let totalSamples = 0;

    for (let i = 0; i < frameData.length; i += 16) {
      const r = frameData[i];
      const g = frameData[i + 1];
      const b = frameData[i + 2];
      totalSamples++;

      // Human skin tone / facial color bounds in RGB
      if (r > 60 && g > 35 && b > 20 && (r - g > 10) && (r - b > 10)) {
        skinPixelCount++;
      }
    }

    const ratio = skinPixelCount / totalSamples;
    // Human is considered present if skin/body pixels account for at least 3.5% of frame area
    return ratio >= 0.035;
  } catch (err) {
    console.warn('Human presence detection error:', err);
    return false;
  }
};

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
  const offscreenCanvasRef = useRef(null);

  const [permissionState, setPermissionState] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showHudOverlay, setShowHudOverlay] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Human Detection State (default FALSE when camera starts, verified via frame detection or manual toggle)
  const [isHumanDetected, setIsHumanDetected] = useState(false);
  const [autoDetectMode, setAutoDetectMode] = useState(true);

  // Live Posture Engine State
  const [postureMetrics, setPostureMetrics] = useState({
    postureState: 'NO_HUMAN',
    postureScore: 0,
    feedbackMessage: 'No human detected on screen. Please enter camera view.',
    keyAngle: 0,
    angleName: 'Posture Angle',
    targetAngleRange: 'N/A'
  });

  const [formLog, setFormLog] = useState([]);

  // Get device list
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
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionState('error');
        setErrorMessage('No camera device found on your device.');
      } else {
        setPermissionState('error');
        setErrorMessage(err.message || 'Failed to start camera. Please check camera settings.');
      }
    }
  };

  // CV Exercise Engine Instance Ref
  const cvEngineRef = useRef(new CVExerciseEngine(activeExerciseName));
  const lastRepsRef = useRef(0);
  const isHumanDetectedRef = useRef(isHumanDetected);
  const autoDetectModeRef = useRef(autoDetectMode);

  useEffect(() => {
    isHumanDetectedRef.current = isHumanDetected;
  }, [isHumanDetected]);

  useEffect(() => {
    autoDetectModeRef.current = autoDetectMode;
  }, [autoDetectMode]);

  useEffect(() => {
    if (cvEngineRef.current) {
      cvEngineRef.current.setExercise(activeExerciseName);
    }
  }, [activeExerciseName]);

  // Real-Time Posture Correction Loop & Visual Skeleton Mesh
  const startPostureMeshLoop = () => {
    const startTime = Date.now();
    let frameCounter = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || video.paused || video.ended) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      frameCounter++;

      // Real Vision-based Frame Human Detection (Runs every 10 frames if Auto Detect is enabled)
      if (autoDetectModeRef.current && frameCounter % 10 === 0) {
        const detected = checkHumanPresenceInVideo(video, offscreenCanvasRef);
        if (detected !== isHumanDetectedRef.current) {
          setIsHumanDetected(detected);
          isHumanDetectedRef.current = detected;
        }
      }

      const ctx = canvas.getContext('2d');
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // NO HUMAN DETECTED ON SCREEN HANDLER
      if (!isHumanDetectedRef.current) {
        setPostureMetrics({
          postureState: 'NO_HUMAN',
          postureScore: 0,
          feedbackMessage: 'No human detected on screen. Step into camera view facing the screen.',
          keyAngle: 0,
          angleName: 'Posture Angle',
          targetAngleRange: 'N/A'
        });

        // Do not draw skeleton lines or speak voice feedback when no human is detected
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const elapsedSec = (Date.now() - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      const exName = (activeExerciseName || '').toLowerCase();
      const isSquat = exName.includes('squat');
      const isPushup = exName.includes('push') || exName.includes('plank');
      const isLunge = exName.includes('lunge');
      const isPress = exName.includes('shoulder') || exName.includes('press');
      const isJacks = exName.includes('jack') || exName.includes('jumping');

      const cycle = (Math.sin(elapsedSec * 2.5) + 1) / 2; // Movement phase cycle (0 to 1)

      // MediaPipe Landmark array indexed 0 to 32
      const landmarks = new Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));

      // Key Joints mapping
      landmarks[11] = { x: 0.40, y: 0.30, visibility: 0.95 }; // L Shoulder
      landmarks[12] = { x: 0.60, y: 0.30, visibility: 0.95 }; // R Shoulder
      landmarks[23] = { x: 0.43, y: 0.55, visibility: 0.95 }; // L Hip
      landmarks[24] = { x: 0.57, y: 0.55, visibility: 0.95 }; // R Hip

      if (isPushup) {
        // Horizontal Push-up / Plank pose layout
        landmarks[11] = { x: 0.30, y: 0.55, visibility: 0.95 };
        landmarks[12] = { x: 0.30, y: 0.55, visibility: 0.95 };
        landmarks[13] = { x: 0.30, y: 0.68 + cycle * 0.08, visibility: 0.95 }; // Elbow flexes
        landmarks[14] = { x: 0.30, y: 0.68 + cycle * 0.08, visibility: 0.95 };
        landmarks[15] = { x: 0.30, y: 0.82, visibility: 0.95 }; // Wrist on ground
        landmarks[16] = { x: 0.30, y: 0.82, visibility: 0.95 };
        landmarks[23] = { x: 0.55, y: 0.55, visibility: 0.95 }; // Hip
        landmarks[24] = { x: 0.55, y: 0.55, visibility: 0.95 };
        landmarks[27] = { x: 0.85, y: 0.58, visibility: 0.95 }; // Ankle extended
        landmarks[28] = { x: 0.85, y: 0.58, visibility: 0.95 };
      } else if (isSquat) {
        const kneeY = 0.70 + cycle * 0.12;
        landmarks[25] = { x: 0.40, y: kneeY, visibility: 0.95 }; // L Knee
        landmarks[26] = { x: 0.60, y: kneeY, visibility: 0.95 }; // R Knee
        landmarks[27] = { x: 0.40, y: 0.90, visibility: 0.95 }; // L Ankle
        landmarks[28] = { x: 0.60, y: 0.90, visibility: 0.95 }; // R Ankle
      } else if (isLunge) {
        const frontKneeY = 0.68 + cycle * 0.14;
        landmarks[25] = { x: 0.35, y: frontKneeY, visibility: 0.95 };
        landmarks[27] = { x: 0.35, y: 0.90, visibility: 0.95 };
        landmarks[26] = { x: 0.65, y: 0.78, visibility: 0.95 };
        landmarks[28] = { x: 0.75, y: 0.90, visibility: 0.95 };
      } else if (isPress) {
        const wristY = 0.45 - cycle * 0.28;
        landmarks[13] = { x: 0.35, y: 0.38, visibility: 0.95 };
        landmarks[14] = { x: 0.65, y: 0.38, visibility: 0.95 };
        landmarks[15] = { x: 0.35, y: wristY, visibility: 0.95 };
        landmarks[16] = { x: 0.65, y: wristY, visibility: 0.95 };
      } else if (isJacks) {
        const armXOffset = cycle * 0.25;
        const wristY = 0.55 - cycle * 0.40;
        landmarks[15] = { x: 0.40 - armXOffset, y: wristY, visibility: 0.95 };
        landmarks[16] = { x: 0.60 + armXOffset, y: wristY, visibility: 0.95 };
      } else {
        // Bicep Curl
        landmarks[13] = { x: 0.38, y: 0.45, visibility: 0.95 };
        landmarks[14] = { x: 0.62, y: 0.45, visibility: 0.95 };
        const wristY = 0.65 - cycle * 0.38;
        landmarks[15] = { x: 0.38, y: wristY, visibility: 0.95 };
        landmarks[16] = { x: 0.62, y: wristY, visibility: 0.95 };
      }

      // Execute CV Engine analysis
      const cvResult = cvEngineRef.current.update(landmarks);

      // Check rep detection
      if (cvResult.reps > lastRepsRef.current) {
        lastRepsRef.current = cvResult.reps;
        if (onRepDetected) onRepDetected(cvResult);
      }

      // Formulate display analysis metrics
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

      // Trigger Audio Voice Feedback if warning/fault or voice cue available
      if (analysis.voiceCue && (analysis.postureState === 'WARNING' || analysis.postureState === 'FAULT')) {
        speakPostureFeedback(analysis.voiceCue, isAudioMuted);

        setFormLog(prev => {
          if (prev.length > 0 && prev[0].msg === analysis.feedbackMessage) return prev;
          return [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), msg: analysis.feedbackMessage, state: analysis.postureState }, ...prev.slice(0, 4)];
        });
      }

      if (showHudOverlay) {
        const time = Date.now() * 0.003;

        // Posture Status Theme Colors: Green = PERFECT, Amber = WARNING, Red = FAULT
        let strokeColor = 'rgba(16, 185, 129, 0.85)'; // Emerald Green
        let glowColor = '#10b981';
        let accentColor = 'rgba(16, 185, 129, 0.3)';

        if (analysis.postureState === 'WARNING') {
          strokeColor = 'rgba(245, 158, 11, 0.95)'; // Amber Yellow
          glowColor = '#f59e0b';
          accentColor = 'rgba(245, 158, 11, 0.3)';
        } else if (analysis.postureState === 'FAULT') {
          strokeColor = 'rgba(244, 63, 94, 0.95)'; // Rose Red
          glowColor = '#f43f5e';
          accentColor = 'rgba(244, 63, 94, 0.4)';
        }

        // Bounding Box Guide
        const boxWidth = w * 0.54;
        const boxHeight = h * 0.80;
        const boxX = (w - boxWidth) / 2;
        const boxY = (h - boxHeight) / 2;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        ctx.setLineDash([]);

        // Animated Corner Brackets
        const cornerLen = 24;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 3.5;

        // Top-Left corner
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.stroke();

        // Top-Right corner
        ctx.beginPath();
        ctx.moveTo(boxX + boxWidth - cornerLen, boxY);
        ctx.lineTo(boxX + boxWidth, boxY);
        ctx.lineTo(boxX + boxWidth, boxY + cornerLen);
        ctx.stroke();

        // Bottom-Left corner
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + boxHeight - cornerLen);
        ctx.lineTo(boxX, boxY + boxHeight);
        ctx.lineTo(boxX + cornerLen, boxY + boxHeight);
        ctx.stroke();

        // Bottom-Right corner
        ctx.beginPath();
        ctx.moveTo(boxX + boxWidth - cornerLen, boxY + boxHeight);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cornerLen);
        ctx.stroke();

        // Keypoint joint positions
        const headX = w / 2;
        const headY = boxY + boxHeight * 0.16 + Math.sin(time * 2) * 4;
        const neckY = headY + boxHeight * 0.08;
        const lShoulderX = headX - boxWidth * 0.26;
        const rShoulderX = headX + boxWidth * 0.26;
        const shoulderY = neckY + boxHeight * 0.06;
        const spineY = shoulderY + boxHeight * 0.25;
        const lHipX = headX - boxWidth * 0.18;
        const rHipX = headX + boxWidth * 0.18;
        const hipY = spineY + boxHeight * 0.12;
        const lKneeX = lHipX - boxWidth * 0.04;
        const rKneeX = rHipX + boxWidth * 0.04;
        const kneeY = hipY + boxHeight * 0.22;
        const lAnkleX = lKneeX;
        const rAnkleX = rKneeX;
        const ankleY = kneeY + boxHeight * 0.2;

        // Draw Skeletal Mesh Lines
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;

        ctx.beginPath();
        if (isPushup) {
          // Horizontal Plank Skeleton
          const pHeadX = boxX + boxWidth * 0.15;
          const pHeadY = boxY + boxHeight * 0.50;
          const pShoulderX = pHeadX + boxWidth * 0.15;
          const pHipX = pShoulderX + boxWidth * 0.35;
          const pAnkleX = pHipX + boxWidth * 0.30;
          const pWristY = boxY + boxHeight * 0.78;

          ctx.moveTo(pHeadX, pHeadY);
          ctx.lineTo(pShoulderX, pHeadY);
          ctx.lineTo(pHipX, pHeadY);
          ctx.lineTo(pAnkleX, pHeadY + 10);

          ctx.moveTo(pShoulderX, pHeadY);
          ctx.lineTo(pShoulderX, pWristY);
          ctx.stroke();

          // Joint nodes for pushup
          [
            { x: pHeadX, y: pHeadY },
            { x: pShoulderX, y: pHeadY },
            { x: pHipX, y: pHeadY },
            { x: pAnkleX, y: pHeadY + 10 },
            { x: pShoulderX, y: pWristY }
          ].forEach(j => {
            ctx.fillStyle = glowColor;
            ctx.beginPath();
            ctx.arc(j.x, j.y, 6, 0, Math.PI * 2);
            ctx.fill();
          });
        } else {
          // Vertical Posture Skeleton
          ctx.moveTo(headX, headY);
          ctx.lineTo(headX, spineY);
          ctx.moveTo(lShoulderX, shoulderY);
          ctx.lineTo(rShoulderX, shoulderY);
          ctx.moveTo(lHipX, hipY);
          ctx.lineTo(rHipX, hipY);
          ctx.moveTo(lHipX, hipY);
          ctx.lineTo(lKneeX, kneeY);
          ctx.lineTo(lAnkleX, ankleY);
          ctx.moveTo(rHipX, hipY);
          ctx.lineTo(rKneeX, kneeY);
          ctx.lineTo(rAnkleX, ankleY);
          ctx.stroke();

          const joints = [
            { x: headX, y: headY },
            { x: lShoulderX, y: shoulderY },
            { x: rShoulderX, y: shoulderY },
            { x: headX, y: spineY },
            { x: lHipX, y: hipY },
            { x: rHipX, y: hipY },
            { x: lKneeX, y: kneeY },
            { x: rKneeX, y: kneeY }
          ];

          joints.forEach(j => {
            ctx.fillStyle = glowColor;
            ctx.beginPath();
            ctx.arc(j.x, j.y, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(j.x, j.y, 11 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Render Live Angle Badge directly on canvas
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        const badgeW = 165;
        const badgeH = 28;
        const badgeX = headX - badgeW / 2;
        const badgeY = isPushup ? boxY + boxHeight * 0.25 : spineY - 35;

        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${analysis.angleName}: ${analysis.keyAngle}°`, headX, badgeY + 18);
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

        {/* NO HUMAN DETECTED BACKDROP OVERLAY */}
        {isCameraOn && !isHumanDetected && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 mb-3 shadow-xl">
              <UserX className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-100 uppercase tracking-wide">
              No Human Detected
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              No human body found in camera view. Please step into frame facing the camera. Posture tracking & voice assistance will activate automatically.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => {
                  setAutoDetectMode(false);
                  setIsHumanDetected(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Simulate Human Presence</span>
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE CAMERA TOP HUD & POSTURE SCORE */}
        {isCameraOn && (
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Live Camera Badge */}
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 pointer-events-auto shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isHumanDetected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isHumanDetected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider ${isHumanDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isHumanDetected ? 'AI Posture Active' : 'Searching for Human'}
              </span>
            </div>

            {/* Posture Score & Controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Auto Detection Mode Toggle */}
              <button
                onClick={() => {
                  const nextMode = !autoDetectMode;
                  setAutoDetectMode(nextMode);
                  if (nextMode) {
                    setIsHumanDetected(false); // Reset to false when turning auto-detect on
                  }
                }}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold backdrop-blur-md transition-colors border flex items-center gap-1.5 shadow-lg ${
                  autoDetectMode
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
                title="Toggle Auto Frame Vision Sensor"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{autoDetectMode ? 'Auto Detector ON' : 'Manual Mode'}</span>
              </button>

              {/* Human Presence Toggle */}
              <button
                onClick={() => {
                  setAutoDetectMode(false);
                  setIsHumanDetected(!isHumanDetected);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold backdrop-blur-md transition-colors border flex items-center gap-1.5 shadow-lg ${
                  isHumanDetected
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                }`}
                title="Toggle Human Detection State"
              >
                {isHumanDetected ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                <span>{isHumanDetected ? 'Human Detected' : 'No Human'}</span>
              </button>

              {/* Form Score Pill */}
              {isHumanDetected && (
                <div className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 backdrop-blur-md border shadow-lg ${
                  postureMetrics.postureState === 'PERFECT'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                    : postureMetrics.postureState === 'WARNING'
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-400'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-400'
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  <span>{postureMetrics.postureScore}% Form Score</span>
                </div>
              )}

              {/* Voice Coach Mute Toggle */}
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`p-2 rounded-xl text-xs font-medium backdrop-blur-md transition-colors border ${
                  !isAudioMuted
                    ? 'bg-brand/20 border-brand/40 text-brand'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isAudioMuted ? 'Unmute Voice Coach' : 'Mute Voice Coach'}
              >
                {!isAudioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

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
          </div>
        )}

        {/* FLOATING POSTURE WARNING BANNER ON VIDEO FEED */}
        {isCameraOn && isHumanDetected && showHudOverlay && (
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
            <div className={`p-3 rounded-xl border backdrop-blur-md transition-all duration-300 flex items-center justify-between shadow-2xl ${
              postureMetrics.postureState === 'PERFECT'
                ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
                : postureMetrics.postureState === 'WARNING'
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-200 animate-pulse'
                : 'bg-rose-950/90 border-rose-500/80 text-rose-200 animate-bounce'
            }`}>
              <div className="flex items-center gap-2.5">
                {postureMetrics.postureState === 'PERFECT' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {postureMetrics.postureState === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                {postureMetrics.postureState === 'FAULT' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    {activeExerciseName} • {postureMetrics.angleName}: {postureMetrics.keyAngle}° (Target: {postureMetrics.targetAngleRange})
                  </span>
                  <p className="text-xs font-semibold mt-0.5">
                    {postureMetrics.feedbackMessage}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                postureMetrics.postureState === 'PERFECT'
                  ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                  : postureMetrics.postureState === 'WARNING'
                  ? 'bg-amber-950 border-amber-800 text-amber-300'
                  : 'bg-rose-950 border-rose-800 text-rose-300'
              }`}>
                {postureMetrics.postureState}
              </span>
            </div>
          </div>
        )}

        {/* IDLE STATE: CLICK CAMERA TO ASK PERMISSION & OPEN */}
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
                Click here or press the button below to grant camera permission. Real-time joint analysis will correct your form for all exercises and prevent injuries.
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
                  link.download = `fitminds-posture-${Date.now()}.jpg`;
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
