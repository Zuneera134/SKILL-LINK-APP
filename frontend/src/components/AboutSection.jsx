import React from "react";
import { useNavigate } from "react-router-dom";
import { LightningFill, ShieldLockFill, PeopleFill } from "react-bootstrap-icons";

export default function AboutSection() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <LightningFill size={36} className="text-warning" />,
      title: "Fast & Instant Help",
      desc: "Connect instantly with nearby trusted professionals for any urgent service.",
      to: "/emergency",
    },
    {
      icon: <ShieldLockFill size={36} className="text-success" />,
      title: "Verified & Reliable",
      desc: "All workers are verified to ensure safety, trust, and quality service.",
      to: "/about",
    },
    {
      icon: <PeopleFill size={36} className="text-primary" />,
      title: "Wide Range of Services",
      desc: "Electricians, plumbers, carpenters, painters, technicians all in one platform.",
      to: "/services",
    },
  ];

  return (
    <div className="about-section py-5">
      <div className="container text-center">
        <h2 className="mb-3">About Skill Link</h2>
        <p className="mb-5 fs-5 mx-auto" style={{ maxWidth: "700px", color: "#555" }}>
          Skill Link connects clients with reliable,verified skilled workers electricians,plumbers,carpenters,painters and technicians for fast,dependable and trustworthy service.
        </p>

        <div className="row justify-content-center">
          {features.map((f, i) => (
            <div key={i} className="col-md-4 mb-4">
              <div
                className="feature-card p-4 rounded shadow-sm h-100"
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(f.to)}
                onKeyDown={(e) => e.key === "Enter" && navigate(f.to)}
              >
                <div className="mb-3">{f.icon}</div>
                <h5>{f.title}</h5>
                <p style={{ color: "#666" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
