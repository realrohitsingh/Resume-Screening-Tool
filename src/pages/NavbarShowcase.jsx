import React, { useState } from "react";
import CompactNavbar from "../components/CompactNavbar";
import HorizontalNavbar from "../components/HorizontalNavbar";

const NavbarShowcase = () => {
  const [darkMode, setDarkMode] = useState(false);

  const mockUser = {
    name: "Natashia Bunny",
    email: "natashabunny@gmail.com",
    profilePic: "/src/assets/natasha-avatar.svg"
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`navbar-showcase ${darkMode ? "dark-mode" : ""}`}>
      <div className="theme-toggle-container">
        <button onClick={toggleDarkMode} className="theme-toggle-button">
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>

      <div className="showcase-section">
        <h2>Dashboard with Search</h2>
        <HorizontalNavbar
          user={mockUser}
          darkMode={darkMode}
          variant="with-title"
        />
      </div>

      <div className="showcase-section">
        <h2>Configurations with Breadcrumbs</h2>
        <HorizontalNavbar
          user={mockUser}
          darkMode={darkMode}
          variant="configurations"
        />
      </div>

      <div className="showcase-section">
        <h2>Basic Search Bar</h2>
        <HorizontalNavbar
          user={mockUser}
          darkMode={darkMode}
          variant="minimal"
        />
      </div>

      <div className="showcase-section">
        <h2>Navigation with Links</h2>
        <HorizontalNavbar
          user={mockUser}
          darkMode={darkMode}
        />
      </div>

      <div className="showcase-section">
        <h2>Dashboard with Tabs (Text)</h2>
        <CompactNavbar
          user={mockUser}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          variant="text-links"
        />
      </div>

      <div className="showcase-section">
        <h2>Dashboard with Icon Tabs</h2>
        <CompactNavbar
          user={mockUser}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>
    </div>
  );
};

export default NavbarShowcase;