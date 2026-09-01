import React, { useMemo } from "react";
import "./MapSection.css";

const LAT_LNG_RE = /^[-+]?\d{1,2}\.\d+\s*,\s*[-+]?\d{1,3}\.\d+$/;

export default function MapSection({ query = "Pakistan", height = 350, title = "Location on Map" }) {
  const { src, display } = useMemo(() => {
    const raw = String(query || "").trim();

    // If the query is already lat,lng we can zoom right in on the exact point.
    if (LAT_LNG_RE.test(raw)) {
      return {
        src: `https://maps.google.com/maps?q=${encodeURIComponent(
          raw
        )}&t=&z=16&ie=UTF8&iwloc=B&output=embed`,
        display: `${raw} (GPS point)`,
      };
    }

    // Otherwise treat it as a place/address query.
    const finalQuery = raw || "Pakistan";
    const isPakistan = finalQuery.toLowerCase() === "pakistan";
    return {
      src: `https://maps.google.com/maps?q=${encodeURIComponent(
        finalQuery
      )}&t=&z=${isPakistan ? 6 : 14}&ie=UTF8&iwloc=&output=embed`,
      display: finalQuery,
    };
  }, [query]);

  return (
    <section className="map-breakout my-5">
      <div className="map-inner px-4">
        <h2 className="map-title">{title}</h2>
        <p className="map-subtitle">
          Showing: <b>{display}</b>
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
