import React from "react";
import "../styles/resume.css";

const ResumeCard = ({ template }) => {
  return (
    <div className="resume-card">
      <img src={template.image} alt={template.name} />
      <h3>{template.name}</h3>
      <button>Select</button>
    </div>
  );
};

export default ResumeCard;
