import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import "./styles.css";

// Ensure dark mode initializes immediately on initial paint
try {
  if (!localStorage.getItem("portfolio-theme")) {
    localStorage.setItem("portfolio-theme", "dark");
  }
} catch {
  // Local storage unavailable
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
