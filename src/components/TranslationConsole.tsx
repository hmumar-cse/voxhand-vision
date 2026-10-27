import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  CornerDownLeft,
  Delete,
  Layers,
  ShieldAlert,
  Space,
  Terminal,
  Trash2,
} from 'lucide-react';
import {
  AccumulatedToken,
  DebounceState,
  HandFeatures,
} from '../types/voxhand';

interface TranslationConsoleProps {
  debounceState: DebounceState;
  features: HandFeatures | null;
  tokenHistory: AccumulatedToken[];
  sentenceBuffer: string;
  onChangeSentence: (val: string) => void;
  onClearSentence: () => void;
  onAppendSpace: () => void;
  onBackspace: () => void;
  onRunQuickWordDemo: () => void;
}

export const TranslationConsole: React.FC<TranslationConsoleProps> = ({
  debounceState,
  features,
  tokenHistory,
  sentenceBuffer,
  onChangeSentence,
  onClearSentence,
  onAppendSpace,
  onBackspace,
  onRunQuickWordDemo,
}) => {
  const [copied, setCopied] = useState(false);

  const confidencePct = Math.round(debounceState.confidence * 100);
  const isHighConfidence = debounceState.confidence >= 0.80;
  const hasCandidate = debounceState.candidateId !== 'NONE';
  const isCriticalEmergency =
    hasCandidate && debounceState.priority === 'CRITICAL' && isHighConfidence;

  const handleCopy = async () => {
    if (!sentenceBuffer) return;
    try {
      await navigator.clipboard.writeText(sentenceBuffer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback copy
    }
  };

  // Circular SVG gauge geometry
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, confidencePct) / 100) * circumference;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. Real-Time Confidence Gauge Card */}
      <div
        className={`bg-white border rounded-xl p-4 shadow-xs transition-colors ${
          isCriticalEmergency ? 'border-rose-300 bg-rose-50/15' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isCriticalEmergency ? 'bg-rose-600 animate-ping' : 'bg-slate-900'
              }`}
            />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Real-Time Confidence Gauge (Word-Level Classifier)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Threshold Gate: &ge;80%
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Circular Gauge */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 84 84">
              <circle
                cx="42"
                cy="42"
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="8"
              />
              <circle
                cx="42"
                cy="42"
                r={radius}
                fill="transparent"
                stroke={
                  !hasCandidate
                    ? '#94a3b8'
                    : isCriticalEmergency
                    ? '#e11d48'
                    : isHighConfidence
                    ? '#10b981'
                    : '#f59e0b'
                }
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold font-mono text-slate-900">
                {hasCandidate ? `${confidencePct}%` : '--'}
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                Score
              </span>
            </div>
          </div>

          {/* Linear Progress Meter & Abstract Status Alert */}
          <div className="flex-1 w-full space-y-2.5">
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="font-mono text-slate-500 shrink-0">
                Detected Sign:
              </span>
              <div className="flex items-center gap-1.5 truncate">
                {isCriticalEmergency && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-mono font-bold uppercase">
                    URGENT
                  </span>
                )}
                <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 truncate">
                  {hasCandidate ? debounceState.displayName : 'Awaiting Hand...'}
                </span>
              </div>
            </div>

            {hasCandidate && debounceState.spokenPhrase && (
              <div className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200/80 truncate">
                Phrase: <strong className="text-slate-900">&ldquo;{debounceState.spokenPhrase}&rdquo;</strong>
              </div>
            )}

            {/* Linear Progress Bar with 80% Threshold Marker */}
            <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-150 ${
                  !hasCandidate
                    ? 'bg-slate-300'
                    : isCriticalEmergency
                    ? 'bg-rose-600'
                    : isHighConfidence
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${hasCandidate ? confidencePct : 0}%` }}
              />
              {/* 80% Cutoff Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-900/70"
                style={{ left: '80%' }}
                title="80% Verification Gate"
              />
            </div>

            {/* Hold Debounce Progress Bar (600ms) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>600ms Temporal Hold Buffer</span>
                <span>
                  {Math.round(debounceState.holdDurationMs)} /{' '}
                  {debounceState.requiredHoldMs} ms
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all duration-75"
                  style={{ width: `${Math.round(debounceState.holdProgress * 100)}%` }}
                />
              </div>
            </div>

            {/* Status Banner matching Abstract Logic */}
            {!hasCandidate ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Standby: Position hand in viewport for word recognition</span>
              </div>
            ) : isHighConfidence ? (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
                  isCriticalEmergency
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                {isCriticalEmergency ? (
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>
                  <strong>Verified Output</strong> (&ge;80% Confidence Gate Passed)
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Low Confidence:</strong> Adjust hand posture or repeat
                  gesture
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Finger Curl Angle Telemetry Strip */}
        {features && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-5 gap-1.5 text-center">
            {['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'].map((finger, idx) => {
              const ext = features.fingerExtended[idx];
              const ang = Math.round(features.fingerAngles[idx]);
              return (
                <div
                  key={finger}
                  className={`px-1.5 py-1 rounded border text-[10px] font-mono ${
                    ext
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-semibold">{finger}</div>
                  <div>
                    {ang}&deg; {ext ? 'EXT' : 'CRL'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Live Gesture Accumulator Card (Word-Level Mandatory Stream) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Live Gesture Accumulator (Mandatory Word Stream)
            </h2>
          </div>

          <button
            onClick={onRunQuickWordDemo}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
            title="Simulate committing EMERGENCY -> HELP -> DOCTOR -> WATER into the accumulator"
          >
            Demo Emergency Sequence
          </button>
        </div>

        <div className="min-h-[54px] p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {tokenHistory.length === 0 ? (
            <span className="text-xs font-mono text-slate-400">
              Hold a verified sign (&ge;80%) for 600ms to append mandatory word
              tokens (e.g. &ldquo;EMERGENCY&rdquo; &rarr; &ldquo;HELP&rdquo; &rarr;
              &ldquo;DOCTOR&rdquo; &rarr; &ldquo;WATER&rdquo;)...
            </span>
          ) : (
            tokenHistory.map((item, idx) => (
              <React.Fragment key={item.id}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border shadow-2xs shrink-0 ${
                    item.priority === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <span className="text-xs font-mono font-bold">
                    {item.display.trim()}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded ${
                      item.priority === 'CRITICAL'
                        ? 'bg-rose-200/80 text-rose-900'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
                {idx < tokenHistory.length - 1 && (
                  <span className="text-slate-400 font-mono text-xs shrink-0">
                    &rarr;
                  </span>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* 3. Text Output Screen (Terminal-Style Display) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Text Output Screen (Editable Sentence Buffer)
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onAppendSpace}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono transition cursor-pointer"
                title="Insert Space"
              >
                <Space className="w-3 h-3" />
                <span>Space</span>
              </button>
              <button
                onClick={onBackspace}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono transition cursor-pointer"
                title="Delete Last Word / Character"
              >
                <Delete className="w-3 h-3" />
                <span>Bksp</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono transition cursor-pointer"
                title="Copy to Clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={onClearSentence}
                className="flex items-center gap-1 px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-mono transition cursor-pointer"
                title="Clear Sentence Buffer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Terminal Editable Textarea */}
          <div className="relative">
            <textarea
              value={sentenceBuffer}
              onChange={(e) => onChangeSentence(e.target.value)}
              rows={3}
              placeholder="Accumulated mandatory sign phrases appear here... (Editable)"
              className="w-full rounded-lg bg-slate-900 text-slate-50 font-mono text-base sm:text-lg p-3.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none leading-relaxed"
            />
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pointer-events-none">
              <CornerDownLeft className="w-3 h-3" />
              <span>{sentenceBuffer.length} chars</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>
            Pipeline: Rotation-Normalized 3D &rarr; Cosine/Angle Classifier &rarr; 600ms Hold
          </span>
          <span className="text-slate-700 font-semibold">
            15 Mandatory Word Signs Active
          </span>
        </div>
      </div>
    </div>
  );
};
