import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import logo from "../assets/skilllinkLogo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "admin") nav("/admin");
      else if (res.data.user.role === "serviceProvider") nav("/worker");
      else nav("/client");
    } catch (e) {
      alert(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-center">
        <div className="card auth-card shadow p-4 pt-5">
          {/* Logo */}
          <div className="text-center mb-3 logo-wrapper">
            <div className="logo-ring mx-auto mb-2">
              <div className="logo-cutout">
                <img src={logo} alt="Skill Link" className="logo-img" />
              </div>
            </div>

            <h3 className="auth-title mb-1">Welcome back</h3>
            <p className="text-muted mb-0">Login to continue to Skill Link</p>
          </div>

          <form onSubmit={submit} className="mt-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              className="form-control mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="form-label fw-semibold">Password</label>
            <input
              className="form-control mb-3"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="btn btn-primary w-100 auth-btn">Login</button>
          </form>

          <p className="text-center mt-3 mb-0">
            No account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-card{
          width:420px;
          border-radius:16px;
          border:1.5px solid rgba(37,99,235,.25);
          background:#fff;
          position:relative;
        }

        /* Pull logo upward (half outside card) */
        .logo-wrapper{
          margin-top:-88px;   /* ✅ THIS is the key */
        }

        /* Outer ring */
        .logo-ring{
          width:96px;
          height:96px;
          border-radius:50%;
          border:3px solid rgba(37,99,235,.35);
          display:flex;
          align-items:center;
          justify-content:center;
          background:#fff;
        }

        /* White circular cutout */
        .logo-cutout{
          width:84px;
          height:84px;
          border-radius:50%;
          background:#ffffff;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
        }

        .logo-img{
          width:78px;
          height:78px;
          object-fit:contain;
          display:block;
        }

        .auth-title{
          color:#1e3a8a;
          font-weight:900;
        }

        .auth-btn{
          border-radius:12px;
          font-weight:700;
        }
      `}</style>
    </div>
  );
}
