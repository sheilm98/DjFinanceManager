import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { getUser } from "./lib/auth";

// Pre-fetch user authentication state
const prefetchAuth = async () => {
  try {
    const user = await getUser();
    if (user) {
      // Pre-populate the query cache with the user
      // This avoids the need for a loading state on the first render
      window.__INITIAL_STATE__ = {
        user,
      };
    }
  } catch (error) {
    console.error("Failed to prefetch auth state:", error);
  }
};

// Start app initialization
const startApp = () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<App />);
  }
};

// Bootstrap the application
(async () => {
  await prefetchAuth();
  startApp();
})();
