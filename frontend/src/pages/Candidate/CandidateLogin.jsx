import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "./Login.jpeg";
import { api } from "../../services/api";

function CandidateLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }
    
    setLoading(true);
    setMessage("");

    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password, role: "candidate" }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login successful!");
      setTimeout(() => {
        navigate("/candidate/profile", { replace: true });
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full overflow-hidden bg-white">
      <div className="hidden md:block w-[58%] relative min-h-screen">
        <img src={loginImage} alt="Login illustration"
          className="absolute inset-0 w-full h-full object-cover scale-95 origin-center"/>
      </div>
      <div className="w-full md:w-[42%] min-h-screen flex items-center justify-center px-6 sm:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome to <span className="text-[#2563EB]">SmartRecruit</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Login to continue to your assessment platform.
          </p>

          <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl mt-6">
            <button type="button"
              className="w-1/2 py-2.5 bg-[#2563EB] text-white font-medium rounded-lg shadow-sm transition-all"
              onClick={() => navigate("/candidate/login")}>
              I'm a Candidate
            </button>
            <button
              type="button"
              className="w-1/2 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-all"
              onClick={() => navigate("/recruiter/login")}>
              I'm a Recruiter
            </button>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-600 mb-1.5">
                Email
              </label>
              <input type="email" placeholder="Enter your email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                required/>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-600 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 pr-12 text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                  required/>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-sm"
                >
                  {showPassword ? "!" : "👁"}
                </button>
              </div>
            </div>
            <div className="text-right">
              <button type="button" onClick={() => navigate("/candidate/reset-password")}
                className="text-xs text-[#2563EB] font-semibold hover:underline cursor-pointer">
                Forgot password?
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white rounded-xl font-medium shadow-md shadow-blue-700/20 transition-all cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {message && (
            <div className={`mt-4 text-center text-sm ${
                message.toLowerCase().includes("successful") ? "text-[#2563EB]" : "text-red-600"}`}
            >
              {message}
            </div>
          )}

          <div className="text-center mt-6 text-sm">
            <span className="text-slate-500">
              Don't have an account?
            </span>
            <button type="button" onClick={() => navigate("/candidate/SignUpPage")}
              className="ml-1.5 text-[#2563EB] font-semibold hover:underline cursor-pointer">
              Create Account
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-12">
            Protected by SmartRecruit Shield • Privacy & Terms
          </p>
        </div>
      </div>
    </div>
  );
}

export default CandidateLogin;