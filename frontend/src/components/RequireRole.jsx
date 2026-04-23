import React from "react";
import { Navigate } from "react-router-dom";

export default function RequireRole({ role: neededRole, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  // Allow multiple roles if neededRole is array
  if (Array.isArray(neededRole)) {
    if (!neededRole.includes(role)) return <Navigate to="/login" replace />;
  } else {
    if (role !== neededRole) return <Navigate to="/login" replace />;
  }

  return children;
}
