import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import "../styles/admindash.css";

const AdminDashboard = () => {
  const [userData, setUserData] = useState({
    atsScore: 0,
    appliedJobs: [],
    openJobs: [],
    skillsMatch: [],
    resumeSkills: []
  });

  useEffect(() => {
    // Simulated data loading (replace with actual API calls)
    const fetchUserData = async () => {
      // Get user skills from localStorage
      const storedSkills = localStorage.getItem("userSkills");
      const skills = storedSkills ? JSON.parse(storedSkills) : [];

      // Get user preferences
      const storedPreferences = localStorage.getItem("userPreferences");
      const preferences = storedPreferences ? JSON.parse(storedPreferences) : null;

      // Get jobs from localStorage
      const storedJobs = localStorage.getItem("hrJobs");
      const allJobs = storedJobs ? JSON.parse(storedJobs) : [];

      // Get "applied" jobs (mocked for demo)
      const appliedJobIds = localStorage.getItem("appliedJobs")
        ? JSON.parse(localStorage.getItem("appliedJobs"))
        : ["sd1", "ds2", "fn3", "mk4", "sd5"];

      // Filter applied jobs from all jobs
      const appliedJobs = allJobs.filter(job => appliedJobIds.includes(job.id)).slice(0, 5);

      // Get open jobs with highest match score
      const openJobs = allJobs
        .filter(job => !appliedJobIds.includes(job.id))
        .slice(0, 5);

      // Calculate ATS score based on resume completeness
      // In a real app, this would be based on actual analysis
      const atsScore = Math.floor(70 + Math.random() * 20);

      // Generate skills match data
      const skillsMatch = [
        { name: "Technical Skills", user: 75, average: 68 },
        { name: "Soft Skills", user: 85, average: 72 },
        { name: "Industry Knowledge", user: 60, average: 65 },
        { name: "Tools & Software", user: 90, average: 75 },
        { name: "Education", user: 80, average: 78 }
      ];

      // User's resume skills with match percentage to job market
      const resumeSkills = [
        { name: "JavaScript", value: 90, fullMark: 100 },
        { name: "React", value: 85, fullMark: 100 },
        { name: "Communication", value: 75, fullMark: 100 },
        { name: "Problem Solving", value: 80, fullMark: 100 },
        { name: "Node.js", value: 70, fullMark: 100 },
        { name: "Project Management", value: 60, fullMark: 100 }
      ];

      setUserData({
        atsScore,
        appliedJobs,
        openJobs,
        skillsMatch,
        resumeSkills
      });
    };

    fetchUserData();
  }, []);

  const renderAtsScoreGauge = () => {
    const { atsScore } = userData;
    const scoreColor = atsScore >= 80
      ? "#09B294" // Teal for high score (changed to match image)
      : atsScore >= 60
        ? "#ff9800" // Orange for medium score
        : "#f44336"; // Red for low score

    const handleRefreshAnalysis = () => {
      // In a real app, this would trigger a new analysis of the resume
      // For demo purposes, we'll just generate a new random score
      const newScore = Math.floor(60 + Math.random() * 35); // Range 60-95
      setUserData(prev => ({
        ...prev,
        atsScore: newScore
      }));
    };

    return (
      <div className="ats-score-container">
        <h2>Resume ATS Score</h2>
        <div className="resume-strength-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <svg width="110" height="110" viewBox="0 0 120 120">
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
                strokeDashoffset={(339.292 * (1 - atsScore/100))}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '36%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#212B36'
            }}>
              {atsScore}
            </div>
            <div style={{
              marginTop: '25px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#637381',
              textTransform: 'uppercase'
            }}>
              RESUME STRENGTH
            </div>
          </div>
        </div>

        <div className="score-analysis">
          {atsScore >= 80 ? (
            <p className="score-message good">Your resume is well-optimized for ATS systems!</p>
          ) : atsScore >= 60 ? (
            <p className="score-message average">Your resume needs some improvements for better ATS compatibility.</p>
          ) : (
            <p className="score-message poor">Your resume needs significant improvements to pass ATS systems.</p>
          )}
        </div>

        <div className="ats-score-actions">
          <button className="refresh-button" onClick={handleRefreshAnalysis}>
            Refresh Resume Analysis
          </button>
          <a href="/upload" className="update-resume-link">
            Update Resume
          </a>
        </div>

        <div className="ats-tips">
          <h4>Tips to Improve ATS Score:</h4>
          <ul>
            <li>Use industry-standard keywords relevant to job descriptions</li>
            <li>Ensure proper formatting (no tables, text boxes, or headers/footers)</li>
            <li>Use standard section headers (e.g., Experience, Education, Skills)</li>
            <li>Submit in recommended file formats (.docx, .pdf)</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderJobsTracking = () => {
    const { appliedJobs, openJobs } = userData;

    const handleApplyToJob = (jobId) => {
      // Get current applied jobs from localStorage
      const currentAppliedJobs = localStorage.getItem("appliedJobs")
        ? JSON.parse(localStorage.getItem("appliedJobs"))
        : [];

      // Add the new job ID if it's not already in the list
      if (!currentAppliedJobs.includes(jobId)) {
        const updatedAppliedJobs = [...currentAppliedJobs, jobId];

        // Update localStorage
        localStorage.setItem("appliedJobs", JSON.stringify(updatedAppliedJobs));

        // Update state
        const jobToMove = openJobs.find(job => job.id === jobId);
        if (jobToMove) {
          setUserData(prev => ({
            ...prev,
            appliedJobs: [...prev.appliedJobs, jobToMove],
            openJobs: prev.openJobs.filter(job => job.id !== jobId)
          }));
        }

        alert(`Successfully applied to: ${jobToMove ? jobToMove.position : 'job'}`);
      }
    };

    return (
      <div className="jobs-tracking-container">
        <div className="jobs-column">
          <h3>Applied Jobs</h3>
          <div className="jobs-list">
            {appliedJobs.length > 0 ? (
              appliedJobs.map((job, index) => (
                <div key={`applied-${job.id || index}`} className="job-card">
                  <h4>{job.position}</h4>
                  <p className="company">{job.company}</p>
                  <p className="location">{job.location}</p>
                  <span className="status applied">Applied</span>
                </div>
              ))
            ) : (
              <p className="no-jobs-message">You haven't applied to any jobs yet</p>
            )}
          </div>
        </div>

        <div className="jobs-column">
          <h3>Recommended Open Jobs</h3>
          <div className="jobs-list">
            {openJobs.length > 0 ? (
              openJobs.map((job, index) => (
                <div key={`open-${job.id || index}`} className="job-card">
                  <h4>{job.position}</h4>
                  <p className="company">{job.company}</p>
                  <p className="location">{job.location}</p>
                  <span className="match-percentage">{Math.floor(65 + Math.random() * 30)}% Match</span>
                  <button
                    className="apply-button"
                    onClick={() => handleApplyToJob(job.id)}
                  >
                    Apply Now
                  </button>
                </div>
              ))
            ) : (
              <p className="no-jobs-message">No open job recommendations available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSkillsMatch = () => {
    const { skillsMatch, resumeSkills } = userData;

    return (
      <div className="skills-match-container">
        <h2>Skills Analysis</h2>

        <div className="charts-row">
          <div className="chart-box">
            <h3>Skills Categories Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={skillsMatch}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="user" name="Your Skills" fill="#4A90E2" />
                <Bar dataKey="average" name="Job Market Average" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>Your Skills Profile</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={resumeSkills}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Your Skills"
                  dataKey="value"
                  stroke="#9013FE"
                  fill="#9013FE"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="skills-recommendations">
          <h3>Skill Improvement Recommendations</h3>
          <ul className="recommendations-list">
            <li>Add more specific examples of <strong>Project Management</strong> experience</li>
            <li>Consider gaining more expertise in <strong>Industry Knowledge</strong></li>
            <li>Highlight certifications related to your technical skills</li>
            <li>Add measurable achievements to showcase your skills in action</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1>Personal Dashboard</h1>

      <div className="dashboard-grid">
        <div className="dashboard-column">
          {renderAtsScoreGauge()}
        </div>

        <div className="dashboard-column">
          {renderJobsTracking()}
        </div>
      </div>

      <div className="dashboard-row">
        {renderSkillsMatch()}
      </div>
    </div>
  );
};

export default AdminDashboard;
