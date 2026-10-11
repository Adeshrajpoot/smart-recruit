import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { createFaceLandmarker, estimateGaze } from "../../utils/faceLandmarker";

function CandidateActiveAssessment() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const handleFinalSubmitRef = useRef(() => {});
  const submissionLockRef = useRef(false);
  const interviewSessionIdRef = useRef("");
  if (!interviewSessionIdRef.current) {
    interviewSessionIdRef.current = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `sr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  const [candidateName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?.name || "";
    } catch {
      return "";
    }
  });
  const [candidateEmail] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?.email || "";
    } catch {
      return "";
    }
  });
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [visionStatus, setVisionStatus] = useState("waiting");
  const [mlStatus, setMlStatus] = useState("waiting");
  const cameraStreamRef = useRef(null);
  const trackingRef = useRef({
    samples: 0,
    faceSamples: 0,
    maxFacesDetected: 0,
    absenceStartedAt: null,
    longestFaceAbsenceSecs: 0,
    multipleFaceDurationSecs: 0,
    lastFrameAt: null,
    lastUiUpdateAt: 0,
    lastMlRequestAt: 0,
    gazeCounts: { center: 0, left: 0, right: 0 },
    lookingAwayStartedAt: null,
    lookingAwayEventCounted: false,
    lookingAwayEvents: 0,
  });
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const [timer, setTimer] = useState(1800);

  const [proctoringState, setProctoringState] = useState({
    predictedActivity: "WAITING FOR CAMERA",
    modelConfidence: 0,
    visualActivityFlag: "NO",
    flagReason: "No activity classification has been returned yet.",
    facePresencePct: 0,
    gazeDistribution: { center: 0, left: 0, right: 0 },
    maxFacesDetected: 0,
    longestFaceAbsenceSecs: 0,
    multipleFaceDurationSecs: 0,
    lookingAwayEventsCount: 0
  });

  const [assessmentData, setAssessmentData] = useState({
    assessmentTitle: "Personalized AI Technical Interview",
    questions: []
  });
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const currentQ = assessmentData.questions[currentQuestionIndex];
  const totalQCount = assessmentData.questions.length;

  useEffect(() => {
    let active = true;
    let waitTimer;

    const loadGeneratedQuestions = async () => {
      setQuestionsLoading(true);
      setQuestionsError("");
      const deadline = Date.now() + 5 * 60 * 1000;

      try {
        while (active && Date.now() < deadline) {
          const result = await api("/api/profile/interview");

          if (result.status === "ready") {
            const generated = result.interview?.questions;
            if (!Array.isArray(generated) || generated.length === 0) {
              throw new Error("ML completed, but no generated questions were returned.");
            }

            const mappedQuestions = generated.map((item, index) => ({
              id: index + 1,
              type: "Multiple Choice",
              points: String(item.difficulty || "").toLowerCase() === "hard" ? 20
                : String(item.difficulty || "").toLowerCase() === "medium" ? 15 : 10,
              topic: item.topic || "",
              difficulty: item.difficulty || "",
              mlCalibratedTag: [item.topic, item.difficulty].filter(Boolean).join(" · ") || "Personalized technical question",
              prompt: item.question || "",
              instruction: "Select the most accurate option below.",
              options: Object.entries(item.options || {}).map(([id, title]) => ({
                id,
                title: String(title),
                desc: ""
              })),
              status: "unattempted",
              savedAnswer: null
            })).filter((question) => question.prompt && question.options.length > 0);

            if (!mappedQuestions.length) {
              throw new Error("The generated questions did not have the expected question/options format.");
            }

            if (active) {
              setAssessmentData({
                assessmentTitle: "Personalized AI Technical Interview",
                questions: mappedQuestions
              });
              setCurrentQuestionIndex(0);
              setSelectedOption(null);
              setQuestionsLoading(false);
            }
            return;
          }

          if (result.status === "failed") {
            throw new Error(result.error || "ML question generation failed. Return to your profile and try again.");
          }

          if (result.status === "none") {
            throw new Error("No generated interview was found. Upload your resume and GitHub profile first, then wait for analysis to finish.");
          }

          await new Promise((resolve) => {
            waitTimer = setTimeout(resolve, 3000);
          });
        }

        if (active) {
          setQuestionsError("Your personalized questions are still being generated. Please return to the assessment overview and try again shortly.");
          setQuestionsLoading(false);
        }
      } catch (error) {
        if (active) {
          setQuestionsError(error.message || "Could not load your personalized interview questions.");
          setQuestionsLoading(false);
        }
      }
    };

    loadGeneratedQuestions();
    return () => {
      active = false;
      if (waitTimer) clearTimeout(waitTimer);
    };
  }, []);

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(candidateName);

  // Ask for camera permission only after the question view (and its video element) is rendered.
  useEffect(() => {
    if (questionsLoading || questionsError) return undefined;

    let cancelled = false;
    let stream;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not support camera access.");
        }
        const selectedCameraId = sessionStorage.getItem("smart_recruit_camera_id");
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: selectedCameraId
              ? { deviceId: { exact: selectedCameraId } }
              : { facingMode: "user" },
            audio: false,
          });
        } catch (error) {
          // A device can disappear after system check; retry with the default camera.
          if (!selectedCameraId) throw error;
          sessionStorage.removeItem("smart_recruit_camera_id");
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
        }
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        cameraStreamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        setCameraError("");
        setCameraActive(true);
      } catch (error) {
        console.error("Webcam access error:", error);
        setCameraError(error.message || "Camera access denied or unavailable.");
        setCameraActive(false);
        setVisionStatus("error");
      }
    };

    startCamera();
    return () => {
      cancelled = true;
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [questionsLoading, questionsError]);

  // Real camera frames are processed with MediaPipe in the browser. Only aggregated metrics
  // are sent to the Python XGBoost classifier; the camera frames themselves are not uploaded.
  useEffect(() => {
    if (!cameraActive) return undefined;

    let cancelled = false;
    let animationFrameId = 0;
    let predictionInFlight = false;
    let landmarker;
    let lastDetectionTimestamp = 0;
    const percent = (count, total) => total > 0 ? Math.round((count / total) * 100) : 0;
    const currentMetrics = () => {
      const metrics = trackingRef.current;
      const gazeTotal = metrics.gazeCounts.center + metrics.gazeCounts.left + metrics.gazeCounts.right;
      return {
        facePresencePct: percent(metrics.faceSamples, metrics.samples),
        maxFacesDetected: metrics.maxFacesDetected,
        longestFaceAbsenceSecs: Math.round(metrics.longestFaceAbsenceSecs * 100) / 100,
        multipleFaceDurationSecs: Math.round(metrics.multipleFaceDurationSecs * 100) / 100,
        lookingAwayEvents: metrics.lookingAwayEvents,
        gazeDistribution: {
          center: percent(metrics.gazeCounts.center, gazeTotal),
          left: percent(metrics.gazeCounts.left, gazeTotal),
          right: percent(metrics.gazeCounts.right, gazeTotal),
        },
      };
    };

    const handlePrediction = (prediction, observedMetrics) => {
      const activity = String(prediction.predictedActivity || "UNKNOWN").toUpperCase();
      // A left/right glance alone is not automatically treated as misconduct.
      // Flag only broader conditions that warrant review, not ordinary gaze direction.
      const flag = ["LOOKING_AWAY", "MULTIPLE_FACES", "NO_FACE"].includes(activity);
      let reason = "The classifier did not detect a sustained off-center activity pattern.";
      if (activity === "LOOKING_AWAY") reason = "The classifier detected a sustained off-center gaze pattern.";
      else if (activity === "LOOKING_LEFT" || activity === "LOOKING_RIGHT") reason = `The classifier detected a ${activity.replace("LOOKING_", "").toLowerCase()} gaze pattern.`;
      else if (activity === "MULTIPLE_FACES") reason = "More than one face was detected in the observed session metrics.";
      else if (activity === "NO_FACE") reason = "No face was detected in the observed session metrics.";

      setProctoringState((previous) => ({
        ...previous,
        ...observedMetrics,
        lookingAwayEventsCount: observedMetrics.lookingAwayEvents,
        predictedActivity: activity,
        modelConfidence: Math.max(0, Math.min(1, Number(prediction.confidence) || 0)),
        visualActivityFlag: flag ? "YES" : "NO",
        flagReason: reason,
      }));
      setMlStatus("ready");
      setCameraError("");
    };

    const run = async () => {
      try {
        landmarker = await createFaceLandmarker();
        if (cancelled) {
          landmarker.close();
          return;
        }
        setVisionStatus("ready");
        setCameraError("");

        const processFrame = (timestamp) => {
          if (cancelled) return;
          const video = videoRef.current;
          const metrics = trackingRef.current;
          if (!video || video.readyState < 2 || timestamp - lastDetectionTimestamp < 200) {
            animationFrameId = requestAnimationFrame(processFrame);
            return;
          }
          lastDetectionTimestamp = timestamp;

          const now = Date.now();
          const deltaSeconds = metrics.lastFrameAt
            ? Math.max(0, Math.min((now - metrics.lastFrameAt) / 1000, 1))
            : 0;
          metrics.lastFrameAt = now;

          try {
            const detection = landmarker.detectForVideo(video, timestamp);
            const faces = detection.faceLandmarks || [];
            const faceCount = faces.length;
            metrics.samples += 1;
            metrics.maxFacesDetected = Math.max(metrics.maxFacesDetected, faceCount);

            if (faceCount > 0) {
              metrics.faceSamples += 1;
              if (metrics.absenceStartedAt !== null) {
                metrics.longestFaceAbsenceSecs = Math.max(
                  metrics.longestFaceAbsenceSecs,
                  (now - metrics.absenceStartedAt) / 1000
                );
                metrics.absenceStartedAt = null;
              }
            } else {
              if (metrics.absenceStartedAt === null) metrics.absenceStartedAt = now;
              metrics.longestFaceAbsenceSecs = Math.max(
                metrics.longestFaceAbsenceSecs,
                (now - metrics.absenceStartedAt) / 1000
              );
            }

            if (faceCount > 1) metrics.multipleFaceDurationSecs += deltaSeconds;

            const gaze = faceCount > 0 ? estimateGaze(faces[0]) : "NO_FACE";
            if (gaze === "NORMAL") {
              metrics.gazeCounts.center += 1;
              metrics.lookingAwayStartedAt = null;
              metrics.lookingAwayEventCounted = false;
            } else if (gaze === "LOOKING_LEFT") {
              metrics.gazeCounts.left += 1;
            } else if (gaze === "LOOKING_RIGHT") {
              metrics.gazeCounts.right += 1;
            }

            if (gaze === "LOOKING_LEFT" || gaze === "LOOKING_RIGHT") {
              if (metrics.lookingAwayStartedAt === null) metrics.lookingAwayStartedAt = now;
              if (now - metrics.lookingAwayStartedAt >= 1500 && !metrics.lookingAwayEventCounted) {
                metrics.lookingAwayEvents += 1;
                metrics.lookingAwayEventCounted = true;
              }
            } else if (gaze === "NORMAL" || gaze === "NO_FACE") {
              metrics.lookingAwayStartedAt = null;
              metrics.lookingAwayEventCounted = false;
            }

            const observedMetrics = currentMetrics();
            if (timestamp - metrics.lastUiUpdateAt >= 900) {
              metrics.lastUiUpdateAt = timestamp;
              setProctoringState((previous) => ({
                ...previous,
                ...observedMetrics,
                lookingAwayEventsCount: observedMetrics.lookingAwayEvents,
              }));
            }

            if (metrics.samples >= 10 && timestamp - metrics.lastMlRequestAt >= 5000 && !predictionInFlight) {
              metrics.lastMlRequestAt = timestamp;
              predictionInFlight = true;
              api("/api/ml/predict-face-activity", {
                method: "POST",
                body: JSON.stringify(observedMetrics),
              })
                .then((prediction) => {
                  if (!cancelled) handlePrediction(prediction, observedMetrics);
                })
                .catch((error) => {
                  if (!cancelled) {
                    setMlStatus("error");
                    setCameraError(`Live XGBoost prediction is unavailable: ${error.message}`);
                  }
                })
                .finally(() => { predictionInFlight = false; });
            }
          } catch (error) {
            console.error("MediaPipe frame processing failed:", error);
            setVisionStatus("error");
            setCameraError(`Live face tracking stopped: ${error.message || "camera frame processing failed"}`);
            return;
          }

          animationFrameId = requestAnimationFrame(processFrame);
        };

        animationFrameId = requestAnimationFrame(processFrame);
      } catch (error) {
        console.error("MediaPipe initialization failed:", error);
        if (!cancelled) {
          setVisionStatus("error");
          setCameraError(`Eye/face tracking could not initialize: ${error.message || "MediaPipe is unavailable"}`);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (landmarker) landmarker.close();
    };
  }, [cameraActive]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const updatedCount = prev + 1;
          
          if (updatedCount === 1 || updatedCount === 2) {
            setWarningMessage(`Warning ${updatedCount}/2: Leaving the assessment tab or minimizing the window is prohibited. Your activity has been flagged. One more violation will result in automatic submission.`);
            setWarningModalOpen(true);
            
            setProctoringState(p => ({
              ...p,
              visualActivityFlag: "YES",
              flagReason: `Tab switch detected (${updatedCount}/2).`,
              lookingAwayEventsCount: p.lookingAwayEventsCount + 1
            }));
          } else if (updatedCount >= 3) {
            setWarningMessage("Maximum tab switch limit (3) exceeded. Submitting assessment automatically.");
            setWarningModalOpen(true);
            
            setTimeout(() => {
              handleFinalSubmitRef.current();
            }, 2500);
          }
          
          return updatedCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSubmittedModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAnswer = () => {
    if (!selectedOption) return;
    const updatedQuestions = [...assessmentData.questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQ,
      status: "saved",
      savedAnswer: selectedOption
    };
    setAssessmentData({ ...assessmentData, questions: updatedQuestions });

    if (currentQuestionIndex < totalQCount - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(updatedQuestions[nextIndex].savedAnswer);
    }
  };

  const handleSkipQuestion = () => {
    const updatedQuestions = [...assessmentData.questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQ,
      status: "skipped",
      savedAnswer: selectedOption
    };
    setAssessmentData({ ...assessmentData, questions: updatedQuestions });

    if (currentQuestionIndex < totalQCount - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(updatedQuestions[nextIndex].savedAnswer);
    }
  };

  const handleNavigation = (direction) => {
    let newIndex = currentQuestionIndex;
    if (direction === "next" && currentQuestionIndex < totalQCount - 1) {
      newIndex = currentQuestionIndex + 1;
    } else if (direction === "prev" && currentQuestionIndex > 0) {
      newIndex = currentQuestionIndex - 1;
    }
    setCurrentQuestionIndex(newIndex);
    setSelectedOption(assessmentData.questions[newIndex].savedAnswer);
  };
  const handleFinalSubmit = async () => {
    if (submissionLockRef.current || isSubmitting) return;
    submissionLockRef.current = true;
    setIsSubmitting(true);
    setSubmissionError("");
    setSubmittedModalOpen(false);

    const finalQuestions = assessmentData.questions.map((question, index) => {
      if (index === currentQuestionIndex && selectedOption != null) {
        return { ...question, status: "saved", savedAnswer: selectedOption };
      }
      return question;
    });
    const savedResponsesCount = finalQuestions.filter(
      (question) => question.status === "saved" && question.savedAnswer != null
    ).length;
    const analytics = {
      facePresencePct: proctoringState.facePresencePct,
      gazeDistribution: proctoringState.gazeDistribution,
      maxFacesDetected: proctoringState.maxFacesDetected,
      longestFaceAbsenceSecs: proctoringState.longestFaceAbsenceSecs,
      multipleFaceDurationSecs: proctoringState.multipleFaceDurationSecs,
      lookingAwayEvents: proctoringState.lookingAwayEventsCount,
      tabSwitchesCount: tabSwitchCount,
      finalActivityStatus: proctoringState.predictedActivity,
      finalVisualFlag: proctoringState.visualActivityFlag,
      flagReason: proctoringState.flagReason
    };

    try {
      const saved = await api("/api/profile/interview/submit", {
        method: "POST",
        body: JSON.stringify({
          sessionId: interviewSessionIdRef.current,
          assessmentTitle: assessmentData.assessmentTitle,
          questions: finalQuestions.map((question) => ({
            id: question.id,
            prompt: question.prompt,
            topic: question.topic || question.mlCalibratedTag || "",
            difficulty: question.difficulty || "",
            options: question.options,
            status: question.status,
            savedAnswer: question.savedAnswer,
            points: question.points
          })),
          proctoringAnalytics: analytics
        })
      });

      const now = new Date();
      const liveTimestamp = `${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} IST`;
      const localUser = JSON.parse(localStorage.getItem("user") || "null") || {};
      const sessionSummary = {
        sessionId: interviewSessionIdRef.current,
        submissionId: saved.resultId,
        assessmentTitle: assessmentData.assessmentTitle,
        candidateName: candidateName || localUser.name || "",
        candidateEmail: candidateEmail || localUser.email || "",
        candidateId: localUser.id || localUser.candidateId || "",
        savedResponsesCount: saved.savedResponsesCount ?? savedResponsesCount,
        receiptRef: saved.receiptRef,
        submissionTime: liveTimestamp,
        savedToBackend: true,
        proctoringAnalytics: analytics
      };

      localStorage.setItem("assessmentSubmission", JSON.stringify(sessionSummary));
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      navigate("/candidate/assessment-complete");
    } catch (error) {
      console.error("Interview submission failed:", error);
      submissionLockRef.current = false;
      setIsSubmitting(false);
      setSubmissionError(error.message || "Your interview could not be saved. Check your connection and retry.");
    }
  };

  useEffect(() => {
    handleFinalSubmitRef.current = handleFinalSubmit;
  });

  const savedCount = assessmentData.questions.filter(q => q.status === "saved").length;
  const skippedCount = assessmentData.questions.filter(q => q.status === "skipped").length;
  const unattemptedCount = assessmentData.questions.filter(q => q.status === "unattempted").length;
  const progressPercentage = totalQCount
    ? Math.round((savedCount / totalQCount) * 100)
    : 0;
if (questionsLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg text-center space-y-3">
          <div className="text-xl font-bold text-[#0F172A]">Preparing your personalized interview</div>
          <p className="text-sm text-slate-500">SmartRecruit is loading the questions generated from your resume and GitHub profile. This may take a little while.</p>
        </div>
      </div>
    );
  }

  if (questionsError || !currentQ) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg text-center space-y-4">
          <div className="text-xl font-bold text-[#0F172A]">Personalized questions unavailable</div>
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">{questionsError || "No questions were returned by the ML service."}</p>
          <button
            onClick={() => navigate("/candidate/profile")}
            className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer border-none"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans select-none">
      {submissionError && (
        <div role="alert" className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not save assessment: {submissionError}. Your responses are still on this page; please retry submission.
          <button className="ml-3 underline font-bold" onClick={() => setSubmissionError("")}>Dismiss</button>
        </div>
      )}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto shadow-sm">
              ⚠️
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0F172A]">Proctoring Security Warning</h3>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                {warningMessage}
              </p>
            </div>
            <button
              onClick={() => setWarningModalOpen(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer border-none"
            >
              I Understand & Return to Assessment
            </button>
          </div>
        </div>
      )}
      {submittedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-blue-100 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0F172A]">Ready to submit your assessment?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your answers and available face-activity monitoring data will be saved to SmartRecruit after you confirm.
              </p>
            </div>
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer border-none"
            >
              {isSubmitting ? "Saving to backend…" : "Confirm submission →"}
            </button>
          </div>
        </div>
      )}
      <header className="bg-white border-b border-blue-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#2563EB] rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20">
            S
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-[#0F172A] block">SmartRecruit</span>
            <span className="text-[10px] text-[#2563EB] font-semibold uppercase tracking-wider">{assessmentData.assessmentTitle}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[#EFF6FF] border border-blue-100 px-3.5 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
            <span className="text-xs font-mono text-[#2563EB] font-bold">{formatTime(timer)}</span>
          </div>

          <div className="flex items-center space-x-2.5 bg-[#EFF6FF] border border-blue-100 pl-2 pr-3 py-1 rounded-xl">
            <div className="w-7 h-7 bg-[#2563EB] text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
              {initials}
            </div>
            <span className="text-xs font-semibold text-[#0F172A]">{candidateName}</span>
          </div>
        </div>
      </header>
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 my-6 flex flex-col lg:flex-row gap-6 flex-grow">
        <aside className="w-full lg:w-80 bg-white border border-blue-100 rounded-2xl p-5 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">Proctoring Feed</span>
                <span className={`flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full border ${visionStatus === "ready" && mlStatus === "ready" ? "text-[#2563EB] bg-blue-50 border-blue-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${visionStatus === "ready" && mlStatus === "ready" ? "bg-[#2563EB] animate-pulse" : "bg-amber-500"}`}></span>
                  <span>{visionStatus === "error" ? "Vision unavailable" : visionStatus !== "ready" ? "Loading face tracking" : mlStatus === "ready" ? "Live vision + XGBoost" : mlStatus === "error" ? "XGBoost unavailable" : "Collecting camera metrics"}</span>
                </span>
              </div>
              <div className="relative w-full h-36 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center p-2 text-center bg-slate-950/90">
                    <p className="text-[10px] text-amber-400">{cameraError || "Camera starting..."}</p>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center justify-between border border-white/10">
                  <span className="text-[9px] font-mono font-bold text-blue-400">{proctoringState.predictedActivity}</span>
                  <span className="text-[9px] font-mono text-slate-300">{(proctoringState.modelConfidence * 100).toFixed(0)}% score</span>
                </div>
              </div>
              {cameraError && <p role="status" className="mt-2 text-[10px] leading-relaxed text-amber-600">{cameraError}</p>}
              {visionStatus === "ready" && <p className="mt-1 text-[10px] leading-relaxed text-slate-400">Face landmarks are processed locally in this browser; only summary metrics are sent to the classifier. Gaze direction is approximate.</p>}
            </div>
            <div className="space-y-3 bg-[#EFF6FF] border border-blue-100 rounded-xl p-3.5">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">Activity Telemetry</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                  proctoringState.visualActivityFlag === 'YES' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-[#2563EB] border border-blue-200'
                }`}>
                  Flag: {proctoringState.visualActivityFlag}
                </span>
              </div>

              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between text-slate-600">
                  <span>Face Presence:</span>
                  <span className="font-mono font-semibold text-slate-900">{proctoringState.facePresencePct}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tab Switches:</span>
                  <span className={`font-mono font-bold ${tabSwitchCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{tabSwitchCount} / 3</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Max Faces Detected:</span>
                  <span className="font-mono font-semibold text-slate-900">{proctoringState.maxFacesDetected}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Looking Away Events:</span>
                  <span className="font-mono font-semibold text-slate-900">{proctoringState.lookingAwayEventsCount}</span>
                </div>
              </div>

              {proctoringState.visualActivityFlag === 'YES' && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-[9px] text-amber-800 leading-relaxed"><strong className="font-bold">Reason:</strong> {proctoringState.flagReason}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Completion</span>
                <span className="text-[#2563EB]">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-[#2563EB] h-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                <span>Saved: {savedCount}</span>
                <span>Skipped: {skippedCount}</span>
                <span>Unattempted: {unattemptedCount}</span>
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#2563EB] block">Question Palette</span>
              <div className="grid grid-cols-4 gap-2">
                {assessmentData.questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  let bgClass = "bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50";
                  if (q.status === "saved") bgClass = "bg-blue-50 text-[#2563EB] border-blue-200";
                  if (q.status === "skipped") bgClass = "bg-amber-50 text-amber-700 border-amber-200";
                  if (isCurrent) bgClass += " ring-2 ring-[#2563EB]";

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setSelectedOption(q.savedAnswer);
                      }}
                      className={`h-10 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all cursor-pointer ${bgClass}`}
                    >
                      <span>{q.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer border-none"
          >
            {isSubmitting ? "Saving to backend…" : "Submit Assessment"}
          </button>
        </aside>
        <main className="flex-grow bg-white border border-blue-100 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8 shadow-sm">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-blue-100 pb-4">
              <span className="text-xs font-mono text-[#2563EB] uppercase tracking-wide">{currentQ.type}</span>
              <span className="text-xs font-mono text-slate-500">Question {currentQuestionIndex + 1} of {totalQCount} · {currentQ.points} Points</span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] text-[#2563EB] font-medium block">{currentQ.mlCalibratedTag}</span>
              <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] leading-snug">
                {currentQ.prompt}
              </h1>
              <p className="text-xs text-slate-500">{currentQ.instruction}</p>
            </div>
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                      isSelected 
                        ? 'bg-blue-50 border-[#2563EB] text-slate-900 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'border-slate-300 text-slate-500 bg-slate-50'
                    }`}>
                      {opt.id}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#0F172A]">{opt.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handleSkipQuestion}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Skip Question →
              </button>

              <button
                onClick={handleSaveAnswer}
                className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
              >
                Save Answer & Next
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-blue-100 flex items-center justify-between">
            <button
              onClick={() => handleNavigation("prev")}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 transition-all ${
                currentQuestionIndex === 0 ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              ← Previous Question
            </button>
            <button
              onClick={() => {
                if (currentQuestionIndex === totalQCount - 1) {
                  handleFinalSubmit();
                } else {
                  handleNavigation("next");
                }
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-blue-200 text-[#2563EB] hover:bg-blue-50 transition-all cursor-pointer"
            >
              {currentQuestionIndex === totalQCount - 1 ? "Submit Assessment →" : "Next Question →"}
            </button>
          </div>

        </main>

      </div>

      <footer className="bg-white border-t border-blue-100 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
        <span>© SmartRecruit · Candidate assessment session</span>
        <span>MediaPipe Face Landmarks + XGBoost Activity Classifier</span>
      </footer>

    </div>
  );
}

export default CandidateActiveAssessment;