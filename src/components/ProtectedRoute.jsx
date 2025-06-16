import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requiresRole }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check if the user is logged in
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    
    // Get user role
    const storedRole = localStorage.getItem("userRole");
    setUserRole(storedRole || "individual"); // Default to individual if not set
  }, []);

  // Show loading while checking authentication state
  if (isLoggedIn === null || userRole === null) {
    return <div className="loading-auth">Checking authentication...</div>;
  }

  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If requiresRole is specified, check if user has the required role
  if (requiresRole && userRole !== requiresRole) {
    // Redirect HR users to HR dashboard if they try to access individual-only routes
    if (userRole === "hr" && requiresRole === "individual") {
      return <Navigate to="/hr-dashboard" replace />;
    }
    
    // Redirect individual users to home page if they try to access HR-only routes
    if (userRole === "individual" && requiresRole === "hr") {
      return <Navigate to="/" replace />;
    }
  }

  // If logged in and has required role (or no role required), render the protected component
  return children;
};

export default ProtectedRoute; 