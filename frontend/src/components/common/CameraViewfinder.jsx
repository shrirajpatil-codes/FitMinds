import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Video,
  VideoOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Aperture,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export const CameraViewfinder = ({
  onRepDetected,
  activeExerciseName = 'Exercise',
  targetReps = 15,
  autoStart = false,
  className = ''
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  const [permissionState, setPermissionState] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showHudOverlay, setShowHudOverlay] = useState(true);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // List available video input devices
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
          getDevices(); // Refresh list to obtain real device names after permission grant
          startMeshAnimation();
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
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser site settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionState('error');
        setErrorMessage('No camera device found on your device.');
      } else {
        setPermissionState('error');
        setErrorMessage(err.message || 'Failed to start camera. Please check your camera settings.');
      }
    }
  };

  // Futuristic Canvas Overlay Animation (Pose Mesh Simulation)
  const startMeshAnimation = () => {
    const draw = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || video.paused || video.ended) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showHudOverlay) {
        const w = canvas.width;
        const h = canvas.height;
        const time = Date.now() * 0.003;

        // Bounding Pose Guide Box
        const boxWidth = w * 0.5;
        const boxHeight = h * 0.75;
        const boxX = (w - boxWidth) / 2;
        const boxY = (h - boxHeight) / 2;

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        ctx.setLineDash([]);

        // Animated Corner Brackets
        const cornerLen = 20;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;

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

        // Scanning Laser Line
        const scanY = boxY + ((Math.sin(time) + 1) / 2) * boxHeight;
        const grad = ctx.createLinearGradient(boxX, scanY, boxX + boxWidth, scanY);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.8)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boxX, scanY);
        ctx.lineTo(boxX + boxWidth, scanY);
        ctx.stroke();

        // Simulated Joint Nodes
        const headX = w / 2;
        const headY = boxY + boxHeight * 0.15 + Math.sin(time * 2) * 4;
        const spineY = boxY + boxHeight * 0.45;
        const lShoulderX = headX - boxWidth * 0.25;
        const rShoulderX = headX + boxWidth * 0.25;
        const shoulderY = boxY + boxHeight * 0.28;

        const points = [
          { x: headX, y: headY },
          { x: lShoulderX, y: shoulderY },
          { x: rShoulderX, y: shoulderY },
          { x: headX, y: spineY }
        ];

        // Draw Skeleton Connections
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(headX, spineY);
        ctx.moveTo(lShoulderX, shoulderY);
        ctx.lineTo(rShoulderX, shoulderY);
        ctx.stroke();

        // Draw joint dots
        points.forEach(pt => {
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 9 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
          ctx.fill();
        });
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

        {/* Pose Mesh HUD Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
            isCameraOn ? 'block' : 'hidden'
          }`}
        />

        {/* ACTIVE CAMERA TOP HUD */}
        {isCameraOn && (
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 pointer-events-auto">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Live Camera Active
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setShowHudOverlay(!showHudOverlay)}
                className={`p-2 rounded-xl text-xs font-medium backdrop-blur-md transition-colors border ${
                  showHudOverlay
                    ? 'bg-brand/20 border-brand/40 text-brand'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle AI Grid Overlay"
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
                Live Camera Viewfinder
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Click here or press the button below to grant permission and open your live webcam feed.
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
              Enable Camera & Ask Permission
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

      {/* BOTTOM ACTION & SETTINGS TOOLBAR */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Local processing — Secure & Private</span>
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
                Snapshot
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
                Camera Photo Captured
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
              <span>Captured from live camera feed</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `fitminds-snapshot-${Date.now()}.jpg`;
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
