import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/horizontalNavbar.css";

const HorizontalNavbar = ({ user, darkMode, toggleDarkMode, variant = "default", className = "", toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    // Close mobile search and menu on click outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMobileSearchVisible(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      const nav = document.querySelector('.horizontal-navbar');
      const mobileMenu = document.querySelector('.mobile-menu');
      if (mobileMenuOpen && nav && mobileMenu &&
        !nav.contains(event.target) && !mobileMenu.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    // Close mobile menu on route change
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
      setMobileSearchVisible(false);
      setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // Focus search input when mobile search is opened
  useEffect(() => {
    if (mobileSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchVisible]);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen || mobileSearchVisible) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen, mobileSearchVisible]);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (dropdownOpen) setDropdownOpen(false);
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

  const renderMobileMenu = () => (
    <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
      <div className="mobile-nav-links">
        <Link
          to="/"
          className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <i className="home-icon"></i>
          <span>Home</span>
        </Link>
        <Link
          to="/dashboard"
          className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <i className="dashboard-icon"></i>
          <span>Dashboard</span>
        </Link>
        <Link
          to="/analytics"
          className={`mobile-nav-link ${isActive('/analytics') ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <i className="analytics-icon"></i>
          <span>Analytics</span>
        </Link>
        <Link
          to="/settings"
          className={`mobile-nav-link ${isActive('/settings') ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <i className="settings-icon"></i>
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );

  const renderThemeToggle = () => (
    <button
      className="theme-toggle"
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <svg
        className="theme-toggle-icon theme-toggle-sun"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM2 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm18 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1zM5.7 5.7a1 1 0 0 1 0-1.4l1.4-1.4a1 1 0 1 1 1.4 1.4L7.1 5.7a1 1 0 0 1-1.4 0zm11.8 11.8a1 1 0 0 1 0-1.4l1.4-1.4a1 1 0 1 1 1.4 1.4l-1.4 1.4a1 1 0 0 1-1.4 0zM5.7 18.3a1 1 0 0 1-1.4 0l-1.4-1.4a1 1 0 1 1 1.4-1.4l1.4 1.4a1 1 0 0 1 0 1.4zm11.8-11.8a1 1 0 0 1-1.4 0l-1.4-1.4a1 1 0 1 1 1.4-1.4l1.4 1.4a1 1 0 0 1 0 1.4z" />
      </svg>
      <svg
        className="theme-toggle-icon theme-toggle-moon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M10 7a7 7 0 0 0 12 4.9v.1c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2h.1A6.979 6.979 0 0 0 10 7zm-6 5a8 8 0 0 0 15.062 3.762A9 9 0 0 1 8.238 4.938 7.999 7.999 0 0 0 4 12z" />
      </svg>
    </button>
  );

  // Render based on variant
  if (variant === "minimal") {
    return (
      <>
        <div className={`horizontal-navbar minimal ${darkMode ? "dark" : "light"} ${className}`}>
          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <i className={`menu-icon ${mobileMenuOpen ? 'active' : ''}`}></i>
          </button>

          {renderSearchBar()}
          <button className="mobile-search-toggle" onClick={toggleMobileSearch} aria-label="Toggle search">
            <i className="search-icon"></i>
          </button>

          <div className="navbar-actions">
            {renderThemeToggle()}
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
        {renderMobileMenu()}
        {(mobileMenuOpen || mobileSearchVisible) && (
          <div
            className={`mobile-menu-overlay ${mobileMenuOpen || mobileSearchVisible ? 'active' : ''}`}
            onClick={() => {
              setMobileMenuOpen(false);
              setMobileSearchVisible(false);
            }}
          />
        )}
      </>
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
          {renderThemeToggle()}
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
          {renderThemeToggle()}
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
          {renderThemeToggle()}
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
    <>
      <div className={`horizontal-navbar with-links ${className}`} style={{ backgroundColor: "#F7F4F3" }}>
        <div className="navbar-brand">
          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <i className={`menu-icon ${mobileMenuOpen ? 'active' : ''}`}></i>
          </button>
          <div className="company-logo">
            <img src="/src/assets/logo.svg" alt="Logo" className="navbar-logo" style={{ height: "40px" }} />
          </div>
          <span className="company-name">deFransz</span>
        </div>

        <nav className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
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
          {renderThemeToggle()}
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
      {renderMobileMenu()}
      {(mobileMenuOpen || mobileSearchVisible) && (
        <div
          className={`mobile-menu-overlay ${mobileMenuOpen || mobileSearchVisible ? 'active' : ''}`}
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileSearchVisible(false);
          }}
        />
      )}
    </>
  );
};

export default HorizontalNavbar;