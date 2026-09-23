"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation, INDIAN_CITIES } from "@/context/LocationContext";
import { ALL_HOSPITALS } from "@/data/hospitalsData";

// Alias to support useTranslation convention
const useTranslation = useTranslations;

interface CompareItem {
  id: string;
  name: string;
  location: string;
}

// City alias mapping for common variations across India
const CITY_ALIASES: Record<string, string> = {
  bangalore: "bengaluru",
  bengalore: "bengaluru",
  bombay: "mumbai",
  calcutta: "kolkata",
  madras: "chennai",
  gurgaon: "gurugram",
  "delhi ncr": "delhi",
  ncr: "delhi",
  baroda: "vadodara",
  trivandrum: "thiruvananthapuram",
  cochin: "kochi",
  mysore: "mysuru",
  mangalore: "mangaluru",
  pondicherry: "puducherry",
  banaras: "varanasi",
  kashi: "varanasi",
};

// Haversine formula — real geodesic distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function resolveCityCoordinates(cityName: string): { lat: number; lng: number } | null {
  if (!cityName || !cityName.trim()) return null;
  let term = cityName.split(",")[0].toLowerCase().trim();
  if (CITY_ALIASES[term]) term = CITY_ALIASES[term];

  // 1. Check INDIAN_CITIES
  const cityMatch = INDIAN_CITIES.find(
    (c) =>
      c.name.toLowerCase() === term ||
      c.name.toLowerCase().includes(term) ||
      term.includes(c.name.toLowerCase())
  );
  if (cityMatch) {
    return { lat: cityMatch.lat, lng: cityMatch.lng };
  }

  // 2. Check ALL_HOSPITALS
  const hospMatch = ALL_HOSPITALS.find(
    (h: any) =>
      (h.city && (h.city.toLowerCase() === term || h.city.toLowerCase().includes(term) || term.includes(h.city.toLowerCase()))) ||
      (h.state && (h.state.toLowerCase() === term || h.state.toLowerCase().includes(term)))
  );
  if (hospMatch && (hospMatch as any).latitude && (hospMatch as any).longitude) {
    return {
      lat: (hospMatch as any).latitude,
      lng: (hospMatch as any).longitude,
    };
  }

  return null;
}

function fmtCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}
function fmtCost(n: number): string {
  if (n >= 100000) return "\u20B9" + (n / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (n >= 1000) return "\u20B9" + Math.round(n / 1000) + "k";
  return "\u20B9" + n;
}

export default function HomePage() {
  const t = useTranslation();
  const { selectedCity, coords, selectCity } = useLocation();

  // Search Hub State — defaults to selectedCity from context (Hoshiarpur)
  const [cityInput, setCityInput] = useState(selectedCity || "Hoshiarpur");
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [specialtyPopoverOpen, setSpecialtyPopoverOpen] = useState(false);

  // Fast Filters State — all start OFF so all verified hospitals show initially
  const [cashlessOnly, setCashlessOnly] = useState(false);
  const [liveIcuOnly, setLiveIcuOnly] = useState(false);
  const [accreditedOnly, setAccreditedOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [roboticSurgery, setRoboticSurgery] = useState(false);

  // Sidebar Filter State
  const [distanceRadius, setDistanceRadius] = useState(25);
  const [filterNabh, setFilterNabh] = useState(false);
  const [filterJci, setFilterJci] = useState(false);
  const [filterNabl, setFilterNabl] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  // New important filters
  const [hospitalType, setHospitalType] = useState<"all" | "government" | "private" | "trust">("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [traumaOnly, setTraumaOnly] = useState(false);

  // User GPS coordinates (synced with LocationContext and active city)
  const [userLat, setUserLat] = useState(() => coords?.lat ?? 31.5273);
  const [userLng, setUserLng] = useState(() => coords?.lng ?? 75.9149);

  // Sort State
  const [sortBy, setSortBy] = useState<"relevance" | "beds" | "rating" | "turnaround" | "cost">("relevance");

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

  // Sync cityInput and coordinates when selectedCity or coords change in LocationContext
  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      setUserLat(coords.lat);
      setUserLng(coords.lng);
    }
  }, [coords]);

  useEffect(() => {
    if (selectedCity) {
      setCityInput(selectedCity);
      const c = resolveCityCoordinates(selectedCity);
      if (c) {
        setUserLat(c.lat);
        setUserLng(c.lng);
      }
    }
  }, [selectedCity]);

  // Handle typing in city input — updates input AND live coordinates
  const handleCityChange = (val: string) => {
    setCityInput(val);
    const c = resolveCityCoordinates(val);
    if (c) {
      setUserLat(c.lat);
      setUserLng(c.lng);
    }
  };

  // Handle GPS detection
  const handleGpsDetect = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLat(lat);
          setUserLng(lng);
          // Find closest city
          let nearest = INDIAN_CITIES[0];
          let minDist = Infinity;
          for (const c of INDIAN_CITIES) {
            const d = haversineKm(lat, lng, c.lat, c.lng);
            if (d < minDist) {
              minDist = d;
              nearest = c;
            }
          }
          setCityInput(nearest.name);
          selectCity(nearest.name, { lat, lng });
        },
        () => {
          alert("Unable to detect GPS position. Please check your browser location permissions.");
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  };

  // Reset pagination to page 1 whenever any filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    cashlessOnly, liveIcuOnly, accreditedOnly, emergencyOnly, roboticSurgery,
    distanceRadius, filterNabh, filterJci, filterNabl, selectedRoomType, selectedProcedure,
    hospitalType, minRating, traumaOnly, budgetFilter, sortBy, specialtyInput, cityInput, userLat, userLng,
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

  // Step 1: Base list of hospitals with real Haversine distance from current userLat/userLng
  const allHospitalsWithDistance = useMemo(() => {
    return ALL_HOSPITALS.map((h) => {
      const hLat = (h as any).latitude ?? 31.5273;
      const hLng = (h as any).longitude ?? 75.9149;
      const distance = parseFloat(haversineKm(userLat, userLng, hLat, hLng).toFixed(1));

      const liveIcu = (h as any).beds_icu_available ?? 5;
      const rating = (h as any).overall_rating ?? 4.5;
      const reviewCount = (h as any).total_reviews ?? 100;
      const accreditation: string = (h as any).accreditation ?? "";
      const isPmjay: boolean = (h as any).is_pmjay_empanelled ?? false;
      const isTrauma: boolean = (h as any).is_trauma_center ?? false;
      const typeRaw: string = ((h as any).type ?? "private").toLowerCase();
      const basePackage: number = (h as any).base_package_inr ?? 75000;
      const specialties: string[] = (h as any).specialties ?? [];
      const procedures: any[] = (h as any).procedures ?? [];

      const qualityBadge = accreditation || "NABH Accredited";
      const turnaround = isPmjay ? "Instant (Cashless)" : "20-30 min";
      const roomAvailable = `${Math.max(2, liveIcu - 2)} Beds Available`;

      const metrics: { label: string; value: string; isIcu?: boolean; isQuality?: boolean; isDesk?: boolean }[] = [
        { label: "Live ICU Beds", value: `${liveIcu} Open ICUs`, isIcu: true },
        { label: "Accreditation", value: qualityBadge, isQuality: true },
        { label: "Pre-Auth", value: turnaround },
        { label: "Beds Available", value: `${(h as any).beds_total ?? 100} Total` },
      ];

      const tags: { label: string; isCheck?: boolean }[] = [
        ...(isPmjay ? [{ label: "PMJAY / Cashless Approved", isCheck: true }] : []),
        ...(isTrauma ? [{ label: `Trauma ${(h as any).trauma_level ?? "Center"}` }] : []),
        ...(specialties.slice(0, 2).map((s: string) => ({ label: s }))),
      ];

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
        isPmjay,
        isTrauma,
        typeRaw,
        basePackage,
        specialties,
        procedures,
        accreditation,
      };
    });
  }, [userLat, userLng]);

  // Step 2: Hospitals matching current city query (used for dynamic sidebar counts)
  const cityFilteredHospitals = useMemo(() => {
    let list = allHospitalsWithDistance;
    let rawTerm = cityInput.split(",")[0].toLowerCase().trim();
    const cityTerm = CITY_ALIASES[rawTerm] || rawTerm;

    if (cityTerm && cityTerm !== "all" && cityTerm !== "india" && cityTerm !== "all cities") {
      const cityMatches = list.filter((h) => {
        const c = ((h as any).city ?? "").toLowerCase();
        const s = ((h as any).state ?? "").toLowerCase();
        return c.includes(cityTerm) || s.includes(cityTerm) || cityTerm.includes(c);
      });
      if (cityMatches.length > 0) {
        list = cityMatches;
      }
    }
    return list;
  }, [allHospitalsWithDistance, cityInput]);

  // Dynamic counts for sidebar distance chips
  const distanceCounts = useMemo(() => {
    let count5 = 0;
    let count15 = 0;
    let count25 = 0;
    let count50 = 0;
    cityFilteredHospitals.forEach((h) => {
      if (h.distance <= 5) count5++;
      if (h.distance <= 15) count15++;
      if (h.distance <= 25) count25++;
      if (h.distance <= 50) count50++;
    });
    return {
      5: count5,
      15: count15,
      25: count25,
      50: count50 || cityFilteredHospitals.length,
    };
  }, [cityFilteredHospitals]);

  // Dynamic counts for accreditation checkboxes
  const accredCounts = useMemo(() => {
    let nabh = 0;
    let jci = 0;
    let nabl = 0;
    cityFilteredHospitals.forEach((h) => {
      const a = (h.accreditation || "").toLowerCase();
      if (a.includes("nabh")) nabh++;
      if (a.includes("jci")) jci++;
      if (a.includes("nabl")) nabl++;
    });
    return { nabh, jci, nabl };
  }, [cityFilteredHospitals]);

  // Step 3: Fully filtered hospitals list
  const hospitals = useMemo(() => {
    let list = cityFilteredHospitals;

    // Cashless / PMJAY filter
    if (cashlessOnly) {
      list = list.filter((h) => h.isPmjay);
    }

    // Live ICU filter (>= 5 open ICU beds)
    if (liveIcuOnly) {
      list = list.filter((h) => h.liveIcu >= 5);
    }

    // Accreditation filters (NABH / JCI / NABL)
    const hasAccredFilter = filterNabh || filterJci || filterNabl;
    if (hasAccredFilter) {
      list = list.filter((h) => {
        const a = h.accreditation.toLowerCase();
        return (
          (filterNabh && a.includes("nabh")) ||
          (filterJci && a.includes("jci")) ||
          (filterNabl && a.includes("nabl"))
        );
      });
    }

    // accreditedOnly fast-filter
    if (accreditedOnly) {
      list = list.filter((h) => {
        const a = h.accreditation.toLowerCase();
        return a.includes("nabh") || a.includes("jci");
      });
    }

    // Emergency / Trauma filter
    if (emergencyOnly || traumaOnly) {
      list = list.filter((h) => h.isTrauma);
    }

    // Hospital type filter
    if (hospitalType !== "all") {
      list = list.filter((h) => h.typeRaw.includes(hospitalType));
    }

    // Min rating filter
    if (minRating > 0) {
      list = list.filter((h) => h.rating >= minRating);
    }

    // Budget filter
    if (budgetFilter !== "all") {
      list = list.filter((h) => {
        const p = h.basePackage;
        if (budgetFilter === "50k") return p <= 50000 || h.isPmjay;
        if (budgetFilter === "50k-150k") return p <= 150000;
        if (budgetFilter === "150k-300k") return p <= 300000;
        if (budgetFilter === "300k-500k") return p <= 500000;
        return true;
      });
    }

    // Specialty / disease search
    if (specialtyInput.trim()) {
      const term = specialtyInput.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(term) ||
          ((h as any).top_disease_treated ?? "").toLowerCase().includes(term) ||
          h.specialties.some((s: string) => s.toLowerCase().includes(term)) ||
          h.procedures.some(
            (p: any) =>
              p.name.toLowerCase().includes(term) ||
              p.disease.toLowerCase().includes(term) ||
              p.category.toLowerCase().includes(term)
          )
      );
    }

    // Procedure filter from sidebar chips
    if (selectedProcedure) {
      const procTerm = selectedProcedure.toLowerCase();
      list = list.filter(
        (h) =>
          h.specialties.some((s: string) => s.toLowerCase().includes(procTerm)) ||
          h.procedures.some(
            (p: any) =>
              p.name.toLowerCase().includes(procTerm) ||
              p.category.toLowerCase().includes(procTerm) ||
              p.disease.toLowerCase().includes(procTerm)
          )
      );
    }

    // Distance filter: only filter if distanceRadius < 50 km
    if (distanceRadius < 50) {
      list = list.filter((h) => h.distance <= distanceRadius);
    }

    // Sorting
    if (sortBy === "beds") {
      list.sort((a, b) => b.liveIcu - a.liveIcu);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "turnaround") {
      list.sort((a, b) => (a.isPmjay === b.isPmjay ? 0 : a.isPmjay ? -1 : 1));
    } else if (sortBy === "cost") {
      list.sort((a, b) => a.basePackage - b.basePackage);
    } else {
      // Default: sort by distance (closest first)
      list.sort((a, b) => a.distance - b.distance);
    }

    return list;
  }, [
    cityFilteredHospitals,
    cashlessOnly,
    liveIcuOnly,
    accreditedOnly,
    emergencyOnly,
    filterNabh,
    filterJci,
    filterNabl,
    selectedProcedure,
    hospitalType,
    minRating,
    traumaOnly,
    budgetFilter,
    specialtyInput,
    distanceRadius,
    sortBy,
  ]);

  const resetFilters = () => {
    setDistanceRadius(25);
    setFilterNabh(false);
    setFilterJci(false);
    setFilterNabl(false);
    setSelectedRoomType("all");
    setSelectedProcedure(null);
    setCashlessOnly(false);
    setLiveIcuOnly(false);
    setAccreditedOnly(false);
    setEmergencyOnly(false);
    setRoboticSurgery(false);
    setSpecialtyInput("");
    setBudgetFilter("all");
    setHospitalType("all");
    setMinRating(0);
    setTraumaOnly(false);
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
                  {t("hero.title")}
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  {t("hero.subtitle")}
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
                        {t("hero.cityLocality")}
                      </span>
                      <input
                        className="bg-transparent font-title-md text-title-md text-on-surface outline-none w-full truncate font-bold"
                        type="text"
                        value={cityInput}
                        onChange={(e) => handleCityChange(e.target.value)}
                        placeholder={t("hero.cityPlaceholder")}
                      />
                    </div>
                    <button
                      className="text-on-surface-variant hover:text-brand-blue-interactive p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                      title={t("hero.detectLocation")}
                      type="button"
                      onClick={handleGpsDetect}
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
                            {t("hero.specialtyLabel")}
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">expand_more</span>
                          </span>
                        </div>
                        <input
                          className="bg-transparent font-title-md text-title-md text-on-surface outline-none w-full truncate font-bold placeholder:text-outline-variant placeholder:font-normal"
                          id="specialty-input"
                          placeholder={t("hero.specialtyPlaceholder")}
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
                              {t("hero.popularSpecialties")}
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
                          <span className="text-on-surface-variant">{t("hero.verifiedSpecialists")}</span>
                          <button
                            type="button"
                            className="text-brand-blue-interactive hover:underline font-bold flex items-center gap-0.5"
                            onClick={() => {
                              setSpecialtyInput("");
                              setSpecialtyPopoverOpen(false);
                            }}
                          >
                            <span>{t("hero.clearFilter")}</span>
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
                        {t("hero.budgetLabel")}
                      </span>
                      <select
                        className="bg-transparent font-title-md text-title-md text-on-surface outline-none w-full truncate font-bold cursor-pointer"
                        value={budgetFilter}
                        onChange={(e) => setBudgetFilter(e.target.value)}
                      >
                        <option value="all">{t("hero.allBudgets")}</option>
                        <option value="50k">{t("hero.budgetUnder50k")}</option>
                        <option value="50k-150k">{t("hero.budget50k150k")}</option>
                        <option value="150k-300k">{t("hero.budget150k300k")}</option>
                        <option value="300k-500k">{t("hero.budget300k500k")}</option>
                        <option value="500k-plus">{t("hero.budget500kPlus")}</option>
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
                      <span className="tracking-wide font-bold">{t("hero.findHospitals")}</span>
                    </button>
                  </div>
                </div>

                {/* Fast Filters Row */}
                <div className="flex items-center gap-space-sm overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap pt-space-sm border-t border-border-subtle/50 w-full no-scrollbar">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mr-space-xs flex items-center gap-1.5 shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
                    {t("hero.fastFilters")}
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
                    <span>{t("hero.cashlessNetworkOnly")}</span>
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
                    <span>{t("hero.liveIcuBeds")}</span>
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
                    <span>{t("hero.accredited")}</span>
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
                    <span>{t("hero.emergency24x7")}</span>
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
                    <span>{t("hero.roboticSurgery")}</span>
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
                        {t("hero.emergencyBadge")}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-red-100/80 mt-0.5">
                      {t("hero.emergencyBadgeDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm w-full md:w-auto shrink-0">
                  <a
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#7f1d1d] font-label-md text-label-md font-bold shadow-sm transition-colors text-sm"
                    href="tel:18006334768"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#b91c1c]">phone_in_talk</span>
                    <span>{t("hero.callEmergency")}</span>
                  </a>
                  <a
                    href="https://wa.me/9118006334768?text=Hello%20Medi%20Route,%20I%20need%20urgent%20hospital%20admission%20assistance."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-label-md text-label-md font-bold shadow-sm transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>{t("hero.whatsappDesk")}</span>
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
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">{t("home.filterDiscovery")}</h3>
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
                      <span className="font-title-md text-title-md text-on-surface font-semibold">{t("home.distanceRadius")}</span>
                      <span className="font-label-md text-label-md text-secondary font-bold" id="radius-val">
                        {distanceRadius >= 50 ? t("home.withinAll") : t("home.withinDistance", { km: distanceRadius })}
                      </span>
                    </div>
                    <input
                      className="w-full accent-secondary cursor-pointer"
                      id="distance-slider"
                      max="50"
                      min="2"
                      type="range"
                      value={distanceRadius}
                      onChange={(e) => setDistanceRadius(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant">
                      <span>2 km</span>
                      <span>15 km</span>
                      <span>30 km</span>
                      <span>50 km (All)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-space-xs">
                      {[
                        { km: 5, label: "5km", count: distanceCounts[5] },
                        { km: 15, label: "15km", count: distanceCounts[15] },
                        { km: 25, label: "25km", count: distanceCounts[25] },
                        { km: 50, label: "50km", count: distanceCounts[50] },
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
                          <span>Within {item.label}</span>
                          <span className={`text-xs ${distanceRadius === item.km ? "text-on-secondary/80" : "text-on-surface-variant"}`}>({item.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accreditations & Quality */}
                  <div className="flex flex-col gap-space-xs border-t border-border-subtle/50 pt-space-sm">
                    <span className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">
                      {t("home.accreditations")}
                    </span>
                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer select-none">
                      <div className="flex items-center gap-space-xs">
                        <input
                          checked={filterNabh}
                          onChange={(e) => setFilterNabh(e.target.checked)}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                          type="checkbox"
                        />
                        <span className="font-body-md text-body-md text-on-surface">{t("home.nabhAccredited")}</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{accredCounts.nabh}</span>
                    </label>

                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer select-none">
                      <div className="flex items-center gap-space-xs">
                        <input
                          checked={filterJci}
                          onChange={(e) => setFilterJci(e.target.checked)}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                          type="checkbox"
                        />
                        <span className="font-body-md text-body-md text-on-surface">{t("home.jciInternational")}</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{accredCounts.jci}</span>
                    </label>

                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer select-none">
                      <div className="flex items-center gap-space-xs">
                        <input
                          checked={filterNabl}
                          onChange={(e) => setFilterNabl(e.target.checked)}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                          type="checkbox"
                        />
                        <span className="font-body-md text-body-md text-on-surface">{t("home.nablDiagnostic")}</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{accredCounts.nabl}</span>
                    </label>
                  </div>

                  {/* Hospital Type */}
                  <div className="flex flex-col gap-space-xs border-t border-border-subtle/50 pt-space-sm">
                    <span className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">{t("home.hospitalType")}</span>
                    {(["all", "government", "private", "trust"] as const).map((t) => (
                      <label key={t} className="flex items-center gap-space-xs p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer select-none">
                        <input
                          type="radio"
                          name="hospitalType"
                          checked={hospitalType === t}
                          onChange={() => setHospitalType(t)}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                        />
                        <span className="font-body-md text-body-md text-on-surface capitalize">{t === "all" ? "All Types" : t}</span>
                      </label>
                    ))}
                  </div>

                  {/* Min Patient Rating */}
                  <div className="flex flex-col gap-space-xs border-t border-border-subtle/50 pt-space-sm">
                    <span className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Min Patient Rating</span>
                    <div className="flex flex-wrap gap-2">
                      {[0, 4.0, 4.5, 4.8].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setMinRating(r)}
                          className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold border transition-all ${
                            minRating === r
                              ? "bg-secondary text-on-secondary border-secondary"
                              : "bg-surface-canvas text-on-surface border-border-subtle hover:bg-surface-ice"
                          }`}
                        >
                          {r === 0 ? "Any" : `${r}★+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trauma Center */}
                  <div className="flex flex-col gap-space-xs border-t border-border-subtle/50 pt-space-sm">
                    <label className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-canvas cursor-pointer select-none">
                      <div className="flex items-center gap-space-xs">
                        <input
                          type="checkbox"
                          checked={traumaOnly}
                          onChange={(e) => setTraumaOnly(e.target.checked)}
                          className="accent-secondary w-4 h-4 cursor-pointer"
                        />
                        <span className="font-body-md text-body-md text-on-surface">Trauma Center Only</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-badge-cashless font-bold">24x7</span>
                    </label>
                  </div>

                  {/* Clinical Procedures (now actually wired to filter) */}
                  <div className="flex flex-col gap-space-xs border-t border-border-subtle/50 pt-space-sm">
                    <span className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">
                      Clinical Procedures
                    </span>
                    <div className="flex flex-wrap gap-space-xs">
                      {[
                        { label: "Cardiology / CABG", term: "cardiology" },
                        { label: "Knee Replacement", term: "knee" },
                        { label: "Gallbladder Surgery", term: "gallbladder" },
                        { label: "IVF / Fertility", term: "ivf" },
                        { label: "Neurology / Spine", term: "neurology" },
                        { label: "Oncology", term: "oncology" },
                      ].map(({ label, term }) => (
                        <button
                          key={term}
                          type="button"
                          className={`px-space-sm py-1 rounded-lg text-body-sm font-body-sm transition-colors text-left ${
                            selectedProcedure === term
                              ? "bg-secondary text-on-secondary font-bold"
                              : "bg-surface-canvas text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
                          }`}
                          onClick={() => setSelectedProcedure(selectedProcedure === term ? null : term)}
                        >
                          {label}
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
                      <option value="turnaround">Cashless / Pre-auth First</option>
                      <option value="cost">Treatment Cost (Low to High)</option>
                    </select>
                  </div>
                </div>

                {/* Hospital Cards List (4 Hospitals per Page) */}
                {paginatedHospitals.length === 0 ? (
                  <div className="bg-surface-card rounded-xl p-space-xl text-center border border-border-subtle flex flex-col items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant">search_off</span>
                    <h3 className="font-headline-md text-headline-md font-bold">{t("home.noHospitals")}</h3>
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

                        {/* Disease Stats Strip — shown directly on card, no click needed */}
                        {(hospital as any).top_disease_treated && (
                          <div className="flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 text-label-sm">
                            <span className="font-semibold text-secondary flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">biotech</span>
                              {(hospital as any).top_disease_treated}
                            </span>
                            <span className="text-on-surface-variant">•</span>
                            {(hospital as any).total_patients_treated && (
                              <span className="flex items-center gap-1 text-on-surface-variant">
                                <span className="font-bold text-on-surface">{fmtCount((hospital as any).total_patients_treated)}</span> patients
                              </span>
                            )}
                            {(hospital as any).avg_treatment_cost && (
                              <>
                                <span className="text-on-surface-variant">•</span>
                                <span className="flex items-center gap-1 text-on-surface-variant">
                                  Avg Cost: <span className="font-bold text-on-surface">{fmtCost((hospital as any).avg_treatment_cost)}</span>
                                </span>
                              </>
                            )}
                            {(hospital as any).overall_success_ratio && (
                              <>
                                <span className="text-on-surface-variant">•</span>
                                <span className="flex items-center gap-1 text-badge-cashless font-bold">
                                  <span className="material-symbols-outlined text-[12px]">verified</span>
                                  {(hospital as any).overall_success_ratio} Success
                                </span>
                              </>
                            )}
                          </div>
                        )}

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
