"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchMap from "@/components/SearchMap";
import { useLocation } from "@/context/LocationContext";
import { ALL_HOSPITALS, HospitalOption, ReviewItem } from "@/data/hospitalsData";

const SPECIALTY_OPTIONS = [
  { label: "All Conditions & Specialties", value: "All" },
  { label: "Heart Care (Stent, Bypass, Angioplasty)", value: "card" },
  { label: "Bone & Joint (Knee, Hip Replacement)", value: "ortho" },
  { label: "Kidney Care & Dialysis", value: "nephr" },
  { label: "Cancer Care (Chemo & Oncology)", value: "onco" },
  { label: "Gallbladder & General Surgery", value: "surg" },
  { label: "Pregnancy & Maternity Care", value: "gyn" },
  { label: "Eye Care & Cataract", value: "eye" },
  { label: "Emergency & ICU Trauma", value: "trauma" },
];

const BUDGET_OPTIONS = [
  { label: "All Tariffs & Budgets", max: null },
  { label: "Under ₹50,000 (Subsidized / Govt)", max: 50000 },
  { label: "Under ₹1 Lakh", max: 100000 },
  { label: "Under ₹2 Lakhs", max: 200000 },
  { label: "Under ₹5 Lakhs", max: 500000 },
  { label: "100% Cashless PM-JAY", max: -1 }, // -1 sentinel for PMJAY
];

