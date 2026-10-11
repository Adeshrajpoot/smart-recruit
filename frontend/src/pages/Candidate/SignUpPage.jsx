import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import signupImage from "./SignUp.jpeg";
import { API_URL } from "../../config";

function SignUp({ role = "candidate" }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage("Please fill all the fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!formData.agreeTerms) {
      setMessage("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed."
        );
      }

      setMessage("Account created successfully! Redirecting to OTP verification...");
      console.log("Backend response:", data);

      setTimeout(() => {
        navigate("/candidate/verify-otp", {
          state: { email: formData.email, role },
        });
      }, 1500);

    } catch (error) {
      console.error("Signup error:", error);
      setMessage(
        error.message ||
          "Something went wrong. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="main-layout">
         <div className="illustration-section">
          <div className="illustration-container">
            <img src={signupImage} alt="SignUp Illustration" className="illustration-img"/>
          </div>
        </div>

        <div className="form-container-wrapper">
          <div className="container">
           <div className="role-tabs">
              <button type="button"
                className={`role-tab ${role === "candidate" ? "active" : ""}`}
                onClick={() => navigate("/candidate/SignUpPage")}>
                 I'm a Candidate
              </button>
              <button type="button"
                className={`role-tab ${role === "recruiter" ? "active" : ""}`}
                onClick={() => navigate("/recruiter/signup")}>
              I'm a Recruiter
              </button>
            </div>
            <div className="heading">
              Create your {role} account
            </div>
            <p className="subtitle">
              {role === "recruiter"
                ? "Create an account to manage technical hiring and candidate reviews."
                : "Create an account to participate in technical assessments."}
            </p>
            <form className="form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input required
                  className="input"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  required
                  className="input"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="password-wrapper">
                  <input
                    required
                    className="input password-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"}></i>
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    required
                    className="input password-input"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={showConfirmPassword ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"}></i>
                  </button>
                </div>
              </div>
              <div className="terms-container">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({...formData, agreeTerms: e.target.checked})}
                  />
                  <span>
                    I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button
                className="signup-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account →"}
              </button>
            </form>

            {message && (
              <p className="message">
                {message}
              </p>
            )}
            <p className="login-text">
              Already have an account?{" "}
              <span
                onClick={() => navigate(role === "recruiter" ? "/recruiter/login" : "/candidate/login")}>
                Log in
              </span>
            </p>
            <div className="shield-footer">
              Protected by SmartRecruit Shield • Privacy & Terms
            </div>
          </div>
        </div>

      </div>
    </StyledWrapper>
  );
}

// ===============================
// STYLED COMPONENT
// ===============================

const StyledWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  .main-layout {
    display: flex;
    max-width: 1200px;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    padding: 40px;
    gap: 60px;

    @media (max-width: 900px) {
      flex-direction: column;
      padding: 24px;
      gap: 30px;
    }
  }

  .illustration-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;

    @media (max-width: 900px) {
      display: none;
    }
  }

  .illustration-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    height: 540px;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  .illustration-img {
    width: 85%;
    height: 85%;
    object-fit: contain;
    z-index: 5;
    position: relative;
  }

  .form-container-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .container {
    width: 100%;
    max-width: 440px;
    background: #ffffff;
    padding: 0;
    border: none;
    box-shadow: none;
  }

  .role-tabs {
    display: flex;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .role-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &.active {
      background: #2563EB;
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  .heading {
    text-align: left;
    font-weight: 700;
    font-size: 24px;
    color: #0f172a;
    letter-spacing: -0.5px;
  }

  .subtitle {
    text-align: left;
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
    margin-bottom: 20px;
  }

  .form {
    margin-top: 10px;
  }

  .input-group {
    margin-bottom: 14px;
  }

  .input-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 6px;
  }

  .form .input {
    width: 100%;
    box-sizing: border-box;
    background: #ffffff;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    transition: all 0.2s ease-in-out;
  }

  .form .input::placeholder {
    color: #94a3b8;
  }

  .form .input:focus {
    outline: none;
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-input {
    padding-right: 40px !important;
  }

  .eye-toggle {
    position: absolute;
    right: 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .terms-container {
    margin: 16px 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #475569;
    cursor: pointer;

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #2563EB;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      cursor: pointer;
    }

    a {
      color: #2563EB;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .signup-button {
    display: block;
    width: 100%;
    font-weight: 600;
    background: #2563EB;
    color: white;
    padding: 11px;
    margin: 16px 0 0 0;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .signup-button:hover {
    background: #1D4ED8;
  }

  .signup-button:active {
    transform: scale(0.99);
  }

  .signup-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .message {
    text-align: center;
    font-size: 13px;
    margin-top: 12px;
    color: #2563EB;
    font-weight: 500;
  }

  .login-text {
    text-align: center;
    font-size: 13px;
    color: #64748b;
    margin-top: 20px;
  }

  .login-text span {
    color: #2563EB;
    font-weight: 600;
    cursor: pointer;
  }

  .login-text span:hover {
    text-decoration: underline;
  }

  .shield-footer {
    text-align: center;
    font-size: 11px;
    color: #94a3b8;
    margin-top: 24px;
  }
`;

export default SignUp;