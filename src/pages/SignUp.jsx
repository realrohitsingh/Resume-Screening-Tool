import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../utils/api";
import "../styles/login.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "individual" // Default role
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await signup(formData);
      if (response.status === "success") {
        // Store user data
        localStorage.setItem("user", JSON.stringify(response.user));
        // Set login status
        localStorage.setItem("isLoggedIn", "true");
        // Set user role
        localStorage.setItem("userRole", response.user.role);
        
        // Redirect based on role
        if (response.user.role === "hr") {
          navigate("/hr-dashboard");
        } else {
          navigate("/");
        }
        window.location.reload(); // Refresh to update Navbar
      }
    } catch (err) {
      setError(err.message || "Failed to sign up. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="individual">Individual</option>
          <option value="hr">HR</option>
        </select>
        <button type="submit">Sign Up</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default SignUp; 