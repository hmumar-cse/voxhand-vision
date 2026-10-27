import {
  Point3D,
  GestureId,
  GestureMetadata,
  HandFeatures,
  ClassificationResult,
  DebounceState,
  CalibrationProfile,
  SimScenarioPreset,
} from '../types/voxhand';

export const WRIST = 0;
export const THUMB_CMC = 1;
export const THUMB_MCP = 2;
export const THUMB_IP = 3;
export const THUMB_TIP = 4;
export const INDEX_MCP = 5;
export const INDEX_PIP = 6;
export const INDEX_DIP = 7;
export const INDEX_TIP = 8;
export const MIDDLE_MCP = 9;
export const MIDDLE_PIP = 10;
export const MIDDLE_DIP = 11;
export const MIDDLE_TIP = 12;
export const RING_MCP = 13;
export const RING_PIP = 14;
export const RING_DIP = 15;
export const RING_TIP = 16;
export const PINKY_MCP = 17;
export const PINKY_PIP = 18;
export const PINKY_DIP = 19;
export const PINKY_TIP = 20;

export const FINGERTIP_IDS = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
export const MCP_IDS = [THUMB_MCP, INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP];

export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [0, 13], [13, 14], [14, 15], [15, 16],// Ring
  [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [5, 9], [9, 13], [13, 17], [5, 17],   // Palm Metacarpal Ridge
];

export const DEFAULT_CALIBRATION_PROFILE: CalibrationProfile = {
  isCalibrated: false,
  referencePalmSpan: null,
  curlAngleThresholdDeg: 136,
  extensionRatioThreshold: 0.65,
  rotationInvariant: true,
  lastCalibratedAt: null,
};

export const SIM_SCENARIO_PRESETS: SimScenarioPreset[] = [
  {
    id: 'medical-urgent',
    label: 'Medical Emergency',
    sequence: ['EMERGENCY', 'PAIN', 'DOCTOR', 'HOSPITAL'],
  },
  {
    id: 'daily-care',
    label: 'Daily Care Request',
    sequence: ['HELLO', 'PLEASE', 'WATER', 'FOOD', 'THANK_YOU'],
  },
  {
    id: 'patient-comfort',
    label: 'Patient Comfort',
    sequence: ['HELP', 'COLD', 'TIRED', 'MEDICINE', 'CALL_FAMILY'],
  },
];

// ----------------------------------------------------------------------------
// 20 MANDATORY WORD-LEVEL SIGN LANGUAGE VOCABULARY (NO LETTERWISE SPELLING)
// ----------------------------------------------------------------------------

