"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchMap from "@/components/SearchMap";

interface HospitalItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  overall_rating: number;
  total_reviews: number;
  accreditation?: string;
  is_pmjay_empanelled: boolean;
  is_trauma_center: boolean;
  trauma_level?: string;
  beds_total: number;
  beds_icu: number;
  beds_icu_available: number;
  cost_range?: string;
  pmjay_label?: string;
  description?: string;
  phone?: string;
  specialties?: string[];
}

export const BENCHMARK_HOSPITALS: HospitalItem[] = [
  {
    id: "hosp-1",
    latitude: 30.765,
    longitude: 76.781,
    name: "PGIMER Chandigarh",
    slug: "pgimer-chandigarh",
    type: "Government",
    city: "Chandigarh",
    state: "Chandigarh",
    address: "Sector 12, Chandigarh · 3.2 km away (11 min)",
    distance_km: 3.2,
    overall_rating: 4.8,
    total_reviews: 482,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 1948,
    beds_icu: 220,
    beds_icu_available: 14,
    cost_range: "₹15,000 – ₹45,000",
    pmjay_label: "PMJAY Cashless",
    description: "Public tertiary research institute with dedicated round-the-clock cath labs and emergency trauma.",
    phone: "0172-2755555",
    specialties: ["Cardiology", "Orthopedics", "Nephrology", "Trauma", "Neurology"],
  },
  {
    id: "hosp-2",
    latitude: 30.724,
    longitude: 76.713,
    name: "Max Super Speciality Hospital",
    slug: "max-super-speciality-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Phase VI, Mohali · 7.4 km away (18 min)",
    distance_km: 7.4,
    overall_rating: 4.6,
    total_reviews: 312,
    accreditation: "NABH / JCI",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 280,
    beds_icu: 52,
    beds_icu_available: 6,
    cost_range: "₹1,42,000",
    pmjay_label: "All-Inclusive",
    description: "24/7 Primary Angioplasty Cath Unit with transparent audited pricing and zero hidden tariffs.",
    phone: "0172-6652000",
    specialties: ["Cardiology", "Oncology", "Neurology", "Orthopedics"],
  },
  {
    id: "hosp-3",
    latitude: 30.697,
    longitude: 76.728,
    name: "Fortis Hospital Mohali",
    slug: "fortis-hospital-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 62, Mohali · 8.1 km away (19 min)",
    distance_km: 8.1,
    overall_rating: 4.5,
    total_reviews: 236,
    accreditation: "NABH / JCI",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 355,
    beds_icu: 68,
    beds_icu_available: 9,
    cost_range: "₹1,55,000",
    pmjay_label: "Standard",
    description: "Comprehensive cardiac intervention unit with insurance cashless support and robotic joints.",
    phone: "0172-4692222",
    specialties: ["Cardiology", "Orthopedics", "Cardiac Surgery", "Oncology"],
  },
  {
    id: "hosp-4",
    latitude: 30.7128,
    longitude: 76.788,
    name: "GMCH Sector 32 Chandigarh",
    slug: "gmch-32-chandigarh",
    type: "Government",
    city: "Chandigarh",
    state: "Chandigarh",
    address: "Sector 32, Chandigarh · 4.8 km away (14 min)",
    distance_km: 4.8,
    overall_rating: 4.7,
    total_reviews: 388,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 1100,
    beds_icu: 95,
    beds_icu_available: 9,
    cost_range: "₹10,000 – ₹35,000",
    pmjay_label: "PMJAY Cashless",
    description: "Apex government teaching hospital with high-capacity emergency, trauma ICU, and pediatric surgical wings.",
    phone: "0172-2665253",
    specialties: ["Emergency", "Orthopedics", "Pediatrics", "Trauma", "Cardiology"],
  },
  {
    id: "hosp-5",
    latitude: 30.709,
    longitude: 76.702,
    name: "Ivy Hospital Mohali",
    slug: "ivy-hospital-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 71, SAS Nagar, Mohali · 9.2 km away",
    distance_km: 9.2,
    overall_rating: 4.4,
    total_reviews: 185,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 220,
    beds_icu: 38,
    beds_icu_available: 7,
    cost_range: "₹85,000 – ₹1,80,000",
    pmjay_label: "PMJAY Cashless",
    description: "NABH-accredited super-specialty hospital with wide Ayushman PMJAY cashless coverage.",
    phone: "0172-5212000",
    specialties: ["Oncology", "Joint Replacement", "Dialysis", "Urology"],
  },
  {
    id: "hosp-6",
    latitude: 30.686,
    longitude: 76.852,
    name: "Alchemist Hospital Panchkula",
    slug: "alchemist-hospital-panchkula",
    type: "Private",
    city: "Panchkula",
    state: "Haryana",
    address: "Sector 21, Panchkula · 11.2 km away",
    distance_km: 11.2,
    overall_rating: 4.5,
    total_reviews: 172,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 175,
    beds_icu: 32,
    beds_icu_available: 5,
    cost_range: "₹90,000 – ₹2,00,000",
    pmjay_label: "PMJAY Empanelled",
    description: "Tertiary hospital serving Panchkula & Haryana with advanced cardiology and GI endoscopy.",
    phone: "0172-2570000",
    specialties: ["Cardiology", "Neurology", "Gastroenterology", "Orthopedics"],
  },
  {
    id: "hosp-7",
    latitude: 30.681,
    longitude: 76.712,
    name: "Sohana Multi Speciality Hospital",
    slug: "sohana-hospital-mohali",
    type: "Trust",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 77, SAS Nagar, Mohali · 11.8 km away",
    distance_km: 11.8,
    overall_rating: 4.6,
    total_reviews: 290,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 350,
    beds_icu: 45,
    beds_icu_available: 8,
    cost_range: "₹38,000 – ₹95,000",
    pmjay_label: "PMJAY Subsidized",
    description: "Charitable trust super-specialty hospital celebrated for eye surgery, cancer care, and cardiac cath labs.",
    phone: "0172-5044444",
    specialties: ["Ophthalmology", "Cardiac Sciences", "Cancer Care", "Dialysis"],
  },
  {
    id: "hosp-8",
    latitude: 30.692,
    longitude: 76.856,
    name: "Paras Health Panchkula",
    slug: "paras-health-panchkula",
    type: "Private",
    city: "Panchkula",
    state: "Haryana",
    address: "Sector 22, Panchkula · 13.5 km away",
    distance_km: 13.5,
    overall_rating: 4.6,
    total_reviews: 140,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 200,
    beds_icu: 40,
    beds_icu_available: 7,
    cost_range: "₹1,10,000 – ₹2,40,000",
    pmjay_label: "Empanelled TPAs",
    description: "State-of-the-art super-specialty hospital with advanced neuro-surgery and clinical oncology.",
    phone: "0172-5244444",
    specialties: ["Neurosurgery", "Cardiology", "Surgical Oncology", "Orthopedics"],
  },
  {
    id: "hosp-9",
    latitude: 30.912,
    longitude: 75.861,
    name: "CMC Ludhiana",
    slug: "christian-medical-college-ludhiana",
    type: "Trust",
    city: "Ludhiana",
    state: "Punjab",
    address: "Brown Road, Ludhiana · 88 km away",
    distance_km: 88.0,
    overall_rating: 4.7,
    total_reviews: 194,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 850,
    beds_icu: 95,
    beds_icu_available: 12,
    cost_range: "₹85,000 – ₹1,60,000",
    pmjay_label: "PMJAY Subsidized",
    description: "Historic missionary medical college with subsidized tertiary care and Level 1 polytrauma unit.",
    phone: "0161-2115000",
    specialties: ["Trauma", "Cardiology", "Renal Transplant", "Neurology"],
  },
  {
    id: "hosp-10",
    latitude: 30.908,
    longitude: 75.834,
    name: "DMCH Ludhiana",
    slug: "dayanand-medical-college-ludhiana",
    type: "Trust",
    city: "Ludhiana",
    state: "Punjab",
    address: "Civil Lines, Tagore Nagar, Ludhiana · 91 km away",
    distance_km: 91.0,
    overall_rating: 4.8,
    total_reviews: 360,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 1350,
    beds_icu: 140,
    beds_icu_available: 16,
    cost_range: "₹75,000 – ₹1,80,000",
    pmjay_label: "PMJAY Cashless",
    description: "Premier medical college hospital with Hero DMC Heart Institute and advanced organ transplant.",
    phone: "0161-4687700",
    specialties: ["Cardiology", "Kidney Transplant", "Gastroenterology", "Orthopedics"],
  },
  {
    id: "hosp-11",
    latitude: 30.871,
    longitude: 75.819,
    name: "SPS Apollo Hospital Ludhiana",
    slug: "sps-apollo-hospital-ludhiana",
    type: "Private",
    city: "Ludhiana",
    state: "Punjab",
    address: "GT Road, Sherpur Chowk, Ludhiana · 85 km away",
    distance_km: 85.0,
    overall_rating: 4.7,
    total_reviews: 245,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 350,
    beds_icu: 58,
    beds_icu_available: 8,
    cost_range: "₹1,45,000 – ₹3,00,000",
    pmjay_label: "Standard Private",
    description: "JCI-accredited tertiary hospital known for interventional cardiology and robotic joint replacement.",
    phone: "0161-6770000",
    specialties: ["Cardiology", "Orthopedics", "Oncology"],
  },
  {
    id: "hosp-12",
    latitude: 30.378,
    longitude: 76.776,
    name: "Civil Hospital Ambala City",
    slug: "civil-hospital-ambala-city",
    type: "Government",
    city: "Ambala",
    state: "Haryana",
    address: "Ambala City, Haryana · 42 km away",
    distance_km: 42.0,
    overall_rating: 4.7,
    total_reviews: 290,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 600,
    beds_icu: 45,
    beds_icu_available: 8,
    cost_range: "₹10,000 – ₹35,000",
    pmjay_label: "PMJAY Cashless",
    description: "Modern civil hospital with dedicated tertiary cardiac center and regional cancer care block.",
    phone: "0171-2532200",
    specialties: ["Cardiology", "Cancer Unit", "Trauma Care", "Dialysis"],
  },
  {
    id: "hosp-13",
    latitude: 31.634,
    longitude: 74.8723,
    name: "GMC Amritsar",
    slug: "government-medical-college-amritsar",
    type: "Government",
    city: "Amritsar",
    state: "Punjab",
    address: "Majitha Road, Amritsar · 215 km away",
    distance_km: 215.0,
    overall_rating: 4.6,
    total_reviews: 275,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 950,
    beds_icu: 70,
    beds_icu_available: 9,
    cost_range: "₹12,000 – ₹40,000",
    pmjay_label: "PMJAY Cashless",
    description: "Major government medical college hospital serving northern Punjab with high-volume trauma and surgery.",
    phone: "0183-2424000",
    specialties: ["Trauma", "General Surgery", "Cardiology", "Maternity"],
  },
  {
    id: "hosp-14",
    latitude: 31.648,
    longitude: 74.889,
    name: "Fortis Escorts Hospital Amritsar",
    slug: "fortis-escorts-hospital-amritsar",
    type: "Private",
    city: "Amritsar",
    state: "Punjab",
    address: "Majitha-Verka Bypass, Amritsar · 218 km away",
    distance_km: 218.0,
    overall_rating: 4.6,
    total_reviews: 190,
    accreditation: "NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 180,
    beds_icu: 35,
    beds_icu_available: 6,
    cost_range: "₹1,30,000 – ₹2,60,000",
    pmjay_label: "Private Package",
    description: "Specialized cardiac and multi-specialty healthcare facility with 24x7 primary angioplasty unit.",
    phone: "0183-5080000",
    specialties: ["Cardiology", "Cardiac Surgery", "Critical Care"],
  },
  {
    id: "hosp-15",
    latitude: 31.326,
    longitude: 75.5762,
    name: "Manipal Hospital Jalandhar",
    slug: "manipal-hospital-jalandhar",
    type: "Private",
    city: "Jalandhar",
    state: "Punjab",
    address: "GT Road, Near Bus Stand, Jalandhar · 145 km away",
    distance_km: 145.0,
    overall_rating: 4.6,
    total_reviews: 210,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 230,
    beds_icu: 40,
    beds_icu_available: 6,
    cost_range: "₹1,10,000 – ₹2,20,000",
    pmjay_label: "PMJAY Empanelled",
    description: "Multi-specialty hospital known for acute interventional cardiology, nephrology, and joint care.",
    phone: "0181-5020000",
    specialties: ["Cardiology", "Kidney Transplant", "Neurosciences"],
  },
  {
    id: "hosp-16",
    latitude: 30.211,
    longitude: 74.9455,
    name: "AIIMS Bathinda",
    slug: "aiims-bathinda",
    type: "Government",
    city: "Bathinda",
    state: "Punjab",
    address: "Mandi Dabwali Road, Bathinda · 210 km away",
    distance_km: 210.0,
    overall_rating: 4.8,
    total_reviews: 310,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Apex Level 1",
    beds_total: 750,
    beds_icu: 80,
    beds_icu_available: 12,
    cost_range: "₹15,000 – ₹50,000",
    pmjay_label: "PMJAY Cashless",
    description: "Apex national institute offering oncology, surgical gastroenterology, and complex trauma triage.",
    phone: "0164-2867250",
    specialties: ["Oncology", "Nephrology", "Pediatric Surgery", "Trauma"],
  },
  {
    id: "hosp-17",
    latitude: 28.4395,
    longitude: 77.0428,
    name: "Medanta The Medicity Gurugram",
    slug: "medanta-the-medicity-gurugram",
    type: "Private",
    city: "Gurugram",
    state: "Haryana",
    address: "Sector 38, CH Bakhtawar Singh Road, Gurugram · 260 km away",
    distance_km: 260.0,
    overall_rating: 4.9,
    total_reviews: 780,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Apex Level 1",
    beds_total: 1350,
    beds_icu: 280,
    beds_icu_available: 24,
    cost_range: "₹2,20,000 – ₹5,50,000",
    pmjay_label: "Private Quaternary",
    description: "Internationally acclaimed institute housing leading cardiac, liver, and multiorgan transplant teams.",
    phone: "0124-4141414",
    specialties: ["Cardiology", "Liver Transplant", "Robotic Oncology", "Neurosciences"],
  },
  {
    id: "hosp-18",
    latitude: 28.5672,
    longitude: 77.21,
    name: "AIIMS New Delhi",
    slug: "aiims-new-delhi",
    type: "Government",
    city: "Delhi",
    state: "Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi · 240 km away",
    distance_km: 240.0,
    overall_rating: 4.9,
    total_reviews: 840,
    accreditation: "NABH, NABL & JCI",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Apex Level 1",
    beds_total: 2478,
    beds_icu: 380,
    beds_icu_available: 28,
    cost_range: "₹15,000 – ₹60,000",
    pmjay_label: "PMJAY Cashless",
    description: "India's highest national medical apex center with world-renowned surgical and research divisions.",
    phone: "011-26588500",
    specialties: ["Cardiology", "Organ Transplants", "Neurotrauma", "Oncology", "Orthopedics"],
  },
  {
    id: "hosp-19",
    latitude: 28.6389,
    longitude: 77.1897,
    name: "Sir Ganga Ram Hospital Delhi",
    slug: "sir-ganga-ram-hospital-delhi",
    type: "Trust",
    city: "Delhi",
    state: "Delhi",
    address: "Rajinder Nagar, New Delhi · 245 km away",
    distance_km: 245.0,
    overall_rating: 4.8,
    total_reviews: 510,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 675,
    beds_icu: 125,
    beds_icu_available: 15,
    cost_range: "₹95,000 – ₹2,20,000",
    pmjay_label: "PMJAY Empanelled",
    description: "Premier trust hospital renowned for kidney/liver transplants and subsidized surgical care.",
    phone: "011-25750000",
    specialties: ["Liver Transplant", "Nephrology", "General Surgery", "Cardiology"],
  },
  {
    id: "hosp-20",
    latitude: 28.5606,
    longitude: 77.2764,
    name: "Fortis Escorts Heart Institute Delhi",
    slug: "fortis-escorts-heart-delhi",
    type: "Private",
    city: "Delhi",
    state: "Delhi",
    address: "Okhla Road, Sukhdev Vihar, New Delhi · 252 km away",
    distance_km: 252.0,
    overall_rating: 4.9,
    total_reviews: 380,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 310,
    beds_icu: 80,
    beds_icu_available: 11,
    cost_range: "₹1,90,000 – ₹4,50,000",
    pmjay_label: "Private Cardiac",
    description: "Pioneering cardiac care center with advanced electrophysiology and pediatric heart surgeries.",
    phone: "011-47135000",
    specialties: ["Cardiology", "Cardiac Surgery", "Pediatric Heart"],
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || searchParams.get("category") || "";

  const [query, setQuery] = useState(
    initialQuery ||
      "My elderly father needs urgent cardiology angioplasty under ₹1.5 Lakh in Mohali with cashless PMJAY"
  );
  const [selectedCondition, setSelectedCondition] = useState("All Conditions");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedBudget, setSelectedBudget] = useState("All Tariffs");
  const [hospitals, setHospitals] = useState<HospitalItem[]>(BENCHMARK_HOSPITALS);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 30.7333,
    lng: 76.7794,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("medroute_compare_ids");
      if (saved) setCompareIds(JSON.parse(saved));
    } catch {}
  }, []);

  // Filter hospitals whenever query, condition, location, or budget changes
  useEffect(() => {
    applyFilters(query, selectedCondition, selectedLocation, selectedBudget);
  }, [selectedCondition, selectedLocation, selectedBudget]);

  const applyFilters = (q: string, condition: string, location: string, budget: string) => {
    const qLower = q.toLowerCase().trim();
    let list = BENCHMARK_HOSPITALS;

    // Location filter
    if (location !== "All Locations") {
      if (location.includes("Mohali")) list = list.filter((h) => h.city === "Mohali");
      else if (location.includes("Chandigarh")) list = list.filter((h) => h.city === "Chandigarh");
      else if (location.includes("Panchkula")) list = list.filter((h) => h.city === "Panchkula");
      else if (location.includes("Ludhiana")) list = list.filter((h) => h.city === "Ludhiana");
      else if (location.includes("Delhi")) list = list.filter((h) => h.city === "Delhi" || h.city === "Gurugram");
    }

    // Condition filter
    if (condition !== "All Conditions") {
      if (condition.includes("Cardiology")) {
        list = list.filter((h) => h.specialties?.some((s) => s.toLowerCase().includes("card")));
      } else if (condition.includes("Orthopedics")) {
        list = list.filter((h) => h.specialties?.some((s) => s.toLowerCase().includes("ortho")));
      } else if (condition.includes("Nephrology")) {
        list = list.filter((h) => h.specialties?.some((s) => s.toLowerCase().includes("nephr") || s.toLowerCase().includes("dialysis")));
      } else if (condition.includes("Oncology")) {
        list = list.filter((h) => h.specialties?.some((s) => s.toLowerCase().includes("onco") || s.toLowerCase().includes("cancer")));
      }
    }

    // Budget filter
    if (budget !== "All Tariffs") {
      if (budget.includes("PMJAY")) {
        list = list.filter((h) => h.is_pmjay_empanelled);
      } else if (budget.includes("Under ₹50,000")) {
        list = list.filter((h) => h.type === "Government" || h.type === "Trust");
      } else if (budget.includes("Private")) {
        list = list.filter((h) => h.type === "Private");
      }
    }

    // Query text match if present
    if (qLower && !qLower.includes("elderly father")) {
      list = list.filter((h) => {
        const matchName = h.name.toLowerCase().includes(qLower);
        const matchCity = h.city.toLowerCase().includes(qLower);
        const matchType = h.type.toLowerCase().includes(qLower);
        const matchSpecialty = h.specialties?.some((s) => s.toLowerCase().includes(qLower));
        return matchName || matchCity || matchType || matchSpecialty;
      });
    }

    setHospitals(list.length > 0 ? list : BENCHMARK_HOSPITALS);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_URL}/api/search/nl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          latitude: 30.7333,
          longitude: 76.7794,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setHospitals(
            json.data.map((h: any) => ({
              ...h,
              latitude: h.latitude || 30.7333,
              longitude: h.longitude || 76.7794,
              cost_range: h.cost_indicative || "₹15,000 – ₹1,20,000",
              pmjay_label: h.is_pmjay_empanelled ? "PMJAY Cashless" : "Standard",
              description:
                h.description ||
                `${h.type} healthcare institution with verified emergency infrastructure.`,
            }))
          );
        } else {
          applyFilters(query, selectedCondition, selectedLocation, selectedBudget);
        }
      } else {
        applyFilters(query, selectedCondition, selectedLocation, selectedBudget);
      }
    } catch {
      applyFilters(query, selectedCondition, selectedLocation, selectedBudget);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompare = (id: string) => {
    let updated: string[];
    if (compareIds.includes(id)) {
      updated = compareIds.filter((item) => item !== id);
    } else {
      if (compareIds.length >= 4) {
        alert("You can compare up to 4 hospitals at a time.");
        return;
      }
      updated = [...compareIds, id];
    }
    setCompareIds(updated);
    try {
      localStorage.setItem("medroute_compare_ids", JSON.stringify(updated));
    } catch {}
  };

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col w-full">
          {/* Interactive Canvas Container */}
          <div className="w-full max-w-7xl mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
            {/* Header */}
            <header className="flex flex-col gap-space-xs max-w-2xl pt-space-md">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm uppercase tracking-wider font-semibold">
                  Verified Directory
                </span>
                <span className="font-label-sm text-secondary font-semibold">
                  {hospitals.length} Facilities Listed
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
                Find the right hospital for your condition
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Compare verified package tariffs, genuine Ayushman PMJAY coverage, and live ICU beds with complete transparency across North India.
              </p>
            </header>

            {/* Sleek Natural Language Intake */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="relative flex flex-col gap-space-sm">
                <div className="relative flex items-center">
                  <textarea
                    id="nlp-search-input"
                    className="w-full bg-surface-container-low rounded-lg p-space-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors resize-none shadow-inner pr-28 border border-transparent focus:border-primary-container"
                    rows={2}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      applyFilters(e.target.value, selectedCondition, selectedLocation, selectedBudget);
                    }}
                    placeholder="Describe patient requirements in plain words (e.g. Angioplasty under ₹1.5 Lakh in Mohali with cashless PMJAY)..."
                  />
                  <button
                    id="parse-btn"
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isLoading}
                    className="absolute right-space-md bottom-space-md bg-primary hover:bg-primary-container text-on-primary px-space-md py-space-xs rounded-lg font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isLoading ? "hourglass_empty" : "search"}
                    </span>
                    <span>{isLoading ? "Parsing..." : "Search"}</span>
                  </button>
                </div>

                {/* Extracted Filter Chips */}
                <div className="flex flex-wrap items-center gap-space-xs pt-1">
                  <span className="font-label-sm text-label-sm text-outline mr-1">
                    Quick suggestions:
                  </span>
                  {[
                    "Cardiology · Angioplasty",
                    "Knee Replacement",
                    "PMJAY Cashless",
                    "ICU Beds Available",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setQuery(chip);
                        applyFilters(chip, selectedCondition, selectedLocation, selectedBudget);
                      }}
                      className="font-label-sm text-label-sm bg-surface-container-high hover:bg-surface-container-highest text-primary px-2.5 py-1 rounded-md font-medium transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Filter Dropdowns Row */}
            <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Clinical Specialty
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg">
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full bg-transparent p-space-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none cursor-pointer pr-8"
                    >
                      <option>All Conditions</option>
                      <option>Cardiology &amp; Angioplasty</option>
                      <option>Orthopedics &amp; Joint Care</option>
                      <option>Nephrology &amp; Dialysis</option>
                      <option>General Oncology</option>
                    </select>
                    <span className="material-symbols-outlined text-outline absolute right-space-sm top-2.5 pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Regional Cluster
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-transparent p-space-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none cursor-pointer pr-8"
                    >
                      <option>All Locations</option>
                      <option>Mohali (+ 15 km)</option>
                      <option>Chandigarh (+ 10 km)</option>
                      <option>Panchkula (+ 15 km)</option>
                      <option>Ludhiana (+ 30 km)</option>
                      <option>Delhi / NCR</option>
                    </select>
                    <span className="material-symbols-outlined text-outline absolute right-space-sm top-2.5 pointer-events-none text-[18px]">
                      location_on
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Budget &amp; Scheme Coverage
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg">
                    <select
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      className="w-full bg-transparent p-space-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none cursor-pointer pr-8"
                    >
                      <option>All Tariffs</option>
                      <option>PMJAY Subsidized / Cashless</option>
                      <option>Under ₹50,000 (Govt/Trust)</option>
                      <option>Private Accredited</option>
                    </select>
                    <span className="material-symbols-outlined text-outline absolute right-space-sm top-2.5 pointer-events-none text-[18px]">
                      payments
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Hospital Results & Tactical Geospatial Section */}
            <section className="flex flex-col gap-space-md">
              {/* Header & View Switcher Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/40 shadow-xs">
                <div>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                    Showing {hospitals.length} accredited hospitals
                  </span>
                  <span className="hidden sm:inline text-outline-variant mx-2">·</span>
                  <span className="font-body-sm text-body-sm text-secondary font-medium">
                    Live ICU Telemetry Connected
                  </span>
                </div>

                {/* View Mode Switcher (List | Split | Map) */}
                <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-surface-container-high/60 self-stretch sm:self-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setViewMode("split")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === "split"
                        ? "bg-surface-container-lowest text-primary shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">vertical_split</span>
                    <span>Split View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === "map"
                        ? "bg-surface-container-lowest text-primary shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">map</span>
                    <span>Live Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === "list"
                        ? "bg-surface-container-lowest text-primary shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">view_list</span>
                    <span>List Only</span>
                  </button>
                </div>
              </div>

              {/* VIEW MODE: MAP ONLY */}
              {viewMode === "map" && (
                <div className="relative w-full h-[640px] rounded-2xl overflow-hidden shadow-sm border border-surface-container-high">
                  <SearchMap
                    hospitals={hospitals}
                    selectedHospitalId={selectedHospitalId}
                    onSelectHospital={(id) => setSelectedHospitalId(id)}
                    userCoords={userCoords}
                    onLocateMe={(coords) => setUserCoords(coords)}
                  />

                  {/* Floating Active Hospital Drawer in Map Mode */}
                  {selectedHospitalId && (
                    <div className="absolute bottom-14 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[1000] bg-surface-container-lowest/95 backdrop-blur-md p-space-md rounded-2xl shadow-xl border border-surface-container-high animate-slideUp">
                      {(() => {
                        const target = hospitals.find(
                          (h) => h.id === selectedHospitalId || h.slug === selectedHospitalId
                        );
                        if (!target) return null;
                        const isCompared = compareIds.includes(target.slug) || compareIds.includes(target.id);
                        return (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-headline-sm text-primary font-bold text-sm">
                                  {target.name}
                                </h3>
                                <p className="font-body-xs text-on-surface-variant text-xs">
                                  {target.address}
                                </p>
                              </div>
                              <button
                                onClick={() => setSelectedHospitalId(null)}
                                className="text-outline hover:text-on-surface text-lg cursor-pointer"
                              >
                                &times;
                              </button>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="px-2 py-0.5 rounded-full bg-secondary-container/60 text-secondary font-bold">
                                {target.beds_icu_available} ICU Free
                              </span>
                              {target.is_pmjay_empanelled && (
                                <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
                                  PMJAY Cashless
                                </span>
                              )}
                              <span className="text-on-surface-variant font-medium">
                                {target.cost_range}
                              </span>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => toggleCompare(target.slug)}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center border transition-all ${
                                  isCompared
                                    ? "bg-secondary-container text-on-secondary-container border-secondary"
                                    : "bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container-high"
                                }`}
                              >
                                {isCompared ? "✓ Added" : "Compare"}
                              </button>
                              <Link
                                href={`/hospitals/${target.slug}`}
                                className="flex-1 py-1.5 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold text-center shadow-xs"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW MODE: SPLIT VIEW (List + Sticky Map) */}
              {viewMode === "split" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
                  {/* Left Column: Hospital Cards */}
                  <div className="lg:col-span-7 flex flex-col gap-space-md order-2 lg:order-1">
                    {hospitals.map((hosp) => {
                      const isCompared = compareIds.includes(hosp.slug) || compareIds.includes(hosp.id);
                      const isSelected = selectedHospitalId === hosp.id || selectedHospitalId === hosp.slug;
                      return (
                        <article
                          id={`card-${hosp.id}`}
                          key={hosp.id}
                          onMouseEnter={() => setSelectedHospitalId(hosp.id)}
                          className={`bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-xs hover:shadow-md transition-all flex flex-col gap-space-md border cursor-pointer ${
                            isSelected
                              ? "border-secondary ring-2 ring-secondary/20 bg-surface-container-low/30"
                              : "border-surface-container-high/30"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/hospitals/${hosp.slug}`}
                                className="font-headline-md text-headline-md text-on-surface font-bold hover:text-primary transition-colors"
                              >
                                {hosp.name}
                              </Link>
                              {hosp.accreditation && (
                                <span className="font-label-sm text-label-sm bg-surface-container-high text-secondary px-2 py-0.5 rounded font-medium">
                                  {hosp.accreditation}
                                </span>
                              )}
                              {isSelected && (
                                <span className="font-label-xs text-xs bg-secondary-container text-secondary font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                  Focused on Map
                                </span>
                              )}
                            </div>
                            <span className="font-label-sm text-secondary font-semibold text-xs bg-secondary-container/40 px-2 py-0.5 rounded-full">
                              {hosp.beds_icu_available} ICU Beds Free
                            </span>
                          </div>

                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {hosp.address}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container-high/20">
                            <div>
                              <span className="font-label-xs text-xs text-on-surface-variant block">
                                Indicative Tariff
                              </span>
                              <span className="font-headline-sm text-primary font-bold text-sm">
                                {hosp.cost_range}
                              </span>
                              <span className="text-secondary font-semibold text-xs ml-1.5">
                                {hosp.pmjay_label}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompare(hosp.slug);
                                }}
                                className={`px-3 py-1.5 rounded-lg font-label-sm text-xs transition-colors border ${
                                  isCompared
                                    ? "bg-secondary-container text-on-secondary-container border-secondary font-semibold"
                                    : "bg-surface-container-low hover:bg-surface-container-high text-on-surface border-transparent"
                                }`}
                              >
                                {isCompared ? "✓ Added" : "Compare"}
                              </button>
                              <Link
                                href={`/hospitals/${hosp.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3.5 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-sm text-xs font-semibold transition-colors shadow-xs"
                              >
                                Details ↗
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Right Column: Sticky Real Interactive Leaflet Map */}
                  <div className="lg:col-span-5 sticky top-24 h-[560px] lg:h-[calc(100vh-7.5rem)] rounded-2xl overflow-hidden shadow-xs border border-surface-container-high order-1 lg:order-2">
                    <SearchMap
                      hospitals={hospitals}
                      selectedHospitalId={selectedHospitalId}
                      onSelectHospital={(id) => {
                        setSelectedHospitalId(id);
                        document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      userCoords={userCoords}
                      onLocateMe={(coords) => setUserCoords(coords)}
                    />
                  </div>
                </div>
              )}

              {/* VIEW MODE: LIST ONLY */}
              {viewMode === "list" && (
                <div className="flex flex-col gap-space-md">
                  {hospitals.map((hosp) => {
                    const isCompared = compareIds.includes(hosp.slug) || compareIds.includes(hosp.id);
                    return (
                      <article
                        key={hosp.id}
                        className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg border border-surface-container-high/30"
                      >
                        <div className="flex flex-col gap-1 max-w-sm">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/hospitals/${hosp.slug}`}
                              className="font-headline-md text-headline-md text-on-surface font-bold hover:text-primary transition-colors"
                            >
                              {hosp.name}
                            </Link>
                            {hosp.accreditation && (
                              <span className="font-label-sm text-label-sm bg-surface-container-high text-secondary px-2 py-0.5 rounded font-medium">
                                {hosp.accreditation}
                              </span>
                            )}
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {hosp.address}
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                            {hosp.description}
                          </p>
                        </div>

                        <div className="flex flex-row md:flex-col items-baseline md:items-start gap-space-xs">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Verified Tariff
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-headline-lg text-headline-lg text-primary font-bold">
                              {hosp.cost_range}
                            </span>
                            <span className="font-label-sm text-label-sm text-secondary font-semibold">
                              {hosp.pmjay_label}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-baseline md:items-start gap-space-xs">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Live ICU Status
                          </span>
                          <span className="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                            {hosp.beds_icu_available} Beds Free ({hosp.beds_icu} Total)
                          </span>
                        </div>

                        <div className="flex items-center gap-space-sm w-full md:w-auto pt-space-xs md:pt-0">
                          <button
                            type="button"
                            onClick={() => toggleCompare(hosp.slug)}
                            className={`flex-1 md:flex-none px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors text-center border ${
                              isCompared
                                ? "bg-secondary-container text-on-secondary-container border-secondary font-semibold"
                                : "bg-surface-container-low hover:bg-surface-container-high text-on-surface border-transparent"
                            }`}
                          >
                            {isCompared ? "✓ Added" : "Compare"}
                          </button>
                          <Link
                            href={`/hospitals/${hosp.slug}`}
                            className="flex-1 md:flex-none px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-label-md transition-colors text-center shadow-sm"
                          >
                            View Facility
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sticky Compare Tray Bar */}
          {compareIds.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-surface-container-high shadow-xl p-space-md z-40 animate-slideUp">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-space-md flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="font-label-md font-bold text-on-surface">
                    {compareIds.length} hospital{compareIds.length > 1 ? "s" : ""} selected for side-by-side comparison
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCompareIds([]);
                      try {
                        localStorage.removeItem("medroute_compare_ids");
                      } catch {}
                    }}
                    className="font-label-sm text-outline hover:text-on-surface underline"
                  >
                    Clear All
                  </button>
                  <Link
                    href={`/compare?ids=${compareIds.join(",")}`}
                    className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                    <span>Compare Now ({compareIds.length})</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center font-body-md text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
            <span>Loading MedRoute Search...</span>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
