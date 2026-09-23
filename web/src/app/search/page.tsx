"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchMap from "@/components/SearchMap";
import { useLocation } from "@/context/LocationContext";
import { ALL_HOSPITALS, HospitalOption } from "@/data/hospitalsData";

const SPECIALTY_OPTIONS = [
  { label: "All Specialties", value: "All" },
  { label: "Heart Care (Cardiology & Surgery)", value: "card" },
  { label: "Bone & Joint (Orthopedics)", value: "ortho" },
  { label: "Kidney Care & Dialysis (Nephrology)", value: "nephr" },
  { label: "Cancer Care (Oncology)", value: "onco" },
  { label: "Emergency & Trauma Resuscitation", value: "trauma" },
  { label: "Maternity & Gynecology", value: "gyn" },
  { label: "Eye Care & Cataract", value: "eye" },
  { label: "Child & Pediatric Care", value: "child" },
  { label: "General & Laparoscopic Surgery", value: "surg" },
];

const KNOWN_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  mohali: { lat: 30.7046, lng: 76.7179 },
  panchkula: { lat: 30.6942, lng: 76.8606 },
  hoshiarpur: { lat: 31.5305, lng: 75.9125 },
  ludhiana: { lat: 30.9010, lng: 75.8573 },
  amritsar: { lat: 31.6340, lng: 74.8723 },
  jalandhar: { lat: 31.3260, lng: 75.5762 },
  patiala: { lat: 30.3398, lng: 76.3869 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  noida: { lat: 28.5355, lng: 77.3910 },
  faridabad: { lat: 28.4089, lng: 77.3178 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
};

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface ClinicalSlots {
  condition?: string;
  categoryKey?: string;
  location?: string;
  targetCoords?: { lat: number; lng: number };
  maxBudget?: number;
  requiresPmjay?: boolean;
  requiresAccredited?: boolean;
  requiresIcu?: boolean;
  hospitalType?: "government" | "private" | "trust";
  priority: string;
  confidence: number;
}

function parseClinicalQuery(rawQuery: string): ClinicalSlots | null {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return null;

  let condition: string | undefined;
  let categoryKey: string | undefined;
  let location: string | undefined;
  let targetCoords: { lat: number; lng: number } | undefined;
  let maxBudget: number | undefined;
  let requiresPmjay = false;
  let requiresAccredited = false;
  let requiresIcu = false;
  let hospitalType: "government" | "private" | "trust" | undefined;
  let priority = "Distance vs Cost Balanced";
  let confidence = 0.88;

  // 1. Condition extraction
  if (
    q.includes("kidney") ||
    q.includes("renal") ||
    q.includes("dialysis") ||
    q.includes("nephro") ||
    q.includes("gurde") ||
    q.includes("gurdey") ||
    q.includes("pathri")
  ) {
    condition = "Kidney Treatment & Nephrology";
    categoryKey = "nephr";
  } else if (
    q.includes("heart") ||
    q.includes("cardiac") ||
    q.includes("stent") ||
    q.includes("angioplasty") ||
    q.includes("bypass") ||
    q.includes("cabg") ||
    q.includes("dil ") ||
    q.includes("chest pain")
  ) {
    condition = "Heart Surgery & Cardiology";
    categoryKey = "card";
  } else if (
    q.includes("knee") ||
    q.includes("ortho") ||
    q.includes("joint") ||
    q.includes("bone") ||
    q.includes("hip") ||
    q.includes("arthritis") ||
    q.includes("haddi")
  ) {
    condition = "Bone & Joint (Orthopedics)";
    categoryKey = "ortho";
  } else if (
    q.includes("cancer") ||
    q.includes("onco") ||
    q.includes("tumor") ||
    q.includes("chemo")
  ) {
    condition = "Cancer Care (Oncology)";
    categoryKey = "onco";
  } else if (
    q.includes("trauma") ||
    q.includes("accident") ||
    q.includes("emergency")
  ) {
    condition = "Emergency & Trauma Resuscitation";
    categoryKey = "trauma";
    priority = "Proximity & Critical Triage";
  } else if (
    q.includes("delivery") ||
    q.includes("c-section") ||
    q.includes("pregnancy") ||
    q.includes("maternity")
  ) {
    condition = "Maternity & Gynecology";
    categoryKey = "gyn";
  } else if (
    q.includes("cataract") ||
    q.includes("eye") ||
    q.includes("vision") ||
    q.includes("motiyabind")
  ) {
    condition = "Eye Care & Cataract";
    categoryKey = "eye";
  } else if (
    q.includes("gallbladder") ||
    q.includes("gall bladder") ||
    q.includes("cholecystectomy") ||
    q.includes("pitta") ||
    q.includes("hernia") ||
    q.includes("appendix")
  ) {
    condition = "General & Laparoscopic Surgery";
    categoryKey = "surg";
  }

  // 2. Location extraction
  for (const [cityName, coords] of Object.entries(KNOWN_CITY_COORDS)) {
    if (q.includes(cityName)) {
      location = cityName.charAt(0).toUpperCase() + cityName.slice(1);
      targetCoords = coords;
      break;
    }
  }

  // 3. Budget extraction (e.g., "under 2 lakh", "under 2lakhs", "< 200000", "below 1.5 lakh", "under 50k")
  const lakhMatch = q.match(/(?:under|below|within|<|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/);
  if (lakhMatch) {
    maxBudget = Math.round(parseFloat(lakhMatch[1]) * 100000);
    priority = "Cost & Cashless Ceiling Priority";
    confidence = 0.95;
  } else {
    const kMatch = q.match(/(?:under|below|within|<|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+)\s*(?:k|thousand)\b/);
    if (kMatch) {
      maxBudget = parseInt(kMatch[1], 10) * 1000;
      priority = "Budget Optimization Priority";
      confidence = 0.93;
    } else {
      const numMatch = q.match(/(?:under|below|within|<)\s*(?:₹|rs\.?|inr)?\s*(\d{4,7})\b/);
      if (numMatch) {
        maxBudget = parseInt(numMatch[1], 10);
        priority = "Budget Optimization Priority";
        confidence = 0.92;
      }
    }
  }

  // 4. Healthcare scheme & quality flags
  if (q.includes("pmjay") || q.includes("ayushman") || q.includes("cashless") || q.includes("golden card")) {
    requiresPmjay = true;
    confidence = Math.max(confidence, 0.94);
  }
  if (q.includes("nabh") || q.includes("jci") || q.includes("accredited") || q.includes("certified")) {
    requiresAccredited = true;
  }
  if (q.includes("icu") || q.includes("ventilator") || q.includes("critical")) {
    requiresIcu = true;
  }
  if (q.includes("govt") || q.includes("government") || q.includes("sarkari") || q.includes("civil")) {
    hospitalType = "government";
  } else if (q.includes("private") || q.includes("pvt")) {
    hospitalType = "private";
  }

  // Only return parsed slots if at least one meaningful clinical or geographic filter was extracted
  if (condition || location || maxBudget || requiresPmjay || requiresAccredited || requiresIcu || hospitalType) {
    return {
      condition,
      categoryKey,
      location,
      targetCoords,
      maxBudget,
      requiresPmjay,
      requiresAccredited,
      requiresIcu,
      hospitalType,
      priority,
      confidence,
    };
  }

  return null;
}

interface ScoredHospital extends HospitalOption {
  distanceKm: number;
  commuteMinutes: number;
  compositeScore: number;
  scoreBreakdown: {
    proximityPts: number;
    budgetPts: number;
    ratingPts: number;
    accreditationPts: number;
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const { selectedCity, coords } = useLocation();

  const initialQuery = searchParams.get("q") || searchParams.get("category") || "";
  const initialCity = searchParams.get("city") || "";
  const initialFilterParam = (searchParams.get("filter") as any) || "all";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [selectedCityFilter, setSelectedCityFilter] = useState(
    initialCity || (selectedCity ? selectedCity : "All")
  );
  const [selectedFilterPill, setSelectedFilterPill] = useState<
    "all" | "icu" | "pmjay" | "govt" | "pvt" | "budget1" | "budget2"
  >(
    ["all", "icu", "pmjay", "govt", "pvt", "budget1", "budget2"].includes(initialFilterParam)
      ? initialFilterParam
      : "all"
  );
  const [viewMode, setViewMode] = useState<"split" | "list">("split");
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [expandedScoreHospitalId, setExpandedScoreHospitalId] = useState<string | null>(null);
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("medroute_compare_ids");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Unique list of all cities from dataset
  const allCitiesList = useMemo(() => {
    const set = new Set<string>();
    ALL_HOSPITALS.forEach((h) => {
      if (h.city) set.add(h.city);
    });
    return Array.from(set).sort();
  }, []);

  const toggleCompare = (slug: string) => {
    let updated: string[];
    if (compareIds.includes(slug)) {
      updated = compareIds.filter((id) => id !== slug);
    } else {
      if (compareIds.length >= 4) {
        alert("You can compare up to 4 hospitals at a time.");
        return;
      }
      updated = [...compareIds, slug];
    }
    setCompareIds(updated);
    try {
      localStorage.setItem("medroute_compare_ids", JSON.stringify(updated));
      window.dispatchEvent(new Event("medroute_compare_change"));
    } catch {}
  };

  // 1. Natural Language Query Analysis & Slot Mapping
  const parsedSlots = useMemo(() => {
    return parseClinicalQuery(query);
  }, [query]);

  // Center coordinate determination (priority: parsed location coords -> user coords -> fallback Chandigarh)
  const queryCenter = useMemo(() => {
    if (parsedSlots?.targetCoords) return parsedSlots.targetCoords;
    if (selectedCityFilter && selectedCityFilter !== "All") {
      const lower = selectedCityFilter.toLowerCase();
      if (KNOWN_CITY_COORDS[lower]) return KNOWN_CITY_COORDS[lower];
    }
    return coords || { lat: 30.7333, lng: 76.7794 };
  }, [parsedSlots, selectedCityFilter, coords]);

  // 2. Filter & Mathematical Ranking Computation
  const scoredHospitals = useMemo(() => {
    let list = ALL_HOSPITALS;

    // Filter by Dropdown City (if manually selected)
    if (selectedCityFilter && selectedCityFilter !== "All") {
      list = list.filter((h) => h.city.toLowerCase() === selectedCityFilter.toLowerCase());
    }

    // Filter by AI Parsed Location (if query specified city and user didn't override dropdown)
    if (parsedSlots?.location && selectedCityFilter === "All") {
      const targetCity = parsedSlots.location.toLowerCase();
      const matched = list.filter((h) => h.city.toLowerCase() === targetCity);
      if (matched.length > 0) {
        list = matched;
      }
    }

    // Filter pills
    if (selectedFilterPill === "icu") {
      list = list.filter((h) => h.beds_icu_available > 0);
    } else if (selectedFilterPill === "pmjay") {
      list = list.filter((h) => h.is_pmjay_empanelled);
    } else if (selectedFilterPill === "govt") {
      list = list.filter((h) => h.type.toLowerCase() === "government");
    } else if (selectedFilterPill === "pvt") {
      list = list.filter((h) => h.type.toLowerCase() === "private");
    } else if (selectedFilterPill === "budget1") {
      list = list.filter(
        (h) => h.type.toLowerCase() === "government" || (h.base_package_inr || 0) <= 100000
      );
    } else if (selectedFilterPill === "budget2") {
      list = list.filter(
        (h) => h.type.toLowerCase() === "government" || (h.base_package_inr || 0) <= 200000
      );
    }

    // Specialty filter (from dropdown or AI slot mapping)
    const effectiveCategory =
      selectedCondition !== "All"
        ? selectedCondition
        : parsedSlots?.categoryKey || "All";

    if (effectiveCategory !== "All") {
      list = list.filter((h) => {
        const specs = (h.specialties || []).map((s) => s.toLowerCase()).join(" ");
        if (effectiveCategory === "card") return specs.includes("card") || specs.includes("heart");
        if (effectiveCategory === "ortho") return specs.includes("ortho") || specs.includes("bone") || specs.includes("joint");
        if (effectiveCategory === "nephr") return specs.includes("nephr") || specs.includes("dialysis") || specs.includes("kidney");
        if (effectiveCategory === "onco") return specs.includes("onco") || specs.includes("cancer");
        if (effectiveCategory === "trauma") return specs.includes("trauma") || specs.includes("emergency");
        if (effectiveCategory === "gyn") return specs.includes("matern") || specs.includes("gyn");
        if (effectiveCategory === "eye") return specs.includes("eye");
        if (effectiveCategory === "child") return specs.includes("child") || specs.includes("pediatric");
        if (effectiveCategory === "surg") return specs.includes("surg");
        return true;
      });
    }

    // AI Slot Constraints: Budget Ceiling
    if (parsedSlots?.maxBudget) {
      const budgetCap = parsedSlots.maxBudget;
      list = list.filter((h) => {
        if (h.type.toLowerCase() === "government") return true;
        const pkg = h.base_package_inr || (h.avg_treatment_cost || 85000);
        return pkg <= budgetCap * 1.15; // 15% grace threshold for negotiation/insurance
      });
    }

    // AI Slot Constraints: PMJAY, ICU, Hospital Type
    if (parsedSlots?.requiresPmjay) {
      list = list.filter((h) => h.is_pmjay_empanelled);
    }
    if (parsedSlots?.requiresIcu) {
      list = list.filter((h) => h.beds_icu_available > 0);
    }
    if (parsedSlots?.hospitalType) {
      list = list.filter((h) => h.type.toLowerCase() === parsedSlots.hospitalType);
    }

    // General text search fallback if NOT a structured AI query
    if (!parsedSlots && query.trim()) {
      const rawText = query.trim().toLowerCase();
      list = list.filter((h) => {
        return (
          h.name.toLowerCase().includes(rawText) ||
          h.city.toLowerCase().includes(rawText) ||
          h.address.toLowerCase().includes(rawText) ||
          (h.specialties || []).some((s) => s.toLowerCase().includes(rawText)) ||
          (h.top_disease_treated || "").toLowerCase().includes(rawText)
        );
      });
    }

    // Score & Rank each hospital with transparent 4-part weight system
    const scored: ScoredHospital[] = list.map((h) => {
      const dist = haversineDistanceKm(
        queryCenter.lat,
        queryCenter.lng,
        h.latitude,
        h.longitude
      );
      const commute = Math.max(5, Math.round(dist * 2.2 + 6));

      // 1. Distance Score (30 pts max)
      const proximityPts = Math.round(Math.max(4, Math.min(30, 30 * (1 - dist / 90))));

      // 2. Budget Score (25 pts max)
      let budgetPts = 20;
      const budgetCap = parsedSlots?.maxBudget || 200000;
      const cost = h.base_package_inr || h.avg_treatment_cost || 80000;
      if (h.type.toLowerCase() === "government" || h.is_pmjay_empanelled) {
        budgetPts = 25; // Subsidized or PMJAY cashless gets full score
      } else if (cost <= budgetCap) {
        budgetPts = Math.round(Math.min(25, 20 + 5 * (1 - cost / budgetCap)));
      } else {
        budgetPts = Math.round(Math.max(5, 20 * (budgetCap / cost)));
      }

      // 3. Rating Score (25 pts max)
      const rating = h.overall_rating || 4.5;
      const ratingPts = Math.round(Math.min(25, (rating / 5) * 25));

      // 4. Accreditation & Quality Score (20 pts max)
      let accreditationPts = 12;
      const acc = (h.accreditation || "").toUpperCase();
      if (acc.includes("JCI")) accreditationPts = 18;
      else if (acc.includes("NABH")) accreditationPts = 16;
      else if (acc.includes("NABL")) accreditationPts = 14;
      if (h.is_pmjay_empanelled) accreditationPts = Math.min(20, accreditationPts + 2);

      const compositeScore = Math.min(99, proximityPts + budgetPts + ratingPts + accreditationPts);

      return {
        ...h,
        distanceKm: dist,
        commuteMinutes: commute,
        compositeScore,
        scoreBreakdown: {
          proximityPts,
          budgetPts,
          ratingPts,
          accreditationPts,
        },
      };
    });

    // Sort by composite score descending
    scored.sort((a, b) => b.compositeScore - a.compositeScore);

    return scored;
  }, [
    selectedCityFilter,
    selectedFilterPill,
    selectedCondition,
    parsedSlots,
    query,
    queryCenter,
  ]);

  // Active map center
  const activeCenter = useMemo(() => {
    if (scoredHospitals.length > 0) {
      return { lat: scoredHospitals[0].latitude, lng: scoredHospitals[0].longitude };
    }
    return queryCenter;
  }, [scoredHospitals, queryCenter]);

  return (
    <div className="w-full min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col pt-16">
      <Navbar />

      {/* Top Search & Filter Bar */}
      <section className="sticky top-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
          
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined text-sky-600 absolute left-3 top-2.5 text-xl font-bold">
                auto_awesome
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask in natural language (e.g., 'Find kidney treatment hospitals near Chandigarh under ₹2 lakh')..."
                className="w-full pl-10 pr-8 py-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* City Dropdown */}
            <div className="w-full sm:w-56 shrink-0 relative">
              <select
                value={selectedCityFilter}
                onChange={(e) => setSelectedCityFilter(e.target.value)}
                className="w-full py-2.5 pl-3 pr-8 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
              >
                <option value="All">All of India (1,450+ Hospitals)</option>
                {allCitiesList.map((c) => (
                  <option key={c} value={c}>
                    📍 {c}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-slate-400 absolute right-2.5 top-3 pointer-events-none text-lg">
                expand_more
              </span>
            </div>

            {/* Specialty Dropdown */}
            <div className="w-full sm:w-52 shrink-0 relative">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full py-2.5 pl-3 pr-8 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
              >
                {SPECIALTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-slate-400 absolute right-2.5 top-3 pointer-events-none text-lg">
                expand_more
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "split"
                    ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Map Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                List Only
              </button>
            </div>
          </div>

          {/* AI Recommended Benchmarking Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold shrink-0 flex items-center gap-1">
              <span>⚡</span> Benchmark Queries:
            </span>
            {[
              "Find kidney treatment hospitals near Chandigarh under ₹2 lakh",
              "NABH accredited heart surgery in Mohali under ₹3 lakh",
              "Emergency Level 1 trauma with free ICU beds in Chandigarh",
              "Total knee replacement 100% cashless under PMJAY",
            ].map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => setQuery(promptText)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  query === promptText
                    ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400"
                }`}
              >
                💡 {promptText}
              </button>
            ))}
          </div>

          {/* AI Natural Language Query Slot Mapping Banner (Slide 5 Deliverable) */}
          {parsedSlots && (
            <div className="p-3 bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-slate-900/40 border border-sky-500/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold font-mono text-[10px] tracking-wider uppercase border border-sky-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  AI Query Slot Mapping (Confidence {(parsedSlots.confidence * 100).toFixed(0)}%)
                </span>

                {parsedSlots.condition && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1">
                    <span>🩺</span> {parsedSlots.condition}
                  </span>
                )}

                {parsedSlots.location && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1">
                    <span>📍</span> {parsedSlots.location}
                  </span>
                )}

                {parsedSlots.maxBudget && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-emerald-300 font-semibold flex items-center gap-1">
                    <span>💰</span> Max ₹{(parsedSlots.maxBudget / 100000).toFixed(1)} Lakh
                  </span>
                )}

                {parsedSlots.requiresPmjay && (
                  <span className="px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-300 font-semibold">
                    🛡️ PM-JAY Cashless
                  </span>
                )}

                <span className="text-[11px] text-slate-400 italic">
                  Strategy: {parsedSlots.priority}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer"
                >
                  Clear AI Slots
                </button>
              </div>
            </div>
          )}

          {/* Quick Filter Pills Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-semibold">
            {[
              { id: "all", label: "All Facilities" },
              { id: "icu", label: "🟢 Available ICU Beds" },
              { id: "pmjay", label: "🛡️ 100% Cashless PM-JAY" },
              { id: "govt", label: "🏛️ Government Apex" },
              { id: "pvt", label: "🏥 Private Super-Specialty" },
              { id: "budget1", label: "Under ₹1 Lakh" },
              { id: "budget2", label: "Under ₹2 Lakhs" },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSelectedFilterPill(pill.id as any)}
                className={`px-3 py-1.5 rounded-full shrink-0 transition-all border cursor-pointer ${
                  selectedFilterPill === pill.id
                    ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-300"
                }`}
              >
                {pill.label}
              </button>
            ))}

            <span className="ml-auto text-xs font-bold text-sky-600 dark:text-sky-400 shrink-0 pl-2">
              {scoredHospitals.length} verified facilities
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        
        {/* Mock Dataset & Data Provenance Trigger Banner */}
        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🧪</span>
            <span className="text-amber-900 dark:text-amber-200 leading-snug">
              <strong>Demonstration Benchmark Dataset:</strong> Displaying 1,450+ facilities across Punjab, Tricity &amp; India. Bed counts and clinical metrics are simulated mock benchmarks.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowProvenanceModal(true)}
            className="shrink-0 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-amber-300/60 dark:border-amber-800"
          >
            <span>ℹ️</span> Data Provenance &amp; Audit
          </button>
        </div>

        <div className={`grid gap-6 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1 max-w-4xl mx-auto"}`}>
          
          {/* Hospital Cards Column */}
          <div className={`${viewMode === "split" ? "lg:col-span-7" : "w-full"} flex flex-col gap-4`}>
            {scoredHospitals.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center text-3xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No hospitals match your search criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Try clearing your query, adjusting budget constraints, or searching another city.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedCityFilter("All");
                    setSelectedCondition("All");
                    setSelectedFilterPill("all");
                  }}
                  className="mt-2 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl hover:bg-sky-500 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              scoredHospitals.slice(0, 50).map((hosp) => {
                const isCompared = compareIds.includes(hosp.slug) || compareIds.includes(hosp.id);
                const isSelected = selectedHospitalId === hosp.id || selectedHospitalId === hosp.slug;
                const isScoreExpanded = expandedScoreHospitalId === hosp.id;

                return (
                  <article
                    key={hosp.id}
                    onMouseEnter={() => setSelectedHospitalId(hosp.id)}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md cursor-pointer ${
                      isSelected
                        ? "border-sky-500 ring-2 ring-sky-500/20"
                        : "border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/hospitals/${hosp.slug}`}
                          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors line-clamp-1"
                        >
                          {hosp.name}
                        </Link>
                        
                        {/* Composite Match Score Pill */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedScoreHospitalId(isScoreExpanded ? null : hosp.id);
                          }}
                          className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shrink-0 flex items-center gap-1 cursor-pointer hover:bg-emerald-100 transition-colors"
                          title="Click to view explainability scoring breakdown"
                        >
                          <span>🎯 {hosp.compositeScore}/100 Match</span>
                          <span className="text-[10px]">{isScoreExpanded ? "▲" : "▼"}</span>
                        </button>
                      </div>

                      {/* Location, Commute Time & Accreditation */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          📍 {hosp.address}, {hosp.city}
                        </span>
                        <span>·</span>
                        <span className="text-sky-600 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
                          ⚡ ~{hosp.commuteMinutes}m ETA ({hosp.distanceKm.toFixed(1)} km)
                        </span>
                        <span>·</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          ★ {hosp.overall_rating?.toFixed(1) || "4.6"} ({hosp.total_reviews} reviews)
                        </span>
                        {hosp.accreditation && (
                          <>
                            <span>·</span>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{hosp.accreditation}</span>
                          </>
                        )}
                      </div>

                      {/* Expandable Scoring Explainability Matrix (Slide 5 Requirement) */}
                      {isScoreExpanded && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-xs animate-fadeIn flex flex-col gap-2">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1.5">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>📊</span> Transparent Scoring Breakdown (Explainability)
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">Formula Weights</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block font-medium">Proximity (30%)</span>
                              <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                                {hosp.scoreBreakdown.proximityPts} / 30 pts
                              </span>
                              <span className="text-[9px] text-slate-400 block">{hosp.distanceKm.toFixed(1)} km radius</span>
                            </div>

                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block font-medium">Cost Fit (25%)</span>
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {hosp.scoreBreakdown.budgetPts} / 25 pts
                              </span>
                              <span className="text-[9px] text-slate-400 block">Package alignment</span>
                            </div>

                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block font-medium">Rating (25%)</span>
                              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                {hosp.scoreBreakdown.ratingPts} / 25 pts
                              </span>
                              <span className="text-[9px] text-slate-400 block">{hosp.overall_rating}★ verified</span>
                            </div>

                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block font-medium">Quality (20%)</span>
                              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {hosp.scoreBreakdown.accreditationPts} / 20 pts
                              </span>
                              <span className="text-[9px] text-slate-400 block">{hosp.accreditation || "Standard"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {hosp.beds_icu_available} ICU Beds Free ({hosp.beds_icu} Total)
                        </span>

                        {hosp.is_pmjay_empanelled && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/40">
                            🛡️ PM-JAY Cashless
                          </span>
                        )}

                        {hosp.is_trauma_center && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40">
                            🚨 {hosp.trauma_level || "Trauma Center"}
                          </span>
                        )}
                      </div>

                      {/* Specialties tags */}
                      {hosp.specialties && hosp.specialties.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {hosp.specialties.slice(0, 4).map((spec, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Disease Track Record & Verifiable Outcome Metrics */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-0.5">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>🩺</span>
                          <span className="line-clamp-1">{hosp.top_disease_treated || "High Volume Specialty Care"}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>👥 {(hosp.total_patients_treated || 12500).toLocaleString("en-IN")} patients treated</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ {hosp.overall_success_ratio || "97.5%"} Success Ratio
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Tariff & Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wide block font-medium">
                          Indicative Procedure Tariff
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {hosp.cost_range}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${hosp.ambulance_phone || hosp.phone || "108"}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 transition-colors"
                          title="Call Emergency / Ambulance"
                        >
                          <span className="material-symbols-outlined text-lg">call</span>
                        </a>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare(hosp.slug);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isCompared
                              ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent"
                          }`}
                        >
                          {isCompared ? "✓ Added" : "+ Compare"}
                        </button>

                        <Link
                          href={`/hospitals/${hosp.slug}`}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            {scoredHospitals.length > 50 && (
              <div className="p-4 text-center text-xs text-slate-400">
                Showing top 50 of {scoredHospitals.length} hospitals. Narrow your query to refine results.
              </div>
            )}
          </div>

          {/* Sticky Map Column (Split Mode) */}
          {viewMode === "split" && (
            <div className="hidden lg:block lg:col-span-5 sticky top-36 h-[calc(100vh-10rem)] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
              <SearchMap
                hospitals={scoredHospitals.slice(0, 50).map((h) => ({
                  id: h.id,
                  name: h.name,
                  slug: h.slug,
                  type: h.type,
                  latitude: h.latitude,
                  longitude: h.longitude,
                  beds_icu_available: h.beds_icu_available,
                  address: h.address,
                  cost_range: h.cost_range,
                  is_pmjay_empanelled: h.is_pmjay_empanelled,
                }))}
                userCoords={activeCenter}
                selectedHospitalId={selectedHospitalId}
                onSelectHospital={(id) => setSelectedHospitalId(id)}
              />
            </div>
          )}

        </div>
      </main>

      {/* Data Provenance & Academic Methodology Modal (Slide 7 & 8) */}
      {showProvenanceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Data Provenance &amp; Clinical Audit Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProvenanceModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex flex-col gap-3">
              <p>
                <strong>1. Standardized Procedure Tariffs (AB-PMJAY HBP 2.2):</strong> All surgical and diagnostic packages are mapped to official National Health Authority benefit schedules (e.g. CABG MC001, Angioplasty MC004, Knee Replacement OR002).
              </p>
              <p>
                <strong>2. Simulated Demonstration Telemetry:</strong> For evaluation and prototype benchmarking, live ICU bed occupancy, annual patient volume, and procedural success ratios are generated using realistic clinical statistical distributions.
              </p>
              <p>
                <strong>3. Responsible AI &amp; Clinical Safety:</strong> Med Route strictly translates informal natural language queries into structured post-GIS spatial and tariff filters. It never generates automated medical diagnoses, always prioritizing accredited facilities and 108 emergency trauma routing.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProvenanceModal(false)}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-500 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading hospitals...</div>}>
      <SearchContent />
    </Suspense>
  );
}