export const GESTURE_CATALOG: GestureMetadata[] = [
  // --- EMERGENCY & MEDICAL (7 SIGNS) ---
  {
    id: 'EMERGENCY',
    name: 'EMERGENCY (Alert)',
    spokenPhrase: 'Emergency! I need immediate assistance.',
    token: 'EMERGENCY ',
    category: 'Emergency & Medical',
    priority: 'CRITICAL',
    description: 'Thumb, Index, and Pinky extended outward (ILY / Alert posture) with Middle and Ring curled tightly into palm.',
    handPostureGuide: 'Extend Thumb + Index + Pinky; curl Middle + Ring',
    fingerPattern: [true, true, false, false, true],
    angleHint: 'Thumb+Index+Pinky EXT (>140°)',
  },
  {
    id: 'HELP',
    name: 'HELP ME',
    spokenPhrase: 'Please help me.',
    token: 'HELP ',
    category: 'Emergency & Medical',
    priority: 'CRITICAL',
    description: 'Closed fist with thumb braced upright along the side of the index knuckle (ASL Help posture).',
    handPostureGuide: 'Curl 4 fingers; brace Thumb upright alongside Index MCP',
    fingerPattern: [true, false, false, false, false],
    angleHint: '4 fingers curled, Thumb beside Index',
  },
  {
    id: 'DOCTOR',
    name: 'DOCTOR / MEDICAL',
    spokenPhrase: 'I need a doctor.',
    token: 'DOCTOR ',
    category: 'Emergency & Medical',
    priority: 'CRITICAL',
    description: 'Index finger extended straight upward while Thumb pinches against curled Middle, Ring, and Pinky fingers.',
    handPostureGuide: 'Extend Index straight up; tuck Thumb & other 3 digits',
    fingerPattern: [false, true, false, false, false],
    angleHint: 'Index only EXT (>155°), Thumb tucked',
  },
  {
    id: 'HOSPITAL',
    name: 'HOSPITAL',
    spokenPhrase: 'Take me to the hospital.',
    token: 'HOSPITAL ',
    category: 'Emergency & Medical',
    priority: 'CRITICAL',
    description: 'Index and Middle fingers extended and pressed tightly together (ASL H-handshape) with Thumb tucked across palm.',
    handPostureGuide: 'Extend Index + Middle pressed tightly together; tuck Thumb',
    fingerPattern: [false, true, true, false, false],
    angleHint: 'Index+Middle adjoined (<0.26 spread), Thumb tucked',
  },
  {
    id: 'PAIN',
    name: 'PAIN / HURT',
    spokenPhrase: 'I am experiencing pain.',
    token: 'PAIN ',
    category: 'Emergency & Medical',
    priority: 'HIGH',
    description: 'Thumb and Index finger extended at an orthogonal 90-degree angle with Middle, Ring, and Pinky curled.',
    handPostureGuide: 'Extend Thumb + Index in L-frame (~90°); curl other 3',
    fingerPattern: [true, true, false, false, false],
    angleHint: 'Thumb+Index ortho angle 65°–120°',
  },
  {
    id: 'MEDICINE',
    name: 'MEDICINE',
    spokenPhrase: 'I need my medicine.',
    token: 'MEDICINE ',
    category: 'Emergency & Medical',
    priority: 'HIGH',
    description: 'Pinky finger extended straight upward alone while Thumb, Index, Middle, and Ring are curled into the palm.',
    handPostureGuide: 'Extend Pinky only; curl Thumb, Index, Middle, Ring',
    fingerPattern: [false, false, false, false, true],
    angleHint: 'Pinky only EXT (>140°)',
  },
  {
    id: 'CALL_FAMILY',
    name: 'CALL FAMILY',
    spokenPhrase: 'Please call my family.',
    token: 'CALL FAMILY ',
    category: 'Emergency & Medical',
    priority: 'HIGH',
    description: 'Index and Pinky fingers extended upward (horned handshape) while Thumb, Middle, and Ring are curled over palm.',
    handPostureGuide: 'Extend Index + Pinky; curl Thumb, Middle, Ring',
    fingerPattern: [false, true, false, false, true],
    angleHint: 'Index+Pinky EXT, Thumb/Middle/Ring CRL',
  },

  // --- DAILY NEEDS (6 SIGNS) ---
  {
    id: 'WATER',
    name: 'WATER',
    spokenPhrase: 'I would like some water.',
    token: 'WATER ',
    category: 'Daily Needs',
    priority: 'STANDARD',
    description: 'Index, Middle, and Ring fingers extended upward in a W formation with Pinky and Thumb folded across palm.',
    handPostureGuide: 'Extend Index + Middle + Ring (W-sign); curl Pinky + Thumb',
    fingerPattern: [false, true, true, true, false],
    angleHint: '3 central fingers EXT (>140°)',
  },
  {
    id: 'FOOD',
    name: 'FOOD / EAT',
    spokenPhrase: 'I need food.',
    token: 'FOOD ',
    category: 'Daily Needs',
    priority: 'STANDARD',
    description: 'All four fingers and thumb curved into a semi-circular cupped arc (curved O / C posture).',
    handPostureGuide: 'Curve all 5 digits into a semi-flexed C/O arc',
    fingerPattern: [true, false, false, false, false],
    angleHint: '4 fingers semi-curled (80°–142°)',
  },
  {
    id: 'BATHROOM',
    name: 'BATHROOM / RESTROOM',
    spokenPhrase: 'Where is the bathroom?',
    token: 'BATHROOM ',
    category: 'Daily Needs',
    priority: 'HIGH',
    description: 'Index and Middle fingers extended and spread apart in a V formation; Ring, Pinky, and Thumb curled.',
    handPostureGuide: 'Extend Index + Middle in a spread V; curl Ring + Pinky',
    fingerPattern: [false, true, true, false, false],
    angleHint: 'Index+Middle spread >0.29 norm',
  },
  {
    id: 'MORE',
    name: 'MORE',
    spokenPhrase: 'More please.',
    token: 'MORE ',
    category: 'Daily Needs',
    priority: 'STANDARD',
    description: 'Thumb and Index finger pinched in an O-ring while Middle, Ring, and Pinky are extended straight upward.',
    handPostureGuide: 'Pinch Thumb + Index; extend Middle + Ring + Pinky',
    fingerPattern: [false, false, true, true, true],
    angleHint: 'Middle+Ring+Pinky EXT, Index+Thumb pinch',
  },
  {
    id: 'TIRED',
    name: 'TIRED / REST',
    spokenPhrase: 'I am tired and need to rest.',
    token: 'TIRED ',
    category: 'Daily Needs',
    priority: 'STANDARD',
    description: 'Middle finger extended upward while Thumb, Index, Ring, and Pinky are curled downward.',
    handPostureGuide: 'Extend Middle finger only; curl other 4 digits',
    fingerPattern: [false, false, true, false, false],
    angleHint: 'Middle finger only EXT (>142°)',
  },
  {
    id: 'COLD',
    name: 'COLD / BLANKET',
    spokenPhrase: 'I am feeling cold.',
    token: 'COLD ',
    category: 'Daily Needs',
    priority: 'STANDARD',
    description: 'Thumb, Index, and Middle fingers extended outward (3-digit spread) while Ring and Pinky are curled into palm.',
    handPostureGuide: 'Extend Thumb + Index + Middle; curl Ring + Pinky',
    fingerPattern: [true, true, true, false, false],
    angleHint: 'Thumb+Index+Middle EXT, spread >0.28',
  },

  // --- CORE DIALOGUE (7 SIGNS) ---
  {
    id: 'HELLO',
    name: 'HELLO / GREETING',
    spokenPhrase: 'Hello!',
    token: 'HELLO ',
    category: 'Core Dialogue',
    priority: 'STANDARD',
    description: 'All five digits fully extended and splayed apart in an open palm greeting posture.',
    handPostureGuide: 'Open palm with all 5 fingers spread wide apart',
    fingerPattern: [true, true, true, true, true],
    angleHint: 'All 5 digits EXT, splay >0.36',
  },
  {
    id: 'THANK_YOU',
    name: 'THANK YOU',
    spokenPhrase: 'Thank you very much.',
    token: 'THANK YOU ',
    category: 'Core Dialogue',
    priority: 'STANDARD',
    description: 'Flat open hand with Index, Middle, Ring, and Pinky pressed straight together and Thumb tucked.',
    handPostureGuide: 'Extend 4 fingers straight & pressed together; tuck Thumb',
    fingerPattern: [false, true, true, true, true],
    angleHint: '4 fingers EXT & adjoined',
  },
  {
    id: 'PLEASE',
    name: 'PLEASE',
    spokenPhrase: 'Please.',
    token: 'PLEASE ',
    category: 'Core Dialogue',
    priority: 'STANDARD',
    description: 'Thumb and Pinky extended wide outward (Y-shaka posture) while Index, Middle, and Ring are curled.',
    handPostureGuide: 'Extend Thumb + Pinky wide; curl Index, Middle, Ring',
    fingerPattern: [true, false, false, false, true],
    angleHint: 'Thumb+Pinky span >1.05 norm',
  },
  {
    id: 'SORRY',
    name: 'SORRY / APOLOGY',
    spokenPhrase: 'I am sorry.',
    token: 'SORRY ',
    category: 'Core Dialogue',
    priority: 'STANDARD',
    description: 'Ring and Pinky fingers extended together while Thumb, Index, and Middle are curled over palm.',
    handPostureGuide: 'Extend Ring + Pinky; curl Thumb, Index, Middle',
    fingerPattern: [false, false, false, true, true],
    angleHint: 'Ring+Pinky EXT, Thumb/Index/Middle CRL',
  },
  {
    id: 'YES',
    name: 'YES / CONFIRM',
    spokenPhrase: 'Yes.',
    token: 'YES ',
    category: 'Core Dialogue',
    priority: 'STANDARD',
    description: 'Thumb extended sharply upward well above the knuckle line while all four fingers are curled.',
    handPostureGuide: 'Thumbs-Up posture with Thumb high above knuckles',
    fingerPattern: [true, false, false, false, false],
    angleHint: 'Thumb elevated >0.30 above Index MCP',
  },
  {
    id: 'NO',
    name: 'NO / DECLINE',
    spokenPhrase: 'No.',
    token: 'NO ',
    category: 'Core Dialogue',
    priority: 'STANDARD',
    description: 'Index and Middle fingers extended pressed closely together converging toward the extended Thumb.',
    handPostureGuide: 'Extend Index + Middle pressed together with Thumb',
    fingerPattern: [true, true, true, false, false],
    angleHint: 'Thumb+Index+Middle adjoined (<0.28 spread)',
  },
  {
    id: 'STOP',
    name: 'STOP / WAIT',
    spokenPhrase: 'Stop, please wait.',
    token: 'STOP ',
    category: 'Core Dialogue',
    priority: 'HIGH',
    description: 'All five digits tightly flexed into a compact closed fist with thumb tucked across the front.',
    handPostureGuide: 'Close all 5 fingers into a tight compact fist',
    fingerPattern: [false, false, false, false, false],
    angleHint: 'All 5 digits tightly curled',
  },
];

