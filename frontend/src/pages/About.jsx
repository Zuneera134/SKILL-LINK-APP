import React from "react";
import "../styles/About.css";

export default function About() {
  const primaryBlue = "#1e3a8a";

  const badges = ["Trusted Professionals", "Emergency Support", "Secure Hiring"];

  return (
    <div className="about-page">
      {/* Header hero (reduced top gap) */}
      <header className="about-hero py-4">
        <div className="container py-3">
          <div className="text-center">
            <span className="about-eyebrow">SKILL LINK</span>
            <h2 className="about-title">About Skill Link</h2>
            <p className="about-subtitle mx-auto">
              Skill Link connects clients with verified skilled workers for safe,
              reliable, and fast help — anytime, anywhere.
            </p>
            <div className="mt-3">
              {badges.map((text, i) => (
                <span key={i} className="about-badge mx-1">
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4">
        {/* Mission & Solution */}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="about-card p-4 rounded-4 h-100">
              <h4 className="about-card-title mb-3">The Problem We're Solving</h4>
              <p className="text-muted">
                In our society, daily wage workers are a common sight. Every morning,
                we see them waiting on street corners, hoping for work. Many return home
                without jobs despite having real skills.
              </p>
              <p className="text-muted mb-0">
                Emergencies like short circuits or pipe bursts make finding safe, verified
                workers difficult — leading to security risks and delays.
              </p>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="about-card p-4 rounded-4 h-100">
              <h4 className="about-card-title mb-3">Our Solution</h4>
              <p className="text-muted">
                <strong>Skill Link</strong> is a web platform that safely connects skilled
                professionals with clients, similar to how FoodPanda connects food services.
              </p>
              <p className="text-muted mb-0">
                It offers reliable hiring, worker verification, and an{" "}
                <strong>Emergency Feature</strong> for urgent needs.
              </p>
            </div>
          </div>
        </div>

        {/* Project Overview */}
        <div className="about-card mt-4 p-4 rounded-4">
          <h4 className="about-card-title mb-3">Project Overview</h4>
          <p className="text-muted mb-0">
            Skill Link enables users to find electricians, plumbers, builders, and other
            skilled professionals quickly and safely.
          </p>
        </div>

        {/* Objectives + Target Users */}
        <div className="row g-4 mt-1">
          <div className="col-12 col-lg-6">
            <div className="about-card p-4 rounded-4 h-100">
              <h4 className="about-card-title mb-3">Objectives</h4>
              <ul className="about-list text-muted mb-0">
                <li>Connect skilled workers and clients</li>
                <li>Provide consistent job opportunities</li>
                <li>Enable safe and transparent hiring</li>
                <li>Build a complete full-stack platform</li>
              </ul>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="about-card p-4 rounded-4 h-100">
              <h4 className="about-card-title mb-3">Target Users</h4>
              <p className="text-muted"><strong>Clients:</strong> Individuals needing trusted services</p>
              <p className="text-muted"><strong>Service Providers:</strong> Skilled workers seeking jobs</p>
              <p className="text-muted mb-0"><strong>Admin:</strong> Ensures platform security</p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="about-card mt-4 p-4 rounded-4">
          <h4 className="about-card-title mb-3">Key Features</h4>
          <ul className="about-list text-muted mb-0">
            <li>React &amp; Bootstrap based responsive UI</li>
            <li>Verified provider profiles</li>
            <li>Client booking &amp; review system</li>
            <li>Admin monitoring panel</li>
            <li><strong>Emergency Support</strong></li>
          </ul>
        </div>

        {/* Vision */}
        <div className="about-card about-card-accent mt-4 p-4 rounded-4 text-center">
          <h4 className="about-card-title mb-2">Our Vision</h4>
          <p className="text-muted">
            Skill Link aims to create a trusted digital ecosystem where skilled workers
            receive fair opportunities and clients get reliable services.
          </p>
          <h6 className="about-founders fw-bold mt-3 mb-1">Founders</h6>
          <p className="about-founders-name mb-0" style={{ color: primaryBlue }}>
            Zuneera Tariq &amp; Zahra Shah
          </p>
        </div>
      </div>
    </div>
  );
}
