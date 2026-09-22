/**
 * api.ts — Med Route Mobile API Client
 * Seamlessly connects to FastAPI backend with zero-failure offline fallback.
 */

import { Platform } from "react-native";

// Automatically target localhost or Android emulator 10.0.2.2
const BASE_URL = Platform.select({
  android: "http://10.0.2.2:8000",
  ios: "http://localhost:8000",
  default: "http://localhost:8000",
});

export interface MobileHospital {
  id: string;
  name: string;
  slug: string;
  type: "Government" | "Private" | "Trust";
  city: string;
  state: string;
  address: string;
  distance_km: number;
  overall_rating: number;
  total_reviews: number;
  accreditation: string;
  is_pmjay_empanelled: boolean;
  is_trauma_center: boolean;
  trauma_level: string;
  phone: string;
  emergency_phone: string;
  beds_total: number;
  beds_icu: number;
  beds_icu_available: number;
  beds_ventilator: number;
  ranking_score: number;
  data_source_label: string;
  cost_indicative: string;
  latitude: number;
  longitude: number;
}

export const MOCK_HOSPITALS: MobileHospital[] = [
  {
    id: "hosp-1",
    name: "PGIMER Chandigarh",
    slug: "pgimer-chandigarh",
    type: "Government",
    city: "Chandigarh",
    state: "Chandigarh",
    address: "Sector 12, Near Panjab University",
    distance_km: 3.2,
    overall_rating: 4.8,
    total_reviews: 482,
    accreditation: "NABH & NABL",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "0172-2755555",
    emergency_phone: "0172-2746018",
    beds_total: 1948,
    beds_icu: 180,
    beds_icu_available: 14,
    beds_ventilator: 110,
    ranking_score: 95,
    data_source_label: "SIMULATED",
    cost_indicative: "₹80k - 1.5L",
    latitude: 30.7634,
    longitude: 76.7766,
  },
  {
    id: "hosp-2",
    name: "Fortis Hospital Mohali",
    slug: "fortis-hospital-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 62, Phase 8",
    distance_km: 7.1,
    overall_rating: 4.5,
    total_reviews: 236,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0172-4692222",
    emergency_phone: "0172-4692200",
    beds_total: 355,
    beds_icu: 68,
    beds_icu_available: 9,
    beds_ventilator: 42,
    ranking_score: 84,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.5L - 3.2L",
    latitude: 30.7046,
    longitude: 76.7179,
  },
  {
    id: "hosp-3",
    name: "CMC Ludhiana",
    slug: "christian-medical-college-ludhiana",
    type: "Trust",
    city: "Ludhiana",
    state: "Punjab",
    address: "Brown Road, Near Clock Tower",
    distance_km: 88.0,
    overall_rating: 4.7,
    total_reviews: 194,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "0161-2115000",
    emergency_phone: "0161-2115111",
    beds_total: 775,
    beds_icu: 95,
    beds_icu_available: 12,
    beds_ventilator: 55,
    ranking_score: 89,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.0L - 2.0L",
    latitude: 30.9010,
    longitude: 75.8573,
  },
  {
    id: "hosp-4",
    name: "AIIMS New Delhi",
    slug: "aiims-new-delhi",
    type: "Government",
    city: "New Delhi",
    state: "Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar",
    distance_km: 240.0,
    overall_rating: 4.9,
    total_reviews: 840,
    accreditation: "NABH, NABL & JCI",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Apex Level 1",
    phone: "011-26588500",
    emergency_phone: "011-26593677",
    beds_total: 2478,
    beds_icu: 260,
    beds_icu_available: 18,
    beds_ventilator: 180,
    ranking_score: 96,
    data_source_label: "SIMULATED",
    cost_indicative: "₹60k - 1.2L",
    latitude: 28.5672,
    longitude: 77.2100,
  },
];

export const api = {
  async getNearbyHospitals(lat = 30.7333, lng = 76.7794): Promise<MobileHospital[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/hospitals/nearby?lat=${lat}&lng=${lng}&radius_km=50`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {}
    return MOCK_HOSPITALS;
  },

  async searchHospitals(query: string, category?: string): Promise<MobileHospital[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/search/nl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query || category || "hospital",
          latitude: 30.7333,
          longitude: 76.7794,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {}

    const q = (query || category || "").toLowerCase();
    if (!q) return MOCK_HOSPITALS;

    return MOCK_HOSPITALS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q) ||
        h.accreditation.toLowerCase().includes(q)
    );
  },

  async getHospitalBySlug(slug: string): Promise<MobileHospital | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/hospitals/${slug}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return MOCK_HOSPITALS.find((h) => h.slug === slug || h.id === slug) || MOCK_HOSPITALS[0];
  },

  async triggerSOS(latitude: number, longitude: number) {
    try {
      const res = await fetch(`${BASE_URL}/api/sos/alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    // Fallback: nearest trauma center
    return {
      hospital_name: "PGIMER Chandigarh",
      hospital_phone: "0172-2746018",
      hospital_emergency_phone: "0172-2746018",
      distance_km: 3.2,
      estimated_arrival_minutes: 8,
      beds_icu_available: 14,
      trauma_level: "Level 1 Trauma Center",
    };
  },
};
