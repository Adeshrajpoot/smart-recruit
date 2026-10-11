import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterProfile from "../Candidate/Recruiter.jpeg";
import { api } from "../../services/api";
function RecruiterDashboard() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [recruiterName, setRecruiterName] = useState("Your Name");
    const [stats, setStats] = useState({
        activeAssessments: 0,
        totalCandidates: 0,
        inProgress: 0,
        readyForReview: 0
    });
    const [activeAssessmentsList, setActiveAssessmentsList] = useState([]);
    const [recentActivityList, setRecentActivityList] = useState([]);
    const [dashboardError, setDashboardError] = useState("");

    useEffect(() => {
        let active = true;
        async function fetchDashboardData() {
            try {
                const data = await api("/api/recruiter/dashboard");
                if (!active) return;
                if (data.recruiter?.name) setRecruiterName(data.recruiter.name);
                if (data.stats) setStats(data.stats);
                setActiveAssessmentsList(Array.isArray(data.activeAssessmentsList) ? data.activeAssessmentsList : []);
                setRecentActivityList(Array.isArray(data.recentActivityList) ? data.recentActivityList : []);
                setDashboardError("");
            } catch (error) {
                if (active) setDashboardError(error.message || "Could not load dashboard data from the backend.");
            }
        }
        fetchDashboardData();
        const intervalId = setInterval(fetchDashboardData, 15000);
        return () => { active = false; clearInterval(intervalId); };
    }, []);

    return (
        <div className="min-h-screen bg-[#021810] text-white flex flex-col md:flex-row selection:bg-[#10B981] selection:text-white scroll-smooth font-sans">
            <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-emerald-950 bg-[#02140e] p-6 flex flex-col justify-between md:sticky md:top-0 md:h-screen shrink-0">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/recruiter/dashboard")}>
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
                    <div className="flex flex-col items-center p-4 bg-[#03261a]/40 border border-emerald-900/40 rounded-2xl gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#E2E8F0] border-2 border-emerald-700 overflow-hidden flex items-center justify-center relative shadow-inner">
                            <img
                                src={RecruiterProfile}
                                alt="Recruiter profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-[#0f1715]">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-200 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                {recruiterName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-white truncate">{recruiterName}</span>
                                <span className="text-[10px] font-mono text-slate-400 truncate">Lead technical recruiter</span>
                            </div>
                        </div>
                        <button className="text-slate-400 hover:text-white cursor-pointer px-1">
                            <i className="fa-solid fa-ellipsis text-xs"></i>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 bg-[#021810]/40 border border-[#021810] rounded-2xl p-3.5">
                        <span className="text-[15px] font-mono text-white uppercase tracking-widest mb-1">
                            Workspace
                        </span>
                        <button
                            className="flex items-center gap-3 text-xs font-mono text-[white] bg-emerald-950/60 border border-emerald-900/50 py-2.5 px-3 rounded-xl font-bold text-left cursor-pointer"
                        >
                            <i className="fa-solid fa-chart-pie text-xs"></i> Dashboard
                        </button>
                        <button
                            onClick={() => navigate("/recruiter/candidates")}
                            className="flex items-center justify-between text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-xl hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-user text-xs"></i> Candidates
                            </div>
                            <span className="bg-[#10B981] text-black font-bold px-1.5 py-0.2 rounded text-[10px]">{stats.totalCandidates}</span>
                        </button>
                        <button
                            onClick={() => navigate("/recruiter/assessments/create")}
                            className="flex items-center gap-3 text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-xl hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
                        >
                            <i className="fa-solid fa-file-lines text-xs"></i> Assessments
                        </button>
                        <button
                            className="flex items-center gap-3 text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-xl hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
                        >
                            <i className="fa-solid fa-code text-xs"></i> Open roles
                        </button>
                        <button
                            className="flex items-center gap-3 text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-xl hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
                        >
                            <i className="fa-solid fa-chart-bar text-xs"></i> Reports
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/recruiter/login");}}
                    className="flex items-center gap-3 text-xs font-mono text-red-400 hover:text-white py-2.5 px-3 rounded-xl hover:bg-red-950/40 transition-colors text-left cursor-pointer"
                >
                    <i className="fa-solid fa-right-from-bracket text-xs"></i> Log out
                </button>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-[#021c13]">
                {dashboardError && <div className="mx-6 mt-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200" role="alert">{dashboardError}</div>}

                <header className="w-full border-b border-emerald-950 bg-[#021810]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-white">
                        <span>Recruiter workspace</span>
                        <span>·</span>
                        <span className="text-white font-semibold">Dashboard</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <i className="fa-solid fa-magnifying-glass absolute right-3 top-2.5 text-xs text-white"></i>
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#043122] border border-emerald-900/50 rounded-full pl-3 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-700 font-sans w-44"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[12px] font-mono text-white uppercase tracking-widest">Hiring overview</span>
                            <h1 className="text-3xl sm:text-4xl  text-white tracking-tight">Good morning, {recruiterName}.</h1>
                            <p className="text-xs text-slate-400">Here's what's happening across your assessments today.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate("/recruiter/candidates")} className="bg-[#043122] hover:bg-emerald-900/60 border border-emerald-900/50 text-slate-200 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-2 shadow-sm">
                                + Invite candidate
                            </button>
                            <button
                                onClick={() => navigate("/recruiter/assessments/create")}
                                className="bg-[#10B981] hover:bg-emerald-600 text-black px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-900/30"
                            >
                                + Create assessment
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 bg-[#010705]/30 border border-emerald-900/30 rounded-2xl flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-[#D1D5DB] uppercase tracking-widest">Active assessments</span>
                                <div className="text-slate-400 text-xs">
                                    <i className="fa-solid fa-file-lines"></i>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-3xl font-bold text-white font-mono">{stats.activeAssessments}</span>
                            </div>
                        </div>

                        <div className="p-5 bg-[#010705]/30 border border-emerald-900/30 rounded-2xl flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-[#D1D5DB] uppercase tracking-widest">Total candidates</span>
                                <div className="text-slate-400 text-xs">
                                    <i className="fa-solid fa-users"></i>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-3xl font-bold text-white font-mono">{stats.totalCandidates}<span className="text-[11px] font-mono text-[#D1D5DB]">  Across all roles</span></span>
                            </div>
                        </div>

                        <div className="p-5 bg-[#010705]/30 border border-emerald-900/30 rounded-2xl flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-[#D1D5DB] uppercase tracking-widest">In progress</span>
                                <div className="text-slate-400 text-xs">
                                    <i className="fa-regular fa-clock"></i>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-3xl font-bold text-white font-mono">{stats.inProgress}<span className="text-[11px] font-mono text-[#D1D5DB]">  Currently taking assessments</span></span>
                            </div>
                        </div>

                        <div className="p-5 bg-[#010705]/30 border border-emerald-900/30 rounded-2xl flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-[#D1D5DB] uppercase tracking-widest">Ready for review</span>
                                <div className="text-[#D1D5DB] text-xs">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-3xl font-bold text-white font-mono">{stats.readyForReview}<span className="text-[11px] font-mono text-[#D1D5DB]">  Completed assessments</span></span>

                            </div>
                        </div>

                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-[#010705]/30 border border-emerald-900/30 rounded-2xl p-6 flex flex-col justify-between">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-bold text-white">Active assessments</h2>
                                        <span className="text-[11px] font-mono text-slate-500">Current assessments accepting candidate submissions</span>
                                    </div>
                                    <span className="text-xs font-mono text-[white] hover:underline cursor-pointer">View all <i className="fa-solid fa-arrow-right"></i></span>
                                </div>

                                <div className="grid grid-cols-12 text-[10px] font-mono text-[#D1D5DB] uppercase tracking-widest py-1 border-b border-emerald-950/50">
                                    <span className="col-span-5">Assessment</span>
                                    <span className="col-span-3">Type</span>
                                    <span className="col-span-2">Candidates</span>
                                    <span className="col-span-2 text-right">Status</span>
                                </div>

                                <div className="flex flex-col divide-y divide-emerald-950/60">
                                    {activeAssessmentsList.length === 0 && <p className="py-6 text-center text-xs font-mono text-slate-500">No assessments have been saved for this recruiter yet.</p>}
                                    {activeAssessmentsList.filter((item) => `${item.name} ${item.details}`.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 items-center py-3.5 hover:bg-[#03261a]/50 transition-colors px-1 rounded-xl">
                                            <div className="col-span-5 flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-900/50 flex items-center justify-center text-[#10B981] text-xs shrink-0">
                                                    <i className="fa-solid fa-code"></i>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-white text-xs truncate">{item.name}</span>
                                                    <span className="text-[10px] font-mono text-slate-400 truncate">{item.details}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-3 font-mono text-xs text-slate-300">
                                                {item.type}
                                            </div>
                                            <div className="col-span-2 font-mono text-xs font-bold text-white">
                                                {item.candidates}
                                            </div>
                                            <div className="col-span-2 flex items-center justify-end gap-3 font-mono text-xs">
                                                <div className="flex items-center gap-1.5 border border-slate-700/50 bg-[#032015] rounded-xl px-3 py-1.5 shadow-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[grey]"></span>
                                                    <span className="text-slate-300">{item.status}</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate("/recruiter/candidates")}
                                                    className="text-slate-300 hover:underline cursor-pointer ml-2"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 mt-4 border-t border-emerald-950 text-[11px] font-mono text-slate-500">
                                <span>{activeAssessmentsList.length} assessments in workspace</span>
                                <span>Updated a few minutes ago</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="bg-[#010705]/30 border border-emerald-900/30 rounded-2xl p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-bold text-white">Recent activity</h3>
                                        <span className="text-[10px] font-mono text-slate-400">Latest candidate updates</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-[white] hover:underline cursor-pointer">See all</span>
                                </div>

                                <div className="flex flex-col gap-3.5">
                                    {recentActivityList.length === 0 && <p className="py-4 text-xs font-mono text-slate-500">No candidate activity is recorded yet.</p>}
                                    {recentActivityList.map((act, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-900/50 flex items-center justify-center text-xs shrink-0 mt-0.5">
                                                <i className={act.icon}></i>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-xs text-slate-200 leading-snug">{act.text}</p>
                                                <span className="text-[10px] font-mono text-slate-500">{act.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#010705]/30 border border-emerald-900/30 rounded-2xl p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                                    <div className="flex flex-col">
                                        <h3 className="text-2xl text-white">Review queue</h3>
                                        <span className="text-[10px] font-mono text-slate-400">Based on saved assessment attempts</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-900/50">
                                        <span className="text-[10px] font-mono text-slate-300">{stats.readyForReview} ready</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-3xl font-bold text-white font-mono">{stats.readyForReview}</p>
                                    <p className="text-xs text-slate-400">Submitted or evaluated attempts available for recruiter review.</p>
                                    <button onClick={() => navigate("/recruiter/candidates")} className="self-start mt-2 text-xs font-mono text-[#10B981] hover:underline">Review candidates →</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="pt-6 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
                        <div>
                            <span>SmartRecruit · Recruiter workspace</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="hover:text-white cursor-pointer">Security</span>
                            <span>·</span>
                            <span className="hover:text-white cursor-pointer">Candidate privacy</span>
                            <span>·</span>
                            <span className="hover:text-white cursor-pointer">Help</span>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}
export default RecruiterDashboard;