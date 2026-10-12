import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function CandidateAssessmentResults() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultsData, setResultsData] = useState({
    candidateName: "Priya Tiwari",
    assessmentTitle: "Technical Evaluation",
    status: "Completed",
    overallScore: 80,
    passingThreshold: 70,
    correctCount: 16,
    totalQuestions: 20,
    incorrectCount: 4,
    statusMessage: "Results Released",
    verificationStatus: "Verified & Released",
    syncStatus: "Evaluation finalized and synced with talent pool",
    questions: [],
    roleMatches: []
  });

  const [filterTab, setFilterTab] = useState("all");
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    let active = true;
    async function fetchResults() {
      try {
        setLoading(true);
        const data = await api("/api/candidate/results");
        if (!active) return;
        if (data && data.results) {
          setResultsData(data.results);
        }
        setError("");
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load assessment results from the backend.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchResults();
    return () => { active = false; };
  }, []);

  const toggleQuestionExpansion = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredQuestions = (resultsData.questions || []).filter((q) => {
    if (filterTab === "correct") return q.isCorrect;
    if (filterTab === "incorrect") return !q.isCorrect;
    return true;
  });

  const correctCount = (resultsData.questions || []).filter((q) => q.isCorrect).length || resultsData.correctCount;
  const incorrectCount = (resultsData.questions || []).filter((q) => !q.isCorrect).length || resultsData.incorrectCount;
  const totalQ = resultsData.questions?.length || resultsData.totalQuestions || 20;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between font-sans selection:bg-[#2563EB] selection:text-white">
      <header className="bg-white border-b border-blue-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-[#2563EB] rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20">
              S
            </div>
            <span className="font-bold text-sm tracking-tight text-[#0F172A]">SmartRecruit</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600">
            <button onClick={() => navigate("/")} className="hover:text-[#2563EB] cursor-pointer bg-transparent border-none">Dashboard</button>
            <button onClick={() => navigate("/candidate/assessments")} className="hover:text-[#2563EB] cursor-pointer bg-transparent border-none">My Assessments</button>
            <button onClick={() => navigate("/candidate/insights")} className="text-[#2563EB] font-semibold cursor-pointer bg-transparent border-none">Career Insights</button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-slate-500 hover:text-[#0F172A] cursor-pointer bg-transparent border-none relative">
            <i className="fa-regular fa-bell text-sm"></i>
          </button>
          <div className="flex items-center space-x-2.5 bg-[#EFF6FF] border border-blue-100 pl-2 pr-3 py-1 rounded-xl">
            <div className="w-7 h-7 bg-[#2563EB] text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
              {resultsData.candidateName ? resultsData.candidateName.substring(0, 2).toUpperCase() : "PT"}
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-[#0F172A] block leading-tight">{resultsData.candidateName}</span>
              <span className="text-[9px] text-slate-500 block leading-tight uppercase">Candidate</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8 flex-grow">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 shadow-sm" role="alert">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse"></span>
              {resultsData.assessmentTitle} · {resultsData.status}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Your Assessment Results
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Review your performance, learn from technical rationales, and explore tailored potential career opportunities based on verified competence.
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="self-start md:self-auto bg-white hover:bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-download text-xs"></i> Download PDF Summary
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-blue-100 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Overall Score</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-xs">
                <i className="fa-solid fa-chart-pie"></i>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#0F172A] font-mono">{resultsData.overallScore}</span>
                <span className="text-sm font-bold text-slate-400">%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${resultsData.overallScore}%` }}></div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Passing threshold: {resultsData.passingThreshold}% · Exceeds benchmark</span>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Correct Answers</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-xs">
                <i className="fa-solid fa-check"></i>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#0F172A] font-mono">{correctCount}</span>
                <span className="text-sm font-bold text-slate-400">/ {totalQ}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${(correctCount / totalQ) * 100}%` }}></div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Strong core technical foundation</span>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Incorrect Answers</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-xs">
                <i className="fa-solid fa-xmark"></i>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#0F172A] font-mono">{incorrectCount}</span>
                <span className="text-sm font-bold text-slate-400">/ {totalQ}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(incorrectCount / totalQ) * 100}%` }}></div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Identified areas for targeted review</span>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Assessment Status</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-xs">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
            </div>
            <div>
              <span className="text-lg font-bold text-[#0F172A] block">{resultsData.statusMessage}</span>
              <span className="text-xs font-mono text-[#2563EB] font-semibold mt-1 block">✓ {resultsData.verificationStatus}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 truncate">{resultsData.syncStatus}</span>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">Review Your Answers</h2>
              <p className="text-xs text-slate-500 mt-0.5">Detailed breakdown of questions, your submitted responses, and verified rationales.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-mono">
              <button 
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border-none ${filterTab === "all" ? "bg-white text-[#2563EB] shadow-sm font-bold" : "text-slate-600 bg-transparent"}`}
              >
                All Questions ({totalQ})
              </button>
              <button 
                onClick={() => setFilterTab("correct")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border-none ${filterTab === "correct" ? "bg-white text-[#2563EB] shadow-sm font-bold" : "text-slate-600 bg-transparent"}`}
              >
                Correct ({correctCount})
              </button>
              <button 
                onClick={() => setFilterTab("incorrect")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border-none ${filterTab === "incorrect" ? "bg-white text-[#2563EB] shadow-sm font-bold" : "text-slate-600 bg-transparent"}`}
              >
                Incorrect ({incorrectCount})
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {loading && <p className="text-xs font-mono text-slate-500 py-4 text-center">Loading answers breakdown...</p>}
            {!loading && filteredQuestions.length === 0 && (
              <p className="text-xs font-mono text-slate-500 py-6 text-center">No questions match the selected filter.</p>
            )}
            {filteredQuestions.map((q, idx) => {
              const isExpanded = Boolean(expandedQuestions[idx]);
              return (
                <div key={idx} className="border border-blue-100 rounded-xl bg-slate-50 overflow-hidden transition-all">
                  <div 
                    onClick={() => toggleQuestionExpansion(idx)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400 pt-0.5 sm:pt-0">Q{String(idx + 1).padStart(2, "0")}</span>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-bold text-[#0F172A]">{q.questionText}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 font-mono">Your Answer: <strong className="text-slate-700">{q.candidateAnswer}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        q.isCorrect 
                          ? "bg-blue-50 text-[#2563EB] border-blue-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {q.isCorrect ? "✓ Correct" : "× Incorrect"}
                      </span>
                      <span className="text-xs font-mono text-slate-400">View Answer {isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-white border-t border-blue-100 flex flex-col gap-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Submitted Answer</span>
                          <span className="font-semibold text-slate-800">{q.candidateAnswer}</span>
                        </div>
                        <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                          <span className="font-mono text-[10px] text-[#2563EB] uppercase tracking-wider block mb-1">Correct Reference Answer</span>
                          <span className="font-semibold text-[#0F172A]">{q.correctAnswer}</span>
                        </div>
                      </div>
                      {q.explanation && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Technical Explanation</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#2563EB] font-bold uppercase tracking-wider">
              <i className="fa-solid fa-bullseye"></i> Opportunities Alignment
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight mt-1">Potential Role Matches</h2>
            <p className="text-xs sm:text-sm text-slate-600">Explore roles that may align with your profile and assessment performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(resultsData.roleMatches || []).map((role, idx) => (
              <div key={idx} className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-sm hover:border-blue-300 transition-all">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-xs">
                      <i className="fa-solid fa-code"></i>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200">
                      {role.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">{role.title}</h3>
                    <span className="text-[11px] font-mono text-slate-500 block">{role.department}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{role.description}</p>
                </div>

                <div className="pt-4 border-t border-blue-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">{role.meta}</span>
                  <button onClick={() => navigate("/candidate/insights")} className="text-[#2563EB] font-bold hover:underline cursor-pointer bg-transparent border-none">
                    Explore Role →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xs shrink-0 font-bold">
              i
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Your results are private to your account and authorized enterprise hiring reviewers. Role suggestions are indicative indicators and should be evaluated alongside your portfolio, verified practical experience, and career trajectory goals.
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="shrink-0 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer border-none"
          >
            Download Result Summary
          </button>
        </div>
      </main>

      <footer className="bg-white border-t border-blue-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <span>©️ 2026 SmartRecruit Inc. All candidate rights reserved.</span>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <span className="hover:text-[#0F172A] cursor-pointer">Privacy Policy</span>
          <span>·</span>
          <span className="hover:text-[#0F172A] cursor-pointer">Terms of Service</span>
          <span>·</span>
          <span className="hover:text-[#0F172A] cursor-pointer">Help Center</span>
        </div>
      </footer>
    </div>
  );
}

export default CandidateAssessmentResults;