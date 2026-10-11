import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/Candidate/SignUpPage";
import CandidateLogin from "./pages/Candidate/CandidateLogin";
import CandidateProfileCompletion from "./pages/Candidate/CandidateProfileCompletion";
import CandidateInstructions from "./pages/Candidate/CandidateInstructions";
import CandidateSystemCheck from "./pages/Candidate/CandidateSystemCheck";
import RecruiterLogin from "./pages/Recruiter/RecruiterLogin";
import RecruiterSignUpPage from "./pages/Recruiter/RecruiterSignUpPage";
import RecruiterDashboard from "./pages/Recruiter/RecruiterDashboard";
import CandidateAssessmentOverview from "./pages/Candidate/CandidateAssessmentOverview";
import CandidateActiveAssessment from "./pages/Candidate/CandidateActiveAssessment";
import AssessmentComplete from "./pages/Candidate/AssessmentComplete";
import CandidateVerifyOtp from "./pages/Candidate/CandidateVerifyOtp";
import CandidateResetPassword from "./pages/Candidate/CandidateResetPassword";
import CandidateAssessmentReview from "./pages/Recruiter/CandidateAssessmentReview";
import CandidatesMonitoring from "./pages/Recruiter/CandidatesMonitoring";
import CreateAssessment from "./pages/Recruiter/CreateAssessment";
import RequireRecruiter from "./components/RequireRecruiter";
import CandidateAssessmentResults from "./pages/Candidate/CandidateAssessmentResults";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/candidate/SignUpPage" element={<SignUpPage />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/reset-password" element={<CandidateResetPassword />} />
        <Route path="/candidate/verify-otp" element={<CandidateVerifyOtp />} />
        <Route path="/candidate/profile" element={<CandidateProfileCompletion />} />
        <Route path="/candidate/instructions" element={<CandidateInstructions />} />
        <Route path="/candidate/system-check" element={<CandidateSystemCheck />} />
        <Route path="/candidate/assessment-overview" element={<CandidateAssessmentOverview />} />
        <Route path="/candidate/assessment" element={<CandidateActiveAssessment />} />
        <Route path="/recruiter/login" element={<RecruiterLogin />} />
        <Route path="/recruiter/signup" element={<RecruiterSignUpPage />} />
        <Route path="/recruiter/dashboard" element={<RequireRecruiter><RecruiterDashboard /></RequireRecruiter>} />
        <Route path="/recruiter/candidates" element={<RequireRecruiter><CandidatesMonitoring /></RequireRecruiter>} />
        <Route path="/recruiter/assessments/create" element={<RequireRecruiter><CreateAssessment /></RequireRecruiter>} />
        <Route path="/recruiter/candidates/:candidateId/review" element={<RequireRecruiter><CandidateAssessmentReview /></RequireRecruiter>} />
        <Route path="/recruiter/assessment/create" element={<RequireRecruiter><CreateAssessment /></RequireRecruiter>} />
        <Route path="/candidate/assessment-complete" element={<AssessmentComplete />} />
        <Route path="/candidate/results" element={<CandidateAssessmentResults />} />
      </Routes>
    </Router>
  );
}

export default App;