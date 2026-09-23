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
  const [selectedFilterPill, setSelectedFilterPill] = useState<"all" | "icu" | "pmjay" | "govt" | "pvt" | "budget1" | "budget2">(
    ["all", "icu", "pmjay", "govt", "pvt", "budget1", "budget2"].includes(initialFilterParam)
      ? initialFilterParam
      : "all"
  );
  const [viewMode, setViewMode] = useState<"split" | "list">("split");
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("medroute_compare_ids");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Unique list of all cities from the 1,450+ dataset
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

  // Filtered hospital list
  const filteredHospitals = useMemo(() => {
    let list = ALL_HOSPITALS;

    // City filter
    if (selectedCityFilter && selectedCityFilter !== "All") {
      list = list.filter(
        (h) => h.city.toLowerCase() === selectedCityFilter.toLowerCase()
      );
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

    // Specialty filter
    if (selectedCondition !== "All") {
      list = list.filter((h) => {
        const specs = (h.specialties || []).map((s) => s.toLowerCase()).join(" ");
        if (selectedCondition === "card") return specs.includes("card") || specs.includes("heart");
        if (selectedCondition === "ortho") return specs.includes("ortho") || specs.includes("bone") || specs.includes("joint");
        if (selectedCondition === "nephr") return specs.includes("nephr") || specs.includes("dialysis") || specs.includes("kidney");
        if (selectedCondition === "onco") return specs.includes("onco") || specs.includes("cancer");
        if (selectedCondition === "trauma") return specs.includes("trauma") || specs.includes("emergency");
        if (selectedCondition === "gyn") return specs.includes("matern") || specs.includes("gyn");
        if (selectedCondition === "eye") return specs.includes("eye");
        if (selectedCondition === "child") return specs.includes("child") || specs.includes("pediatric");
        if (selectedCondition === "surg") return specs.includes("surg");
        return true;
      });
    }

    // Free text query (supports hospital name, city, specialty, and specific disease name)
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((h) => {
        const matchBasic =
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.state.toLowerCase().includes(q) ||
          h.type.toLowerCase().includes(q) ||
          (h.specialties || []).some((s) => s.toLowerCase().includes(q)) ||
          (h.description || "").toLowerCase().includes(q);

        const matchDisease =
          (h.top_disease_treated || "").toLowerCase().includes(q) ||
          (h.procedures || []).some(
            (p) => p.disease.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
          );

        return matchBasic || matchDisease;
      });
    }

    return list;
  }, [selectedCityFilter, selectedFilterPill, selectedCondition, query]);

  // Center coordinates for map
  const activeCenter = useMemo(() => {
    if (filteredHospitals.length > 0) {
      return { lat: filteredHospitals[0].latitude, lng: filteredHospitals[0].longitude };
    }
    return coords || { lat: 28.6139, lng: 77.2090 };
  }, [filteredHospitals, coords]);

  return (
    <div className="w-full min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col pt-16">
      {/* Top Search & Filter Bar */}
      <section className="sticky top-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-2.5 text-xl">
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by condition, treatment, or hospital name..."
                className="w-full pl-10 pr-8 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-sm font-bold"
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
                className="w-full py-2 pl-3 pr-8 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
              >
                <option value="All">All of India (1,450+ Hospitals)</option>
                {allCitiesList.map((c) => (
                  <option key={c} value={c}>
                    📍 {c}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-slate-400 absolute right-2.5 top-2.5 pointer-events-none text-lg">
                expand_more
              </span>
            </div>

            {/* Specialty Dropdown */}
            <div className="w-full sm:w-52 shrink-0 relative">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full py-2 pl-3 pr-8 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
              >
                {SPECIALTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-slate-400 absolute right-2.5 top-2.5 pointer-events-none text-lg">
                expand_more
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "split"
                    ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Map Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                List Only
              </button>
            </div>
          </div>

          {/* Quick Disease Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">Treatments:</span>
            {[
              "Heart Attack / CAD",
              "Knee Osteoarthritis",
              "Kidney Stones",
              "Dialysis (ESRD)",
              "Gallbladder Stones",
              "Cataract",
              "Hernia",
            ].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setQuery(query === d ? "" : d)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  query.toLowerCase() === d.toLowerCase()
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                }`}
              >
                🩺 {d}
              </button>
            ))}
          </div>

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
                className={`px-3 py-1.5 rounded-full shrink-0 transition-all border ${
                  selectedFilterPill === pill.id
                    ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-300"
                }`}
              >
                {pill.label}
              </button>
            ))}

            <span className="ml-auto text-xs font-medium text-slate-500 shrink-0 pl-2">
              {filteredHospitals.length} hospitals found
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Mock Dataset Disclaimer Banner */}
        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🧪</span>
            <span className="text-amber-900 dark:text-amber-200 leading-snug">
              <strong>Demonstration Mock Dataset:</strong> Currently displaying 1,450+ hospitals across 107 Indian cities. All tariffs, ICU counts, patient treated numbers, and success ratios are simulated mock benchmarks for prototype testing.
            </span>
          </div>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-md">
            Simulated Data
          </span>
        </div>

        <div className={`grid gap-6 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1 max-w-4xl mx-auto"}`}>
          
          {/* Hospital Cards Column */}
          <div className={`${viewMode === "split" ? "lg:col-span-7" : "w-full"} flex flex-col gap-4`}>
            {filteredHospitals.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center text-3xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No hospitals match your search filters
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Try clearing your search query, switching city to &quot;All of India&quot;, or removing filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedCityFilter("All");
                    setSelectedCondition("All");
                    setSelectedFilterPill("all");
                  }}
                  className="mt-2 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl hover:bg-sky-500"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredHospitals.slice(0, 50).map((hosp) => {
                const isCompared = compareIds.includes(hosp.slug) || compareIds.includes(hosp.id);
                const isSelected = selectedHospitalId === hosp.id || selectedHospitalId === hosp.slug;

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
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize shrink-0">
                          {hosp.type}
                        </span>
                      </div>

                      {/* Location & Rating */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>📍 {hosp.address}, {hosp.city}</span>
                        <span>·</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          ★ {hosp.overall_rating?.toFixed(1) || "4.6"} ({hosp.total_reviews} reviews)
                        </span>
                        {hosp.accreditation && (
                          <>
                            <span>·</span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">{hosp.accreditation}</span>
                          </>
                        )}
                      </div>

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

                      {/* Disease Track Record (Mock Data Features) */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-0.5">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>🩺</span>
                          <span className="line-clamp-1">{hosp.top_disease_treated || "High Volume Specialty Care"}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>👥 {(hosp.total_patients_treated || 12500).toLocaleString("en-IN")} patients treated</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ {hosp.overall_success_ratio || "97.5%"} Success
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Tariff & Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wide block font-medium">
                          Indicative Tariff
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
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            isCompared
                              ? "bg-sky-600 text-white border-sky-600"
                              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent"
                          }`}
                        >
                          {isCompared ? "✓ Added" : "+ Compare"}
                        </button>

                        <Link
                          href={`/hospitals/${hosp.slug}`}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            {filteredHospitals.length > 50 && (
              <div className="p-4 text-center text-xs text-slate-400">
                Showing top 50 of {filteredHospitals.length} hospitals. Narrow your search using filters.
              </div>
            )}
          </div>

          {/* Sticky Map Column (Split Mode) */}
          {viewMode === "split" && (
            <div className="hidden lg:block lg:col-span-5 sticky top-36 h-[calc(100vh-10rem)] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
              <SearchMap
                hospitals={filteredHospitals.slice(0, 50).map((h) => ({
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
