import React from "react";
import ReactDOM from "react-dom/client";
import LandingPage from "./LandingPage";
import "./assets/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import UserProvider from "./context/UserContext";
import Home from "./components/Home";
import History from "./components/History";
import CalculationView from "./components/Calculation";
import Insights from "./components/Insights";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/calculation/:id" element={<CalculationView />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </UserProvider>
  </React.StrictMode>
);
