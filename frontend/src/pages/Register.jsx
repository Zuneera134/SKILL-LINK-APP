import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import logo from "../assets/skilllinkLogo.png"; // ✅ keep your logo (this one exists)

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cnic: "",
    role: "client",

    // Provider-only fields
    skill: "",
    city: "",
    price: "",
    phone: "",
    age: "",
    experience: "",
  });

  const [useCustomSkill, setUseCustomSkill] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isProvider = form.role === "serviceProvider";

  const resetProviderExtras = () => {
    setUseCustomSkill(false);
    setCustomSkill("");
    setAvatarFile(null);
    setAvatarPreview("");

    onChange("skill", "");
    onChange("city", "");
    onChange("price", "");
    onChange("phone", "");
    onChange("age", "");
    onChange("experience", "");
  };

  const handleAvatarPick = (file) => {
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview("");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();

    // ✅ multipart for image upload
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("password", form.password);
    fd.append("cnic", form.cnic || "");
    fd.append("role", form.role);

    if (isProvider) {
      const finalSkill = useCustomSkill ? customSkill.trim() : form.skill;

      fd.append("skill", finalSkill || "");
      fd.append("city", form.city || "");
      fd.append("price", form.price || "");
      fd.append("phone", form.phone || "");
      fd.append("age", form.age || "");
      fd.append("experience", form.experience || "");

      if (avatarFile) fd.append("avatar", avatarFile); // ✅ backend expects "avatar"
    }

    try {
      await api.post("/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        form.role === "serviceProvider"
          ? "Registered. Wait for admin approval before login."
          : "Registered. You can login now."
      );
      nav("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card register-card shadow">
            <div className="card-body">
              {/* ✅ LOGO (NOW CIRCULAR LIKE LOGIN PAGE) */}
              <div className="text-center mb-3">
                <div className="auth-logo-ring">
                  <img className="auth-logo-img" src={logo} alt="Skill Link" />
                </div>
              </div>

              <h3 className="mb-3 text-center">Register</h3>

              <form onSubmit={submit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <input
                      className="form-control"
                      placeholder="Name"
                      value={form.name}
                      onChange={(e) => onChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <input
                      className="form-control"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => onChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <input
                      className="form-control"
                      placeholder="Password"
                      type="password"
                      value={form.password}
                      onChange={(e) => onChange("password", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <input
                      className="form-control"
                      placeholder="CNIC"
                      value={form.cnic}
                      onChange={(e) => onChange("cnic", e.target.value)}
                    />
                  </div>
                </div>

                {/* ✅ ONLY CHANGE: removed Admin option */}
                <div className="mb-3">
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) => {
                      onChange("role", e.target.value);
                      if (e.target.value !== "serviceProvider") resetProviderExtras();
                    }}
                  >
                    <option value="client">Client</option>
                    <option value="serviceProvider">Service Provider</option>
                  </select>
                </div>

                {/* ✅ Provider-only */}
                {isProvider && (
                  <>
                    {/* Image upload */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Profile Image (Upload)</label>
                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        <div
                          style={{
                            width: 84,
                            height: 84,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid rgba(37,99,235,0.35)",
                            background: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="preview"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            "No Image"
                          )}
                        </div>

                        <div className="flex-grow-1">
                          <input
                            className="form-control"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAvatarPick(e.target.files?.[0])}
                          />
                          <small className="text-muted">Upload from desktop (jpg/png/webp).</small>
                        </div>

                        {avatarPreview && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleAvatarPick(null)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ✅ Age + Experience */}
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Age</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="e.g. 26"
                          value={form.age}
                          onChange={(e) => onChange("age", e.target.value)}
                          min="14"
                          max="80"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Experience</label>
                        <input
                          className="form-control"
                          placeholder="e.g. 3 years"
                          value={form.experience}
                          onChange={(e) => onChange("experience", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Skill + City */}
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Skill</label>

                        {!useCustomSkill ? (
                                                  <select
                          className="form-select"
                          value={form.skill}
                          onChange={(e) => onChange("skill", e.target.value)}
                          required
                        >
                          <option value="">Select Skill</option>
                          <option value="Electrician">Electrician</option>
                          <option value="Plumber">Plumber</option>
                          <option value="Carpenter">Carpenter</option>
                          <option value="Painter">Painter</option>
                          <option value="Technician">Technician</option>
                          <option value="Cleaner">Cleaner</option>
                          <option value="Gardener">Gardener</option>
                          <option value="Mason">Mason</option>       {/* ✅ added */}
                          <option value="Laborer">Laborer</option>   {/* ✅ added */}
                        </select>

                        ) : (
                          <input
                            className="form-control"
                            placeholder="Type your skill (e.g. AC Repair...)"
                            value={customSkill}
                            onChange={(e) => setCustomSkill(e.target.value)}
                            required
                          />
                        )}

                        <div className="form-check mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="customSkill"
                            checked={useCustomSkill}
                            onChange={(e) => {
                              setUseCustomSkill(e.target.checked);
                              onChange("skill", "");
                              setCustomSkill("");
                            }}
                          />
                          <label className="form-check-label" htmlFor="customSkill">
                            My skill is not listed (type manually)
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">City</label>
                        <input
                          className="form-control"
                          placeholder="City"
                          value={form.city}
                          onChange={(e) => onChange("city", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Price + Phone */}
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Price (PKR / day)</label>
                        <input
                          className="form-control"
                          placeholder="e.g. 1500"
                          value={form.price}
                          onChange={(e) => onChange("price", e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Phone</label>
                        <input
                          className="form-control"
                          placeholder="e.g. +92 300 1234567"
                          value={form.phone}
                          onChange={(e) => onChange("phone", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <button className="btn btn-primary w-100">Create Account</button>
              </form>

              {isProvider && (
                <p className="text-muted mt-3 mb-0">
                  Note: Service Providers require admin approval before login.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ keep your hover glow */}
      <style>{`
        .register-card {
          border: 2px solid #3b82f6;
          transition: all 0.3s ease;
        }
        .register-card:hover {
          border-color: #1e3a8a;
          box-shadow:
            0 0 0 4px rgba(37, 99, 235, 0.18),
            0 16px 34px rgba(0, 0, 0, 0.12);
        }

        /* ✅ SAME LOOK AS LOGIN LOGO (CIRCULAR) */
        .auth-logo-ring{
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 3px solid rgba(59,130,246,0.35);
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(59,130,246,0.15);
          overflow: hidden;
        }
        .auth-logo-img{
          width: 72%;
          height: 72%;
          object-fit: contain;
          display: block;
        }
      `}</style>
    </div>
  );
}
