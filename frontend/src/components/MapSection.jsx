import React, { useMemo } from "react";
import "./MapSection.css";

export default function MapSection({ height = 350 }) {
  const src = useMemo(() => {
    const finalQuery = "Pakistan";
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      finalQuery
    )}&t=&z=6&ie=UTF8&iwloc=&output=embed`;
  }, []);

  return (
    <section className="map-breakout my-5">
      <div className="map-inner px-4">
        <h2 className="map-title">Location on Map</h2>
        <p className="map-subtitle">
          Showing: <b>Pakistan</b>
        </p>
      </div>

      <iframe
        title="map"
        className="map-iframe"
        loading="lazy"
        allowFullScreen
        src={src}
        style={{ height }}
      />
    </section>
  );
}
