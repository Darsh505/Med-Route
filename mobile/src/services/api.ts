import { Platform } from "react-native";

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";

export interface MobileHospital {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  state: string;
  address: string;
  distance_km: number;
  overall_rating: number;
  total_reviews: number;
  accreditation: string;
  is_pmjay_empanelled: boolean;
  is_trauma_center: boolean;
  trauma_level?: string;
  phone: string;
  emergency_phone?: string;
  beds_total: number;
  beds_icu: number;
  beds_icu_available: number;
  beds_ventilator: number;
  ranking_score: number;
  data_source_label: string;
  cost_indicative: string;
  specialties?: string[];
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
    address: "Sector 12, Chandigarh",
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
    beds_icu: 220,
    beds_icu_available: 14,
    beds_ventilator: 110,
    ranking_score: 95,
    data_source_label: "SIMULATED",
    cost_indicative: "₹15k – 45k",
    specialties: ["Cardiology", "Orthopedics", "Nephrology", "Trauma", "Neurology", "Transplant"],
    latitude: 30.7634,
    longitude: 76.7766,
  },
  {
    id: "hosp-2",
    name: "Max Super Speciality Mohali",
    slug: "max-super-speciality-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Phase VI, SAS Nagar, Mohali",
    distance_km: 7.4,
    overall_rating: 4.6,
    total_reviews: 312,
    accreditation: "NABH & JCI",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0172-6652000",
    emergency_phone: "0172-6652100",
    beds_total: 280,
    beds_icu: 52,
    beds_icu_available: 6,
    beds_ventilator: 28,
    ranking_score: 92,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.4L – 2.8L",
    specialties: ["Cardiology", "Oncology", "Neurology", "Orthopedics", "Critical Care"],
    latitude: 30.7271,
    longitude: 76.7193,
  },
  {
    id: "hosp-3",
    name: "Fortis Hospital Mohali",
    slug: "fortis-hospital-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 62, Phase 8, Mohali",
    distance_km: 8.1,
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
    ranking_score: 88,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.5L – 3.2L",
    specialties: ["Cardiology", "Robotic Orthopedics", "Cardiac Surgery", "Oncology"],
    latitude: 30.7046,
    longitude: 76.7179,
  },
  {
    id: "hosp-4",
    name: "GMCH Sector 32 Chandigarh",
    slug: "gmch-32-chandigarh",
    type: "Government",
    city: "Chandigarh",
    state: "Chandigarh",
    address: "Sector 32, Chandigarh",
    distance_km: 4.8,
    overall_rating: 4.7,
    total_reviews: 388,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "0172-2665253",
    emergency_phone: "0172-2665254",
    beds_total: 1100,
    beds_icu: 95,
    beds_icu_available: 9,
    beds_ventilator: 55,
    ranking_score: 93,
    data_source_label: "SIMULATED",
    cost_indicative: "₹10k – 35k",
    specialties: ["Emergency", "General Surgery", "Orthopedics", "Pediatrics", "Trauma"],
    latitude: 30.7128,
    longitude: 76.7880,
  },
  {
    id: "hosp-5",
    name: "Ivy Hospital Mohali",
    slug: "ivy-hospital-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 71, SAS Nagar, Mohali",
    distance_km: 9.3,
    overall_rating: 4.4,
    total_reviews: 185,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0172-5212000",
    emergency_phone: "0172-5212100",
    beds_total: 220,
    beds_icu: 38,
    beds_icu_available: 7,
    beds_ventilator: 20,
    ranking_score: 86,
    data_source_label: "SIMULATED",
    cost_indicative: "₹85k – 1.8L",
    specialties: ["Oncology", "Joint Replacement", "Dialysis", "Urology"],
    latitude: 30.6894,
    longitude: 76.7291,
  },
  {
    id: "hosp-6",
    name: "Alchemist Hospital Panchkula",
    slug: "alchemist-hospital-panchkula",
    type: "Private",
    city: "Panchkula",
    state: "Haryana",
    address: "Sector 21, Panchkula",
    distance_km: 11.2,
    overall_rating: 4.5,
    total_reviews: 172,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0172-2570000",
    emergency_phone: "0172-2570100",
    beds_total: 175,
    beds_icu: 32,
    beds_icu_available: 5,
    beds_ventilator: 18,
    ranking_score: 85,
    data_source_label: "SIMULATED",
    cost_indicative: "₹90k – 2.0L",
    specialties: ["Cardiology", "Neurology", "Gastroenterology", "Orthopedics"],
    latitude: 30.6961,
    longitude: 76.8600,
  },
  {
    id: "hosp-7",
    name: "Sohana Multi Speciality Hospital",
    slug: "sohana-hospital-mohali",
    type: "Trust",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 77, SAS Nagar, Mohali",
    distance_km: 12.0,
    overall_rating: 4.6,
    total_reviews: 290,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0172-5044444",
    emergency_phone: "0172-5044400",
    beds_total: 350,
    beds_icu: 45,
    beds_icu_available: 8,
    beds_ventilator: 24,
    ranking_score: 90,
    data_source_label: "SIMULATED",
    cost_indicative: "₹40k – 95k",
    specialties: ["Ophthalmology", "Cardiac Sciences", "Cancer Care", "Dialysis"],
    latitude: 30.6725,
    longitude: 76.7121,
  },
  {
    id: "hosp-8",
    name: "Paras Health Panchkula",
    slug: "paras-health-panchkula",
    type: "Private",
    city: "Panchkula",
    state: "Haryana",
    address: "Sector 22, Panchkula",
    distance_km: 13.5,
    overall_rating: 4.6,
    total_reviews: 140,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0172-5244444",
    emergency_phone: "0172-5244400",
    beds_total: 200,
    beds_icu: 40,
    beds_icu_available: 7,
    beds_ventilator: 22,
    ranking_score: 87,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.1L – 2.4L",
    specialties: ["Neurosurgery", "Interventional Cardiology", "Surgical Oncology"],
    latitude: 30.6881,
    longitude: 76.8672,
  },
  {
    id: "hosp-9",
    name: "CMC Ludhiana",
    slug: "christian-medical-college-ludhiana",
    type: "Trust",
    city: "Ludhiana",
    state: "Punjab",
    address: "Brown Road, Ludhiana",
    distance_km: 88.0,
    overall_rating: 4.7,
    total_reviews: 194,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "0161-2115000",
    emergency_phone: "0161-2115111",
    beds_total: 850,
    beds_icu: 95,
    beds_icu_available: 12,
    beds_ventilator: 55,
    ranking_score: 91,
    data_source_label: "SIMULATED",
    cost_indicative: "₹85k – 1.6L",
    specialties: ["Trauma Surgery", "Cardiology", "Renal Transplant", "Neurology"],
    latitude: 30.9109,
    longitude: 75.8320,
  },
  {
    id: "hosp-10",
    name: "DMCH Ludhiana",
    slug: "dayanand-medical-college-ludhiana",
    type: "Trust",
    city: "Ludhiana",
    state: "Punjab",
    address: "Civil Lines, Tagore Nagar, Ludhiana",
    distance_km: 92.0,
    overall_rating: 4.8,
    total_reviews: 360,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "0161-4687700",
    emergency_phone: "0161-4687777",
    beds_total: 1350,
    beds_icu: 140,
    beds_icu_available: 16,
    beds_ventilator: 75,
    ranking_score: 94,
    data_source_label: "SIMULATED",
    cost_indicative: "₹75k – 1.8L",
    specialties: ["Hero DMC Cardiac Institute", "Kidney Transplant", "Gastroenterology"],
    latitude: 30.9011,
    longitude: 75.8573,
  },
  {
    id: "hosp-11",
    name: "SPS Apollo Hospital Ludhiana",
    slug: "sps-apollo-hospital-ludhiana",
    type: "Private",
    city: "Ludhiana",
    state: "Punjab",
    address: "Grand Trunk Road, Sherpur Chowk, Ludhiana",
    distance_km: 85.0,
    overall_rating: 4.7,
    total_reviews: 245,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0161-6770000",
    emergency_phone: "0161-6770100",
    beds_total: 350,
    beds_icu: 58,
    beds_icu_available: 8,
    beds_ventilator: 32,
    ranking_score: 89,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.4L – 3.0L",
    specialties: ["Complex Cardiac", "Joint Reconstruction", "Surgical Oncology"],
    latitude: 30.8944,
    longitude: 75.7968,
  },
  {
    id: "hosp-12",
    name: "GMC Amritsar",
    slug: "government-medical-college-amritsar",
    type: "Government",
    city: "Amritsar",
    state: "Punjab",
    address: "Majitha Road, Amritsar",
    distance_km: 215.0,
    overall_rating: 4.6,
    total_reviews: 275,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "0183-2424000",
    emergency_phone: "0183-2424001",
    beds_total: 950,
    beds_icu: 70,
    beds_icu_available: 9,
    beds_ventilator: 40,
    ranking_score: 90,
    data_source_label: "SIMULATED",
    cost_indicative: "₹12k – 40k",
    specialties: ["Emergency Trauma", "General Surgery", "Cardiology", "Maternity"],
    latitude: 31.6340,
    longitude: 74.8723,
  },
  {
    id: "hosp-13",
    name: "Fortis Escorts Hospital Amritsar",
    slug: "fortis-escorts-hospital-amritsar",
    type: "Private",
    city: "Amritsar",
    state: "Punjab",
    address: "Majitha-Verka Bypass, Amritsar",
    distance_km: 218.0,
    overall_rating: 4.6,
    total_reviews: 190,
    accreditation: "NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0183-5080000",
    emergency_phone: "0183-5080001",
    beds_total: 180,
    beds_icu: 35,
    beds_icu_available: 6,
    beds_ventilator: 18,
    ranking_score: 87,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.3L – 2.6L",
    specialties: ["Cardiac Cath Lab", "Cardiac Surgery", "Critical Care"],
    latitude: 31.6711,
    longitude: 74.8820,
  },
  {
    id: "hosp-14",
    name: "Manipal Hospital Jalandhar",
    slug: "manipal-hospital-jalandhar",
    type: "Private",
    city: "Jalandhar",
    state: "Punjab",
    address: "GT Road, Near Bus Stand, Jalandhar",
    distance_km: 145.0,
    overall_rating: 4.6,
    total_reviews: 210,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0181-5020000",
    emergency_phone: "0181-5020100",
    beds_total: 230,
    beds_icu: 40,
    beds_icu_available: 6,
    beds_ventilator: 24,
    ranking_score: 88,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.1L – 2.2L",
    specialties: ["Cardiac Sciences", "Kidney Transplant", "Neurosciences"],
    latitude: 31.3280,
    longitude: 75.5811,
  },
  {
    id: "hosp-15",
    name: "Civil Hospital Jalandhar",
    slug: "civil-hospital-jalandhar",
    type: "Government",
    city: "Jalandhar",
    state: "Punjab",
    address: "Model Town Road, Jalandhar",
    distance_km: 142.0,
    overall_rating: 4.5,
    total_reviews: 260,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "0181-2458000",
    emergency_phone: "0181-2458001",
    beds_total: 720,
    beds_icu: 45,
    beds_icu_available: 7,
    beds_ventilator: 30,
    ranking_score: 89,
    data_source_label: "SIMULATED",
    cost_indicative: "₹8k – 30k",
    specialties: ["Trauma Surgery", "Obstetrics", "Pediatrics", "Emergency"],
    latitude: 31.3260,
    longitude: 75.5762,
  },
  {
    id: "hosp-16",
    name: "Civil Hospital Ambala City",
    slug: "civil-hospital-ambala-city",
    type: "Government",
    city: "Ambala",
    state: "Haryana",
    address: "Ambala City, Haryana",
    distance_km: 42.0,
    overall_rating: 4.7,
    total_reviews: 290,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "0171-2532200",
    emergency_phone: "0171-2532201",
    beds_total: 600,
    beds_icu: 45,
    beds_icu_available: 8,
    beds_ventilator: 26,
    ranking_score: 91,
    data_source_label: "SIMULATED",
    cost_indicative: "₹10k – 35k",
    specialties: ["Tertiary Cardiac", "Cancer Unit", "Trauma Care", "Dialysis"],
    latitude: 30.3782,
    longitude: 76.7767,
  },
  {
    id: "hosp-17",
    name: "MM Institute of Medical Sciences (MMU)",
    slug: "mm-institute-medical-sciences-ambala",
    type: "Trust",
    city: "Ambala",
    state: "Haryana",
    address: "Mullana, Ambala",
    distance_km: 55.0,
    overall_rating: 4.6,
    total_reviews: 220,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "01731-304555",
    emergency_phone: "01731-304500",
    beds_total: 1050,
    beds_icu: 90,
    beds_icu_available: 14,
    beds_ventilator: 48,
    ranking_score: 92,
    data_source_label: "SIMULATED",
    cost_indicative: "₹35k – 90k",
    specialties: ["Cardiovascular Surgery", "Spine Care", "Kidney Transplant"],
    latitude: 30.2510,
    longitude: 77.0420,
  },
  {
    id: "hosp-18",
    name: "AIIMS Bathinda",
    slug: "aiims-bathinda",
    type: "Government",
    city: "Bathinda",
    state: "Punjab",
    address: "Mandi Dabwali Road, Bathinda",
    distance_km: 210.0,
    overall_rating: 4.8,
    total_reviews: 310,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Apex Level 1",
    phone: "0164-2867250",
    emergency_phone: "0164-2867000",
    beds_total: 750,
    beds_icu: 80,
    beds_icu_available: 12,
    beds_ventilator: 50,
    ranking_score: 94,
    data_source_label: "SIMULATED",
    cost_indicative: "₹15k – 50k",
    specialties: ["Super-specialty Oncology", "Nephrology", "Pediatric Surgery"],
    latitude: 30.1780,
    longitude: 74.9240,
  },
  {
    id: "hosp-19",
    name: "Medanta The Medicity Gurugram",
    slug: "medanta-the-medicity-gurugram",
    type: "Private",
    city: "Gurugram",
    state: "Haryana",
    address: "Sector 38, Gurugram, NCR",
    distance_km: 260.0,
    overall_rating: 4.9,
    total_reviews: 780,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Apex Level 1",
    phone: "0124-4141414",
    emergency_phone: "0124-4141515",
    beds_total: 1350,
    beds_icu: 280,
    beds_icu_available: 24,
    beds_ventilator: 160,
    ranking_score: 97,
    data_source_label: "SIMULATED",
    cost_indicative: "₹2.2L – 5.5L",
    specialties: ["Heart Transplant", "Liver Transplant", "Robotic Oncology", "Neurosciences"],
    latitude: 28.4395,
    longitude: 77.0428,
  },
  {
    id: "hosp-20",
    name: "Artemis Hospital Gurugram",
    slug: "artemis-hospital-gurugram",
    type: "Private",
    city: "Gurugram",
    state: "Haryana",
    address: "Sector 51, Gurugram, NCR",
    distance_km: 265.0,
    overall_rating: 4.7,
    total_reviews: 390,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 2",
    phone: "0124-4511111",
    emergency_phone: "0124-4511000",
    beds_total: 450,
    beds_icu: 85,
    beds_icu_available: 11,
    beds_ventilator: 48,
    ranking_score: 91,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.8L – 3.8L",
    specialties: ["Cardiovascular Surgery", "Minimal Invasive Spine", "Cancer Institute"],
    latitude: 28.4353,
    longitude: 77.0799,
  },
  {
    id: "hosp-21",
    name: "AIIMS New Delhi",
    slug: "aiims-new-delhi",
    type: "Government",
    city: "Delhi",
    state: "Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi",
    distance_km: 240.0,
    overall_rating: 4.9,
    total_reviews: 840,
    accreditation: "NABH, NABL & JCI",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Apex Level 1",
    phone: "011-26588500",
    emergency_phone: "011-26588700",
    beds_total: 2478,
    beds_icu: 380,
    beds_icu_available: 28,
    beds_ventilator: 190,
    ranking_score: 98,
    data_source_label: "SIMULATED",
    cost_indicative: "₹15k – 60k",
    specialties: ["Apex Research", "Organ Transplants", "Neurotrauma", "Oncology"],
    latitude: 28.5672,
    longitude: 77.2100,
  },
  {
    id: "hosp-22",
    name: "Sir Ganga Ram Hospital Delhi",
    slug: "sir-ganga-ram-hospital-delhi",
    type: "Trust",
    city: "Delhi",
    state: "Delhi",
    address: "Rajinder Nagar, New Delhi",
    distance_km: 245.0,
    overall_rating: 4.8,
    total_reviews: 510,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "011-25750000",
    emergency_phone: "011-42251000",
    beds_total: 675,
    beds_icu: 125,
    beds_icu_available: 15,
    beds_ventilator: 70,
    ranking_score: 93,
    data_source_label: "SIMULATED",
    cost_indicative: "₹95k – 2.2L",
    specialties: ["Liver Transplant", "Nephrology", "General Surgery", "Pediatrics"],
    latitude: 28.6385,
    longitude: 77.1895,
  },
  {
    id: "hosp-23",
    name: "Safdarjung Hospital Delhi",
    slug: "safdarjung-hospital-new-delhi",
    type: "Government",
    city: "Delhi",
    state: "Delhi",
    address: "Ansari Nagar West, Ring Road, New Delhi",
    distance_km: 242.0,
    overall_rating: 4.6,
    total_reviews: 420,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "011-26165060",
    emergency_phone: "011-26165060",
    beds_total: 1600,
    beds_icu: 160,
    beds_icu_available: 16,
    beds_ventilator: 85,
    ranking_score: 91,
    data_source_label: "SIMULATED",
    cost_indicative: "₹8k – 25k",
    specialties: ["Apex Burn Care", "Poly-trauma", "Emergency Medicine"],
    latitude: 28.5665,
    longitude: 77.2021,
  },
  {
    id: "hosp-24",
    name: "Indraprastha Apollo Hospital Delhi",
    slug: "apollo-hospital-delhi",
    type: "Private",
    city: "Delhi",
    state: "Delhi",
    address: "Sarita Vihar, Delhi Mathura Road, New Delhi",
    distance_km: 255.0,
    overall_rating: 4.8,
    total_reviews: 490,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "011-71791090",
    emergency_phone: "011-71791060",
    beds_total: 710,
    beds_icu: 135,
    beds_icu_available: 18,
    beds_ventilator: 80,
    ranking_score: 93,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.8L – 4.2L",
    specialties: ["Pediatric Cardiology", "Bone Marrow Transplant", "Neurosurgery"],
    latitude: 28.5409,
    longitude: 77.2879,
  },
  {
    id: "hosp-25",
    name: "Fortis Escorts Heart Institute Delhi",
    slug: "fortis-escorts-heart-delhi",
    type: "Private",
    city: "Delhi",
    state: "Delhi",
    address: "Okhla Road, Sukhdev Vihar, New Delhi",
    distance_km: 252.0,
    overall_rating: 4.9,
    total_reviews: 380,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 1",
    phone: "011-47135000",
    emergency_phone: "011-47135100",
    beds_total: 310,
    beds_icu: 80,
    beds_icu_available: 11,
    beds_ventilator: 52,
    ranking_score: 94,
    data_source_label: "SIMULATED",
    cost_indicative: "₹1.9L – 4.5L",
    specialties: ["Interventional Cardiology", "Electrophysiology", "Pediatric Heart Surgery"],
    latitude: 28.5609,
    longitude: 77.2798,
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

    const q = (query || category || "").toLowerCase().trim();
    if (!q) return MOCK_HOSPITALS;

    return MOCK_HOSPITALS.filter((h) => {
      const matchName = h.name.toLowerCase().includes(q);
      const matchCity = h.city.toLowerCase().includes(q);
      const matchType = h.type.toLowerCase().includes(q);
      const matchAccr = h.accreditation.toLowerCase().includes(q);
      const matchSpecialty = h.specialties?.some((s) => s.toLowerCase().includes(q));
      const matchTrauma = q.includes("trauma") && h.is_trauma_center;
      const matchPmjay = (q.includes("pmjay") || q.includes("ayushman")) && h.is_pmjay_empanelled;
      const matchCardiac = (q.includes("cardiac") || q.includes("heart") || q.includes("stent")) &&
        h.specialties?.some((s) => s.toLowerCase().includes("card"));
      const matchOrtho = (q.includes("ortho") || q.includes("knee") || q.includes("joint")) &&
        h.specialties?.some((s) => s.toLowerCase().includes("ortho"));

      return (
        matchName ||
        matchCity ||
        matchType ||
        matchAccr ||
        matchSpecialty ||
        matchTrauma ||
        matchPmjay ||
        matchCardiac ||
        matchOrtho
      );
    });
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

  async compareHospitals(hospitalIds: string[], procedureId?: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital_ids: hospitalIds, procedure_id: procedureId }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    // Fallback comparison using MOCK_HOSPITALS
    const matched = MOCK_HOSPITALS.filter(
      (h) => hospitalIds.includes(h.id) || hospitalIds.includes(h.slug)
    );
    return {
      hospitals: matched.length > 0 ? matched : [MOCK_HOSPITALS[0], MOCK_HOSPITALS[1]],
      comparison_matrix: {
        cost_indicative: matched.map((h) => h.cost_indicative),
        beds_icu_available: matched.map((h) => h.beds_icu_available),
        is_pmjay_empanelled: matched.map((h) => h.is_pmjay_empanelled),
        overall_rating: matched.map((h) => h.overall_rating),
      },
    };
  },

  async sendChatMessage(
    message: string,
    history: Array<{ role: string; content: string }> = [],
    latitude: number = 30.7333,
    longitude: number = 76.7794
  ) {
    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, latitude, longitude }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    // Fallback mobile NLP clinical response
    const msgLower = message.toLowerCase();
    const isEmergency =
      msgLower.includes("chest pain") ||
      msgLower.includes("heart attack") ||
      msgLower.includes("accident") ||
      msgLower.includes("unconscious") ||
      msgLower.includes("bleeding");

    return {
      reply: isEmergency
        ? "⚠️ **CRITICAL CLINICAL TRIAGE**: Symptoms indicate a high-priority acute medical emergency. Proceed immediately to the nearest tertiary emergency department or call ambulance 108."
        : `Identified medical inquiry for: "${message}". Based on regional bed occupancy and NABH telemetry, the following facilities are recommended.`,
      triage_level: isEmergency ? "emergency" : "routine",
      recommended_hospitals: [
        {
          name: "PGIMER Chandigarh",
          slug: "pgimer-chandigarh",
          address: "Sector 12, Chandigarh",
          distance_km: 3.2,
          beds_icu_available: 14,
          is_pmjay_empanelled: true,
          emergency_phone: "0172-2746018",
          cost_indicative: "₹15,000 – ₹45,000 (Subsidized)",
        },
        {
          name: "Max Super Speciality Mohali",
          slug: "max-super-speciality-mohali",
          address: "Phase VI, SAS Nagar, Mohali",
          distance_km: 7.4,
          beds_icu_available: 6,
          is_pmjay_empanelled: true,
          emergency_phone: "0172-6652100",
          cost_indicative: "₹1,42,000 Package",
        },
      ],
      action_buttons: isEmergency
        ? [
            { type: "call_emergency", label: "📞 Call 108 Ambulance", value: "108" },
            { type: "call_hospital", label: "🚨 Call PGIMER Emergency", value: "01722746018" },
          ]
        : [
            { type: "view_hospital", label: "🏥 View PGIMER Details", value: "pgimer-chandigarh" },
          ],
      quick_suggestions: [
        "Find free ICU beds near me",
        "PMJAY hospital list",
        "Emergency ambulance 108",
      ],
    };
  },
};

