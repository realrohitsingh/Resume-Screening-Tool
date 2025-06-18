import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../utils/api";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(formData);
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
      setError(err.message || "Invalid email or password!");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="signup-link">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