// ----------------------------------------------------------------------------
// 1. 3D VECTOR GEOMETRY & ROTATION-INVARIANT PALM ALIGNMENT
// ----------------------------------------------------------------------------

function vecSub(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vecNorm(v: [number, number, number]): number {
  return Math.hypot(v[0], v[1], v[2]);
}

export function dist3D(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function computeAngleDeg(
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number]
): number {
  const ba = vecSub(a, b);
  const bc = vecSub(c, b);
  const nBa = vecNorm(ba);
  const nBc = vecNorm(bc);
  if (nBa < 1e-6 || nBc < 1e-6) return 180.0;
  let cosA = (ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2]) / (nBa * nBc);
  cosA = Math.max(-1.0, Math.min(1.0, cosA));
  return Math.acos(cosA) * (180.0 / Math.PI);
}

/**
 * Extracts rotation-invariant, scale-invariant, and wrist-centered 3D features.
 */
export function extractHandFeatures(
  rawLandmarks: Point3D[],
  calibration: CalibrationProfile = DEFAULT_CALIBRATION_PROFILE
): HandFeatures {
  const pts: [number, number, number][] = rawLandmarks.map((lm) => [lm.x, lm.y, lm.z]);
  const wrist = pts[WRIST];
  const rawPalmSpan = Math.max(dist3D(pts[MIDDLE_MCP], wrist), 1e-6);

  const calibratedSpanRatio = calibration.referencePalmSpan
    ? rawPalmSpan / calibration.referencePalmSpan
    : 1.0;

  // Step 1: Translate to Wrist origin and scale by Palm Span
  const centeredPts: [number, number, number][] = pts.map((p) => [
    (p[0] - wrist[0]) / rawPalmSpan,
    (p[1] - wrist[1]) / rawPalmSpan,
    (p[2] - wrist[2]) / rawPalmSpan,
  ]);

  // Step 2: Compute in-plane hand roll angle so tilted hands still classify accurately
  const midMcp = centeredPts[MIDDLE_MCP];
  const currentAngleRad = Math.atan2(midMcp[1], midMcp[0]);
  const targetAngleRad = -Math.PI / 2; // straight up
  const deltaRad = calibration.rotationInvariant ? targetAngleRad - currentAngleRad : 0;
  const handRollDeg = ((currentAngleRad - targetAngleRad) * 180) / Math.PI;

  const cosR = Math.cos(deltaRad);
  const sinR = Math.sin(deltaRad);

  let normPts: [number, number, number][] = centeredPts.map(([x, y, z]) => [
    x * cosR - y * sinR,
    x * sinR + y * cosR,
    z,
  ]);

  // Step 3: Handedness normalization
  if (normPts[INDEX_MCP][0] > normPts[PINKY_MCP][0]) {
    normPts = normPts.map(([x, y, z]) => [-x, y, z]);
  }

  const tipToMcp = [
    dist3D(normPts[THUMB_TIP], normPts[THUMB_MCP]),
    dist3D(normPts[INDEX_TIP], normPts[INDEX_MCP]),
    dist3D(normPts[MIDDLE_TIP], normPts[MIDDLE_MCP]),
    dist3D(normPts[RING_TIP], normPts[RING_MCP]),
    dist3D(normPts[PINKY_TIP], normPts[PINKY_MCP]),
  ];

  const tipToWrist = FINGERTIP_IDS.map((id) => vecNorm(normPts[id]));

  const fingerAngles = [
    computeAngleDeg(normPts[THUMB_CMC], normPts[THUMB_MCP], normPts[THUMB_TIP]),
    computeAngleDeg(normPts[INDEX_MCP], normPts[INDEX_PIP], normPts[INDEX_TIP]),
    computeAngleDeg(normPts[MIDDLE_MCP], normPts[MIDDLE_PIP], normPts[MIDDLE_TIP]),
    computeAngleDeg(normPts[RING_MCP], normPts[RING_PIP], normPts[RING_TIP]),
    computeAngleDeg(normPts[PINKY_MCP], normPts[PINKY_PIP], normPts[PINKY_TIP]),
  ];

  const fingerCurlRatios = fingerAngles.map((ang) =>
    Math.max(0.0, Math.min(1.0, (175.0 - ang) / 110.0))
  );

  const thumbPinkyMcpDist = dist3D(normPts[THUMB_TIP], normPts[PINKY_MCP]);
  const thumbExtended =
    tipToMcp[0] > 0.50 &&
    thumbPinkyMcpDist > 0.82 &&
    fingerAngles[0] > Math.max(115.0, calibration.curlAngleThresholdDeg - 18.0);

  const extRatioMin = calibration.extensionRatioThreshold;
  const angleMin = calibration.curlAngleThresholdDeg;

  const fingerExtended: [boolean, boolean, boolean, boolean, boolean] = [
    thumbExtended,
    tipToMcp[1] > extRatioMin && tipToWrist[1] > 1.28 && fingerAngles[1] > angleMin,
    tipToMcp[2] > extRatioMin && tipToWrist[2] > 1.28 && fingerAngles[2] > angleMin,
    tipToMcp[3] > extRatioMin && tipToWrist[3] > 1.25 && fingerAngles[3] > angleMin,
    tipToMcp[4] > extRatioMin - 0.04 && tipToWrist[4] > 1.18 && fingerAngles[4] > angleMin - 4,
  ];

  let minX = 1.0,
    minY = 1.0,
    maxX = 0.0,
    maxY = 0.0;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return {
    rawPts: pts,
    normPts,
    palmSpan: rawPalmSpan,
    calibratedSpanRatio,
    handRollDeg,
    tipToMcp,
    tipToWrist,
    fingerAngles,
    fingerCurlRatios,
    fingerExtended,
    boundingBox: { minX, minY, maxX, maxY },
  };
}

