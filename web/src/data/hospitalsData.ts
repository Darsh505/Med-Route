import rawHospitals from "./allHospitals.json";

export interface HospitalOption {
  slug: string;
  name: string;
  city: string;
  state: string;
  type: string;
  accreditation: string;
  pmjay: boolean;
  icu: number;
  ambulance: string;
}

export const ALL_HOSPITALS: HospitalOption[] = rawHospitals as HospitalOption[];

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
    "Ludhiana, Punjab": [],
    "Amritsar & Jalandhar, Punjab": [],
    "Delhi NCR (National Capital Region)": [],
    "Mumbai & Maharashtra": [],
    "Bengaluru, Karnataka": [],
    "Hyderabad & Telangana": [],
    "Chennai & Tamil Nadu": [],
    "Kolkata & Eastern Hubs": [],
    "Jaipur & Rajasthan": [],
    "Other Pan-India Apex Centers": [],
  };

  for (const h of ALL_HOSPITALS) {
    const city = (h.city || "").toLowerCase();
    if (city.includes("hoshiarpur")) {
      groups["Hoshiarpur (Focus District)"].push(h);
    } else if (city.includes("chandigarh")) {
      groups["Chandigarh (Tricity Apex)"].push(h);
    } else if (city.includes("mohali")) {
      groups["Mohali, Punjab"].push(h);
    } else if (city.includes("panchkula")) {
      groups["Panchkula, Haryana"].push(h);
    } else if (city.includes("ludhiana")) {
      groups["Ludhiana, Punjab"].push(h);
    } else if (city.includes("amritsar") || city.includes("jalandhar") || city.includes("patiala") || city.includes("bathinda")) {
      groups["Amritsar & Jalandhar, Punjab"].push(h);
    } else if (city.includes("delhi") || city.includes("gurugram") || city.includes("faridabad") || city.includes("rohtak") || city.includes("karnal") || city.includes("ambala")) {
      groups["Delhi NCR (National Capital Region)"].push(h);
    } else if (city.includes("mumbai") || city.includes("pune") || city.includes("nagpur")) {
      groups["Mumbai & Maharashtra"].push(h);
    } else if (city.includes("bengaluru") || city.includes("bangalore")) {
      groups["Bengaluru, Karnataka"].push(h);
    } else if (city.includes("hyderabad")) {
      groups["Hyderabad & Telangana"].push(h);
    } else if (city.includes("chennai") || city.includes("vellore") || city.includes("kochi")) {
      groups["Chennai & Tamil Nadu"].push(h);
    } else if (city.includes("kolkata") || city.includes("bhubaneswar") || city.includes("guwahati") || city.includes("patna")) {
      groups["Kolkata & Eastern Hubs"].push(h);
    } else if (city.includes("jaipur")) {
      groups["Jaipur & Rajasthan"].push(h);
    } else {
      groups["Other Pan-India Apex Centers"].push(h);
    }
  }

  return Object.entries(groups)
    .filter(([_, list]) => list.length > 0)
    .map(([region, hospitals]) => ({
      region,
      hospitals: hospitals.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export function getHospitalBySlug(slug: string): HospitalOption | undefined {
  const target = slug.toLowerCase().trim();
  return (
    ALL_HOSPITALS.find((h) => h.slug.toLowerCase() === target) ||
    ALL_HOSPITALS.find((h) => h.slug.toLowerCase().includes(target) || target.includes(h.slug.toLowerCase()))
  );
}
