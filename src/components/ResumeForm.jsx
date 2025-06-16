import React from "react";

const ResumeForm = ({ resumeData, setResumeData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setResumeData({ ...resumeData, [name]: value });
  };

  return (
    <div className="form-container">
      <h2>Enter Your Details</h2>
      <input type="text" name="fullName" placeholder="Full Name" value={resumeData.fullName} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={resumeData.email} onChange={handleChange} required />
      <input type="text" name="phone" placeholder="Phone Number" value={resumeData.phone} onChange={handleChange} required />

      <h3>Education</h3>
      {resumeData.education.map((edu, index) => (
        <div key={index}>
          <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => {
            let newEdu = [...resumeData.education];
            newEdu[index].degree = e.target.value;
            setResumeData({ ...resumeData, education: newEdu });
          }} />
          <input type="text" placeholder="School/College" value={edu.school} onChange={(e) => {
            let newEdu = [...resumeData.education];
            newEdu[index].school = e.target.value;
            setResumeData({ ...resumeData, education: newEdu });
          }} />
          <input type="text" placeholder="Year of Passing" value={edu.year} onChange={(e) => {
            let newEdu = [...resumeData.education];
            newEdu[index].year = e.target.value;
            setResumeData({ ...resumeData, education: newEdu });
          }} />
        </div>
      ))}

      <h3>Work Experience</h3>
      {resumeData.experience.map((exp, index) => (
        <div key={index}>
          <input type="text" placeholder="Company Name" value={exp.company} onChange={(e) => {
            let newExp = [...resumeData.experience];
            newExp[index].company = e.target.value;
            setResumeData({ ...resumeData, experience: newExp });
          }} />
          <input type="text" placeholder="Role" value={exp.role} onChange={(e) => {
            let newExp = [...resumeData.experience];
            newExp[index].role = e.target.value;
            setResumeData({ ...resumeData, experience: newExp });
          }} />
          <input type="text" placeholder="Duration" value={exp.duration} onChange={(e) => {
            let newExp = [...resumeData.experience];
            newExp[index].duration = e.target.value;
            setResumeData({ ...resumeData, experience: newExp });
          }} />
        </div>
      ))}

      <h3>Skills</h3>
      <textarea name="skills" placeholder="E.g., JavaScript, React, Node.js" value={resumeData.skills} onChange={handleChange}></textarea>

      <h3>Social Profiles</h3>
      <input type="text" name="github" placeholder="GitHub URL" value={resumeData.github} onChange={handleChange} />
      <input type="text" name="linkedin" placeholder="LinkedIn URL" value={resumeData.linkedin} onChange={handleChange} />
    </div>
  );
};

export default ResumeForm;
