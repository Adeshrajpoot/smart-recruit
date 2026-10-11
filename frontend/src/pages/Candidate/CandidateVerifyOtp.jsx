import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../../config";

function CandidateVerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmail = location.state?.email || "";
  const userType = location.state?.role || "candidate";

  const [email] = useState(passedEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!passedEmail) {
      setErrorMsg("Signup email is missing. Please sign up again to receive a verification code.");
      setLoading(false);
      return;
    }

    const payload = { email, otp };

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "OTP verification failed");
      }

      setSuccessMsg("OTP verified successfully!");
      setTimeout(() => {
        navigate(userType === "recruiter" ? "/recruiter/login" : "/candidate/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong while verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-blue-100 rounded-2xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-[#0F172A]">Verify Your Email</h2>
          <p className="text-xs text-slate-500">
            Enter the 6-digit verification code sent to <span className="text-[#2563EB] font-mono font-semibold">{email}</span>
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[#2563EB] text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">OTP Code</label>
            <input
              type="text"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="282760"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CandidateVerifyOtp;