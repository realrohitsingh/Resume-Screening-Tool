import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/resume.css";
import { uploadResumeForRecommendations, checkJobApiHealth, saveATSScore, getATSScores } from "../utils/api";
import { getMatchingJobs, generateUserStrengths, generateImprovementAreas } from "../utils/jobMatchingService";
import { extractResumeText, extractStructuredData } from "../utils/resumeParser";
import { calculateATSScore } from "../utils/atsScoring";
import { getCachedATSScore, cacheATSScore, clearExpiredCache } from "../utils/atsCache";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import AICareerRecommendations from "../components/AICareerRecommendations";

const UploadResume = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [file, setFile] = useState(null);
  const [jobPreference, setJobPreference] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [workStyle, setWorkStyle] = useState("");
  const [personalValues, setPersonalValues] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  const [recommendation, setRecommendation] = useState({
    eligibilityMessage: "",
    pros: [],
    cons: [],
    jobSuggestions: [],
    atsScore: null,
    atsFeedback: []
  });
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
  const [previousScores, setPreviousScores] = useState([]);
  const [atsScores, setAtsScores] = useState([]);
  const [currentAtsScore, setCurrentAtsScore] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [user, setUser] = useState(null);

  // Check if user is logged in when the component mounts
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUserId = localStorage.getItem("userId");
    setIsLoggedIn(loggedIn);
    setUserId(storedUserId);

    const checkApiStatus = async () => {
      const isAvailable = await checkJobApiHealth();
      setApiAvailable(isAvailable);
    };

    checkApiStatus();

    // Load previous ATS scores if user is logged in
    if (loggedIn && storedUserId) {
      loadPreviousScores(storedUserId);
    }
  }, []);

  // Load previous ATS scores for the user
  const loadPreviousScores = async (uid) => {
    try {
      const response = await getATSScores(uid);
      if (response.status === 'success') {
        const scores = Object.values(response.scores).sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setPreviousScores(scores);
      }
    } catch (error) {
      console.error('Error loading previous scores:', error);
    }
  };

  // Save ATS score to backend
  const saveScore = async (score, feedback, resumeId) => {
    if (!userId) return;
    
    try {
      await saveATSScore(userId, resumeId, score, feedback);
      // Reload scores after saving
      await loadPreviousScores(userId);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

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
        setIsLoading(true);
        
        // Extract text from resume
        const resumeText = await extractResumeText(selectedFile);
        setResumeText(resumeText);
        
        // Check cache for ATS score
        const cachedScore = getCachedATSScore(resumeText);
        
        if (cachedScore) {
          // Use cached score
          setAtsScore(cachedScore.score);
          setAtsAnalysis({
            score: cachedScore.score,
            feedback: cachedScore.feedback
          });
        } else {
          // Calculate new score
          const result = await uploadResumeForRecommendations(selectedFile, userId);
          
          if (result.status === 'success') {
            // Cache the new score
            cacheATSScore(resumeText, {
              score: result.ats_score,
              feedback: result.feedback
            });
            
            // Set state
            setAtsScore(result.ats_score);
            setAtsAnalysis({
              score: result.ats_score,
              feedback: result.feedback
            });
          }
        }
        
        // Extract and set other data
        const extractedData = await extractStructuredData(selectedFile);
        setResumeData(extractedData);
        setExtractedSkills(extractedData.skills || []);
        
        // Save to localStorage
        localStorage.setItem("userSkills", JSON.stringify(extractedData.skills || []));
        
        // Move to next step
        setCurrentStep(2);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error processing resume:", error);
        setErrorMessage("Failed to process resume. Please try another file.");
        setIsLoading(false);
      }
    }
  };

  // Clear expired cache entries on component mount
  useEffect(() => {
    clearExpiredCache();
  }, []);

  const generateStrengths = (resumeData, recommendations) => {
    const strengths = [];
    
    // Add skills-based strength
    if (resumeData.skills && resumeData.skills.length > 0) {
      strengths.push(`Strong technical aptitude with ${resumeData.skills.length} relevant skills`);
    }
    
    // Add experience-based strength
    if (resumeData.total_experience) {
      strengths.push(`${resumeData.total_experience} years of professional experience`);
    }
    
    // Add education-based strength
    if (resumeData.education && resumeData.education.length > 0) {
      strengths.push('Strong educational background');
    }
    
    // Add job match strength
    const highMatchJobs = recommendations.filter(job => job.match_score >= 80);
    if (highMatchJobs.length > 0) {
      strengths.push(`Strong match for ${highMatchJobs.length} positions`);
    }
    
    return strengths;
  };

  const generateImprovements = (resumeData, recommendations) => {
    const improvements = [];
    
    // Skills improvement
    if (!resumeData.skills || resumeData.skills.length < 10) {
      improvements.push('Consider adding more industry-specific skills');
    }
    
    // Experience improvement
    if (!resumeData.total_experience || resumeData.total_experience < 2) {
      improvements.push('Limited professional experience');
    }
    
    // Education improvement
    if (!resumeData.education || resumeData.education.length === 0) {
      improvements.push('Consider adding educational qualifications');
    }
    
    // Job match improvement
    const lowMatchJobs = recommendations.filter(job => job.match_score < 70);
    if (lowMatchJobs.length > recommendations.length / 2) {
      improvements.push('Consider developing skills in trending technologies');
    }
    
    return improvements;
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

        // Save ATS score and feedback
        const resumeId = `${Date.now()}_${droppedFile.name}`;
        await saveScore(atsAnalysisResult.score, atsAnalysisResult.feedback, resumeId);

        // Save to localStorage
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
        const result = await uploadResumeForRecommendations(file, userId);

        if (result.status === 'success') {
          // Get the extracted data and recommendations from the API response
          const apiExtractedData = result.extracted_data;
          const apiRecommendations = result.recommendations;

          // Merge skills from API with extracted skills if both available
          const mergedSkills = [...new Set([
            ...(apiExtractedData?.skills || []),
            ...skills
          ])];

          setExtractedSkills(mergedSkills);
          localStorage.setItem("userSkills", JSON.stringify(mergedSkills));

          // Get matching jobs from our job matching service
          const matchingJobs = getMatchingJobs(userPreferences, mergedSkills);

          // Generate personalized strengths and improvement areas
          const strengths = generateUserStrengths(userPreferences, mergedSkills);
          const improvements = generateImprovementAreas(userPreferences, matchingJobs);

          // If we have API recommendations, use them; otherwise, use the matching jobs
          const jobSuggestions = apiRecommendations.length > 0
            ? apiRecommendations
            : matchingJobs;

          // Set the recommendation
          setRecommendation({
            eligibilityMessage: apiRecommendations.length > 0
              ? `Based on your profile and skills, we found ${apiRecommendations.length} matching jobs.`
              : `Based on your skills, we found ${matchingJobs.length} matching jobs.`,
            pros: strengths,
            cons: improvements,
            jobSuggestions: jobSuggestions.map(job => ({
              title: job.position || job.title,
              company: job.company,
              location: job.location,
              matchPercentage: job.match_score || job.matchPercentage,
              atsScore: job.ats_score
            })),
            atsScore: atsResults?.score || null,
            atsFeedback: atsResults?.feedback || []
          });
        } else {
          throw new Error(result.error || 'Failed to get recommendations');
        }
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

    return (
      <div className="ats-score-preview">
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
    if (!resumeData) return null;

    const strengths = [
      "Strong technical aptitude for software development",
      "Proficient in in-demand programming languages",
      "Fresh perspective and eagerness to learn",
      "Self-motivated with strong remote work capabilities"
    ];

    const areasForGrowth = [
      "Limited professional experience",
      "May require additional training and mentorship"
    ];

    return (
      <AICareerRecommendations
        skills={extractedSkills}
        strengths={strengths}
        areasForGrowth={areasForGrowth}
        matchingJobs={10}
      />
    );
  };

  // Add a section to display previous scores
  const renderPreviousScores = () => {
    if (!previousScores.length) return null;

    return (
      <div className="previous-scores">
        <h3>Previous ATS Scores</h3>
        <div className="scores-list">
          {previousScores.slice(0, 5).map((score, index) => (
            <div key={index} className="score-item">
              <div className="score-value">{score.score}</div>
              <div className="score-date">
                {new Date(score.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
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

        {recommendation && recommendation.eligibilityMessage && (
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
                  {(recommendation.pros || []).map((pro, index) => (
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
                  {(recommendation.cons || []).map((con, index) => (
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
                          <td>{job.title || job.position}</td>
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
