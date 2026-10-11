import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../services/api";

export default function RequireRecruiter({ children }) {
  const [state, setState] = useState("checking");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");
    if (!token) {
      setState("unauthenticated");
      return () => { active = false; };
    }

    api("/api/auth/me")
      .then(({ user }) => {
        if (!active) return;
        if (!user || !["recruiter", "admin"].includes(user.role)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setState("unauthenticated");
          return;
        }
        localStorage.setItem("user", JSON.stringify({
          id: user._id || user.id, name: user.name, email: user.email,
          role: user.role, phone: user.phone || ""
        }));
        setState("authenticated");
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (active) setState("unauthenticated");
      });

    return () => { active = false; };
  }, []);

  if (state === "checking") {
    return <div className="min-h-screen bg-[#021810] text-white flex items-center justify-center">Verifying recruiter session…</div>;
  }
  if (state !== "authenticated") return <Navigate to="/recruiter/login" replace />;
  return children;
}
