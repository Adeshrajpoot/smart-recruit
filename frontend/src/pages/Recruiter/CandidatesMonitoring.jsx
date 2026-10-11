import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function CandidatesMonitoring() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [progressFilter, setProgressFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Latest activity");
  const [candidatesList, setCandidatesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [recruiterName] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").name || "Recruiter"; }
    catch { return "Recruiter"; }
  });

  useEffect(() => {
    let active = true;
    let firstLoad = true;
    async function fetchCandidates() {
      if (firstLoad && active) setLoading(true);
      try {
        const data = await api("/api/recruiter/candidates");
        if (!active) return;
        setCandidatesList(Array.isArray(data.candidates) ? data.candidates : []);
        setLoadError("");
      } catch (error) {
        if (active) setLoadError(error.message || "Could not load candidates from the backend.");
      } finally {
        firstLoad = false;
        if (active) setLoading(false);
      }
    }
    fetchCandidates();
    const intervalId = setInterval(fetchCandidates, 15000);
    return () => { active = false; clearInterval(intervalId); };
  }, []);

  const filteredCandidates = candidatesList.filter((candidate) => {
    const matchesSearch = (candidate.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (candidate.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || candidate.status === statusFilter;
    const numericPercentage = parseInt(candidate.percentage, 10) || 0;
    const matchesProgress = progressFilter === "All" || 
                            (progressFilter === "50%" && numericPercentage >= 50) || 
                            (progressFilter === "100%" && numericPercentage === 100);
    return matchesSearch && matchesStatus && matchesProgress;
  }).sort((a, b) => {
    if (sortOrder === "Name") return (a.name || "").localeCompare(b.name || "");
    if (sortOrder === "Score") return (b.overallScore ?? -1) - (a.overallScore ?? -1);
    return 0;
  });
  const startedCount = candidatesList.filter((candidate) => candidate.status !== "Invited").length;
  const inProgressCount = candidatesList.filter((candidate) => candidate.status === "In progress").length;
  const completedCount = candidatesList.filter((candidate) => candidate.status === "Completed").length;
  const participationRate = candidatesList.length ? Math.round((startedCount / candidatesList.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row selection:bg-[#2563EB] selection:text-white scroll-smooth font-sans">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-blue-100 bg-white p-6 flex flex-col justify-between md:sticky md:top-0 md:h-screen shrink-0">
        <div className="flex flex-col gap-8">
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
              className="flex items-center justify-between text-xs font-mono text-[#2563EB] bg-blue-50 border border-blue-200 py-2 px-3 rounded-lg font-bold text-left cursor-pointer border-none"
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-user text-xs"></i> Candidates
              </div>
              <span className="bg-[#2563EB] text-white font-bold px-1.5 py-0.2 rounded text-[10px]">{candidatesList.length}</span>          </button>
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

          <div className="flex flex-col p-3 bg-[#EFF6FF] border border-blue-100 rounded-xl gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Recruiter overview</span>
            <span className="text-xs font-bold text-[#0F172A]">All recruitment drives</span>
            <span className="text-[10px] font-mono text-slate-500">Candidate data linked to your account</span>

            <div className="flex justify-between items-center text-[11px] font-mono pt-2 border-t border-blue-100 mt-1">
              <span className="text-slate-500">{candidatesList.length} candidates</span>
              <span className="text-[#2563EB] font-bold">{inProgressCount} in progress</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-blue-100">
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#0F172A] font-semibold">Need a help?</span>
            <p className="text-[10px] text-slate-600 leading-tight">Get help managing candidates and assessment reviews.</p>
            <span className="text-[10px] font-mono text-[#2563EB] hover:underline cursor-pointer mt-1">Visit help center →</span>
          </div>

          <div className="p-3 bg-[#EFF6FF]/60 border border-blue-100 rounded-xl flex items-center justify-between">
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
        <header className="w-full border-b border-blue-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="hover:text-[#0F172A] cursor-pointer">Assessments</span>
            <span>›</span>
            <span className="hover:text-[#0F172A] cursor-pointer">All candidates</span>
            <span>›</span>
            <span className="text-[#0F172A] font-semibold">Candidates</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#EFF6FF] border border-blue-100 px-2.5 py-1 rounded-full text-xs font-mono">
              <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                {recruiterName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <span className="text-[#0F172A] font-medium">{recruiterName}</span>
            </div>
          </div>
        </header>
        <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Candidate activity</span>
              <h1 className="text-4xl sm:text-5xl text-[#0F172A] tracking-tight font-extrabold">Candidates & monitoring</h1>
              <p className="text-xs text-slate-600">See who's working, who's finished, and where each candidate is in the assessment.</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-2 shadow-sm">
                <i className="fa-solid fa-sliders text-xs"></i> Assessment settings
              </button>
              <button onClick={() => navigate("/recruiter/assessments/create")} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-500/20 border-none">
                <i className="fa-solid fa-plus text-xs"></i> Add candidates
              </button>
            </div>
          </div>
          <div className="p-3 bg-white border border-blue-100 rounded-xl flex items-center gap-2 text-xs font-mono shadow-sm">
            <span className="text-[#0F172A] font-bold">Candidate activity across your recruitment drives</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">Loaded from the backend</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-blue-100 rounded-2xl flex flex-col justify-between gap-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Total candidates</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-xs">
                  <i className="fa-solid fa-users"></i>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0F172A] font-mono">{candidatesList.length}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Across all cohorts</span>
            </div>

            <div className="p-5 bg-white border border-blue-100 rounded-2xl flex flex-col justify-between gap-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Started</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-xs">
                  <i className="fa-solid fa-play"></i>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0F172A] font-mono">{startedCount}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{participationRate}% participation</span>
            </div>

            <div className="p-5 bg-white border border-blue-100 rounded-2xl flex flex-col justify-between gap-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">In progress</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-xs">
                  <i className="fa-regular fa-clock"></i>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0F172A] font-mono">{inProgressCount}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Currently active</span>
            </div>

            <div className="p-5 bg-white border border-blue-100 rounded-2xl flex flex-col justify-between gap-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Completed</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-xs">
                  <i className="fa-solid fa-check"></i>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0F172A] font-mono">{completedCount}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Ready for scorecard review</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
                <span className="text-[#0F172A] font-semibold">BACKEND ACTIVITY</span>
                <span>· Candidate activity updates automatically</span>
              </div>
              <span>Auto-refreshes every 15 seconds</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
              <div className="lg:col-span-2 relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-400"></i>
                <input
                  type="text"
                  placeholder="Search candidates by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] font-sans"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#2563EB] font-mono cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  <option value="In progress">In progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Invited">Invited</option>
                </select>
              </div>

              <div>
                <select
                  value={progressFilter}
                  onChange={(e) => setProgressFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#2563EB] font-mono cursor-pointer"
                >
                  <option value="All">Progress: All</option>
                  <option value="50%">&gt;= 50%</option>
                  <option value="100%">100%</option>
                </select>
              </div>

              <div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#2563EB] font-mono cursor-pointer"
                >
                  <option value="Latest activity">Sort: Latest activity</option>
                  <option value="Name">Sort: Name</option>
                  <option value="Score">Sort: Score</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
            {loadError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm" role="alert">{loadError}</div>}
            {loading && <p className="mb-4 text-sm font-mono text-slate-500 p-4">Loading candidates from backend…</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-blue-100 text-[10px] font-mono text-[#2563EB] uppercase tracking-wider bg-blue-50/50">
                    <th className="py-3 px-4 font-bold">Candidate</th>
                    <th className="py-3 px-4 font-bold">Email</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Progress</th>
                    <th className="py-3 px-4 font-bold">Last activity</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100 text-xs">
                  {filteredCandidates.map((candidate, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg ${index % 2 === 0 ? "bg-blue-100 text-[#2563EB]" : "bg-slate-200 text-slate-700"} flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm`}>
                            {candidate.initials || (candidate.name ? candidate.name.substring(0, 2).toUpperCase() : "CN")}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-[#0F172A] truncate">{candidate.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 truncate">{candidate.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {candidate.email}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${candidate.status === "Completed" ? "bg-[#2563EB]" : "bg-blue-400 animate-pulse"}`}></span>
                          <span className="text-slate-700">{candidate.status}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex flex-col gap-1 w-36">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>{candidate.tasksCompleted || "0 / 6 tasks"}</span>
                            <span>{candidate.percentage || "0%"}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#2563EB] h-full rounded-full" style={{ width: candidate.progressWidth || candidate.percentage || "0%" }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {candidate.lastActivity || "No activity yet"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (!candidate.attemptId) return;
                            sessionStorage.setItem("currentAttemptId", candidate.attemptId);
                            sessionStorage.setItem("currentCandidateId", candidate.attemptId);
                            navigate(`/recruiter/candidates/${candidate.attemptId}/review`);
                          }}
                          disabled={!candidate.attemptId}
                          className="text-xs font-mono text-[#2563EB] hover:underline cursor-pointer disabled:text-slate-400 disabled:cursor-not-allowed bg-transparent border-none"
                        >
                          {candidate.attemptId ? "View scorecard →" : "Not started"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-500 font-mono text-xs">
                        No candidates found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
              <span>Showing 1-{filteredCandidates.length} of {candidatesList.length} candidates</span>
            </div>
          </div>

          <footer className="pt-6 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div>
              <span>SmartRecruit · Recruiter workspace</span>
            </div>
            <div className="flex gap-4">
              <span>Candidate activity is logged for assessment review.</span>
              <span className="hover:text-[#0F172A] cursor-pointer">Security · Candidate privacy · Help</span>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}

export default CandidatesMonitoring;