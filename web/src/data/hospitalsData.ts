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
