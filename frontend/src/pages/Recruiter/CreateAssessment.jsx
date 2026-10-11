import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function CreateAssessment() {
  const navigate = useNavigate();
  const [assessmentName, setAssessmentName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [timeLimit, setTimeLimit] = useState("30");
  const [recruitmentDrive, setRecruitmentDrive] = useState("");
  const [recruiterName] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").name || "Recruiter"; }
    catch { return "Recruiter"; }
  });
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatesList, setCandidatesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (candidateEmail.trim() && !candidatesList.includes(candidateEmail.trim())) {
      setCandidatesList([...candidatesList, candidateEmail.trim()]);
      setCandidateEmail("");
    }
  };

  const removeCandidate = (indexToRemove) => {
    setCandidatesList(candidatesList.filter((_, index) => index !== indexToRemove));
  };

  const handlePublishAssessment = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const durationMinutes = Number.parseInt(timeLimit, 10);
      if (!assessmentName.trim() || !targetRole.trim() || !Number.isFinite(durationMinutes) || durationMinutes < 1) {
        throw new Error("Enter an assessment name, target role, and a valid duration in minutes.");
      }
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const driveResponse = await api("/api/drives", {
        method: "POST",
        body: JSON.stringify({
          title: recruitmentDrive.trim() || assessmentName.trim(),
          company: storedUser.company || "SmartRecruit",
          role: targetRole.trim(),
          description: `Assessment: ${assessmentName.trim()}`,
          location: "Remote",
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          isActive: true
        })
      });
      const drive = driveResponse.data?.drive;
      if (!drive?._id) throw new Error("The backend created no recruitment drive ID.");

      const assessmentResponse = await api("/api/assessment", {
        method: "POST",
        body: JSON.stringify({
          driveId: drive._id,
          title: assessmentName.trim(),
          durationMinutes,
          instructions: "Please read each question carefully and submit your answers before the time limit.",
          questions: [],
          weights: { coding: 40, technical: 30, communication: 20, other: 10 }
        })
      });
      if (!assessmentResponse.success) throw new Error("Assessment could not be saved by the backend.");
      navigate("/recruiter/candidates");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#111d18] text-white flex flex-col md:flex-row selection:bg-[#91b5a2] selection:text-white scroll-smooth font-sans">
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-emerald-950 bg-[#02140e] p-3 flex flex-col justify-between md:sticky md:top-0 md:h-screen shrink-0">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-7 h-7 bg-[#10B981] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-none">
                SmartRecruit
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#94A3B8] uppercase mt-1">
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
              onClick={() => navigate("/recruiter/candidates")}
              className="flex items-center justify-between text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-lg hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-user text-xs"></i> Candidates
              </div>
              <span className="bg-emerald-950 border border-emerald-900/60 text-slate-300 font-bold px-1.5 py-0.2 rounded text-[10px]">{candidatesList.length}</span>
            </button>
            <button
              className="flex items-center gap-3 text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-lg hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
            >
              <i className="fa-solid fa-code text-xs"></i> Open roles
            </button>
            <button
              className="flex items-center gap-3 text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-lg hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
            >
              <i className="fa-solid fa-chart-bar text-xs"></i> Reports
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-emerald-950">
          <div className="p-2.5 bg-[#03261a]/40 border border-emerald-900/40 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Current draft</span>
            <span className="text-xs font-bold text-white">{assessmentName || "Untitled assessment"}</span>
            <span className="text-[10px] font-mono text-[#10B981] mt-1">Draft details</span>
          </div>

          <div className="p-2.5 bg-[#0f1715] border border-emerald-900/40 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-200 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                {recruiterName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{recruiterName}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate">Recruiter</span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white cursor-pointer">
              <i className="fa-solid fa-ellipsis text-xs"></i>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-[#101c17]">
        <header className="w-full border-b border-emerald-950 bg-[#021810]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-white">
            <span className="hover:text-white cursor-pointer">Assessments</span>
            <span>›</span>
            <span className="text-white">Create assessment</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Draft saved</span>
            </div>
            <button className="bg-[#03261a] hover:bg-emerald-900/60 border border-emerald-900/50 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer">
              Save draft
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 flex flex-col gap-5 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">New assessment</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Set up your assessment.</h1>
              <p className="text-xs text-slate-400">Add the role details, choose your questions, then invite candidates.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#1b2a24]/70 border border-emerald-900/40 px-3 py-2 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-[#91b5a2]"></span>
              <span>Draft - saved just now</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-2.5 bg-[#1b2a24]/70 border border-emerald-900/40 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-emerald-950 text-slate-400 flex items-center justify-center font-mono text-xs"><i className="fa-solid fa-file-lines"></i></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Step 1</span>
                <span className="text-xs font-bold text-white">Details</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-[#1b2a24] border border-[#91b5a2]/60 rounded-lg shadow-lg shadow-emerald-950/50">
              <div className="w-6 h-6 rounded-md bg-emerald-950 text-slate-400 flex items-center justify-center font-mono text-xs">2</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#91b5a2] uppercase">Step 2</span>
                <span className="text-xs font-bold text-white">Questions</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-[#1b2a24]/70 border border-emerald-900/40 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-emerald-950 text-slate-400 flex items-center justify-center font-mono text-xs">3</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Step 3</span>
                <span className="text-xs font-bold text-slate-400">Invite candidates</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1b2a24]/70 border border-emerald-900/30 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#91b5a2] text-[#16241e] font-bold flex items-center justify-center text-xs font-mono">1</span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Assessment details</h2>
                <p className="text-xs text-slate-400">Set the basics candidates will see.</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Required fields marked *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400">Assessment name *</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Developer Assessment"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="bg-[#111e18] border border-emerald-900/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-700 font-sans"
                />
                <span className="text-[10px] font-mono text-slate-500">Saved to the backend with this assessment.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400">Target role *</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-[#111e18] border border-emerald-900/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-700 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400">Time limit *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Duration in minutes"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="bg-[#111e18] border border-emerald-900/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-700 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400">Recruitment drive</label>
                <input
                  type="text"
                  placeholder="e.g. October engineering hiring drive"
                  value={recruitmentDrive}
                  onChange={(e) => setRecruitmentDrive(e.target.value)}
                  className="bg-[#111e18] border border-emerald-900/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-700 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1b2a24]/70 border border-emerald-900/30 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#91b5a2] text-[#16241e] font-bold flex items-center justify-center text-xs font-mono">2</span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Questions</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Template preview only</span>
            </div>

            <p className="text-xs text-slate-400">Preview only: the sample questions shown below are not yet connected to saved Question records. The form currently saves the assessment as a draft without these questions.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-1">
              <div className="p-2.5 bg-[#111e18] border border-emerald-900/40 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Multiple choice</span>
                  <span className="text-[10px] font-mono text-slate-400">4 questions · 20 points</span>
                </div>
                <span className="text-[10px] font-mono text-[#91b5a2] bg-emerald-950 px-2 py-1 rounded">Included</span>
              </div>

              <div className="p-2.5 bg-[#111e18] border border-emerald-900/40 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Spoken response</span>
                  <span className="text-[10px] font-mono text-slate-400">1 prompt · 10 points</span>
                </div>
                <span className="text-[10px] font-mono text-[#91b5a2] bg-emerald-950 px-2 py-1 rounded">Included</span>
              </div>

              <div className="p-2.5 bg-[#111e18] border border-emerald-900/40 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Coding challenge</span>
                  <span className="text-[10px] font-mono text-slate-400">1 task · 20 points</span>
                </div>
                <span className="text-[10px] font-mono text-[#91b5a2] bg-emerald-950 px-2 py-1 rounded">Included</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Assessment questions</span>
              <span className="text-[10px] font-mono text-slate-500">Review or adjust before inviting candidates</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="p-2.5 bg-[#111e18] border border-emerald-900/30 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">01</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Which statement best describes REST APIs and the GET and POST methods?</span>
                    <span className="text-[10px] font-mono text-slate-400">Multiple choice · 4 options · 5 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-300">5 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-500 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-[#111e18] border border-emerald-900/30 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">02</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Which statement best describes asynchronous JavaScript?</span>
                    <span className="text-[10px] font-mono text-slate-400">Multiple choice · 4 options · 5 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-300">5 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-500 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-[#111e18] border border-emerald-900/30 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">03</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Which approach uses event delegation to handle clicks on child elements?</span>
                    <span className="text-[10px] font-mono text-slate-400">Multiple choice · 4 options · 5 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-300">5 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-500 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-[#111e18] border border-emerald-900/30 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">04</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Which metric is part of Core Web Vitals?</span>
                    <span className="text-[10px] font-mono text-slate-400">Multiple choice · 4 options · 5 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-300">5 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-500 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-[#111e18] border border-emerald-900/30 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">05</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Explain the difference between synchronous and asynchronous JavaScript.</span>
                    <span className="text-[10px] font-mono text-slate-400">Spoken response · 2 min max · 10 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-300">10 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-500 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-[#111e18] border border-emerald-900/30 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">06</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Reverse a string and consider the algorithm's runtime complexity.</span>
                    <span className="text-[10px] font-mono text-slate-400">Coding challenge · In-browser editor · 20 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-300">20 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-500 cursor-pointer"></i>
                </div>
              </div>

              <button className="w-full py-2.5 bg-[#111e18] hover:bg-emerald-950/50 border border-dashed border-emerald-900/50 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer text-center">
                + Add a question
              </button>
            </div>
          </div>
          <div className="bg-[#1b2a24]/70 border border-emerald-900/30 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#91b5a2] text-[#16241e] font-bold flex items-center justify-center text-xs font-mono">3</span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Invite candidates</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{candidatesList.length} candidates</span>
            </div>
            <p className="text-xs text-slate-400">Email addresses are currently a local draft list; invitation delivery is not yet connected to the backend.</p>
            <form onSubmit={handleAddCandidate} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="email"
                placeholder="Candidate email address"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="flex-1 bg-[#111e18] border border-emerald-900/50 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-700 font-sans"
              />
              <div className="flex items-center gap-2">
                <button type="submit" className="bg-[#1b2a24] hover:bg-emerald-900/60 border border-emerald-900/50 text-slate-200 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer">
                  + Add candidate
                </button>
                <button type="button" className="bg-[#111e18] hover:bg-emerald-950 border border-emerald-900/50 text-slate-300 px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer">
                  Upload CSV
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {candidatesList.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#111e18] border border-emerald-900/40 px-3 py-1.5 rounded-lg text-xs font-mono">
                  <span className="w-5 h-5 rounded-full bg-[#38594b] text-white flex items-center justify-center text-[10px] font-bold">
                    {email.substring(0, 2).toUpperCase()}
                  </span>
                  <span className="text-slate-200">{email}</span>
                  <button type="button" onClick={() => removeCandidate(idx)} className="text-slate-500 hover:text-slate-300 ml-1 cursor-pointer">×</button>
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#111e18] border border-emerald-900/40 rounded-lg flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-900/40 flex items-center justify-center text-[#91b5a2] text-xs">
                  <i className="fa-solid fa-shield"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Standard assessment safeguards</span>
                  <span className="text-[10px] font-mono text-slate-400">Camera check and focus monitoring are enabled.</span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-300">On by default</span>
            </div>
          </div>

          {errorMessage && (
            <div className="text-xs text-red-400 font-mono text-center">
              {errorMessage}
            </div>
          )}

          <div className="pt-6 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-[#91b5a2] font-bold">Ready to save draft</span>
              <span>·</span>
              <span>{assessmentName}</span>
              <span>·</span>
              <span>0 saved questions</span>
              <span>·</span>
              <span>{candidatesList.length} candidates</span>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={handlePublishAssessment} disabled={loading} className="bg-[#1b2a24] hover:bg-emerald-900/60 border border-emerald-900/50 text-slate-200 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer disabled:opacity-50">
                Save draft
              </button>
              <button
                type="button"
                onClick={handlePublishAssessment}
                disabled={loading}
                className="bg-[#91b5a2] hover:bg-[#a1c0ae] text-[#16241e] px-5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-emerald-900/30 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create assessment →"}
              </button>
            </div>
          </div>

          <footer className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
            <div>
              <span>SmartRecruit · Recruiter workspace</span>
            </div>
            <div className="flex gap-4">
              <span className="hover:text-slate-200 cursor-pointer">Candidate privacy</span>
              <span>·</span>
              <span className="hover:text-slate-200 cursor-pointer">Help</span>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}

export default CreateAssessment;