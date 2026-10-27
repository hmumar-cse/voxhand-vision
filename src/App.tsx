import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SystemHeader } from './components/SystemHeader';
import { PrimaryViewport } from './components/PrimaryViewport';
import { TranslationConsole } from './components/TranslationConsole';
import { SpeechControlPanel } from './components/SpeechControlPanel';
import { GestureReferenceDrawer } from './components/GestureReferenceDrawer';
import {
  AccumulatedToken,
  CalibrationProfile,
  DebounceState,
  GestureId,
  HandFeatures,
  Point3D,
  TelemetryMetrics,
} from './types/voxhand';
import {
  buildFeatureVector,
  classifyGesture,
  DEFAULT_CALIBRATION_PROFILE,
  extractHandFeatures,
  generateCanonicalLandmarks,
  GestureHoldDebouncer,
} from './utils/gestureClassifier';

declare global {
  interface Window {
    Hands?: new (config: { locateFile: (file: string) => string }) => {
      setOptions: (opts: Record<string, unknown>) => void;
      onResults: (
        cb: (results: {
          multiHandLandmarks?: Point3D[][];
          image?: HTMLVideoElement | HTMLCanvasElement;
        }) => void
      ) => void;
      send: (input: { image: HTMLVideoElement }) => Promise<void>;
      close?: () => Promise<void>;
    };
  }
}

