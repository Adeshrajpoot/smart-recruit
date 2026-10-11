import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "SR";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getDefaultTimestamp = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${dateStr} · ${timeStr} IST`;
};

function AssessmentComplete() {
  const navigate = useNavigate();
  const [submissionData] = useState(() => {
    const defaults = {
      candidateName: "",
      candidateEmail: "",
      candidateId: "",
      savedResponsesCount: 0,
      receiptRef: "",
      submissionTime: getDefaultTimestamp(),
      proctoringAnalytics: {
        facePresencePct: 0,
        gazeDistribution: { center: 0, left: 0, right: 0 },
        maxFacesDetected: 0,
        longestFaceAbsenceSecs: 0,
        multipleFaceDurationSecs: 0,
        lookingAwayEvents: 0,
        tabSwitchesCount: 0,
        finalActivityStatus: "NOT RECORDED",
        finalVisualFlag: "NO",
        flagReason: "No live monitoring result was recorded."
      }
    };

    try {
      const user = JSON.parse(localStorage.getItem("user") || "null") || {};
      const storedSession = JSON.parse(localStorage.getItem("assessmentSubmission") || "null") || {};
      return {
        ...defaults,
        candidateName: user.name || "",
        candidateEmail: user.email || "",
        candidateId: user.id || user.candidateId || "",
        ...storedSession,
        submissionTime: storedSession.submissionTime || defaults.submissionTime,
        proctoringAnalytics: {
          ...defaults.proctoringAnalytics,
          ...(storedSession.proctoringAnalytics || {})
        }
      };
    } catch (error) {
      console.error("Failed to parse localStorage data:", error);
      return defaults;
    }
  });

  const proctoring = submissionData.proctoringAnalytics || {};
  const [legacySyncMessage, setLegacySyncMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function syncPreviousSummary() {
      if (submissionData.savedToBackend || submissionData.submissionId || !submissionData.receiptRef) return;
      if (!localStorage.getItem("token")) return;
      try {
        const saved = await api("/api/profile/interview/submit-summary", {
          method: "POST",
          body: JSON.stringify({
            receiptRef: submissionData.receiptRef,
            assessmentTitle: submissionData.assessmentTitle,
            savedResponsesCount: submissionData.savedResponsesCount,
            submissionTime: submissionData.submissionTime,
            proctoringAnalytics: proctoring
          })
        });
        if (!active) return;
        const merged = {
          ...submissionData,
          submissionId: saved.resultId,
          receiptRef: saved.receiptRef || submissionData.receiptRef,
          savedToBackend: true,
          legacySummaryOnly: Boolean(saved.legacySummaryOnly || !submissionData.savedToBackend)
        };
        localStorage.setItem("assessmentSubmission", JSON.stringify(merged));
        setLegacySyncMessage("Your previous submission summary has been synced. Earlier versions did not save individual answers.");
      } catch (error) {
        if (active) setLegacySyncMessage(error.message || "Could not sync the previous submission summary. Please revisit this page after reconnecting to the backend.");
      }
    }
    syncPreviousSummary();
    return () => { active = false; };
  }, [submissionData, proctoring]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between font-sans selection:bg-[#2563EB] selection:text-white">
      <header className="bg-white border-b border-blue-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#2563EB] rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20">
            S
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-[#0F172A] block">SmartRecruit</span>
            <span className="text-[10px] text-[#2563EB] font-semibold uppercase tracking-wider">Candidate Portal</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-500 hidden sm:inline">Assessment Complete & Verified</span>
          
          <div className="flex items-center space-x-2.5 bg-[#EFF6FF] border border-blue-100 pl-2 pr-3 py-1 rounded-xl">
            <div className="w-7 h-7 bg-[#2563EB] text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
              {getInitials(submissionData.candidateName)}
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-[#0F172A] block leading-tight">{submissionData.candidateName}</span>
              <span className="text-[9px] text-slate-500 block leading-tight">{submissionData.candidateEmail}</span>
            </div>
          </div>
        </div>
      </header>
      {legacySyncMessage && (
        <div role="status" className="max-w-7xl w-full mx-auto mt-4 px-4 sm:px-6 text-xs text-[#2563EB]">
          {legacySyncMessage}
        </div>
      )}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 my-6 flex flex-col lg:flex-row gap-6 flex-grow">
        <aside className="w-full lg:w-80 bg-white border border-blue-100 rounded-2xl p-5 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-6">
            
            <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-3">
                <div>
                  <span className="font-bold text-xs text-[#0F172A] block">{submissionData.candidateName}</span>
                  <span className="text-[10px] text-slate-500 block">{submissionData.candidateEmail}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-blue-100 flex justify-between text-[10px] text-slate-500">
                <span>Candidate ID:</span>
                <span className="font-mono text-[#2563EB] font-semibold">{submissionData.candidateId || "Not assigned"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Assessment Status</span>
                <span className="text-[#2563EB] font-bold">Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-[#2563EB] h-full w-full"></div>
              </div>
              <p className="text-[11px] text-slate-500">All sections submitted successfully.</p>
            </div>
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#2563EB] block">Session Summary</span>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center space-x-3 text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-[10px]">✓</div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">Technical Evaluation</p>
                    <p className="text-[10px] text-slate-500">{submissionData.savedResponsesCount} responses recorded</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase">Receipt Reference</span>
              <span className="font-mono font-bold text-xs text-[#2563EB]">{submissionData.receiptRef || "Not available"}</span>
            </div>
          </div>

        </aside>
        <main className="flex-grow bg-white border border-blue-100 rounded-2xl p-6 sm:p-10 flex flex-col justify-between space-y-8 shadow-sm">
          <div className="space-y-8">
            
            <div className="text-center space-y-4 py-4">
              <div className="space-y-2 max-w-xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  Assessment Submitted Successfully
                </h1>
              </div>
            </div>
            <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 p-4 text-[10px] font-bold text-[#2563EB] uppercase tracking-wider border-b border-blue-100">
                <span>Assessment Title</span>
                <span>Status</span>
                <span>Responses Saved</span>
                <span>Verification</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 p-4 text-xs font-semibold text-[#0F172A] items-center">
                <span className="text-slate-700 truncate pr-2">{submissionData.assessmentTitle}</span>
                <div className="flex items-center space-x-1.5 text-[#2563EB]">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
                  <span>Evaluated</span>
                </div>
                <span className="font-mono text-slate-800">{submissionData.savedResponsesCount} Questions</span>
                <span className="text-[#2563EB] font-mono">SECURE</span>
              </div>
            </div>
            <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Proctoring Telemetry & Integrity Report</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  proctoring.visualActivityFlag === 'YES' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-[#2563EB] border border-blue-200'
                }`}>
                  Flag: {proctoring.visualActivityFlag || "NO"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-[10px] text-slate-500 block">Face Presence</span>
                  <span className="font-mono font-bold text-[#0F172A] text-sm">{proctoring.facePresencePct ?? 0}%</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-[10px] text-slate-500 block">Tab Switches</span>
                  <span className={`font-mono font-bold text-sm ${proctoring.tabSwitchesCount > 0 ? 'text-amber-600' : 'text-[#2563EB]'}`}>
                    {proctoring.tabSwitchesCount ?? 0} / 3
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-[10px] text-slate-500 block">Max Faces</span>
                  <span className="font-mono font-bold text-[#0F172A] text-sm">{proctoring.maxFacesDetected ?? 1}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-[10px] text-slate-500 block">Looking Away</span>
                  <span className="font-mono font-bold text-[#0F172A] text-sm">{proctoring.lookingAwayEvents ?? 0} Events</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-blue-100">
                <strong className="text-[#0F172A] font-semibold">Integrity Status:</strong> {proctoring.flagReason || "Candidate posture and gaze stable within normal parameters."}
              </div>
            </div>

          </div>

          <div className="space-y-4 pt-6 border-t border-blue-100">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>Submitted on <strong className="text-[#0F172A]">{submissionData.submissionTime}</strong></span>
              <span className="font-mono text-[11px]">User: {submissionData.candidateEmail}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2 border-none"
            >
              <span>Return to Dashboard</span>
            </button>
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-blue-100 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
        <span>© SmartRecruit AI Assessment Platform</span>
        <span>Secure Session Terminated</span>
      </footer>

    </div>
  );
}

export default AssessmentComplete;