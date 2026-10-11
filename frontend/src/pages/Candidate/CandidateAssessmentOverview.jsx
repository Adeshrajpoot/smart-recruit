import { useNavigate } from "react-router-dom";

function CandidateAssessmentOverview() {
  const navigate = useNavigate();

  function handleStartAssessment() {
    navigate("/candidate/assessment");
  }

  return (
    <div className="min-h-screen bg-[#060F0A] text-slate-100 flex font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-72 bg-[#09160E] border-r border-emerald-900/30 flex flex-col justify-between p-6 hidden lg:flex sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              S
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">SmartRecruit</h1>
              <p className="text-[10px] font-bold text-emerald-500/70 tracking-wider uppercase">EVALUATION PORTAL</p>
            </div>
          </div>

          {/* Your Assessment Section */}
          <div className="mb-8">
            <p className="text-[10px] font-bold text-emerald-500/60 tracking-wider uppercase mb-3">YOUR ASSESSMENT</p>
            <div className="bg-[#0D1D13] border border-emerald-900/40 rounded-xl p-3.5 flex items-center space-x-3">
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                YN
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">Your Name</p>
                <p className="text-xs text-slate-400">Candidate</p>
              </div>
            </div>
          </div>

          {/* Assessment Steps */}
          <div>
            <p className="text-[10px] font-bold text-emerald-500/60 tracking-wider uppercase mb-3">ASSESSMENT STEPS</p>
            <div className="space-y-2">
              <div 
                onClick={() => navigate("/candidate/instructions")}
                className="flex items-start space-x-3 p-2.5 rounded-xl cursor-pointer hover:bg-emerald-950/40 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#0D1D13] border border-emerald-900/40 text-slate-400 font-semibold text-xs flex items-center justify-center mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Instructions</p>
                  <p className="text-[11px] text-slate-500">Review before you begin</p>
                </div>
              </div>

              <div 
                onClick={() => navigate("/candidate/system-check")}
                className="flex items-start space-x-3 p-2.5 rounded-xl cursor-pointer hover:bg-emerald-950/40 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#0D1D13] border border-emerald-900/40 text-slate-400 font-semibold text-xs flex items-center justify-center mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Permission check</p>
                  <p className="text-[11px] text-slate-500">Make sure your setup is ready</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mt-0.5 shadow-sm shadow-emerald-500/30">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400">Assessment overview</p>
                  <p className="text-[11px] text-emerald-300/80">See what's included</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl opacity-60">
                <div className="w-6 h-6 rounded-full bg-[#0D1D13] border border-emerald-900/40 text-slate-400 font-semibold text-xs flex items-center justify-center mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Assessment</p>
                  <p className="text-[11px] text-slate-500">90 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Need Help Card */}
        <div className="bg-[#0D1D13] border border-emerald-900/40 rounded-xl p-4 mt-6">
          <p className="text-xs font-bold text-white mb-1">Need a help?</p>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Having trouble with a device? Check your settings or contact support before you start.
          </p>
          <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer">
            <span>Contact support</span>
            <span>→</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top Bar */}
        <header className="bg-[#09160E] border-b border-emerald-900/30 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="text-xs text-slate-400 font-medium">
            Candidate portal <span className="text-slate-600 mx-2">/</span> <span className="text-slate-200">Assessment overview</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5 bg-[#0D1D13] border border-emerald-950 px-3 py-1.5 rounded-lg">
              <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">👤</span>
              <span className="text-xs font-semibold text-white">YourName</span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="max-w-5xl w-full mx-auto px-8 py-8 flex-grow flex flex-col justify-center">

          {/* Heading Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                • STEP 3 OF 4 • OVERVIEW
              </span>
              <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
                Everything is ready. Review the assessment structure and sequence below before you launch your timed evaluation session.
              </p>
            </div>
          </div>

          {/* Verification Status Banner */}
          <div className="bg-[#0D1D13] border border-emerald-900/40 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-circle-check text-sm"></i>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">System setup verified</h4>
                <p className="text-slate-400 text-xs mt-0.5">Camera feed active and secure proctoring stream locked.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Ready to Launch</span>
            </span>
          </div>

          {/* Core Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            <div className="bg-[#0D1D13] border border-emerald-900/40 rounded-2xl p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-sm">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                <p className="text-sm font-bold text-white mt-0.5">90 Minutes</p>
              </div>
            </div>

            <div className="bg-[#0D1D13] border border-emerald-900/40 rounded-2xl p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-sm">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions</p>
                <p className="text-sm font-bold text-white mt-0.5">45 Questions</p>
              </div>
            </div>

            <div className="bg-[#0D1D13] border border-emerald-900/40 rounded-2xl p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-sm">
                <i className="fa-solid fa-code"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessment</p>
                <p className="text-sm font-bold text-white mt-0.5 truncate max-w-[120px]">Technical Screen</p>
              </div>
            </div>

          </div>

          {/* Assessment Modules Section */}
          <div className="bg-[#0D1D13] border border-emerald-900/40 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">What you'll be assessed on</h3>
            </div>

            <div className="space-y-3">

              <div className="bg-[#040A06] border border-emerald-950 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                    <i className="fa-solid fa-laptop-code"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Technical Knowledge</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Role-specific technical questions to evaluate your understanding of key concepts, state management, and modern browser standards.</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg whitespace-nowrap ml-4">
                  Multiple Choice & Concepts
                </span>
              </div>

              <div className="bg-[#040A06] border border-emerald-950 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                    <i className="fa-solid fa-desktop"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Coding Challenge</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Write, run and submit an algorithmic and UI component solution in a live sandboxed code runtime environment.</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg whitespace-nowrap ml-4">
                  In-Browser IDE
                </span>
              </div>

            </div>
          </div>

          {/* Assessment Sequence & Flow */}
          <div className="bg-[#0D1D13] border border-emerald-900/40 rounded-2xl p-6 mb-8">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">Assessment Sequence & Flow</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <div className="bg-[#040A06] border-2 border-emerald-600 rounded-xl p-4 flex flex-col justify-between shadow-sm relative">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">STEP 1</span>
                    <span className="text-[11px] font-semibold text-emerald-400">Starting Next</span>
                  </div>
                  <h4 className="font-bold text-white text-xs">Technical Questions</h4>
                  <p className="text-slate-400 text-[11px] mt-1">45 Questions • ~90 min</p>
                </div>
                <div className="mt-4 pt-2 border-t border-emerald-950 flex items-center text-[10px] text-emerald-400 font-bold">
                  <span>Begin Section 1</span>
                  <span className="ml-1">→</span>
                </div>
              </div>

              <div className="bg-[#040A06] border border-emerald-950 rounded-xl p-4 flex flex-col justify-between opacity-70">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">STEP 3</span>
                    <i className="fa-solid fa-arrow-right text-slate-500 text-xs"></i>
                  </div>
                  <h4 className="font-bold text-slate-300 text-xs">Coding Challenge</h4>
                  <p className="text-slate-500 text-[11px] mt-1">1 Challenge • ~15 min</p>
                </div>
                <div className="mt-4 pt-2 border-t border-emerald-950 text-[10px] text-slate-500 font-medium">
                  Locked until Step 2
                </div>
              </div>

              <div className="bg-[#040A06] border border-emerald-950 rounded-xl p-4 flex flex-col justify-between opacity-70">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">STEP 4</span>
                    <i className="fa-solid fa-circle-check text-slate-500 text-xs"></i>
                  </div>
                  <h4 className="font-bold text-slate-300 text-xs">Submit & Review</h4>
                  <p className="text-slate-500 text-[11px] mt-1">Summary receipt</p>
                </div>
                <div className="mt-4 pt-2 border-t border-emerald-950 text-[10px] text-slate-500 font-medium">
                  Final step
                </div>
              </div>

            </div>
          </div>

          {/* Notice Banner */}
          <div className="flex items-start space-x-3 p-4 bg-[#0D1D13] border border-emerald-900/40 rounded-xl mb-8 text-xs text-slate-400 leading-relaxed">
            <i className="fa-solid fa-shield-halved text-emerald-400 mt-0.5"></i>
            <div>
              <span className="font-bold text-white">Once you start, the assessment timer will begin.</span><br />
              Continuous proctoring remains active. Do not close or refresh your browser tab during the active session.
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-emerald-900/30">
            <button
              type="button"
              onClick={() => navigate("/candidate/system-check")}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>←</span>
              <span>Back to System Check</span>
            </button>

            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={handleStartAssessment}
                className="py-3 px-6 rounded-xl font-medium text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Start Assessment</span>
                <span>→</span>
              </button>
              <p className="text-[10px] text-slate-400 mt-1.5">Your timed evaluation session will begin immediately.</p>
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="py-5 px-8 bg-[#09160E] border-t border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-slate-200 transition-colors">Privacy policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-200 transition-colors">Candidate terms</a>
          </div>
        </footer>

      </div>

    </div>
  );
}

export default CandidateAssessmentOverview;