export const App: React.FC = () => {
  // Refs for video, canvas, and debouncer engine
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const debouncerRef = useRef<GestureHoldDebouncer>(
    new GestureHoldDebouncer(600, 0.80, 450)
  );

  // Camera & Simulation state
  const [isWebcamRunning, setIsWebcamRunning] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulatedGesture, setSimulatedGesture] =
    useState<GestureId>('EMERGENCY');
  const [simulatedLowConfidence, setSimulatedLowConfidence] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Telemetry & Vision state
  const [telemetry, setTelemetry] = useState<TelemetryMetrics>({
    cameraStatus: 'SIMULATION',
    fps: 60,
    inferenceLatencyMs: 2.1,
    trackingState: 'TRACKING',
    hardwareBridgeMode: 'OPTICAL_VISION',
  });
  const [features, setFeatures] = useState<HandFeatures | null>(null);
  const [debounceState, setDebounceState] = useState<DebounceState>({
    candidateId: 'NONE',
    displayName: 'No Gesture',
    spokenPhrase: '',
    token: '',
    priority: 'STANDARD',
    confidence: 0,
    holdDurationMs: 0,
    requiredHoldMs: 600,
    holdProgress: 0,
    status: 'IDLE',
    committedToken: null,
    committedSpokenPhrase: null,
    committedGestureId: null,
  });

  // Precision Calibration state
  const [calibration, setCalibration] = useState<CalibrationProfile>(
    DEFAULT_CALIBRATION_PROFILE
  );
  const [customSamples, setCustomSamples] = useState<
    { gestureId: GestureId; vector: number[] }[]
  >([]);

  // Accumulator & Sentence state (Mandatory Word-Level Signs)
  const [tokenHistory, setTokenHistory] = useState<AccumulatedToken[]>([
    {
      id: 'init-1',
      gestureId: 'HELLO',
      display: 'HELLO',
      spokenPhrase: 'Hello!',
      priority: 'STANDARD',
      confidence: 0.96,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [sentenceBuffer, setSentenceBuffer] = useState<string>('HELLO ');

  // Speech & Audio Synthesis state (including Volume + Mute)
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [speakImmediateOnCommit, setSpeakImmediateOnCommit] =
    useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechVolume, setSpeechVolume] = useState<number>(0.9); // 0.0 to 1.0
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [pauseProgressMs, setPauseProgressMs] = useState<number>(0);

  // Refs for reactive values inside RAF loops
  const stateRef = useRef({
    isPaused,
    isSimulating,
    isWebcamRunning,
    simulatedGesture,
    simulatedLowConfidence,
    calibration,
    customSamples,
    autoSpeak,
    speakImmediateOnCommit,
    sentenceBuffer,
    speechVolume,
    isMuted,
    speechRate,
    speechPitch,
    selectedVoiceURI,
    voices,
  });

  useEffect(() => {
    stateRef.current = {
      isPaused,
      isSimulating,
      isWebcamRunning,
      simulatedGesture,
      simulatedLowConfidence,
      calibration,
      customSamples,
      autoSpeak,
      speakImmediateOnCommit,
      sentenceBuffer,
      speechVolume,
      isMuted,
      speechRate,
      speechPitch,
      selectedVoiceURI,
      voices,
    };
  }, [
    isPaused,
    isSimulating,
    isWebcamRunning,
    simulatedGesture,
    simulatedLowConfidence,
    calibration,
    customSamples,
    autoSpeak,
    speakImmediateOnCommit,
    sentenceBuffer,
    speechVolume,
    isMuted,
    speechRate,
    speechPitch,
    selectedVoiceURI,
    voices,
  ]);

  // --------------------------------------------------------------------------
  // 1. WEB SPEECH API VOICE LOADER & VOLUME-CONTROLLED SPEAK FUNCTION
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        setSelectedVoiceURI((prev) => {
          if (prev) return prev;
          const preferred =
            available.find((v) => v.lang.startsWith('en') && v.default) ||
            available.find((v) => v.lang.startsWith('en')) ||
            available[0];
          return preferred ? preferred.voiceURI : '';
        });
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechWatchdogRef = useRef<number | null>(null);

  const clearSpeechWatchdog = () => {
    if (speechWatchdogRef.current !== null) {
      window.clearInterval(speechWatchdogRef.current);
      speechWatchdogRef.current = null;
    }
  };

  const stopSpeech = useCallback(() => {
    clearSpeechWatchdog();
    activeUtteranceRef.current = null;
    hasSpokenSinceLastCommitRef.current = true;
    lastCommitWallTimeRef.current = 0;
    setPauseProgressMs(0);
    setIsSpeaking(false);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore cancel errors
      }
    }
  }, []);

  const triggerSpeech = useCallback((textToSpeak?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (stateRef.current.isMuted || stateRef.current.speechVolume <= 0) return;

    const raw = (textToSpeak ?? stateRef.current.sentenceBuffer).trim();
    if (!raw) return;

    // Mark any pending auto-speak pause timer as satisfied so it doesn't interrupt manual speech
    hasSpokenSinceLastCommitRef.current = true;
    lastCommitWallTimeRef.current = 0;
    setPauseProgressMs(0);

    clearSpeechWatchdog();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(raw);
    activeUtteranceRef.current = utterance;

    utterance.volume = Math.max(0, Math.min(1, stateRef.current.speechVolume));
    utterance.rate = stateRef.current.speechRate;
    utterance.pitch = stateRef.current.speechPitch;

    const matchedVoice = stateRef.current.voices.find(
      (v) => v.voiceURI === stateRef.current.selectedVoiceURI
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      if (activeUtteranceRef.current === utterance) {
        setIsSpeaking(true);
      }
    };
    utterance.onend = () => {
      if (activeUtteranceRef.current === utterance) {
        activeUtteranceRef.current = null;
        clearSpeechWatchdog();
        setIsSpeaking(false);
      }
    };
    utterance.onerror = () => {
      if (activeUtteranceRef.current === utterance) {
        activeUtteranceRef.current = null;
        clearSpeechWatchdog();
        setIsSpeaking(false);
      }
    };

    setIsSpeaking(true);
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);

    // Watchdog sync: in Chromium/Windows, onend can occasionally be dropped after cancel().
    // Poll speechSynthesis.speaking after a 350ms startup grace period to guarantee UI state sync.
    const startedAt = performance.now();
    speechWatchdogRef.current = window.setInterval(() => {
      if (activeUtteranceRef.current !== utterance) {
        clearSpeechWatchdog();
        return;
      }
      if (
        performance.now() - startedAt > 400 &&
        !window.speechSynthesis.speaking &&
        !window.speechSynthesis.pending
      ) {
        activeUtteranceRef.current = null;
        clearSpeechWatchdog();
        setIsSpeaking(false);
      }
    }, 150);
  }, []);

  // --------------------------------------------------------------------------
  // 2. COMMITTED GESTURE HANDLER & 1.5s SENTENCE COMPLETION AUTO-SPEAK
  // --------------------------------------------------------------------------

  const lastCommitWallTimeRef = useRef<number>(0);
  const hasSpokenSinceLastCommitRef = useRef<boolean>(true);

  const appendCommittedGesture = useCallback(
    (
      gestureId: GestureId,
      token: string,
      spokenPhrase: string,
      priority: 'CRITICAL' | 'HIGH' | 'STANDARD',
      confidence: number
    ) => {
      setTokenHistory((prev) => [
        ...prev.slice(-14),
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          gestureId,
          display: token,
          spokenPhrase,
          priority,
          confidence,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      setSentenceBuffer((prev) => {
        const next = prev + token;
        return next;
      });

      // Speak immediately if user enabled "Speak Every Committed Sign Immediately"
      if (stateRef.current.speakImmediateOnCommit) {
        triggerSpeech(spokenPhrase || token);
      }

      lastCommitWallTimeRef.current = performance.now();
      hasSpokenSinceLastCommitRef.current = false;
      setPauseProgressMs(0);
    },
    [triggerSpeech]
  );

  // Monitor 1.5s pause after commit to auto-trigger full sentence TTS when Auto-Speak is active
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (
        !stateRef.current.autoSpeak ||
        hasSpokenSinceLastCommitRef.current ||
        lastCommitWallTimeRef.current === 0
      ) {
        setPauseProgressMs(0);
        return;
      }

      const elapsed = performance.now() - lastCommitWallTimeRef.current;
      if (elapsed >= 1500) {
        hasSpokenSinceLastCommitRef.current = true;
        setPauseProgressMs(0);
        if (stateRef.current.sentenceBuffer.trim().length > 0) {
          triggerSpeech(stateRef.current.sentenceBuffer);
        }
      } else {
        setPauseProgressMs(elapsed);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [triggerSpeech]);

  // --------------------------------------------------------------------------
  // 3. UNIFIED LANDMARK FRAME PROCESSOR (LIVE MEDIAPIPE OR KINEMATIC SIMBENCH)
  // --------------------------------------------------------------------------

  const fpsFrameTimesRef = useRef<number[]>([]);

  const processLandmarksFrame = useCallback(
    (
      landmarks: Point3D[] | null,
      nowMs: number,
      sourceMode: 'ACTIVE' | 'SIMULATION'
    ) => {
      const t0 = performance.now();

      // Calculate rolling FPS
      const times = fpsFrameTimesRef.current;
      times.push(nowMs);
      while (times.length > 0 && nowMs - times[0] > 1000) {
        times.shift();
      }
      const currentFps = Math.max(1, times.length);

      if (!landmarks || landmarks.length < 21) {
        setFeatures(null);
        const resetDeb = debouncerRef.current.update(null, nowMs);
        setDebounceState(resetDeb);
        setTelemetry((prev) => ({
          ...prev,
          cameraStatus: sourceMode,
          fps: currentFps,
          inferenceLatencyMs: Math.max(0.4, performance.now() - t0),
          trackingState: 'LOST',
        }));
        return;
      }

      const extracted = extractHandFeatures(
        landmarks,
        stateRef.current.calibration
      );

      // If user toggled "Test <80% Gate" in SimBench, apply negative confidence offset to demonstrate amber warning
      const confOffset =
        sourceMode === 'SIMULATION' && stateRef.current.simulatedLowConfidence
          ? -0.25
          : 0.0;

      const classification = classifyGesture(
        extracted,
        stateRef.current.customSamples,
        confOffset
      );

      const deb = debouncerRef.current.update(classification, nowMs);
      const latency = Math.max(0.8, performance.now() - t0);

      setFeatures(extracted);
      setDebounceState(deb);
      setTelemetry((prev) => ({
        ...prev,
        cameraStatus: stateRef.current.isPaused ? 'PAUSED' : sourceMode,
        fps: currentFps,
        inferenceLatencyMs: latency,
        trackingState: 'TRACKING',
      }));

      if (deb.status === 'COMMITTED' && deb.committedGestureId && deb.committedToken) {
        appendCommittedGesture(
          deb.committedGestureId,
          deb.committedToken,
          deb.committedSpokenPhrase || deb.committedToken,
          deb.priority,
          deb.confidence
        );
      }
    },
    [appendCommittedGesture]
  );

  // --------------------------------------------------------------------------
  // 4. SYNTHETIC KINEMATIC SIMULATION LOOP (WHEN SIMBENCH IS ENABLED)
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!isSimulating) return;

    let animId = 0;
    let lastTick = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      if (now - lastTick < 30) return; // ~33 FPS steady cadence
      lastTick = now;

      if (stateRef.current.isPaused) return;

      const syntheticPts = generateCanonicalLandmarks(
        stateRef.current.simulatedGesture,
        0.0025,
        now
      );
      processLandmarksFrame(syntheticPts, now, 'SIMULATION');
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, processLandmarksFrame]);

  // --------------------------------------------------------------------------
  // 5. LIVE MEDIAPIPE HANDS WEBCAM ENGINE
  // --------------------------------------------------------------------------

  const stopWebcam = useCallback(() => {
    setIsWebcamRunning(false);
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    setTelemetry((prev) => ({
      ...prev,
      cameraStatus: stateRef.current.isSimulating ? 'SIMULATION' : 'STANDBY',
      trackingState: stateRef.current.isSimulating ? 'TRACKING' : 'LOST',
    }));
  }, []);

  const startWebcam = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser mediaDevices API unavailable');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
          facingMode: 'user',
        },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      setIsSimulating(false);
      setIsWebcamRunning(true);
      setIsPaused(false);

      if (window.Hands) {
        const hands = new window.Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.60,
        });

        hands.onResults((results) => {
          if (stateRef.current.isPaused || stateRef.current.isSimulating) return;
          const now = performance.now();
          if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0
          ) {
            processLandmarksFrame(results.multiHandLandmarks[0], now, 'ACTIVE');
          } else {
            processLandmarksFrame(null, now, 'ACTIVE');
          }
        });

        const pumpFrame = async () => {
          if (!videoRef.current || !videoRef.current.srcObject) return;
          if (
            !stateRef.current.isPaused &&
            !stateRef.current.isSimulating &&
            videoRef.current.readyState >= 2
          ) {
            try {
              await hands.send({ image: videoRef.current });
            } catch {
              // ignore transient frame errors
            }
          }
          if (videoRef.current && videoRef.current.srcObject) {
            requestAnimationFrame(pumpFrame);
          }
        };
        requestAnimationFrame(pumpFrame);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to access webcam';
      setCameraError(msg);
      setIsWebcamRunning(false);
      setIsSimulating(true);
    }
  }, [processLandmarksFrame]);

  // --------------------------------------------------------------------------
  // 6. UI ACTION & PRECISION CALIBRATION HANDLERS
  // --------------------------------------------------------------------------

  const handleResetBuffer = () => {
    debouncerRef.current.reset();
    setTokenHistory([]);
    setSentenceBuffer('');
    setPauseProgressMs(0);
    hasSpokenSinceLastCommitRef.current = true;
  };

  const handleRunQuickWordDemo = () => {
    const demoWords: {
      id: GestureId;
      word: string;
      phrase: string;
      priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
      conf: number;
    }[] = [
      {
        id: 'EMERGENCY',
        word: 'EMERGENCY',
        phrase: 'Emergency! I need immediate assistance.',
        priority: 'CRITICAL',
        conf: 0.97,
      },
      {
        id: 'HELP',
        word: 'HELP',
        phrase: 'Please help me.',
        priority: 'CRITICAL',
        conf: 0.95,
      },
      {
        id: 'DOCTOR',
        word: 'DOCTOR',
        phrase: 'I need a doctor.',
        priority: 'CRITICAL',
        conf: 0.96,
      },
      {
        id: 'WATER',
        word: 'WATER',
        phrase: 'I would like some water.',
        priority: 'STANDARD',
        conf: 0.94,
      },
    ];

    setTokenHistory(
      demoWords.map((item, i) => ({
        id: `demo-${Date.now()}-${i}`,
        gestureId: item.id,
        display: item.word,
        spokenPhrase: item.phrase,
        priority: item.priority,
        confidence: item.conf,
        timestamp: new Date().toLocaleTimeString(),
      }))
    );

    const nextSentence = 'EMERGENCY HELP DOCTOR WATER ';
    setSentenceBuffer(nextSentence);
    lastCommitWallTimeRef.current = performance.now();
    hasSpokenSinceLastCommitRef.current = false;
  };

  const handleCalibrateDistanceAndNeutral = () => {
    if (!features) return;
    setCalibration((prev) => ({
      ...prev,
      isCalibrated: true,
      referencePalmSpan: features.palmSpan,
      lastCalibratedAt: new Date().toLocaleTimeString(),
    }));
  };

  const handleUpdateCalibration = (patch: Partial<CalibrationProfile>) => {
    setCalibration((prev) => ({
      ...prev,
      ...patch,
      isCalibrated: true,
      lastCalibratedAt: new Date().toLocaleTimeString(),
    }));
  };

  const handleRecordCustomSample = (gestureId: GestureId) => {
    if (!features) return;
    const vector = buildFeatureVector(features);
    setCustomSamples((prev) => [...prev, { gestureId, vector }]);
    setCalibration((prev) => ({
      ...prev,
      isCalibrated: true,
      referencePalmSpan: prev.referencePalmSpan ?? features.palmSpan,
      lastCalibratedAt: new Date().toLocaleTimeString(),
    }));
  };

  const handleAutoCalibrateCurrentPose = (gestureId: GestureId) => {
    if (!features) return;
    const baseVec = buildFeatureVector(features);
    // Capture 5 slightly perturbed vectors around the live hand posture for robust KNN + Cosine matching
    const burst = Array.from({ length: 5 }, (_, idx) => ({
      gestureId,
      vector: baseVec.map((v, i) => v + Math.sin(idx * 1.9 + i) * 0.004),
    }));
    setCustomSamples((prev) => [...prev, ...burst]);
    setCalibration((prev) => ({
      ...prev,
      isCalibrated: true,
      referencePalmSpan: prev.referencePalmSpan ?? features.palmSpan,
      lastCalibratedAt: new Date().toLocaleTimeString(),
    }));
  };

  const handleResetCalibration = () => {
    setCalibration(DEFAULT_CALIBRATION_PROFILE);
    setCustomSamples([]);
  };

  const handleInjectGestureInSim = (gestureId: GestureId) => {
    debouncerRef.current.releaseLatch();
    setIsSimulating(true);
    setSimulatedGesture(gestureId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. System Header (Top Bar) */}
      <SystemHeader
        telemetry={telemetry}
        onToggleBridgeMode={() =>
          setTelemetry((prev) => ({
            ...prev,
            hardwareBridgeMode:
              prev.hardwareBridgeMode === 'OPTICAL_VISION'
                ? 'SERIAL_GLOVE_READY'
                : 'OPTICAL_VISION',
          }))
        }
      />

      {/* Main Responsive Bento Grid Workspace */}
      <main className="max-w-[1600px] w-full mx-auto px-4 lg:px-6 py-4 flex-1 flex flex-col gap-4">
        {/* Top Row: Primary Viewport (60% Width / 7 Cols) + Translation & Inference Console (40% Width / 5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <PrimaryViewport
              videoRef={videoRef}
              canvasRef={canvasRef}
              telemetry={telemetry}
              features={features}
              debounceState={debounceState}
              isMirrored={isMirrored}
              showLandmarks={showLandmarks}
              isPaused={isPaused}
              isSimulating={isSimulating}
              simulatedGesture={simulatedGesture}
              simulatedLowConfidence={simulatedLowConfidence}
              onStartCamera={startWebcam}
              onStopCamera={stopWebcam}
              onToggleMirror={() => setIsMirrored((m) => !m)}
              onToggleLandmarks={() => setShowLandmarks((s) => !s)}
              onTogglePause={() => setIsPaused((p) => !p)}
              onResetBuffer={handleResetBuffer}
              onToggleSimulation={() => setIsSimulating((s) => !s)}
              onSelectSimGesture={(id) => {
                debouncerRef.current.releaseLatch();
                setSimulatedGesture(id);
              }}
              onToggleSimLowConfidence={() =>
                setSimulatedLowConfidence((low) => !low)
              }
              cameraError={cameraError}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <TranslationConsole
              debounceState={debounceState}
              features={features}
              tokenHistory={tokenHistory}
              sentenceBuffer={sentenceBuffer}
              onChangeSentence={setSentenceBuffer}
              onClearSentence={handleResetBuffer}
              onAppendSpace={() => setSentenceBuffer((s) => s + ' ')}
              onBackspace={() =>
                setSentenceBuffer((s) => {
                  const trimmed = s.trimEnd();
                  const lastSpace = trimmed.lastIndexOf(' ');
                  return lastSpace >= 0 ? trimmed.slice(0, lastSpace + 1) : '';
                })
              }
              onRunQuickWordDemo={handleRunQuickWordDemo}
            />
          </div>
        </div>

        {/* 4. Speech & Audio Control Panel (with Volume Increase/Decrease + Mute) */}
        <SpeechControlPanel
          autoSpeak={autoSpeak}
          onToggleAutoSpeak={() => setAutoSpeak((a) => !a)}
          speakImmediateOnCommit={speakImmediateOnCommit}
          onToggleSpeakImmediate={() => setSpeakImmediateOnCommit((s) => !s)}
          isSpeaking={isSpeaking}
          onSpeakNow={() => triggerSpeech()}
          onStopSpeaking={stopSpeech}
          speechVolume={speechVolume}
          isMuted={isMuted}
          onChangeVolume={(vol) => {
            setSpeechVolume(vol);
            if (vol > 0 && isMuted) setIsMuted(false);
          }}
          onToggleMute={() => setIsMuted((m) => !m)}
          speechRate={speechRate}
          onChangeRate={setSpeechRate}
          speechPitch={speechPitch}
          onChangePitch={setSpeechPitch}
          voices={voices}
          selectedVoiceURI={selectedVoiceURI}
          onSelectVoice={setSelectedVoiceURI}
          pauseProgressMs={pauseProgressMs}
          sentenceBuffer={sentenceBuffer}
        />

        {/* 5. Gesture Reference & Precision Calibration Drawer (Collapsible Bottom Bar) */}
        <GestureReferenceDrawer
          features={features}
          calibration={calibration}
          customSamples={customSamples}
          activeGestureId={debounceState.candidateId}
          onCalibrateDistanceAndNeutral={handleCalibrateDistanceAndNeutral}
          onUpdateCalibration={handleUpdateCalibration}
          onRecordCustomSample={handleRecordCustomSample}
          onAutoCalibrateCurrentPose={handleAutoCalibrateCurrentPose}
          onResetCalibration={handleResetCalibration}
          onInjectGestureInSim={handleInjectGestureInSim}
        />
      </main>
    </div>
  );
};

export default App;
