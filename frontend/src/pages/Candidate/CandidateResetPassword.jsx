import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function CandidateResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccessMsg("OTP sent to your email!");
      setTimeout(() => {
        setSuccessMsg("");
        setStep(2);
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      });
      setSuccessMsg("Password reset successfully!");
      setTimeout(() => {
        navigate("/candidate/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Password reset failed. Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060F0A] text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-[#09160E] border border-[#12281D] rounded-2xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400">
            {step === 1 ? "Enter your registered email to receive an OTP" : "Enter OTP and your new secure password"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="another-email@gmail.com"
                className="w-full px-4 py-2.5 bg-[#060F0A] border border-[#12281D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer mt-2"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">OTP Code</label>
              <input
                type="text"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="200133"
                className="w-full px-4 py-2.5 bg-[#060F0A] border border-[#12281D] rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password120"
                className="w-full px-4 py-2.5 bg-[#060F0A] border border-[#12281D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Password120"
                className="w-full px-4 py-2.5 bg-[#060F0A] border border-[#12281D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer mt-2"
            >
              {loading ? "Updating Password..." : "Reset Password & Login →"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default CandidateResetPassword;