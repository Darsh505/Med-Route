"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

export interface MapHospital {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  beds_icu_available: number;
  is_pmjay_empanelled: boolean;
  cost_range?: string;
  pmjay_label?: string;
  phone?: string;
  type?: string;
}

interface SearchMapLeafletProps {
  hospitals: MapHospital[];
  selectedHospitalId?: string | null;
  onSelectHospital?: (hospitalId: string) => void;
  userCoords?: { lat: number; lng: number } | null;
  onLocateMe?: (coords: { lat: number; lng: number }) => void;
}

export default function SearchMapLeaflet({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  userCoords,
  onLocateMe,
}: SearchMapLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.LayerGroup | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center: Tricity Chandigarh/Mohali centroid
    const defaultCenter: [number, number] = userCoords
      ? [userCoords.lat, userCoords.lng]
      : [30.725, 76.765];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false, // Custom positioned zoom control
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // Reposition zoom controls to top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // CartoDB Voyager Tile Layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Hospital Markers when list changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous hospital markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    hospitals.forEach((hosp) => {
      if (!hosp.latitude || !hosp.longitude) return;

      const latLng: [number, number] = [hosp.latitude, hosp.longitude];
      bounds.extend(latLng);

      // Color based on ICU Availability
      const isSelected = selectedHospitalId === hosp.id || selectedHospitalId === hosp.slug;
      const icuAvailable = hosp.beds_icu_available ?? 0;

      let bgColor = "#ba1a1a"; // Red (0 ICU)
      if (icuAvailable >= 8) bgColor = "#006a61"; // Green (Good)
      else if (icuAvailable >= 1) bgColor = "#b45309"; // Amber (Limited)

      const pinSize = isSelected ? 48 : 38;
      const anchor = isSelected ? 24 : 19;

      const hospitalPinIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${pinSize}px;
            height: ${pinSize}px;
            background: ${isSelected ? "#00334f" : bgColor};
            border: ${isSelected ? "3px solid #86f2e4" : "2.5px solid #ffffff"};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 6px 14px rgba(0, 51, 79, 0.35);
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            <div style="
              transform: rotate(45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-weight: 800;
              font-size: ${isSelected ? "14px" : "11px"};
            ">
              ${icuAvailable}
            </div>
          </div>
        `,
        iconSize: [pinSize, pinSize],
        iconAnchor: [anchor, pinSize],
        popupAnchor: [0, -pinSize],
      });

      const marker = L.marker(latLng, { icon: hospitalPinIcon }).addTo(map);

      // Rich Clinical Dispatch Popup
      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; padding: 14px; min-width: 260px;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 15px; color: #00334f; line-height: 1.2;">
              ${hosp.name}
            </div>
          </div>
          
          <div style="font-size: 12px; color: #41474e; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
            <span>📍 ${hosp.address}</span>
            ${hosp.distance_km ? `<span style="color: #006a61; font-weight: 600;">(· ${hosp.distance_km} km)</span>` : ""}
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
            <span style="
              font-size: 11px; 
              font-weight: 700; 
              padding: 2px 8px; 
              border-radius: 9999px; 
              background: ${icuAvailable >= 8 ? "#dcfce7" : icuAvailable >= 1 ? "#fef3c7" : "#ffdad6"}; 
              color: ${icuAvailable >= 8 ? "#166534" : icuAvailable >= 1 ? "#92400e" : "#93000a"};
            ">
              ${icuAvailable} ICU Beds Available
            </span>
            ${
              hosp.is_pmjay_empanelled
                ? `<span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: #eaedff; color: #00334f;">
                    PMJAY Cashless
                  </span>`
                : ""
            }
          </div>

          ${
            hosp.cost_range
              ? `<div style="font-size: 11px; color: #72787f; margin-bottom: 10px;">
                  Est. Tariffs: <strong style="color: #131b2e;">${hosp.cost_range}</strong>
                </div>`
              : ""
          }

          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <a 
              href="/hospitals/${hosp.slug}" 
              style="
                flex: 1;
                text-align: center;
                background: #00334f;
                color: #ffffff;
                font-size: 12px;
                font-weight: 600;
                padding: 7px 10px;
                border-radius: 6px;
                text-decoration: none;
              "
            >
              View Profile
            </a>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${hosp.latitude},${hosp.longitude}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                background: #006a61;
                color: #ffffff;
                font-size: 12px;
                font-weight: 600;
                padding: 7px 12px;
                border-radius: 6px;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              Directions ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        if (onSelectHospital) {
          onSelectHospital(hosp.id);
        }
      });

      markersRef.current[hosp.id] = marker;
    });

    // Fit map bounds to show all hospitals if there are valid coordinates
    if (bounds.isValid() && hospitals.length > 0) {
      if (userCoords) bounds.extend([userCoords.lat, userCoords.lng]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [hospitals, selectedHospitalId, userCoords]);

  // Handle User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.clearLayers();
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const group = L.layerGroup().addTo(map);

      // Pulsing Outer Radar Circle
      const userIcon = L.divIcon({
        className: "user-gps-marker",
        html: `
          <div style="
            position: relative;
            width: 22px;
            height: 22px;
            background: #006a61;
            border: 3.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 0 4px rgba(0, 106, 97, 0.35);
          " class="pulse-user-location">
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon });
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 10px; font-size: 12px; color: #00334f; font-weight: 600;">
          📍 Your Current Location
        </div>
      `);
      group.addLayer(marker);

      // Subtle range circle (5km radius)
      const radiusCircle = L.circle([userCoords.lat, userCoords.lng], {
        radius: 5000,
        color: "#006a61",
        weight: 1.5,
        opacity: 0.5,
        fillColor: "#006a61",
        fillOpacity: 0.05,
        dashArray: "4, 6",
      });
      group.addLayer(radiusCircle);

      userMarkerRef.current = group;
    }
  }, [userCoords]);

  // Handle Selected Hospital Highlight
  useEffect(() => {
    if (!selectedHospitalId || !markersRef.current[selectedHospitalId]) return;
    const targetMarker = markersRef.current[selectedHospitalId];
    targetMarker.openPopup();
    mapInstanceRef.current?.panTo(targetMarker.getLatLng(), { animate: true, duration: 0.8 });
  }, [selectedHospitalId]);

  const handleLocateMeClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        if (onLocateMe) {
          onLocateMe(coords);
        }
        mapInstanceRef.current?.flyTo([coords.lat, coords.lng], 13, { duration: 1.2 });
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation denied or unavailable", err);
        // Default to Chandigarh Center
        const defaultTricity = { lat: 30.7333, lng: 76.7794 };
        if (onLocateMe) onLocateMe(defaultTricity);
        mapInstanceRef.current?.flyTo([defaultTricity.lat, defaultTricity.lng], 13);
      },
      { timeout: 8000 }
    );
  };

  const handleResetBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || hospitals.length === 0) return;
    const bounds = L.latLngBounds([]);
    hospitals.forEach((h) => {
      if (h.latitude && h.longitude) bounds.extend([h.latitude, h.longitude]);
    });
    if (userCoords) bounds.extend([userCoords.lat, userCoords.lng]);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] overflow-hidden rounded-2xl border border-surface-container-high shadow-sm">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] z-0" />

      {/* Floating Control Hub (Top Left) */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleLocateMeClick}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest/95 backdrop-blur-md hover:bg-white text-primary rounded-xl shadow-md border border-surface-container-high/60 font-label-sm font-semibold text-xs transition-all cursor-pointer"
          title="Detect Current GPS Location"
        >
          <span className={`material-symbols-outlined text-secondary text-[18px] ${isLocating ? "animate-spin" : ""}`}>
            {isLocating ? "progress_activity" : "my_location"}
          </span>
          <span>{isLocating ? "Locating..." : "Locate Me"}</span>
        </button>

        <button
          onClick={handleResetBounds}
          className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest/95 backdrop-blur-md hover:bg-white text-primary rounded-xl shadow-md border border-surface-container-high/60 font-label-sm font-semibold text-xs transition-all cursor-pointer"
          title="Fit All Hospitals on Screen"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">
            crop_free
          </span>
          <span>Fit All</span>
        </button>
      </div>

      {/* Floating Clinical Telemetry Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-surface-container-high/60 flex items-center gap-3 text-xs font-medium text-on-surface">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
          <span className="font-label-xs text-on-surface-variant">ICU $\ge$ 8 Beds</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#b45309]"></span>
          <span className="font-label-xs text-on-surface-variant">1-7 Beds</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
          <span className="font-label-xs text-on-surface-variant">Full / Critical</span>
        </div>
      </div>
    </div>
  );
}
