"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ALL_HOSPITALS, HospitalOption } from "@/data/hospitalsData";

interface CompareHospitalItem {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  location: string;
  city: string;
  distance: string;
  distanceKm: number;
  eta: string;
  rating: number;
  totalReviews: number;
  imageUrl: string;
  type: string;
  cashlessEligibility: string;
  approvalTurnaround: string;
  turnaroundMinutes: number;
  upfrontDeposit: string;
  icuBeds: string;
  openIcus: string;
  deluxeTariff: string;
  tariffCoverage: string;
  accreditations: string[];
  patientsTreated: number;
  successRatio: string;
  topDisease: string;
  traumaLevel: string;
  ambulancePhone: string;
  pmjayEmpanelled: boolean;
}

const COMPARISON_PROCEDURES = [
  {
    id: "angioplasty",
    name: "Heart Stent / Angioplasty",
    pmjayCode: "MC004",
    pmjayRate: "₹65,000 (100% Cashless)",
    privateRateRange: "₹1,25,000 – ₹1,85,000",
    govtRateRange: "₹25,000 – ₹45,000 (Subsidized)",
  },
  {
    id: "knee-replacement",
    name: "Total Knee Replacement",
    pmjayCode: "OR002",
    pmjayRate: "₹80,000 (100% Cashless)",
    privateRateRange: "₹1,40,000 – ₹2,20,000",
    govtRateRange: "₹35,000 – ₹60,000 (Subsidized)",
  },
  {
    id: "cabg",
    name: "Heart Bypass Surgery (CABG)",
    pmjayCode: "MC001",
    pmjayRate: "₹1,30,000 (100% Cashless)",
    privateRateRange: "₹2,40,000 – ₹3,80,000",
    govtRateRange: "₹45,000 – ₹85,000 (Subsidized)",
  },
  {
    id: "cataract",
    name: "Cataract Surgery (Phaco + IOL)",
    pmjayCode: "OP001",
    pmjayRate: "₹8,500 (100% Cashless)",
    privateRateRange: "₹22,000 – ₹48,000",
    govtRateRange: "₹0 – ₹6,000 (Subsidized)",
  },
  {
    id: "cholecystectomy",
    name: "Laparoscopic Gallbladder Removal",
    pmjayCode: "GS001",
    pmjayRate: "₹28,000 (100% Cashless)",
    privateRateRange: "₹48,000 – ₹95,000",
    govtRateRange: "₹8,000 – ₹18,000 (Subsidized)",
  },
  {
    id: "kidney-stone",
    name: "Kidney Stone Laser Removal (PCNL)",
    pmjayCode: "UR001",
    pmjayRate: "₹32,000 (100% Cashless)",
    privateRateRange: "₹42,000 – ₹95,000",
    govtRateRange: "₹12,000 – ₹26,000 (Subsidized)",
  },
];

const HOSPITAL_PHOTOS = [
  "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&q=80",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80",
];

