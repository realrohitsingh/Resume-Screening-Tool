import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/sidenav.css";

const SideNav = ({ expanded, toggleSidebar, darkMode, onHoverChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [userRole, setUserRole] = useState("individual"); // Default to individual
  const [user, setUser] = useState(null);

  // Get user role from localStorage on component mount
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setUserRole(storedRole);
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Determine active link based on current path
  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    // Notify parent component when hover state changes
    if (onHoverChange) {
      onHoverChange(isHovered);
    }
  }, [isHovered, onHoverChange]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSignOut = () => {
    // Clear user data from localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    // Reset state
    setUser(null);

    // Redirect to home page
    navigate("/");

    // Reload the page to ensure all components reflect the logged out state
    window.location.reload();
  };

  // Determine if sidebar should be expanded based on props or hover state
  const shouldExpand = expanded || isHovered;

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <div
      className={`sidenav ${shouldExpand ? "expanded" : "collapsed"} ${darkMode ? "dark" : "light"} ${isHovered ? "hovered" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidenav-body">
        <div className="nav-section">
          <h3 className={`section-title ${shouldExpand ? "visible" : "hidden"}`}>Main</h3>
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <div className="icon-container">
              <i className="icon home-icon"></i>
            </div>
            {shouldExpand && <span>Home</span>}
          </Link>

          {/* Show Dashboard for Individual users only */}
          {userRole === "individual" && (
            <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
              <div className="icon-container">
                <i className="icon dashboard-icon"></i>
              </div>
              {shouldExpand && <span>Dashboard</span>}
            </Link>
          )}

          <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`}>
            <div className="icon-container">
              <i className="icon about-icon"></i>
            </div>
            {shouldExpand && <span>About Us</span>}
          </Link>

          <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>
            <div className="icon-container">
              <i className="icon contact-icon"></i>
            </div>
            {shouldExpand && <span>Contact Us</span>}
          </Link>
        </div>

        {/* Show Resume Tools for Individual users only */}
        {userRole === "individual" && (
          <div className="nav-section">
            <h3 className={`section-title ${shouldExpand ? "visible" : "hidden"}`}>Resume Tools</h3>
            <Link to="/templates" className={`nav-item ${isActive('/templates') ? 'active' : ''}`}>
              <div className="icon-container">
                <i className="icon templates-icon"></i>
              </div>
              {shouldExpand && <span>Resume Templates</span>}
            </Link>

            <Link to="/create" className={`nav-item ${isActive('/create') ? 'active' : ''}`}>
              <div className="icon-container">
                <i className="icon create-icon"></i>
              </div>
              {shouldExpand && <span>Create Resume</span>}
            </Link>

            <Link to="/upload" className={`nav-item ${isActive('/upload') ? 'active' : ''}`}>
              <div className="icon-container">
                <i className="icon upload-icon"></i>
              </div>
              {shouldExpand && <span>Upload Resume</span>}
            </Link>
          </div>
        )}

        {/* Show HR Tools for HR users only */}
        {userRole === "hr" && (
          <div className="nav-section">
            <h3 className={`section-title ${shouldExpand ? "visible" : "hidden"}`}>HR Tools</h3>
            <Link to="/hr-dashboard" className={`nav-item ${isActive('/hr-dashboard') ? 'active' : ''}`}>
              <div className="icon-container">
                <i className="icon hr-icon"></i>
              </div>
              {shouldExpand && <span>HR Dashboard</span>}
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default SideNav;