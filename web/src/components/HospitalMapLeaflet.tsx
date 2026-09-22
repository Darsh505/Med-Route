"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface HospitalMapLeafletProps {
  latitude: number;
  longitude: number;
  hospitalName: string;
  address: string;
  phone?: string;
  bedsIcuAvailable?: number;
  isPmjay?: boolean;
}

export default function HospitalMapLeaflet({
  latitude,
  longitude,
  hospitalName,
  address,
  phone,
  bedsIcuAvailable,
  isPmjay,
}: HospitalMapLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // High-clarity CartoDB Positron / OSM tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Custom Hospital Pin with Cross SVG
    const hospitalIcon = L.divIcon({
      className: "custom-hospital-marker",
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #00334f;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 8px 16px -2px rgba(0, 51, 79, 0.35);
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v12M6 12h12" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });

    // Create Marker and Bind Popup
    const marker = L.marker([latitude, longitude], { icon: hospitalIcon }).addTo(map);

    const popupHtml = `
      <div style="font-family: 'Inter', sans-serif; padding: 14px; min-width: 240px;">
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 15px; color: #00334f; margin-bottom: 4px;">
          ${hospitalName}
        </div>
        <div style="font-size: 12px; color: #41474e; margin-bottom: 8px;">
          📍 ${address}
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
          ${
            bedsIcuAvailable !== undefined
              ? `<span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: ${
                  bedsIcuAvailable > 5 ? "#dcfce7" : "#fef3c7"
                }; color: ${bedsIcuAvailable > 5 ? "#166534" : "#92400e"};">
                  ${bedsIcuAvailable} ICU Beds Free
                </span>`
              : ""
          }
          ${
            isPmjay
              ? `<span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: #eaedff; color: #00334f;">
                  PMJAY Cashless
                </span>`
              : ""
          }
        </div>
        <a 
          href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" 
          target="_blank" 
          rel="noopener noreferrer"
          style="
            display: block;
            text-align: center;
            background: #006a61;
            color: #ffffff;
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 6px;
            text-decoration: none;
          "
        >
          Navigate on Google Maps ↗
        </a>
      </div>
    `;

    marker.bindPopup(popupHtml).openPopup();

    // Map resize trigger after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, hospitalName, address, bedsIcuAvailable, isPmjay]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[340px] z-0"
      style={{ position: "relative" }}
    />
  );
}
