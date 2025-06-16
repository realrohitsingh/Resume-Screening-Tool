import React, { useEffect, useState } from "react";
import { fetchResumeTemplates } from "../utils/api";
import "../styles/templates.css";

const ResumeTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      const data = await fetchResumeTemplates();
      setTemplates(data);
      setLoading(false);
    };
    loadTemplates();
  }, []);

  return (
    <div className="templates-container">
      <h2>Resume Templates</h2>
      {loading ? (
        <p>Loading templates...</p>
      ) : (
        <div className="templates-grid">
          {templates.length > 0 ? (
            templates.map((template, index) => (
              <div key={index} className="template-card">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
              </div>
            ))
          ) : (
            <p>No templates found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeTemplates;
