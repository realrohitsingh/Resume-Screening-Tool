import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [atsScore, setAtsScore] = useState(84);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const observer = useRef();

  // Check sidebar state from localStorage
  useEffect(() => {
    const sidebarState = localStorage.getItem('sidebarExpanded') === 'true';
    setIsSidebarExpanded(sidebarState);

    // Listen for sidebar state changes
    const handleStorageChange = () => {
      const newSidebarState = localStorage.getItem('sidebarExpanded') === 'true';
      setIsSidebarExpanded(newSidebarState);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Last job element ref callback for infinite scrolling
  const lastJobElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreJobs();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch initial jobs
  useEffect(() => {
    fetchAppliedJobs();
    fetchRecommendedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    // Simulated API call
    const mockAppliedJobs = [
      {
        id: 1,
        title: 'Junior Developer',
        company: 'Tech Solutions Inc.',
        location: 'New York, NY',
        status: 'Applied'
      },
      {
        id: 2,
        title: 'DevOps Engineer',
        company: 'Infinity Systems',
        location: 'Seattle, WA',
        status: 'Applied'
      }
    ];
    setAppliedJobs(mockAppliedJobs);
  };

  const fetchRecommendedJobs = async () => {
    // Simulated API call
    const mockRecommendedJobs = [
      {
        id: 1,
        title: 'Frontend Developer',
        company: 'Digital Innovations',
        location: 'San Francisco, CA',
        matchPercentage: 83
      },
      {
        id: 2,
        title: 'Backend Developer',
        company: 'Cloud Systems',
        location: 'Austin, TX',
        matchPercentage: 76
      }
    ];
    setRecommendedJobs(mockRecommendedJobs);
  };

  const loadMoreJobs = async () => {
    setLoading(true);
    try {
      // Simulated API call for more jobs
      const newJobs = [
        {
          id: page * 2 + 1,
          title: 'Full Stack Developer',
          company: 'Tech Corp',
          location: 'Remote',
          matchPercentage: 79
        },
        {
          id: page * 2 + 2,
          title: 'Software Engineer',
          company: 'Innovation Labs',
          location: 'Boston, MA',
          matchPercentage: 72
        }
      ];
      
      setRecommendedJobs(prev => [...prev, ...newJobs]);
      setPage(prev => prev + 1);
      setHasMore(page < 5); // Stop after 5 pages for demo
    } catch (error) {
      console.error('Error loading more jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const circumference = 2 * Math.PI * 54; // Circle radius is 54
  const offset = circumference - (atsScore / 100) * circumference;

  return (
    <div className={`dashboard-container ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
      <header className="dashboard-header">
        <h1>Personal Dashboard</h1>
      </header>

      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-left-column">
          <section className="ats-score-section">
            <div className="ats-score-container">
              <div className="score-circle">
                <svg viewBox="0 0 120 120">
                  <circle
                    className="background"
                    cx="60"
                    cy="60"
                    r="54"
                  />
                  <circle
                    className="progress"
                    cx="60"
                    cy="60"
                    r="54"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                  />
                </svg>
                <div className="score-value">{atsScore}</div>
              </div>
              <div className="score-label">RESUME STRENGTH</div>
            </div>

            <div className="ats-status">
              Your resume is well-optimized for ATS systems!
            </div>

            <div className="tips-section">
              <h3>Tips to Improve ATS Score:</h3>
              <ul className="tips-list">
                <li>Use industry-standard keywords relevant to job descriptions</li>
                <li>Ensure proper formatting (no tables, text boxes, or headers/footers)</li>
                <li>Use standard section headers (e.g., Experience, Education, Skills)</li>
                <li>Submit in recommended file formats (.docx, .pdf)</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="dashboard-right-column">
          <section className="jobs-section">
            <h2>Applied Jobs</h2>
            <div className="jobs-list">
              {appliedJobs.map(job => (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <div className="job-company">{job.company}</div>
                  <div className="job-location">{job.location}</div>
                  <span className="job-status">{job.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="jobs-section">
            <h2>Recommended Open Jobs</h2>
            <div className="jobs-list">
              {recommendedJobs.map((job, index) => (
                <div
                  key={job.id}
                  ref={index === recommendedJobs.length - 1 ? lastJobElementRef : null}
                  className="job-card"
                >
                  <h3>{job.title}</h3>
                  <div className="job-company">{job.company}</div>
                  <div className="job-location">{job.location}</div>
                  <span className="job-match">{job.matchPercentage}% Match</span>
                  <button className="apply-button">Apply Now</button>
                </div>
              ))}
              {loading && (
                <div className="loading-spinner">
                  Loading more jobs...
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 