import React, { useState } from 'react';
import {
  AudioWaveform,
  Check,
  Copy,
  CornerDownLeft,
  Delete,
  Layers,
  Space,
  Sparkles,
  Terminal,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AccumulatedToken } from '../types/voxhand';

interface TranslationConsoleProps {
  tokenHistory: AccumulatedToken[];
  sentenceBuffer: string;
  isSpeaking: boolean;
  onSpeakSentence: () => void;
  onStopSpeaking: () => void;
  onChangeSentence: (val: string) => void;
  onClearSentence: () => void;
  onAppendSpace: () => void;
  onBackspace: () => void;
  onRunQuickWordDemo: () => void;
}

export const TranslationConsole: React.FC<TranslationConsoleProps> = ({
  tokenHistory,
  sentenceBuffer,
  isSpeaking,
  onSpeakSentence,
  onStopSpeaking,
  onChangeSentence,
  onClearSentence,
  onAppendSpace,
  onBackspace,
  onRunQuickWordDemo,
}) => {
  const [copied, setCopied] = useState(false);

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
      {/* 1. Live Gesture Accumulator Card (Word-Level Mandatory Stream) */}
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

        <div className="min-h-[68px] p-3 rounded-xl bg-slate-50/90 border border-slate-200/90 flex items-center gap-1.5 overflow-x-auto">
          {tokenHistory.length === 0 ? (
            <span className="text-xs font-mono text-slate-400 px-1">
              Hold a sign in the viewport to append mandatory word tokens (e.g.
              &ldquo;EMERGENCY&rdquo; &rarr; &ldquo;HELP&rdquo; &rarr;
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

      {/* 2. Text Output Screen (Terminal-Style Display) + Read Full Sentence Button */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex-1 flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
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
          <div className="relative flex-1 flex flex-col">
            <textarea
              value={sentenceBuffer}
              onChange={(e) => onChangeSentence(e.target.value)}
              rows={7}
              placeholder="Translated sign language words appear here... Press 'Read Full Sentence' below to speak aloud."
              className="w-full flex-1 min-h-[210px] rounded-xl bg-slate-950 text-emerald-400 font-mono text-lg sm:text-xl p-4 border border-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none leading-relaxed"
            />
            <div className="absolute bottom-3 right-3.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pointer-events-none">
              <CornerDownLeft className="w-3 h-3" />
              <span>{sentenceBuffer.length} chars</span>
            </div>
          </div>

          {/* Dedicated "Read Full Sentence" Trigger Bar directly under Text Generation */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onSpeakSentence}
              disabled={!sentenceBuffer.trim()}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                isSpeaking
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : sentenceBuffer.trim()
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
              title="Read the full generated sentence aloud"
            >
              {isSpeaking ? (
                <>
                  <div className="flex items-center gap-0.5 h-4">
                    <span className="w-1 h-3.5 bg-white rounded-full animate-wave-1" />
                    <span className="w-1 h-3.5 bg-white rounded-full animate-wave-2" />
                    <span className="w-1 h-3.5 bg-white rounded-full animate-wave-3" />
                    <span className="w-1 h-3.5 bg-white rounded-full animate-wave-4" />
                    <span className="w-1 h-3.5 bg-white rounded-full animate-wave-5" />
                  </div>
                  <span>Reading Sentence Aloud... (Click to Replay)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <AudioWaveform className="w-4 h-4 text-emerald-400" />
                  <span>Read Full Sentence</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                type="button"
                onClick={onStopSpeaking}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer"
                title="Stop reading immediately"
              >
                <VolumeX className="w-4 h-4" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Manual Speech Trigger: Speaks only when button is pressed</span>
          <span className="text-slate-700 font-semibold">
            20 Mandatory Word Signs
          </span>
        </div>
      </div>
    </div>
  );
};
