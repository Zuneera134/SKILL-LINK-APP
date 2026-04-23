import React from "react";
import { useNavigate } from "react-router-dom";
import "./EmergencyBox.css";

export default function EmergencyBox() {
  const navigate = useNavigate();

  return (
    <div className="my-5 px-0 emergency-wrap">
      <div className="emergency-box p-5 rounded text-white text-center shadow">
        <h2 className="fw-bold mb-3">⚡ Emergency Help Needed?</h2>
        <p className="fs-5 mb-4">
          Get instant connection with trusted and nearby skilled workers.
        </p>

        <div>
          <button
            type="button"
            className="btn btn-light me-3"
            onClick={() => navigate("/emergency")}
          >
            Get Immediate Help Now
          </button>
        </div>

        <div className="light-overlay"></div>
      </div>
    </div>
  );
}
