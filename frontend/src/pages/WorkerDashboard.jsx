import React, { useEffect, useState } from "react";
import api from "../api";

export default function WorkerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/worker/me");
      setJobs(res.data || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const formatSchedule = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;

    // backend sometimes returns HTML string like "Cannot PATCH /api/...."
    if (typeof data === "string") {
      const m = data.match(/Cannot\s+\w+\s+[^<\n]*/i);
      if (m?.[0]) return m[0];
      return data.slice(0, 200);
    }

    return data?.message || err?.message || "Action failed";
  };

  /**
   * ✅ EXTENDED FALLBACKS (frontend-only)
   * Tries many common endpoint shapes without touching your UI.
   */
  const doAction = async (bookingId, action) => {
    const statusMap = {
      accept: "accepted",
      complete: "completed",
      cancel: "cancelled",
    };
    const status = statusMap[action];

    // Try in order: specific routes -> generic status routes -> direct update on /:id
    const attempts = [
      // common explicit action routes
      { method: "patch", url: `/bookings/${bookingId}/${action}` },
      { method: "put", url: `/bookings/${bookingId}/${action}` },
      { method: "post", url: `/bookings/${bookingId}/${action}` },

      // common "status" sub-route patterns
      { method: "patch", url: `/bookings/${bookingId}/status`, body: { status } },
      { method: "put", url: `/bookings/${bookingId}/status`, body: { status } },

      { method: "patch", url: `/bookings/status/${bookingId}`, body: { status } },
      { method: "put", url: `/bookings/status/${bookingId}`, body: { status } },

      // very common: update booking directly at /bookings/:id
      { method: "patch", url: `/bookings/${bookingId}`, body: { status } },
      { method: "put", url: `/bookings/${bookingId}`, body: { status } },

      // some backends use different key names
      { method: "patch", url: `/bookings/${bookingId}`, body: { bookingStatus: status } },
      { method: "put", url: `/bookings/${bookingId}`, body: { bookingStatus: status } },

      { method: "patch", url: `/bookings/${bookingId}`, body: { state: status } },
      { method: "put", url: `/bookings/${bookingId}`, body: { state: status } },

      // sometimes route is /bookings/update/:id
      { method: "patch", url: `/bookings/update/${bookingId}`, body: { status } },
      { method: "put", url: `/bookings/update/${bookingId}`, body: { status } },
    ];

    let lastErr = null;

    for (const a of attempts) {
      try {
        if (a.method === "patch") await api.patch(a.url, a.body || {});
        else if (a.method === "put") await api.put(a.url, a.body || {});
        else await api.post(a.url, a.body || {});
        await loadJobs();
        return;
      } catch (err) {
        lastErr = err;
      }
    }

    alert(extractErrorMessage(lastErr));
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Worker Dashboard</h2>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={loadJobs}>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button className="btn btn-outline-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {jobs.length === 0 ? (
            <div className="alert alert-info mb-0">No jobs yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>STATUS</th>
                    <th>CLIENT</th>
                    <th>ADDRESS</th>
                    <th>SCHEDULED</th>
                    <th>DAYS</th>
                    <th>NOTES</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((b) => {
                    const st = String(b.status || "").toLowerCase();
                    const isAccepted = st === "accepted";
                    const isCompleted = st === "completed";
                    const isCancelled = st === "cancelled";

                    return (
                      <tr key={b._id}>
                        <td>
                          <span className="badge bg-secondary">{b.status}</span>
                        </td>

                        <td>{b.clientId?.name || "-"}</td>

                        <td style={{ maxWidth: 280 }}>{b.address || "-"}</td>

                        <td>{formatSchedule(b.schedule)}</td>

                        <td>{b.days ? `${b.days}` : "-"}</td>

                        <td style={{ maxWidth: 240 }}>{b.notes || "-"}</td>

                        <td className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => doAction(b._id, "accept")}
                            disabled={isAccepted || isCompleted || isCancelled}
                          >
                            Accept
                          </button>

                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => doAction(b._id, "complete")}
                            disabled={isCompleted || isCancelled}
                          >
                            Complete
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => doAction(b._id, "cancel")}
                            disabled={isCancelled || isCompleted}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="text-muted mt-2">
                Note: Scheduled shows the exact time set by the client (if provided).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
