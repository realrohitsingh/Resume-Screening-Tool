import React, { useEffect, useState } from "react";
import "../styles/hrDashboard.css";

const MAX_TEXT_LENGTH = 120;

const HRDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState({});
  const [formData, setFormData] = useState({
    position: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    experienceLevel: "Entry Level",
    remote: false
  });

  useEffect(() => {
    // Load jobs from localStorage when component mounts
    const storedJobs = localStorage.getItem("hrJobs");
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    }
    setIsLoading(false);
  }, []);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("hrJobs", JSON.stringify(jobs));
    }
  }, [jobs, isLoading]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newJob = {
      id: Date.now().toString(),
      ...formData,
      datePosted: new Date().toISOString()
    };

    setJobs([...jobs, newJob]);
    setShowForm(false);

    // Reset form
    setFormData({
      position: "",
      company: "",
      location: "",
      description: "",
      requirements: "",
      experienceLevel: "Entry Level",
      remote: false
    });
  };

  const deleteJob = (id) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      setJobs(jobs.filter(job => job.id !== id));
    }
  };

  const toggleShowMore = (id) => {
    setExpandedJobs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return <div className="loading">Loading HR dashboard...</div>;
  }

  return (
    <div className="hr-dashboard-advanced-page">
      <div className="hr-adv-header">
        <h1>HR Dashboard</h1>
        <p className="subtitle">Manage and post job openings with ease</p>
      </div>
      <div className="hr-adv-scrollable-list no-footer-overlap">
        <div className="jobs-adv-header">
          <h2>Active Job Postings <span className="count">({jobs.length})</span></h2>
        </div>
        {jobs.length === 0 ? (
          <div className="no-jobs-adv">No jobs have been posted yet. Click the + button to add your first job posting!</div>
        ) : (
          <div className="jobs-adv-grid">
            {jobs.map((job) => {
              const isExpanded = expandedJobs[job.id];
              const desc = job.description || "";
              const reqs = job.requirements || "";
              const showDesc = isExpanded || desc.length <= MAX_TEXT_LENGTH ? desc : desc.slice(0, MAX_TEXT_LENGTH) + "...";
              const showReqs = isExpanded || reqs.length <= MAX_TEXT_LENGTH ? reqs : reqs.slice(0, MAX_TEXT_LENGTH) + "...";
              return (
                <div className="job-adv-card" key={job.id}>
                  <div className="job-adv-header">
                    <h3>{job.position}</h3>
                    <button className="job-adv-delete" onClick={() => deleteJob(job.id)} title="Delete job">×</button>
                  </div>
                  <div className="job-adv-meta">
                    <span className="company">{job.company}</span>
                    <span className="location">{job.location}</span>
                    <span className="badge exp">{job.experienceLevel}</span>
                    {job.remote && <span className="badge remote">Remote</span>}
                  </div>
                  <div className="job-adv-desc">{showDesc}</div>
                  <div className="job-adv-reqs">{showReqs}</div>
                  {(desc.length > MAX_TEXT_LENGTH || reqs.length > MAX_TEXT_LENGTH) && (
                    <button className="show-more-btn" onClick={() => toggleShowMore(job.id)}>
                      {isExpanded ? "Show Less" : "Show More"}
        </button>
                  )}
                  <div className="job-adv-date">Posted: {new Date(job.datePosted).toLocaleDateString()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button className="fab-add-job" onClick={() => setShowForm(true)} title="Add Job">+</button>
      {showForm && (
        <div className="modal-adv-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-adv-content" onClick={e => e.stopPropagation()}>
            <h2>Post a New Job</h2>
            <form className="job-adv-form" onSubmit={handleSubmit}>
              <input type="text" name="position" placeholder="Job Title" value={formData.position} onChange={handleInputChange} required />
              <input type="text" name="company" placeholder="Company" value={formData.company} onChange={handleInputChange} required />
              <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleInputChange} required>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
              <textarea name="description" placeholder="Job Description" value={formData.description} onChange={handleInputChange} rows={3} required />
              <textarea name="requirements" placeholder="Requirements" value={formData.requirements} onChange={handleInputChange} rows={2} required />
              <label className="checkbox-label">
                <input type="checkbox" name="remote" checked={formData.remote} onChange={handleInputChange} /> Remote
              </label>
              <div className="modal-adv-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Post Job</button>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;