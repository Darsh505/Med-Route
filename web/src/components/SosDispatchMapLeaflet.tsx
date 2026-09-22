"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface SosDispatchMapLeafletProps {
  userCoords: { lat: number; lng: number };
  hospitalCoords: { lat: number; lng: number };
  hospitalName: string;
  hospitalAddress: string;
  distanceKm: number;
  estimatedMinutes: number;
  bedsIcuAvailable: number;
}

export default function SosDispatchMapLeaflet({
  userCoords,
  hospitalCoords,
  hospitalName,
  hospitalAddress,
  distanceKm,
  estimatedMinutes,
  bedsIcuAvailable,
}: SosDispatchMapLeafletProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    // High-contrast clean tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // 1. User SOS Location Marker (Red Pulsing Beacon)
    const userSosIcon = L.divIcon({
      className: "sos-patient-marker",
      html: `
        <div style="
          position: relative;
          width: 30px;
          height: 30px;
          background: #ba1a1a;
          border: 4px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 16px rgba(186, 26, 26, 0.6);
        " class="pulse-sos-beacon">
          <div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="6" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });

    const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userSosIcon }).addTo(map);
    userMarker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; padding: 8px; font-weight: 700; color: #ba1a1a; font-size: 13px;">
        🚨 Emergency Beacon (Patient Location)
      </div>
    `);

    // 2. Hospital Trauma Center Marker
    const hospitalIcon = L.divIcon({
      className: "sos-hospital-marker",
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
          box-shadow: 0 8px 20px rgba(0, 51, 79, 0.45);
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v12M6 12h12" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });

    const hospitalMarker = L.marker([hospitalCoords.lat, hospitalCoords.lng], { icon: hospitalIcon }).addTo(map);
    hospitalMarker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; padding: 10px; min-width: 200px;">
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; color: #00334f;">
          ${hospitalName}
        </div>
        <div style="font-size: 11px; color: #41474e; margin-top: 2px;">${hospitalAddress}</div>
        <div style="margin-top: 6px; font-size: 11px; font-weight: 700; color: #166534; background: #dcfce7; display: inline-block; padding: 2px 6px; border-radius: 4px;">
          ${bedsIcuAvailable} ICU Beds Active
        </div>
      </div>
    `);

    // 3. Simulated Dispatch Route Polyline
    // Generate gentle intermediate curve points to look like realistic road routing
    const midLat = (userCoords.lat + hospitalCoords.lat) / 2 + 0.005;
    const midLng = (userCoords.lng + hospitalCoords.lng) / 2 - 0.004;

    const routePoints: [number, number][] = [
      [userCoords.lat, userCoords.lng],
      [midLat, midLng],
      [hospitalCoords.lat, hospitalCoords.lng],
    ];

    // Background glow route line
    L.polyline(routePoints, {
      color: "#ba1a1a",
      weight: 8,
      opacity: 0.25,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    // Primary route dashed line
    L.polyline(routePoints, {
      color: "#ba1a1a",
      weight: 4,
      opacity: 0.9,
      dashArray: "8, 8",
      lineCap: "round",
    }).addTo(map);

    // Fit Bounds so both markers and the route are visible with margins
    const bounds = L.latLngBounds([
      [userCoords.lat, userCoords.lng],
      [hospitalCoords.lat, hospitalCoords.lng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userCoords, hospitalCoords, hospitalName, hospitalAddress, bedsIcuAvailable]);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden border border-error/30">
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Floating Tactical Corridor Pill */}
      <div className="absolute top-3 left-3 z-[1000] bg-surface-container-lowest/95 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-md border border-error/30 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
        <span className="font-label-sm text-xs font-bold text-error uppercase tracking-wider">
          Active Emergency Route
        </span>
        <span className="text-outline text-xs">·</span>
        <span className="font-label-sm text-xs text-on-surface font-semibold">
          {distanceKm} km ({estimatedMinutes} min)
        </span>
      </div>
    </div>
  );
}
