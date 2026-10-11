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
    <div className="min-h-screen bg-[#0e1915] text-[#e4e8e3] flex flex-col md:flex-row selection:bg-[#83b58a] selection:text-[#15231d] scroll-smooth font-sans">
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
              className="flex items-center justify-between text-xs font-mono text-white bg-emerald-950/60 border border-emerald-900/50 py-2 px-3 rounded-lg font-bold text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-user text-xs"></i> Candidates
              </div>
              <span className="bg-[#10B981] text-black font-bold px-1.5 py-0.2 rounded text-[10px]">{candidatesList.length}</span>           </button>
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

          <div className="flex flex-col p-3 bg-[#03261a]/60 border border-emerald-900/40 rounded-xl gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Recruiter overview</span>
            <span className="text-xs font-bold text-white">All recruitment drives</span>
            <span className="text-[10px] font-mono text-slate-400">Candidate data linked to your account</span>

            <div className="flex justify-between items-center text-[11px] font-mono pt-2 border-t border-emerald-900/40 mt-1">
              <span className="text-slate-400">{candidatesList.length} candidates</span>
              <span className="text-[#10B981] font-bold">{inProgressCount} in progress</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-emerald-950">
          <div className="p-3 bg-[#03261a]/30 border border-emerald-900/30 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono text-white font-semibold">Need a help?</span>
            <p className="text-[10px] text-slate-400 leading-tight">Get help managing candidates and assessment reviews.</p>
            <span className="text-[10px] font-mono text-[#10B981] hover:underline cursor-pointer mt-1">Visit help center →</span>
          </div>

          <div className="p-3 bg-[#03261a]/40 border border-emerald-900/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
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

      <main className="flex-1 flex flex-col min-w-0 bg-[#0e1915]">
        <header className="w-full border-b border-[#26352e] bg-[#0e1915]/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#a4aea8]">
            <span className="hover:text-white cursor-pointer">Assessments</span>
            <span>›</span>
            <span className="hover:text-white cursor-pointer">All candidates</span>
            <span>›</span>
            <span className="text-white">Candidates</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1b2a24] border border-[#2b3b33] px-2.5 py-1 rounded-full text-xs font-mono">
              <div className="w-5 h-5 rounded-full bg-[#30483c] text-[#dce5dd] flex items-center justify-center text-[10px] font-bold">
                {recruiterName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <span className="text-white">{recruiterName}</span>
            </div>
          </div>
        </header>
        <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Candidate activity</span>
              <h1 className="text-4xl sm:text-5xl text-white tracking-tight">Candidates & monitoring</h1>
              <p className="text-xs text-slate-400">See who's working, who's finished, and where each candidate is in the assessment.</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-[#202f28] hover:bg-[#293a31] border border-[#33443b] text-[#d3dbd5] px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-2">
                <i className="fa-solid fa-sliders text-xs"></i> Assessment settings
              </button>
              <button onClick={() => navigate("/recruiter/assessments/create")} className="bg-[#7fb887] hover:bg-[#8bc392] text-[#15231d] px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2">
                <i className="fa-solid fa-plus text-xs"></i> Add candidates
              </button>
            </div>
          </div>
          <div className="p-3 bg-[#02140e] border border-[#2b3b33] rounded-xl flex items-center gap-2 text-xs font-mono">
            <span className="text-[#dce4dd] font-bold">Candidate activity across your recruitment drives</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Loaded from the backend</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-[#02140e] border border-[#2b3b33] rounded-2xl flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Total candidates</span>
                <div className="w-7 h-7 rounded-lg bg-[#26372f] border border-[#34443c] flex items-center justify-center text-[#a4aea8] text-xs">
                  <i className="fa-solid fa-users"></i>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-mono">{candidatesList.length}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Across all cohorts</span>
            </div>

            <div className="p-5 bg-[#02140e] border border-[#2b3b33] rounded-2xl flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Started</span>
                <div className="w-7 h-7 rounded-lg bg-[#26372f] border border-[#34443c] flex items-center justify-center text-[#a4aea8] text-xs">
                  <i className="fa-solid fa-play"></i>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-mono">{startedCount}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{participationRate}% participation</span>
            </div>

            <div className="p-5 bg-[#02140e] border border-[#2b3b33] rounded-2xl flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">In progress</span>
                <div className="w-7 h-7 rounded-lg bg-[#26372f] border border-[#34443c] flex items-center justify-center text-[#a4aea8] text-xs">
                  <i className="fa-regular fa-clock"></i>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-mono">{inProgressCount}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Currently active</span>
            </div>

            <div className="p-5 bg-[#02140e] border border-[#2b3b33] rounded-2xl flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Completed</span>
                <div className="w-7 h-7 rounded-lg bg-[#26372f] border border-[#34443c] flex items-center justify-center text-[#a3c2a7] text-xs">
                  <i className="fa-solid fa-check"></i>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-mono">{completedCount}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Ready for scorecard review</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8fbd98] animate-pulse"></span>
                <span className="text-white font-semibold">BACKEND ACTIVITY</span>
                <span>· Candidate activity updates automatically</span>
              </div>
              <span>Auto-refreshes every 15 seconds</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-[#02140e] border border-[#2b3b33] rounded-xl">
              <div className="lg:col-span-2 relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-500"></i>
                <input
                  type="text"
                  placeholder="Search candidates by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#202f28] border border-[#34483d] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#d3dbd5] placeholder-[#89978f] focus:outline-none focus:border-[#78ad84] font-sans"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#202f28] border border-[#34483d] rounded-lg px-3 py-1.5 text-xs text-[#c3cdc6] focus:outline-none focus:border-[#78ad84] font-mono cursor-pointer"
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
                  className="w-full bg-[#202f28] border border-[#34483d] rounded-lg px-3 py-1.5 text-xs text-[#c3cdc6] focus:outline-none focus:border-[#78ad84] font-mono cursor-pointer"
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
                  className="w-full bg-[#202f28] border border-[#34483d] rounded-lg px-3 py-1.5 text-xs text-[#c3cdc6] focus:outline-none focus:border-[#78ad84] font-mono cursor-pointer"
                >
                  <option value="Latest activity">Sort: Latest activity</option>
                  <option value="Name">Sort: Name</option>
                  <option value="Score">Sort: Score</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#02140e] border border-[#2b3b33] rounded-2xl overflow-hidden">
            {loadError && <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200" role="alert">{loadError}</div>}
            {loading && <p className="mb-4 text-sm font-mono text-slate-400">Loading candidates from backend…</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2a3932] text-[10px] font-mono text-[#94a199] uppercase tracking-wider bg-[#02140e]">
                    <th className="py-3 px-4 font-medium">Candidate</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Progress</th>
                    <th className="py-3 px-4 font-medium">Last activity</th>
                    <th className="py-3 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3932] text-xs">
                  {filteredCandidates.map((candidate, index) => (
                    <tr key={index} className="hover:bg-[#202f28] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg ${index % 2 === 0 ? "bg-[#30483c]" : "bg-[#303e4d]"} text-[#dce5dd] flex items-center justify-center font-mono font-bold text-xs shrink-0`}>
                            {candidate.initials || (candidate.name ? candidate.name.substring(0, 2).toUpperCase() : "CN")}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white truncate">{candidate.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 truncate">{candidate.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {candidate.email}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${candidate.status === "Completed" ? "bg-[#a8c5ad]" : "bg-[#8fb69a] animate-pulse"}`}></span>
                          <span className="text-slate-300">{candidate.status}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex flex-col gap-1 w-36">
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>{candidate.tasksCompleted || "0 / 6 tasks"}</span>
                            <span>{candidate.percentage || "0%"}</span>
                          </div>
                          <div className="w-full bg-[#34443b] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#a2c4a9] h-full rounded-full" style={{ width: candidate.progressWidth || candidate.percentage || "0%" }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
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
                          className="text-xs font-mono text-[#a3c1a8] hover:underline cursor-pointer disabled:text-slate-600 disabled:cursor-not-allowed"
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

            <div className="p-4 border-t border-[#2a3932] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#a4aea8]">
              <span>Showing 1-{filteredCandidates.length} of {candidatesList.length} candidates</span>

            </div>
          </div>

          <footer className="pt-6 border-t border-[#26352e] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#89978f]">
            <div>
              <span>SmartRecruit · Recruiter workspace</span>
            </div>
            <div className="flex gap-4">
              <span>Candidate activity is logged for assessment review.</span>
              <span className="hover:text-white cursor-pointer">Security · Candidate privacy · Help</span>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
export default CandidatesMonitoring;