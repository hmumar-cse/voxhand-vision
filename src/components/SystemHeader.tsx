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
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Project Identity & Hardware Bridge Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Hand className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                  VOXHAND <span className="text-slate-300 font-normal">|</span>{' '}
                  <span className="font-semibold text-slate-700">
                    Assistive Vision Prototype
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Vision-Based Sign Language &amp; Speech Translation Pipeline
              </p>
            </div>
          </div>

          {/* Hardware Bridge Indicator Pill */}
          <button
            onClick={onToggleBridgeMode}
            title="Click to toggle Hardware Bridge Emulation state (Optical Vision vs WebSerial ESP32 Bridge)"
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 text-xs font-mono text-slate-700 transition cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-slate-600" />
            <span>
              Mode:{' '}
              <strong className="text-slate-900">
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
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono ${
              isCamActive
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : telemetry.cameraStatus === 'PAUSED'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="text-slate-500">CAM:</span>
            <span className="font-semibold">{telemetry.cameraStatus}</span>
          </div>

          {/* FPS Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">FPS:</span>
            <span className="font-semibold text-slate-900 w-7 text-right">
              {telemetry.fps.toFixed(0)}
            </span>
          </div>

          {/* Inference Latency (ms) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
            <Radio className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">LATENCY:</span>
            <span className="font-semibold text-slate-900">
              {telemetry.inferenceLatencyMs.toFixed(1)} ms
            </span>
          </div>

          {/* Hand Tracking State */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono ${
              isTracking
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
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

