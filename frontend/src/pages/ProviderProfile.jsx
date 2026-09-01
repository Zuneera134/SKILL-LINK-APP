import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function ProviderProfile() {
  const { id } = useParams();
  const nav = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  // booking fields
  const [address, setAddress] = useState("");
  const [schedule, setSchedule] = useState(""); // datetime-local
  const [notes, setNotes] = useState("");

  // ✅ NEW: days
  const [days, setDays] = useState(1);

  const minDateTimeLocal = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const mi = pad(now.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }, []);

  const loadProvider = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${id}`); // ✅ now backend supports this
      setProvider(res.data);
    } catch (e) {
      alert("Failed to load provider");
      setProvider(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProvider();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openBooking = () => {
    // if not logged in → go login
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");

    setShowModal(true);
  };

  const closeBooking = () => {
    setShowModal(false);
  };

  const confirmBooking = async () => {
    try {
      if (!address.trim()) return alert("Address is required");

      const d = Number(days);
      if (!Number.isFinite(d) || d < 1) return alert("Days must be 1 or more");

      await api.post("/bookings", {
        providerId: provider?._id,
        address: address.trim(),
        schedule: schedule ? new Date(schedule).toISOString() : null,
        notes: notes || "",
        paymentMethod: "Cash", // ✅ ONLY CASH
        days: d, // ✅ SEND DAYS
      });

      alert("Booking created!");
      setAddress("");
      setSchedule("");
      setNotes("");
      setDays(1);
      setShowModal(false);
    } catch (e) {
      alert(e?.response?.data?.message || "Booking failed");
    }
  };

  if (loading) return <div className="container py-5">Loading...</div>;
  if (!provider) return <div className="container py-5">Provider not found.</div>;

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-3" onClick={() => nav(-1)}>
        ← Back
      </button>

      {/* Your existing provider UI card area */}
      <div className="card shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={provider.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt={provider.name}
              onError={(e) => (e.currentTarget.src = "https://randomuser.me/api/portraits/men/32.jpg")}
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <h3 className="mb-1">{provider.name}</h3>
              <div className="text-muted">
                {provider.skill} • {provider.city}
              </div>
              <div className="mt-2">
                <span className="badge bg-primary">
                  Price: {provider.price ? `${provider.price} PKR/day` : "—"}
                </span>
              </div>
              <div className="text-muted mt-2">{provider.bio || "No bio added yet."}</div>
            </div>
          </div>

          <button className="btn btn-success btn-lg" onClick={openBooking}>
            Book Now
          </button>
        </div>
      </div>

      {/* Your reviews section can stay as it is */}

      {/* ✅ Booking Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content" style={{ borderRadius: 14 }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  Book {provider.name} ({provider.skill})
                </h5>
                <button type="button" className="btn-close" onClick={closeBooking} />
              </div>

              <div className="modal-body">
                <label className="form-label fw-bold">Address</label>
                <input
                  className="form-control mb-3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street, Area"
                />

                <label className="form-label fw-bold">Schedule (optional)</label>
                <input
                  className="form-control mb-1"
                  type="datetime-local"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  min={minDateTimeLocal} // ✅ prevents past date/time
                />
                <small className="text-muted d-block mb-3">Past dates are disabled.</small>

                {/* ✅ Days */}
                <label className="form-label fw-bold">Days</label>
                <input
                  className="form-control mb-3"
                  type="number"
                  min="1"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />

                {/* ✅ Payment Method (cash only) */}
                <label className="form-label fw-bold">Payment Method</label>
                <input className="form-control mb-3" value="Cash" readOnly />

                <label className="form-label fw-bold">Notes (optional)</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeBooking}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={confirmBooking}>
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
