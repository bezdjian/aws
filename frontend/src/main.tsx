import React from "react";
import ReactDOM from "react-dom/client";
import LandingPage from "./LandingPage";
import "./assets/index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import UserProvider from "./context/UserContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <ToastProvider>
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      </ToastProvider>
    </UserProvider>
  </React.StrictMode>
);
