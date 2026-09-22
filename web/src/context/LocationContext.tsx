"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CityInfo {
  name: string;
  state: string;
  lat: number;
  lng: number;
  region: "featured" | "north" | "south" | "west" | "east";
  hospitalsCount: string;
  traumaCenter: string;
  isPopular?: boolean;
}

export const INDIAN_CITIES: CityInfo[] = [
  // ── Featured Hubs (Hoshiarpur Prominent) ──
  {
    name: "Hoshiarpur",
    state: "Punjab",
    lat: 31.5273,
    lng: 75.9149,
    region: "featured",
    hospitalsCount: "5+",
    traumaCenter: "Level 2 (Civil Hospital)",
    isPopular: true,
  },
  {
    name: "Chandigarh",
    state: "Chandigarh",
    lat: 30.7333,
    lng: 76.7794,
    region: "featured",
    hospitalsCount: "12+",
    traumaCenter: "Level 1 (PGIMER / GMCH-32)",
    isPopular: true,
  },
  {
    name: "Mohali",
    state: "Punjab",
    lat: 30.7046,
    lng: 76.7179,
    region: "featured",
    hospitalsCount: "8+",
    traumaCenter: "Level 2 (Max / Fortis)",
    isPopular: true,
  },
  {
    name: "Panchkula",
    state: "Haryana",
    lat: 30.6942,
    lng: 76.8606,
    region: "featured",
    hospitalsCount: "5+",
    traumaCenter: "Level 2 (Civil / Ojas)",
    isPopular: true,
  },

  // ── North India ──
  {
    name: "Delhi",
    state: "Delhi NCR",
    lat: 28.6139,
    lng: 77.2090,
    region: "north",
    hospitalsCount: "20+",
    traumaCenter: "Level 1 (AIIMS / Safdarjung)",
    isPopular: true,
  },
  {
    name: "Gurugram",
    state: "Haryana",
    lat: 28.4595,
    lng: 77.0266,
    region: "north",
    hospitalsCount: "7+",
    traumaCenter: "Level 1 (Medanta)",
    isPopular: true,
  },
  {
    name: "Jalandhar",
    state: "Punjab",
    lat: 31.3260,
    lng: 75.5762,
    region: "north",
    hospitalsCount: "6+",
    traumaCenter: "Level 2 (Civil / Patel)",
  },
  {
    name: "Ludhiana",
    state: "Punjab",
    lat: 30.9010,
    lng: 75.8573,
    region: "north",
    hospitalsCount: "7+",
    traumaCenter: "Level 2 (DMC / CMC)",
  },
  {
    name: "Amritsar",
    state: "Punjab",
    lat: 31.6340,
    lng: 74.8723,
    region: "north",
    hospitalsCount: "5+",
    traumaCenter: "Level 2 (Guru Nanak Dev Hospital)",
  },
  {
    name: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8467,
    lng: 80.9462,
    region: "north",
    hospitalsCount: "8+",
    traumaCenter: "Level 1 (KGMU / SGPGI)",
    isPopular: true,
  },
  {
    name: "Jaipur",
    state: "Rajasthan",
    lat: 26.9124,
    lng: 75.7873,
    region: "north",
    hospitalsCount: "7+",
    traumaCenter: "Level 1 (SMS Hospital)",
    isPopular: true,
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    lat: 25.3176,
    lng: 82.9739,
    region: "north",
    hospitalsCount: "5+",
    traumaCenter: "Level 1 (IMS BHU)",
  },
  {
    name: "Rishikesh",
    state: "Uttarakhand",
    lat: 30.0766,
    lng: 78.2882,
    region: "north",
    hospitalsCount: "3+",
    traumaCenter: "Level 1 (AIIMS Rishikesh Heli-Ambulance)",
  },

  // ── South India ──
  {
    name: "Bengaluru",
    state: "Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    region: "south",
    hospitalsCount: "14+",
    traumaCenter: "Level 1 (NIMHANS / Narayana)",
    isPopular: true,
  },
  {
    name: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0827,
    lng: 80.2707,
    region: "south",
    hospitalsCount: "10+",
    traumaCenter: "Level 1 (Apollo / Rajiv Gandhi)",
    isPopular: true,
  },
  {
    name: "Hyderabad",
    state: "Telangana",
    lat: 17.3850,
    lng: 78.4867,
    region: "south",
    hospitalsCount: "9+",
    traumaCenter: "Level 1 (NIMS / Apollo Health City)",
    isPopular: true,
  },
  {
    name: "Kochi",
    state: "Kerala",
    lat: 10.0326,
    lng: 76.2995,
    region: "south",
    hospitalsCount: "6+",
    traumaCenter: "Level 1 (Amrita)",
  },
  {
    name: "Vellore",
    state: "Tamil Nadu",
    lat: 12.9248,
    lng: 79.1352,
    region: "south",
    hospitalsCount: "3+",
    traumaCenter: "Level 1 (CMC Vellore)",
  },

  // ── West India ──
  {
    name: "Mumbai",
    state: "Maharashtra",
    lat: 19.0760,
    lng: 72.8777,
    region: "west",
    hospitalsCount: "15+",
    traumaCenter: "Level 1 (Tata Memorial / Lilavati)",
    isPopular: true,
  },
  {
    name: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lng: 73.8567,
    region: "west",
    hospitalsCount: "7+",
    traumaCenter: "Level 1 (Ruby Hall Clinic)",
    isPopular: true,
  },
  {
    name: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0225,
    lng: 72.5714,
    region: "west",
    hospitalsCount: "8+",
    traumaCenter: "Level 1 (Civil Hospital / UN Mehta)",
    isPopular: true,
  },
  {
    name: "Nagpur",
    state: "Maharashtra",
    lat: 21.0428,
    lng: 79.0270,
    region: "west",
    hospitalsCount: "4+",
    traumaCenter: "Level 1 (AIIMS Nagpur)",
  },

  // ── East & Central India ──
  {
    name: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lng: 88.3639,
    region: "east",
    hospitalsCount: "9+",
    traumaCenter: "Level 1 (IPGMER / SSKM)",
    isPopular: true,
  },
  {
    name: "Bhubaneswar",
    state: "Odisha",
    lat: 20.2961,
    lng: 85.8245,
    region: "east",
    hospitalsCount: "5+",
    traumaCenter: "Level 1 (AIIMS Bhubaneswar)",
  },
  {
    name: "Bhopal",
    state: "Madhya Pradesh",
    lat: 23.2599,
    lng: 77.4126,
    region: "east",
    hospitalsCount: "5+",
    traumaCenter: "Level 1 (AIIMS Bhopal)",
  },
  {
    name: "Patna",
    state: "Bihar",
    lat: 25.5941,
    lng: 85.1376,
    region: "east",
    hospitalsCount: "5+",
    traumaCenter: "Level 1 (AIIMS Patna)",
  },
  {
    name: "Guwahati",
    state: "Assam",
    lat: 26.2425,
    lng: 91.6841,
    region: "east",
    hospitalsCount: "4+",
    traumaCenter: "Level 1 (AIIMS Guwahati)",
  },
];