// ----------------------------------------------------------------------------
// 2. HYBRID RULE + CANONICAL PROTOTYPE COSINE CLASSIFIER (20 MANDATORY SIGNS)
// ----------------------------------------------------------------------------

// Lazily computed canonical 83-D feature prototypes for each of the 20 gestures
let canonicalPrototypeCache: Record<GestureId, number[]> | null = null;

function getCanonicalPrototypes(): Record<GestureId, number[]> {
  if (canonicalPrototypeCache) return canonicalPrototypeCache;
  const cache = {} as Record<GestureId, number[]>;
  for (const g of GESTURE_CATALOG) {
    const lms = generateCanonicalLandmarks(g.id, 0, 0);
    const feats = extractHandFeatures(lms, DEFAULT_CALIBRATION_PROFILE);
    cache[g.id] = buildFeatureVector(feats);
  }
  canonicalPrototypeCache = cache;
  return cache;
}

export function classifyGesture(
  f: HandFeatures,
  customSamples: { gestureId: GestureId; vector: number[] }[] = [],
  confidenceGain = 0.0
): ClassificationResult {
  const pts = f.normPts;
  const [tExt, iExt, mExt, rExt, pExt] = f.fingerExtended;
  const dMcp = f.tipToMcp;
  const dWrist = f.tipToWrist;
  const ang = f.fingerAngles;

  const indexMiddleSpread = dist3D(pts[INDEX_TIP], pts[MIDDLE_TIP]);
  const middleRingSpread = dist3D(pts[MIDDLE_TIP], pts[RING_TIP]);
  const thumbIndexTipDist = dist3D(pts[THUMB_TIP], pts[INDEX_TIP]);
  const thumbMiddleTipDist = dist3D(pts[THUMB_TIP], pts[MIDDLE_TIP]);
  const thumbIndexMcpDist = dist3D(pts[THUMB_TIP], pts[INDEX_MCP]);
  const thumbPinkyMcpDist = dist3D(pts[THUMB_TIP], pts[PINKY_MCP]);

  const scores: Record<GestureId, number> = {
    HELLO: 0.05,
    YES: 0.05,
    NO: 0.05,
    THANK_YOU: 0.05,
    PLEASE: 0.05,
    SORRY: 0.05,
    HELP: 0.05,
    EMERGENCY: 0.05,
    DOCTOR: 0.05,
    HOSPITAL: 0.05,
    PAIN: 0.05,
    MEDICINE: 0.05,
    CALL_FAMILY: 0.05,
    WATER: 0.05,
    FOOD: 0.05,
    BATHROOM: 0.05,
    TIRED: 0.05,
    COLD: 0.05,
    STOP: 0.05,
    MORE: 0.05,
    NONE: 0.1,
  };

  // 1. HELLO (All 5 digits extended and splayed)
  if (tExt && iExt && mExt && rExt && pExt) {
    const splay = indexMiddleSpread + middleRingSpread;
    if (splay > 0.35 && thumbIndexMcpDist > 0.55) {
      scores.HELLO = Math.min(0.98, 0.87 + 0.11 * Math.min(1.0, (splay - 0.35) / 0.35));
    } else {
      scores.THANK_YOU = 0.86;
    }
  }

  // 2. THANK YOU (4 fingers straight and pressed together, thumb tucked)
  if (iExt && mExt && rExt && pExt && (!tExt || thumbPinkyMcpDist < 0.84)) {
    const adjoined = Math.max(0.0, 1.0 - (indexMiddleSpread - 0.18) / 0.35);
    scores.THANK_YOU = Math.min(0.97, 0.86 + 0.11 * Math.min(1.0, adjoined));
  }

  // 3. EMERGENCY (Thumb, Index, and Pinky extended; Middle and Ring curled)
  if (tExt && iExt && !mExt && !rExt && pExt) {
    scores.EMERGENCY = 0.97;
  }

  // 4. CALL FAMILY (Index and Pinky extended; Thumb, Middle, and Ring curled)
  if (!tExt && iExt && !mExt && !rExt && pExt) {
    scores.CALL_FAMILY = 0.96;
  }

  // 5. WATER (Index, Middle, and Ring extended in W-sign; Pinky and Thumb curled)
  if (!tExt && iExt && mExt && rExt && !pExt) {
    scores.WATER = 0.96;
  }

  // 6. MORE (Middle, Ring, Pinky extended; Index curled pinching Thumb in OK/F-shape)
  if (!iExt && mExt && rExt && pExt) {
    const pinchBonus = Math.max(0.0, 1.0 - thumbIndexTipDist / 0.55);
    scores.MORE = Math.min(0.97, 0.87 + 0.10 * pinchBonus);
  }

  // 7. SORRY (Ring and Pinky extended; Thumb, Index, Middle curled)
  if (!tExt && !iExt && !mExt && rExt && pExt) {
    scores.SORRY = 0.95;
  }

  // 8. TIRED (Middle finger extended alone; Thumb, Index, Ring, Pinky curled)
  if (!tExt && !iExt && mExt && !rExt && !pExt) {
    scores.TIRED = 0.95;
  }

  // 9. PAIN (Thumb and Index extended at ~90 deg L-frame; Middle, Ring, Pinky curled)
  if (tExt && iExt && !mExt && !rExt && !pExt) {
    const orthoAng = computeAngleDeg(pts[THUMB_TIP], pts[INDEX_MCP], pts[INDEX_TIP]);
    if (orthoAng >= 42.0 && orthoAng <= 135.0) {
      scores.PAIN = Math.min(0.98, 0.87 + 0.11 * (1.0 - Math.abs(orthoAng - 85.0) / 55.0));
    }
  }

  // 10. DOCTOR (Index extended straight up alone; Thumb tucked touching curled Middle)
  if (!tExt && iExt && !mExt && !rExt && !pExt) {
    const pinchBonus = Math.max(0.0, 1.0 - thumbMiddleTipDist / 0.60);
    scores.DOCTOR = Math.min(0.96, 0.86 + 0.10 * pinchBonus);
  }

  // 11. MEDICINE (Pinky extended straight up alone; Thumb, Index, Middle, Ring curled)
  if (!tExt && !iExt && !mExt && !rExt && pExt) {
    scores.MEDICINE = 0.96;
  }

  // 12. PLEASE (Thumb and Pinky extended wide in Y-shape; Index, Middle, Ring curled)
  if (tExt && !iExt && !mExt && !rExt && pExt) {
    const spanTY = dist3D(pts[THUMB_TIP], pts[PINKY_TIP]);
    scores.PLEASE = Math.min(0.98, 0.87 + 0.11 * Math.min(1.0, (spanTY - 1.05) / 0.6));
  }

  // 13. 2-Finger & 3-Finger Group: BATHROOM vs HOSPITAL vs COLD vs NO
  if (iExt && mExt && !rExt && !pExt) {
    if (!tExt) {
      if (indexMiddleSpread > 0.28) {
        scores.BATHROOM = Math.min(
          0.98,
          0.87 + 0.11 * Math.min(1.0, (indexMiddleSpread - 0.28) / 0.30)
        );
      } else {
        scores.HOSPITAL = Math.min(
          0.96,
          0.87 + 0.09 * Math.max(0.0, 1.0 - indexMiddleSpread / 0.28)
        );
      }
    } else {
      if (indexMiddleSpread > 0.28) {
        scores.COLD = Math.min(
          0.97,
          0.87 + 0.10 * Math.min(1.0, (indexMiddleSpread - 0.28) / 0.30)
        );
      } else {
        scores.NO = Math.min(
          0.96,
          0.86 + 0.10 * Math.max(0.0, 1.0 - indexMiddleSpread / 0.28)
        );
      }
    }
  }

  // 14. FOOD (All 4 fingers partially flexed in a cupped C/O arc)
  const meanAngle4 = (ang[1] + ang[2] + ang[3] + ang[4]) / 4.0;
  const meanMcp4 = (dMcp[1] + dMcp[2] + dMcp[3] + dMcp[4]) / 4.0;
  if (
    !iExt &&
    !mExt &&
    !rExt &&
    !pExt &&
    meanAngle4 >= 75.0 &&
    meanAngle4 <= 145.0 &&
    meanMcp4 >= 0.42 &&
    meanMcp4 <= 0.88 &&
    thumbIndexTipDist >= 0.28 &&
    thumbIndexTipDist <= 1.08
  ) {
    scores.FOOD = Math.min(0.96, 0.86 + 0.10 * (1.0 - Math.abs(meanAngle4 - 112.0) / 45.0));
  }

  // 15. Closed-finger group: YES (Thumbs Up), HELP (Fist + Side Thumb), STOP (Compact Fist)
  if (!iExt && !mExt && !rExt && !pExt && scores.FOOD < 0.75) {
    const thumbElevation = pts[INDEX_MCP][1] - pts[THUMB_TIP][1];
    const thumbBesideIndex = thumbIndexMcpDist < 0.45;

    if (tExt && thumbElevation > 0.30) {
      scores.YES = Math.min(0.97, 0.87 + Math.min(0.10, (thumbElevation - 0.30) * 0.25));
    } else if (thumbElevation > -0.06 && (thumbBesideIndex || tExt)) {
      scores.HELP = 0.95;
    } else {
      const compactness = (dWrist[1] + dWrist[2] + dWrist[3] + dWrist[4]) / 4.0;
      scores.STOP = compactness < 1.15 ? 0.95 : 0.86;
    }
  }

  // Step B: Hybrid Canonical Prototype Cosine Refinement for higher real-webcam accuracy
  const currentVec = buildFeatureVector(f);
  const prototypes = getCanonicalPrototypes();
  for (const g of GESTURE_CATALOG) {
    const protoVec = prototypes[g.id];
    if (!protoVec) continue;
    const cosSim = computeCosineSimilarity(currentVec, protoVec);
    // Pattern match check on the 5 fingers
    let patternMatches = 0;
    for (let k = 0; k < 5; k++) {
      if (f.fingerExtended[k] === g.fingerPattern[k]) patternMatches++;
    }
    if (patternMatches === 5 && cosSim > 0.88) {
      scores[g.id] = Math.max(scores[g.id], Math.min(0.98, 0.78 + (cosSim - 0.85) * 1.35));
    }
  }

  // Step C: Blend with user-calibrated Cosine + Euclidean KNN snapshots
  if (customSamples.length > 0) {
    let bestSimilarity = 0;
    let nearestId: GestureId | null = null;

    for (const s of customSamples) {
      const cosSim = computeCosineSimilarity(currentVec, s.vector);
      const eucDist = computeEuclideanDistance(currentVec, s.vector);
      const combinedSim = 0.65 * cosSim + 0.35 * Math.exp(-eucDist * 0.9);
      if (combinedSim > bestSimilarity) {
        bestSimilarity = combinedSim;
        nearestId = s.gestureId;
      }
    }

    if (nearestId && bestSimilarity > 0.72) {
      scores[nearestId] = Math.min(
        0.99,
        Math.max(scores[nearestId], 0.35 * scores[nearestId] + 0.65 * bestSimilarity)
      );
    }
  }

  let bestId: GestureId = 'NONE';
  let bestScore = 0.0;
  for (const [id, sc] of Object.entries(scores) as [GestureId, number][]) {
    if (id !== 'NONE' && sc > bestScore) {
      bestScore = sc;
      bestId = id;
    }
  }

  const adjustedConfidence = Math.max(0.0, Math.min(0.99, bestScore + confidenceGain));
  const meta = GESTURE_CATALOG.find((g) => g.id === bestId);

  return {
    gestureId: bestId,
    displayName: meta ? meta.name : bestId,
    spokenPhrase: meta ? meta.spokenPhrase : bestId,
    token: meta ? meta.token : '',
    category: meta ? meta.category : 'Core Dialogue',
    priority: meta ? meta.priority : 'STANDARD',
    confidence: adjustedConfidence,
    allScores: scores,
  };
}

