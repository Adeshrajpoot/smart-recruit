import { useNavigate } from "react-router-dom";

function CandidateAssessmentOverview() {
  const navigate = useNavigate();

  function handleStartAssessment() {
    navigate("/candidate/assessment");
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
                YN
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A] leading-tight">Your Name</p>
                <p className="text-xs text-slate-500">Candidate</p>
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
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-xs flex items-center justify-center mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Instructions</p>
                  <p className="text-[11px] text-slate-500">Review before you begin</p>
                </div>
              </div>

              <div 
                onClick={() => navigate("/candidate/system-check")}
                className="flex items-start space-x-3 p-2.5 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-xs flex items-center justify-center mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Permission check</p>
                  <p className="text-[11px] text-slate-500">Make sure your setup is ready</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center mt-0.5 shadow-sm shadow-blue-500/30">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2563EB]">Assessment overview</p>
                  <p className="text-[11px] text-slate-600">See what's included</p>
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
          <p className="text-xs font-bold text-[#0F172A] mb-1">Need a help?</p>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
            Having trouble with a device? Check your settings or contact support before you start.
          </p>
          <button className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center space-x-1 cursor-pointer bg-transparent border-none">
            <span>Contact support</span>
            <span>→</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">

        <header className="bg-white border-b border-blue-100 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="text-xs text-slate-500 font-medium">
            Candidate portal <span className="text-slate-300 mx-2">/</span> <span className="text-slate-800">Assessment overview</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5 bg-[#EFF6FF] border border-blue-100 px-3 py-1.5 rounded-lg">
              <span className="w-6 h-6 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-xs font-bold">👤</span>
              <span className="text-xs font-semibold text-[#0F172A]">YourName</span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl w-full mx-auto px-8 py-8 flex-grow flex flex-col justify-center">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                • STEP 3 OF 4 • OVERVIEW
              </span>
              <p className="text-slate-600 text-sm mt-1.5 max-w-2xl">
                Everything is ready. Review the assessment structure and sequence below before you launch your timed evaluation session.
              </p>
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-[#2563EB]">
                <i className="fa-solid fa-circle-check text-sm"></i>
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-sm">System setup verified</h4>
                <p className="text-slate-500 text-xs mt-0.5">Camera feed active and secure proctoring stream locked.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
              <span>Ready to Launch</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-[#2563EB] text-sm">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">90 Minutes</p>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-[#2563EB] text-sm">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">45 Questions</p>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-[#2563EB] text-sm">
                <i className="fa-solid fa-code"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessment</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5 truncate max-w-[120px]">Technical Screen</p>
              </div>
            </div>

          </div>

          <div className="bg-white border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#0F172A]">What you'll be assessed on</h3>
            </div>

            <div className="space-y-3">

              <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-white border border-blue-200 rounded-xl flex items-center justify-center text-[#2563EB]">
                    <i className="fa-solid fa-laptop-code"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-sm">Technical Knowledge</h4>
                    <p className="text-slate-600 text-xs mt-0.5">Role-specific technical questions to evaluate your understanding of key concepts, state management, and modern browser standards.</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-[#2563EB] bg-white border border-blue-200 px-3 py-1.5 rounded-lg whitespace-nowrap ml-4">
                  Multiple Choice & Concepts
                </span>
              </div>

              <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-white border border-blue-200 rounded-xl flex items-center justify-center text-[#2563EB]">
                    <i className="fa-solid fa-desktop"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-sm">Coding Challenge</h4>
                    <p className="text-slate-600 text-xs mt-0.5">Write, run and submit an algorithmic and UI component solution in a live sandboxed code runtime environment.</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-[#2563EB] bg-white border border-blue-200 px-3 py-1.5 rounded-lg whitespace-nowrap ml-4">
                  In-Browser IDE
                </span>
              </div>

            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
            <h3 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-4">Assessment Sequence & Flow</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <div className="bg-[#EFF6FF] border-2 border-[#2563EB] rounded-xl p-4 flex flex-col justify-between shadow-sm relative">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-[#2563EB] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">STEP 1</span>
                    <span className="text-[11px] font-semibold text-[#2563EB]">Starting Next</span>
                  </div>
                  <h4 className="font-bold text-[#0F172A] text-xs">Technical Questions</h4>
                  <p className="text-slate-600 text-[11px] mt-1">45 Questions • ~90 min</p>
                </div>
                <div className="mt-4 pt-2 border-t border-blue-200 flex items-center text-[10px] text-[#2563EB] font-bold">
                  <span>Begin Section 1</span>
                  <span className="ml-1">→</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between opacity-70">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">STEP 3</span>
                    <i className="fa-solid fa-arrow-right text-slate-400 text-xs"></i>
                  </div>
                  <h4 className="font-bold text-slate-700 text-xs">Coding Challenge</h4>
                  <p className="text-slate-500 text-[11px] mt-1">1 Challenge • ~15 min</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
                  Locked until Step 2
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between opacity-70">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">STEP 4</span>
                    <i className="fa-solid fa-circle-check text-slate-400 text-xs"></i>
                  </div>
                  <h4 className="font-bold text-slate-700 text-xs">Submit & Review</h4>
                  <p className="text-slate-500 text-[11px] mt-1">Summary receipt</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
                  Final step
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-white border border-blue-100 rounded-xl mb-8 text-xs text-slate-600 leading-relaxed shadow-sm">
            <i className="fa-solid fa-shield-halved text-[#2563EB] mt-0.5"></i>
            <div>
              <span className="font-bold text-[#0F172A]">Once you start, the assessment timer will begin.</span><br />
              Continuous proctoring remains active. Do not close or refresh your browser tab during the active session.
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-blue-100">
            <button
              type="button"
              onClick={() => navigate("/candidate/system-check")}
              className="text-xs font-semibold text-slate-500 hover:text-[#0F172A] transition-colors cursor-pointer flex items-center space-x-1.5 bg-transparent border-none"
            >
              <span>←</span>
              <span>Back to System Check</span>
            </button>

            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={handleStartAssessment}
                className="py-3 px-6 rounded-xl font-medium text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2 cursor-pointer border-none"
              >
                <span>Start Assessment</span>
                <span>→</span>
              </button>
              <p className="text-[10px] text-slate-500 mt-1.5">Your timed evaluation session will begin immediately.</p>
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

export default CandidateAssessmentOverview;