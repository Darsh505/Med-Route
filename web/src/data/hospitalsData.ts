import rawHospitals from "./allHospitals.json";

export interface ReviewItem {
  id: string;
  author_name: string;
  rating_overall: number;
  treatment_category: string;
  title: string;
  comment: string;
  created_at: string;
  helpful_count: number;
  verified: boolean;
  would_recommend: boolean;
}

export interface HospitalOption {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  address: string;
  pincode?: string;
  type: string;
  accreditation: string;
  is_pmjay_empanelled: boolean;
  pmjay: boolean;
  icu: number;
  beds_icu_available: number;
  beds_icu: number;
  beds_total: number;
  beds_ventilator: number;
  beds_emergency?: number;
  ambulance: string;
  ambulance_phone: string;
  emergency_phone: string;
  phone: string;
  latitude: number;
  longitude: number;
  overall_rating: number;
  total_reviews: number;
  cost_range: string;
  base_package_inr: number;
  pros: string[];
  cons: string[];
  reviews: ReviewItem[];
  specialties: string[];
  description: string;
  is_trauma_center: boolean;
  trauma_level: string;
  procedures?: DiseaseProcedureItem[];
  top_disease_treated?: string;
  total_patients_treated?: number;
  avg_treatment_cost?: number;
  overall_success_ratio?: string;
}

export interface DiseaseProcedureItem {
  name: string;
  disease: string;
  category: string;
  cost_avg: number;
  cost_min: number;
  cost_max: number;
  cost_formatted: string;
  success_rate: number;
  success_ratio: string;
  patients_treated: number;
  volume_per_year: number;
  pmjay_covered: boolean;
  pmjay_package_rate: number;
  average_stay_days: number;
  wait_time_days: number;
}

export const ALL_HOSPITALS: HospitalOption[] = (rawHospitals as unknown as HospitalOption[]).map((h) => ({
  ...h,
  id: h.id || `hosp-${h.slug}`,
  pmjay: h.is_pmjay_empanelled ?? h.pmjay ?? true,
  is_pmjay_empanelled: h.is_pmjay_empanelled ?? h.pmjay ?? true,
  icu: h.beds_icu_available ?? h.icu ?? 5,
  beds_icu_available: h.beds_icu_available ?? h.icu ?? 5,
  beds_icu: h.beds_icu ?? 20,
  beds_total: h.beds_total ?? 200,
  beds_ventilator: h.beds_ventilator ?? 6,
  ambulance: h.ambulance_phone || h.emergency_phone || h.ambulance || "108",
  ambulance_phone: h.ambulance_phone || h.emergency_phone || "108",
  emergency_phone: h.emergency_phone || "108",
  phone: h.phone || h.emergency_phone || "108",
  overall_rating: h.overall_rating || 4.6,
  total_reviews: h.total_reviews || 112,
  cost_range: h.cost_range || (h.type?.toLowerCase() === "government" ? "Free / Subsidized" : "₹75,000 – ₹1,80,000"),
  base_package_inr: h.base_package_inr || (h.type?.toLowerCase() === "government" ? 25000 : 95000),
  pros: h.pros || [],
  cons: h.cons || [],
  reviews: h.reviews || [],
  specialties: h.specialties || ["Emergency Care", "Heart Care", "Bone & Joint", "General Surgery", "Kidney Care"],
  description: h.description || "",
  is_trauma_center: h.is_trauma_center ?? true,
  trauma_level: h.trauma_level || (h.type?.toLowerCase() === "government" ? "Level 1" : "Level 2"),
  procedures: h.procedures || [],
  top_disease_treated: h.top_disease_treated || "General Surgery",
  total_patients_treated: h.total_patients_treated || 5000,
  avg_treatment_cost: h.avg_treatment_cost || 45000,
  overall_success_ratio: h.overall_success_ratio || "97.5%",
}));

export interface HospitalRegionGroup {
  region: string;
  hospitals: HospitalOption[];
}

