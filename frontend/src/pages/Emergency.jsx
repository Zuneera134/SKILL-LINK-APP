import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Emergency.css";
import MapSection from "../components/MapSection";

const SERVICES = ["Electrician", "Plumber", "Carpenter", "Technician", "Painter"];

const LAT_LNG_RE = /^[-+]?\d{1,2}\.\d+\s*,\s*[-+]?\d{1,3}\.\d+$/;

export default function Emergency() {
  const nav = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [service, setService] = useState("Electrician");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [suggested, setSuggested] = useState(null);
  const [loadingSuggested, setLoadingSuggested] = useState(false);

  const [booking, setBooking] = useState(null);

  const [coords, setCoords] = useState(null);
  const [locLabel, setLocLabel] = useState("");
  const [locating, setLocating] = useState(false);
  const [mapQuery, setMapQuery] = useState("Pakistan");

  const [toast, setToast] = useState({ show: false, type: "success", msg: "" });
  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const phoneToDigits = (p) => String(p || "").replace(/[^\d+]/g, "");
  const coordsStr = coords ? `${coords.lat},${coords.lng}` : "";
  const mapsSearchLink = (q) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || "Pakistan")}`;
  const directionsLink = (q) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q || "Pakistan")}`;

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

  const reverseGeocode = async (lat, lng) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await r.json();
      return data?.display_name || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const v = String(address || "").trim();
    const t = setTimeout(() => {
      if (LAT_LNG_RE.test(v)) {
        setMapQuery(v);
      } else if (!v) {
        setMapQuery("Pakistan");
      } else {
        setMapQuery(v);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [address]);

  useEffect(() => {
    if (coords) setMapQuery(coordsStr);
    // eslint-disable-next-line
  }, [coords, coordsStr]);

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
    setLocating(true);
    showToast("info", "Fetching your location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setCoords({ lat, lng });
        const label = await reverseGeocode(lat, lng);
        setLocLabel(label);
        setAddress(label || `${lat},${lng}`);
        setMapQuery(`${lat},${lng}`);
        setLocating(false);
        showToast("success", "Location locked");
      },
      (err) => {
        setLocating(false);
        showToast("danger", explainGeoError(err));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const copyCoords = async () => {
    if (!coordsStr) return showToast("danger", "No GPS location to copy");
    try {
      await navigator.clipboard.writeText(coordsStr);
      showToast("success", "Coordinates copied");
    } catch {
      showToast("danger", "Could not copy");
    }
  };

  const onAddressChange = (e) => {
    const v = e.target.value;
    setAddress(v);
    const m = String(v).trim().match(/^([-+]?\d{1,2}\.\d+)\s*,\s*([-+]?\d{1,3}\.\d+)$/);
    if (m) setCoords({ lat: m[1], lng: m[2] });
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
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        locationLabel: locLabel || (coords ? coordsStr : ""),
      });

      setBooking(data);
      showToast("success", `Emergency booking created (${data._id})`);
      setMapQuery(data.address);
    } catch (err) {
      showToast("danger", err.response?.data?.message || "Emergency request failed");
    } finally {
      setLoading(false);
    }
  };

  const worker = booking?.workerId;
  const bookingLocation = booking?.location || {};
  const bookingCoords =
    bookingLocation.lat != null && bookingLocation.lng != null
      ? `${bookingLocation.lat},${bookingLocation.lng}`
      : "";

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

      <div style={{ background: "#f6f8fc", minHeight: "calc(100vh - 90px)" }}>
        <div className="container py-4">
        <div className="text-center mb-4 mt-2">
          <span className="emg-eyebrow">URGENT HELP</span>
          <h1 className="emg-title">Emergency Help</h1>
          <p className="emg-subtitle mx-auto">
            Instant connection with the nearest approved worker using GPS.
          </p>
        </div>

        {!token && (
          <div className="alert alert-warning emg-login-alert shadow-sm mx-auto">
            You must be logged in as a <b>Client</b> to send an emergency request.
            <button className="btn btn-dark btn-sm ms-2" onClick={() => nav("/login")}>
              Login
            </button>
          </div>
        )}

        <div className="row g-4">
          {/* Form */}
          <div className="col-12 col-lg-7">
            <div className="card emg-panel shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="emg-siren">⚡</span>
                  <h4 className="mb-0 fw-bold">Request Emergency</h4>
                </div>
                <p className="text-muted mb-3">
                  Choose a service, lock your location with GPS (or type it), and we'll assign the
                  nearest approved worker.
                </p>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Service</label>
                    <select
                      className="form-select"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                    >
                      {SERVICES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-8">
                    <label className="form-label fw-semibold">Your Location</label>
                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        placeholder="Type address OR tap GPS"
                        value={address}
                        onChange={onAddressChange}
                      />
                      <button
                        className="btn btn-outline-danger emg-locbtn text-nowrap"
                        type="button"
                        onClick={useMyLocation}
                        disabled={locating}
                      >
                        {locating ? "Locating..." : "📍 Use GPS"}
                      </button>
                    </div>
                    <div className="form-text">
                      Tip: Tap <b>Use GPS</b> to auto-detect your exact position. The map below will
                      pinpoint it live.
                    </div>
                  </div>
                </div>

                {coords && (
                  <div className="emg-coords p-3 mt-3">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <span className="badge bg-success">GPS Locked</span>
                      <code className="emg-code">
                        {coords.lat}, {coords.lng}
                      </code>
                      <button className="btn btn-sm btn-outline-secondary" onClick={copyCoords}>
                        Copy
                      </button>
                      {locLabel && (
                        <span className="text-muted small ms-1">
                          <b>Place:</b> {locLabel}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <a
                    className="btn btn-outline-secondary btn-sm"
                    href={mapsSearchLink(coordsStr || address || "Pakistan")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Google Maps
                  </a>
                  {coordsStr && (
                    <a
                      className="btn btn-outline-secondary btn-sm"
                      href={directionsLink(coordsStr)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Directions to me
                    </a>
                  )}
                </div>

                <button
                  className="btn btn-danger btn-lg w-100 mt-4 emg-mainbtn"
                  onClick={sendEmergency}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Get Immediate Help Now"}
                </button>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="col-12 col-lg-5">
            <div className="card emg-panel shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">How it works</h5>

                <div className="emg-step">
                  <div className="emg-step-num">1</div>
                  <div>
                    <div className="fw-bold">Select service</div>
                    <div className="text-muted">Electrician, plumber, painter, etc.</div>
                  </div>
                </div>

                <div className="emg-step">
                  <div className="emg-step-num">2</div>
                  <div>
                    <div className="fw-bold">Lock location with GPS</div>
                    <div className="text-muted">One tap auto-detects your exact position.</div>
                  </div>
                </div>

                <div className="emg-step">
                  <div className="emg-step-num">3</div>
                  <div>
                    <div className="fw-bold">Get nearest worker</div>
                    <div className="text-muted">We assign the closest approved provider.</div>
                  </div>
                </div>

                <hr className="emg-hr" />

                <h6 className="fw-bold mb-2">Safety tips</h6>
                <ul className="emg-ul">
                  <li>Verify worker name on confirmation card.</li>
                  <li>Prefer WhatsApp/Call from inside the app.</li>
                  <li>Share your live location only when needed.</li>
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
                    <div className="emg-miniLabel">GPS Tracking</div>
                    <div className="emg-miniValue">Live</div>
                  </div>
                </div>
              </div>
            </div>
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
                  src={suggested.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
                  alt="avatar"
                  className="emg-avatar"
                  onError={(e) => (e.currentTarget.src = "https://randomuser.me/api/portraits/men/32.jpg")}
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

            <div className="card shadow-sm border-success">
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-danger">Status: {booking.status}</span>
                  <span className="badge bg-dark">Booking ID: {booking._id}</span>
                  <span className="badge bg-primary">Service: {booking.service}</span>
                  {booking.nearestDistKm != null && (
                    <span className="badge bg-success">
                      Worker distance: ~{booking.nearestDistKm} km
                    </span>
                  )}
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

                      <div className="mt-2 text-muted small">Address: {booking.address}</div>
                      {bookingCoords && (
                        <div className="mt-1 text-muted small">
                          GPS: <code>{bookingCoords}</code>
                          {bookingLocation.label && <> — {bookingLocation.label}</>}
                        </div>
                      )}
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
                        href={mapsSearchLink(bookingCoords || booking.address)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Track on Map
                      </a>
                      <a
                        className="btn btn-outline-secondary"
                        href={directionsLink(bookingCoords || booking.address)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Get Directions
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

        {/* Live map */}
        <div className="mt-4">
          <MapSection query={mapQuery} title="Your Location on Map" />
        </div>
        </div>
      </div>
    </>
  );
}