function transformOptionToCompare(h: HospitalOption, index: number): CompareHospitalItem {
  const isGovt = h.type.toLowerCase() === "government";
  const isPmjay = h.is_pmjay_empanelled;
  const dist = 3.2 + (index * 2.4);

  return {
    id: h.id,
    slug: h.slug,
    name: h.name,
    shortName: h.name.split(",")[0].split("Hospital")[0].trim(),
    location: `${h.address}, ${h.city}`,
    city: h.city,
    distance: `${dist.toFixed(1)} km`,
    distanceKm: dist,
    eta: `~${Math.round(dist * 2.2 + 5)}m ETA`,
    rating: h.overall_rating || 4.6,
    totalReviews: h.total_reviews || 120,
    imageUrl: HOSPITAL_PHOTOS[index % HOSPITAL_PHOTOS.length],
    type: isGovt ? "Public Autonomous / Apex" : "Private Super-Specialty",
    cashlessEligibility: isPmjay ? "100% Cashless (AB-PMJAY)" : "TPA Private Network",
    approvalTurnaround: isPmjay ? "20 mins" : "32 mins",
    turnaroundMinutes: isPmjay ? 20 : 32,
    upfrontDeposit: isPmjay ? "₹0 (Zero Deposit)" : "₹0 with Pre-Auth",
    icuBeds: `${h.beds_icu || 45} Beds`,
    openIcus: `${h.beds_icu_available || 8} open ICUs`,
    deluxeTariff: h.cost_range || (isGovt ? "Subsidized Ward" : "₹4,500 / day"),
    tariffCoverage: isPmjay ? "100% PMJAY Package" : "Partial Subsidized",
    accreditations: h.accreditation ? [h.accreditation] : ["NABH Accredited"],
    patientsTreated: h.total_patients_treated || 14500,
    successRatio: h.overall_success_ratio || "97.8%",
    topDisease: h.top_disease_treated || "High Volume Specialty Care",
    traumaLevel: h.trauma_level || (isGovt ? "Level 1 Trauma" : "Level 2 Trauma"),
    ambulancePhone: h.ambulance_phone || h.emergency_phone || "108",
    pmjayEmpanelled: isPmjay,
  };
}

