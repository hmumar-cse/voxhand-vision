import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Crosshair,
  PlusCircle,
  RotateCcw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  CalibrationProfile,
  GestureCategory,
  GestureId,
  GestureMetadata,
  HandFeatures,
} from '../types/voxhand';
import {
  FINGERTIP_IDS,
  GESTURE_CATALOG,
  generateCanonicalLandmarks,
  HAND_CONNECTIONS,
  WRIST,
} from '../utils/gestureClassifier';

interface GestureReferenceDrawerProps {
  features: HandFeatures | null;
  calibration: CalibrationProfile;
  customSamples: { gestureId: GestureId; vector: number[] }[];
  activeGestureId: GestureId;
  onCalibrateDistanceAndNeutral: () => void;
  onUpdateCalibration: (patch: Partial<CalibrationProfile>) => void;
  onRecordCustomSample: (gestureId: GestureId) => void;
  onAutoCalibrateCurrentPose: (gestureId: GestureId) => void;
  onResetCalibration: () => void;
  onInjectGestureInSim: (gestureId: GestureId) => void;
}

const MiniLandmarkDiagram: React.FC<{
  gestureId: GestureId;
  isActive: boolean;
  isCritical: boolean;
}> = ({ gestureId, isActive, isCritical }) => {
  const pts = generateCanonicalLandmarks(gestureId, 0, 0);
  const w = 68;
  const h = 68;

  const mapPt = (p: { x: number; y: number }): [number, number] => [
    (p.x - 0.25) * 1.65 * w,
    (p.y - 0.35) * 1.45 * h,
  ];

  const mapped = pts.map(mapPt);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={`rounded-lg border shrink-0 ${
        isActive
          ? isCritical
            ? 'bg-rose-950 border-rose-400'
            : 'bg-emerald-950 border-emerald-400'
          : 'bg-slate-900 border-slate-800'
      }`}
    >
      {HAND_CONNECTIONS.map(([a, b], idx) => (
        <line
          key={idx}
          x1={mapped[a][0]}
          y1={mapped[a][1]}
          x2={mapped[b][0]}
          y2={mapped[b][1]}
          stroke={isActive ? (isCritical ? '#fb7185' : '#34d399') : '#64748b'}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      {mapped.map(([x, y], idx) => {
        const isTip = FINGERTIP_IDS.includes(idx);
        const isWrist = idx === WRIST;
        return (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r={isWrist ? 2.6 : isTip ? 2.2 : 1.5}
            fill={isWrist ? '#f87171' : isTip ? '#38bdf8' : '#e2e8f0'}
          />
        );
      })}
    </svg>
  );
};

export const GestureReferenceDrawer: React.FC<GestureReferenceDrawerProps> = ({
  features,
  calibration,
  customSamples,
  activeGestureId,
  onCalibrateDistanceAndNeutral,
  onUpdateCalibration,
  onRecordCustomSample,
  onAutoCalibrateCurrentPose,
  onResetCalibration,
  onInjectGestureInSim,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    GestureCategory | 'ALL'
  >('ALL');
  const [selectedCalibSign, setSelectedCalibSign] =
    useState<GestureId>('EMERGENCY');

  const filteredGestures =
    selectedCategory === 'ALL'
      ? GESTURE_CATALOG
      : GESTURE_CATALOG.filter((g) => g.category === selectedCategory);

  const countSamplesForSign = (id: GestureId) =>
    customSamples.filter((s) => s.gestureId === id).length;

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Collapsible Header Bar */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-slate-800" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
            Mandatory Word-Sign Reference &amp; Precision Calibration Studio (
            {GESTURE_CATALOG.length} Mandatory Signs)
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              'ALL',
              'Emergency & Medical',
              'Daily Needs',
              'Core Dialogue',
            ] as const
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Precision Calibration Controls Bar */}
      <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* 1. Camera Distance & Roll Normalization */}
        <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
          <button
            onClick={onCalibrateDistanceAndNeutral}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium transition cursor-pointer shadow-2xs"
            title="Lock current Wrist-to-MCP palm span and hand angle as your personalized baseline"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>Calibrate Hand Scale &amp; Baseline</span>
          </button>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-mono text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={calibration.rotationInvariant}
              onChange={(e) =>
                onUpdateCalibration({ rotationInvariant: e.target.checked })
              }
              className="accent-slate-900"
            />
            <Compass className="w-3.5 h-3.5 text-slate-600" />
            <span>Roll-Invariant Alignment</span>
          </label>
        </div>

        {/* 2. Fine-Tune Curl & Extension Sensitivity */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3 bg-white px-3 py-1.5 rounded-md border border-slate-200">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3" /> Curl Gate
              </span>
              <strong className="text-slate-900">
                {calibration.curlAngleThresholdDeg}&deg;
              </strong>
            </div>
            <input
              type="range"
              min={115}
              max={155}
              step={1}
              value={calibration.curlAngleThresholdDeg}
              onChange={(e) =>
                onUpdateCalibration({
                  curlAngleThresholdDeg: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-slate-900 h-1 bg-slate-200 rounded-lg cursor-pointer"
              title="Adjust finger straightness angle threshold for extension detection"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Reach Ratio</span>
              <strong className="text-slate-900">
                {calibration.extensionRatioThreshold.toFixed(2)}
              </strong>
            </div>
            <input
              type="range"
              min={0.50}
              max={0.80}
              step={0.02}
              value={calibration.extensionRatioThreshold}
              onChange={(e) =>
                onUpdateCalibration({
                  extensionRatioThreshold: parseFloat(e.target.value),
                })
              }
              className="w-full accent-slate-900 h-1 bg-slate-200 rounded-lg cursor-pointer"
              title="Adjust tip-to-MCP reach ratio threshold"
            />
          </div>
        </div>

        {/* 3. Multi-Frame Pose Calibration Recorder */}
        <div className="lg:col-span-4 flex flex-wrap items-center justify-end gap-1.5">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1">
            <select
              value={selectedCalibSign}
              onChange={(e) => setSelectedCalibSign(e.target.value as GestureId)}
              className="text-xs font-mono text-slate-800 bg-transparent focus:outline-none"
            >
              {GESTURE_CATALOG.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.id} ({countSamplesForSign(g.id)} samples)
                </option>
              ))}
            </select>

            <button
              onClick={() => onRecordCustomSample(selectedCalibSign)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-mono transition cursor-pointer"
              title="Record current 3D hand posture vector for this sign"
            >
              <PlusCircle className="w-3 h-3 text-emerald-600" />
              <span>Record Pose</span>
            </button>

            <button
              onClick={() => onAutoCalibrateCurrentPose(selectedCalibSign)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-mono transition cursor-pointer"
              title="Burst-capture 5 stabilized reference vectors for high-accuracy cosine matching"
            >
              <Sparkles className="w-3 h-3" />
              <span>5x Burst Train</span>
            </button>
          </div>

          {(calibration.isCalibrated || customSamples.length > 0) && (
            <button
              onClick={onResetCalibration}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-mono transition cursor-pointer"
              title="Reset Calibration Profile & Custom Samples"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ({customSamples.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Calibration Telemetry Status Strip */}
      {calibration.isCalibrated && (
        <div className="px-4 py-1.5 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between text-xs font-mono text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              <strong>Calibration Active:</strong> Baseline Span ={' '}
              {calibration.referencePalmSpan?.toFixed(3)} | Live Scale Ratio ={' '}
              {features ? `${features.calibratedSpanRatio.toFixed(2)}x` : '1.00x'} |
              Hand Roll Compensation ={' '}
              {features ? `${features.handRollDeg.toFixed(1)}°` : '0.0°'}
            </span>
          </div>
          <span>
            Custom Trained Vectors: <strong>{customSamples.length}</strong>{' '}
            {calibration.lastCalibratedAt
              ? `(Updated ${calibration.lastCalibratedAt})`
              : ''}
          </span>
        </div>
      )}

      {/* Collapsible Reference Grid */}
      {isOpen && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 bg-white">
          {filteredGestures.map((gesture: GestureMetadata) => {
            const isActive = activeGestureId === gesture.id;
            const isCritical = gesture.priority === 'CRITICAL';
            const sampleCount = countSamplesForSign(gesture.id);

            return (
              <div
                key={gesture.id}
                onClick={() => onInjectGestureInSim(gesture.id)}
                className={`p-3 rounded-lg border transition cursor-pointer flex items-start gap-3 ${
                  isActive
                    ? isCritical
                      ? 'bg-rose-50/80 border-rose-400 shadow-xs'
                      : 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                    : isCritical
                    ? 'bg-rose-50/25 hover:bg-rose-50/50 border-rose-200/80'
                    : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                }`}
                title="Click to test this mandatory word sign in Kinematic SimBench"
              >
                <MiniLandmarkDiagram
                  gestureId={gesture.id}
                  isActive={isActive}
                  isCritical={isCritical}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold font-mono text-slate-900 truncate">
                      {gesture.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        isCritical
                          ? 'bg-rose-600 text-white font-bold'
                          : gesture.category === 'Daily Needs'
                          ? 'bg-sky-100 text-sky-900'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {isCritical ? 'EMERGENCY' : gesture.category.split(' ')[0]}
                    </span>
                  </div>

                  <div className="text-[11px] font-medium text-slate-800 truncate mb-1">
                    &ldquo;{gesture.spokenPhrase}&rdquo;
                  </div>

                  <p className="text-[10px] text-slate-600 leading-snug line-clamp-2 mb-1.5">
                    {gesture.handPostureGuide}
                  </p>

                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
                    <span className="truncate">{gesture.angleHint}</span>
                    {sampleCount > 0 && (
                      <span className="text-emerald-700 font-bold shrink-0">
                        +{sampleCount} cal
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
