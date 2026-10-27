import React from 'react';
import {
  Activity,
  Camera,
  Cpu,
  Hand,
  Radio,
  Scan,
  ShieldCheck,
} from 'lucide-react';
import { TelemetryMetrics } from '../types/voxhand';

interface SystemHeaderProps {
  telemetry: TelemetryMetrics;
  onToggleBridgeMode: () => void;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  telemetry,
  onToggleBridgeMode,
}) => {
  const isTracking = telemetry.trackingState === 'TRACKING';
  const isCamActive =
    telemetry.cameraStatus === 'ACTIVE' || telemetry.cameraStatus === 'SIMULATION';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] px-4 lg:px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Project Identity & Hardware Bridge Indicator */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-sm ring-1 ring-slate-900/10">
              <Hand className="w-4.5 h-4.5 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                  VOXHAND
                </h1>
                <span className="text-slate-300 font-light">|</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  Assistive Vision Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono tracking-tight">
                3D Skeletal Sign Language &amp; Speech Synthesis Workbench
              </p>
            </div>
          </div>

          {/* Hardware Bridge Indicator Pill */}
          <button
            type="button"
            onClick={onToggleBridgeMode}
            title="Click to toggle Hardware Bridge Emulation state (Optical Vision vs WebSerial ESP32 Bridge)"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/90 text-xs font-mono text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              Mode:{' '}
              <strong className="text-slate-900 font-semibold">
                {telemetry.hardwareBridgeMode === 'OPTICAL_VISION'
                  ? 'Optical Vision (Hardware Glove Emulation)'
                  : 'Hybrid Optical + ESP32 Serial Telemetry'}
              </strong>
            </span>
          </button>
        </div>

        {/* Right: System Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Camera Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono shadow-2xs transition-colors ${
              isCamActive
                ? 'bg-emerald-50/90 border-emerald-200/90 text-emerald-900'
                : telemetry.cameraStatus === 'PAUSED'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCamActive
                  ? 'bg-emerald-500 animate-pulse'
                  : telemetry.cameraStatus === 'PAUSED'
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}
            />
            <Camera className="w-3.5 h-3.5 opacity-75" />
            <span className="text-slate-500">CAM:</span>
            <span className="font-bold">{telemetry.cameraStatus}</span>
          </div>

          {/* FPS Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/90 text-xs font-mono text-slate-700 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-500">FPS:</span>
            <span className="font-bold text-slate-900 w-6 text-right">
              {telemetry.fps.toFixed(0)}
            </span>
          </div>

          {/* Inference Latency (ms) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/90 text-xs font-mono text-slate-700 shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-slate-500">LATENCY:</span>
            <span className="font-bold text-slate-900">
              {telemetry.inferenceLatencyMs.toFixed(1)} ms
            </span>
          </div>

          {/* Hand Tracking State */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono shadow-2xs transition-colors ${
              isTracking
                ? 'bg-emerald-50/90 border-emerald-200/90 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isTracking ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Scan className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span className="text-slate-500">HAND:</span>
            <span className="font-bold">{telemetry.trackingState}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
