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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row selection:bg-[#2563EB] selection:text-white scroll-smooth font-sans">
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-blue-100 bg-white p-3 flex flex-col justify-between md:sticky md:top-0 md:h-screen shrink-0 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-7 h-7 bg-[#2563EB] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#0F172A] leading-none">
                SmartRecruit
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mt-1">
                Recruiter Workspace
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              Workspace
            </span>
            <button
              onClick={() => navigate("/recruiter/dashboard")}
              className="flex items-center gap-3 text-xs font-mono text-slate-600 hover:text-[#0F172A] py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-left cursor-pointer border-none bg-transparent"
            >
              <i className="fa-solid fa-chart-pie text-xs"></i> Dashboard
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              Assessments
            </span>
            <button
              onClick={() => navigate("/recruiter/candidates")}
              className="flex items-center justify-between text-xs font-mono text-slate-600 hover:text-[#0F172A] py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-left cursor-pointer border-none bg-transparent"
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-user text-xs"></i> Candidates
              </div>
              <span className="bg-blue-100 border border-blue-200 text-[#2563EB] font-bold px-1.5 py-0.2 rounded text-[10px]">{candidatesList.length}</span>
            </button>
            <button
              className="flex items-center gap-3 text-xs font-mono text-slate-600 hover:text-[#0F172A] py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-left cursor-pointer border-none bg-transparent"
            >
              <i className="fa-solid fa-code text-xs"></i> Open roles
            </button>
            <button
              className="flex items-center gap-3 text-xs font-mono text-slate-600 hover:text-[#0F172A] py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-left cursor-pointer border-none bg-transparent"
            >
              <i className="fa-solid fa-chart-bar text-xs"></i> Reports
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-blue-100">
          <div className="p-2.5 bg-[#EFF6FF] border border-blue-100 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Current draft</span>
            <span className="text-xs font-bold text-[#0F172A]">{assessmentName || "Untitled assessment"}</span>
            <span className="text-[10px] font-mono text-[#2563EB] mt-1">Draft details</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-blue-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 shadow-sm">
                {recruiterName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#0F172A] truncate">{recruiterName}</span>
                <span className="text-[10px] font-mono text-slate-500 truncate">Recruiter</span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-[#0F172A] cursor-pointer bg-transparent border-none">
              <i className="fa-solid fa-ellipsis text-xs"></i>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <header className="w-full border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <span className="hover:text-[#0F172A] cursor-pointer">Assessments</span>
            <span>›</span>
            <span className="text-[#0F172A] font-semibold">Create assessment</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
              <span>Draft saved</span>
            </div>
            <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#2563EB] px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer">
              Save draft
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 flex flex-col gap-5 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">New assessment</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">Set up your assessment.</h1>
              <p className="text-xs text-slate-600">Add the role details, choose your questions, then invite candidates.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-blue-50/70 border border-blue-100 px-3 py-2 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
              <span>Draft - saved just now</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-white border border-blue-200 text-[#2563EB] flex items-center justify-center font-mono text-xs"><i className="fa-solid fa-file-lines"></i></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Step 1</span>
                <span className="text-xs font-bold text-[#0F172A]">Details</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-white border border-[#2563EB] rounded-lg shadow-sm">
              <div className="w-6 h-6 rounded-md bg-[#2563EB] text-white flex items-center justify-center font-mono text-xs">2</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#2563EB] uppercase font-bold">Step 2</span>
                <span className="text-xs font-bold text-[#0F172A]">Questions</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-white border border-blue-200 text-slate-400 flex items-center justify-center font-mono text-xs">3</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Step 3</span>
                <span className="text-xs font-bold text-slate-500">Invite candidates</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#2563EB] text-white font-bold flex items-center justify-center text-xs font-mono shadow-sm">1</span>
                <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Assessment details</h2>
                <p className="text-xs text-slate-500">Set the basics candidates will see.</p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Required fields marked *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-600">Assessment name *</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Developer Assessment"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#2563EB] font-sans"
                />
                <span className="text-[10px] font-mono text-slate-400">Saved to the backend with this assessment.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-600">Target role *</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#2563EB] font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-600">Time limit *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Duration in minutes"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#2563EB] font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-600">Recruitment drive</label>
                <input
                  type="text"
                  placeholder="e.g. October engineering hiring drive"
                  value={recruitmentDrive}
                  onChange={(e) => setRecruitmentDrive(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#2563EB] font-sans"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#2563EB] text-white font-bold flex items-center justify-center text-xs font-mono shadow-sm">2</span>
                <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Questions</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Template preview only</span>
            </div>

            <p className="text-xs text-slate-600">Preview only: the sample questions shown below are not yet connected to saved Question records. The form currently saves the assessment as a draft without these questions.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-1">
              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0F172A]">Multiple choice</span>
                  <span className="text-[10px] font-mono text-slate-500">4 questions · 20 points</span>
                </div>
                <span className="text-[10px] font-mono text-[#2563EB] bg-blue-100 px-2 py-1 rounded">Included</span>
              </div>

              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0F172A]">Spoken response</span>
                  <span className="text-[10px] font-mono text-slate-500">1 prompt · 10 points</span>
                </div>
                <span className="text-[10px] font-mono text-[#2563EB] bg-blue-100 px-2 py-1 rounded">Included</span>
              </div>

              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0F172A]">Coding challenge</span>
                  <span className="text-[10px] font-mono text-slate-500">1 task · 20 points</span>
                </div>
                <span className="text-[10px] font-mono text-[#2563EB] bg-blue-100 px-2 py-1 rounded">Included</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Assessment questions</span>
              <span className="text-[10px] font-mono text-slate-400">Review or adjust before inviting candidates</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">01</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0F172A]">Which statement best describes REST APIs and the GET and POST methods?</span>
                    <span className="text-[10px] font-mono text-slate-500">Multiple choice · 4 options · 5 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-600">5 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-400 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">02</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0F172A]">Which statement best describes asynchronous JavaScript?</span>
                    <span className="text-[10px] font-mono text-slate-500">Multiple choice · 4 options · 5 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-600">5 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-400 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">03</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0F172A]">Which approach uses event delegation to handle clicks on child elements?</span>
                    <span className="text-[10px] font-mono text-slate-500">Multiple choice · 4 options · 5 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-600">5 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-400 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">04</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0F172A]">Which metric is part of Core Web Vitals?</span>
                    <span className="text-[10px] font-mono text-slate-500">Multiple choice · 4 options · 5 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-600">5 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-400 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">05</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0F172A]">Explain the difference between synchronous and asynchronous JavaScript.</span>
                    <span className="text-[10px] font-mono text-slate-500">Spoken response · 2 min max · 10 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-600">10 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-400 cursor-pointer"></i>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">06</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0F172A]">Reverse a string and consider the algorithm's runtime complexity.</span>
                    <span className="text-[10px] font-mono text-slate-500">Coding challenge · In-browser editor · 20 pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-600">20 pts</span>
                  <i className="fa-solid fa-ellipsis text-xs text-slate-400 cursor-pointer"></i>
                </div>
              </div>

              <button className="w-full py-2.5 bg-white hover:bg-blue-50 border border-dashed border-blue-200 rounded-xl text-xs font-mono text-slate-600 hover:text-[#0F172A] transition-colors cursor-pointer text-center">
                + Add a question
              </button>
            </div>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#2563EB] text-white font-bold flex items-center justify-center text-xs font-mono shadow-sm">3</span>
                <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Invite candidates</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{candidatesList.length} candidates</span>
            </div>
            <p className="text-xs text-slate-600">Email addresses are currently a local draft list; invitation delivery is not yet connected to the backend.</p>
            <form onSubmit={handleAddCandidate} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="email"
                placeholder="Candidate email address"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] font-sans"
              />
              <div className="flex items-center gap-2">
                <button type="submit" className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#2563EB] px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer">
                  + Add candidate
                </button>
                <button type="button" className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer shadow-sm">
                  Upload CSV
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {candidatesList.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-mono">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {email.substring(0, 2).toUpperCase()}
                  </span>
                  <span className="text-slate-700">{email}</span>
                  <button type="button" onClick={() => removeCandidate(idx)} className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer bg-transparent border-none">×</button>
                </div>
              ))}
            </div>
            <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-[#2563EB] text-xs">
                  <i className="fa-solid fa-shield"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0F172A]">Standard assessment safeguards</span>
                  <span className="text-[10px] font-mono text-slate-500">Camera check and focus monitoring are enabled.</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#2563EB] font-semibold">On by default</span>
            </div>
          </div>

          {errorMessage && (
            <div className="text-xs text-red-600 font-mono text-center">
              {errorMessage}
            </div>
          )}

          <div className="pt-6 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="text-[#2563EB] font-bold">Ready to save draft</span>
              <span>·</span>
              <span>{assessmentName}</span>
              <span>·</span>
              <span>0 saved questions</span>
              <span>·</span>
              <span>{candidatesList.length} candidates</span>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={handlePublishAssessment} disabled={loading} className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#2563EB] px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer disabled:opacity-50">
                Save draft
              </button>
              <button
                type="button"
                onClick={handlePublishAssessment}
                disabled={loading}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 border-none"
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
              <span className="hover:text-[#0F172A] cursor-pointer">Candidate privacy</span>
              <span>·</span>
              <span className="hover:text-[#0F172A] cursor-pointer">Help</span>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}

export default CreateAssessment;