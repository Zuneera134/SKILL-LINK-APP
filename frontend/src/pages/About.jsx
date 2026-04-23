import React from "react";
import "../styles/About.css";


export default function About() {
  const primaryBlue = "#1e3a8a";

  return (
    <div className="container mt-5 pt-5">
      {/* Header */}
      <div className="text-center mb-5">
        <img
          src="image.png"
          alt="Skill Link Logo"
          style={{ height: "150px", marginBottom: "25px" }}
        />

        <h2 className="fw-bold" style={{ color: primaryBlue }}>
          About Skill Link
        </h2>

        <p className="mt-3 fs-5 text-muted">
          Skill Link connects clients with verified skilled workers for safe, reliable,
          and fast help — anytime, anywhere.
        </p>

        <div className="mt-3">
          {["Trusted Professionals", "Emergency Support", "Secure Hiring"].map((text, i) => (
            <span
              key={i}
              className="badge me-2"
              style={{
                backgroundColor: "#acc4e4ff",
                color: primaryBlue,
                fontSize: "1rem",
                padding: "0.6rem 0.9rem",
                borderRadius: "999px",
              }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Mission & Problem */}
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="about-card p-4 rounded-4 shadow-sm h-100">
            <h4 className="fw-semibold mb-3">The Problem We’re Solving</h4>
            <p className="text-muted">
              In our society,daily wage workers are a common sight.Every morning,we see
              them waiting on street corners, hoping for work.Many return home without jobs
              despite having real skills.
            </p>
            <p className="text-muted">
              Emergencies like short circuits or pipe bursts make finding safe,verified
              workers difficult leading to security risks and delays.
            </p>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="about-card p-4 rounded-4 shadow-sm h-100">
            <h4 className="fw-semibold mb-3">Our Solution</h4>
            <p className="text-muted">
              <strong>Skill Link</strong> is a web platform that safely connects skilled
              professionals with clients, similar to how FoodPanda connects food services.
            </p>
            
            <p className="text-muted">
              It offers reliable hiring, worker verification, and an
              <strong> Emergency Feature</strong> for urgent needs.
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="about-card mt-4 p-4 rounded-4 shadow-sm">
        <h4 className="fw-semibold mb-3">Project Overview</h4>
        <p className="text-muted">
          Skill Link enables users to find electricians, plumbers, builders, and other
          skilled professionals quickly and safely.
        </p>
      </div>

      {/* Objectives + Target Users */}
      <div className="row g-4 mt-1">
        <div className="col-12 col-lg-6">
          <div className="about-card p-4 rounded-4 shadow-sm h-100">
            <h4 className="fw-semibold mb-3">Objectives</h4>
            <ul className="text-muted">
              <li>Connect skilled workers and clients</li>
              <li>Provide consistent job opportunities</li>
              <li>Enable safe and transparent hiring</li>
              <li>Build a complete full-stack platform</li>
            </ul>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="about-card p-4 rounded-4 shadow-sm h-100">
            <h4 className="fw-semibold mb-3">Target Users</h4>
            <p className="text-muted">
              <strong>Clients:</strong> Individuals needing trusted services
            </p>
            <p className="text-muted">
              <strong>Service Providers:</strong> Skilled workers seeking jobs
            </p>
            <p className="text-muted">
              <strong>Admin:</strong> Ensures platform security
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="about-card mt-4 p-4 rounded-4 shadow-sm">
        <h4 className="fw-semibold mb-3">Key Features</h4>
        <ul className="text-muted">
          <li>React & Bootstrap based responsive UI</li>
          <li>Verified provider profiles</li>
          <li>Client booking & review system</li>
          <li>Admin monitoring panel</li>
          <li><strong>Emergency Support</strong></li>
        </ul>
      </div>

      {/* Vision */}
      <div className="about-card mt-4 p-4 rounded-4 shadow-sm">
        <h4 className="fw-semibold mb-2">Our Vision</h4>
        <p className="text-muted">
          Skill Link aims to create a trusted digital ecosystem where skilled workers
          receive fair opportunities and clients get reliable services.
        </p>

        <h6 className="fw-bold">Founders</h6>
        <p className="text-muted mb-0">Zahra Shah &amp; Zuneera Tariq</p>
      </div>
    </div>
  );
}
