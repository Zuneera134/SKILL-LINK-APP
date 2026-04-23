import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function ClientDashboard() {
  const [me, setMe] = useState(null);

  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // ✅ review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const [form, setForm] = useState({
    skill: "",
    city: "",
    providerId: "",
    address: "",
    schedule: "",
    notes: "",
    paymentMethod: "Cash",
    days: 1,
  });

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const skillsList = useMemo(
    () => [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Painter",
      "Technician",
      "Cleaner",
      "Gardener",
      "Mason",
      "Laborer",
    ],
    []
  );

  // ✅ min schedule (disable past)
  const minSchedule = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
  }, []);

  const selectedProvider = useMemo(
    () => providers.find((p) => p._id === form.providerId),
    [providers, form.providerId]
  );

  const ratePerDay = Number(selectedProvider?.price || 0);
  const days = Math.max(1, Number(form.days || 1));
  const subtotal = ratePerDay * days;
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
  const totalAmount = subtotal + serviceFee;

  const loadMe = async () => {
    try {
      const res = await api.get("/auth/me");
      setMe(res.data);
    } catch (e) {
      // ignore
    }
  };

 

  const loadProviders = async (skill, city) => {
  if (!skill) {
    setProviders([]);
    return;
  }

  try {
    setLoadingProviders(true);
    setProviders([]);

    // ✅ normalize skill EXACTLY like backend
    const normalizedSkill =
      skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();

    // ✅ build params conditionally (THIS IS THE FIX)
    const params = { skill: normalizedSkill };
    if (city && city.trim()) {
      params.city = city.trim();
    }

    const res = await api.get("/users/providers", { params });

    setProviders(res.data || []);
    setForm((p) => ({ ...p, providerId: "" }));
  } catch (e) {
    console.error("loadProviders error:", e?.response?.data || e.message);
    setProviders([]);
  } finally {
    setLoadingProviders(false);
  }
};

  const loadMyBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await api.get("/bookings/my");
      setBookings(res.data || []);
    } catch (e) {
      console.error("loadMyBookings error:", e?.response?.data || e.message);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadMe();
    loadMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProviders(form.skill, form.city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.skill, form.city]);

  const submitBooking = async (e) => {
    e.preventDefault();

    if (!form.skill) return alert("Please select a skill.");
    if (!form.providerId) return alert("Please select a provider.");
    if (!form.address.trim()) return alert("Please enter your address.");
    if (!form.paymentMethod) return alert("Please select payment method.");
    if (!form.schedule) return alert("Please select schedule date/time.");

    const picked = new Date(form.schedule);
    if (isNaN(picked.getTime())) return alert("Invalid schedule date/time.");
    if (picked.getTime() < Date.now()) {
      return alert("Schedule cannot be in the past. Please select a future date/time.");
    }

    try {
      await api.post("/bookings", {
        providerId: form.providerId,
        skill: form.skill.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        schedule: form.schedule,
        notes: form.notes || "",
        paymentMethod: form.paymentMethod,
        days,
      });

      alert("Booking created successfully ✅");

      setForm((p) => ({
        ...p,
        providerId: "",
        address: "",
        schedule: "",
        notes: "",
        paymentMethod: "Cash",
        days: 1,
      }));

      loadMyBookings();
    } catch (e2) {
      console.error("booking error:", e2?.response?.data || e2.message);

      if (e2?.response?.status === 403) {
        alert("Forbidden: Please login as CLIENT to book services.");
        return;
      }

      alert(e2?.response?.data?.message || "Booking failed");
    }
  };

  // ✅ review helpers
  const openReview = (booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment("");
    setReviewOpen(true);
  };

  const submitReview = async () => {
    if (!reviewBooking?._id) return;
    if (!reviewBooking?.providerId?._id) return alert("Provider missing for this booking.");
    if (!reviewRating) return alert("Please select rating.");

    try {
      await api.post("/reviews", {
        bookingId: reviewBooking._id,
        providerId: reviewBooking.providerId._id,
        rating: reviewRating,
        comment: reviewComment,
      });

      alert("Review submitted ✅");
      setReviewOpen(false);
      setReviewBooking(null);
      loadMyBookings();
    } catch (e) {
      console.error("review error:", e?.response?.data || e.message);
      alert(e?.response?.data?.message || "Review failed");
    }
  };

  const isCompleted = (b) => String(b?.status || "").toLowerCase() === "completed";

  const formatMoney = (n) => {
    const num = Number(n);
    if (!num || isNaN(num)) return "—";
    return `${num.toLocaleString()} PKR`;
  };

  return (
    <div className="container py-4">
      <div className="mb-3">
        <h2 className="mb-0">Client Dashboard</h2>
        <div className="text-muted">{me?.name ? `Welcome: ${me.name}` : "Book services"}</div>
      </div>

      {/* ✅ Add Booking */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="mb-3">Add Booking</h4>

          <form onSubmit={submitBooking}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Skill</label>
                <select
                  className="form-select"
                  value={form.skill}
                  onChange={(e) => onChange("skill", e.target.value)}
                  required
                >
                  <option value="">Select Skill</option>
                  {skillsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">City (optional)</label>
                <input
                  className="form-control"
                  value={form.city}
                  onChange={(e) => onChange("city", e.target.value)}
                  placeholder="e.g. Abbottabad"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Select Provider</label>
                <select
                  className="form-select"
                  value={form.providerId}
                  onChange={(e) => onChange("providerId", e.target.value)}
                  required
                  disabled={!form.skill || loadingProviders}
                >
                  <option value="">
                    {loadingProviders
                      ? "Loading providers..."
                      : !form.skill
                      ? "Select skill first"
                      : providers.length === 0
                      ? "No providers found"
                      : "Choose provider"}
                  </option>

                  {providers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {p.city || "-"} — {p.price ? `${p.price} PKR/day` : "No price"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Payment Method</label>
                <select
                  className="form-select"
                  value={form.paymentMethod}
                  onChange={(e) => onChange("paymentMethod", e.target.value)}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label fw-bold">Address</label>
                <input
                  className="form-control"
                  value={form.address}
                  onChange={(e) => onChange("address", e.target.value)}
                  placeholder="House #, Street, Area"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Schedule / Time</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={form.schedule}
                  min={minSchedule}
                  onChange={(e) => onChange("schedule", e.target.value)}
                  required
                />
                <small className="text-muted">Past dates are disabled.</small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Days</label>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={form.days}
                  onChange={(e) => onChange("days", e.target.value)}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label fw-bold">Notes (optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.notes}
                  onChange={(e) => onChange("notes", e.target.value)}
                />
              </div>

              {/* ✅ Summary */}
              <div className="col-md-12">
                <label className="form-label fw-bold">Bill Summary</label>
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between">
                    <span>Rate / day</span>
                    <b>{ratePerDay ? `${ratePerDay.toLocaleString()} PKR` : "—"}</b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Days</span>
                    <b>{days}</b>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <span>Subtotal</span>
                    <b>{subtotal ? `${subtotal.toLocaleString()} PKR` : "—"}</b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Service Fee (5%)</span>
                    <b>{serviceFee ? `${serviceFee.toLocaleString()} PKR` : "0 PKR"}</b>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <span>Total</span>
                    <b>{totalAmount ? `${totalAmount.toLocaleString()} PKR` : "—"}</b>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <button className="btn btn-primary w-100" type="submit">
                  Confirm Booking
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ My Bookings */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="mb-0">My Bookings</h4>
            <button className="btn btn-outline-primary btn-sm" onClick={loadMyBookings}>
              Refresh
            </button>
          </div>

          {loadingBookings ? (
            <div className="alert alert-info mt-3">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="alert alert-warning mt-3 mb-0">No bookings yet.</div>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Skill</th>
                    <th>Schedule</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b.providerId?.name || "—"}</td>
                      <td>{b.skill || b.providerId?.skill || "—"}</td>
                      <td>{b.schedule ? new Date(b.schedule).toLocaleString() : "—"}</td>
                      <td>{b.paymentMethod || "—"}</td>

                      {/* ✅ FIX: show totalAmount */}
                      <td>{formatMoney(b.totalAmount)}</td>

                      <td>
                        <span className="badge bg-secondary">{b.status || "Pending"}</span>
                      </td>

                      <td className="text-end">
                        {isCompleted(b) && !b.reviewedByClient && (
                          <button className="btn btn-sm btn-success" onClick={() => openReview(b)}>
                            Leave Review
                          </button>
                        )}
                        {isCompleted(b) && b.reviewedByClient && (
                          <span className="text-muted">Reviewed ✅</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Review Modal */}
      {reviewOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.35)", zIndex: 9999 }}
          onClick={() => setReviewOpen(false)}
        >
          <div
            className="bg-white rounded shadow p-4"
            style={{ maxWidth: 520, margin: "8% auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="mb-2">Review {reviewBooking?.providerId?.name || "Provider"}</h5>
            <div className="text-muted mb-3">Rate service + write comment.</div>

            <div className="mb-3">
              <label className="form-label fw-bold">Rating</label>
              <div style={{ fontSize: 26 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    role="button"
                    style={{
                      cursor: "pointer",
                      marginRight: 6,
                      color: n <= reviewRating ? "#f59e0b" : "#cbd5e1",
                    }}
                    onClick={() => setReviewRating(n)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Comment</label>
              <textarea
                className="form-control"
                rows="3"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write your feedback..."
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" onClick={() => setReviewOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={submitReview}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