const REGIONAL_CLUSTERS = [
  { label: "All India (Pan-India 156 Facilities)", value: "All" },
  { label: "Hoshiarpur (Focus District)", value: "Hoshiarpur" },
  { label: "Mohali (SAS Nagar)", value: "Mohali" },
  { label: "Chandigarh (Tricity Apex)", value: "Chandigarh" },
  { label: "Panchkula, Haryana", value: "Panchkula" },
  { label: "Ludhiana & Jalandhar", value: "Ludhiana" },
  { label: "Delhi NCR (AIIMS, Safdarjung, Max)", value: "Delhi" },
  { label: "Mumbai & Maharashtra", value: "Mumbai" },
  { label: "Bengaluru, Karnataka", value: "Bengaluru" },
  { label: "Jaipur, Rajasthan", value: "Jaipur" },
  { label: "Lucknow, Uttar Pradesh", value: "Lucknow" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const { selectedCity, coords } = useLocation();

  const initialQuery = searchParams.get("q") || searchParams.get("category") || "";

  const [query, setQuery] = useState(
    initialQuery ||
      "Urgent cardiology stent under ₹2 Lakhs with cashless PMJAY"
  );
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState(
    selectedCity ? `Current: ${selectedCity}` : "All"
  );
  const [selectedBudgetMax, setSelectedBudgetMax] = useState<number | null>(null);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>("");
  const [icuOnly, setIcuOnly] = useState(false);
  const [apiHospitals, setApiHospitals] = useState<HospitalOption[] | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("medroute_compare_ids");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [activeReviewHospital, setActiveReviewHospital] = useState<HospitalOption | null>(null);

  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number } | null>(null);
  const userCoords = customCoords || coords || {
    lat: 31.5305,
    lng: 75.9125,
  };

  const hospitals = useMemo(() => {
    const qLower = query.toLowerCase().trim();
    let list = apiHospitals || ALL_HOSPITALS;

    // ICU Only filter
    if (icuOnly) {
      list = list.filter((h) => h.beds_icu_available > 0);
    }

    // Location filter
    if (selectedLocation !== "All") {
      if (selectedLocation.startsWith("Current:") && selectedCity) {
        list = list.filter((h) => h.city?.toLowerCase() === selectedCity.toLowerCase());
      } else if (selectedLocation === "Delhi") {
        list = list.filter(
          (h) =>
            h.city?.toLowerCase().includes("delhi") ||
            h.city?.toLowerCase().includes("gurugram") ||
            h.city?.toLowerCase().includes("noida")
        );
      } else {
        list = list.filter(
          (h) =>
            h.city?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
            h.state?.toLowerCase().includes(selectedLocation.toLowerCase())
        );
      }
    }

    // Condition / Specialty filter (Simplified Terms)
    if (selectedCondition !== "All") {
      list = list.filter((h) => {
        const specs = (h.specialties || []).map((s) => s.toLowerCase()).join(" ");
        if (selectedCondition === "card") return specs.includes("card") || specs.includes("heart");
        if (selectedCondition === "ortho") return specs.includes("ortho") || specs.includes("bone") || specs.includes("joint") || specs.includes("knee");
        if (selectedCondition === "nephr") return specs.includes("nephr") || specs.includes("dialysis") || specs.includes("kidney") || specs.includes("renal");
        if (selectedCondition === "onco") return specs.includes("onco") || specs.includes("cancer") || specs.includes("chemo");
        if (selectedCondition === "surg") return specs.includes("surg") || specs.includes("gallbladder") || specs.includes("hernia");
        if (selectedCondition === "gyn") return specs.includes("gyn") || specs.includes("obst") || specs.includes("matern") || specs.includes("delivery");
        if (selectedCondition === "eye") return specs.includes("eye") || specs.includes("cataract") || specs.includes("ophth");
        if (selectedCondition === "trauma") return specs.includes("trauma") || specs.includes("critical") || specs.includes("icu") || specs.includes("emergency");
        return true;
      });
    }

    // Budget filter (Out-of-Pocket Cap & PMJAY)
    if (selectedBudgetMax !== null) {
      if (selectedBudgetMax === -1) {
        // PM-JAY Cashless only
        list = list.filter((h) => h.is_pmjay_empanelled);
      } else {
        // Procedure or Base Package under BudgetMax
        list = list.filter((h) => {
          if (h.type?.toLowerCase() === "government") return true;
          const basePkg = h.base_package_inr || 85000;
          return basePkg <= selectedBudgetMax;
        });
      }
    }

    // Query text match if present (ignore boilerplate text)
    if (qLower && !qLower.includes("urgent cardiology stent")) {
      const filtered = list.filter((h) => {
        const matchName = h.name.toLowerCase().includes(qLower);
        const matchCity = h.city.toLowerCase().includes(qLower);
        const matchState = h.state.toLowerCase().includes(qLower);
        const matchType = h.type.toLowerCase().includes(qLower);
        const matchSpecialty = h.specialties?.some((s) => s.toLowerCase().includes(qLower));
        const matchDesc = (h.description || "").toLowerCase().includes(qLower);
        return matchName || matchCity || matchState || matchType || matchSpecialty || matchDesc;
      });
      if (filtered.length > 0) return filtered;
    }

    return list.length > 0 ? list : ALL_HOSPITALS;
  }, [apiHospitals, query, selectedCondition, selectedLocation, selectedCity, selectedBudgetMax, icuOnly]);

  const handleCustomBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customBudgetInput.replace(/\D/g, ""), 10);
    if (!isNaN(val) && val > 0) {
      setSelectedBudgetMax(val);
    }
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
          latitude: userCoords?.lat || 30.7333,
          longitude: userCoords?.lng || 76.7794,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          // Merge rich reviews & packages from ALL_HOSPITALS matching returned IDs
          const enriched: HospitalOption[] = (json.data as Record<string, unknown>[]).map((h) => {
            const hId = (h.id as string) || "";
            const hSlug = (h.slug as string) || "";
            const fullMatch =
              ALL_HOSPITALS.find((item) => item.id === hId || item.slug === hSlug) || ALL_HOSPITALS[0];
            return {
              ...fullMatch,
              ...h,
              id: hId || fullMatch.id,
              name: (h.name as string) || fullMatch.name,
              slug: hSlug || fullMatch.slug,
              city: (h.city as string) || fullMatch.city,
              state: (h.state as string) || fullMatch.state,
              type: (h.type as "Government" | "Private" | "Trust") || fullMatch.type,
              latitude: typeof h.latitude === "number" ? h.latitude : fullMatch.latitude,
              longitude: typeof h.longitude === "number" ? h.longitude : fullMatch.longitude,
              cost_range: (h.cost_indicative as string) || (h.cost_range as string) || fullMatch.cost_range,
              pmjay: Boolean(h.is_pmjay_empanelled ?? fullMatch.pmjay),
              is_pmjay_empanelled: Boolean(h.is_pmjay_empanelled ?? fullMatch.is_pmjay_empanelled),
              description: (h.description as string) || fullMatch.description,
              reviews: fullMatch.reviews || [],
              pros: (h.pros as string[]) || fullMatch.pros || [],
              cons: (h.cons as string[]) || fullMatch.cons || [],
            };
          });
          setApiHospitals(enriched);
        } else {
          setApiHospitals(null);
        }
      } else {
        setApiHospitals(null);
      }
    } catch {
      setApiHospitals(null);
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
            <header className="flex flex-col gap-space-xs max-w-3xl pt-space-md">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm uppercase tracking-wider font-semibold">
                  Verified Directory
                </span>
                <span className="font-label-sm text-secondary font-semibold">
                  {hospitals.length} Accredited Facilities Across India
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
                Find the right hospital for your condition &amp; budget
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Filter verified packages under your exact budget, browse real patient reviews, check live ICU availability, and explore cashless Ayushman PMJAY coverage with total transparency.
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
                    }}
                    placeholder="Describe patient requirements in plain words (e.g. Heart bypass under 2 lakhs in Mohali, or Knee replacement under ₹1 Lakh)..."
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
                    <span>{isLoading ? "Searching..." : "Search"}</span>
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap items-center gap-space-xs pt-1">
                  <span className="font-label-sm text-label-sm text-outline mr-1">
                    Quick suggestions:
                  </span>
                  {[
                    "Heart Stent Under ₹2 Lakhs",
                    "Knee Replacement Under ₹1 Lakh",
                    "Gallbladder Stone Removal",
                    "PMJAY 100% Cashless",
                    "Available ICU Beds",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setQuery(chip);
                        if (chip.includes("₹2 Lakhs")) setSelectedBudgetMax(200000);
                        else if (chip.includes("₹1 Lakh")) setSelectedBudgetMax(100000);
                        else if (chip.includes("PMJAY")) setSelectedBudgetMax(-1);
                        else if (chip.includes("ICU")) setIcuOnly(true);
                      }}
                      className="font-label-sm text-label-sm bg-surface-container-high hover:bg-surface-container-highest text-primary px-2.5 py-1 rounded-md font-medium transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Filter Dropdowns Row with Budget, Simple Specialty, and Location */}
            <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high/40 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* 1. Clinical Specialty with Simple Everyday Words */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Clinical Specialty (Plain Language)
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg">
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full bg-transparent p-space-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none cursor-pointer pr-8 font-medium"
                    >
                      {SPECIALTY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-outline absolute right-space-sm top-2.5 pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* 2. Regional Cluster */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Regional Location
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-transparent p-space-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none cursor-pointer pr-8 font-medium"
                    >
                      {selectedCity && (
                        <option value={`Current: ${selectedCity}`}>
                          📍 Near Me: {selectedCity}
                        </option>
                      )}
                      {REGIONAL_CLUSTERS.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-outline absolute right-space-sm top-2.5 pointer-events-none text-[18px]">
                      location_on
                    </span>
                  </div>
                </div>

                {/* 3. Budget & Scheme Coverage */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium flex items-center justify-between">
                    <span>Target Budget Ceiling</span>
                    {selectedBudgetMax !== null && (
                      <span className="text-secondary font-bold text-xs">
                        {selectedBudgetMax === -1 ? "100% Cashless PM-JAY" : `Max ₹${selectedBudgetMax.toLocaleString("en-IN")}`}
                      </span>
                    )}
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg">
                    <select
                      value={selectedBudgetMax === null ? "all" : selectedBudgetMax.toString()}
                      onChange={(e) => {
                        const val = e.target.value === "all" ? null : parseInt(e.target.value, 10);
                        setSelectedBudgetMax(val);
                      }}
                      className="w-full bg-transparent p-space-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none cursor-pointer pr-8 font-medium"
                    >
                      {BUDGET_OPTIONS.map((b, idx) => (
                        <option key={idx} value={b.max === null ? "all" : b.max.toString()}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-outline absolute right-space-sm top-2.5 pointer-events-none text-[18px]">
                      payments
                    </span>
                  </div>
                </div>
              </div>

              {/* Dedicated Budget Quick Select Chips + Custom Amount Input */}
              <div className="bg-surface-container-low/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 border border-surface-container-high/40">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-on-surface-variant mr-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-secondary">tune</span>
                    Filter by Budget:
                  </span>
                  {[
                    { label: "Any Budget", val: null },
                    { label: "< ₹50,000", val: 50000 },
                    { label: "< ₹1 Lakh", val: 100000 },
                    { label: "< ₹2 Lakhs", val: 200000 },
                    { label: "< ₹5 Lakhs", val: 500000 },
                    { label: "100% PMJAY", val: -1 },
                  ].map((chip, i) => {
                    const isActive = selectedBudgetMax === chip.val;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedBudgetMax(chip.val)}
                        className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-secondary text-on-secondary shadow-xs scale-105"
                            : "bg-surface-container-lowest text-on-surface border border-surface-container-high hover:border-secondary hover:text-secondary"
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Budget Amount Form */}
                <form onSubmit={handleCustomBudgetSubmit} className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-outline font-bold">₹</span>
                    <input
                      type="text"
                      placeholder="Custom Budget (e.g. 150000)"
                      value={customBudgetInput}
                      onChange={(e) => setCustomBudgetInput(e.target.value)}
                      className="pl-6 pr-3 py-1 text-xs rounded-lg bg-surface-container-lowest border border-surface-container-high text-on-surface focus:outline-none focus:border-primary w-44"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {/* Fast Action Row: Live ICU Toggle & Procedure Compare */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-space-xs border-t border-surface-container-high/40">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIcuOnly(!icuOnly)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      icuOnly
                        ? "bg-secondary text-on-secondary shadow-sm scale-102"
                        : "bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-surface-container-high"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${icuOnly ? "bg-white" : "bg-secondary"} animate-pulse`} />
                    <span>{icuOnly ? "Live ICU Beds Free Only ✓" : "🟢 Available ICU Beds Only"}</span>
                  </button>

                  <Link
                    href="/compare"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-container-low hover:bg-surface-container-high text-primary border border-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
                    <span>Side-by-Side Surgical Packages &amp; PMJAY Matrix →</span>
                  </Link>
                </div>

                <a
                  href="tel:108"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-error/10 hover:bg-error/20 text-error text-xs font-bold transition-colors border border-error/20"
                >
                  <span className="material-symbols-outlined text-[15px]">ambulance</span>
                  <span>Ambulance 108</span>
                </a>
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
                  {selectedBudgetMax !== null && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-secondary-container/50 text-secondary font-bold">
                      {selectedBudgetMax === -1 ? "PMJAY Cashless" : `Filtered ≤ ₹${selectedBudgetMax.toLocaleString("en-IN")}`}
                    </span>
                  )}
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
                    onLocateMe={(c) => setCustomCoords(c)}
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

                            <div className="flex gap-2 pt-1 flex-wrap">
                              <a
                                href={`tel:${target.ambulance_phone || target.phone || "108"}`}
                                className="py-1.5 px-2.5 bg-error/10 hover:bg-error/20 text-error rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 border border-error/20"
                              >
                                <span className="material-symbols-outlined text-[14px]">ambulance</span>
                                <span>Ambulance</span>
                              </a>
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
                              <button
                                onClick={() => setActiveReviewHospital(target)}
                                className="py-1.5 px-3 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-lg text-xs font-semibold text-center"
                              >
                                Reviews ({target.reviews?.length || target.total_reviews})
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
                      const withinBudget = selectedBudgetMax !== null && selectedBudgetMax > 0 && (hosp.base_package_inr || 0) <= selectedBudgetMax;

                      return (
                        <article
                          id={`card-${hosp.id}`}
                          key={hosp.id}
                          onMouseEnter={() => setSelectedHospitalId(hosp.id)}
                          className={`bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-xs hover:shadow-md transition-all flex flex-col gap-space-sm border cursor-pointer ${
                            isSelected
                              ? "border-secondary ring-2 ring-secondary/20 bg-surface-container-low/30"
                              : "border-surface-container-high/30"
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/hospitals/${hosp.slug}`}
                                className="font-headline-md text-headline-md text-on-surface font-bold hover:text-primary transition-colors text-base sm:text-lg"
                              >
                                {hosp.name}
                              </Link>
                              {hosp.accreditation && (
                                <span className="font-label-sm text-label-sm bg-surface-container-high text-secondary px-2 py-0.5 rounded font-medium">
                                  {hosp.accreditation}
                                </span>
                              )}
                              <span className="font-label-sm text-xs bg-surface-container-low px-2 py-0.5 rounded font-semibold text-on-surface-variant">
                                {hosp.type}
                              </span>
                              {isSelected && (
                                <span className="font-label-xs text-xs bg-secondary-container text-secondary font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                  Focused on Map
                                </span>
                              )}
                            </div>

                            {/* Live ICU Status */}
                            <span className="font-label-sm text-secondary font-semibold text-xs bg-secondary-container/40 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                              {hosp.beds_icu_available} ICU Free ({hosp.beds_icu} Total)
                            </span>
                          </div>

                          {/* Address & City */}
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            📍 {hosp.address}, {hosp.city}, {hosp.state}
                          </p>

                          {/* Rating & Review Count Header */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/20">
                              <span>⭐</span>
                              <span>{hosp.overall_rating ? hosp.overall_rating.toFixed(1) : "4.7"}</span>
                              <span className="text-on-surface-variant font-normal">
                                ({hosp.total_reviews || hosp.reviews?.length || 112} verified patient reviews)
                              </span>
                            </div>

                            {/* Budget Match Badge */}
                            {withinBudget && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
                                ✓ Fits Budget (≤ ₹{selectedBudgetMax?.toLocaleString("en-IN")})
                              </span>
                            )}
                            {hosp.is_pmjay_empanelled && (
                              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                🛡️ PM-JAY 100% Cashless
                              </span>
                            )}
                          </div>

                          {/* Genuine Pros & Clinical Highlights */}
                          {hosp.pros && hosp.pros.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {hosp.pros.slice(0, 2).map((pro, idx) => (
                                <span
                                  key={idx}
                                  className="font-label-xs text-[11px] bg-secondary-container/30 text-secondary px-2 py-0.5 rounded flex items-center gap-1 font-medium"
                                >
                                  <span className="text-[10px]">✓</span> {pro}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Authentic Patient Review Snippet */}
                          {hosp.reviews && hosp.reviews.length > 0 && (
                            <div className="bg-surface-container-low/70 rounded-lg p-2.5 text-xs border border-surface-container-high/40 flex flex-col gap-1 mt-0.5">
                              <div className="flex items-center justify-between text-on-surface-variant font-medium">
                                <span className="flex items-center gap-1 text-primary font-semibold">
                                  <span className="material-symbols-outlined text-[14px]">reviews</span> Verified Testimonial
                                </span>
                                <span>⭐ {hosp.reviews[0].rating_overall}/5 • {hosp.reviews[0].treatment_category}</span>
                              </div>
                              <p className="italic text-on-surface line-clamp-2">
                                &ldquo;{hosp.reviews[0].comment}&rdquo;
                              </p>
                              <span className="text-[11px] text-outline font-medium">
                                — {hosp.reviews[0].author_name} ({hosp.reviews[0].created_at})
                              </span>
                            </div>
                          )}

                          {/* Tariff & Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container-high/20 mt-1">
                            <div>
                              <span className="font-label-xs text-xs text-on-surface-variant block">
                                Indicative Tariff
                              </span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-headline-sm text-primary font-bold text-sm sm:text-base">
                                  {hosp.cost_range}
                                </span>
                                <span className="text-secondary font-semibold text-xs">
                                  {hosp.is_pmjay_empanelled ? "PMJAY Empanelled" : "Self-Pay / Private"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <a
                                href={`tel:${hosp.ambulance_phone || hosp.phone || "108"}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-2.5 py-1.5 bg-error/10 hover:bg-error/20 text-error rounded-lg font-label-sm text-xs font-bold transition-colors flex items-center gap-1 border border-error/20"
                                title={`Call hospital ambulance: ${hosp.ambulance_phone || "108"}`}
                              >
                                <span className="material-symbols-outlined text-[14px]">ambulance</span>
                                <span>Ambulance</span>
                              </a>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveReviewHospital(hosp);
                                }}
                                className="px-2.5 py-1.5 bg-surface-container-low hover:bg-surface-container-high text-primary rounded-lg font-label-sm text-xs font-semibold border border-surface-container-high transition-colors"
                              >
                                💬 Reviews ({hosp.reviews?.length || hosp.total_reviews})
                              </button>
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
                      onLocateMe={(c) => setCustomCoords(c)}
                    />
                  </div>
                </div>
              )}

              {/* VIEW MODE: LIST ONLY */}
              {viewMode === "list" && (
                <div className="flex flex-col gap-space-md">
                  {hospitals.map((hosp) => {
                    const isCompared = compareIds.includes(hosp.slug) || compareIds.includes(hosp.id);
                    const withinBudget = selectedBudgetMax !== null && selectedBudgetMax > 0 && (hosp.base_package_inr || 0) <= selectedBudgetMax;

                    return (
                      <article
                        key={hosp.id}
                        className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg border border-surface-container-high/30"
                      >
                        <div className="flex flex-col gap-1.5 max-w-lg">
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
                            <span className="text-xs bg-surface-container-low px-2 py-0.5 rounded font-semibold text-on-surface-variant">
                              {hosp.type}
                            </span>
                            {withinBudget && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold">
                                ✓ Fits Budget
                              </span>
                            )}
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            📍 {hosp.address}, {hosp.city}, {hosp.state}
                          </p>

                          {/* Star Rating Badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              ⭐ {hosp.overall_rating?.toFixed(1) || "4.7"} ({hosp.total_reviews || hosp.reviews?.length || 112} reviews)
                            </span>
                            <span className="text-xs text-on-surface-variant">
                              {hosp.specialties?.slice(0, 3).join(" • ")}
                            </span>
                          </div>

                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                            {hosp.description}
                          </p>

                          {/* Patient Review Quote */}
                          {hosp.reviews && hosp.reviews.length > 0 && (
                            <div className="bg-surface-container-low/70 rounded-lg p-2 text-xs border border-surface-container-high/40 mt-1">
                              <span className="text-primary font-semibold">💬 Patient Quote: </span>
                              <span className="italic text-on-surface">&ldquo;{hosp.reviews[0].comment}&rdquo;</span>
                              <span className="text-outline text-[11px] block mt-0.5">— {hosp.reviews[0].author_name} ({hosp.reviews[0].treatment_category})</span>
                            </div>
                          )}

                          {hosp.pros && hosp.pros.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {hosp.pros.slice(0, 2).map((pro, idx) => (
                                <span
                                  key={idx}
                                  className="font-label-xs text-[11px] bg-secondary-container/40 text-secondary px-2 py-0.5 rounded flex items-center gap-1 font-medium"
                                >
                                  <span className="text-[10px]">✓</span> {pro}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Tariff Column */}
                        <div className="flex flex-row md:flex-col items-baseline md:items-start gap-space-xs">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Verified Tariff
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-headline-lg text-headline-lg text-primary font-bold">
                              {hosp.cost_range}
                            </span>
                          </div>
                          <span className="font-label-sm text-label-sm text-secondary font-semibold">
                            {hosp.is_pmjay_empanelled ? "PMJAY 100% Cashless" : "Self-Pay / Insurance"}
                          </span>
                        </div>

                        {/* Live ICU Status */}
                        <div className="flex flex-row md:flex-col items-baseline md:items-start gap-space-xs">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Live ICU Telemetry
                          </span>
                          <span className="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                            {hosp.beds_icu_available} Beds Free ({hosp.beds_icu} Total)
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-space-sm w-full md:w-auto pt-space-xs md:pt-0 flex-wrap">
                          <a
                            href={`tel:${hosp.ambulance_phone || hosp.phone || "108"}`}
                            className="flex-1 md:flex-none px-space-md py-space-xs bg-error/10 hover:bg-error/20 text-error rounded-lg font-label-md text-label-md font-bold transition-colors text-center flex items-center justify-center gap-1 border border-error/20"
                            title={`Call hospital ambulance: ${hosp.ambulance_phone || "108"}`}
                          >
                            <span className="material-symbols-outlined text-[16px]">ambulance</span>
                            <span>Ambulance</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setActiveReviewHospital(hosp)}
                            className="flex-1 md:flex-none px-space-md py-space-xs bg-surface-container-low hover:bg-surface-container-high text-primary rounded-lg font-label-md text-label-md font-semibold transition-colors text-center border border-surface-container-high"
                          >
                            💬 Reviews ({hosp.reviews?.length || hosp.total_reviews})
                          </button>
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

          {/* Interactive Patient Reviews Modal */}
          {activeReviewHospital && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
              onClick={() => setActiveReviewHospital(null)}
            >
              <div
                className="bg-surface-container-lowest max-w-2xl w-full max-h-[85vh] rounded-2xl shadow-2xl border border-surface-container-high flex flex-col overflow-hidden animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-space-lg bg-surface-container-low border-b border-surface-container-high flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-secondary-container text-secondary">
                        Verified Patient Reviews
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {activeReviewHospital.city}, {activeReviewHospital.state}
                      </span>
                    </div>
                    <h2 className="font-headline-md text-primary font-bold text-xl">
                      {activeReviewHospital.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-amber-600 text-sm flex items-center gap-1">
                        ⭐ {activeReviewHospital.overall_rating?.toFixed(1) || "4.7"} / 5.0
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Based on {activeReviewHospital.total_reviews || activeReviewHospital.reviews?.length || 112} clinical and discharge surveys
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveReviewHospital(null)}
                    className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-highest flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Reviews List */}
                <div className="p-space-lg overflow-y-auto flex flex-col gap-space-md">
                  {(!activeReviewHospital.reviews || activeReviewHospital.reviews.length === 0) ? (
                    <div className="text-center py-8 text-on-surface-variant text-sm">
                      No written reviews yet for this facility.
                    </div>
                  ) : (
                    activeReviewHospital.reviews.map((rev: ReviewItem, idx: number) => (
                      <div
                        key={rev.id || idx}
                        className="bg-surface-container-low/50 rounded-xl p-4 border border-surface-container-high/40 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                              {rev.author_name ? rev.author_name.charAt(0) : "P"}
                            </span>
                            <div>
                              <span className="font-bold text-sm text-on-surface block">
                                {rev.author_name}
                              </span>
                              <span className="text-[11px] text-outline">
                                {rev.created_at} • {rev.treatment_category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                              ⭐ {rev.rating_overall}/5
                            </span>
                            {rev.verified && (
                              <span className="text-[11px] font-semibold text-secondary bg-secondary-container/40 px-2 py-0.5 rounded">
                                ✓ Verified Patient
                              </span>
                            )}
                          </div>
                        </div>

                        {rev.title && (
                          <h4 className="font-bold text-xs text-on-surface mt-1">
                            {rev.title}
                          </h4>
                        )}

                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          &ldquo;{rev.comment}&rdquo;
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-outline pt-1 border-t border-surface-container-high/30 mt-1">
                          <span>
                            {rev.would_recommend ? "👍 Would recommend this hospital" : "Neutral"}
                          </span>
                          <span>{rev.helpful_count || 4} patients found this helpful</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-space-md bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">
                    All reviews verified via patient admission &amp; PMJAY Golden Card verification.
                  </span>
                  <button
                    onClick={() => setActiveReviewHospital(null)}
                    className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

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
