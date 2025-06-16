import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/horizontalNavbar.css";

const CompactNavbar = ({ user, darkMode, toggleDarkMode, variant = "default" }) => {
  const location = useLocation();

  // Determine active link based on current path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Variant for the 5th example in the image (text links)
  if (variant === "text-links") {
    return (
      <div className={`horizontal-navbar compact ${darkMode ? "dark" : "light"}`}>
        <div className="navbar-brand">
          <div className="company-logo">
            <div className="logo-circle">D</div>
          </div>
          <span className="company-name">deFransz</span>
        </div>

        <div className="navbar-tabs">
          <Link to="/dashboard" className={`tab-link ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/analytics" className={`tab-link ${isActive('/analytics') ? 'active' : ''}`}>
            Analytics
          </Link>
          <Link to="/products" className={`tab-link ${isActive('/products') ? 'active' : ''}`}>
            Products
          </Link>
          <Link to="/settings" className={`tab-link ${isActive('/settings') ? 'active' : ''}`}>
            Settings
          </Link>
        </div>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <span className="theme-toggle-icon theme-toggle-sun">🌞</span>
            <span className="theme-toggle-icon theme-toggle-moon">🌙</span>
          </button>
          <button className="notification-button">
            <svg className="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <div className="user-profile">
            <img
              src={user?.profilePic || "/src/assets/default-avatar.svg"}
              alt={user?.name || "User"}
              className="user-avatar"
            />
          </div>
        </div>
      </div>
    );
  }

  // Default variant for the 6th example in the image (icon-based links)
  return (
    <div className={`horizontal-navbar compact ${darkMode ? "dark" : "light"}`}>
      <Link to="/" className="navbar-brand">
        <div className="company-logo">
          <div className="logo-circle">D</div>
        </div>
      </Link>

      <div className="navbar-tabs icon-tabs">
        <Link to="/dashboard" className={`icon-tab ${isActive('/dashboard') ? 'active' : ''}`}>
          <i className="dashboard-icon"></i>
          <span>Dashboard</span>
        </Link>
        <Link to="/analytics" className={`icon-tab ${isActive('/analytics') ? 'active' : ''}`}>
          <i className="analytics-icon"></i>
          <span>Analytics</span>
          <i className="dropdown-arrow"></i>
        </Link>
        <Link to="/products" className={`icon-tab ${isActive('/products') ? 'active' : ''}`}>
          <i className="products-icon"></i>
          <span>Products</span>
          <i className="dropdown-arrow"></i>
        </Link>
        <Link to="/settings" className={`icon-tab ${isActive('/settings') ? 'active' : ''}`}>
          <i className="settings-icon"></i>
          <span>Settings</span>
        </Link>
      </div>

      <div className="navbar-actions">
        <button className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
          <span className="theme-toggle-icon theme-toggle-sun">🌞</span>
          <span className="theme-toggle-icon theme-toggle-moon">🌙</span>
        </button>
        <button className="notification-button">
          <svg className="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <div className="user-profile">
          <img
            src={user?.profilePic || "/src/assets/default-avatar.svg"}
            alt={user?.name || "User"}
            className="user-avatar"
          />
        </div>
      </div>
    </div>
  );
};

export default CompactNavbar;