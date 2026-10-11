import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-[#F4F7FC] text-[#172554] flex flex-col md:flex-row selection:bg-[#2563EB] selection:text-white scroll-smooth font-sans">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-blue-100 bg-white p-6 flex flex-col justify-between md:sticky md:top-0 md:h-screen shrink-0">
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(userRole === "recruiter" ? "/recruiter/dashboard" : "/")}>
            <div className="w-7 h-7 bg-[#2563EB] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#172554] leading-none">
                SmartRecruit
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#2563EB] uppercase mt-1">
                Technical Hiring
              </span>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-4">
            <span className="text-[20px] font-mono text-slate-500 tracking-widest font-normal">
              ON THIS PAGE
            </span>
            <nav className="flex flex-col gap-3 text-sm font-mono text-slate-500">
              <a href="#overview" className="hover:text-[#2563EB] transition-colors flex items-center gap-2">
                <span className="text-xs"><i className="fa-solid fa-users"></i></span> Overview
              </a>
              <a href="#features" className="hover:text-[#2563EB] transition-colors flex items-center gap-2">
                <span className="text-xs"><i className="fa-solid fa-list"></i></span> What we offer
              </a>
              <a href="#approach" className="hover:text-[#2563EB] transition-colors flex items-center gap-2">
                <span className="text-xs"><i className="fa-solid fa-arrow-right"></i></span> Our approach
              </a>
              {isLoggedIn && userRole === "candidate" && (
                <button 
                  onClick={() => navigate("/candidate/results")}
                  className="hover:text-[#2563EB] transition-colors flex items-center gap-2 text-left bg-transparent border-none p-0 cursor-pointer font-mono text-sm text-slate-500"
                >
                  <span className="text-xs"><i className="fa-solid fa-square-poll-result"></i></span> View Result
                </button>
              )}
              <a href="#contact" className="hover:text-[#2563EB] transition-colors flex items-center gap-2">
                <span className="text-xs"><i className="fa-solid fa-envelope"></i></span> Contact
              </a>
            </nav>
          </div>
        </div>

        <div className="hidden md:flex flex-col p-4 bg-[#EFF6FF] border border-blue-100 rounded-xl gap-2 mt-6">
          <span className="text-[10px] font-mono text-[#2563EB] uppercase tracking-wider">
            For hiring teams
          </span>
          <p className="text-sm text-[#172554] tracking-tight">
            Make space for better conversations.
          </p>
          <p className="text-[11px] text-slate-600 leading-normal">
            Bring candidate work and reviewer feedback into one clear process.
          </p>
          <a href="#contact" className="text-[11px] font-mono text-[#2563EB] hover:underline mt-1">
            Talk with our team
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFF]">
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFF]">
          <header className="w-full border-b border-blue-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-6 h-10 flex items-center justify-between">
              <div className="flex items-center gap-4 ml-auto">
                {isLoggedIn ? (
                  <>
                    <button onClick={() => navigate(userRole === "recruiter" ? "/recruiter/dashboard" : "/candidate/profile")}
                      className="text-xs font-mono text-slate-600 hover:text-[#2563EB] px-3 py-1 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      {userName}
                    </button>
                    <button onClick={handleLogout}
                      className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all border border-red-200 cursor-pointer"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/candidate/SignUpPage")}
                      className="text-xs font-mono text-[#1E40AF] hover:text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-full transition-all cursor-pointer uppercase tracking-wider">
                      Sign up
                    </button>
                    <span className="text-blue-300">/</span>
                    <button onClick={() => navigate("/candidate/login")}
                      className="text-xs font-mono text-[#1E40AF] hover:text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-full transition-all cursor-pointer uppercase tracking-wider">
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
              <div className="flex items-center gap-2 text-[#2563EB] text-xs font-mono uppercase tracking-widest font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
                A more thoughtful way to hire
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#172554] leading-[1.1]">
                Assess skills beyond the resume.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                Give candidates a fair chance to show how they think, communicate, and build. <span className="text-[#2563EB] font-medium">SmartRecruit</span> brings technical questions, coding exercises, and spoken responses into one clear review for your team.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate(isLoggedIn ? (userRole === "recruiter" ? "/recruiter/dashboard" : "/candidate/instructions") : "/candidate/SignUpPage")}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-lg font-mono font-bold tracking-wider transition-all cursor-pointer"
                >
                  Get started<i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
                <button
                  onClick={() => {
                    const featuresEl = document.getElementById("features");
                    featuresEl?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-white hover:bg-blue-50 text-[#1E40AF] border border-blue-200 px-6 py-3 rounded-lg font-mono font-bold tracking-wider transition-all cursor-pointer"
                >
                  Explore the platform
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-600" style={{ fontFamily: 'Arial, sans-serif' }}>
                <span className="flex items-center gap-1.5"><i className="fa-solid fa-lock text-[#2563EB]"></i> Secure sessions</span>
                <span className="flex items-center gap-1.5"><i className="fa-solid fa-check text-[#2563EB]"></i> Consistent review</span>
                <span className="flex items-center gap-1.5"> Candidate-friendly flow</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center items-center relative">
              <div className="absolute inset-0 rounded-full"></div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%" className="max-w-md h-auto object-contain relative z-10">
                <defs>
                  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#1e3a8a" floodOpacity="0.15"/>
                  </filter>
                </defs>

                <rect width="800" height="600" fill="#F8FAFC"/>

                <rect x="100" y="80" width="260" height="300" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2"/>
                <rect x="380" y="80" width="220" height="300" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2"/>

                <ellipse cx="400" cy="490" rx="320" ry="25" fill="#E2E8F0"/>

                <rect x="150" y="205" width="170" height="6" rx="3" fill="#94A3B8"/>
                <path d="M 180 205 Q 183 190 175 175 Q 185 180 190 205 Z" fill="#2563EB"/>
                <path d="M 180 205 Q 177 190 185 175 Q 175 180 170 205 Z" fill="#3B82F6"/>
                <path d="M 172 205 L 188 205 L 185 195 L 175 195 Z" fill="#1E3A8A"/>
                
                <rect x="222" y="167" width="10" height="38" rx="2" fill="#2563EB"/>
                <rect x="234" y="167" width="14" height="38" rx="2" fill="#1D4ED8"/>
                <rect x="250" y="175" width="10" height="30" rx="2" fill="#3B82F6"/>
                <rect x="262" y="170" width="12" height="35" rx="2" fill="#60A5FA"/>
                <rect x="276" y="167" width="10" height="38" rx="2" fill="#1E3A8A"/>
                <rect x="288" y="172" width="14" height="33" rx="2" fill="#2563EB"/>
                <rect x="304" y="167" width="12" height="38" rx="2" fill="#3B82F6"/>

                <rect x="150" y="305" width="170" height="6" rx="3" fill="#94A3B8"/>
                <rect x="156" y="272" width="12" height="33" rx="2" fill="#2563EB"/>
                <rect x="170" y="275" width="10" height="30" rx="2" fill="#1D4ED8"/>
                <rect x="182" y="270" width="14" height="35" rx="2" fill="#3B82F6"/>
                <rect x="198" y="272" width="12" height="33" rx="2" fill="#60A5FA"/>
                <rect x="212" y="275" width="10" height="30" rx="2" fill="#1E3A8A"/>
                <rect x="224" y="272" width="14" height="33" rx="2" fill="#2563EB"/>
                <rect x="240" y="275" width="12" height="30" rx="2" fill="#3B82F6"/>
                <rect x="270" y="285" width="38" height="20" rx="3" fill="#1E3A8A"/>

                <circle cx="490" cy="130" r="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2"/>
                <line x1="490" y1="130" x2="490" y2="120" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round"/>
                <line x1="490" y1="130" x2="498" y2="134" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round"/>

                <g filter="url(#shadow)">
                  <rect x="336" y="170" width="260" height="235" rx="6" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5"/>
                  <path d="M 337 176 C 337 172.686 339.686 170 343 170 L 590 170 C 593.314 170 596 172.686 596 176 L 596 200 L 337 200 Z" fill="#1E3A8A"/>
                  <circle cx="349" cy="185" r="3" fill="#EF4444"/>
                  <circle cx="359" cy="185" r="3" fill="#F59E0B"/>
                  <circle cx="369" cy="185" r="3" fill="#10B981"/>
                  <text x="385" y="190" fontFamily="sans-serif" fontSize="11" fill="#FFFFFF" fontWeight="bold">Online Test</text>
                  <circle cx="578" cy="185" r="10" fill="#3B82F6" opacity="0.4"/>
                  
                  <rect x="348" y="215" width="14" height="14" rx="3" fill="#DBEAFE"/>
                  <text x="353" y="226" fontFamily="sans-serif" fontSize="9" fill="#1E3A8A" fontWeight="bold">1</text>
                  <rect x="370" y="217" width="180" height="5" rx="2.5" fill="#CBD5E1"/>
                  <circle cx="355" cy="242" r="4" fill="none" stroke="#94A3B8" strokeWidth="1.5"/>
                  <rect x="368" y="240" width="50" height="4" rx="2" fill="#E2E8F0"/>
                  <circle cx="435" cy="242" r="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5"/>
                  <rect x="448" y="240" width="50" height="4" rx="2" fill="#93C5FD"/>
                  <circle cx="515" cy="242" r="4" fill="none" stroke="#94A3B8" strokeWidth="1.5"/>
                  <rect x="528" y="240" width="50" height="4" rx="2" fill="#E2E8F0"/>

                  <line x1="348" y1="260" x2="584" y2="260" stroke="#F1F5F9" strokeWidth="1"/>

                  <rect x="348" y="272" width="14" height="14" rx="3" fill="#DBEAFE"/>
                  <text x="353" y="283" fontFamily="sans-serif" fontSize="9" fill="#1E3A8A" fontWeight="bold">2</text>
                  <rect x="370" y="274" width="160" height="5" rx="2.5" fill="#CBD5E1"/>
                  <circle cx="355" cy="299" r="4" fill="none" stroke="#94A3B8" strokeWidth="1.5"/>
                  <rect x="368" y="297" width="50" height="4" rx="2" fill="#E2E8F0"/>
                  <circle cx="435" cy="299" r="4" fill="none" stroke="#94A3B8" strokeWidth="1.5"/>
                  <rect x="448" y="297" width="50" height="4" rx="2" fill="#E2E8F0"/>
                  <circle cx="515" cy="299" r="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5"/>
                  <rect x="528" y="297" width="50" height="4" rx="2" fill="#93C5FD"/>

                  <line x1="348" y1="317" x2="584" y2="317" stroke="#F1F5F9" strokeWidth="1"/>

                  <rect x="348" y="330" width="14" height="14" rx="3" fill="#DBEAFE"/>
                  <text x="353" y="341" fontFamily="sans-serif" fontSize="9" fill="#1E3A8A" fontWeight="bold">3</text>
                  <rect x="370" y="332" width="140" height="5" rx="2.5" fill="#CBD5E1"/>
                  <circle cx="355" cy="357" r="4" fill="none" stroke="#94A3B8" strokeWidth="1.5"/>
                  <rect x="368" y="355" width="50" height="4" rx="2" fill="#E2E8F0"/>
                  <circle cx="435" cy="357" r="4" fill="none" stroke="#94A3B8" strokeWidth="1.5"/>
                  <rect x="448" y="355" width="50" height="4" rx="2" fill="#E2E8F0"/>
                </g>

                <g>
                  <path d="M 235 480 L 255 480 L 245 465 Z" fill="#64748B"/>
                  <line x1="245" y1="465" x2="210" y2="475" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="245" y1="465" x2="280" y2="478" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="245" y1="465" x2="245" y2="445" stroke="#475569" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M 220 425 Q 260 420 295 425 L 290 440 Q 255 445 225 440 Z" fill="#334155"/>
                  <path d="M 185 365 C 175 390 175 420 185 440 L 225 440 C 220 410 220 380 225 365 Z" fill="#1E293B"/>
                  <path d="M 188 368 C 180 390 180 415 188 435 L 222 435 C 218 410 218 385 222 368 Z" fill="#334155"/>
                </g>

                <rect x="295" y="500" width="8" height="60" fill="#1E3A8A"/>
                <rect x="425" y="500" width="8" height="60" fill="#1E3A8A"/>
                <path d="M 285 558 L 315 558 L 315 562 L 285 562 Z" fill="#1E3A8A"/>
                <path d="M 415 558 L 445 558 L 445 562 L 415 562 Z" fill="#1E3A8A"/>
                <polygon points="250,500 480,500 505,518 275,518" fill="#3B82F6"/>
                <polygon points="250,496 480,496 480,500 250,500" fill="#60A5FA"/>

                <polygon points="340,500 415,500 425,508 330,508" fill="#CBD5E1"/>
                <polygon points="342,500 413,500 405,458 350,458" fill="#93C5FD"/>
                <polygon points="345,498 410,498 403,462 352,462" fill="#FFFFFF"/>
                <text x="365" y="482" fontFamily="sans-serif" fontSize="8" fill="#1E3A8A" fontWeight="bold">CODE</text>

                <circle cx="282" cy="340" r="14" fill="#FDBA74"/>
                <path d="M 268 338 C 268 325 285 322 295 332 C 298 335 298 342 295 348 L 290 348 C 292 342 290 338 285 336 Z" fill="#1E293B"/>
                <path d="M 260 360 C 255 385 260 410 275 425 L 305 425 C 315 410 315 385 305 360 Z" fill="#2563EB"/>
                <path d="M 285 375 Q 320 380 345 490" fill="none" stroke="#2563EB" strokeWidth="8" strokeLinecap="round"/>
                <circle cx="345" cy="492" r="5" fill="#FDBA74"/>
                <path d="M 275 422 L 255 495 L 275 498 L 295 450 Z" fill="#64748B"/>
                <path d="M 305 422 L 345 495 L 365 492 L 325 435 Z" fill="#64748B"/>
                <path d="M 252 495 C 245 495 240 500 248 502 L 278 502 L 278 495 Z" fill="#1E293B"/>
                <path d="M 342 495 C 335 495 330 500 338 502 L 368 502 L 368 495 Z" fill="#1E293B"/>

                <g transform="translate(610, 430)">
                  <path d="M 15 40 L 45 40 L 52 70 L 8 70 Z" fill="#1E3A8A"/>
                  <path d="M 30 40 Q 20 15 5 0 Q 20 15 30 40 Z" fill="#2563EB"/>
                  <path d="M 30 40 Q 40 10 55 -5 Q 40 15 30 40 Z" fill="#3B82F6"/>
                  <path d="M 30 40 Q 30 5 30 -15 Q 30 5 30 40 Z" fill="#1D4ED8"/>
                  <path d="M 30 40 Q 55 20 70 10 Q 50 25 30 40 Z" fill="#60A5FA"/>
                  <path d="M 30 40 Q 10 25 -5 15 Q 15 25 30 40 Z" fill="#2563EB"/>
                </g>
              </svg>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-5xl mx-auto w-full px-6 py-20 border-t border-blue-100">
          <div className="flex flex-col gap-3 mb-12">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Built for technical teams
            </span>
            <h2 className="text-4xl sm:text-4xl lg:text-5xl tracking-tight text-[#172554]">
              Everything you need for a clearer review.
            </h2>
            <p className="text-sm font-mono text-slate-500">
              Keep the process focused on useful evidence, clear expectations, and thoughtful decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuresList.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white border border-blue-100 rounded-2xl backdrop-blur-sm flex flex-col justify-between hover:border-[#2563EB]/50 hover:shadow-lg hover:shadow-blue-100/60 transition-all group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center mb-4 border border-blue-200 group-hover:bg-[#1D4ED8] transition-all">
                    <i className={`${feature.icon} text-sm`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-[#172554] mb-2 tracking-tight group-hover:text-[#2563EB] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-blue-100 flex items-center text-xs font-mono text-[#2563EB]">
                  <span className="cursor-pointer hover:underline">{feature.action}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="approach" className="max-w-5xl mx-auto w-full px-6 py-20 border-t border-blue-100">
          <div className="flex flex-col gap-3 mb-12">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
              A simpler screening process
            </span>
            <h2 className="text-4xl sm:text-5xl tracking-tight text-[#172554]">
              Less time sorting. More time meeting people.
            </h2>
            <p className="text-sm text-slate-600">
              Move from a crowded inbox to a clear, skills-focused shortlist without losing the human side of hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-white border border-blue-100 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#2563EB] uppercase tracking-[0.25em] font-semibold">
                  The familiar challenge
                </span>
                <h3 className="text-xl text-[#172554] mt-2 mb-3 tracking-tight">
                  Too many applications. Too little time.
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Manual first-pass screening can make it hard to give every candidate a thoughtful review.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-mono text-slate-600">
                  <li className="flex items-center gap-2">Repeated résumé checks</li>
                  <li className="flex items-center gap-2">Slow, inconsistent shortlisting</li>
                  <li className="flex items-center gap-2">Good work can be easy to miss</li>
                </ul>
              </div>
            </div>

            <div className="p-8 bg-[#EFF6FF] border border-blue-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#2563EB] uppercase tracking-[0.25em] font-semibold">
                  A clearer way forward
                </span>
                <h3 className="text-xl text-[#172554] mt-2 mb-3 tracking-tight">
                  Review relevant work together.
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Bring role-based responses and shared reviewer feedback into one place.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-mono text-slate-600">
                  <li className="flex items-center gap-2"><i className="fas fa-check text-[#2563EB]"></i> Compare candidates against the same role criteria</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check text-[#2563EB]"></i> See technical, spoken, and coding responses together</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check text-[#2563EB]"></i> Make room for better-informed conversations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto w-full px-6 py-16">
          <div className="p-10 bg-gradient-to-r from-[#1E40AF] to-[#2563EB] border border-blue-200 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-200/40">
            <div className="flex flex-col gap-2 text-left">
              <span className="text-[10px] font-mono text-blue-100 uppercase tracking-wider">
                For engineering teams
              </span>
              <h3 className="text-2xl sm:text-3xl text-white">
                Ready for a more useful first review?
              </h3>
              <p className="text-xs text-blue-100">
                See how SmartRecruit can fit your team's hiring process.
              </p>
            </div>
            <button
              onClick={() => navigate(isLoggedIn ? (userRole === "recruiter" ? "/recruiter/dashboard" : "/candidate/profile") : "/candidate/SignUpPage")}
              className="bg-white hover:bg-blue-50 text-[#1D4ED8] px-8 py-3.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-900/20 cursor-pointer whitespace-nowrap"
            >
              {isLoggedIn ? "Profile" : "Get started"}
            </button>
          </div>
        </section>

        <footer
          id="contact"
          className="max-w-5xl mx-auto w-full px-6 py-10 border-t border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 uppercase tracking-wider"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#172554]">SmartRecruit</span>
            <span className="text-slate-500">— Technical hiring workspace</span>
          </div>

          <div className="flex gap-6">
            <a href="#" className="hover:text-[#2563EB] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#2563EB] transition-colors">Terms</a>
            <a href="#overview" className="hover:text-[#2563EB] transition-colors">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;