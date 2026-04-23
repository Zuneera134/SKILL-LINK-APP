import React from "react";
import { Link } from "react-router-dom";

export default function ServicesSection() {
  return (
    <div className="row g-3 mb-4">
      {["Electrician", "Plumber", "Carpenter", "Painter", "Technician"].map((s) => (
        <div className="col-md-4" key={s}>
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">{s}</h5>
              <p className="card-text">Book verified {s.toLowerCase()} providers.</p>
              <Link to="/services" className="btn btn-primary btn-sm">Explore</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
