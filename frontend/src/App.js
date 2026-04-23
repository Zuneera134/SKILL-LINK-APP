import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Emergency from "./pages/Emergency";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ClientDashboard from "./pages/ClientDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminPanel from "./pages/AdminPanel";

import Providers from "./pages/Providers";
import ProviderProfile from "./pages/ProviderProfile";

function Protected({ allow, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (allow && role !== allow) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { pathname } = useLocation();

  // ✅ Hide ONLY footer on login/register
  const hideFooter = pathname === "/login" || pathname === "/register";

  return (
    <>
      <Header />

      <div style={{ paddingTop: 90, minHeight: "100vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ Search results */}
          <Route path="/providers" element={<Providers />} />
          <Route path="/provider/:id" element={<ProviderProfile />} />

          {/* Dashboards */}
          <Route
            path="/client"
            element={
              <Protected allow="client">
                <ClientDashboard />
              </Protected>
            }
          />
          <Route
            path="/worker"
            element={
              <Protected allow="serviceProvider">
                <WorkerDashboard />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected allow="admin">
                <AdminPanel />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!hideFooter && <Footer />}
    </>
  );
}
