import React, { createContext, useContext, useState, useEffect } from 'react';

// Define initial resume state
const initialResumeState = {
  profile: {
    name: '',
    email: '',
    phone: '',
    url: '',
    summary: '',
    location: '',
  },
  workExperiences: [
    {
      company: '',
      jobTitle: '',
      date: '',
      descriptions: [''],
      location: '',
    }
  ],
  educations: [
    {
      school: '',
      degree: '',
      date: '',
      gpa: '',
      descriptions: [''],
    }
  ],
  skills: {
    featuredSkills: [
      { skill: '', rating: 3 },
      { skill: '', rating: 3 },
      { skill: '', rating: 3 },
    ],
    descriptions: [''],
  },
  projects: [
    {
      project: '',
      date: '',
      descriptions: [''],
      url: '',
    }
  ],
  selectedTemplate: 'modern',
};

// Create context
const ResumeContext = createContext();

// Create provider component
export const ResumeProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(() => {
    // Load from localStorage if available
    const savedData = localStorage.getItem('resumeData');
    return savedData ? JSON.parse(savedData) : initialResumeState;
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    const savedTemplate = localStorage.getItem('selectedTemplate');
    return savedTemplate || 'modern';
  });

  // Update profile information
  const updateProfile = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  // Add a new work experience
  const addWorkExperience = () => {
    setResumeData(prev => ({
      ...prev,
      workExperiences: [
        ...prev.workExperiences,
        {
          company: '',
          jobTitle: '',
          date: '',
          descriptions: [''],
          location: '',
        }
      ]
    }));
  };

  // Update work experience
  const updateWorkExperience = (index, field, value) => {
    setResumeData(prev => {
      const updatedWorkExperiences = [...prev.workExperiences];
      updatedWorkExperiences[index] = {
        ...updatedWorkExperiences[index],
        [field]: value
      };
      return {
        ...prev,
        workExperiences: updatedWorkExperiences
      };
    });
  };

  // Add a new education
  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      educations: [
        ...prev.educations,
        {
          school: '',
          degree: '',
          date: '',
          gpa: '',
          descriptions: [''],
        }
      ]
    }));
  };

  // Update education
  const updateEducation = (index, field, value) => {
    setResumeData(prev => {
      const updatedEducations = [...prev.educations];
      updatedEducations[index] = {
        ...updatedEducations[index],
        [field]: value
      };
      return {
        ...prev,
        educations: updatedEducations
      };
    });
  };

  // Add a new project
  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          project: '',
          date: '',
          descriptions: [''],
          url: '',
        }
      ]
    }));
  };

  // Update project
  const updateProject = (index, field, value) => {
    setResumeData(prev => {
      const updatedProjects = [...prev.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value
      };
      return {
        ...prev,
        projects: updatedProjects
      };
    });
  };

  // Update skills
  const updateSkills = (field, value, index = null) => {
    if (field === 'descriptions') {
      setResumeData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          descriptions: value
        }
      }));
    } else if (field === 'featuredSkills' && index !== null) {
      setResumeData(prev => {
        const updatedFeaturedSkills = [...prev.skills.featuredSkills];
        updatedFeaturedSkills[index] = value;
        return {
          ...prev,
          skills: {
            ...prev.skills,
            featuredSkills: updatedFeaturedSkills
          }
        };
      });
    }
  };

  // Update template
  const updateTemplate = (templateName) => {
    setSelectedTemplate(templateName);
    localStorage.setItem('selectedTemplate', templateName);
  };

  // Update entire resume data (for importing)
  const updateResumeData = (newData) => {
    setResumeData(newData);
  };

  // Save to localStorage whenever resumeData changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Context value
  const value = {
    resumeData,
    selectedTemplate,
    updateProfile,
    addWorkExperience,
    updateWorkExperience,
    addEducation,
    updateEducation,
    addProject,
    updateProject,
    updateSkills,
    updateTemplate,
    updateResumeData
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};

// Custom hook for using the resume context
export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}; 