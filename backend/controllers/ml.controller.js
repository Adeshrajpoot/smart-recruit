import {
  mlHealth,
  predictFaceActivity
} from "../services/mlService.js";

export const getMlHealth = async (req, res) => {
  try {
    const data = await mlHealth();
    res.json({ success: true, ml: data });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message
    });
  }
};

// Body uses the frontend's camelCase names; the ML API expects snake_case.
export const predictActivity = async (req, res) => {
  try {
    const b = req.body || {};

    const metrics = {
      face_presence_percent: Number(b.facePresencePct ?? b.face_presence_percent ?? 100),
      maximum_faces_detected: Number(b.maxFacesDetected ?? b.maximum_faces_detected ?? 1),
      longest_face_absence_sec: Number(b.longestFaceAbsenceSecs ?? b.longest_face_absence_sec ?? 0),
      multiple_face_duration_sec: Number(b.multipleFaceDurationSecs ?? b.multiple_face_duration_sec ?? 0),
      looking_away_events: Number(b.lookingAwayEvents ?? b.looking_away_events ?? 0),
      looking_center_percent: Number(b.gazeDistribution?.center ?? b.looking_center_percent ?? 100),
      looking_left_percent: Number(b.gazeDistribution?.left ?? b.looking_left_percent ?? 0),
      looking_right_percent: Number(b.gazeDistribution?.right ?? b.looking_right_percent ?? 0)
    };

    const prediction = await predictFaceActivity(metrics);

    res.json({
      success: true,
      predictedActivity: prediction.predictedActivity,
      confidence: prediction.confidence,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Face activity prediction failed"
    });
  }
};
