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
  Sparkles,
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

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. Real-Time Sign Recognition & Posture Status Card */}
      <div
        className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
          isCriticalEmergency
            ? 'border-rose-300 ring-2 ring-rose-500/10'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCriticalEmergency
                  ? 'bg-rose-600 animate-ping'
                  : isHighConfidence
                  ? 'bg-emerald-500'
                  : 'bg-slate-900'
              }`}
            />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Active Sign Recognition Monitor
            </h2>
          </div>
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
              !hasCandidate
                ? 'bg-slate-100 border-slate-200 text-slate-500'
                : isCriticalEmergency
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : isHighConfidence
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {debounceState.status}
          </span>
        </div>

        <div className="space-y-3">
          {/* Prominent Active Sign Hero Display */}
          <div
            className={`p-3.5 rounded-xl border transition-colors ${
              !hasCandidate
                ? 'bg-slate-50 border-slate-200/80'
                : isCriticalEmergency
                ? 'bg-gradient-to-r from-rose-50 via-rose-50/60 to-white border-rose-200'
                : isHighConfidence
                ? 'bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-white border-emerald-200/90'
                : 'bg-amber-50/60 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Detected Mandatory Sign
              </span>
              {isCriticalEmergency && (
                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                  Critical Priority
                </span>
              )}
            </div>

            <div className="text-lg sm:text-xl font-extrabold font-mono tracking-tight text-slate-900 truncate">
              {hasCandidate ? debounceState.displayName : 'Awaiting Hand...'}
            </div>

            {hasCandidate && debounceState.spokenPhrase && (
              <div className="mt-1 text-xs font-medium text-slate-600 truncate">
                Vocalization:{' '}
                <strong className="text-slate-900">
                  &ldquo;{debounceState.spokenPhrase}&rdquo;
                </strong>
              </div>
            )}
          </div>

          {/* Hold Debounce Progress Bar (600ms) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>600ms Stability Hold Lock</span>
              <span className="font-semibold text-slate-700">
                {Math.round(debounceState.holdDurationMs)} /{' '}
                {debounceState.requiredHoldMs} ms
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
              <div
                className={`h-full transition-all duration-75 ${
                  isCriticalEmergency
                    ? 'bg-rose-600'
                    : isHighConfidence
                    ? 'bg-emerald-500'
                    : 'bg-slate-900'
                }`}
                style={{
                  width: `${Math.round(debounceState.holdProgress * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Posture Verification Status Banner */}
          {!hasCandidate ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Standby: Position hand in viewport for word recognition</span>
            </div>
          ) : isHighConfidence ? (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${
                isCriticalEmergency
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
              }`}
            >
              {isCriticalEmergency ? (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>
                <strong>Verified Output:</strong> Hand posture locked &amp;
                ready
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Posture Unclear:</strong> Adjust hand posture or repeat
                gesture
              </span>
            </div>
          )}
        </div>

        {/* Finger Curl Angle Telemetry Strip */}
        {features && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-5 gap-1.5 text-center">
            {['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'].map((finger, idx) => {
              const ext = features.fingerExtended[idx];
              const ang = Math.round(features.fingerAngles[idx]);
              return (
                <div
                  key={finger}
                  className={`px-1.5 py-1.5 rounded-lg border text-[10px] font-mono transition-colors ${
                    ext
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-2xs'
                      : 'bg-slate-50 border-slate-200/80 text-slate-500'
                  }`}
                >
                  <div className="font-bold">{finger}</div>
                  <div className="mt-0.5">
                    {ang}&deg;{' '}
                    <span className="font-semibold">{ext ? 'EXT' : 'CRL'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Live Gesture Accumulator Card (Word-Level Mandatory Stream) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Live Gesture Accumulator (Word Stream)
            </h2>
          </div>

          <button
            type="button"
            onClick={onRunQuickWordDemo}
            className="flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition cursor-pointer"
            title="Simulate committing EMERGENCY -> HELP -> DOCTOR -> WATER into the accumulator"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Demo Sequence</span>
          </button>
        </div>

        <div className="min-h-[56px] p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/90 flex items-center gap-1.5 overflow-x-auto">
          {tokenHistory.length === 0 ? (
            <span className="text-xs font-mono text-slate-400 px-1">
              Hold a verified sign for 600ms to append mandatory word tokens
              (e.g. &ldquo;EMERGENCY&rdquo; &rarr; &ldquo;HELP&rdquo; &rarr;
              &ldquo;DOCTOR&rdquo; &rarr; &ldquo;WATER&rdquo;)...
            </span>
          ) : (
            tokenHistory.map((item, idx) => (
              <React.Fragment key={item.id}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-2xs shrink-0 ${
                    item.priority === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.priority === 'CRITICAL'
                        ? 'bg-rose-600'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-xs font-mono font-bold">
                    {item.display.trim()}
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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-800" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                Text Output Screen (Sentence Buffer)
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onAppendSpace}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono transition cursor-pointer"
                title="Insert Space"
              >
                <Space className="w-3 h-3" />
                <span>Space</span>
              </button>
              <button
                type="button"
                onClick={onBackspace}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono transition cursor-pointer"
                title="Delete Last Word / Character"
              >
                <Delete className="w-3 h-3" />
                <span>Bksp</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono transition cursor-pointer"
                title="Copy to Clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClearSentence}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-mono transition cursor-pointer"
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
              className="w-full rounded-xl bg-slate-950 text-emerald-400 font-mono text-base sm:text-lg p-3.5 border border-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none leading-relaxed"
            />
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pointer-events-none">
              <CornerDownLeft className="w-3 h-3" />
              <span>{sentenceBuffer.length} chars</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>
            Pipeline: Roll-Normalized 3D &rarr; Cosine/Angle Classifier &rarr; 600ms Hold
          </span>
          <span className="text-slate-700 font-semibold">
            15 Mandatory Word Signs
          </span>
        </div>
      </div>
    </div>
  );
};
