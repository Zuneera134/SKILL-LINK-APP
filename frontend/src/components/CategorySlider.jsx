import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/slider.css";

import electricianImg from "../assets/electrician.jfif";
import plumberImg from "../assets/plumber.webp";
import carpenterImg from "../assets/carpenter.jfif";
import painterImg from "../assets/painter.jfif";
import techniciansImg from "../assets/technicians.jfif";

const categories = [
  { title: "Electricians", key: "electrician", img: electricianImg },
  { title: "Plumbers", key: "plumber", img: plumberImg },
  { title: "Carpenters", key: "carpenter", img: carpenterImg },
  { title: "Painters", key: "painter", img: painterImg },
  { title: "Technicians", key: "technician", img: techniciansImg },
];

export default function CategorySlider() {
  const navigate = useNavigate();
  const infiniteCategories = [...categories, ...categories];

  const go = (key) => {
    navigate(`/services?category=${encodeURIComponent(key)}`);
  };

  return (
    <div className="slider-container">
      <div className="slider">
        {infiniteCategories.map((cat, index) => (
          <div
            key={index}
            className="slider-card"
            role="button"
            tabIndex={0}
            onClick={() => go(cat.key)}
            onKeyDown={(e) => e.key === "Enter" && go(cat.key)}
            style={{ cursor: "pointer" }}
          >
            <img src={cat.img} alt={cat.title} />
            <h3>{cat.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