interface LocationContextType {
  selectedCity: string;
  selectedState: string;
  coords: { lat: number; lng: number };
  isAutoDetected: boolean;
  selectCity: (cityName: string, newCoords?: { lat: number; lng: number }) => void;
  autoDetect: () => Promise<boolean>;
  findNearestCity: (lat: number, lng: number) => CityInfo;
  availableCities: CityInfo[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  // Default: Hoshiarpur, Punjab (featured default as requested)
  const defaultCity = INDIAN_CITIES[0];

  const [selectedCity, setSelectedCity] = useState<string>(defaultCity.name);
  const [selectedState, setSelectedState] = useState<string>(defaultCity.state);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultCity.lat,
    lng: defaultCity.lng,
  });
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);

  // Auto-select on initial load from localStorage or browser GPS
  useEffect(() => {
    try {
      const savedCity = localStorage.getItem("medroute_selected_city");
      const savedLat = localStorage.getItem("medroute_selected_lat");
      const savedLng = localStorage.getItem("medroute_selected_lng");

      if (savedCity) {
        const found = INDIAN_CITIES.find(
          (c) => c.name.toLowerCase() === savedCity.toLowerCase()
        );
        if (found) {
          setSelectedCity(found.name);
          setSelectedState(found.state);
          setCoords({
            lat: savedLat ? parseFloat(savedLat) : found.lat,
            lng: savedLng ? parseFloat(savedLng) : found.lng,
          });
          setIsAutoDetected(false);
          return;
        }
      }

      // If no saved preference, attempt non-blocking geolocation in background
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            const nearest = findNearestCity(userLat, userLng);
            setSelectedCity(nearest.name);
            setSelectedState(nearest.state);
            setCoords({ lat: userLat, lng: userLng });
            setIsAutoDetected(true);
            localStorage.setItem("medroute_selected_city", nearest.name);
            localStorage.setItem("medroute_selected_lat", userLat.toString());
            localStorage.setItem("medroute_selected_lng", userLng.toString());
          },
          () => {
            // Geolocation blocked or denied: auto-select default Hoshiarpur
            setSelectedCity(defaultCity.name);
            setSelectedState(defaultCity.state);
            setCoords({ lat: defaultCity.lat, lng: defaultCity.lng });
            setIsAutoDetected(true);
          },
          { timeout: 4000 }
        );
      }
    } catch {
      // Fallback
      setSelectedCity(defaultCity.name);
    }
  }, []);

  const findNearestCity = (lat: number, lng: number): CityInfo => {
    let nearest = INDIAN_CITIES[0];
    let minDistance = Infinity;

    for (const city of INDIAN_CITIES) {
      const dist = calculateDistanceKm(lat, lng, city.lat, city.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = city;
      }
    }
    return nearest;
  };

  const selectCity = (cityName: string, newCoords?: { lat: number; lng: number }) => {
    const found = INDIAN_CITIES.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    const targetCoords = newCoords || (found ? { lat: found.lat, lng: found.lng } : coords);

    setSelectedCity(found ? found.name : cityName);
    if (found) setSelectedState(found.state);
    setCoords(targetCoords);
    setIsAutoDetected(false);

    try {
      localStorage.setItem("medroute_selected_city", found ? found.name : cityName);
      localStorage.setItem("medroute_selected_lat", targetCoords.lat.toString());
      localStorage.setItem("medroute_selected_lng", targetCoords.lng.toString());
    } catch {}
  };

  const autoDetect = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const nearest = findNearestCity(userLat, userLng);
          setSelectedCity(nearest.name);
          setSelectedState(nearest.state);
          setCoords({ lat: userLat, lng: userLng });
          setIsAutoDetected(true);

          try {
            localStorage.setItem("medroute_selected_city", nearest.name);
            localStorage.setItem("medroute_selected_lat", userLat.toString());
            localStorage.setItem("medroute_selected_lng", userLng.toString());
          } catch {}
          resolve(true);
        },
        () => {
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        selectedState,
        coords,
        isAutoDetected,
        selectCity,
        autoDetect,
        findNearestCity,
        availableCities: INDIAN_CITIES,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
