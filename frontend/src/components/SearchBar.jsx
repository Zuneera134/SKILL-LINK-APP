import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/search.css";
import { GeoAlt, PeopleFill, CalendarEvent, Search } from "react-bootstrap-icons";

export default function SearchBar() {
  const nav = useNavigate();

  const [where, setWhere] = useState("");
  const [who, setWho] = useState("");
  const [when, setWhen] = useState("");

  const handleSearch = () => {
    if (!where.trim() || !who.trim()) {
      alert("Please fill City and Skill!");
      return;
    }

    const params = new URLSearchParams();
    params.set("city", where.trim());
    params.set("skill", who.trim());
    if (when) params.set("date", when);

    nav(`/providers?${params.toString()}`);
  };

  return (
    <div className="airbnb-search shadow-lg">
      <div className="search-item">
        <label>Where</label>
        <div className="input-icon">
          <GeoAlt size={20} className="icon" />
          <input
            type="text"
            placeholder="Enter city (e.g. Mansehra)"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
          />
        </div>
      </div>

      <div className="divider"></div>

      <div className="search-item">
        <label>Who</label>
        <div className="input-icon">
          <PeopleFill size={20} className="icon" />
          <input
            type="text"
            placeholder="Electrician, Plumber..."
            value={who}
            onChange={(e) => setWho(e.target.value)}
          />
        </div>
      </div>

      <div className="divider"></div>

      <div className="search-item">
        <label>When</label>
        <div className="input-icon">
          <CalendarEvent size={20} className="icon" />
          <input type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
      </div>

      <button className="search-btn" onClick={handleSearch}>
        <Search size={20} />
      </button>
    </div>
  );
}
