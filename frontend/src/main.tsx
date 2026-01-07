import React from "react";
import ReactDOM from "react-dom/client";
import LandingPage from "./LandingPage";
import "./assets/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import UserProvider from "./context/UserContext";
import Home from "./components/Home";
import History from "./components/History";
import Calculation from "./components/Calculation";
import Insights from "./components/Insights";
import Profile from "./components/Profile";

import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/history" element={<History />} />
              <Route path="/calculation/:id" element={<Calculation />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </UserProvider>
  </React.StrictMode>
);
