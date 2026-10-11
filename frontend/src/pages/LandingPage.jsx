import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Landing from "./Candidate/landing.jpeg";

function LandingPage() {
  const navigate = useNavigate();
  const [initialAuth] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      return {
        isLoggedIn: Boolean(token),
        userName: user?.name || (user?.role === "recruiter" ? "Recruiter" : "Candidate"),
        userRole: user?.role || "candidate",
      };
    } catch {
      return { isLoggedIn: false, userName: "", userRole: "candidate" };
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(initialAuth.isLoggedIn);
  const [userName, setUserName] = useState(initialAuth.userName);
  const [userRole, setUserRole] = useState(initialAuth.userRole);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserRole("candidate");
    setUserName("");
    navigate("/");
  };

  const featuresList = [
    {
      icon: "fa-solid fa-arrow-right text-white rotate-[-45deg]",
      title: "Guided assessment flow",
      description: "Help candidates prepare, check their setup, and move through each section with clear instructions.",
      action: "See how it works →",
    },
    {
      icon: "fa-solid fa-user-check",
      title: "Candidate profiles",
      description: "Bring technical skills, project links, and assessment responses together in one profile.",
      action: "View the candidate experience →",
    },
    {
      icon: "fa-solid fa-shield-halved",
      title: "Secure session controls",
      description: "Set expectations before the assessment and keep session information visible to candidates.",
      action: "Learn about the process →",
    },
    {
      icon: "fa-solid fa-magnifying-glass-chart",
      title: "Evidence-based review",
      description: "Use shared rubrics and reviewer notes to discuss a candidate's work with more context.",
      action: "Explore team review →",
    },
  ];

  return (
    <div className="min-h-screen bg-[#021810] text-white flex flex-col md:flex-row selection:bg-[#10B981] selection:text-white scroll-smooth font-sans">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-emerald-950 bg-[#02140e] p-6 flex flex-col justify-between md:sticky md:top-0 md:h-screen shrink-0">
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(userRole === "recruiter" ? "/recruiter/dashboard" : "/")}>
            <div className="w-7 h-7 bg-[#10B981] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-none">
                SmartRecruit
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#10B981] uppercase mt-1">
                Technical Hiring
              </span>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-4">
            <span className="text-[20px] font-mono text-slate-400 tracking-widest font-normal">
              ON THIS PAGE
            </span>
            <nav className="flex flex-col gap-3 text-sm font-mono text-slate-400">
              <a href="#overview" className="hover:text-[white] transition-colors flex items-center gap-2">
                <span className="text-xs"><i className="fa-solid fa-users"></i></span> Overview
              </a>
              <a href="#features" className="hover:text-[white] transition-colors flex items-center gap-2">
                <span className="text-xs"><i className="fa-solid fa-list"></i></span> What we offer
              </a>
              <a href="#approach" className="hover:text-[white] transition-colors flex items-center gap-2">
                <span className="text-xs"><i className="fa-solid fa-arrow-right"></i></span> Our approach
              </a>
              <a href="#contact" className="hover:text-[white] transition-colors flex items-center gap-2">
                <span className="text-xs"><i className="fa-solid fa-envelope"></i></span> Contact
              </a>
            </nav>
          </div>
        </div>
        <div className="hidden md:flex flex-col p-4 bg-[#03261a] border border-emerald-900/40 rounded-xl gap-2 mt-6">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
            For hiring teams
          </span>
          <p className="text-sm text-white tracking-tight">
            Make space for better conversations.
          </p>
          <p className="text-[11px] text-slate-300 leading-normal">
            Bring candidate work and reviewer feedback into one clear process.
          </p>
          <a href="#contact" className="text-[11px] font-mono text-[#10B981] hover:underline mt-1">
            Talk with our team
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#021c13]">
        <div className="flex-1 flex flex-col min-w-0 bg-[#021c13]">
          <header className="w-full border-b border-emerald-950 bg-[#021810]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-6 h-10 flex items-center justify-between">
              <div className="flex items-center gap-4 ml-auto">
                {isLoggedIn ? (
                  <>
                    <button onClick={() => navigate(userRole === "recruiter" ? "/recruiter/dashboard" : "/candidate/profile")}
                      className="text-xs font-mono text-slate-300 hover:text-[#10B981] px-3 py-1 rounded-md hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    >
                      {userName}
                    </button>
                    <button onClick={handleLogout}
                      className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all border border-red-500/30 cursor-pointer"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/candidate/SignUpPage")}
                      className="text-xs font-mono text-slate-300 hover:text-slate-100 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50 px-3 py-1 rounded-full transition-all cursor-pointer uppercase tracking-wider">
                      Sign up
                    </button>
                    <span className="text-emerald-800">/</span>
                    <button onClick={() => navigate("/candidate/login")}
                      className="text-xs font-mono text-slate-300 hover:text-slate-100 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50 px-3 py-1 rounded-full transition-all cursor-pointer uppercase tracking-wider">
                      Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        </div>

        <section id="overview" className="max-w-5xl mx-auto w-full px-6 py-16 md:py-24 flex flex-col justify-center gap-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex flex-col gap-6 max-w-xl w-full lg:w-1/2">
              <div className="flex items-center gap-2 text-[white] text-xs font-mono uppercase tracking-widest font-semibold">
                <span className="w-2 h-2 rounded-full bg-[white] animate-pulse"></span>
                A more thoughtful way to hire
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                Assess skills beyond the resume.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                Give candidates a fair chance to show how they think, communicate, and build. <span className="text-[#10B981] font-medium">SmartRecruit</span> brings technical questions, coding exercises, and spoken responses into one clear review for your team.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate(isLoggedIn ? (userRole === "recruiter" ? "/recruiter/dashboard" : "/candidate/instructions") : "/candidate/SignUpPage")}
                  className="bg-white hover:bg-slate-100 text-black px-6 py-3 rounded-lg font-mono font-bold tracking-wider transition-all cursor-pointer"
                >
                  Get started<i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
                <button
                  onClick={() => {
                    const featuresEl = document.getElementById("features");
                    featuresEl?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-mono font-bold tracking-wider transition-all cursor-pointer"
                >
                  Explore the platform
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-300" style={{ fontFamily: 'Arial, sans-serif' }}>
                <span className="flex items-center gap-1.5"><i className="fa-solid fa-lock"></i> Secure sessions</span>
                <span className="flex items-center gap-1.5"><i className="fa-solid fa-check"></i> Consistent review</span>
                <span className="flex items-center gap-1.5"> Candidate-friendly flow</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center items-center relative">
              <div className="absolute inset-0 rounded-full"></div>
              <img
                src={Landing}
                alt="Online Test Candidate Illustration"
                className="w-full max-w-md h-auto object-contain relative z-10"
              />
            </div>
          </div>
        </section>

        <section id="features" className="max-w-5xl mx-auto w-full px-6 py-20 border-t border-emerald-950">
          <div className="flex flex-col gap-3 mb-12">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Built for technical teams
            </span>
            <h2 className="text-4xl sm:text-4xl lg:text-5xl tracking-tight text-white">
              Everything you need for a clearer review.
            </h2>
            <p className="text-sm font-mono text-slate-400">
              Keep the process focused on useful evidence, clear expectations, and thoughtful decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuresList.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-[#03261a]/40 border border-emerald-900/40 rounded-2xl backdrop-blur-sm flex flex-col justify-between hover:border-[#10B981]/50 hover:bg-[#03261a]/80 transition-all group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#03261a]/60 text-white flex items-center justify-center mb-4 border border-emerald-900/40 group-hover:bg-[#03261a]/80 transition-all">
                    <i className={`${feature.icon} text-sm`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#10B981] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-emerald-950 flex items-center text-xs font-mono text-[white]">
                  <span className="cursor-pointer hover:underline">{feature.action}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="approach" className="max-w-5xl mx-auto w-full px-6 py-20 border-t border-emerald-950">
          <div className="flex flex-col gap-3 mb-12">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
              A simpler screening process
            </span>
            <h2 className="text-4xl sm:text-5xl tracking-tight text-white">
              Less time sorting. More time meeting people.
            </h2>
            <p className="text-sm text-slate-300">
              Move from a crowded inbox to a clear, skills-focused shortlist without losing the human side of hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-[#03261a]/30 border border-emerald-900/30 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#FFFFFF] uppercase tracking-[0.25em] font-semibold">
                  The familiar challenge
                </span>
                <h3 className="text-xl text-white mt-2 mb-3 tracking-tight">
                  Too many applications. Too little time.
                </h3>
                <p className="text-sm text-slate-300 mb-6">
                  Manual first-pass screening can make it hard to give every candidate a thoughtful review.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-mono text-slate-300">
                  <li className="flex items-center gap-2">Repeated résumé checks</li>
                  <li className="flex items-center gap-2">Slow, inconsistent shortlisting</li>
                  <li className="flex items-center gap-2">Good work can be easy to miss</li>
                </ul>
              </div>
            </div>

            <div className="p-8 bg-[#03261a]/30 border border-emerald-900/30 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#FFFFFF] uppercase tracking-[0.25em] font-semibold">
                  A clearer way forward
                </span>
                <h3 className="text-xl text-white mt-2 mb-3 tracking-tight">
                  Review relevant work together.
                </h3>
                <p className="text-sm text-slate-200 mb-6">
                  Bring role-based responses and shared reviewer feedback into one place.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-mono text-slate-200">
                  <li className="flex items-center gap-2"><i className="fas fa-check text-white"></i> Compare candidates against the same role criteria</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check text-white"></i> See technical, spoken, and coding responses together</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check text-white"></i> Make room for better-informed conversations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto w-full px-6 py-16">
          <div className="p-10 bg-gradient-to-r from-[#03261a] to-[#021810] border border-emerald-900/60 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-emerald-950/30">
            <div className="flex flex-col gap-2 text-left">
              <span className="text-[10px] font-mono text-[#FFFFFF] uppercase tracking-wider">
                For engineering teams
              </span>
              <h3 className="text-2xl sm:text-3xl text-white">
                Ready for a more useful first review?
              </h3>
              <p className="text-xs text-slate-300">
                See how SmartRecruit can fit your team's hiring process.
              </p>
            </div>
            <button
              onClick={() => navigate(isLoggedIn ? (userRole === "recruiter" ? "/recruiter/dashboard" : "/candidate/profile") : "/candidate/SignUpPage")}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
            >
              {isLoggedIn ? "Profile" : "Get started"}
            </button>
          </div>
        </section>

        <footer
          id="contact"
          className="max-w-5xl mx-auto w-full px-6 py-10 border-t border-emerald-950 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400 uppercase tracking-wider"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">SmartRecruit</span>
            <span className="text-slate-400">— Technical hiring workspace</span>
          </div>

          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#overview" className="hover:text-white transition-colors">Contact</a>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default LandingPage;