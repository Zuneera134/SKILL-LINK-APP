import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";

export default function Providers() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const city = (params.get("city") || "").trim();
  const skill = (params.get("skill") || "").trim();

  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    if (!city || !skill) {
      setProviders([]);
      setError("Please enter City and Skill.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const res = await api.get("/users/providers", {
        params: { city, skill },
      });

      setProviders(res.data || []);
    } catch (e) {
      console.log("Providers load error:", e.response?.data || e.message);
      setError(e.response?.data?.message || "Failed to search providers");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [city, skill]);

  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h2 className="mb-1">Providers</h2>
          <div className="text-muted">
            City: <b>{city || "-"}</b> • Skill: <b>{skill || "-"}</b>
          </div>
        </div>

        <button className="btn btn-outline-primary" onClick={load} disabled={loading}>
          {loading ? "Searching..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : loading ? (
        <div className="alert alert-info">Searching providers...</div>
      ) : providers.length === 0 ? (
        <div className="alert alert-warning">
          No providers found for <b>{skill}</b> in <b>{city}</b>.
        </div>
      ) : (
        <div className="row g-3">
          {providers.map((p) => (
            <div key={p._id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <img
                      src={p.avatarUrl || "https://via.placeholder.com/56"}
                      alt="avatar"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(13,110,253,0.25)",
                      }}
                    />
                    <div>
                      <div className="fw-bold">{p.name}</div>
                      <div className="text-muted small">
                        {p.skill} • {p.city}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-0">
                    <span className="badge bg-primary">
                      Price: {p.price || 0} PKR/day
                    </span>

                    <span className="badge bg-success">
                      {p.avgRating || 0} ⭐ ({p.totalReviews || 0})
                    </span>
                  </div>

                 
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