export function getGroupedHospitals(): HospitalRegionGroup[] {
  const groups: Record<string, HospitalOption[]> = {
    "Hoshiarpur (Focus District)": [],
    "Chandigarh (Tricity Apex)": [],
    "Mohali, Punjab": [],
    "Panchkula, Haryana": [],
    "Punjab (Ludhiana, Amritsar, Jalandhar, Patiala, Bathinda, Pathankot)": [],
    "Himachal Pradesh & J&K (Shimla, Bilaspur, Kangra, Jammu, Srinagar)": [],
    "Haryana (Gurugram, Faridabad, Rohtak, Karnal, Ambala)": [],
    "Delhi NCR (AIIMS, Safdarjung, Ganga Ram, Apollo, Max, Fortis)": [],
    "Uttar Pradesh & Bihar (Lucknow, Varanasi, Kanpur, Noida, Patna)": [],
    "Rajasthan (Jaipur, Jodhpur, Udaipur)": [],
    "Gujarat (Ahmedabad, Vadodara, Surat)": [],
    "Maharashtra & Central India (Mumbai, Pune, Nagpur, Bhopal, Indore)": [],
    "Karnataka (Bengaluru, Mangalore)": [],
    "Kerala & Tamil Nadu (Kochi, Trivandrum, Chennai, Coimbatore, Vellore)": [],
    "Telangana & Andhra Pradesh (Hyderabad, Visakhapatnam, Vijayawada)": [],
    "Eastern & North-Eastern Hubs (Kolkata, Bhubaneswar, Ranchi, Guwahati, Rishikesh)": [],
  };

  for (const h of ALL_HOSPITALS) {
    const city = (h.city || "").toLowerCase();
    const state = (h.state || "").toLowerCase();
    if (city.includes("hoshiarpur")) {
      groups["Hoshiarpur (Focus District)"].push(h);
    } else if (city.includes("chandigarh")) {
      groups["Chandigarh (Tricity Apex)"].push(h);
    } else if (city.includes("mohali")) {
      groups["Mohali, Punjab"].push(h);
    } else if (city.includes("panchkula")) {
      groups["Panchkula, Haryana"].push(h);
    } else if (
      ["ludhiana", "amritsar", "jalandhar", "patiala", "bathinda", "pathankot"].some((c) => city.includes(c)) ||
      state.includes("punjab")
    ) {
      groups["Punjab (Ludhiana, Amritsar, Jalandhar, Patiala, Bathinda, Pathankot)"].push(h);
    } else if (
      ["shimla", "bilaspur", "kangra", "jammu", "srinagar", "tanda", "katra"].some((c) => city.includes(c)) ||
      ["himachal", "jammu", "kashmir"].some((s) => state.includes(s))
    ) {
      groups["Himachal Pradesh & J&K (Shimla, Bilaspur, Kangra, Jammu, Srinagar)"].push(h);
    } else if (
      ["gurugram", "faridabad", "rohtak", "karnal", "ambala"].some((c) => city.includes(c)) ||
      state.includes("haryana")
    ) {
      groups["Haryana (Gurugram, Faridabad, Rohtak, Karnal, Ambala)"].push(h);
    } else if (city.includes("delhi") || state.includes("delhi")) {
      groups["Delhi NCR (AIIMS, Safdarjung, Ganga Ram, Apollo, Max, Fortis)"].push(h);
    } else if (
      ["lucknow", "varanasi", "kanpur", "noida", "patna"].some((c) => city.includes(c)) ||
      ["uttar pradesh", "bihar"].some((s) => state.includes(s))
    ) {
      groups["Uttar Pradesh & Bihar (Lucknow, Varanasi, Kanpur, Noida, Patna)"].push(h);
    } else if (
      ["jaipur", "jodhpur", "udaipur"].some((c) => city.includes(c)) ||
      state.includes("rajasthan")
    ) {
      groups["Rajasthan (Jaipur, Jodhpur, Udaipur)"].push(h);
    } else if (
      ["ahmedabad", "vadodara", "surat"].some((c) => city.includes(c)) ||
      state.includes("gujarat")
    ) {
      groups["Gujarat (Ahmedabad, Vadodara, Surat)"].push(h);
    } else if (
      ["mumbai", "pune", "nagpur", "bhopal", "indore", "thane"].some((c) => city.includes(c)) ||
      ["maharashtra", "madhya pradesh"].some((s) => state.includes(s))
    ) {
      groups["Maharashtra & Central India (Mumbai, Pune, Nagpur, Bhopal, Indore)"].push(h);
    } else if (
      ["bengaluru", "bangalore", "mangalore", "mysore"].some((c) => city.includes(c)) ||
      state.includes("karnataka")
    ) {
      groups["Karnataka (Bengaluru, Mangalore)"].push(h);
    } else if (
      ["kochi", "trivandrum", "thiruvananthapuram", "chennai", "coimbatore", "vellore", "madurai"].some((c) => city.includes(c)) ||
      ["kerala", "tamil nadu"].some((s) => state.includes(s))
    ) {
      groups["Kerala & Tamil Nadu (Kochi, Trivandrum, Chennai, Coimbatore, Vellore)"].push(h);
    } else if (
      ["hyderabad", "visakhapatnam", "vijayawada", "guntur", "secunderabad"].some((c) => city.includes(c)) ||
      ["telangana", "andhra pradesh"].some((s) => state.includes(s))
    ) {
      groups["Telangana & Andhra Pradesh (Hyderabad, Visakhapatnam, Vijayawada)"].push(h);
    } else {
      groups["Eastern & North-Eastern Hubs (Kolkata, Bhubaneswar, Ranchi, Guwahati, Rishikesh)"].push(h);
    }
  }

  return Object.entries(groups)
    .filter(([, list]) => list.length > 0)
    .map(([region, hospitals]) => ({
      region,
      hospitals: hospitals.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export function getHospitalBySlug(slug: string): HospitalOption | undefined {
  const target = slug.toLowerCase().trim();
  const found = (
    ALL_HOSPITALS.find((h) => h.slug.toLowerCase() === target) ||
    ALL_HOSPITALS.find((h) => h.slug.toLowerCase().includes(target) || target.includes(h.slug.toLowerCase()))
  );
  return found ? getHospitalWithOverrides(found) : undefined;
}

export function getHospitalWithOverrides(hospital: HospitalOption): HospitalOption {
  if (typeof window === "undefined") return hospital;
  try {
    const raw = localStorage.getItem("medroute_telemetry_overrides");
    if (!raw) return hospital;
    const overrides = JSON.parse(raw);
    const override = overrides[hospital.id] || (hospital.slug ? overrides[hospital.slug] : undefined);
    if (!override) return hospital;
    return {
      ...hospital,
      beds_icu_available: override.beds_icu_available !== undefined ? override.beds_icu_available : hospital.beds_icu_available,
      icu: override.beds_icu_available !== undefined ? override.beds_icu_available : hospital.beds_icu_available,
      is_pmjay_empanelled: override.is_pmjay_empanelled !== undefined ? override.is_pmjay_empanelled : hospital.is_pmjay_empanelled,
      pmjay: override.is_pmjay_empanelled !== undefined ? override.is_pmjay_empanelled : hospital.is_pmjay_empanelled,
    };
  } catch {
    return hospital;
  }
}

export function getAllHospitalsWithOverrides(): HospitalOption[] {
  if (typeof window === "undefined") return ALL_HOSPITALS;
  try {
    const raw = localStorage.getItem("medroute_telemetry_overrides");
    if (!raw) return ALL_HOSPITALS;
    const overrides = JSON.parse(raw);
    return ALL_HOSPITALS.map((h) => {
      const override = overrides[h.id] || (h.slug ? overrides[h.slug] : undefined);
      if (!override) return h;
      return {
        ...h,
        beds_icu_available: override.beds_icu_available !== undefined ? override.beds_icu_available : h.beds_icu_available,
        icu: override.beds_icu_available !== undefined ? override.beds_icu_available : h.beds_icu_available,
        beds_total: override.beds_total !== undefined ? override.beds_total : h.beds_total,
        is_pmjay_empanelled: override.is_pmjay_empanelled !== undefined ? override.is_pmjay_empanelled : h.is_pmjay_empanelled,
        pmjay: override.is_pmjay_empanelled !== undefined ? override.is_pmjay_empanelled : h.is_pmjay_empanelled,
      };
    });
  } catch {
    return ALL_HOSPITALS;
  }
}

export function saveHospitalTelemetryOverride(
  hospitalId: string,
  slug?: string,
  data?: { beds_icu_available?: number; is_pmjay_empanelled?: boolean; beds_total?: number; is_active?: boolean }
) {
  if (typeof window === "undefined" || !data) return;
  try {
    const raw = localStorage.getItem("medroute_telemetry_overrides");
    const overrides = raw ? JSON.parse(raw) : {};
    const existing = overrides[hospitalId] || {};
    const updated = { ...existing, ...data };
    overrides[hospitalId] = updated;
    if (slug) {
      overrides[slug] = updated;
    }
    localStorage.setItem("medroute_telemetry_overrides", JSON.stringify(overrides));
    window.dispatchEvent(new Event("medroute_telemetry_updated"));
  } catch (e) {
    console.error("Failed to save telemetry override locally", e);
  }

  // Dispatch to central backend API on port 8000
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://monte-huge-erp-put.trycloudflare.com";
  try {
    fetch(`${apiUrl}/api/admin/hospitals/${encodeURIComponent(hospitalId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": "medroute-admin-superkey",
      },
      body: JSON.stringify(data),
    }).catch(() => {});
  } catch {}
}

export async function syncLiveHospitalsTelemetry(): Promise<HospitalOption[]> {
  if (typeof window === "undefined") return ALL_HOSPITALS;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://monte-huge-erp-put.trycloudflare.com";
  try {
    const res = await fetch(`${apiUrl}/api/admin/hospitals?per_page=1000`, {
      headers: { "x-admin-key": "medroute-admin-superkey" },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        const raw = localStorage.getItem("medroute_telemetry_overrides");
        const overrides = raw ? JSON.parse(raw) : {};
        json.data.forEach((item: any) => {
          overrides[item.id] = {
            beds_icu_available: item.beds_icu_available,
            beds_total: item.beds_total,
            is_pmjay_empanelled: item.is_pmjay_empanelled,
            is_active: item.is_active,
          };
          if (item.slug) {
            overrides[item.slug] = overrides[item.id];
          }
        });
        localStorage.setItem("medroute_telemetry_overrides", JSON.stringify(overrides));
        window.dispatchEvent(new Event("medroute_telemetry_updated"));
      }
    }
  } catch {}
  return getAllHospitalsWithOverrides();
}

