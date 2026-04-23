import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/global.css";
import "../styles/services.css";

export default function Services() {
  const { search } = useLocation();
  const nav = useNavigate();

  const profilesRef = useRef(null);
  const [selectedService, setSelectedService] = useState(null);

  // ✅ store providers loaded from backend for selected category
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const list = useMemo(
    () => [
      { service: "Electrician", key: "electrician", bg: require("../assets/electrician.jpg") },
      { service: "Plumber", key: "plumber", bg: require("../assets/plumber.jpg") },
      { service: "Carpenter", key: "carpenter", bg: require("../assets/carpenting.jpg") },
      { service: "Painter", key: "painter", bg: require("../assets/painting.jpg") },
      { service: "Technician", key: "technician", bg: require("../assets/technician.jpg") },
      { service: "Cleaner", key: "cleaner", bg: require("../assets/cleaning.jpg") },
      { service: "Gardener", key: "gardener", bg: require("../assets/gardening.jpg") },
      { service: "Mason", key: "mason", bg: require("../assets/mason.jpg") },
      { service: "Laborer", key: "laborer", bg: require("../assets/laborer.jpg") },
    ],
    []
  );

  const scrollToProfiles = () => {
    setTimeout(() => {
      profilesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const normalizeSkillForBackend = (serviceName) => {
    return String(serviceName || "").trim(); // stored like "Electrician", "Painter" etc.
  };

  const normalize = (v) => String(v || "").toLowerCase().trim();

  const loadProviders = async (serviceName) => {
    try {
      setLoadingProviders(true);
      setProviders([]);

      const skill = normalizeSkillForBackend(serviceName);

      let res;

      // ✅ Primary (your server uses /api/users routes)
      try {
        res = await api.get("/users/providers", {
          params: { skill, city: "" },
        });
      } catch (err1) {
        // ✅ Fallback if your frontend api baseURL is different or route is mounted elsewhere
        res = await api.get("/providers", {
          params: { skill, city: "" },
        });
      }

      const rawList = Array.isArray(res?.data) ? res.data : [];

      // ✅ Make sure ONLY approved service providers + correct skill are shown
      const filtered = rawList.filter((p) => {
        const approved = p?.approved === true || p?.isApproved === true || p?.verified === true;
        const isServiceProvider = normalize(p?.role) === "serviceprovider";
        const skillMatch = normalize(p?.skill) === normalize(skill);
        return approved && isServiceProvider && skillMatch;
      });

      setProviders(filtered);
    } catch (e) {
      console.error("loadProviders error:", e.response?.data || e.message);
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleCardClick = (index) => {
    setSelectedService(index);
    scrollToProfiles();
  };

  // ✅ auto-select from query param category
  useEffect(() => {
    const params = new URLSearchParams(search);
    const raw = params.get("category");
    if (!raw) return;

    const normalized = raw.toLowerCase().trim();
    const idx = list.findIndex(
      (x) => x.key === normalized || x.service.toLowerCase() === normalized
    );

    if (idx !== -1) {
      setSelectedService(idx);
      scrollToProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ✅ whenever selected category changes, fetch providers from backend
  useEffect(() => {
    if (selectedService === null) return;
    const serviceName = list[selectedService]?.service;
    if (!serviceName) return;
    loadProviders(serviceName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  return (
    <div className="services-page">
      <div className="container mt-5 pt-5 pb-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold services-title">Services We Provide</h2>
          <p className="text-muted mb-0">
            Pick a category to view available professionals near you.
          </p>
        </div>

        {/* Service cards */}
        <div className="row mt-4 g-4">
          {list.map((item, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4">
              <div
                className={`service-card ${selectedService === index ? "active" : ""}`}
                onClick={() => handleCardClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleCardClick(index)}
              >
                <div className="service-img-wrap">
                  <img src={item.bg} alt={item.service} className="service-img" />
                </div>
                <div className="service-card-body">
                  <h5 className="mb-1">{item.service}</h5>
                  <small className="text-muted">Tap to view workers</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Providers from backend */}
        {selectedService !== null && (
          <div ref={profilesRef} className="mt-5">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <h3 className="fw-bold m-0">{list[selectedService].service} Workers</h3>

              <span className="badge services-badge">
                {loadingProviders ? "Loading..." : `${providers.length} Available`}
              </span>
            </div>

            {loadingProviders ? (
              <div className="alert alert-info">Loading providers...</div>
            ) : providers.length === 0 ? (
              <div className="alert alert-warning">
                No providers found in this category yet.
                <br />
                (Register as a Service Provider and choose this skill.)
              </div>
            ) : (
              <div className="row g-4">
                {providers.map((p) => (
                  <div key={p._id} className="col-12 col-md-6 col-lg-3">
                    <div className="profile-card">
                      <div className="profile-top">
                        <img
                          src={p.avatarUrl || "https://via.placeholder.com/64"}
                          alt={p.name}
                          className="profile-avatar"
                        />
                        <div className="profile-name">
                          <h6 className="mb-0 fw-bold">{p.name}</h6>
                          <small className="text-muted">
                            {p.skill || list[selectedService].service}
                          </small>
                        </div>
                      </div>

                      <div className="profile-meta">
                        <div>
                          <span>City:</span> {p.city || "-"}
                        </div>
                        <div>
                          <span>Experience:</span> {p.experience || "-"}
                        </div>
                        <div>
                          <span>Age:</span> {p.age || "-"}
                        </div>
                      </div>

                      {/* ✅ per day */}
                      <div className="profile-price">
                        {p.price ? `${Number(p.price).toLocaleString()} PKR / day` : "—"}
                      </div>

                      <button
                        className="btn btn-primary w-100 mt-3 services-btn"
                        onClick={() => nav("/login")}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
