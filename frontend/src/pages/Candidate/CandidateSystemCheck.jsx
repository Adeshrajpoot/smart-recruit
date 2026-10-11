import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function CandidateSystemCheck() {
  const navigate = useNavigate();

  const [candidateName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?.name || "Candidate";
    } catch {
      return "Candidate";
    }
  });
  const [candidateEmail] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?.email || "";
    } catch {
      return "";
    }
  });

  const [hasPermission, setHasPermission] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(candidateName);

  async function requestPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = deviceList.filter(d => d.kind === 'videoinput');
      setCameras(videoInputs);
      const preferredCamera = sessionStorage.getItem("smart_recruit_camera_id");
      const preferredExists = videoInputs.some((device) => device.deviceId === preferredCamera);
      if (preferredExists) setSelectedCamera(preferredCamera);
      else if (videoInputs.length > 0) setSelectedCamera(videoInputs[0].deviceId);
      setHasPermission(true);
    } catch (err) {
      console.error("Error accessing camera device:", err);
      alert("Permission denied. Please allow camera access to proceed.");
    }
  }

  useEffect(() => {
    if (!hasPermission) return;
    async function startCameraStream() {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
          audio: false,
        });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        streamRef.current = currentStream;
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera stream error:", err);
      }
    }

    if (selectedCamera) {
      startCameraStream();
    }
  }, [hasPermission, selectedCamera]);

  useEffect(() => () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  function handleContinue() {
    sessionStorage.setItem("smart_recruit_camera_ready", "true");
    sessionStorage.setItem("smart_recruit_camera_id", selectedCamera);
    navigate("/candidate/assessment-overview");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans selection:bg-[#2563EB] selection:text-white">
      <aside className="w-72 bg-white border-r border-blue-100 flex flex-col justify-between p-6 hidden lg:flex sticky top-0 h-screen overflow-y-auto">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              S
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">SmartRecruit</h1>
              <p className="text-[10px] font-bold text-[#2563EB] tracking-wider uppercase">EVALUATION PORTAL</p>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3">YOUR ASSESSMENT</p>
            <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-3.5 flex items-center space-x-3">
              <div className="w-9 h-9 bg-[#2563EB] text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-[#0F172A] leading-tight truncate">{candidateName}</p>
                <p className="text-xs text-slate-500 truncate">{candidateEmail}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3">ASSESSMENT STEPS</p>
            <div className="space-y-2">
              <div
                onClick={() => navigate("/candidate/instructions")}
                className="flex items-start space-x-3 p-2.5 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-700">Instructions</p>
                  <p className="text-[11px] text-slate-500">Review before you begin</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center mt-0.5 shadow-sm shadow-blue-500/30">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2563EB]">Permission check</p>
                  <p className="text-[11px] text-slate-600">Make sure your setup is ready</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl opacity-60">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-xs flex items-center justify-center mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Assessment overview</p>
                  <p className="text-[11px] text-slate-400">See what's included</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl opacity-60">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-xs flex items-center justify-center mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Assessment</p>
                  <p className="text-[11px] text-slate-400">90 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 mt-6">
          <p className="text-xs font-bold text-[#0F172A] mb-1">Need help?</p>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
            Having trouble with a device? Check your settings or contact support before you start.
          </p>
          <button className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center space-x-1 cursor-pointer bg-transparent border-none">
            <span>Contact support</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-blue-100 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="text-xs text-slate-500 font-medium">
            Candidate portal <span className="text-slate-300 mx-2">/</span> <span className="text-slate-800">Permission check</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5 bg-[#EFF6FF] border border-blue-100 px-3 py-1.5 rounded-lg">
              <span className="w-6 h-6 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {initials}
              </span>
              <span className="text-xs font-semibold text-[#0F172A]">{candidateName}</span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl w-full mx-auto px-8 py-8 flex-grow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                • STEP 2 OF 4 • SETUP
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mt-3 tracking-tight">
                Let's make sure everything is ready.
              </h2>
              <p className="text-slate-600 text-sm mt-1.5 max-w-2xl">
                We'll check your camera and connection before you enter the assessment. Once confirmed, proctoring will remain active continuously until your submission.
              </p>
            </div>
            <div className="text-xs font-medium text-slate-700 bg-white border border-blue-100 px-3.5 py-2 rounded-xl flex items-center space-x-2 self-start md:self-auto shadow-sm">
              <i className="fa-solid fa-shield-halved text-[#2563EB]"></i>
              <span>Secure Evaluation Proctor v4.1</span>
            </div>
          </div>

          {!hasPermission ? (
            <div className="bg-white border border-blue-100 rounded-2xl p-10 text-center max-w-xl mx-auto my-12 shadow-xl">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                <i className="fa-solid fa-lock"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Camera Access Required</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-6">
                To proceed with the continuous secure proctoring check, please grant permissions to access your camera.
              </p>
              <button
                type="button"
                onClick={requestPermissions}
                className="py-3 px-6 rounded-xl font-medium text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer border-none"
              >
                Enable Camera & Start Proctoring →
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-[#2563EB]">
                      <i className="fa-solid fa-video text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F172A] text-sm">Camera Stream</h4>
                      <p className="text-slate-500 text-xs mt-0.5">Continuous proctoring active</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <i className="fa-solid fa-check text-[10px]"></i> <span>Live</span>
                  </span>
                </div>

                <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-[#2563EB]">
                      <i className="fa-solid fa-wifi text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F172A] text-sm">Browser & connection</h4>
                      <p className="text-slate-500 text-xs mt-0.5">Secure WebRTC • Stable</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span> <span>Stable</span>
                  </span>
                </div>
              </div>

              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-white rounded-2xl p-6 border border-blue-100 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-[#0F172A] flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
                        <span>Continuous Camera Feed</span>
                      </h3>
                      <span className="text-xs text-[#2563EB] font-semibold flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping"></span>
                        <span>Recording Active</span>
                      </span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden bg-slate-900 h-72 flex flex-col items-center justify-center border border-slate-800">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-mono border border-white/10 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse"></span>
                        <span>PROCTOR STREAM ACTIVE</span>
                      </div>

                      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[11px] text-slate-300 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="text-blue-400 font-medium">✓ Session Locked until Submission</span>
                        <span className="text-slate-400">🛡 AES-256</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Camera Device</label>
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-[#2563EB]"
                    >
                      {cameras.map((cam) => (
                        <option key={cam.deviceId} value={cam.deviceId}>
                          {cam.label || `Camera Device (${cam.deviceId.slice(0, 5)})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-slate-500 mt-4 text-center">
                    Your camera will remain active through the overview and coding assessment until you click submit.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-blue-50/60 border border-blue-100 rounded-xl mb-8 text-xs text-slate-600 leading-relaxed">
                <i className="fa-solid fa-shield-halved text-[#2563EB] mt-0.5"></i>
                <div>
                  Continuous proctoring is enabled for this assessment. Do not close your browser tab or switch windows. The feed will terminate automatically upon final score compilation and submission. <a href="#" className="text-[#2563EB] font-semibold hover:underline">View guidelines ↗</a>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-5 border-t border-blue-100">
            <button
              type="button"
              onClick={() => navigate("/candidate/instructions")}
              className="text-xs font-semibold text-slate-500 hover:text-[#0F172A] transition-colors cursor-pointer flex items-center space-x-1.5 bg-transparent border-none"
            >
              <span>Back to instructions</span>
            </button>

            <div className="flex items-center space-x-6">
              <span className="text-xs font-medium text-slate-600 flex items-center space-x-2">
                <i className="fa-solid fa-circle-check text-[#2563EB]"></i>
                <span>{hasPermission ? "Proctor stream locked" : "Awaiting permission"}</span>
              </span>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!hasPermission}
                className={`py-3 px-6 rounded-xl font-medium text-xs transition-all flex items-center space-x-2 ${hasPermission
                  ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-500/25 cursor-pointer border-none"
                  : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                  }`}
              >
                <span>Continue to assessment overview</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="py-5 px-8 bg-white border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-[#2563EB] transition-colors">Privacy policy</a>
            <span>•</span>
            <a href="#" className="hover:text-[#2563EB] transition-colors">Candidate terms</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default CandidateSystemCheck;