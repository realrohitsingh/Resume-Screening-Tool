import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/aiRecommendations.css';

const AICareerRecommendations = ({ skills = [], strengths = [], areasForGrowth = [], matchingJobs = 10 }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleGenerateRecommendations = () => {
    // TODO: Implement AI recommendations generation
    console.log("Generating recommendations...");
  };

  return (
    <div className="ai-recommendations-container">
      <div className="ai-recommendations-header">
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
        <button onClick={handleGenerateRecommendations} className="generate-button">
          Generate AI Recommendations
        </button>
      </div>

      <div className="ai-recommendations-content">
        <div className="ai-recommendations-title">
          <h1>AI Career Recommendations</h1>
          <span className="ai-badge">🤖 AI-Powered</span>
        </div>

        <div className="info-box">
          <p>Based on your profile and skills, we found {matchingJobs} matching jobs.</p>
        </div>

        <section className="skills-section">
          <h2>Skills Extracted from Your Resume</h2>
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="strengths-section">
          <h2>Strengths</h2>
          <div className="strengths-list">
            {strengths.map((strength, index) => (
              <div key={index} className="strength-item">
                <span className="checkmark">✓</span>
                {strength}
              </div>
            ))}
          </div>
        </section>

        <section className="growth-section">
          <h2>Areas for Growth</h2>
          <div className="growth-list">
            {areasForGrowth.map((area, index) => (
              <div key={index} className="growth-item">
                <span className="bullet">•</span>
                {area}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AICareerRecommendations; 