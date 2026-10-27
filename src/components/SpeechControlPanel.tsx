import React from 'react';
import {
  AudioWaveform,
  Mic2,
  Minus,
  Plus,
  SlidersHorizontal,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface SpeechControlPanelProps {
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  speakImmediateOnCommit: boolean;
  onToggleSpeakImmediate: () => void;
  isSpeaking: boolean;
  onSpeakNow: () => void;
  onStopSpeaking: () => void;
  speechVolume: number; // 0.0 to 1.0
  isMuted: boolean;
  onChangeVolume: (vol: number) => void;
  onToggleMute: () => void;
  speechRate: number;
  onChangeRate: (rate: number) => void;
  speechPitch: number;
  onChangePitch: (pitch: number) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  onSelectVoice: (uri: string) => void;
  pauseProgressMs: number;
  sentenceBuffer: string;
}

export const SpeechControlPanel: React.FC<SpeechControlPanelProps> = ({
  autoSpeak,
  onToggleAutoSpeak,
  speakImmediateOnCommit,
  onToggleSpeakImmediate,
  isSpeaking,
  onSpeakNow,
  onStopSpeaking,
  speechVolume,
  isMuted,
  onChangeVolume,
  onToggleMute,
  speechRate,
  onChangeRate,
  speechPitch,
  onChangePitch,
  voices,
  selectedVoiceURI,
  onSelectVoice,
  pauseProgressMs,
  sentenceBuffer,
}) => {
  const pauseRatio = Math.min(100, Math.round((pauseProgressMs / 1500) * 100));
  const effectiveVolumePct = isMuted ? 0 : Math.round(speechVolume * 100);

  const handleStepVolume = (delta: number) => {
    const next = Math.max(0, Math.min(1, Math.round((speechVolume + delta) * 20) / 20));
    onChangeVolume(next);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
            Speech &amp; Audio Synthesizer Console (Volume, Speed, Pitch &amp; System TTS)
          </h2>
        </div>

        {/* Auto-Speak Toggles */}
        <div className="flex flex-wrap items-center gap-4">
          {autoSpeak && pauseProgressMs > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <span>Sentence Pause Timer:</span>
              <strong>{(pauseProgressMs / 1000).toFixed(1)}s / 1.5s</strong>
              <span className="text-emerald-500">({pauseRatio}%)</span>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={speakImmediateOnCommit}
              onChange={onToggleSpeakImmediate}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all relative peer-checked:bg-emerald-600" />
            <span className="text-xs font-medium text-slate-700">
              Speak Every Committed Sign Immediately
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={onToggleAutoSpeak}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all relative peer-checked:bg-slate-900" />
            <span className="text-xs font-medium text-slate-700">
              Auto-Speak Full Sentence (1.5s Pause)
            </span>
          </label>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* 1. Manual Trigger & Dedicated Stop Speaking Buttons (3 cols) */}
        <div className="lg:col-span-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onSpeakNow}
            disabled={!sentenceBuffer.trim()}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs ${
              isSpeaking
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : sentenceBuffer.trim()
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
            title="Speak current sentence buffer now"
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
                <span>Replay</span>
              </>
            ) : (
              <>
                <AudioWaveform className="w-4 h-4" />
                <span>Speak Now</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onStopSpeaking}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border transition cursor-pointer ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-700 border-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
            }`}
            title="Immediately stop speaking and cancel any pending auto-speak timer"
          >
            <VolumeX className="w-4 h-4" />
            <span>Stop</span>
          </button>
        </div>

        {/* 2. Dedicated Audio Volume Increase / Decrease Controls (3 cols) */}
        <div className="lg:col-span-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              {isMuted || effectiveVolumePct === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-600" />
              ) : effectiveVolumePct < 50 ? (
                <Volume1 className="w-3.5 h-3.5 text-slate-700" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
              Audio Volume
            </span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded ${
                isMuted
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-200/80 text-slate-900'
              }`}
            >
              {isMuted ? 'MUTED (0%)' : `${effectiveVolumePct}%`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleMute}
              className={`px-2 py-1 rounded text-[10px] font-mono font-semibold border transition cursor-pointer ${
                isMuted
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title="Toggle Mute / Unmute"
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            <button
              onClick={() => handleStepVolume(-0.1)}
              disabled={speechVolume <= 0}
              className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 disabled:opacity-40 transition cursor-pointer"
              title="Decrease Volume (-10%)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : speechVolume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="flex-1 accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />

            <button
              onClick={() => handleStepVolume(0.1)}
              disabled={speechVolume >= 1}
              className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 disabled:opacity-40 transition cursor-pointer"
              title="Increase Volume (+10%)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Sliders for Speech Rate (0.75x to 1.5x) and Pitch (3 cols) */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span className="text-slate-500 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Speed
              </span>
              <span className="font-bold text-slate-900">
                {speechRate.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.75}
              max={1.5}
              step={0.05}
              value={speechRate}
              onChange={(e) => onChangeRate(parseFloat(e.target.value))}
              className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span className="text-slate-500">Pitch</span>
              <span className="font-bold text-slate-900">
                {speechPitch.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={speechPitch}
              onChange={(e) => onChangePitch(parseFloat(e.target.value))}
              className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* 4. Voice Selector Dropdown populating installed system voices (3 cols) */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Mic2 className="w-3 h-3" /> Synthesizer Voice
            </span>
            <span>{voices.length} installed</span>
          </div>
          <select
            value={selectedVoiceURI}
            onChange={(e) => onSelectVoice(e.target.value)}
            className="w-full rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {voices.length === 0 ? (
              <option value="">Default Browser Synthesizer Voice</option>
            ) : (
              voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang}) {v.default ? '[Default]' : ''}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
    </div>
  );
};
