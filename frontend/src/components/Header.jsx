import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/skilllinkLogo.png";
import "../styles/header.css";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "admin" | "client" | "serviceProvider"

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  const dashboardPath =
    role === "admin" ? "/admin" : role === "serviceProvider" ? "/worker" : "/client";

  const navClass = ({ isActive }) =>
    `nav-link nav-item-link ${isActive ? "active-link" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top skill-navbar">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Skill Link Logo" className="nav-logo" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div id="nav" className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
            <li className="nav-item">
              <NavLink to="/" className={navClass} end>
                <i className="bi bi-house-door-fill me-2"></i>
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/services" className={navClass}>
                <i className="bi bi-grid-fill me-2"></i>
                Services
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/emergency"
                className={({ isActive }) =>
                  `nav-link nav-item-link emergency-link ${isActive ? "active-emergency" : ""}`
                }
              >
                <i className="bi bi-lightning-charge-fill me-2"></i>
                Emergency
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/about" className={navClass}>
                <i className="bi bi-info-circle-fill me-2"></i>
                About
              </NavLink>
            </li>

            {/* Auth buttons */}
            {!token ? (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-primary btn-sm nav-btn" to="/login">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm nav-btn primary" to="/register">
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-dark btn-sm nav-btn" to={dashboardPath}>
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-danger btn-sm nav-btn danger" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
