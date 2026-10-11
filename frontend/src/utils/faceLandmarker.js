const MEDIAPIPE_VERSION = "1.1.0";
const VISION_MODULE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/vision_bundle.mjs`;
const VISION_WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;

export async function createFaceLandmarker() {
  // The camera frames stay in the browser. Only aggregated metrics are sent to the backend.
  const vision = await import(/* @vite-ignore */ VISION_MODULE_URL);
  const files = await vision.FilesetResolver.forVisionTasks(VISION_WASM_URL);
  return vision.FaceLandmarker.createFromOptions(files, {
    baseOptions: {
      modelAssetPath: `${import.meta.env.BASE_URL}models/face_landmarker.task`,
    },
    runningMode: "VIDEO",
    numFaces: 2,
    minFaceDetectionConfidence: 0.55,
    minFacePresenceConfidence: 0.55,
    minTrackingConfidence: 0.55,
    outputFaceBlendshapes: false,
  });
}

const averageX = (landmarks, indices) => {
  const points = indices.map((index) => landmarks[index]).filter(Boolean);
  if (!points.length) return null;
  return points.reduce((sum, point) => sum + point.x, 0) / points.length;
};

const eyeRatio = (landmarks, corners, irisIndices) => {
  const cornerPoints = corners.map((index) => landmarks[index]).filter(Boolean);
  const irisX = averageX(landmarks, irisIndices);
  if (cornerPoints.length !== 2 || irisX === null) return null;
  const minX = Math.min(cornerPoints[0].x, cornerPoints[1].x);
  const maxX = Math.max(cornerPoints[0].x, cornerPoints[1].x);
  const width = maxX - minX;
  if (width < 0.0001) return null;
  return (irisX - minX) / width;
};

// This is an approximate iris-position signal, not a medical-grade gaze tracker.
export function estimateGaze(landmarks) {
  if (!landmarks || landmarks.length === 0) return "NO_FACE";
  const leftRatio = eyeRatio(landmarks, [33, 133], [468, 469, 470, 471, 472]);
  const rightRatio = eyeRatio(landmarks, [362, 263], [473, 474, 475, 476, 477]);
  const ratios = [leftRatio, rightRatio].filter((value) => value !== null);
  if (!ratios.length) return "UNKNOWN";
  const ratio = ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
  if (ratio < 0.38) return "LOOKING_LEFT";
  if (ratio > 0.62) return "LOOKING_RIGHT";
  return "NORMAL";
}
