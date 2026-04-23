import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Emergency.css";
import MapSection from "../components/MapSection";

export default function Emergency() {
  const nav = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [service, setService] = useState("Electrician");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [suggested, setSuggested] = useState(null);
  const [loadingSuggested, setLoadingSuggested] = useState(false);

  const [booking, setBooking] = useState(null);

  // ✅ NEW: map query that follows address input
  const [mapQuery, setMapQuery] = useState("Pakistan");

  const [toast, setToast] = useState({ show: false, type: "success", msg: "" });
  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2800);
  };

  const phoneToDigits = (p) => String(p || "").replace(/[^\d+]/g, "");
  const mapsSearchLink = (addr) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr || "")}`;

  const loadSuggestedProvider = async () => {
    try {
      setLoadingSuggested(true);
      const res = await api.get("/users/providers", { params: { skill: service, city: "" } });
      const list = res.data || [];
      setSuggested(list.length ? list[0] : null);
    } catch {
      setSuggested(null);
    } finally {
      setLoadingSuggested(false);
    }
  };

  useEffect(() => {
    loadSuggestedProvider();
    // eslint-disable-next-line
  }, [service]);

  // ✅ NEW: debounce typed address -> update mapQuery
  useEffect(() => {
    const v = String(address || "").trim();

    const t = setTimeout(() => {
      if (!v) setMapQuery("Pakistan");
      else setMapQuery(v);
    }, 500);

    return () => clearTimeout(t);
  }, [address]);

  // ✅ NEW: if booking happens, map should show booking address
  useEffect(() => {
    if (booking?.address) setMapQuery(booking.address);
  }, [booking]);

  const explainGeoError = (err) => {
    if (!err) return "Could not fetch location. Please type address.";
    if (err.code === 1)
      return "Location permission denied. Allow location in browser/site settings, then try again.";
    if (err.code === 2)
      return "Location unavailable. Turn on Windows Location Services and try again.";
    if (err.code === 3)
      return "Location request timed out. Try again or type your address.";
    return "Could not fetch location. Please type address.";
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      showToast("danger", "Geolocation not supported in this browser");
      return;
    }

    showToast("info", "Fetching location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        // ✅ Keep it clean so MapSection detects coords easily
        const coords = `${lat},${lng}`;

        setAddress(coords);
        setMapQuery(coords);
        showToast("success", "Location added ✅");
      },
      (err) => {
        showToast("danger", explainGeoError(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const sendEmergency = async () => {
    if (!token) {
      showToast("danger", "Please login first to request emergency service");
      nav("/login");
      return;
    }

    if (!address.trim()) return showToast("danger", "Address is required");

    try {
      setLoading(true);
      const { data } = await api.post("/jobs/emergency", {
        service,
        address: address.trim(),
      });

      setBooking(data);
      showToast("success", `✅ Emergency booking created (${data._id})`);
      // keep address (optional) OR clear it:
      // setAddress("");
      setMapQuery(address.trim());
    } catch (err) {
      showToast("danger", err.response?.data?.message || "Emergency request failed");
    } finally {
      setLoading(false);
    }
  };

  const worker = booking?.workerId;

  return (
    <>
      {/* Toast */}
      <div style={{ position: "fixed", top: 90, right: 20, zIndex: 9999, minWidth: 300 }}>
        {toast.show && (
          <div className={`alert alert-${toast.type} shadow`} role="alert">
            {toast.msg}
          </div>
        )}
      </div>

      <div className="container mt-5 pt-5">
        {/* Top hero */}
        <div className="emg-hero">
          <div className="emergency-box p-5 rounded text-white">
            <div className="emg-hero-title">
              <h1 className="fw-bold mb-2">⚡ Emergency Help</h1>
              <p className="fs-5 mb-0">Instant connection with nearest approved worker.</p>
            </div>

            {/* ✅ Fill that blank space nicely */}
            <p className="mt-3 mb-0 text-white-50" style={{ maxWidth: 900 }}>
              Use this page for urgent situations like electrical short-circuits, water leakage, AC failure,
              or any immediate repair. Select the service, enter your exact location (or use GPS), and we’ll
              assign the nearest approved worker. After confirmation, you can call/WhatsApp and track the
              address on the map.
            </p>

            {!token && (
              <div className="alert alert-warning mt-3 mb-0 emg-alert">
                You must be logged in as a <b>Client</b> to send an emergency request.
                <button className="btn btn-dark btn-sm ms-2" onClick={() => nav("/login")}>
                  Login
                </button>
              </div>
            )}

            {/* Layout */}
            <div className="row g-4 mt-4 emg-grid">
              {/* Form column */}
              <div className="col-12 col-lg-7">
                <div className="emg-card glass p-4">
                  <div className="emg-card-head">
                    <div className="emg-pill">Fast • Verified • Safe</div>
                    <h4 className="mb-1 fw-bold">Request Emergency</h4>
                    <div className="text-white-50">
                      Choose service + enter address. We’ll assign the nearest approved worker.
                    </div>
                  </div>

                  <div className="row g-3 mt-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-white">Service</label>
                      <select
                        className="form-select"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                      >
                        <option>Electrician</option>
                        <option>Plumber</option>
                        <option>Carpenter</option>
                        <option>Technician</option>
                        <option>Painter</option>
                      </select>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold text-white">Your Address</label>
                      <div className="d-flex gap-2">
                        <input
                          className="form-control"
                          placeholder="e.g. COMSATS University Abbottabad Campus, Abbottabad, Pakistan"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                        <button
                          className="btn btn-outline-light emg-locbtn"
                          type="button"
                          onClick={useMyLocation}
                        >
                          Use GPS
                        </button>
                      </div>
                      <div className="emg-help">
                        Tip: Type full address (City + Street) OR use GPS. The map below will update automatically.
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <a
                      className="btn btn-outline-light btn-sm"
                      href={mapsSearchLink(address || "Pakistan")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Google Maps
                    </a>
                    <span className="badge bg-light text-dark emg-badge">
                   
                    </span>
                    <span className="badge bg-light text-dark emg-badge">
                    </span>
                  </div>

                  <button
                    className="btn btn-light btn-lg mt-4 emg-mainbtn"
                    onClick={sendEmergency}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Get Immediate Help Now"}
                  </button>
                </div>
              </div>

              {/* Right column: steps + safety */}
              <div className="col-12 col-lg-5">
                <div className="emg-card glass p-4 h-100">
                  <h5 className="fw-bold mb-3">How it works</h5>

                  <div className="emg-step">
                    <div className="emg-step-num">1</div>
                    <div>
                      <div className="fw-bold">Select service</div>
                      <div className="text-white-50">Electrician, plumber, painter, etc.</div>
                    </div>
                  </div>

                  <div className="emg-step">
                    <div className="emg-step-num">2</div>
                    <div>
                      <div className="fw-bold">Enter address / GPS</div>
                      <div className="text-white-50">Use GPS or type your location.</div>
                    </div>
                  </div>

                  <div className="emg-step">
                    <div className="emg-step-num">3</div>
                    <div>
                      <div className="fw-bold">Get assigned worker</div>
                      <div className="text-white-50">Nearest approved provider is selected.</div>
                    </div>
                  </div>

                  <hr className="emg-hr" />

                  <h6 className="fw-bold mb-2">Safety tips</h6>
                  <ul className="emg-ul">
                    <li>Verify worker name on confirmation card.</li>
                    <li>Prefer WhatsApp/Call from inside the app.</li>
                    <li>Share your location only when needed.</li>
                  </ul>

                  <div className="emg-miniStats">
                    <div className="emg-miniStat">
                      <div className="emg-miniLabel">Verified Providers</div>
                      <div className="emg-miniValue">100%</div>
                    </div>
                    <div className="emg-miniStat">
                      <div className="emg-miniLabel">Support</div>
                      <div className="emg-miniValue">24/7</div>
                    </div>
                    <div className="emg-miniStat">
                      <div className="emg-miniLabel">Tracking</div>
                      <div className="emg-miniValue">Maps</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="light-overlay"></div>
          </div>
        </div>

        {/* Suggested Provider */}
        <div className="mt-4">
          <h4 className="mb-2">Available Provider</h4>

          {loadingSuggested ? (
            <div className="alert alert-info">Checking availability...</div>
          ) : !suggested ? (
            <div className="alert alert-warning mb-0">
              No approved provider found for this service right now.
            </div>
          ) : (
            <div className="card emg-providerCard shadow-sm">
              <div className="card-body d-flex flex-column flex-md-row gap-3 align-items-center">
                <img
                  src={suggested.avatarUrl || "https://via.placeholder.com/90"}
                  alt="avatar"
                  className="emg-avatar"
                />

                <div className="flex-grow-1">
                  <div className="fw-bold fs-5">{suggested.name}</div>
                  <div className="text-muted">
                    {suggested.skill} • {suggested.city || "City"}
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <span className="badge bg-primary">Price: {suggested.price || 0} PKR</span>
                    <span className="badge bg-success">
                      Rating: {suggested.avgRating || 0} ⭐ ({suggested.totalReviews || 0})
                    </span>
                    <span className="badge bg-secondary">Phone: {suggested.phone || "-"}</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <a
                    className={`btn btn-outline-dark ${suggested.phone ? "" : "disabled"}`}
                    href={suggested.phone ? `tel:${phoneToDigits(suggested.phone)}` : "#"}
                  >
                    Call Now
                  </a>

                  <a
                    className={`btn btn-success ${suggested.phone ? "" : "disabled"}`}
                    href={
                      suggested.phone
                        ? `https://wa.me/${phoneToDigits(suggested.phone).replace("+", "")}`
                        : "#"
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation */}
        {booking && (
          <div className="mt-4">
            <h4 className="mb-2">Emergency Confirmed</h4>

            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-danger">Status: {booking.status}</span>
                  <span className="badge bg-dark">Booking ID: {booking._id}</span>
                  <span className="badge bg-primary">Service: {booking.service}</span>
                </div>

                {worker ? (
                  <div className="row g-3 align-items-center">
                    <div className="col-md-8">
                      <div className="fw-bold fs-5">Assigned Worker: {worker.name}</div>
                      <div className="text-muted">
                        {worker.skill} • {worker.city || "City"}
                      </div>
                      <div className="mt-2">
                        <span className="me-3"><b>Price:</b> {worker.price || 0} PKR</span>
                        <span><b>Rating:</b> {worker.avgRating || 0} ⭐ ({worker.totalReviews || 0})</span>
                      </div>
                      <div className="mt-2"><b>Phone:</b> {worker.phone || "-"}</div>
                      <div className="mt-2 text-muted small">
                        Address: {booking.address}
                      </div>
                    </div>

                    <div className="col-md-4 d-flex flex-column gap-2">
                      <a
                        className={`btn btn-outline-dark ${worker.phone ? "" : "disabled"}`}
                        href={worker.phone ? `tel:${phoneToDigits(worker.phone)}` : "#"}
                      >
                        Call Worker
                      </a>

                      <a
                        className={`btn btn-success ${worker.phone ? "" : "disabled"}`}
                        href={
                          worker.phone
                            ? `https://wa.me/${phoneToDigits(worker.phone).replace("+", "")}`
                            : "#"
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp Worker
                      </a>

                      <a
                        className="btn btn-primary"
                        href={mapsSearchLink(booking.address)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Track on Map
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted">Assigned worker info not available.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Map updates based on what user typed/GPS/booking */}
        <MapSection query={mapQuery} />
      </div>
    </>
  );
}
