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
  simulatedLowConfidence: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onToggleMirror: () => void;
  onToggleLandmarks: () => void;
  onTogglePause: () => void;
  onResetBuffer: () => void;
  onToggleSimulation: () => void;
  onSelectSimGesture: (id: GestureId) => void;
  onToggleSimLowConfidence: () => void;
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
  simulatedLowConfidence,
  onStartCamera,
  onStopCamera,
  onToggleMirror,
  onToggleLandmarks,
  onTogglePause,
  onResetBuffer,
  onToggleSimulation,
  onSelectSimGesture,
  onToggleSimLowConfidence,
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
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Subtle technical grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
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

      // 1. Draw Skeletal Landmark Overlay (if enabled)
      if (showLandmarks) {
        // Joint connecting bones
        ctx.lineWidth = 2.75;
        ctx.strokeStyle =
          debounceState.confidence >= 0.8 ? '#10b981' : '#f59e0b';
        for (const [a, b] of HAND_CONNECTIONS) {
          ctx.beginPath();
          ctx.moveTo(pts[a][0], pts[a][1]);
          ctx.lineTo(pts[b][0], pts[b][1]);
          ctx.stroke();
        }

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

      // 2. Dynamic Bounding Box surrounding the detected hand
      let minX = w,
        minY = h,
        maxX = 0,
        maxY = 0;
      for (const [px, py] of pts) {
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
      }

      const pad = 26;
      const bx = Math.max(8, minX - pad);
      const by = Math.max(38, minY - pad);
      const bw = Math.min(w - bx - 8, maxX - minX + pad * 2);
      const bh = Math.min(h - by - 8, maxY - minY + pad * 2);

      const isHighConf = debounceState.confidence >= 0.8;
      const boxColor = isHighConf ? '#10b981' : '#f59e0b';

      // Dashed bounding box
      ctx.save();
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.restore();

      // Corner brackets for precision optical look
      const cornerLen = 12;
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 3;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(bx, by + cornerLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cornerLen, by);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cornerLen);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(bx, by + bh - cornerLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + cornerLen, by + bh);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - cornerLen);
      ctx.stroke();

      // 3. Inline Tag above bounding box: [Detected Gesture: <Name>] [Score: <Confidence>%]
      const confPct = Math.round(debounceState.confidence * 100);
      const tagText = `[Detected Gesture: ${debounceState.displayName}]  [Score: ${confPct}%]`;
      ctx.font = '600 12px "JetBrains Mono", Consolas, monospace';
      const textWidth = ctx.measureText(tagText).width;
      const tagW = textWidth + 18;
      const tagH = 26;
      const tagX = Math.min(Math.max(8, bx), w - tagW - 8);
      const tagY = Math.max(6, by - tagH - 4);

      ctx.fillStyle = isHighConf
        ? 'rgba(6, 78, 59, 0.92)'
        : 'rgba(120, 53, 15, 0.92)';
      ctx.fillRect(tagX, tagY, tagW, tagH);
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tagX, tagY, tagW, tagH);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(tagText, tagX + 9, tagY + 17);

      // 600ms Hold Progress micro-bar directly along bottom of tag
      if (debounceState.holdProgress > 0) {
        ctx.fillStyle = '#34d399';
        ctx.fillRect(
          tagX,
          tagY + tagH - 3,
          tagW * debounceState.holdProgress,
          3
        );
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
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden h-full">
      {/* Top Card Subheader */}
      <div className="px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-900"></span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
            Primary Optical Viewport (21-Keypoint Skeletal Overlay)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {!isWebcamLive ? (
            <button
              onClick={onStartCamera}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Enable Live Webcam</span>
            </button>
          ) : (
            <button
              onClick={onStopCamera}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition cursor-pointer"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Stop Webcam</span>
            </button>
          )}

          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition cursor-pointer ${
              isSimulating
                ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
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
      <div className="relative flex-1 bg-slate-950 min-h-[380px] sm:min-h-[450px] flex items-center justify-center overflow-hidden">
        {/* Mirrored Live Camera Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-contain max-h-[540px] transition-opacity duration-200 ${
            isWebcamLive && !isSimulating ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'
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
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-xs border border-slate-700 text-[11px] font-mono text-slate-200 flex items-center gap-2">
            <span>
              HOLD DEBOUNCE:{' '}
              <strong className="text-emerald-400">
                {Math.round(debounceState.holdDurationMs)}ms
              </strong>{' '}
              / {debounceState.requiredHoldMs}ms
            </span>
            <span className="text-slate-500">|</span>
            <span>
              SPAN:{' '}
              <strong className="text-sky-300">
                {features ? features.palmSpan.toFixed(3) : '0.000'}
              </strong>
            </span>
          </div>
        </div>

        {/* Camera Error Banner if User Denied / No Webcam */}
        {cameraError && (
          <div className="absolute top-12 left-3 right-3 bg-amber-950/90 border border-amber-500/60 text-amber-100 px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between">
            <span>
              Webcam notice: {cameraError} — Running deterministic 21-keypoint kinematic emulation so all pipeline stages can be validated.
            </span>
          </div>
        )}

        {/* Standby Empty State if neither Webcam nor SimBench is running */}
        {!isWebcamLive && !isSimulating && (
          <div className="relative z-10 text-center max-w-md px-6 py-8 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 shadow-lg">
            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-white mb-1">
              Optical Feed in Standby
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Start your webcam for live 30+ FPS MediaPipe Hands skeletal tracking, or enable the Synthetic Kinematic Bench to test gestures deterministically.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={onStartCamera}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Start Live Webcam
              </button>
              <button
                onClick={onToggleSimulation}
                className="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer"
              >
                Launch Kinematic SimBench
              </button>
            </div>
          </div>
        )}

        {/* Floating Video Control Pills (Bottom Center) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg">
          <button
            onClick={onToggleMirror}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              isMirrored
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Flip Camera Horizontally"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Flip Camera</span>
          </button>

          <button
            onClick={onToggleLandmarks}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              showLandmarks
                ? 'bg-emerald-600/90 text-white'
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
            onClick={onTogglePause}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              isPaused
                ? 'bg-amber-600 text-white'
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
            onClick={onResetBuffer}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition cursor-pointer"
            title="Reset Gesture Accumulator & Sentence Buffer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Buffer</span>
          </button>
        </div>
      </div>

      {/* Kinematic Simulation Selector Bar (Visible when SimBench is active so evaluators can test any gesture or <80% confidence) */}
      {isSimulating && (
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-800">INJECT POSE:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {GESTURE_CATALOG.map((g) => (
              <button
                key={g.id}
                onClick={() => onSelectSimGesture(g.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer ${
                  simulatedGesture === g.id
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {g.id}
              </button>
            ))}
          </div>

          <button
            onClick={onToggleSimLowConfidence}
            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition cursor-pointer ${
              simulatedLowConfidence
                ? 'bg-amber-100 border-amber-400 text-amber-900 font-semibold'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-200'
            }`}
            title="Simulate ambiguous hand posture (<80% confidence) to verify the Amber Low-Confidence gate"
          >
            {simulatedLowConfidence
              ? 'Sim Ambiguous (<80%): ON'
              : 'Test <80% Gate'}
          </button>
        </div>
      )}
    </div>
  );
};
