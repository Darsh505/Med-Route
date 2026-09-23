"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "@/context/LocationContext";
import { ALL_HOSPITALS } from "@/data/hospitalsData";

interface CompareItem {
  id: string;
  name: string;
  location: string;
}

export default function HomePage() {
  const { selectedCity } = useLocation();

  // Search Hub State
  const [cityInput, setCityInput] = useState("Bangalore, Indiranagar");
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [specialtyPopoverOpen, setSpecialtyPopoverOpen] = useState(false);

  // Fast Filters State
  const [cashlessOnly, setCashlessOnly] = useState(true);
  const [liveIcuOnly, setLiveIcuOnly] = useState(false);
  const [accreditedOnly, setAccreditedOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [roboticSurgery, setRoboticSurgery] = useState(false);

  // Sidebar Filter State
  const [distanceRadius, setDistanceRadius] = useState(15);
  const [filterNabh, setFilterNabh] = useState(true);
  const [filterJci, setFilterJci] = useState(false);
  const [filterNabl, setFilterNabl] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);

  // Sort State
  const [sortBy, setSortBy] = useState<"relevance" | "beds" | "rating" | "turnaround">("relevance");

  // Pagination State (4 hospitals per tab)
  const [currentPage, setCurrentPage] = useState(1);
  const HOSPITALS_PER_PAGE = 4;

  // Mobile Filters Drawer State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Comparison State
  const [comparedHospitals, setComparedHospitals] = useState<string[]>(["sakra", "aster-cmi"]);

  // Modal State for Cashless Admission & Bed Check
  const [modalHospital, setModalHospital] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"beds" | "admission" | null>(null);
  const [admissionSuccess, setAdmissionSuccess] = useState(false);

  // Sync cityInput when selectedCity changes
  useEffect(() => {
    if (selectedCity) {
      setCityInput(selectedCity);
    }
  }, [selectedCity]);

  // Reset pagination to page 1 whenever any filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    cashlessOnly,
    liveIcuOnly,
    accreditedOnly,
    emergencyOnly,
    roboticSurgery,
    distanceRadius,
    filterNabh,
    filterJci,
    filterNabl,
    selectedRoomType,
    selectedProcedure,
    sortBy,
    specialtyInput,
    cityInput,
  ]);

  // Handle comparison toggle
  const toggleCompare = (hospitalId: string) => {
    setComparedHospitals((prev) => {
      if (prev.includes(hospitalId)) {
        return prev.filter((id) => id !== hospitalId);
      } else {
        if (prev.length >= 4) {
          alert("You can compare up to 4 hospitals simultaneously.");
          return prev;
        }
        return [...prev, hospitalId];
      }
    });
  };

  // Hospital List Data
  const hospitals = useMemo(() => {
    let list = ALL_HOSPITALS.map((h) => {
      // Map existing rich data to Stitch visual fields
      const isSakra = h.name.toLowerCase().includes("sakra");
      const isAster = h.name.toLowerCase().includes("aster");
      const isManipal = h.name.toLowerCase().includes("manipal");
      const isApollo = h.name.toLowerCase().includes("apollo");
      const isFortis = h.name.toLowerCase().includes("fortis");

      let liveIcu = (h as any).beds_icu_available || (h as any).available_beds_icu || 10;
      let turnaround = "15-20 min";
      let roomAvailable = "14 Deluxe Free";
      let qualityBadge = "NABH Accredited";
      let distance = (h as any).distance_km || 4.2;
      let rating = (h as any).overall_rating || (h as any).rating || 4.8;
      let reviewCount = (h as any).total_reviews || 1840;

      let metrics: { label: string; value: string; isIcu?: boolean; isQuality?: boolean; isDesk?: boolean }[] = [];
      let tags: { label: string; isCheck?: boolean }[] = [];

      if (isSakra) {
        liveIcu = 12;
        turnaround = "Instant (Avg 14m)";
        roomAvailable = "18 Deluxe Free";
        qualityBadge = "NABH & JCI Gold";
        distance = 4.2;
        rating = 4.9;
        reviewCount = 1840;
        metrics = [
          { label: "Room Eligibility", value: "18 Deluxe Free" },
          { label: "Live ICU Status", value: "12 Open ICUs", isIcu: true },
          { label: "Pre-Auth Track", value: "Instant (Avg 14m)" },
          { label: "Quality Standard", value: "NABH & JCI Gold", isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Robotic Orthopedics" },
          { label: "Emergency 24x7 Cath Lab" },
        ];
      } else if (isAster) {
        liveIcu = 9;
        turnaround = "20-min Fast Track";
        roomAvailable = "12 Deluxe Free";
        qualityBadge = "NABH • NABL";
        distance = 8.1;
        rating = 4.8;
        reviewCount = 2110;
        metrics = [
          { label: "TPA Desk", value: "20-min Fast Track" },
          { label: "Medi Route Desk", value: "Counter #4 (Dedicated)", isDesk: true },
          { label: "ICU Readiness", value: "9 Open CCU/ICU", isIcu: true },
          { label: "Accreditations", value: "NABH • NABL", isQuality: true },
        ];
        tags = [
          { label: "Zero-Deposit Admission Protocol", isCheck: true },
          { label: "Organ Transplant Center" },
          { label: "Neuro Surgery Team" },
        ];
      } else if (isManipal) {
        liveIcu = 10;
        turnaround = "28 mins (Fast)";
        roomAvailable = "22 Deluxe Free";
        qualityBadge = "NABH • JCI";
        distance = 5.2;
        rating = 4.8;
        reviewCount = 3450;
        metrics = [
          { label: "Room Eligibility", value: "22 Deluxe Free" },
          { label: "Live ICU Status", value: "10 Open ICUs", isIcu: true },
          { label: "Pre-Auth Track", value: "28 mins (Fast)" },
          { label: "Quality Standard", value: "NABH • JCI", isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Cardiac Science Center" },
          { label: "Emergency 24x7 Trauma Desk" },
        ];
      } else if (isApollo) {
        liveIcu = 14;
        turnaround = "45 mins (Priority)";
        roomAvailable = "16 Deluxe Free";
        qualityBadge = "NABH • JCI Global";
        distance = 11.4;
        rating = 4.7;
        reviewCount = 4120;
        metrics = [
          { label: "Room Eligibility", value: "16 Deluxe Free" },
          { label: "Live ICU Status", value: "14 Open ICUs", isIcu: true },
          { label: "Pre-Auth Track", value: "45 mins (Priority)" },
          { label: "Quality Standard", value: "NABH • JCI Global", isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Advanced Oncology Wing" },
          { label: "Zero Upfront Security" },
        ];
      } else if (isFortis) {
        liveIcu = 12;
        turnaround = "38 mins (Priority)";
        roomAvailable = "15 Deluxe Free";
        qualityBadge = "NABH • NABL";
        distance = 7.1;
        rating = 4.6;
        reviewCount = 2980;
        metrics = [
          { label: "Room Eligibility", value: "15 Deluxe Free" },
          { label: "Live ICU Status", value: "12 Open ICUs", isIcu: true },
          { label: "Pre-Auth Track", value: "38 mins (Priority)" },
          { label: "Quality Standard", value: "NABH • NABL", isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Robotic Surgery Desk" },
          { label: "Emergency 24x7 Cath Lab" },
        ];
      } else {
        metrics = [
          { label: "Room Eligibility", value: roomAvailable },
          { label: "Live ICU Status", value: `${liveIcu} Open ICUs`, isIcu: true },
          { label: "Pre-Auth Track", value: turnaround },
          { label: "Quality Standard", value: qualityBadge, isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Robotic Surgery Desk" },
          { label: "Emergency 24x7 Cath Lab" },
        ];
      }

      return {
        ...h,
        liveIcu,
        turnaround,
        roomAvailable,
        qualityBadge,
        distance,
        rating,
        reviewCount,
        metrics,
        tags,
      };
    });

    // Apply Filters
    if (cashlessOnly) {
      list = list.filter((h) => (h as any).is_pmjay_empanelled || (h as any).pmjay || (h as any).has_pmjay);
    }
    if (liveIcuOnly) {
      list = list.filter((h) => h.liveIcu > 8);
    }
    if (accreditedOnly) {
      list = list.filter((h) => h.qualityBadge.includes("NABH") || h.qualityBadge.includes("JCI"));
    }
    if (specialtyInput.trim()) {
      const term = specialtyInput.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(term) ||
          h.specialties?.some((s) => s.toLowerCase().includes(term)) ||
          h.procedures?.some((p) => p.name.toLowerCase().includes(term))
      );
    }

    // Distance filter
    list = list.filter((h) => h.distance <= distanceRadius);

    // Sorting
    if (sortBy === "beds") {
      list.sort((a, b) => b.liveIcu - a.liveIcu);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "turnaround") {
      list.sort((a, b) => (a.turnaround.includes("Instant") ? -1 : 1));
    } else {
      list.sort((a, b) => a.distance - b.distance);
    }

    return list;
  }, [cashlessOnly, liveIcuOnly, accreditedOnly, specialtyInput, distanceRadius, sortBy]);

  const resetFilters = () => {
    setDistanceRadius(30);
    setFilterNabh(true);
    setFilterJci(false);
    setFilterNabl(false);
    setSelectedRoomType("all");
    setSelectedProcedure(null);
    setCashlessOnly(false);
    setLiveIcuOnly(false);
    setAccreditedOnly(false);
    setSpecialtyInput("");
    setBudgetFilter("all");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(hospitals.length / HOSPITALS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedHospitals = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * HOSPITALS_PER_PAGE;
    return hospitals.slice(startIndex, startIndex + HOSPITALS_PER_PAGE);
  }, [hospitals, safeCurrentPage]);

  // Dynamic pagination items: 1, 2, ..., last
  const paginationItems = useMemo(() => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 2) {
      return [1, 2, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 1) {
      return [1, "...", totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage, "...", totalPages];
  }, [totalPages, safeCurrentPage]);

  const activeFilterCount =
    (filterJci ? 1 : 0) +
    (filterNabl ? 1 : 0) +
    (selectedRoomType !== "all" ? 1 : 0) +
    (selectedProcedure ? 1 : 0) +
    (distanceRadius !== 15 ? 1 : 0) +
    (cashlessOnly ? 1 : 0) +
    (liveIcuOnly ? 1 : 0) +
    (accreditedOnly ? 1 : 0);

  return (
    <div className="bg-surface-canvas min-h-screen text-on-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 lg:pt-28 bg-surface-canvas min-h-screen">
        <div className="flex flex-col w-full">

          {/* 1. HERO SECTION & OMNI MULTI-FIELD SEARCH HUB */}
          <section className="w-full bg-surface-canvas py-space-xl lg:py-space-xl pt-space-xl lg:pt-space-xl">
            <div className="max-w-[1280px] mx-auto px-margin lg:px-margin-lg flex flex-col gap-space-xl pt-space-lg">
              
              {/* Header Title */}
              <div className="flex flex-col gap-space-sm max-w-3xl mb-space-sm">
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
                  Find Verified Network Hospitals Near You
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Access 10,000+ cashless partner hospitals, track real-time ICU beds, and verify insurance acceptance with zero upfront friction.
                </p>
              </div>

              {/* Mega Multi-Field Search Hub */}
              <div className="w-full bg-surface-card rounded-2xl md:rounded-3xl p-6 lg:p-space-lg shadow-[0_20px_50px_rgba(5,10,78,0.08)] ring-1 ring-primary/10 border-2 border-primary/15 flex flex-col gap-space-lg relative transition-all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-md items-center w-full">
                  
                  {/* Field 1: City / Locality */}
                  <div className="lg:col-span-3 bg-surface-canvas hover:bg-surface-ice transition-colors rounded-xl px-space-md min-h-[64px] sm:h-20 flex items-center gap-space-sm border border-border-subtle focus-within:border-brand-blue-interactive focus-within:ring-2 focus-within:ring-brand-blue-interactive/20 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-surface-ice flex items-center justify-center shrink-0 text-secondary">
                      <span className="material-symbols-outlined text-[28px]">location_on</span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant leading-none font-semibold mb-1">
                        City / Locality
                      </span>
                      <input
                        className="bg-transparent font-title-md text-title-md text-on-surface outline-none w-full truncate font-bold"
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="e.g. Bangalore, Indiranagar"
                      />
                    </div>
                    <button
                      className="text-on-surface-variant hover:text-brand-blue-interactive p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                      title="Detect GPS location"
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            () => setCityInput("Bangalore (Current GPS)"),
                            () => setCityInput("Bangalore, KA")
                          );
                        }
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">my_location</span>
                    </button>
                  </div>

                  {/* Field 2: Specialty / Hospital / Doctor + Popover */}
                  <div className="lg:col-span-4 relative flex flex-col gap-1.5" id="specialty-hub">
                    <div
                      className="bg-surface-canvas hover:bg-surface-ice transition-colors rounded-xl px-space-md min-h-[64px] sm:h-20 flex items-center gap-space-sm border border-border-subtle focus-within:border-brand-blue-interactive focus-within:ring-2 focus-within:ring-brand-blue-interactive/20 shadow-sm relative cursor-pointer"
                      onClick={() => setSpecialtyPopoverOpen(!specialtyPopoverOpen)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-surface-ice flex items-center justify-center shrink-0 text-secondary">
                        <span className="material-symbols-outlined text-[28px]">stethoscope</span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-label-sm text-label-sm text-on-surface-variant leading-none font-semibold">
                            Specialty, Hospital or Doctor
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">expand_more</span>
                          </span>
                        </div>
                        <input
                          className="bg-transparent font-title-md text-title-md text-on-surface outline-none w-full truncate font-bold placeholder:text-outline-variant placeholder:font-normal"
                          id="specialty-input"
                          placeholder="Cardiology, Aster, Orthopedics..."
                          type="text"
                          value={specialtyInput}
                          onChange={(e) => setSpecialtyInput(e.target.value)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpecialtyPopoverOpen(true);
                          }}
                        />
                      </div>
                      {specialtyInput && (
                        <button
                          className="text-on-surface-variant hover:text-brand-blue-interactive p-1 rounded-lg hover:bg-surface-container transition-colors shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpecialtyInput("");
                          }}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>

                    {/* Quick Specialty Chips Row */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar mt-space-xs">
                      {["Cardiology", "Orthopedics", "Oncology", "Neurology", "Gynecology", "Gastro"].map((spec) => (
                        <button
                          key={spec}
                          className={`px-space-sm py-1 rounded-full text-label-sm font-semibold whitespace-nowrap transition-colors border border-border-subtle/50 flex items-center gap-1 ${
                            specialtyInput.includes(spec)
                              ? "bg-secondary-container text-on-secondary-container font-bold"
                              : "bg-surface-ice hover:bg-secondary-container text-secondary hover:text-on-secondary-container"
                          }`}
                          onClick={() => setSpecialtyInput(spec)}
                          type="button"
                        >
                          {spec}
                        </button>
                      ))}
                    </div>

                    {/* Specialty Selection Popover */}
                    {specialtyPopoverOpen && (
                      <div className="absolute top-full left-0 w-full md:w-[480px] z-50 mt-1 bg-surface-card rounded-2xl shadow-xl border border-border-subtle p-space-md flex flex-col gap-space-sm">
                        <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle/50">
                          <div className="flex items-center gap-space-xs">
                            <span className="material-symbols-outlined text-secondary text-[20px]">local_hospital</span>
                            <span className="font-headline-md text-headline-md font-bold text-on-surface text-[16px]">
                              Popular Clinical Specialties
                            </span>
                          </div>
                          <button
                            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"
                            onClick={() => setSpecialtyPopoverOpen(false)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-space-xs max-h-64 overflow-y-auto pr-1">
                          {[
                            { name: "Cardiology", docs: "18 Hospitals • 42 Docs", icon: "cardiology" },
                            { name: "Orthopedics", docs: "24 Hospitals • 56 Docs", icon: "orthopedics" },
                            { name: "Oncology", docs: "14 Hospitals • 29 Docs", icon: "radiology" },
                            { name: "Neurology", docs: "12 Hospitals • 31 Docs", icon: "neurology" },
                            { name: "Gynecology", docs: "21 Hospitals • 47 Docs", icon: "pregnancy" },
                            { name: "Gastroenterology", docs: "16 Hospitals • 34 Docs", icon: "gastroenterology" },
                          ].map((item) => (
                            <div
                              key={item.name}
                              className="p-space-xs rounded-xl bg-surface-canvas hover:bg-surface-ice border border-border-subtle/60 cursor-pointer flex items-center gap-space-xs transition-colors"
                              onClick={() => {
                                setSpecialtyInput(item.name);
                                setSpecialtyPopoverOpen(false);
                              }}
                            >
                              <div className="w-8 h-8 rounded-lg bg-surface-ice flex items-center justify-center text-secondary shrink-0">
                                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-label-md text-label-md font-bold text-on-surface truncate">
                                  {item.name}
                                </span>
                                <span className="font-label-sm text-label-sm text-on-surface-variant">
                                  {item.docs}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-space-xs border-t border-border-subtle/50 text-label-sm">
                          <span className="text-on-surface-variant">Over 140+ verified sub-specialists</span>
                          <button
                            type="button"
                            className="text-brand-blue-interactive hover:underline font-bold flex items-center gap-0.5"
                            onClick={() => {
                              setSpecialtyInput("");
                              setSpecialtyPopoverOpen(false);
                            }}
                          >
                            <span>Clear Filter</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field 3: Budget / Package */}
                  <div className="lg:col-span-3 bg-surface-canvas hover:bg-surface-ice transition-colors rounded-xl px-space-md min-h-[64px] sm:h-20 flex items-center gap-space-sm border border-border-subtle focus-within:border-brand-blue-interactive focus-within:ring-2 focus-within:ring-brand-blue-interactive/20 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-surface-ice flex items-center justify-center shrink-0 text-secondary">
                      <span className="material-symbols-outlined text-[28px]">payments</span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant leading-none font-semibold mb-1 uppercase tracking-wider">
                        Budget / Package
                      </span>
                      <select
                        className="bg-transparent font-title-md text-title-md text-on-surface outline-none w-full truncate font-bold cursor-pointer"
                        value={budgetFilter}
                        onChange={(e) => setBudgetFilter(e.target.value)}
                      >
                        <option value="all">All Budgets / Cashless</option>
                        <option value="50k">Under ₹50,000 (Daycare / Basic)</option>
                        <option value="50k-150k">₹50,000 - ₹1.5 Lakh (Standard)</option>
                        <option value="150k-300k">₹1.5 Lakh - ₹3 Lakh (Surgical)</option>
                        <option value="300k-500k">₹3 Lakh - ₹5 Lakh (Super Specialty)</option>
                        <option value="500k-plus">₹5 Lakh+ (Advanced / Transplant)</option>
                      </select>
                    </div>
                  </div>

                  {/* Field 4: Big Find Button */}
                  <div className="lg:col-span-2">
                    <button
                      className="w-full h-14 sm:h-20 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-headline-md text-headline-md flex items-center justify-center gap-space-sm transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] font-bold text-base sm:text-headline-md"
                      type="button"
                      onClick={() => {
                        const target = document.getElementById("hospital-results");
                        if (target) target.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <span className="material-symbols-outlined text-[24px] sm:text-[28px]">search</span>
                      <span className="tracking-wide font-bold">Find</span>
                    </button>
                  </div>
                </div>

                {/* Fast Filters Row */}
                <div className="flex items-center gap-space-sm overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap pt-space-sm border-t border-border-subtle/50 w-full no-scrollbar">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mr-space-xs flex items-center gap-1.5 shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
                    Fast Filters:
                  </span>

                  <button
                    className={`inline-flex items-center gap-space-xs px-space-md py-2 rounded-full font-label-md text-label-md font-bold shadow-sm transition-all ${
                      cashlessOnly
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-ice text-secondary border border-border-subtle/60"
                    }`}
                    type="button"
                    onClick={() => setCashlessOnly(!cashlessOnly)}
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Cashless Network Only</span>
                    {cashlessOnly && (
                      <span className="material-symbols-outlined text-[16px] ml-0.5 hover:opacity-75">check</span>
                    )}
                  </button>

                  <button
                    className={`inline-flex items-center gap-space-xs px-space-md py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
                      liveIcuOnly
                        ? "bg-secondary-container text-on-secondary-container font-bold"
                        : "bg-surface-ice text-secondary hover:bg-surface-container border border-border-subtle/60 font-semibold"
                    }`}
                    type="button"
                    onClick={() => setLiveIcuOnly(!liveIcuOnly)}
                  >
                    <span className="material-symbols-outlined text-[18px]">hotel</span>
                    <span>Live ICU Beds Available</span>
                  </button>

                  <button
                    className={`inline-flex items-center gap-space-xs px-space-md py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
                      accreditedOnly
                        ? "bg-secondary-container text-on-secondary-container font-bold"
                        : "bg-surface-ice text-secondary hover:bg-surface-container border border-border-subtle/60 font-semibold"
                    }`}
                    type="button"
                    onClick={() => setAccreditedOnly(!accreditedOnly)}
                  >
                    <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                    <span>NABH / JCI Accredited</span>
                  </button>

                  <button
                    className={`inline-flex items-center gap-space-xs px-space-md py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
                      emergencyOnly
                        ? "bg-secondary-container text-on-secondary-container font-bold"
                        : "bg-surface-ice text-secondary hover:bg-surface-container border border-border-subtle/60 font-semibold"
                    }`}
                    type="button"
                    onClick={() => setEmergencyOnly(!emergencyOnly)}
                  >
                    <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
                    <span>24x7 Emergency</span>
                  </button>

                  <button
                    className={`inline-flex items-center gap-space-xs px-space-md py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
                      roboticSurgery
                        ? "bg-secondary-container text-on-secondary-container font-bold"
                        : "bg-surface-ice text-secondary hover:bg-surface-container border border-border-subtle/60 font-semibold"
                    }`}
                    type="button"
                    onClick={() => setRoboticSurgery(!roboticSurgery)}
                  >
                    <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
                    <span>Robotic Surgery</span>
                  </button>
                </div>
              </div>

              {/* Priority Zero-Deposit Emergency Triage Desk Banner */}
              <div className="w-full rounded-2xl bg-[#410001] text-white p-space-md lg:p-space-lg shadow-md border border-red-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px] text-red-300">emergency_heat</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
                      <span className="font-headline-md text-headline-md font-bold leading-tight text-white">
                        Priority Zero-Deposit Emergency Triage Desk
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-red-100/80 mt-0.5">
                      Need instant bed reservation without upfront security deposit? Medi Route TPA field officers take over approvals in under 20 minutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm w-full md:w-auto shrink-0">
                  <a
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#7f1d1d] font-label-md text-label-md font-bold shadow-sm transition-colors text-sm"
                    href="tel:18006334768"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#b91c1c]">phone_in_talk</span>
                    <span>1800-MEDI-ROUTE</span>
                  </a>
                  <a
                    href="https://wa.me/9118006334768?text=Hello%20Medi%20Route,%20I%20need%20urgent%20hospital%20admission%20assistance."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-label-md text-label-md font-bold shadow-sm transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>WhatsApp Desk</span>
                  </a>
                </div>
              </div>

            </div>
          </section>

          {/* 2. TWO-COLUMN DISCOVERY GRID */}
          <div className="max-w-[1280px] mx-auto px-margin lg:px-margin-lg w-full py-space-lg" id="hospital-results">
            
            {/* Mobile Filter & Sort Bar */}
            <div className="lg:hidden flex items-center justify-between gap-2 mb-4 bg-surface-card p-2.5 rounded-xl border border-border-subtle shadow-sm">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface-ice hover:bg-surface-container text-secondary font-label-md font-bold text-xs sm:text-sm border border-border-subtle transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>{mobileFiltersOpen ? "Hide Filters" : "Filter Hospitals"}</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[11px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex-1">
                <select
                  className="w-full bg-surface-canvas rounded-lg px-2.5 py-2 font-label-sm text-label-sm text-on-surface outline-none border border-border-subtle font-semibold cursor-pointer text-xs sm:text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="relevance">Sort: Distance</option>
                  <option value="beds">Sort: ICU Beds</option>
                  <option value="rating">Sort: Rating</option>
                  <option value="turnaround">Sort: Pre-Auth</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              
              {/* Left Sidebar: Filter Discovery */}
              <aside className={`lg:col-span-4 flex flex-col gap-space-lg ${mobileFiltersOpen ? "block" : "hidden lg:flex"}`}>
                <div className="bg-surface-card rounded-xl p-space-md shadow-sm border border-border-subtle flex flex-col gap-space-lg sticky top-24">
                  
                  {/* Title & Reset */}
                  <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle/60">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Filter Discovery</h3>
                    <button
                      className="font-label-sm text-label-sm text-secondary hover:underline font-bold"
                      type="button"
                      onClick={resetFilters}
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Distance Radius */}
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-title-md text-title-md text-on-surface font-semibold">Distance Radius</span>
                      <span className="font-label-md text-label-md text-secondary font-bold" id="radius-val">
                        Within {distanceRadius} km
                      </span>
                    </div>
                    <input
                      className="w-full accent-secondary cursor-pointer"
                      id="distance-slider"
                      max="30"
                      min="2"
                      type="range"
                      value={distanceRadius}
                      onChange={(e) => setDistanceRadius(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant">
                      <span>2 km</span>
                      <span>10 km</span>
                      <span>20 km</span>
                      <span>30 km</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-space-xs">
                      {[
                        { km: 5, count: 4 },
                        { km: 15, count: 9 },
                        { km: 25, count: 14 },
                      ].map((item) => (
                        <button
                          key={item.km}
                          type="button"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all cursor-pointer border ${
                            distanceRadius === item.km
                              ? "bg-secondary text-on-secondary border-secondary shadow-sm"
                              : "bg-surface-canvas text-on-surface border-border-subtle hover:bg-surface-ice"
                          }`}
                          onClick={() => setDistanceRadius(item.km)}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${distanceRadius === item.km ? "text-on-secondary" : "text-outline-variant"}`}>
                            {distanceRadius === item.km ? "check_box" : "check_box_outline_blank"}
                          </span>
                          <span>Within {item.km}km</span>
                          <span className={`text-xs ${distanceRadius === item.km ? "text-on-secondary/80" : "text-on-surface-variant"}`}>({item.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accreditations & Quality */}
                  <div className="flex flex-col gap-space-xs border-t border-border-subtle/50 pt-space-sm">
                    <span className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">
                      Accreditations &amp; Quality
                    </span>
                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer select-none">
                      <div className="flex items-center gap-space-xs">
                        <input
                          checked={filterNabh}
                          onChange={(e) => setFilterNabh(e.target.checked)}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                          type="checkbox"
                        />
                        <span className="font-body-md text-body-md text-on-surface">NABH Accredited</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">12</span>
                    </label>

                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer select-none">
                      <div className="flex items-center gap-space-xs">
                        <input
                          checked={filterJci}
                          onChange={(e) => setFilterJci(e.target.checked)}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                          type="checkbox"
                        />
                        <span className="font-body-md text-body-md text-on-surface">JCI International</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">3</span>
                    </label>

                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer select-none">
                      <div className="flex items-center gap-space-xs">
                        <input
                          checked={filterNabl}
                          onChange={(e) => setFilterNabl(e.target.checked)}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                          type="checkbox"
                        />
                        <span className="font-body-md text-body-md text-on-surface">NABL Diagnostic Labs</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">11</span>
                    </label>
                  </div>

                  {/* Room Preference Entitlement */}
                  <div className="flex flex-col gap-space-xs border-t border-border-subtle/50 pt-space-sm">
                    <span className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">
                      Room Preference Entitlement
                    </span>
                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer">
                      <div className="flex items-center gap-space-xs">
                        <input
                          checked={selectedRoomType === "deluxe"}
                          onChange={() => setSelectedRoomType(selectedRoomType === "deluxe" ? "all" : "deluxe")}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                          type="checkbox"
                        />
                        <span className="font-body-md text-body-md text-on-surface">Single Private Deluxe</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-secondary font-bold">100% Cashless</span>
                    </label>

                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer">
                      <div className="flex items-center gap-space-xs">
                        <input
                          checked={selectedRoomType === "twin"}
                          onChange={() => setSelectedRoomType(selectedRoomType === "twin" ? "all" : "twin")}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                          type="checkbox"
                        />
                        <span className="font-body-md text-body-md text-on-surface">Twin Sharing AC</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Available</span>
                    </label>

                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer">
                      <div className="flex items-center gap-space-xs">
                        <input
                          checked={selectedRoomType === "general"}
                          onChange={() => setSelectedRoomType(selectedRoomType === "general" ? "all" : "general")}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                          type="checkbox"
                        />
                        <span className="font-body-md text-body-md text-on-surface">General / Semi-Private</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Available</span>
                    </label>
                  </div>

                  {/* Clinical Procedures */}
                  <div className="flex flex-col gap-space-xs border-t border-border-subtle/50 pt-space-sm">
                    <span className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">
                      Clinical Procedures
                    </span>
                    <div className="flex flex-wrap gap-space-xs">
                      {[
                        "Cardiology (Angio/CABG)",
                        "Knee Replacement",
                        "Gallbladder Laparoscopy",
                        "IVF & Fertility Care",
                        "Spine Micro-decompression",
                      ].map((proc) => (
                        <button
                          key={proc}
                          type="button"
                          className={`px-space-sm py-1 rounded-lg text-body-sm font-body-sm transition-colors text-left ${
                            selectedProcedure === proc
                              ? "bg-secondary text-on-secondary font-bold"
                              : "bg-surface-canvas text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
                          }`}
                          onClick={() => setSelectedProcedure(selectedProcedure === proc ? null : proc)}
                        >
                          {proc}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </aside>

              {/* Right Column: Verified Hospitals List */}
              <section className="lg:col-span-8 flex flex-col gap-space-md">
                
                {/* Results Header & Sort Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm bg-surface-card p-space-sm px-space-md rounded-xl shadow-sm border border-border-subtle">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                      Verified Hospitals
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      (Showing {hospitals.length > 0 ? (safeCurrentPage - 1) * HOSPITALS_PER_PAGE + 1 : 0} -{" "}
                      {Math.min(safeCurrentPage * HOSPITALS_PER_PAGE, hospitals.length)} of {hospitals.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-space-xs self-end sm:self-auto">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Sort:</span>
                    <select
                      className="bg-surface-canvas rounded-lg px-space-sm py-1 font-label-md text-label-md text-on-surface outline-none cursor-pointer border border-border-subtle"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="relevance">Relevance &amp; Distance</option>
                      <option value="beds">Bed Availability (High to Low)</option>
                      <option value="rating">Patient Rating (High to Low)</option>
                      <option value="turnaround">Pre-auth Turnaround Time</option>
                    </select>
                  </div>
                </div>

                {/* Hospital Cards List (4 Hospitals per Page) */}
                {paginatedHospitals.length === 0 ? (
                  <div className="bg-surface-card rounded-xl p-space-xl text-center border border-border-subtle flex flex-col items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant">search_off</span>
                    <h3 className="font-headline-md text-headline-md font-bold">No hospitals found matching criteria</h3>
                    <p className="font-body-md text-on-surface-variant">Try expanding your distance radius or clearing some filters.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-space-md py-space-xs bg-primary-container text-on-primary rounded-lg font-label-md font-semibold"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  paginatedHospitals.map((hospital) => {
                    const isCompared = comparedHospitals.includes(hospital.id);

                    return (
                      <article
                        key={hospital.id}
                        className="bg-surface-card rounded-xl p-space-md lg:p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md transition-all hover:shadow-md"
                      >
                        {/* Header: Image, Title, Rating, Compare Toggle */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-space-sm">
                          <div className="flex gap-space-md">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container relative">
                              <img
                                className="w-full h-full object-cover"
                                src={(hospital as any).image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80"}
                                alt={hospital.name}
                              />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex flex-wrap items-center gap-space-xs mb-1">
                                <span className="px-space-xs py-0.5 rounded-lg bg-surface-container text-secondary font-label-sm text-label-sm font-bold">
                                  {Math.round(hospital.distance * 3)} mins away • {hospital.distance} km
                                </span>
                                <span className="px-space-xs py-0.5 rounded-lg bg-badge-rating/20 text-on-surface font-label-sm text-label-sm font-bold flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[14px] text-badge-rating" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    star
                                  </span>
                                  <span>{hospital.rating}</span>
                                  <span className="text-on-surface-variant font-normal">({hospital.reviewCount})</span>
                                </span>
                              </div>
                              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                                {hospital.name}
                              </h2>
                              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
                                {hospital.address}
                              </span>
                            </div>
                          </div>

                          {/* + Add to Compare Button */}
                          <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-start">
                            <button
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                                isCompared
                                  ? "bg-secondary text-on-secondary shadow-sm"
                                  : "bg-surface-ice hover:bg-surface-container text-secondary border border-border-subtle"
                              }`}
                              type="button"
                              onClick={() => toggleCompare(hospital.id)}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isCompared ? "check" : "add"}
                              </span>
                              <span>{isCompared ? "Added to Compare" : "+ Add to Compare"}</span>
                            </button>
                          </div>
                        </div>

                        {/* 4-Metric Telemetry Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm bg-surface-canvas p-space-sm rounded-lg border border-border-subtle/50">
                          {hospital.metrics?.map((metric: any, mIdx: number) => (
                            <div key={mIdx} className="flex flex-col">
                              <span className="font-label-sm text-label-sm text-on-surface-variant">{metric.label}</span>
                              <span
                                className={`font-label-md text-label-md font-bold flex items-center gap-1 ${
                                  metric.isIcu
                                    ? "text-badge-cashless"
                                    : metric.isQuality || metric.isDesk
                                    ? "text-secondary"
                                    : "text-on-surface"
                                }`}
                              >
                                {metric.isIcu && (
                                  <span className="inline-block w-2 h-2 rounded-full bg-badge-cashless animate-pulse"></span>
                                )}
                                {metric.isDesk && (
                                  <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                                )}
                                <span>{metric.value}</span>
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Tags & Dual Action CTAs */}
                        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-border-subtle/40">
                          <div className="flex items-center gap-space-xs flex-wrap">
                            {hospital.tags?.map((tag: any, tIdx: number) => (
                              <span
                                key={tIdx}
                                className={`inline-flex items-center gap-1 px-space-xs py-1 rounded-lg font-label-sm text-label-sm font-semibold ${
                                  tag.isCheck
                                    ? "bg-badge-cashless/10 text-badge-cashless"
                                    : "bg-surface-container text-on-surface font-medium"
                                }`}
                              >
                                {tag.isCheck && (
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                )}
                                <span>{tag.label}</span>
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-space-xs w-full sm:w-auto">
                            <button
                              className="flex-1 sm:flex-initial px-space-md py-2.5 sm:py-space-xs rounded-lg bg-surface-ice hover:bg-surface-container text-secondary font-label-md text-label-md font-semibold transition-colors border border-border-subtle text-center justify-center text-xs sm:text-label-md"
                              type="button"
                              onClick={() => {
                                setModalHospital(hospital);
                                setModalType("beds");
                              }}
                            >
                              Check Bed Availability
                            </button>
                            <button
                              className="flex-1 sm:flex-initial px-space-md py-2.5 sm:py-space-xs rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-colors shadow-sm text-center justify-center text-xs sm:text-label-md"
                              type="button"
                              onClick={() => {
                                setModalHospital(hospital);
                                setModalType("admission");
                                setAdmissionSuccess(false);
                              }}
                            >
                              Book Cashless Admission
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-md border-t border-border-subtle">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Showing {hospitals.length > 0 ? (safeCurrentPage - 1) * HOSPITALS_PER_PAGE + 1 : 0} -{" "}
                    {Math.min(safeCurrentPage * HOSPITALS_PER_PAGE, hospitals.length)} of {hospitals.length} network hospitals
                  </span>
                  <div className="flex items-center gap-space-xs">
                    <button
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border border-border-subtle transition-colors ${
                        safeCurrentPage <= 1
                          ? "bg-surface-card text-outline-variant cursor-not-allowed opacity-50"
                          : "bg-surface-card hover:bg-surface-container text-on-surface cursor-pointer"
                      }`}
                      disabled={safeCurrentPage <= 1}
                      type="button"
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        const target = document.getElementById("hospital-results");
                        if (target) target.scrollIntoView({ behavior: "smooth" });
                      }}
                      title="Previous Tab"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    {paginationItems.map((item, idx) => {
                      if (item === "...") {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-8 h-10 flex items-center justify-center font-bold text-on-surface-variant select-none"
                          >
                            ...
                          </span>
                        );
                      }
                      const pageNum = item as number;
                      const isActive = safeCurrentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          className={`w-10 h-10 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center transition-colors border cursor-pointer ${
                            isActive
                              ? "bg-primary-container text-on-primary border-primary-container shadow-sm"
                              : "bg-surface-card hover:bg-surface-container text-on-surface border-border-subtle"
                          }`}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            const target = document.getElementById("hospital-results");
                            if (target) target.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border border-border-subtle transition-colors ${
                        safeCurrentPage >= totalPages
                          ? "bg-surface-card text-outline-variant cursor-not-allowed opacity-50"
                          : "bg-surface-card hover:bg-surface-container text-on-surface cursor-pointer"
                      }`}
                      disabled={safeCurrentPage >= totalPages}
                      type="button"
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        const target = document.getElementById("hospital-results");
                        if (target) target.scrollIntoView({ behavior: "smooth" });
                      }}
                      title="Next Tab"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>

              </section>

            </div>
          </div>

          {/* 3. FLOATING COMPARE DOCK */}
          {comparedHospitals.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between sm:justify-start gap-2 sm:gap-space-md bg-surface-card/95 backdrop-blur-xl border border-border-subtle p-2 sm:p-space-sm px-3 sm:px-space-lg rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-200 w-[92%] sm:w-auto max-w-md sm:max-w-none">
              <div className="flex items-center gap-space-sm text-on-surface">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-ice flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">compare_arrows</span>
                </div>
                <span className="font-label-md text-label-md font-semibold text-xs sm:text-sm">
                  <span className="font-bold text-secondary">{comparedHospitals.length}</span> Hospitals selected for comparison
                </span>
              </div>
              <Link
                className="inline-flex items-center gap-space-xs px-3 sm:px-space-md py-1.5 sm:py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-bold transition-all shadow-sm text-xs sm:text-sm shrink-0"
                href={`/compare?ids=${comparedHospitals.join(",")}`}
              >
                <span>Compare Now</span>
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">arrow_forward</span>
              </Link>
            </div>
          )}

          {/* 4. MODALS FOR BEDS & CASHLESS ADMISSION */}
          {modalType && modalHospital && (
            <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-space-md animate-in fade-in duration-150">
              <div className="bg-surface-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-space-lg shadow-2xl border border-border-subtle flex flex-col gap-space-md relative">
                <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle">
                  <div className="flex items-center gap-space-xs font-title-md text-title-md text-primary-container font-bold">
                    <span className="material-symbols-outlined text-secondary">
                      {modalType === "beds" ? "hotel" : "verified_user"}
                    </span>
                    <span>{modalType === "beds" ? "Real-Time Bed Telemetry" : "Fast-Track Cashless Admission"}</span>
                  </div>
                  <button
                    className="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                    onClick={() => {
                      setModalType(null);
                      setModalHospital(null);
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="flex items-center gap-space-sm p-space-sm bg-surface-ice rounded-xl border border-border-subtle">
                  <div className="w-12 h-12 rounded-lg bg-surface-card flex items-center justify-center font-bold text-secondary">
                    <span className="material-symbols-outlined text-[24px]">local_hospital</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md font-bold text-on-surface text-[16px]">{modalHospital.name}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{modalHospital.address}</p>
                  </div>
                </div>

                {modalType === "beds" ? (
                  <div className="flex flex-col gap-space-sm">
                    <div className="grid grid-cols-2 gap-space-sm">
                      <div className="p-space-sm bg-surface-canvas rounded-xl border border-border-subtle">
                        <span className="text-xs text-on-surface-variant font-semibold">Live CCU / ICU Beds</span>
                        <div className="font-headline-lg font-bold text-badge-cashless flex items-center gap-1.5 mt-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-badge-cashless animate-pulse"></span>
                          <span>{modalHospital.liveIcu} Open</span>
                        </div>
                      </div>
                      <div className="p-space-sm bg-surface-canvas rounded-xl border border-border-subtle">
                        <span className="text-xs text-on-surface-variant font-semibold">Single Deluxe Room</span>
                        <div className="font-headline-lg font-bold text-on-surface mt-1">
                          {modalHospital.roomAvailable.split(" ")[0]} Free
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Telemetry updated live via hospital HIMS server. Bed reservations held for 90 minutes upon generating admission token.
                    </p>
                    <button
                      className="w-full py-space-sm bg-primary-container text-on-primary rounded-xl font-label-md font-bold shadow-sm"
                      onClick={() => setModalType("admission")}
                      type="button"
                    >
                      Proceed to Cashless Admission
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-space-sm">
                    {admissionSuccess ? (
                      <div className="p-space-md bg-surface-ice rounded-xl border border-border-subtle flex flex-col gap-space-xs text-center items-center">
                        <span className="material-symbols-outlined text-badge-cashless text-[40px]">check_circle</span>
                        <h4 className="font-headline-md font-bold text-primary-container">Pre-Auth Reservation Locked!</h4>
                        <p className="text-body-sm text-on-surface-variant">
                          Token #MR-8849-BLR generated. Upfront deposit ₹0 confirmed. Proceed to Reception Desk 4 at {modalHospital.name}.
                        </p>
                        <button
                          className="mt-space-sm w-full py-2 bg-primary-container text-on-primary rounded-lg font-label-md font-semibold"
                          onClick={() => {
                            setModalType(null);
                            setModalHospital(null);
                          }}
                          type="button"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-on-surface">ABHA ID or Health Policy Number</label>
                          <input
                            className="w-full px-space-sm py-2 bg-surface-canvas border border-border-subtle rounded-lg text-sm font-semibold"
                            defaultValue="STAR-2024-8849-BLR"
                            placeholder="e.g. 14-digit ABHA or Star/HDFC ID"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-on-surface">Patient Contact Phone</label>
                          <input
                            className="w-full px-space-sm py-2 bg-surface-canvas border border-border-subtle rounded-lg text-sm font-semibold"
                            defaultValue="+91 98450 12345"
                            placeholder="+91 Mobile number"
                          />
                        </div>
                        <div className="p-space-xs bg-surface-canvas rounded-lg text-xs text-on-surface-variant flex justify-between">
                          <span>Pre-Auth Security Deposit:</span>
                          <span className="font-bold text-secondary">Waived (₹0)</span>
                        </div>
                        <button
                          className="w-full py-space-sm bg-primary-container hover:bg-primary text-on-primary rounded-xl font-label-md font-bold shadow-sm transition-colors"
                          onClick={() => setAdmissionSuccess(true)}
                          type="button"
                        >
                          Generate Cashless Token
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
