import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App"; // Corrected path

// Log for debugging
console.log("⚡⚡⚡ Application starting up ⚡⚡⚡");
console.log("If you see this in the browser console, the app is loaded!");

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
