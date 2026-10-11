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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans selection:bg-[#2563EB] selection:text-white">
      <aside className="w-72 bg-white border-r border-blue-100 p-6 flex flex-col justify-between hidden lg:flex select-none">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white text-sm shadow-sm shadow-blue-500/20">
              S
            </div>
            <div>
              <span className="text-base font-bold text-[#0F172A] tracking-tight block leading-none">
                SmartRecruit
              </span>
              <span className="text-[10px] font-bold text-[#2563EB] tracking-wider uppercase mt-1 block">
                Evaluation Portal
              </span>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Your Assessment
            </p>
            <div className="flex items-center space-x-3 bg-[#EFF6FF] border border-blue-100 p-3 rounded-xl">
              <div className="w-9 h-9 bg-[#2563EB] text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-[#0F172A] truncate">{candidateName}</p>
                <p className="text-xs text-slate-500">Candidate</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Assessment Steps
            </p>
            <div className="space-y-2">
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-blue-500/30">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2563EB]">Instructions</p>
                    <p className="text-[11px] text-slate-600">Review before you begin</p>
                  </div>
                </div>
              </div>

              <div className="p-3 opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center border border-slate-200">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">System check</p>
                    <p className="text-[11px] text-slate-500">Check your setup</p>
                  </div>
                </div>
              </div>

              <div className="p-3 opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center border border-slate-200">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">Assessment overview</p>
                    <p className="text-[11px] text-slate-500">See what's included</p>
                  </div>
                </div>
              </div>

              <div className="p-3 opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center border border-slate-200">
                    4
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">Assessment</p>
                    <p className="text-[11px] text-slate-500">90 minutes</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-blue-100">
          <div className="p-3.5 bg-[#EFF6FF] border border-blue-100 rounded-xl">
            <p className="text-xs font-bold text-[#0F172A] mb-1">Need a hand?</p>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              If something isn't clear, our support team can help before you start.
            </p>
            <a href="#support" className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center space-x-1">
              <span>Contact support</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col justify-between min-h-screen">
        <header className="bg-white/80 border-b border-blue-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="text-xs text-slate-500 font-medium">
            Candidate portal <span className="text-slate-300 mx-2">/</span> <span className="text-slate-800">Assessment</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm shadow-blue-500/20">
                {initials}
              </div>
              <span className="text-xs font-semibold text-[#0F172A]">{candidateName}</span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl w-full mx-auto px-6 py-8 flex-grow">

          <div className="mb-8">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded border border-blue-200 shadow-sm">
              • BEFORE YOU BEGIN
            </span>
            <h1 className="text-4xl font-extrabold text-[#0F172A] mt-3 tracking-tight">
              Here's what to expect.
            </h1>
            <p className="text-slate-600 text-xs mt-1.5 max-w-xl leading-relaxed">
              Take a minute to get comfortable and check the details below. When you're ready, we'll make sure your setup is working before the assessment starts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-blue-100 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-[#2563EB] text-base">
                <i className="fa-regular fa-clock"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Time available</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">90 minutes</p>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-[#2563EB] text-base">
                <i className="fa-regular fa-folder"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Question count</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">45 questions</p>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-[#2563EB] text-base">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Assessment type</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">Technical screening</p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-7 bg-white border border-blue-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold text-[#0F172A]">A few things to prepare</h3>
                  <span className="text-[10px] font-bold text-[#2563EB] tracking-wider uppercase">Please read</span>
                </div>
                <div className="space-y-4">
                
                  <div className="flex items-start space-x-3 text-slate-700 text-xs font-medium">
                    <span className="text-[#2563EB] mt-0.5"><i className="fa-regular fa-circle-check"></i></span>
                    <span className="leading-relaxed">Check that your camera and microphone are working.</span>
                  </div>

                  <div className="flex items-start space-x-3 text-slate-700 text-xs font-medium">
                    <span className="text-[#2563EB] mt-0.5"><i className="fa-regular fa-circle-check"></i></span>
                    <span className="leading-relaxed">Set aside about 90 minutes so you can finish in one sitting.</span>
                  </div>

                  <div className="flex items-start space-x-3 text-slate-700 text-xs font-medium">
                    <span className="text-[#2563EB] mt-0.5"><i className="fa-regular fa-circle-check"></i></span>
                    <span className="leading-relaxed">Read each question carefully before you answer or run code.</span>
                  </div>

                  <div className="flex items-start space-x-3 text-slate-700 text-xs font-medium">
                    <span className="text-[#2563EB] mt-0.5"><i className="fa-regular fa-circle-check"></i></span>
                    <span className="leading-relaxed">Keep the assessment open while you work. Switching away may trigger a proctoring alert.</span>
                  </div>

                </div>
              </div>

              <div className="mt-6 p-3.5 bg-[#EFF6FF] border border-blue-100 rounded-xl">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Find a quiet spot and close anything you don't need. You'll have a chance to check your camera and microphone on the next screen.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-[#0F172A]">What's included</h3>
                <span className="text-[10px] font-bold text-[#2563EB] tracking-wider uppercase">6 Questions</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#EFF6FF] border border-blue-100 rounded-xl">
                  <div className="flex items-center space-x-2 text-[#2563EB] text-xs font-bold mb-1">
                    <i className="fa-solid fa-code"></i>
                    <span>Technical questions</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Role-specific questions on DOM performance, async patterns, and state architecture.
                  </p>
                  <p className="text-[10px] font-medium text-[#2563EB] mt-2">Multiple choice</p>
                </div>
                <div className="p-3.5 bg-[#EFF6FF] border border-blue-100 rounded-xl">
                  <div className="flex items-center space-x-2 text-[#2563EB] text-xs font-bold mb-1">
                    <i className="fa-solid fa-desktop"></i>
                    <span>Coding challenge</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Write and run code in the editor, with built-in checks.
                  </p>
                  <p className="text-[10px] font-medium text-[#2563EB] mt-2">1 live challenge</p>
                </div>

              </div>
            </div>

          </div>
          <div className="flex items-start space-x-3 p-4 bg-white border border-blue-100 rounded-xl mb-8 shadow-sm">
            <input
              type="checkbox"
              id="confirm"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#2563EB] bg-white rounded border-slate-300 focus:ring-blue-500 cursor-pointer accent-[#2563EB]"
            />
            <label htmlFor="confirm" className="text-xs text-slate-700 font-medium leading-relaxed cursor-pointer select-none">
              I'm in a quiet space, my camera and microphone are ready, and I'll complete the assessment on my own without outside help.
            </label>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-blue-100 gap-4">
            <p className="text-[11px] text-slate-500">
               Your responses are used to assess your application.
            </p>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate("/candidate/login")}
                className="text-xs font-semibold text-slate-500 hover:text-[#0F172A] transition-colors cursor-pointer bg-transparent border-none"
              >
                Exit assessment
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className={`py-3 px-6 rounded-xl font-medium text-xs transition-all shadow-sm flex items-center space-x-2 border-none ${
                  agreed
                    ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-500/20 cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>Continue to system check</span>
              </button>
            </div>
          </div>

        </main>

        <footer className="py-4 px-8 bg-white border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>SmartRecruit · Secure candidate portal</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-[#2563EB] transition-colors">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-[#2563EB] transition-colors">Candidate terms</a>
          </div>
        </footer>

      </div>

    </div>
  );
}

export default CandidateInstructions;