import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUpload } from "../../services/api";

function CandidateProfileCompletion() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        college: "",
        githubUrl: ""
    });

    const [resumeFile, setResumeFile] = useState({
        name: "",
        size: 2.4 * 1024 * 1024
    });

    const [resumeError, setResumeError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const maxSize = 10 * 1024 * 1024;

            if (file.size > maxSize) {
                setResumeError("File size exceeds 10 MB. Please upload a smaller file.");
                return;
            }

            setResumeError("");
            setResumeFile(file);
        }
    };

    // Uploads resume + GitHub URL to the backend (which calls the ML service).
    // If nothing new was chosen, behaves exactly as before and just continues.
    const handleSaveAndContinue = async () => {
        if (resumeError) return;
        setSaveError("");

        if (resumeFile instanceof File && formData.githubUrl) {
            if (!resumeFile.name.toLowerCase().endsWith(".pdf")) {
                setSaveError("Please upload your resume as a PDF.");
                return;
            }
            try {
                setSaving(true);
                const body = new FormData();
                body.append("resume", resumeFile);
                body.append("githubUrl", formData.githubUrl);
                await apiUpload("/api/profile/analyze", body);
            } catch (err) {
                setSaveError(err.message || "Could not save your profile.");
                setSaving(false);
                return;
            }
            setSaving(false);
        }
        navigate("/");
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col justify-between font-sans selection:bg-[#2563EB] selection:text-white">
            <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/20">
                        S
                    </div>
                    <div>
                        <span className="font-bold text-sm tracking-tight text-[#0F172A] block">SmartRecruit</span>
                        <span className="text-[10px] text-[#2563EB] font-medium tracking-wide uppercase">CANDIDATE PORTAL</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2.5 bg-[#EFF6FF] border border-blue-100 pl-2 pr-3 py-1 rounded-xl shadow-sm">
                    <div className="w-7 h-7 bg-[#2563EB] text-white rounded-lg flex items-center justify-center text-xs font-bold">
                        {formData.fullName ? formData.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "AP"}
                    </div>
                    <span className="text-xs font-semibold text-[#1E293B]">{formData.fullName || "Your Name"}</span>
                </div>
            </header>

            <div className="bg-white border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-500 font-medium">
                    <span className="text-[#2563EB] font-semibold">01 About you</span>
                    <span>/</span>
                    <span>Assessment</span>
                    <span>/</span>
                    <span>Review</span>
                </div>
                <div className="text-slate-500">
                    Step 1 of 3
                </div>
            </div>

            <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 my-6 flex flex-col lg:flex-row gap-8 flex-grow">
                <div className="flex-grow space-y-8">
                    <div className="space-y-2">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-[#2563EB]">1 CANDIDATE PROFILE & APPLICATION</span>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">Complete your profile.</h1>
                        <p className="text-slate-600 text-xs sm:text-sm">
                            A few details help the hiring team put your work in context. You can review everything before you continue.
                        </p>
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-bold text-[#0F172A]">Your details</h2>
                            <span className="text-[11px] text-slate-500"><span className="text-[#2563EB]">*</span> Required</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#334155] block">
                                    Full name <span className="text-[#2563EB]">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-colors font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#334155] block">
                                    Email address <span className="text-[#2563EB]">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="candidate@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-colors font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#334155] block">
                                    Phone number <span className="text-[#2563EB]">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-colors font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#334155] block">
                                    College or university <span className="text-[#2563EB]">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="college"
                                    placeholder="Enter your college or university name"
                                    value={formData.college}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-colors font-medium shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-bold text-[#0F172A]">Your resume</h2>
                            <span className="text-[11px] text-slate-500">PDF or DOCX · up to 10 MB</span>
                        </div>

                        <div className={`bg-white border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${resumeError ? 'border-red-500' : 'border-blue-100'}`}>
                            <div className="flex items-center space-x-3.5 w-full sm:w-auto">
                                <div className="w-10 h-10 bg-[#EFF6FF] text-[#2563EB] border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-file-pdf text-lg"></i>
                                </div>
                                <div className="space-y-0.5 overflow-hidden">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                                            {resumeFile ? resumeFile.name : "Upload your resume (PDF/DOCX)"}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        {resumeFile ? `${formatFileSize(resumeFile.size)} · Uploaded just now` : "PDF or DOCX · Up to 10 MB"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end text-xs font-semibold">
                                <label className="text-[#2563EB] hover:underline cursor-pointer">
                                    <span>Replace file</span>
                                    <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
                                </label>
                                <span className="text-slate-300">|</span>
                                <button
                                    type="button"
                                    onClick={() => alert("Previewing resume...")}
                                    className="text-[#2563EB] hover:underline cursor-pointer bg-transparent border-none"
                                >
                                    Preview
                                </button>
                            </div>
                        </div>

                        {resumeError && (
                            <p className="text-xs text-red-600 font-medium flex items-center space-x-1 pt-1">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                                <span>{resumeError}</span>
                            </p>
                        )}
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-bold text-[#0F172A]">Show us what you've built</h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#334155] block">
                                GitHub profile or project
                            </label>
                            <input
                                type="url"
                                name="githubUrl"
                                placeholder="https://github.com/your-username/project-repo"
                                value={formData.githubUrl}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-colors font-mono shadow-sm"
                            />
                        </div>

                        <div className="text-[11px] text-slate-500 pt-1">
                            Share a profile or one project you're proud of.
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center space-x-1 pt-1">
                        <i className="fa-solid fa-lock text-[10px] text-[#2563EB]"></i>
                        <span>Your details stay within this hiring process.</span>
                        <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy details modal"); }} className="text-[#2563EB] hover:underline ml-1">
                            How we use your information →
                        </a>
                    </div>

                    {saveError && (
                        <p className="text-xs text-red-600 font-medium">{saveError}</p>
                    )}

                    <div className="pt-6 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button
                            type="button"
                            disabled={Boolean(resumeError) || saving}
                            onClick={handleSaveAndContinue}
                            className={`w-full sm:w-auto px-6 py-3 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 ${
                                resumeError 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none' 
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer shadow-blue-500/20'
                            }`}
                        >
                            <span>{saving ? "Analyzing your profile..." : "Save and continue"}</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-blue-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                    <span>© SmartRecruit · Candidate portal</span>
                </div>

                <div className="flex items-center space-x-6 text-xs">
                    <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-[#2563EB] transition-colors">Candidate terms</a>
                    <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-[#2563EB] transition-colors">Privacy</a>
                    <a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-[#2563EB] transition-colors">Support</a>
                </div>
            </footer>
        </div>
    );
}

export default CandidateProfileCompletion;