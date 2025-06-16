import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import HorizontalNavbar from "./components/HorizontalNavbar";
import HRDashboard from "./components/HRDashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import SideNav from "./components/SideNav";
import Signup from "./components/Signup";
import About from "./pages/About";
import Dashboard from "./pages/AdminDashboard";
import Contact from "./pages/Contact";
import CreateResume from "./pages/CreateResume";
import Home from "./pages/Home";
import ResumePreview from "./pages/ResumePreview";
import ResumeTemplates from "./pages/ResumeTemplates";
import UploadResume from "./pages/UploadResume";
import "./styles/contact.css";
import "./styles/global.css";
import { initializeSampleJobs, sampleJobs } from "./utils/sampleJobs";

const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // Default to light mode
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("Starting initial data loading...");

        // Initialize sample jobs in localStorage
        const jobsAdded = initializeSampleJobs();

        if (jobsAdded > 0) {
          console.log(`✅ Successfully added ${jobsAdded} job listings to the database`);
        } else {
          // If no new jobs were added, check how many are already stored
          const existingJobs = localStorage.getItem("hrJobs");
          if (existingJobs) {
            try {
              const parsedJobs = JSON.parse(existingJobs);
              if (parsedJobs && parsedJobs.length > 0 && parsedJobs[0].position) {
                const jobCount = parsedJobs.length;
                console.log(`ℹ️ Using existing database with ${jobCount} job listings`);
              } else {
                // If localStorage has empty array or invalid data, force reload
                console.log("⚠️ Job data invalid, forcing reload");
                localStorage.setItem("hrJobs", JSON.stringify(sampleJobs));
                console.log(`✅ Forced reload of ${sampleJobs.length} job listings`);
              }
            } catch (e) {
              // If JSON parsing fails, force reload jobs
              console.error("Error parsing job data:", e);
              localStorage.setItem("hrJobs", JSON.stringify(sampleJobs));
              console.log(`✅ Forced reload of ${sampleJobs.length} job listings due to error`);
            }
          } else {
            // Fallback if somehow initialization failed
            localStorage.setItem("hrJobs", JSON.stringify(sampleJobs));
            console.log(`✅ Fallback initialization of ${sampleJobs.length} job listings`);
          }
        }

        // Check if dummy job data is accidentally stored (fixes displayed 'SS' values)
        const storedJobs = localStorage.getItem("hrJobs");
        if (storedJobs && storedJobs.includes('"position":"SS"')) {
          console.warn("Detected dummy job data, replacing with sample jobs");
          localStorage.setItem("hrJobs", JSON.stringify(sampleJobs));
          console.log(`✅ Replaced dummy data with ${sampleJobs.length} sample job listings`);
        }

        // Initialize applied jobs tracking if it doesn't exist
        if (!localStorage.getItem("appliedJobs")) {
          // Start with a few sample applied jobs for demo purposes
          const sampleAppliedJobs = ["sd1", "ds2", "fn3", "mk4", "sd5"];
          localStorage.setItem("appliedJobs", JSON.stringify(sampleAppliedJobs));
          console.log("✅ Initialized sample applied jobs tracking");
        }

        // Initialize user skills if they don't exist
        if (!localStorage.getItem("userSkills")) {
          const sampleSkills = [
            "JavaScript", "React", "Node.js", "HTML", "CSS",
            "Problem Solving", "Communication", "Project Management"
          ];
          localStorage.setItem("userSkills", JSON.stringify(sampleSkills));
          console.log("✅ Initialized sample user skills");
        }

        setInitialDataLoaded(true);
      } catch (error) {
        console.error("Error in initial data loading:", error);
        // Fallback in case of error - directly set jobs
        try {
          localStorage.setItem("hrJobs", JSON.stringify(sampleJobs));
          console.log(`✅ Emergency fallback: loaded ${sampleJobs.length} job listings`);
        } catch (e) {
          console.error("Critical error setting jobs data:", e);
        }
        // Still mark as loaded to prevent blocking UI
        setInitialDataLoaded(true);
      }
    };

    loadInitialData();

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUser = localStorage.getItem("user");

    if (isLoggedIn && storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (isLoggedIn) {
      // If logged in but no user data, set default user
      const defaultUser = {
        name: "User",
        email: "user@example.com",
        profilePic: "/src/assets/default-avatar.svg"
      };
      setUser(defaultUser);
    } else {
      setUser(null);
    }

    // Check for dark mode preference but default to false (light mode)
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);

    // Check for sidebar preference
    const isSidebarExpanded = localStorage.getItem("sidebarExpanded") === "true";
    setSidebarExpanded(isSidebarExpanded);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  const toggleSidebar = () => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    localStorage.setItem("sidebarExpanded", newState.toString());
  };

  const handleSidebarHover = (isHovering) => {
    setIsHovered(isHovering);
  };

  // Mock user for demo purposes
  const mockUser = {
    name: "Natashia Bunny",
    email: "natashabunny@gmail.com",
    profilePic: "/src/assets/natasha-avatar.svg"
  };

  // If data isn't loaded yet, show a minimal loading state
  if (!initialDataLoaded) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className={darkMode ? "app-container dark-mode" : "app-container"}>
      <HorizontalNavbar
        user={mockUser}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        variant="with-title"
        className="full-width"
        toggleSidebar={toggleSidebar}
      />
      <div className="main-content-area">
        <SideNav
          expanded={sidebarExpanded}
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          onHoverChange={handleSidebarHover}
        />
        <main className={`main-content ${(sidebarExpanded || isHovered) ? 'sidebar-expanded' : ''}`}>
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={
                <ProtectedRoute requiresRole="individual">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/templates" element={<ResumeTemplates />} />
              <Route path="/upload" element={
                <ProtectedRoute requiresRole="individual">
                  <UploadResume />
                </ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute requiresRole="individual">
                  <CreateResume />
                </ProtectedRoute>
              } />
              <Route path="/preview" element={
                <ProtectedRoute requiresRole="individual">
                  <ResumePreview />
                </ProtectedRoute>
              } />
              <Route path="/hr-dashboard" element={
                <ProtectedRoute requiresRole="hr">
                  <HRDashboard />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default App;
