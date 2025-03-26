import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import ResumeUpload from "./home.jsx";
import JobDetails from "./JobDetails.jsx"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<ResumeUpload />} />
        <Route path="/job-details/:jobId" element={<JobDetails />} />
      </Routes>
    </Router>
  </StrictMode>
);