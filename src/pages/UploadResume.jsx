import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/resume.css";
import { uploadResumeForRecommendations, checkJobApiHealth } from "../utils/api";
import { getMatchingJobs, generateUserStrengths, generateImprovementAreas } from "../utils/jobMatchingService";
import { extractResumeText, extractStructuredData } from "../utils/resumeParser";
import { calculateATSScore } from "../utils/atsScoring";

const UploadResume = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [file, setFile] = useState(null);
  const [jobPreference, setJobPreference] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [workStyle, setWorkStyle] = useState("");
  const [personalValues, setPersonalValues] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [atsScore, setAtsScore] = useState(null);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  // Check if user is logged in when the component mounts
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    const checkApiStatus = async () => {
      const isAvailable = await checkJobApiHealth();
      setApiAvailable(isAvailable);
    };

    checkApiStatus();
  }, []);

  // Check if form is complete for current step
  useEffect(() => {
    if (currentStep === 1) {
      setFormComplete(jobPreference && experienceLevel && workStyle);
    } else if (currentStep === 2) {
      setFormComplete(personalValues && careerGoals);
    } else if (currentStep === 3) {
      setFormComplete(!!file);
    }
  }, [currentStep, jobPreference, experienceLevel, workStyle, personalValues, careerGoals, file]);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setErrorMessage("");

      try {
        // Extract resume text
        setIsLoading(true);
        const extractedText = await extractResumeText(selectedFile);
        setResumeText(extractedText);

        // Analyze the resume for ATS compatibility
        const atsAnalysisResult = calculateATSScore(extractedText);
        setAtsScore(atsAnalysisResult.score);
        setAtsAnalysis(atsAnalysisResult);

        // Extract structured data
        const extractedData = extractStructuredData(extractedText);
        setResumeData(extractedData);
        setExtractedSkills(extractedData.skills);

        // Save ATS score and feedback to localStorage
        localStorage.setItem("atsScore", atsAnalysisResult.score);
        localStorage.setItem("atsFeedback", JSON.stringify(atsAnalysisResult.feedback));
        localStorage.setItem("userSkills", JSON.stringify(extractedData.skills));

        setIsLoading(false);
      } catch (error) {
        console.error("Error processing resume:", error);
        setErrorMessage("Failed to process resume. Please try another file.");
        setIsLoading(false);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setErrorMessage("");

      try {
        // Extract resume text
        setIsLoading(true);
        const extractedText = await extractResumeText(droppedFile);
        setResumeText(extractedText);

        // Analyze the resume for ATS compatibility
        const atsAnalysisResult = calculateATSScore(extractedText);
        setAtsScore(atsAnalysisResult.score);
        setAtsAnalysis(atsAnalysisResult);

        // Extract structured data
        const extractedData = extractStructuredData(extractedText);
        setResumeData(extractedData);
        setExtractedSkills(extractedData.skills);

        // Save ATS score and feedback to localStorage
        localStorage.setItem("atsScore", atsAnalysisResult.score);
        localStorage.setItem("atsFeedback", JSON.stringify(atsAnalysisResult.feedback));
        localStorage.setItem("userSkills", JSON.stringify(extractedData.skills));

        setIsLoading(false);
      } catch (error) {
        console.error("Error processing resume:", error);
        setErrorMessage("Failed to process resume. Please try another file.");
        setIsLoading(false);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file first!");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Save user preferences to localStorage for personalized suggestions across the app
      const userPreferences = {
        jobPreference,
        experienceLevel,
        workStyle,
        personalValues,
        careerGoals
      };
      localStorage.setItem("userPreferences", JSON.stringify(userPreferences));

      // If we already have the resume text and ATS score from file upload, use those
      // Otherwise, try to extract them again
      let extractedText = resumeText;
      let extractedData = resumeData;
      let atsResults = atsAnalysis;

      if (!extractedText) {
        try {
          extractedText = await extractResumeText(file);
          setResumeText(extractedText);

          extractedData = extractStructuredData(extractedText);
          setResumeData(extractedData);

          atsResults = calculateATSScore(extractedText);
          setAtsScore(atsResults.score);
          setAtsAnalysis(atsResults);
        } catch (error) {
          console.error("Error processing resume:", error);
        }
      }

      const skills = extractedData?.skills || [];
      setExtractedSkills(skills);

      // Save extracted skills to localStorage for use in job matching
      localStorage.setItem("userSkills", JSON.stringify(skills));

      if (apiAvailable) {
        // Use the backend API for job recommendations
        const result = await uploadResumeForRecommendations(file);

        // Merge skills from API with extracted skills if both available
        const mergedSkills = [...new Set([
          ...(result.skills_extracted || []),
          ...skills
        ])];

        setExtractedSkills(mergedSkills);
        localStorage.setItem("userSkills", JSON.stringify(mergedSkills));

        // Get matching jobs from our job matching service
        const matchingJobs = getMatchingJobs(userPreferences, mergedSkills);

        // Generate personalized strengths and improvement areas
        const strengths = generateUserStrengths(userPreferences, mergedSkills);
        const improvements = generateImprovementAreas(userPreferences, matchingJobs);

        // If we have matching jobs, use them; otherwise, use the API results
        const jobSuggestions = matchingJobs.length > 0
          ? matchingJobs
          : result.jobs;

        // Set the recommendation
        setRecommendation({
          eligibilityMessage: matchingJobs.length > 0
            ? `Based on your profile and skills, we found ${matchingJobs.length} matching jobs.`
            : `Based on your skills, we found ${result.jobs.length} matching jobs.`,
          pros: strengths,
          cons: improvements,
          jobSuggestions: jobSuggestions,
          atsScore: atsResults?.score || null,
          atsFeedback: atsResults?.feedback || []
        });
      } else {
        // Fallback to frontend-based recommendations if API is not available
        generateFrontendRecommendations(skills);
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setErrorMessage("Failed to get recommendations. Please try again.");
      generateFrontendRecommendations(extractedSkills); // Fallback to frontend recommendations on error
    } finally {
      setIsLoading(false);
    }
  };

  // Generate frontend-based recommendations when API is not available
  const generateFrontendRecommendations = (skills = []) => {
    // Get the user's preferences in a single object
    const userPreferences = {
      jobPreference,
      experienceLevel,
      workStyle,
      personalValues,
      careerGoals
    };

    // Save to localStorage even for frontend-based recommendations
    localStorage.setItem("userPreferences", JSON.stringify(userPreferences));

    // Use extracted skills if available, otherwise use mock skills
    const finalSkills = skills.length > 0 ? skills : getMockSkillsForIndustry(jobPreference);
    localStorage.setItem("userSkills", JSON.stringify(finalSkills));

    // Get matching jobs from our job matching service
    const matchingJobs = getMatchingJobs(userPreferences, finalSkills);

    if (matchingJobs.length > 0) {
      // Generate personalized strengths and improvement areas
      const strengths = generateUserStrengths(userPreferences, finalSkills);
      const improvements = generateImprovementAreas(userPreferences, matchingJobs);

      setRecommendation({
        eligibilityMessage: `Based on your profile, we found ${matchingJobs.length} matching jobs.`,
        pros: strengths,
        cons: improvements,
        jobSuggestions: matchingJobs,
        atsScore: atsScore,
        atsFeedback: atsAnalysis?.feedback || []
      });
    } else {
      // Simple AI logic for frontend-based recommendations when no job matches are found
    let eligibilityMessage = "";
    let pros = [];
    let cons = [];
      let jobSuggestions = [];

    if (experienceLevel === "Entry Level") {
      eligibilityMessage = "You are eligible for entry-level roles.";
        pros.push("Fresh perspective and adaptability", "Strong potential for growth", "Open to learning new skills");
        cons.push("Limited industry experience", "May require additional training");
        jobSuggestions = [
          { position: "Junior Developer", company: "Tech Solutions Inc.", location: "New York, NY" },
          { position: "Junior Data Analyst", company: "Data Insights LLC", location: "San Francisco, CA" },
          { position: "Marketing Associate", company: "Brand Builders", location: "Chicago, IL" }
        ];
    } else if (experienceLevel === "Mid-Level") {
      eligibilityMessage = "You have relevant experience for mid-level roles.";
        pros.push("Strong technical skills", "Proven track record", "Good industry exposure");
      cons.push("Need to demonstrate leadership potential", "Specialization might be required");
        jobSuggestions = [
          { position: "Senior Developer", company: "Software Giants", location: "Austin, TX" },
          { position: "Project Manager", company: "Project Masters", location: "Boston, MA" },
          { position: "Marketing Manager", company: "Marketing Pros", location: "Seattle, WA" }
        ];
    } else if (experienceLevel === "Senior") {
        eligibilityMessage = "You are well-qualified for senior and leadership roles.";
        pros.push("Extensive experience", "Leadership capabilities", "Strategic thinking");
        cons.push("Higher competition for leadership roles", "Need to show innovation capability");
        jobSuggestions = [
          { position: "Engineering Lead", company: "Tech Innovators", location: "San Jose, CA" },
          { position: "Director of Marketing", company: "Global Brands", location: "Los Angeles, CA" },
          { position: "Department Head", company: "Enterprise Solutions", location: "Denver, CO" }
        ];
    } else {
      eligibilityMessage = "Select an experience level to get a better recommendation.";
        jobSuggestions = [
          { position: "Software Engineer", company: "Tech Company", location: "Remote" },
          { position: "Marketing Specialist", company: "Marketing Agency", location: "New York, NY" },
          { position: "Data Analyst", company: "Analytics Inc", location: "Chicago, IL" }
        ];
      }

      // Add ATS score to recommendation
      setRecommendation({
        eligibilityMessage,
        pros,
        cons,
        jobSuggestions,
        atsScore: atsScore,
        atsFeedback: atsAnalysis?.feedback || []
      });
    }
  };

  // Generate mock skills for frontend-based recommendations
  const getMockSkillsForIndustry = (industry) => {
    const skillSets = {
      "Software Development": ["javascript", "react", "python", "problem solving", "teamwork"],
      "Data Science": ["python", "data analysis", "statistics", "machine learning", "sql"],
      "Marketing": ["social media", "content creation", "analytics", "communication", "creativity"],
      "Finance": ["financial analysis", "excel", "accounting", "communication", "attention to detail"],
      "Healthcare": ["patient care", "medical terminology", "communication", "teamwork", "empathy"],
      "Education": ["curriculum development", "communication", "leadership", "adaptability", "organization"],
      "E-commerce": ["digital marketing", "sales", "customer service", "analytics", "product management"],
      "Consulting": ["problem solving", "communication", "presentation", "analysis", "leadership"],
      "Manufacturing": ["quality control", "process improvement", "technical skills", "teamwork", "attention to detail"]
    };

    return skillSets[industry] || ["communication", "teamwork", "adaptability", "problem solving", "organization"];
  };

  const filterJobsByLocation = (jobs) => {
    if (!jobs) return [];
    if (selectedLocation === 'all') return jobs;

    return jobs.filter(job => job.location === selectedLocation);
  };

  const industries = [
    "Software Development",
    "Data Science",
    "Marketing",
    "Finance",
    "Healthcare",
    "Education",
    "E-commerce",
    "Consulting",
    "Manufacturing",
    "Other"
  ];

  const renderStepOne = () => (
    <>
      <div className="form-header">
        <div className="form-title">
          <h2>Career Preferences</h2>
          <p>Tell us about your ideal work environment</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
        <label>Preferred Industry:</label>
          <select
            value={jobPreference}
            onChange={(e) => setJobPreference(e.target.value)}
            required
          >
          <option value="">Select an industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
        </select>
        </div>

        <div className="form-group">
        <label>Experience Level:</label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            required
          >
          <option value="">Select experience level</option>
          <option value="Entry Level">Entry Level</option>
          <option value="Mid-Level">Mid-Level</option>
          <option value="Senior">Senior</option>
          <option value="Executive">Executive</option>
        </select>
        </div>
      </div>

      <div className="form-group">
        <label>Preferred Work Style:</label>
        <div className="work-style-options">
          <div
            className={`work-style-option ${workStyle === "Remote" ? "selected" : ""}`}
            onClick={() => setWorkStyle("Remote")}
          >
            <span className="work-icon">🏠</span>
            <span>Remote</span>
          </div>
          <div
            className={`work-style-option ${workStyle === "Hybrid" ? "selected" : ""}`}
            onClick={() => setWorkStyle("Hybrid")}
          >
            <span className="work-icon">🔄</span>
            <span>Hybrid</span>
          </div>
          <div
            className={`work-style-option ${workStyle === "On-Site" ? "selected" : ""}`}
            onClick={() => setWorkStyle("On-Site")}
          >
            <span className="work-icon">🏢</span>
            <span>On-Site</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderStepTwo = () => (
    <>
      <div className="form-header">
        <div className="form-title">
          <h2>Career Goals</h2>
          <p>Tell us about your aspirations</p>
        </div>
      </div>

      <div className="form-group">
        <label>What do you value most in a job?</label>
        <input
          type="text"
          placeholder="e.g., Work-life balance, Growth opportunities, Team culture"
          value={personalValues}
          onChange={(e) => setPersonalValues(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Describe your career goals:</label>
        <textarea
          placeholder="e.g., I want to transition into a leadership role in the tech industry..."
          value={careerGoals}
          onChange={(e) => setCareerGoals(e.target.value)}
          required
        />
      </div>
    </>
  );

  // Add ATS score component to step 3
  const renderAtsScorePreview = () => {
    if (!atsScore) return null;

    const getScoreColor = () => {
      if (atsScore >= 80) return "#4caf50"; // Green
      if (atsScore >= 60) return "#ff9800"; // Orange
      return "#f44336"; // Red
    };

    const getScoreMessage = () => {
      if (atsScore >= 80) return "Great! Your resume is well-optimized for ATS systems.";
      if (atsScore >= 60) return "Your resume needs some improvements for better ATS compatibility.";
      return "Your resume requires significant improvements to pass ATS systems.";
    };

    return (
      <div className="ats-score-preview">
        <h3>Resume ATS Score</h3>
        <div className="score-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
          <div className="resume-strength-circle" style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '15px'
            }}>
            <svg width="90" height="90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#f0f9f6"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#09B294"
                strokeWidth="12"
                strokeDasharray="339.292"
                strokeDashoffset={(339.292 * (1 - 95/100))}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '32%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 'px',
              fontWeight: 'bold',
              color: '#212B36'
            }}>
              95
            </div>
            <div style={{
              marginTop: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#637381',
              textTransform: 'uppercase'
            }}>
              RESUME STRENGTH
            </div>
          </div>
          <div className="score-details" style={{ flex: '1' }}>
            <p className="score-message" style={{ color: getScoreColor(), fontWeight: '600', marginBottom: '12px' }}>{getScoreMessage()}</p>
            {atsAnalysis?.feedback && atsAnalysis.feedback.length > 0 && (
              <div className="score-feedback">
                <p><strong>Key Insights:</strong></p>
                <ul style={{ marginTop: '8px', paddingLeft: '5px', listStyleType: 'none' }}>
                  {atsAnalysis.feedback.slice(0, 3).map((feedback, index) => (
                    <li key={index} style={{ display: 'flex', marginBottom: '8px', alignItems: 'flex-start' }}>
                      <span className="feedback-icon" style={{ marginRight: '8px', fontSize: '16px' }}>
                        {index === 0 ? '🔍' : index === 1 ? '💡' : '✓'}
                      </span>
                      <span className="feedback-text" style={{ fontSize: '14px', color: '#334155', flex: '1' }}>{feedback}</span>
                    </li>
                  ))}
                </ul>
                {atsAnalysis.feedback.length > 3 && (
                  <p className="more-feedback" style={{ fontSize: '13px', color: '#64748b', marginTop: '5px' }}>+ {atsAnalysis.feedback.length - 3} more insights available in dashboard</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="view-details" style={{ marginTop: '15px', textAlign: 'right' }}>
          <Link to="/dashboard" className="view-details-link" style={{ display: 'inline-flex', alignItems: 'center', color: '#4a6cf7', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
            View detailed analysis in your dashboard
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    );
  };

  // Define the renderStepThree function - keep only this implementation
  const renderStepThree = () => (
    <div className="upload-step">
      <h2>Upload Your Resume</h2>
      <p>Upload your resume to get personalized job recommendations and insights.</p>

      <div
        className={`file-upload-area ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="resume-upload"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
          className="file-input"
        />
        <label htmlFor="resume-upload" className="file-label">
          <div className="upload-illustration">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M65 47.5V62.5C65 63.8261 64.4732 65.0979 63.5355 66.0355C62.5979 66.9732 61.3261 67.5 60 67.5H20C18.6739 67.5 17.4021 66.9732 16.4645 66.0355C15.5268 65.0979 15 63.8261 15 62.5V47.5" stroke="#4A6CF7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M55 32.5L40 17.5L25 32.5" stroke="#4A6CF7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M40 17.5V52.5" stroke="#4A6CF7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {file ? (
            <div className="file-selected">
              <div className="file-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#4A6CF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="#4A6CF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke="#4A6CF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke="#4A6CF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 9H9H8" stroke="#4A6CF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
              </div>
              <button
                className="remove-file"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                  setResumeText("");
                  setAtsScore(null);
                  setAtsAnalysis(null);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="upload-content">
              <h3>Drag & drop your resume here</h3>
              <p>or <span className="browse-text">browse files</span> from your computer</p>
              <div className="accepted-formats">Accepted formats: PDF, DOC, DOCX, TXT</div>
            </div>
          )}
        </label>
      </div>

      {errorMessage && (
        <div className="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#F43F5E" strokeWidth="2"/>
            <path d="M12 8V12" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 16H12.01" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {errorMessage}
        </div>
      )}

      {file && renderAtsScorePreview()}
    </div>
  );

  // Add ATS score to recommendation display
  const renderRecommendation = () => {
    if (!recommendation) return null;

    return (
      <div className="recommendation-container">
        <h2>Your Personalized Resume Analysis</h2>

        {recommendation.atsScore && (
          <div className="ats-score-section">
            <div className="ats-score-header">
              <h3>ATS Compatibility Score</h3>
              <div className="ats-score-badge">
                <span className="score-value">{recommendation.atsScore}</span>
                <span className="score-max">/100</span>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${recommendation.atsScore}%`,
                    backgroundColor: recommendation.atsScore >= 80 ? '#4caf50' : recommendation.atsScore >= 60 ? '#ff9800' : '#f44336'
                  }}
                ></div>
              </div>
              <div className="progress-label">
                {recommendation.atsScore >= 80
                  ? "Your resume is well-optimized for ATS systems"
                  : recommendation.atsScore >= 60
                    ? "Your resume needs some improvements for ATS compatibility"
                    : "Your resume requires significant improvements"
                }
              </div>
            </div>

            {recommendation.atsFeedback && recommendation.atsFeedback.length > 0 && (
              <div className="ats-feedback">
                <h4>Key Insights:</h4>
                <ul className="feedback-list">
                  {recommendation.atsFeedback.slice(0, 5).map((feedback, index) => (
                    <li key={index}>
                      <span className="feedback-icon">
                        {index % 3 === 0 ? '🔍' : index % 3 === 1 ? '💡' : '✓'}
                      </span>
                      <span className="feedback-text">{feedback}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="eligibility-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <p>{recommendation.eligibilityMessage}</p>
        </div>

        <div className="strengths-weaknesses">
          <div className="strengths">
            <div className="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
              <h3>Your Strengths</h3>
            </div>
          <ul>
            {recommendation.pros.map((pro, index) => (
              <li key={index}>{pro}</li>
            ))}
          </ul>
          </div>

          <div className="improvement-areas">
            <div className="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>Areas for Improvement</h3>
            </div>
          <ul>
            {recommendation.cons.map((con, index) => (
              <li key={index}>{con}</li>
            ))}
          </ul>
        </div>
        </div>

        <div className="job-matches">
          <div className="section-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <h3>Job Matches</h3>
          </div>

          <div className="location-filter">
            <label htmlFor="location-filter">Filter by location: </label>
            <select
              id="location-filter"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {/* ...rest of locations */}
            </select>
          </div>

          <div className="job-list">
            {filterJobsByLocation(recommendation.jobSuggestions).map((job, index) => (
              <div className="job-card" key={index}>
                <h4>{job.position}</h4>
                <p className="company">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  {job.company}
                </p>
                <p className="location">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {job.location}
                </p>
                {job.matchScore && (
                  <div className="match-score">
                    <span className="score-label">Match:</span>
                    <div className="match-progress">
                      <div
                        className="match-fill"
                        style={{ width: `${job.matchScore}%` }}
                      ></div>
                    </div>
                    <span className="score-value">{job.matchScore}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="final-actions">
          <button
            onClick={() => navigate("/dashboard")}
            className="dashboard-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            View Dashboard
          </button>
          <button
            onClick={() => setRecommendation(null)}
            className="try-again-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 2v6h6M21.5 22v-6h-6"></path>
              <path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"></path>
            </svg>
            Try Different Resume
          </button>
        </div>
      </div>
    );
  };

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="upload-page-container">
        <div className="auth-required-container">
          <div className="auth-required-card">
            <div className="auth-required-icon">🔒</div>
            <h2>Authentication Required</h2>
            <p>You need to be logged in to upload your resume and get AI-powered job recommendations.</p>
            <div className="auth-required-buttons">
              <Link to="/login" className="auth-button">Sign In</Link>
              <Link to="/signup" className="auth-button secondary">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page-container">
      <div className="upload-container">
        <h1>Upload Your Resume</h1>
        <p>Help us understand your job preferences to enhance AI recommendations.</p>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="progress-bar-container">
          <div className="progress-steps">
            <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <span className="step-label">Preferences</span>
            </div>
            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <span className="step-label">Goals</span>
            </div>
            <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span className="step-label">Upload</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${(currentStep - 1) * 50}%`}}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="step-container">
            {currentStep === 1 && renderStepOne()}
            {currentStep === 2 && renderStepTwo()}
            {currentStep === 3 && renderStepThree()}
          </div>

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={prevStep}
              >
                Back
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={nextStep}
                disabled={!formComplete}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className={isLoading ? "btn-primary loading" : "btn-primary"}
                disabled={isLoading || !formComplete}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing Resume...
                  </>
                ) : (
                  "Generate AI Recommendations"
                )}
              </button>
            )}
          </div>
        </form>

        {recommendation && (
          <div className="recommendation-box">
            <div className="recommendation-header">
              <h2>AI Career Recommendations</h2>
              <div className="recommendation-badge">
                <span className="badge-icon">✨</span>
                <span>AI-Powered</span>
              </div>
            </div>

            <p className="eligibility-message">{recommendation.eligibilityMessage}</p>

            {extractedSkills.length > 0 && (
              <div className="skills-extracted">
                <h3>Skills Extracted from Your Resume</h3>
                <div className="skills-tags">
                  {extractedSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="recommendation-grid">
              <div className="recommendation-section">
                <h3>Strengths</h3>
                <ul className="strength-list">
                  {recommendation.pros.map((pro, index) => (
                    <li key={index}>
                      <span className="pro-icon">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="recommendation-section">
                <h3>Areas for Growth</h3>
                <ul className="growth-list">
                  {recommendation.cons.map((con, index) => (
                    <li key={index}>
                      <span className="con-icon">!</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {recommendation.jobSuggestions && recommendation.jobSuggestions.length > 0 && (
              <div className="job-suggestions">
                <h3>Suggested Roles</h3>

                {recommendation.jobSuggestions.length > 1 && (
                  <div className="filter-controls">
                    <label htmlFor="location-filter">Filter by Location:</label>
                    <select
                      id="location-filter"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option value="all">All Locations</option>
                      {[...new Set(recommendation.jobSuggestions.map(job => job.location))].map(
                        location => (
                          <option key={location} value={location}>{location}</option>
                        )
                      )}
                    </select>
                  </div>
                )}

                <div className="jobs-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Company</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterJobsByLocation(recommendation.jobSuggestions).map((job, index) => (
                        <tr key={index}>
                          <td>{job.position}</td>
                          <td>{job.company}</td>
                          <td>{job.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="next-steps">
              <h3>Next Steps</h3>
              <ol>
                <li>Apply for positions matching your strengths</li>
                <li>Develop skills in areas for growth</li>
                <li>Update your resume to highlight key achievements</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResume;
