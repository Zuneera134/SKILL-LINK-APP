import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminPanel() {
  const [pendingProviders, setPendingProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Always attach admin token (does NOT affect other pages)
  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });

  const loadAll = async () => {
    try {
      setLoading(true);

      // ✅ If token missing or role not admin => show same message you see
      const role = localStorage.getItem("role");
      const token = localStorage.getItem("token");
      if (!token || role !== "admin") {
        alert("Failed to load users (login as admin)");
        setPendingProviders([]);
        setUsers([]);
        return;
      }

      const [pendingRes, usersRes] = await Promise.all([
        api.get("/users/pending-providers", authConfig()),
        api.get("/users/all", authConfig()),
      ]);

      setPendingProviders(pendingRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e) {
      console.error("ADMIN LOAD ERROR:", e?.response?.data || e.message);
      alert(e?.response?.data?.message || "Failed to load users (login as admin)");
      setPendingProviders([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const approveProvider = async (id) => {
    try {
      await api.patch(`/users/approve/${id}`, {}, authConfig());
      alert("Approved ✅");
      loadAll();
    } catch (e) {
      console.error("APPROVE ERROR:", e?.response?.data || e.message);
      alert(e?.response?.data?.message || "Approve failed");
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="mb-0">Admin Panel</h2>
          <div className="text-muted">Approve service providers and view users</div>
        </div>

        <button className="btn btn-outline-primary" onClick={loadAll} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ✅ Pending providers */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="mb-3">Pending Service Providers</h4>

          {pendingProviders.length === 0 ? (
            <div className="alert alert-success mb-0">No pending providers ✅</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Skill</th>
                    <th>City</th>
                    <th>Price</th>
                    <th>Experience</th>
                    <th>Age</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProviders.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.skill || "-"}</td>
                      <td>{p.city || "-"}</td>
                      <td>{p.price ? `${p.price} PKR/day` : "-"}</td>
                      <td>{p.experience || "-"}</td>
                      <td>{p.age ?? "-"}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => approveProvider(p._id)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ✅ All users */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">All Users</h4>

          {users.length === 0 ? (
            <div className="alert alert-warning mb-0">No users found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Approved</th>
                    <th>Skill</th>
                    <th>City</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.role === "serviceProvider" ? (u.approved ? "Yes" : "No") : "-"}</td>
                      <td>{u.skill || "-"}</td>
                      <td>{u.city || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
