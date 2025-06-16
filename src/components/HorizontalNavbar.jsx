import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/horizontalNavbar.css";

const HorizontalNavbar = ({ user, darkMode, toggleDarkMode, variant = "default", className = "", toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    if (storedUser && loggedIn) {
      setUserData(JSON.parse(storedUser));
    }

    // Close mobile search on click outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMobileSearchVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when mobile search is opened
  useEffect(() => {
    if (mobileSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchVisible]);

  // Function to get user initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to render avatar
  const renderAvatar = (className) => {
    if (!isLoggedIn) {
      return (
        <div className={`not-signed-in-avatar ${className}`}>
          <div className="not-signed-in-icon"></div>
        </div>
      );
    }

    if (userData?.profilePic && userData.profilePic !== "/src/assets/default-avatar.svg") {
      return <img src={userData.profilePic} alt={userData.name} className={className} />;
    }
    return <div className={className}>{getInitials(userData?.name)}</div>;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileSearch = (e) => {
    e.stopPropagation();
    setMobileSearchVisible(!mobileSearchVisible);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log("Searching for:", searchQuery);
      // Close mobile search after submission
      setMobileSearchVisible(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    setDropdownOpen(false);
    setIsLoggedIn(false);
    setUserData(null);
    navigate("/");
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate("/about");
  };

  const handleSignIn = () => {
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleSignUp = () => {
    setDropdownOpen(false);
    navigate("/signup");
  };

  const renderAuthDropdown = () => {
    return (
      <div className="auth-dropdown">
        <div className="auth-dropdown-header">
          <h3 className="auth-dropdown-title">Welcome to Resume Screening Tool</h3>
          <p className="auth-dropdown-subtitle">Sign in to access all features</p>
        </div>
        <div className="auth-dropdown-buttons">
          <button className="auth-button signin-button" onClick={handleSignIn}>
            <i className="auth-icon signin-icon"></i>
            Sign in
          </button>
          <button className="auth-button signup-button" onClick={handleSignUp}>
            <i className="auth-icon signup-icon"></i>
            Sign up
          </button>
        </div>
      </div>
    );
  };

  const renderProfileDropdown = () => {
    if (!isLoggedIn) {
      return renderAuthDropdown();
    }

    return (
      <div className="profile-dropdown">
        <div className="dropdown-header">
          <div className="dropdown-user-info">
            {renderAvatar("dropdown-avatar")}
            <div className="dropdown-user-details">
              <p className="dropdown-user-name">{userData?.name || "User"}</p>
              <p className="dropdown-user-email">{userData?.email || "user@example.com"}</p>
              <span className="dropdown-user-role">
                {userData?.role === "hr" ? "HR Professional" : "Individual"}
              </span>
            </div>
          </div>
        </div>

        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={handleProfileClick}>
            <i className="profile-icon"></i>
            Profile
          </button>
          <button className="dropdown-item signout" onClick={handleSignOut}>
            <i className="signout-icon"></i>
            Sign out
          </button>
        </div>
      </div>
    );
  };

  const renderSearchBar = () => (
    <div ref={searchRef} className={`search-container ${mobileSearchVisible ? 'active' : ''}`}>
      <form onSubmit={handleSearchSubmit}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <i className="search-icon"></i>
      </form>
    </div>
  );

  // Determine active link based on current path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Render based on variant
  if (variant === "minimal") {
    return (
      <div className={`horizontal-navbar minimal ${darkMode ? "dark" : "light"} ${className}`}>
        {renderSearchBar()}
        <button className="mobile-search-toggle" onClick={toggleMobileSearch} aria-label="Toggle search">
          <i className="search-icon"></i>
        </button>

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
          <div className="user-profile" ref={dropdownRef} onClick={toggleDropdown} data-open={dropdownOpen}>
            {renderAvatar("user-avatar")}
            <i className="dropdown-icon"></i>
            {dropdownOpen && renderProfileDropdown()}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "with-title") {
    return (
      <div className={`horizontal-navbar with-title ${className} ${darkMode ? "dark" : "light"}`} style={{ backgroundColor: darkMode ? "#23272f" : "#F7F4F3" }}>
        <div className="navbar-title">
          <button className="menu-toggle large-button" onClick={toggleSidebar}>
            <i className="menu-icon"></i>
          </button>
          <img src="/src/assets/logo.svg" alt="Logo" className="navbar-logo" style={{ height: "40px", marginRight: "10px" }} />
        </div>
        {renderSearchBar()}
        <button className="mobile-search-toggle" onClick={toggleMobileSearch} aria-label="Toggle search">
          <i className="search-icon"></i>
        </button>
        <div className="navbar-actions">
          <button className="theme-toggle large-button" onClick={toggleDarkMode} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <span className="theme-toggle-icon theme-toggle-sun">🌞</span>
            <span className="theme-toggle-icon theme-toggle-moon">🌙</span>
          </button>
          <button className="notification-button large-button">
            <svg className="notification-icon large-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <div className="user-profile large-profile" ref={dropdownRef} onClick={toggleDropdown}>
            {renderAvatar("user-avatar large-avatar")}
            <i className="dropdown-icon"></i>
            {dropdownOpen && renderProfileDropdown()}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "configurations") {
    return (
      <div className={`horizontal-navbar configurations ${className}`} style={{ backgroundColor: "#F7F4F3" }}>
        <div className="navbar-title">
          <button className="menu-toggle large-button" onClick={toggleSidebar}>
            <i className="menu-icon"></i>
          </button>
          <img src="/src/assets/logo.svg" alt="Logo" className="navbar-logo" style={{ height: "40px" }} />
          <h2>Configurations</h2>
          <div className="breadcrumbs">
            <span className="breadcrumb-item">Settings</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">Configurations</span>
          </div>
        </div>

        <div className="search-container large-search">
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button className="keyboard-shortcut">
            <span>⌘</span> F
          </button>
        </div>

        <div className="navbar-actions">
          <button className="theme-toggle large-button" onClick={toggleDarkMode}>
            <span className="theme-toggle-icon theme-toggle-sun">🌞</span>
            <span className="theme-toggle-icon theme-toggle-moon">🌙</span>
          </button>
          <button className="notification-button large-button">
            <svg className="notification-icon large-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <div className="user-profile large-profile" ref={dropdownRef} onClick={toggleDropdown}>
            {renderAvatar("user-avatar large-avatar")}
            <i className="dropdown-icon"></i>
            {dropdownOpen && renderProfileDropdown()}
          </div>
        </div>
      </div>
    );
  }

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
          <div className="user-profile large-profile" ref={dropdownRef} onClick={toggleDropdown}>
            {renderAvatar("user-avatar large-avatar")}
            <i className="dropdown-icon"></i>
            {dropdownOpen && renderProfileDropdown()}
          </div>
        </div>
      </div>
    );
  }

  // Default nav with links
  return (
    <div className={`horizontal-navbar with-links ${className}`} style={{ backgroundColor: "#F7F4F3" }}>
      <div className="navbar-brand">
        <button className="menu-toggle large-button" onClick={toggleSidebar}>
          <i className="menu-icon"></i>
        </button>
        <div className="company-logo">
          <img src="/src/assets/logo.svg" alt="Logo" className="navbar-logo" style={{ height: "40px" }} />
        </div>
        <span className="company-name">deFransz</span>
      </div>

      <nav className="navbar-links">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <i className="dashboard-icon"></i>
          <span>Dashboard</span>
        </Link>
        <Link to="/analytics" className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}>
          <i className="analytics-icon"></i>
          <span>Analytics</span>
          <i className="dropdown-arrow"></i>
        </Link>
        <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
          <i className="products-icon"></i>
          <span>Products</span>
          <i className="dropdown-arrow"></i>
        </Link>
        <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
          <i className="settings-icon"></i>
          <span>Settings</span>
        </Link>
      </nav>

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
        <div className="user-profile" ref={dropdownRef} onClick={toggleDropdown}>
          {renderAvatar("user-avatar")}
          <i className="dropdown-icon"></i>
          {dropdownOpen && renderProfileDropdown()}
        </div>
      </div>
    </div>
  );
};

export default HorizontalNavbar;