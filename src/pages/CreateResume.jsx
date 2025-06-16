import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AISuggestions from "../components/AISuggestions";

const CreateResume = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tenth: "",
    twelfth: "",
    college: "",
    extracurricular: "",
    experience: "",
    certifications: "",
    github: "",
    linkedin: "",
  });

  // Load saved data on refresh
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("resumeData"));
    if (savedData) setFormData(savedData);
  }, []);

  // Save data automatically
  useEffect(() => {
    localStorage.setItem("resumeData", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuggestionUpdate = (suggestion) => {
    setFormData({ ...formData, experience: suggestion });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/preview", { state: formData });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-4">Create Your Resume</h1>

      {/* Progress Bar */}
      <div className="relative w-full bg-gray-300 h-2 rounded mb-6">
        <div className={`absolute h-2 bg-blue-600 rounded transition-all duration-500`} style={{ width: `${(step / 4) * 100}%` }}></div>
      </div>

      {/* Profile Picture Upload */}
      {step === 1 && (
        <div className="text-center">
          <label className="block text-lg font-semibold mb-2">Upload Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
          {profileImage && <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full mx-auto shadow-md" />}
        </div>
      )}

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded mt-2" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded mt-2" />
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="w-full p-2 border rounded mt-2" />
        </div>
      )}

      {/* Step 2: Education */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold">Education</h2>
          <input type="text" name="tenth" placeholder="10th Grade School & Percentage" value={formData.tenth} onChange={handleChange} required className="w-full p-2 border rounded mt-2" />
          <input type="text" name="twelfth" placeholder="12th Grade School & Percentage" value={formData.twelfth} onChange={handleChange} required className="w-full p-2 border rounded mt-2" />
          <input type="text" name="college" placeholder="College Name & Degree" value={formData.college} onChange={handleChange} required className="w-full p-2 border rounded mt-2" />
        </div>
      )}

      {/* Step 3: Experience & Certifications */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold">Work Experience</h2>
          <textarea name="experience" placeholder="Work Experience" value={formData.experience} onChange={handleChange} required className="w-full p-2 border rounded mt-2"></textarea>
          <AISuggestions field="experience" onUpdate={handleSuggestionUpdate} />
          <h2 className="text-xl font-semibold mt-4">Certifications</h2>
          <textarea name="certifications" placeholder="Enter your Certifications" value={formData.certifications} onChange={handleChange} required className="w-full p-2 border rounded mt-2"></textarea>
        </div>
      )}

      {/* Step 4: Links & Submit */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-semibold">Social & Portfolio</h2>
          <input type="text" name="github" placeholder="GitHub Profile URL" value={formData.github} onChange={handleChange} className="w-full p-2 border rounded mt-2" />
          <input type="text" name="linkedin" placeholder="LinkedIn Profile URL" value={formData.linkedin} onChange={handleChange} className="w-full p-2 border rounded mt-2" />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {step > 1 && (
          <button onClick={handleBack} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Back
          </button>
        )}
        {step < 4 ? (
          <button onClick={handleNext} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Preview Resume
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateResume;
