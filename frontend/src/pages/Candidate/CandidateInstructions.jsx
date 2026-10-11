import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CandidateInstructions() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [candidateName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?.name || "Candidate";
    } catch {
      return "Candidate";
    }
  });
  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(candidateName);

  function handleContinue() {
    if (!agreed) {
      alert("Please confirm the requirements before proceeding.");
      return;
    }
    navigate("/candidate/system-check");
  }

  return (
    <div className="min-h-screen bg-[#020b06] text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-white">
      <aside className="w-72 bg-[#04120a]/80 border-r border-emerald-950/80 p-6 flex flex-col justify-between hidden lg:flex select-none">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-sm shadow-emerald-900/50">
              S
            </div>
            <div>
              <span className="text-base font-bold text-slate-100 tracking-tight block leading-none">
                SmartRecriut
              </span>
              <span className="text-[10px] font-bold text-emerald-500/80 tracking-wider uppercase mt-1 block">
                Evaluation Portal
              </span>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
              Your Assessment
            </p>
            <div className="flex items-center space-x-3 bg-[#06170e] border border-emerald-900/40 p-3 rounded-xl">
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm shadow-emerald-900/50">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-100 truncate">{candidateName}</p>
                <p className="text-xs text-emerald-500/70">Candidate</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-3">
              Assessment Steps
            </p>
            <div className="space-y-2">
              
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-emerald-900/50">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100">Instructions</p>
                    <p className="text-[11px] text-emerald-400/80">Review before you begin</p>
                  </div>
                </div>
              </div>

              <div className="p-3 opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950/50 text-slate-400 font-bold text-xs flex items-center justify-center border border-emerald-900/30">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">System check</p>
                    <p className="text-[11px] text-slate-500">Check your setup</p>
                  </div>
                </div>
              </div>

              <div className="p-3 opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950/50 text-slate-400 font-bold text-xs flex items-center justify-center border border-emerald-900/30">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">Assessment overview</p>
                    <p className="text-[11px] text-slate-500">See what's included</p>
                  </div>
                </div>
              </div>

              <div className="p-3 opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950/50 text-slate-400 font-bold text-xs flex items-center justify-center border border-emerald-900/30">
                    4
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">Assessment</p>
                    <p className="text-[11px] text-slate-500">90 minutes</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-emerald-950/80">
          <div className="p-3.5 bg-[#06170e]/50 border border-emerald-900/30 rounded-xl">
            <p className="text-xs font-bold text-slate-200 mb-1">Need a hand?</p>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              If something isn't clear, our support team can help before you start.
            </p>
            <a href="#support" className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center space-x-1">
              <span>Contact support</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col justify-between min-h-screen">
        <header className="bg-[#04120a]/40 border-b border-emerald-950/80 px-8 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-medium">
            Candidate portal <span className="text-emerald-800 mx-2">/</span> <span className="text-slate-200">Assessment</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm shadow-emerald-900/50">
                {initials}
              </div>
              <span className="text-xs font-semibold text-slate-200">{candidateName}</span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl w-full mx-auto px-6 py-8 flex-grow">

          <div className="mb-8">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/50 shadow-sm">
              • BEFORE YOU BEGIN
            </span>
            <h1 className="text-4xl font-extrabold text-slate-100 mt-3 tracking-tight">
              Here's what to expect.
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 max-w-xl leading-relaxed">
              Take a minute to get comfortable and check the details below. When you're ready, we'll make sure your setup is working before the assessment starts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#06170e]/60 border border-emerald-900/30 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-[#020b06] border border-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-400 text-base">
                <i className="fa-regular fa-clock"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Time available</p>
                <p className="text-sm font-bold text-slate-100 mt-0.5">90 minutes</p>
              </div>
            </div>

            <div className="bg-[#06170e]/60 border border-emerald-900/30 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-[#020b06] border border-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-400 text-base">
                <i className="fa-regular fa-folder"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Question count</p>
                <p className="text-sm font-bold text-slate-100 mt-0.5">45 questions</p>
              </div>
            </div>

            <div className="bg-[#06170e]/60 border border-emerald-900/30 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-[#020b06] border border-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-400 text-base">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Assessment type</p>
                <p className="text-sm font-bold text-slate-100 mt-0.5">Technical screening</p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-7 bg-[#06170e]/60 border border-emerald-900/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold text-slate-100">A few things to prepare</h3>
                  <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Please read</span>
                </div>
                <div className="space-y-4">
                
                  <div className="flex items-start space-x-3 text-slate-300 text-xs font-medium">
                    <span className="text-emerald-400 mt-0.5"><i className="fa-regular fa-circle-check"></i></span>
                    <span className="leading-relaxed">Check that your camera and microphone are working.</span>
                  </div>

                  <div className="flex items-start space-x-3 text-slate-300 text-xs font-medium">
                    <span className="text-emerald-400 mt-0.5"><i className="fa-regular fa-circle-check"></i></span>
                    <span className="leading-relaxed">Set aside about 90 minutes so you can finish in one sitting.</span>
                  </div>

                  <div className="flex items-start space-x-3 text-slate-300 text-xs font-medium">
                    <span className="text-emerald-400 mt-0.5"><i className="fa-regular fa-circle-check"></i></span>
                    <span className="leading-relaxed">Read each question carefully before you answer or run code.</span>
                  </div>

                  <div className="flex items-start space-x-3 text-slate-300 text-xs font-medium">
                    <span className="text-emerald-400 mt-0.5"><i className="fa-regular fa-circle-check"></i></span>
                    <span className="leading-relaxed">Keep the assessment open while you work. Switching away may trigger a proctoring alert.</span>
                  </div>

                </div>
              </div>

              <div className="mt-6 p-3.5 bg-[#020b06]/60 border border-emerald-900/30 rounded-xl">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Find a quiet spot and close anything you don't need. You'll have a chance to check your camera and microphone on the next screen.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#06170e]/60 border border-emerald-900/30 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-slate-100">What's included</h3>
                <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">6 Questions</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#020b06]/50 border border-emerald-900/30 rounded-xl">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
                    <i className="fa-solid fa-code"></i>
                    <span>Technical questions</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Role-specific questions on DOM performance, async patterns, and state architecture.
                  </p>
                  <p className="text-[10px] font-medium text-emerald-600 mt-2">Multiple choice</p>
                </div>
                <div className="p-3.5 bg-[#020b06]/50 border border-emerald-900/30 rounded-xl">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
                    <i className="fa-solid fa-desktop"></i>
                    <span>Coding challenge</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Write and run code in the editor, with built-in checks.
                  </p>
                  <p className="text-[10px] font-medium text-emerald-600 mt-2">1 live challenge</p>
                </div>

              </div>
            </div>

          </div>
          <div className="flex items-start space-x-3 p-4 bg-[#06170e]/60 border border-emerald-900/30 rounded-xl mb-8 shadow-sm">
            <input
              type="checkbox"
              id="confirm"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 bg-[#020b06] rounded border-emerald-800 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
            />
            <label htmlFor="confirm" className="text-xs text-slate-300 font-medium leading-relaxed cursor-pointer select-none">
              I'm in a quiet space, my camera and microphone are ready, and I'll complete the assessment on my own without outside help.
            </label>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-emerald-950/80 gap-4">
            <p className="text-[11px] text-slate-500">
               Your responses are used to assess your application.
            </p>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate("/candidate/login")}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Exit assessment
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className={`py-3 px-6 rounded-xl font-medium text-xs transition-all shadow-sm flex items-center space-x-2 ${
                  agreed
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 cursor-pointer"
                    : "bg-[#06170e] text-slate-500 cursor-not-allowed border border-emerald-950"
                }`}
              >
                <span>Continue to system check</span>
              </button>
            </div>
          </div>

        </main>

        <footer className="py-4 px-8 bg-[#04120a]/40 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>SmartRecruit · Secure candidate portal</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Candidate terms</a>
          </div>
        </footer>

      </div>

    </div>
  );
}

export default CandidateInstructions;