export function buildFeatureVector(f: HandFeatures): number[] {
  const vec: number[] = [];
  for (const p of f.normPts) vec.push(p[0], p[1], p[2]);
  for (const d of f.tipToMcp) vec.push(d);
  for (const d of f.tipToWrist) vec.push(d);
  for (const a of f.fingerAngles) vec.push(a / 180.0);
  for (const c of f.fingerCurlRatios) vec.push(c);
  return vec;
}

function computeCosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 1e-6 ? Math.max(0, dot / denom) : 0;
}

function computeEuclideanDistance(a: number[], b: number[]): number {
  let sq = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const d = a[i] - b[i];
    sq += d * d;
  }
  return Math.sqrt(sq);
}

// ----------------------------------------------------------------------------
// 3. TEMPORAL MULTI-FRAME SMOOTHER + 600ms HOLD DEBOUNCER
// ----------------------------------------------------------------------------

export class GestureHoldDebouncer {
  private requiredHoldMs: number;
  private minConfidence: number;
  private cooldownMs: number;
  private candidateId: GestureId = 'NONE';
  private holdStartTs: number | null = null;
  private lastCommitTs = 0;
  private latchedGestureId: GestureId | null = null;
  private recentPredictions: { id: GestureId; conf: number }[] = [];

  constructor(requiredHoldMs = 600, minConfidence = 0.80, cooldownMs = 600) {
    this.requiredHoldMs = requiredHoldMs;
    this.minConfidence = minConfidence;
    this.cooldownMs = cooldownMs;
  }

