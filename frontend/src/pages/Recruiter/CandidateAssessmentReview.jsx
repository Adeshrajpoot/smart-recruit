import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";

function CandidateAssessmentReview() {
  const navigate = useNavigate();
  const { candidateId: attemptId } = useParams();
  const [selectedDecision, setSelectedDecision] = useState("review");
  const [recruiterNote, setRecruiterNote] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [recruiterName] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").name || "Recruiter"; }
    catch { return "Recruiter"; }
  });
  const [candidateData, setCandidateData] = useState({
    name: "Candidate",
    email: "",
    role: "Assessment candidate",
    overallScore: null,
    completedTime: "Not submitted",
    percentile: "Not calculated",
    verified: false,
    sections: {
      coding: { score: null, details: "No coding evaluation saved" },
      technicalKnowledge: { score: null, details: "No technical evaluation saved" },
      communication: { score: null, details: "No communication evaluation saved" }
    },
    evidence: []
  });

  useEffect(() => {
    let active = true;
    async function fetchCandidateDetails() {
      if (!attemptId) {
        setLoadError("No assessment attempt was selected. Return to the candidate list and choose an attempt.");
        return;
      }
      try {
        const data = await api(`/api/recruiter/candidate/${attemptId}`);
        if (!active) return;
        if (!data.candidate) throw new Error("The backend returned no candidate details.");
        setCandidateData((previous) => ({ ...previous, ...data.candidate }));
        setRecruiterNote(data.candidate.recruiterNote || "");
        const decision = data.candidate.decision || "pending";
        setSelectedDecision(decision === "shortlisted" ? "shortlisted" : decision === "rejected" ? "not_selected" : "review");
        setLoadError("");
      } catch (error) {
        if (active) setLoadError(error.message || "Could not load the candidate assessment from the backend.");
      }
    }
    fetchCandidateDetails();
    return () => { active = false; };
  }, [attemptId]);

  const handleSaveDecision = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      await api(`/api/recruiter/candidate/${attemptId}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision: selectedDecision, note: recruiterNote })
      });
      setSaveMessage(`Decision saved for ${candidateData.name}.`);
    } catch (error) {
      setSaveMessage(error.message || "Could not save the decision.");
    } finally {
      setSaving(false);
    }
  };


  const getInitials = (name) => {
    return name
      .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#021810] text-white flex flex-col md:flex-row selection:bg-[#10B981] selection:text-white scroll-smooth font-sans">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-emerald-950 bg-[#02140e] p-6 flex flex-col justify-between md:sticky md:top-0 md:h-screen shrink-0">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-7 h-7 bg-[#10B981] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-none">
                SmartRecruit
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#10B981] uppercase mt-1">
                Recruiter Workspace
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              Workspace
            </span>
            <button 
              onClick={() => navigate("/recruiter/dashboard")}
              className="flex items-center gap-3 text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-lg hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
            >
              <i className="fa-solid fa-chart-pie text-xs"></i> Dashboard
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              Assessments
            </span>
            <button 
              className="flex items-center gap-3 text-xs font-mono text-[#10B981] bg-emerald-950/40 border border-emerald-900/40 py-2 px-3 rounded-lg font-medium text-left">
              <i className="fa-solid fa-user text-xs"></i> Candidates
            </button>
            <button 
              className="flex items-center gap-3 text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-lg hover:bg-emerald-950/40 transition-colors text-left cursor-pointer">
              <i className="fa-solid fa-code text-xs"></i> Open roles
            </button>
            <button 
              className="flex items-center gap-3 text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-lg hover:bg-emerald-950/40 transition-colors text-left cursor-pointer">
              <i className="fa-solid fa-chart-bar text-xs"></i> Reports
            </button>
          </div>
          <div className="flex flex-col p-3 bg-[#03261a]/60 border border-emerald-900/40 rounded-xl gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-800 text-emerald-200 flex items-center justify-center font-mono text-xs font-bold">
                {getInitials(candidateData.name)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{candidateData.name}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate">{candidateData.role}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-emerald-900/40">
              <span className="text-slate-400">Overall score</span>
              <span className="text-white font-bold">{candidateData.overallScore ?? "—"} / 100</span>
            </div>
            <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-400 pt-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Candidate review</span>
              <a href="#performance-overview" className="hover:text-white transition-colors py-0.5">Performance overview</a>
              <a href="#assessment-evidence" className="hover:text-white transition-colors py-0.5">Assessment evidence</a>
              <a href="#review-notes" className="hover:text-white transition-colors py-0.5">Review notes</a>
              <a href="#recruiter-decision" className="hover:text-white transition-colors py-0.5">Recruiter decision</a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-4 border-t border-emerald-950">
          <div className="p-3 bg-[#03261a]/40 border border-emerald-900/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                {recruiterName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{JSON.parse(localStorage.getItem("user") || "{}")?.name || "Recruiter"}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate">Lead technical recruiter</span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white cursor-pointer">
              <i className="fa-solid fa-ellipsis text-xs"></i>
            </button>
          </div>
          <div className="p-3 bg-[#03261a]/30 border border-emerald-900/30 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono text-white font-semibold">Review with context</span>
            <p className="text-[10px] text-slate-400 leading-tight">Use the assessment evidence alongside your team's interview process.</p>
            <span className="text-[10px] font-mono text-[#10B981] hover:underline cursor-pointer mt-1">Scorecard guide →</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#021c13]">
        <header className="w-full border-b border-emerald-950 bg-[#021810]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate("/recruiter/assessment/create")}>Assessments</span>
            <span>›</span>
            <span className="hover:text-white cursor-pointer">{candidateData.role}</span>
            <span>›</span>
            <span className="hover:text-white cursor-pointer">Candidates</span>
            <span>›</span>
            <span className="text-white">{candidateData.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#03261a] border border-emerald-900/40 px-2.5 py-1 rounded-full text-xs font-mono">
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                {recruiterName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <span className="text-white">{JSON.parse(localStorage.getItem("user") || "{}")?.name || "Recruiter"}</span>
            </div>
          </div>
        </header>
        
        <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          {loadError && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200" role="alert">{loadError}</div>}
          {saveMessage && <div className={`rounded-lg border px-4 py-3 text-sm ${saveMessage.toLowerCase().includes("saved") ? "border-emerald-900/50 bg-emerald-950/30 text-emerald-200" : "border-red-900/50 bg-red-950/30 text-red-200"}`} role="status">{saveMessage}</div>}
          <div className="p-6 bg-[#03261a]/40 border border-emerald-900/40 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center font-mono font-bold text-base border border-emerald-700/50">
                {getInitials(candidateData.name)}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-white tracking-tight">{candidateData.name}</h1>
                  <span className="text-xs font-mono text-slate-400">{candidateData.role}</span>
                  <span className="text-xs font-mono text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-300">{candidateData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#10B981] mt-1">
                  <i className="fa-solid fa-check text-[10px]"></i> {candidateData.completedTime === "Not submitted" ? "Assessment not submitted" : "Assessment submission recorded"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-emerald-950">
              <div className="flex flex-col lg:text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Overall assessment</span>
                <div className="flex items-baseline lg:justify-end gap-1">
                  <span className="text-3xl font-bold text-white font-mono">{candidateData.overallScore ?? "—"}</span>
                  <span className="text-xs font-mono text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-300 border-l border-emerald-950 pl-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <i className="fa-regular fa-clock text-xs"></i> Completed {candidateData.completedTime}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <i className="fa-solid fa-chart-line text-xs text-[#10B981]"></i> Cohort percentile {candidateData.percentile}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <i className="fa-solid fa-shield-halved text-xs text-[#10B981]"></i> {candidateData.verified ? "System check completed" : "System check not recorded"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <section id="performance-overview" className="p-6 bg-[#03261a]/30 border border-emerald-900/30 rounded-2xl flex flex-col gap-5">
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-white tracking-tight">Performance overview</h2>
                  <span className="text-xs font-mono text-slate-400">Assessment results by section</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-[#021810]/60 border border-emerald-900/40 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-slate-300">Coding</span>
                      <span className="text-sm font-mono font-bold text-white">{candidateData.sections.coding.score ?? "—"} / 100</span>
                    </div>
                    <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${candidateData.sections.coding.score ?? 0}%` }}></div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{candidateData.sections.coding.details}</span>
                  </div>

                  <div className="p-4 bg-[#021810]/60 border border-emerald-900/40 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-slate-300">Technical knowledge</span>
                      <span className="text-sm font-mono font-bold text-white">{candidateData.sections.technicalKnowledge.score ?? "—"} / 100</span>
                    </div>
                    <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${candidateData.sections.technicalKnowledge.score ?? 0}%` }}></div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{candidateData.sections.technicalKnowledge.details}</span>
                  </div>

                  <div className="p-4 bg-[#021810]/60 border border-emerald-900/40 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-slate-300">Communication</span>
                      <span className="text-sm font-mono font-bold text-white">{candidateData.sections.communication.score ?? "—"} / 100</span>
                    </div>
                    <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${candidateData.sections.communication.score ?? 0}%` }}></div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{candidateData.sections.communication.details}</span>
                  </div>
                </div>
              </section>

              <section id="assessment-evidence" className="p-6 bg-[#03261a]/30 border border-emerald-900/30 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h2 className="text-base font-bold text-white tracking-tight">Assessment evidence</h2>
                    <span className="text-xs font-mono text-slate-400">Open a section to review the candidate's work.</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{candidateData.evidence.length} responses</span>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {candidateData.evidence.map((item, index) => {
                    let iconClass = "fa-solid fa-code";
                    if (["mcq", "technical"].includes(item.type)) iconClass = "fa-solid fa-list-check";
                    if (["spoken", "audio"].includes(item.type)) iconClass = "fa-solid fa-microphone";

                    return (
                      <div key={index} className="p-4 bg-[#021810]/60 border border-emerald-900/40 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-900/50 border border-emerald-800/50 flex items-center justify-center text-slate-300 text-xs">
                              <i className={iconClass}></i>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">{item.title}</span>
                              <span className="text-[11px] font-mono text-slate-400">{item.meta}</span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-white">{item.score ?? "—"} / {item.maxScore || 100}</span>
                        </div>
                        <div className="pt-2 border-t border-emerald-950 flex justify-end">
                          <button className="text-xs font-mono text-[#10B981] hover:underline cursor-pointer">
                            {item.actionText}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="review-notes" className="p-6 bg-[#03261a]/30 border border-emerald-900/30 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-white tracking-tight">Review notes</h2>
                  <span className="text-xs font-mono text-slate-400">Observations for the recruiting team.</span>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="p-4 bg-[#261603]/60 border border-amber-900/40 rounded-xl flex items-start gap-3">
                    <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xs mt-0.5"></i>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-amber-400 font-mono">Evidence availability</span>
                      <p className="text-xs text-slate-300 mt-0.5">Saved answers and face/tab monitoring summaries are shown when available. Automated scoring is not configured for this personalized MCQ interview.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#021810]/60 border border-emerald-900/40 rounded-xl flex flex-col gap-2">
                    <textarea 
                      rows="3"
                      value={recruiterNote}
                      onChange={(e) => setRecruiterNote(e.target.value)}
                      placeholder="Add a recruiter note for your team..."
                      className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none font-sans"
                    ></textarea>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 bg-[#03261a]/30 border border-emerald-900/30 rounded-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight">Score summary</h3>
                  <span className="text-[10px] font-mono text-[#10B981] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">{candidateData.percentile}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-slate-400">{candidateData.overallScore ?? "—"} / 100 overall</span>
                </div>

                <div className="flex flex-col gap-4 pt-2 border-t border-emerald-950">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300">Coding</span>
                      <span className="text-white font-bold">{candidateData.sections.coding.score ?? "—"}</span>
                    </div>
                    <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${candidateData.sections.coding.score ?? 0}%` }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300">Technical knowledge</span>
                      <span className="text-white font-bold">{candidateData.sections.technicalKnowledge.score ?? "—"}</span>
                    </div>
                    <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${candidateData.sections.technicalKnowledge.score ?? 0}%` }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300">Communication</span>
                      <span className="text-white font-bold">{candidateData.sections.communication.score ?? "—"}</span>
                    </div>
                    <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${candidateData.sections.communication.score ?? 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <section id="recruiter-decision" className="p-6 bg-[#03261a]/30 border border-emerald-900/30 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-white tracking-tight">Recruiter decision</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Record your team's next step.</p>
                  <span className="text-[11px] text-slate-500 font-mono mt-1">Consider the full application and interview context.</span>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <label 
                    onClick={() => setSelectedDecision("review")}
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      selectedDecision === "review" 
                        ? "bg-[#03261a]/80 border-[#10B981]/50" 
                        : "bg-[#021810]/60 border-emerald-900/40 hover:border-emerald-800/60"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="decision" 
                      checked={selectedDecision === "review"}
                      onChange={() => setSelectedDecision("review")}
                      className="mt-1 accent-[#10B981]" 
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Review</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Discuss with the team or follow up.</span>
                    </div>
                  </label>

                  <label onClick={() => setSelectedDecision("shortlisted")}
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      selectedDecision === "shortlisted" 
                        ? "bg-[#03261a]/80 border-[#10B981]/50" 
                        : "bg-[#021810]/60 border-emerald-900/40 hover:border-emerald-800/60"}`}>
                    <input type="radio" name="decision" 
                      checked={selectedDecision === "shortlisted"}
                      onChange={() => setSelectedDecision("shortlisted")}
                      className="mt-1 accent-[#10B981]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Shortlisted</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Progress to a hiring team interview.</span>
                    </div>
                  </label>

                  <label onClick={() => setSelectedDecision("not_selected")}
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      selectedDecision === "not_selected" 
                        ? "bg-[#03261a]/80 border-[#10B981]/50" 
                        : "bg-[#021810]/60 border-emerald-900/40 hover:border-emerald-800/60"}`}>
                    <input type="radio"  name="decision" checked={selectedDecision === "not_selected"}
                      onChange={() => setSelectedDecision("not_selected")}
                      className="mt-1 accent-[#10B981]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Not selected</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Does not meet the current role criteria.</span>
                    </div>
                  </label>
                </div>

                <button onClick={handleSaveDecision} disabled={saving || !attemptId}
                  className="w-full mt-2 bg-[#10B981] hover:bg-emerald-600 text-black font-bold py-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-950/20"
                >
                  {saving ? "Saving…" : "Save decision"}
                </button>
              </section>
            </div>
          </div>

          <footer className="pt-6 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <button  onClick={() => navigate(-1)}  className="hover:text-white transition-colors cursor-pointer">
                ← Back to candidates
              </button>
              <span>·</span>
              <span>SmartRecruit · Candidate scorecard</span>
            </div>
            <div className="flex gap-4">
              <span>Candidate evidence supports your review; use your team's hiring process.</span>
              <span className="hover:text-white cursor-pointer">Candidate information · Privacy details</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default CandidateAssessmentReview;