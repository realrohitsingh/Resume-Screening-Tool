import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/suggestedRoles.css";
import { getMatchingJobs } from "../utils/jobMatchingService";
import { sampleJobs } from "../utils/sampleJobs";

const SuggestedRoles = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState(null);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Force reload jobs from sampleJobs if they're not displaying properly
  const forceReloadSampleJobs = () => {
    try {
      console.log("Reloading sample jobs directly from module");

      // Use directly imported sampleJobs instead of dynamic import
      if (sampleJobs && sampleJobs.length > 0) {
        // Make sure we have real data and not placeholders
        localStorage.setItem("hrJobs", JSON.stringify(sampleJobs));
        console.log(`Manually reloaded ${sampleJobs.length} jobs`);
        setAllJobs(sampleJobs);

        // Set suggested jobs to most recent 5
        const recentJobs = [...sampleJobs].sort((a, b) =>
          new Date(b.datePosted) - new Date(a.datePosted)
        ).slice(0, 5);
        setSuggestedJobs(recentJobs);
        return true;
      } else {
        console.error("Sample jobs module import failed to provide valid jobs");
        return false;
      }
    } catch (error) {
      console.error("Error loading sample jobs:", error);
      return false;
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    // Get all jobs from localStorage
    const storedJobs = localStorage.getItem("hrJobs");
    let jobsList = [];

    try {
      jobsList = storedJobs ? JSON.parse(storedJobs) : [];
      console.log("Loaded jobs from localStorage:", jobsList.length);

      // Validate job data
      const isValidData = jobsList &&
        jobsList.length > 0 &&
        typeof jobsList[0] === 'object' &&
        jobsList[0].position;

      if (!isValidData) {
        console.log("Jobs data from localStorage invalid, loading from sampleJobs instead");
        const success = forceReloadSampleJobs();

        if (!success) {
          console.log("Using fallback placeholder data");
          // Fallback to hard-coded placeholder data
          const placeholderJobs = [
            {
              id: "placeholder1",
              position: "Frontend Developer",
              company: "Tech Solutions Inc.",
              location: "San Francisco, CA",
              experienceLevel: "Mid-Level",
              remote: true,
              datePosted: new Date().toISOString()
            },
            {
              id: "placeholder2",
              position: "UX Designer",
              company: "Creative Agency",
              location: "New York, NY",
              experienceLevel: "Senior",
              remote: false,
              datePosted: new Date().toISOString()
            },
            {
              id: "placeholder3",
              position: "Data Analyst",
              company: "Data Insights",
              location: "Chicago, IL",
              experienceLevel: "Entry Level",
              remote: true,
              datePosted: new Date().toISOString()
            }
          ];

          setAllJobs(placeholderJobs);
          setSuggestedJobs(placeholderJobs);
          localStorage.setItem("hrJobs", JSON.stringify(placeholderJobs));
        }
      } else {
        // Use the valid data from localStorage
        setAllJobs(jobsList);

        if (loggedIn) {
          // Get user preferences from localStorage
          const storedPreferences = localStorage.getItem("userPreferences");
          const preferences = storedPreferences ? JSON.parse(storedPreferences) : null;
          setUserPreferences(preferences);

          // Get user skills from localStorage
          const storedSkills = localStorage.getItem("userSkills");
          const skills = storedSkills ? JSON.parse(storedSkills) : [];

          // Get matching jobs
          if (preferences) {
            const matches = getMatchingJobs(jobsList, preferences, skills);
            setSuggestedJobs(matches.slice(0, 5)); // Show top 5 matches
          } else if (jobsList.length > 0) {
            // If no preferences but jobs exist, show recent jobs
            const recentJobs = [...jobsList].sort((a, b) =>
              new Date(b.datePosted) - new Date(a.datePosted)
            ).slice(0, 5);
            setSuggestedJobs(recentJobs);
          }
        } else if (jobsList.length > 0) {
          // For non-logged in users, show the most recent jobs
          const recentJobs = [...jobsList].sort((a, b) =>
            new Date(b.datePosted) - new Date(a.datePosted)
          ).slice(0, 5);
          setSuggestedJobs(recentJobs);
        }
      }
    } catch (error) {
      console.error("Error parsing stored jobs:", error);
      forceReloadSampleJobs();
    }

    setIsLoading(false);
  }, []);

  const filterJobs = (jobs) => {
    if (!jobs) return [];

    return jobs.filter(job => {
      // Filter by location
      const locationMatch = selectedLocation === 'all' || job.location.includes(selectedLocation);

      // Filter by experience level
      const experienceMatch = selectedExperience === 'all' || job.experienceLevel === selectedExperience;

      return locationMatch && experienceMatch;
    });
  };

  const getUniqueLocations = () => {
    const jobs = showAllJobs ? allJobs : suggestedJobs;
    if (!jobs || jobs.length === 0) return [];

    const locations = jobs.map(job => job.location ? job.location.split(',')[0].trim() : "");
    return [...new Set(locations)].filter(loc => loc !== "");
  };

  const getExperienceLevels = () => {
    return ["Entry Level", "Mid-Level", "Senior", "Executive"];
  };

  const toggleShowAllJobs = () => {
    setShowAllJobs(!showAllJobs);
    // Reset filters when toggling view
    setSelectedLocation("all");
    setSelectedExperience("all");
  };

  const handleRefreshJobs = () => {
    setIsLoading(true);
    forceReloadSampleJobs();
    setTimeout(() => setIsLoading(false), 1000);
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  if (isLoading) {
    return <div className="roles-loading">Loading suggested roles...</div>;
  }

  const displayJobs = showAllJobs ? allJobs : suggestedJobs;
  const filteredJobs = filterJobs(displayJobs);

  // Check if we have valid job data
  const hasValidJobs = filteredJobs && filteredJobs.length > 0;

  return (
    <div className="suggested-roles">
      <div className="roles-header">
        <h2>{showAllJobs ? "All Available Jobs" : "Suggested Roles"}</h2>
        <div className="filter-controls">
          {getUniqueLocations().length > 1 && (
            <div className="filter-group">
              <label htmlFor="location-select">Location:</label>
              <select
                id="location-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">All Locations</option>
                {getUniqueLocations().map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label htmlFor="experience-select">Experience:</label>
            <select
              id="experience-select"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
            >
              <option value="all">All Levels</option>
              {getExperienceLevels().map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!isLoggedIn && !showAllJobs && (
        <div className="roles-login-prompt">
          <p>Sign in to see personalized job recommendations</p>
          <Link to="/login" className="login-button">Sign In</Link>
        </div>
      )}

      {!hasValidJobs ? (
        <div className="no-jobs-message">
          <p>Unable to load job listings. Please try refreshing the data.</p>
          <button className="view-all-button" onClick={handleRefreshJobs}>
            Refresh Job Data
          </button>
          <button
            className="debug-button"
            onClick={toggleDebugMode}
            style={{ marginLeft: '10px', fontSize: '12px' }}
          >
            {debugMode ? "Hide Debug" : "Show Debug"}
          </button>

          {debugMode && (
            <div className="debug-info">
              <p>Jobs in localStorage: {localStorage.getItem("hrJobs") ?
                JSON.parse(localStorage.getItem("hrJobs")).length : 'none'}</p>
              <p>sampleJobs module length: {sampleJobs.length}</p>
              <p>suggestedJobs state: {JSON.stringify(suggestedJobs).slice(0, 100)}...</p>
              <p>allJobs state: {JSON.stringify(allJobs).slice(0, 100)}...</p>
            </div>
          )}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="no-jobs-message">
          <p>No jobs matching your current filters. Try adjusting your filters or check back later.</p>
          {!showAllJobs && (
            <button className="view-all-button" onClick={toggleShowAllJobs}>
              View All Available Jobs
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="results-count">
            Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            {showAllJobs ? ' out of ' + allJobs.length + ' total jobs' : ''}
          </div>

          <div className="roles-table">
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Experience</th>
                  {showAllJobs && <th>Remote</th>}
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id || Math.random()}>
                    <td className="position-cell" data-label="Position">
                      {job.position}
                      {job.matchScore >= 70 && !showAllJobs && (
                        <span className="match-badge">Good Match</span>
                      )}
                    </td>
                    <td data-label="Company">{job.company}</td>
                    <td data-label="Location">{job.location}</td>
                    <td data-label="Experience">{job.experienceLevel}</td>
                    {showAllJobs && <td data-label="Remote">{job.remote ? "Yes" : "No"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="roles-footer">
            <button
              className="toggle-view-button"
              onClick={toggleShowAllJobs}
            >
              {showAllJobs ? "View Suggested Roles" : "View All Jobs"}
            </button>

            {!isLoggedIn && (
              <div className="login-prompt-footer">
                <p>For personalized job matches</p>
                <Link to="/login" className="login-button">Sign In</Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SuggestedRoles;