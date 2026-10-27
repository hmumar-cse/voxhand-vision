import React, { useEffect } from 'react';
import {
  Camera,
  CameraOff,
  Eye,
  EyeOff,
  FlipHorizontal,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
} from 'lucide-react';
import {
  DebounceState,
  GestureId,
  HandFeatures,
  TelemetryMetrics,
} from '../types/voxhand';
import {
  FINGERTIP_IDS,
  GESTURE_CATALOG,
  HAND_CONNECTIONS,
  MIDDLE_MCP,
  WRIST,
} from '../utils/gestureClassifier';

interface PrimaryViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  telemetry: TelemetryMetrics;
  features: HandFeatures | null;
  debounceState: DebounceState;
  isMirrored: boolean;
  showLandmarks: boolean;
  isPaused: boolean;
  isSimulating: boolean;
  simulatedGesture: GestureId;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onToggleMirror: () => void;
  onToggleLandmarks: () => void;
  onTogglePause: () => void;
  onResetBuffer: () => void;
  onToggleSimulation: () => void;
  onSelectSimGesture: (id: GestureId) => void;
  cameraError: string | null;
}

export const PrimaryViewport: React.FC<PrimaryViewportProps> = ({
  videoRef,
  canvasRef,
  telemetry,
  features,
  debounceState,
  isMirrored,
  showLandmarks,
  isPaused,
  isSimulating,
  simulatedGesture,
  onStartCamera,
  onStopCamera,
  onToggleMirror,
  onToggleLandmarks,
  onTogglePause,
  onResetBuffer,
  onToggleSimulation,
  onSelectSimGesture,
  cameraError,
}) => {
  // Draw overlay on canvas whenever features or debounceState updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Draw background grid if in Synthetic Simulation Mode or Standby
    if (telemetry.cameraStatus !== 'ACTIVE' || isSimulating) {
      const grad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        40,
        w * 0.5,
        h * 0.5,
        w * 0.7
      );
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle technical grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    if (features) {
      // Map normalized coordinates to canvas dimensions (respecting mirror setting)
      const pts: [number, number][] = features.rawPts.map((p) => [
        (isMirrored ? 1.0 - p[0] : p[0]) * w,
        p[1] * h,
      ]);

      const isHighConf = debounceState.confidence >= 0.8;
      const isEmergency =
        debounceState.priority === 'CRITICAL' && isHighConf;

      // 1. Draw Skeletal Landmark Overlay (if enabled)
      if (showLandmarks) {
        // Joint connecting bones with subtle glow
        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = isEmergency
          ? '#f43f5e'
          : isHighConf
          ? '#10b981'
          : '#f59e0b';
        ctx.shadowColor = isEmergency
          ? 'rgba(244, 63, 94, 0.45)'
          : isHighConf
          ? 'rgba(16, 185, 129, 0.45)'
          : 'rgba(245, 158, 11, 0.4)';
        ctx.shadowBlur = 8;

        for (const [a, b] of HAND_CONNECTIONS) {
          ctx.beginPath();
          ctx.moveTo(pts[a][0], pts[a][1]);
          ctx.lineTo(pts[b][0], pts[b][1]);
          ctx.stroke();
        }
        ctx.restore();

        // 21 Landmark Nodes
        for (let i = 0; i < pts.length; i++) {
          const [px, py] = pts[i];
          const isWrist = i === WRIST;
          const isTip = FINGERTIP_IDS.includes(i);
          const radius = isWrist ? 6.5 : isTip ? 5.5 : 4;

          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fillStyle = isWrist
            ? '#ef4444'
            : isTip
            ? '#38bdf8'
            : i === MIDDLE_MCP
            ? '#a855f7'
            : '#f8fafc';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }, [
    features,
    debounceState,
    isMirrored,
    showLandmarks,
    telemetry.cameraStatus,
    isSimulating,
    canvasRef,
  ]);

  const isWebcamLive = telemetry.cameraStatus === 'ACTIVE';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
      {/* Top Card Subheader */}
      <div className="px-4 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-4 ring-slate-900/10" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
            Primary Optical Viewport &middot; 21-Keypoint 3D Hand Mesh
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {!isWebcamLive ? (
            <button
              type="button"
              onClick={onStartCamera}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enable Live Webcam</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopCamera}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Stop Webcam</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              isSimulating
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Run real-time 21-point synthetic hand kinematics through the exact MediaPipe classifier when testing without a physical camera"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isSimulating ? 'SimBench: ON' : 'SimBench: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Video & Absolute Canvas Container */}
      <div className="relative flex-1 bg-slate-950 min-h-[390px] sm:min-h-[460px] flex items-center justify-center overflow-hidden">
        {/* Mirrored Live Camera Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-contain max-h-[540px] transition-opacity duration-200 ${
            isWebcamLive && !isSimulating
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none absolute'
          } ${isMirrored ? '-scale-x-100' : ''}`}
        />

        {/* Absolute-Positioned Transparent <canvas> Overlay */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Top-Left Live Telemetry HUD Pill inside Viewport */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-slate-200 flex items-center gap-2.5 shadow-md">
            <span>
              HOLD BUFFER:{' '}
              <strong className="text-emerald-400">
                {Math.round(debounceState.holdDurationMs)}ms
              </strong>{' '}
              / {debounceState.requiredHoldMs}ms
            </span>
            <span className="text-slate-600">|</span>
            <span>
              SPAN:{' '}
              <strong className="text-sky-300">
                {features ? features.palmSpan.toFixed(3) : '0.000'}
              </strong>
            </span>
            {features && (
              <>
                <span className="text-slate-600">|</span>
                <span>
                  ROLL:{' '}
                  <strong className="text-indigo-300">
                    {features.handRollDeg.toFixed(0)}&deg;
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Camera Error Banner if User Denied / No Webcam */}
        {cameraError && (
          <div className="absolute top-14 left-3.5 right-3.5 bg-amber-950/90 backdrop-blur-xs border border-amber-500/60 text-amber-100 px-3.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between shadow-lg">
            <span>
              Webcam notice: {cameraError} — Running deterministic 21-keypoint
              kinematic emulation so all pipeline stages can be validated.
            </span>
          </div>
        )}

        {/* Standby Empty State if neither Webcam nor SimBench is running */}
        {!isWebcamLive && !isSimulating && (
          <div className="relative z-10 text-center max-w-md px-6 py-8 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 shadow-xl">
            <Camera className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">
              Optical Feed in Standby
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Start your webcam for live 30+ FPS MediaPipe Hands skeletal
              tracking, or enable the Synthetic Kinematic Bench to test gestures
              deterministically.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={onStartCamera}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Start Live Webcam
              </button>
              <button
                type="button"
                onClick={onToggleSimulation}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer"
              >
                Launch Kinematic SimBench
              </button>
            </div>
          </div>
        )}

        {/* Floating Video Control Pills (Bottom Center) */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl">
          <button
            type="button"
            onClick={onToggleMirror}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              isMirrored
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Flip Camera Horizontally"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Flip Camera</span>
          </button>

          <button
            type="button"
            onClick={onToggleLandmarks}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              showLandmarks
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle 21-Point Skeletal Landmarks Overlay"
          >
            {showLandmarks ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span>Landmarks</span>
          </button>

          <button
            type="button"
            onClick={onTogglePause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              isPaused
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Pause / Resume Optical Inference Feed"
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
            <span>{isPaused ? 'Resume Feed' : 'Pause Feed'}</span>
          </button>

          <button
            type="button"
            onClick={onResetBuffer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-rose-300 hover:bg-rose-950/70 hover:text-rose-200 transition-all cursor-pointer"
            title="Reset Gesture Accumulator & Sentence Buffer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Buffer</span>
          </button>
        </div>
      </div>

      {/* Kinematic Simulation Selector Bar */}
      {isSimulating && (
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-bold text-slate-800">INJECT SIGN:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {GESTURE_CATALOG.map((g) => {
              const isSelected = simulatedGesture === g.id;
              const isEmergency = g.priority === 'CRITICAL';
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onSelectSimGesture(g.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                    isSelected
                      ? isEmergency
                        ? 'bg-rose-600 text-white font-bold shadow-xs'
                        : 'bg-slate-900 text-white font-bold shadow-xs'
                      : isEmergency
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200/90'
                  }`}
                >
                  {g.id}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
