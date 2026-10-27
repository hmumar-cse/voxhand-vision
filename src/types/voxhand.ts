export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type GestureId =
  | 'HELLO'
  | 'YES'
  | 'NO'
  | 'THANK_YOU'
  | 'PLEASE'
  | 'HELP'
  | 'EMERGENCY'
  | 'DOCTOR'
  | 'PAIN'
  | 'MEDICINE'
  | 'WATER'
  | 'FOOD'
  | 'BATHROOM'
  | 'STOP'
  | 'MORE'
  | 'NONE';

export type GestureCategory = 'Emergency & Medical' | 'Daily Needs' | 'Core Dialogue';

export interface GestureMetadata {
  id: GestureId;
  name: string;
  spokenPhrase: string;
  token: string;
  category: GestureCategory;
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  description: string;
  handPostureGuide: string;
  fingerPattern: [boolean, boolean, boolean, boolean, boolean]; // [Thumb, Index, Middle, Ring, Pinky]
  angleHint: string;
}

export interface CalibrationProfile {
  isCalibrated: boolean;
  referencePalmSpan: number | null;
  curlAngleThresholdDeg: number; // default 135 deg
  extensionRatioThreshold: number; // default 0.65
  rotationInvariant: boolean;
  lastCalibratedAt: string | null;
}

export interface HandFeatures {
  rawPts: [number, number, number][];
  normPts: [number, number, number][]; // Translation, scale, and in-plane rotation normalized
  palmSpan: number;
  calibratedSpanRatio: number;
  handRollDeg: number;
  tipToMcp: number[];
  tipToWrist: number[];
  fingerAngles: number[];
  fingerCurlRatios: number[]; // 0.0 (straight) to 1.0 (fully curled)
  fingerExtended: [boolean, boolean, boolean, boolean, boolean];
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface ClassificationResult {
  gestureId: GestureId;
  displayName: string;
  spokenPhrase: string;
  token: string;
  category: GestureCategory;
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  confidence: number; // 0.0 to 1.0
  allScores: Record<string, number>;
}

export interface DebounceState {
  candidateId: GestureId;
  displayName: string;
  spokenPhrase: string;
  token: string;
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  confidence: number;
  holdDurationMs: number;
  requiredHoldMs: number;
  holdProgress: number; // 0 to 1
  status: 'IDLE' | 'HOLDING' | 'COMMITTED' | 'LOW_CONFIDENCE' | 'COOLDOWN';
  committedToken: string | null;
  committedSpokenPhrase: string | null;
  committedGestureId: GestureId | null;
}

export interface TelemetryMetrics {
  cameraStatus: 'ACTIVE' | 'STANDBY' | 'PAUSED' | 'SIMULATION' | 'ERROR';
  fps: number;
  inferenceLatencyMs: number;
  trackingState: 'TRACKING' | 'LOST';
  hardwareBridgeMode: 'OPTICAL_VISION' | 'SERIAL_GLOVE_READY';
}

export interface AccumulatedToken {
  id: string;
  gestureId: GestureId;
  display: string;
  spokenPhrase: string;
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  confidence: number;
  timestamp: string;
}