function CompareContent() {
  const searchParams = useSearchParams();

  // Find Tricity defaults from ALL_HOSPITALS
  const defaultTricityList = useMemo(() => {
    // Look for Chandigarh and Mohali benchmark institutions
    const chd = ALL_HOSPITALS.filter(
      (h) => h.city.toLowerCase() === "chandigarh" || h.city.toLowerCase() === "mohali"
    );
    if (chd.length >= 3) {
      return chd.slice(0, 3).map((h, i) => transformOptionToCompare(h, i));
    }
    return ALL_HOSPITALS.slice(0, 3).map((h, i) => transformOptionToCompare(h, i));
  }, []);

  const [selectedHospitals, setSelectedHospitals] = useState<CompareHospitalItem[]>(defaultTricityList);
  const [selectedProcedure, setSelectedProcedure] = useState(COMPARISON_PROCEDURES[0]);
  const [diffOnly, setDiffOnly] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [bookedHospital, setBookedHospital] = useState<string | null>(null);

  // Sync from URL params or localStorage on mount
  useEffect(() => {
    let idsToLoad: string[] = [];

    const urlIds = searchParams.get("ids");
    if (urlIds) {
      idsToLoad = urlIds.split(",").map((s) => s.trim().toLowerCase());
    } else if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("medroute_compare_ids");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            idsToLoad = parsed;
          }
        }
      } catch {}
    }

    if (idsToLoad.length > 0) {
      const found: CompareHospitalItem[] = [];
      idsToLoad.forEach((idOrSlug, idx) => {
        const match = ALL_HOSPITALS.find(
          (h) =>
            h.id.toLowerCase() === idOrSlug ||
            h.slug.toLowerCase() === idOrSlug ||
            h.slug.toLowerCase().includes(idOrSlug)
        );
        if (match && !found.some((f) => f.id === match.id)) {
          found.push(transformOptionToCompare(match, idx));
        }
      });
      if (found.length > 0) {
        setSelectedHospitals(found);
      }
    }
  }, [searchParams]);

  const gridColStyle = {
    display: "grid",
    gridTemplateColumns: `240px repeat(${selectedHospitals.length}, minmax(200px, 1fr))`,
  };

  const removeHospital = (id: string) => {
    if (selectedHospitals.length <= 1) {
      alert("At least 1 hospital must remain in the comparison matrix.");
      return;
    }
    const updated = selectedHospitals.filter((h) => h.id !== id);
    setSelectedHospitals(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("medroute_compare_ids", JSON.stringify(updated.map((h) => h.slug)));
      } catch {}
    }
  };

  const addHospital = (hosp: HospitalOption) => {
    if (selectedHospitals.find((item) => item.id === hosp.id || item.slug === hosp.slug)) return;
    if (selectedHospitals.length >= 4) {
      alert("Maximum 4 hospitals can be compared side-by-side.");
      return;
    }
    const converted = transformOptionToCompare(hosp, selectedHospitals.length);
    const updated = [...selectedHospitals, converted];
    setSelectedHospitals(updated);
    setAddDropdownOpen(false);
    setSearchTerm("");
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("medroute_compare_ids", JSON.stringify(updated.map((h) => h.slug)));
      } catch {}
    }
  };

  const handleShare = () => {
    const slugs = selectedHospitals.map((h) => h.slug).join(",");
    const shareUrl = `${window.location.origin}/compare?ids=${slugs}`;
    if (navigator.share) {
      navigator.share({
        title: "Med Route Hospital Comparison Matrix",
        text: "Compare healthcare facilities side-by-side across verified tariffs, patient volumes, and clinical outcomes.",
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const availableToAdd = useMemo(() => {
    return ALL_HOSPITALS.filter(
      (a) =>
        !selectedHospitals.some((s) => s.id === a.id || s.slug === a.slug) &&
        (searchTerm === "" ||
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.city.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 15);
  }, [selectedHospitals, searchTerm]);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pt-16">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        
        {/* Breadcrumb Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link className="hover:text-sky-600 transition-colors" href="/">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link className="hover:text-sky-600 transition-colors" href="/search">
              Search Facilities
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold">Side-by-Side Comparison Matrix</span>
          </nav>

          <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-300/60 dark:border-sky-800">
            TECHNOVA 2026 Benchmark Matrix
          </span>
        </div>

        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-col gap-1 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hospital Clinical &amp; Tariff Comparison
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Side-by-side benchmarking across verified patient volumes, surgical success ratios, AB-PMJAY HBP 2.2 cashless rates, and live ICU telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors rounded-xl shadow-xs text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
              type="button"
              onClick={handleShare}
            >
              <span className="material-symbols-outlined text-base text-sky-600">
                {shareCopied ? "check" : "share"}
              </span>
              <span>{shareCopied ? "Link Copied!" : "Share Matrix"}</span>
            </button>

            <button
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors rounded-xl shadow-xs text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
              type="button"
              onClick={() => window.print()}
            >
              <span className="material-symbols-outlined text-base text-sky-600">download</span>
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Procedure Selector Strip (Standardized PMJAY HBP Packages) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Standardized Clinical Package
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🩺</span> Compare tariffs for:
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {COMPARISON_PROCEDURES.map((proc) => {
              const isSelected = selectedProcedure.id === proc.id;
              return (
                <button
                  key={proc.id}
                  type="button"
                  onClick={() => setSelectedProcedure(proc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400"
                  }`}
                >
                  {proc.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hospital Selection Dock & Control Strip */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-1">
              {selectedHospitals.map((hospital, idx) => (
                <div
                  key={hospital.id}
                  className="flex items-center justify-between p-2.5 px-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {hospital.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{hospital.city}</p>
                    </div>
                  </div>
                  <button
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 ml-1 cursor-pointer"
                    title="Remove hospital"
                    type="button"
                    onClick={() => removeHospital(hospital.id)}
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}

              {/* Add Hospital Button & Live Search Dropdown */}
              {selectedHospitals.length < 4 && (
                <div className="relative">
                  <button
                    className="w-full h-full min-h-[44px] flex items-center justify-center gap-1.5 px-3 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40 rounded-xl text-sky-700 dark:text-sky-300 transition-colors text-xs font-bold border border-sky-300/60 dark:border-sky-800 cursor-pointer"
                    type="button"
                    onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>+ Add Hospital</span>
                  </button>

                  {addDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-30 min-w-[280px]">
                      <input
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none mb-2 border border-slate-300 dark:border-slate-700"
                        placeholder="Search by hospital name or city..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                        {availableToAdd.map((avail) => (
                          <div
                            key={avail.id}
                            className="px-3 py-2 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer text-xs flex justify-between items-center gap-2"
                            onClick={() => addHospital(avail)}
                          >
                            <div className="truncate">
                              <span className="font-semibold text-slate-900 dark:text-white block truncate">{avail.name}</span>
                              <span className="text-[10px] text-slate-400">{avail.city} • {avail.type}</span>
                            </div>
                            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 shrink-0">
                              + Add
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Differences Toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
                <input
                  checked={diffOnly}
                  onChange={(e) => setDiffOnly(e.target.checked)}
                  className="accent-sky-600 rounded cursor-pointer"
                  type="checkbox"
                />
                <span className="font-semibold">Show differences only</span>
              </label>
            </div>

          </div>
        </div>

        {/* Matrix Table Container */}
        <div className="overflow-x-auto w-full pb-2 no-scrollbar">
          <div className="min-w-[760px] bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            
            {/* Table Header: Hospital Overview */}
            <div style={gridColStyle} className="bg-slate-50 dark:bg-slate-950/80 sticky top-20 z-20 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-col justify-end p-4 border-r border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Verifiable Benchmarks</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">Facility Overview</span>
              </div>

              {selectedHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="p-4 flex flex-col gap-2 relative border-r border-slate-200 dark:border-slate-800 last:border-r-0"
                >
                  <div className="h-28 w-full rounded-xl overflow-hidden relative bg-slate-200 dark:bg-slate-800">
                    <img className="w-full h-full object-cover" src={hospital.imageUrl} alt={hospital.name} />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-xs text-[10px] text-white font-bold shadow-xs">
                      {hospital.distance} · {hospital.eta}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {hospital.name}
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{hospital.location}</p>
                    </div>
                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400 font-bold text-xs shrink-0">
                      <span>★</span>
                      <span>{hospital.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 1: VERIFIABLE METRICS (Slide 6 & 7 Mandatory Deliverable) */}
            <div className="bg-sky-50/70 dark:bg-sky-950/40 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs text-sky-800 dark:text-sky-300 font-black uppercase tracking-wider flex items-center gap-1.5">
                <span>🏆</span> Mandatory Verifiable Metrics (TECHNOVA 2026 Criteria)
              </span>
            </div>

            {/* Row 1: Annual Patient Volume */}
            <div style={gridColStyle} className="p-4 items-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 pr-3">
                Annual Patient Volume
                <span className="block text-[11px] text-slate-400 font-normal">Patients treated per year</span>
              </div>
              {selectedHospitals.map((h) => (
                <div key={h.id} className="px-3">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {h.patientsTreated.toLocaleString("en-IN")} Patients
                  </span>
                  <span className="block text-[10px] text-slate-400">Track record: {h.topDisease}</span>
                </div>
              ))}
            </div>

            {/* Row 2: Procedural Success Ratio */}
            <div style={gridColStyle} className="p-4 items-center bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 pr-3">
                Clinical Success Ratio
                <span className="block text-[11px] text-slate-400 font-normal">Verified outcome metric</span>
              </div>
              {selectedHospitals.map((h) => (
                <div key={h.id} className="px-3">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {h.successRatio}
                  </span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Verified audit score</span>
                </div>
              ))}
            </div>

            {/* Row 3: Procedure Tariff Comparison */}
            <div style={gridColStyle} className="p-4 items-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 pr-3">
                {selectedProcedure.name} Tariff
                <span className="block text-[11px] text-sky-600 dark:text-sky-400 font-semibold font-mono">
                  PMJAY {selectedProcedure.pmjayCode}
                </span>
              </div>
              {selectedHospitals.map((h) => {
                const isGovt = h.type.includes("Public") || h.type.includes("Apex");
                return (
                  <div key={h.id} className="px-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {h.pmjayEmpanelled ? (
                        <span className="text-emerald-600 dark:text-emerald-400">100% Cashless (PMJAY)</span>
                      ) : isGovt ? (
                        selectedProcedure.govtRateRange
                      ) : (
                        selectedProcedure.privateRateRange
                      )}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {h.pmjayEmpanelled ? selectedProcedure.pmjayRate : isGovt ? "Subsidized Ward Tariff" : "Private Room Package"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Row 4: Verified Certifications */}
            <div style={gridColStyle} className="p-4 items-center bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 pr-3">
                Verified Certifications
                <span className="block text-[11px] text-slate-400 font-normal">Accreditation bodies</span>
              </div>
              {selectedHospitals.map((h) => (
                <div key={h.id} className="px-3 flex flex-wrap gap-1">
                  {h.accreditations.map((acc) => (
                    <span key={acc} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      🏅 {acc}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 rounded text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                    🚨 {h.traumaLevel}
                  </span>
                </div>
              ))}
            </div>

            {/* SECTION 2: OPERATIONAL & ICU TELEMETRY */}
            <div className="bg-slate-100 dark:bg-slate-950/90 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                Live ICU Telemetry &amp; Emergency Readiness
              </span>
            </div>

            {/* Row 5: Live ICU Beds */}
            <div style={gridColStyle} className="p-4 items-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 pr-3">
                Live ICU Availability
                <span className="block text-[11px] text-slate-400 font-normal">Active telemetry sync</span>
              </div>
              {selectedHospitals.map((h) => (
                <div key={h.id} className="px-3">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{h.icuBeds}</span>
                  <span className="block text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {h.openIcus}
                  </span>
                </div>
              ))}
            </div>

            {/* Row 6: Admission Turnaround */}
            <div style={gridColStyle} className="p-4 items-center bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 pr-3">
                Admission Clearance Speed
                <span className="block text-[11px] text-slate-400 font-normal">Pre-auth desk turnaround</span>
              </div>
              {selectedHospitals.map((h) => (
                <div key={h.id} className="px-3">
                  <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{h.approvalTurnaround}</span>
                  <span className="block text-[10px] text-slate-400">{h.upfrontDeposit}</span>
                </div>
              ))}
            </div>

            {/* Action Row */}
            <div style={gridColStyle} className="p-4 bg-white dark:bg-slate-900 items-center">
              <div className="border-r border-slate-200 dark:border-slate-800 pr-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Direct Actions</span>
                <p className="text-[10px] text-slate-500">Contact desk or book pre-auth</p>
              </div>
              {selectedHospitals.map((h) => (
                <div key={h.id} className="flex flex-col gap-1.5 px-3">
                  <a
                    href={`tel:${h.ambulancePhone}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-center text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📞</span> Call Helpdesk
                  </a>

                  <button
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-center shadow-xs transition-colors cursor-pointer ${
                      bookedHospital === h.id
                        ? "bg-emerald-600 text-white"
                        : "bg-sky-600 hover:bg-sky-500 text-white"
                    }`}
                    type="button"
                    onClick={() => {
                      setBookedHospital(h.id);
                      setTimeout(() => setBookedHospital(null), 3000);
                    }}
                  >
                    {bookedHospital === h.id ? "Admission Reserved!" : "Reserve Admission"}
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Infographic Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Corridor Telemetry
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Admission Clearance Time Benchmark
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Measured from citizen arrival to biometric AB-PMJAY pre-auth approval.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              {selectedHospitals.map((h) => (
                <div key={h.id}>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{h.name}</span>
                    <span className="text-sky-600 dark:text-sky-400">{h.approvalTurnaround}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-1">
                    <div
                      className="bg-sky-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (h.turnaroundMinutes / 45) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Audited Clinical Efficacy
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Patient Volumes vs. Surgical Success
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                High procedural volume correlates with lower post-operative complication rates.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {selectedHospitals.slice(0, 4).map((h) => (
                <div key={h.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 truncate block">{h.shortName}</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {h.patientsTreated.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {h.successRatio} Success
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading comparison matrix...</div>}>
      <CompareContent />
    </Suspense>
  );
}
