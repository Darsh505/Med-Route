"use client";

import { useEffect, useState } from "react";

interface HospitalMapProps {
  latitude: number;
  longitude: number;
  hospitalName: string;
  address: string;
  zoom?: number;
}

export default function HospitalMap({
  latitude,
  longitude,
  hospitalName,
  address,
  zoom = 15,
}: HospitalMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Construct OSM embed iframe URL
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const gmapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div
      style={{
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        border: "1px solid var(--surface-border)",
        boxShadow: "var(--shadow-sm)",
        background: "var(--color-white)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "320px",
          background: "#e5e7eb",
        }}
      >
        {mounted ? (
          <iframe
            title={`Map of ${hospitalName}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={osmEmbedUrl}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-gray-500)",
            }}
          >
            Loading map...
          </div>
        )}
      </div>
      <div
        style={{
          padding: "var(--space-4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          background: "var(--color-white)",
        }}
      >
        <div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-gray-900)" }}>
            📍 {address}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", marginTop: "2px" }}>
            Coordinates: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
          </div>
        </div>
        <a
          href={gmapsDirUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ fontSize: "var(--text-xs)", padding: "8px 16px" }}
        >
          Get Directions ↗
        </a>
      </div>
    </div>
  );
}