  public reset(): void {
    this.candidateId = 'NONE';
    this.holdStartTs = null;
    this.lastCommitTs = 0;
    this.latchedGestureId = null;
    this.recentPredictions = [];
  }

  public releaseLatch(): void {
    this.latchedGestureId = null;
    this.holdStartTs = null;
  }

  public update(classification: ClassificationResult | null, nowMs: number): DebounceState {
    if (!classification || classification.gestureId === 'NONE') {
      this.candidateId = 'NONE';
      this.holdStartTs = null;
      this.latchedGestureId = null;
      this.recentPredictions = [];
      return {
        candidateId: 'NONE',
        displayName: 'No Gesture',
        spokenPhrase: '',
        token: '',
        priority: 'STANDARD',
        confidence: 0,
        holdDurationMs: 0,
        requiredHoldMs: this.requiredHoldMs,
        holdProgress: 0,
        status: 'IDLE',
        committedToken: null,
        committedSpokenPhrase: null,
        committedGestureId: null,
      };
    }

    // 5-frame temporal majority filter to eliminate single-frame landmark flicker
    this.recentPredictions.push({
      id: classification.gestureId,
      conf: classification.confidence,
    });
    if (this.recentPredictions.length > 5) {
      this.recentPredictions.shift();
    }

    const counts: Record<string, { count: number; totalConf: number }> = {};
    for (const item of this.recentPredictions) {
      if (!counts[item.id]) counts[item.id] = { count: 0, totalConf: 0 };
      counts[item.id].count += 1;
      counts[item.id].totalConf += item.conf;
    }

    let smoothedId: GestureId = classification.gestureId;
    let bestCount = 0;
    let smoothedConf = classification.confidence;
    for (const [id, stat] of Object.entries(counts)) {
      if (stat.count > bestCount) {
        bestCount = stat.count;
        smoothedId = id as GestureId;
        smoothedConf = stat.totalConf / stat.count;
      }
    }

    // Release latch as soon as the user changes to a different gesture
    if (this.latchedGestureId && smoothedId !== this.latchedGestureId) {
      this.latchedGestureId = null;
    }

    const meta = GESTURE_CATALOG.find((g) => g.id === smoothedId);
    const displayName = meta ? meta.name : classification.displayName;
    const spokenPhrase = meta ? meta.spokenPhrase : classification.spokenPhrase;
    const token = meta ? meta.token : classification.token;
    const priority = meta ? meta.priority : classification.priority;

    if (
      this.latchedGestureId === smoothedId ||
      (this.lastCommitTs > 0 && nowMs - this.lastCommitTs < this.cooldownMs)
    ) {
      return {
        candidateId: smoothedId,
        displayName,
        spokenPhrase,
        token,
        priority,
        confidence: smoothedConf,
        holdDurationMs: this.requiredHoldMs,
        requiredHoldMs: this.requiredHoldMs,
        holdProgress: 1.0,
        status: 'COOLDOWN',
        committedToken: null,
        committedSpokenPhrase: null,
        committedGestureId: null,
      };
    }

    if (smoothedConf < this.minConfidence) {
      this.candidateId = smoothedId;
      this.holdStartTs = null;
      return {
        candidateId: smoothedId,
        displayName,
        spokenPhrase,
        token,
        priority,
        confidence: smoothedConf,
        holdDurationMs: 0,
        requiredHoldMs: this.requiredHoldMs,
        holdProgress: 0,
        status: 'LOW_CONFIDENCE',
        committedToken: null,
        committedSpokenPhrase: null,
        committedGestureId: null,
      };
    }

    if (smoothedId !== this.candidateId || this.holdStartTs === null) {
      this.candidateId = smoothedId;
      this.holdStartTs = nowMs;
    }

    const elapsed = Math.max(0, nowMs - this.holdStartTs);
    const progress = Math.min(1.0, elapsed / this.requiredHoldMs);

    if (elapsed >= this.requiredHoldMs) {
      this.holdStartTs = null;
      this.lastCommitTs = nowMs;
      this.latchedGestureId = smoothedId;
      return {
        candidateId: smoothedId,
        displayName,
        spokenPhrase,
        token,
        priority,
        confidence: smoothedConf,
        holdDurationMs: this.requiredHoldMs,
        requiredHoldMs: this.requiredHoldMs,
        holdProgress: 1.0,
        status: 'COMMITTED',
        committedToken: token,
        committedSpokenPhrase: spokenPhrase,
        committedGestureId: smoothedId,
      };
    }

    return {
      candidateId: smoothedId,
      displayName,
      spokenPhrase,
      token,
      priority,
      confidence: smoothedConf,
      holdDurationMs: elapsed,
      requiredHoldMs: this.requiredHoldMs,
      holdProgress: progress,
      status: 'HOLDING',
      committedToken: null,
      committedSpokenPhrase: null,
      committedGestureId: null,
    };
  }
}

