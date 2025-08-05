import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MobileWebApp from "./MobileWebApp";

// Start mobile app
const startApp = () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<MobileWebApp />);
  }
};

startApp();