// ----------------------------------------------------------------------------
// 4. SYNTHETIC CANONICAL HAND GENERATOR + SMOOTH KINEMATIC POSE INTERPOLATION
// ----------------------------------------------------------------------------

export function interpolateLandmarks(
  fromPts: Point3D[],
  toPts: Point3D[],
  alpha: number
): Point3D[] {
  const t = Math.max(0, Math.min(1, alpha));
  // Cubic ease-in-out for natural biological joint motion
  const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return toPts.map((target, idx) => {
    const start = fromPts[idx] || target;
    return {
      x: start.x + (target.x - start.x) * ease,
      y: start.y + (target.y - start.y) * ease,
      z: start.z + (target.z - start.z) * ease,
    };
  });
}

export function generateCanonicalLandmarks(
  gestureId: GestureId,
  jitterAmount = 0.002,
  timePhase = 0
): Point3D[] {
  const pts: Point3D[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.72, z: 0.0 }));
  const setPt = (id: number, x: number, y: number, z = 0.0) => {
    // Organic subtle hand sway + micro-tremor
    const swayX = jitterAmount > 0 ? Math.sin(timePhase * 0.002) * 0.008 : 0;
    const swayY = jitterAmount > 0 ? Math.cos(timePhase * 0.0016) * 0.006 : 0;
    const jx = Math.sin(timePhase * 0.007 + id * 1.7) * jitterAmount + swayX;
    const jy = Math.cos(timePhase * 0.008 + id * 2.3) * jitterAmount + swayY;
    pts[id] = {
      x: 0.5 + x * 0.19 + jx,
      y: 0.74 + y * 0.19 + jy,
      z,
    };
  };

  setPt(WRIST, 0.0, 0.0, 0.0);
  setPt(THUMB_CMC, -0.32, -0.22, -0.05);
  setPt(THUMB_MCP, -0.52, -0.48, -0.08);
  setPt(INDEX_MCP, -0.35, -0.95, 0.0);
  setPt(MIDDLE_MCP, 0.0, -1.0, 0.0);
  setPt(RING_MCP, 0.32, -0.94, 0.0);
  setPt(PINKY_MCP, 0.60, -0.85, 0.0);

  const baseCoords: Record<number, [number, number, number]> = {
    [INDEX_MCP]: [-0.35, -0.95, 0.0],
    [MIDDLE_MCP]: [0.0, -1.0, 0.0],
    [RING_MCP]: [0.32, -0.94, 0.0],
    [PINKY_MCP]: [0.60, -0.85, 0.0],
  };

  const straight = (mcp: number, dx = 0.0, len = 0.96) => {
    const b = baseCoords[mcp];
    setPt(mcp + 1, b[0] + dx * 0.33, b[1] - len * 0.42, 0.0);
    setPt(mcp + 2, b[0] + dx * 0.66, b[1] - len * 0.74, 0.0);
    setPt(mcp + 3, b[0] + dx * 1.0, b[1] - len * 1.0, 0.0);
  };

  const curled = (mcp: number, tight = true) => {
    const b = baseCoords[mcp];
    if (tight) {
      setPt(mcp + 1, b[0], b[1] - 0.22, -0.15);
      setPt(mcp + 2, b[0], b[1] + 0.05, -0.22);
      setPt(mcp + 3, b[0], b[1] + 0.22, -0.12);
    } else {
      setPt(mcp + 1, b[0], b[1] - 0.36, -0.12);
      setPt(mcp + 2, b[0] - 0.05, b[1] - 0.56, -0.22);
      setPt(mcp + 3, b[0] - 0.12, b[1] - 0.48, -0.25);
    }
  };

  switch (gestureId) {
    case 'EMERGENCY':
      straight(INDEX_MCP, -0.12, 0.96);
      curled(MIDDLE_MCP, true);
      curled(RING_MCP, true);
      straight(PINKY_MCP, 0.32, 0.88);
      setPt(THUMB_IP, -0.82, -0.54, -0.05);
      setPt(THUMB_TIP, -1.15, -0.58, -0.05);
      break;
    case 'HELP':
      [INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP].forEach((m) => curled(m, true));
      setPt(THUMB_IP, -0.58, -0.74, -0.06);
      setPt(THUMB_TIP, -0.48, -0.98, -0.06);
      break;
    case 'DOCTOR':
      straight(INDEX_MCP, 0.0, 0.98);
      [MIDDLE_MCP, RING_MCP, PINKY_MCP].forEach((m) => curled(m, true));
      setPt(THUMB_IP, -0.25, -0.72, -0.12);
      setPt(THUMB_TIP, -0.02, -0.78, -0.14);
      break;
    case 'HOSPITAL':
      straight(INDEX_MCP, 0.10, 0.96);
      straight(MIDDLE_MCP, -0.04, 0.98);
      [RING_MCP, PINKY_MCP].forEach((m) => curled(m, true));
      setPt(THUMB_IP, -0.20, -0.68, -0.15);
      setPt(THUMB_TIP, 0.04, -0.76, -0.18);
      break;
    case 'PAIN':
      straight(INDEX_MCP, 0.0, 0.98);
      [MIDDLE_MCP, RING_MCP, PINKY_MCP].forEach((m) => curled(m, true));
      setPt(THUMB_IP, -0.82, -0.52, -0.05);
      setPt(THUMB_TIP, -1.18, -0.50, -0.05);
      break;
    case 'MEDICINE':
      [INDEX_MCP, MIDDLE_MCP, RING_MCP].forEach((m) => curled(m, true));
      straight(PINKY_MCP, 0.12, 0.92);
      setPt(THUMB_IP, -0.22, -0.68, -0.14);
      setPt(THUMB_TIP, 0.02, -0.75, -0.16);
      break;
    case 'CALL_FAMILY':
      straight(INDEX_MCP, -0.10, 0.96);
      curled(MIDDLE_MCP, true);
      curled(RING_MCP, true);
      straight(PINKY_MCP, 0.24, 0.90);
      setPt(THUMB_IP, -0.22, -0.68, -0.14);
      setPt(THUMB_TIP, 0.05, -0.74, -0.16);
      break;
    case 'WATER':
      straight(INDEX_MCP, -0.15, 0.96);
      straight(MIDDLE_MCP, 0.02, 1.0);
      straight(RING_MCP, 0.20, 0.95);
      curled(PINKY_MCP, true);
      setPt(THUMB_IP, -0.22, -0.68, -0.14);
      setPt(THUMB_TIP, 0.05, -0.75, -0.16);
      break;
    case 'FOOD':
      [INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP].forEach((m) => curled(m, false));
      setPt(THUMB_IP, -0.72, -0.78, -0.12);
      setPt(THUMB_TIP, -0.62, -1.05, -0.16);
      break;
    case 'BATHROOM':
      straight(INDEX_MCP, -0.26, 0.96);
      straight(MIDDLE_MCP, 0.25, 1.0);
      [RING_MCP, PINKY_MCP].forEach((m) => curled(m, true));
      setPt(THUMB_IP, -0.20, -0.68, -0.15);
      setPt(THUMB_TIP, 0.02, -0.78, -0.18);
      break;
    case 'MORE':
      curled(INDEX_MCP, true);
      straight(MIDDLE_MCP, 0.02, 1.0);
      straight(RING_MCP, 0.16, 0.96);
      straight(PINKY_MCP, 0.28, 0.88);
      setPt(THUMB_IP, -0.45, -0.72, -0.12);
      setPt(THUMB_TIP, -0.34, -0.76, -0.12);
      break;
    case 'TIRED':
      curled(INDEX_MCP, true);
      straight(MIDDLE_MCP, 0.0, 1.0);
      curled(RING_MCP, true);
      curled(PINKY_MCP, true);
      setPt(THUMB_IP, -0.22, -0.68, -0.14);
      setPt(THUMB_TIP, 0.02, -0.75, -0.16);
      break;
    case 'COLD':
      straight(INDEX_MCP, -0.26, 0.96);
      straight(MIDDLE_MCP, 0.25, 1.0);
      [RING_MCP, PINKY_MCP].forEach((m) => curled(m, true));
      setPt(THUMB_IP, -0.82, -0.54, -0.05);
      setPt(THUMB_TIP, -1.15, -0.58, -0.05);
      break;
    case 'HELLO':
      straight(INDEX_MCP, -0.26, 0.96);
      straight(MIDDLE_MCP, -0.04, 1.02);
      straight(RING_MCP, 0.18, 0.95);
      straight(PINKY_MCP, 0.38, 0.86);
      setPt(THUMB_IP, -0.82, -0.58, -0.05);
      setPt(THUMB_TIP, -1.14, -0.72, -0.05);
      break;
    case 'THANK_YOU':
      straight(INDEX_MCP, 0.06, 0.95);
      straight(MIDDLE_MCP, 0.02, 1.02);
      straight(RING_MCP, -0.02, 0.95);
      straight(PINKY_MCP, -0.06, 0.84);
      setPt(THUMB_IP, -0.18, -0.66, -0.15);
      setPt(THUMB_TIP, 0.10, -0.72, -0.18);
      break;
    case 'PLEASE':
      [INDEX_MCP, MIDDLE_MCP, RING_MCP].forEach((m) => curled(m, true));
      straight(PINKY_MCP, 0.36, 0.90);
      setPt(THUMB_IP, -0.82, -0.54, -0.05);
      setPt(THUMB_TIP, -1.16, -0.58, -0.05);
      break;
    case 'SORRY':
      [INDEX_MCP, MIDDLE_MCP].forEach((m) => curled(m, true));
      straight(RING_MCP, 0.12, 0.95);
      straight(PINKY_MCP, 0.28, 0.88);
      setPt(THUMB_IP, -0.22, -0.68, -0.14);
      setPt(THUMB_TIP, 0.02, -0.75, -0.16);
      break;
    case 'YES':
      [INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP].forEach((m) => curled(m, true));
      setPt(THUMB_IP, -0.62, -1.05, -0.05);
      setPt(THUMB_TIP, -0.65, -1.48, -0.05);
      break;
    case 'NO':
      straight(INDEX_MCP, 0.08, 0.92);
      straight(MIDDLE_MCP, -0.05, 0.95);
      [RING_MCP, PINKY_MCP].forEach((m) => curled(m, true));
      setPt(THUMB_IP, -0.65, -0.75, -0.08);
      setPt(THUMB_TIP, -0.88, -0.92, -0.08);
      break;
    case 'STOP':
    default:
      [INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP].forEach((m) => curled(m, true));
      setPt(THUMB_IP, -0.22, -0.62, -0.15);
      setPt(THUMB_TIP, 0.05, -0.68, -0.18);
      break;
  }

  return pts;
}
