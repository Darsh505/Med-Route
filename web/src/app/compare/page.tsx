"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface HospitalComparisonData {
  id: string;
  name: string;
  shortName: string;
  location: string;
  distance: string;
  eta: string;
  rating: number;
  imageUrl: string;
  cashlessEligibility: string;
  approvalTurnaround: string;
  turnaroundNote: string;
  turnaroundMinutes: number;
  upfrontDeposit: string;
  icuBeds: string;
  openIcus: string;
  deluxeTariff: string;
  tariffCoverage: string;
  accreditations: string[];
  nps: string;
}

const DEFAULT_COMPARISON_HOSPITALS: HospitalComparisonData[] = [
  {
    id: "manipal",
    name: "Manipal Hospital",
    shortName: "Manipal",
    location: "HAL Airport Rd",
    distance: "5.2 km",
    eta: "14m ETA",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&q=80",
    cashlessEligibility: "100% Cashless",
    approvalTurnaround: "28 mins",
    turnaroundNote: "Fastest in corridor",
    turnaroundMinutes: 28,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "45 Beds",
    openIcus: "10 open ICUs",
    deluxeTariff: "₹4,500",
    tariffCoverage: "100% covered",
    accreditations: ["NABH", "JCI"],
    nps: "94%",
  },
  {
    id: "apollo",
    name: "Apollo Hospital",
    shortName: "Apollo",
    location: "Bannerghatta Rd",
    distance: "11.4 km",
    eta: "16m ETA",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
    cashlessEligibility: "100% Cashless",
    approvalTurnaround: "45 mins",
    turnaroundNote: "Standard corridor",
    turnaroundMinutes: 45,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "60 Beds",
    openIcus: "14 open ICUs",
    deluxeTariff: "₹5,200",
    tariffCoverage: "100% covered",
    accreditations: ["NABH", "JCI Global"],
    nps: "91%",
  },
  {
    id: "fortis",
    name: "Fortis Healthcare",
    shortName: "Fortis",
    location: "Cunningham Rd",
    distance: "7.1 km",
    eta: "19m ETA",
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80",
    cashlessEligibility: "100% Cashless",
    approvalTurnaround: "38 mins",
    turnaroundNote: "Priority corridor",
    turnaroundMinutes: 38,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "38 Beds",
    openIcus: "12 open ICUs",
    deluxeTariff: "₹4,800",
    tariffCoverage: "100% covered",
    accreditations: ["NABH", "NABL"],
    nps: "89%",
  },
];

const AVAILABLE_TO_ADD: HospitalComparisonData[] = [
  {
    id: "sakra",
    name: "Sakra World Hospital",
    shortName: "Sakra",
    location: "Outer Ring Rd, Marathahalli",
    distance: "4.2 km",
    eta: "12m ETA",
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80",
    cashlessEligibility: "100% Cashless",
    approvalTurnaround: "14 mins",
    turnaroundNote: "Ultra-fast track",
    turnaroundMinutes: 14,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "50 Beds",
    openIcus: "12 open ICUs",
    deluxeTariff: "₹4,900",
    tariffCoverage: "100% covered",
    accreditations: ["NABH", "JCI Gold"],
    nps: "96%",
  },
  {
    id: "aster",
    name: "Aster CMI Hospital",
    shortName: "Aster CMI",
    location: "Hebbal, Bangalore",
    distance: "8.1 km",
    eta: "18m ETA",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80",
    cashlessEligibility: "100% Cashless",
    approvalTurnaround: "20 mins",
    turnaroundNote: "Medi Route Desk",
    turnaroundMinutes: 20,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "42 Beds",
    openIcus: "9 open ICUs",
    deluxeTariff: "₹4,700",
    tariffCoverage: "100% covered",
    accreditations: ["NABH", "NABL"],
    nps: "93%",
  },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const [selectedHospitals, setSelectedHospitals] = useState<HospitalComparisonData[]>(DEFAULT_COMPARISON_HOSPITALS);
  const [diffOnly, setDiffOnly] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [bookedHospital, setBookedHospital] = useState<string | null>(null);

  const gridColStyle = {
    display: "grid",
    gridTemplateColumns: `220px repeat(${selectedHospitals.length}, minmax(180px, 1fr))`,
  };

  const removeHospital = (id: string) => {
    if (selectedHospitals.length <= 1) {
      alert("At least 1 hospital must remain in comparison.");
      return;
    }
    setSelectedHospitals((prev) => prev.filter((h) => h.id !== id));
  };

  const addHospital = (h: HospitalComparisonData) => {
    if (selectedHospitals.find((item) => item.id === h.id)) return;
    if (selectedHospitals.length >= 4) {
      alert("Maximum 4 hospitals can be compared.");
      return;
    }
    setSelectedHospitals((prev) => [...prev, h]);
    setAddDropdownOpen(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Medi Route Hospital Comparison",
        text: "Compare hospitals side-by-side for cashless admission.",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <main className="w-full pt-20 lg:pt-28 bg-surface-canvas min-h-screen">
      <div className="flex flex-col w-full">
        <div className="max-w-[1280px] mx-auto w-full px-margin lg:px-margin-lg py-space-md flex flex-col gap-space-lg">
          
          {/* Breadcrumb Strip */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
            <nav className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
              <Link className="hover:text-primary-container transition-colors" href="/">
                Home
              </Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-secondary font-bold">Compare Hospitals</span>
            </nav>
          </div>

          {/* Page Hero Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-space-xs max-w-3xl">
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary-container tracking-tight font-bold">
                Hospital Comparison
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Side-by-side benchmarking across cashless clearance speed, live bed status, room tariffs, and clinical pedigree.
              </p>
            </div>
            
            <div className="flex items-center gap-space-xs shrink-0">
              <button
                className="flex items-center gap-space-xs px-space-md py-2 bg-surface-card hover:bg-surface-container border border-subtle transition-colors rounded-lg shadow-sm text-on-surface font-label-md text-label-md font-semibold cursor-pointer"
                id="btn-share"
                type="button"
                onClick={handleShare}
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  {shareCopied ? "check" : "share"}
                </span>
                <span>{shareCopied ? "Link Copied!" : "Share"}</span>
              </button>
              
              <button
                className="flex items-center gap-space-xs px-space-md py-2 bg-surface-card hover:bg-surface-container border border-subtle transition-colors rounded-lg shadow-sm text-on-surface font-label-md text-label-md font-semibold cursor-pointer"
                id="btn-pdf"
                type="button"
                onClick={() => window.print()}
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
                <span>PDF Export</span>
              </button>
            </div>
          </div>

          {/* Hospital Selection Dock & Control Strip */}
          <div className="bg-surface-card rounded-xl p-space-md shadow-sm border border-subtle flex flex-col gap-space-md">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm flex-1">
                {selectedHospitals.map((hospital, idx) => (
                  <div
                    key={hospital.id}
                    className="flex items-center justify-between p-space-xs px-space-sm bg-surface-canvas rounded-lg border border-subtle hover:bg-surface-ice transition-colors"
                  >
                    <div className="flex items-center gap-space-xs truncate">
                      <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          {hospital.name}
                        </p>
                        <p className="text-[10px] text-on-surface-variant truncate">{hospital.location}</p>
                      </div>
                    </div>
                    <button
                      className="text-outline hover:text-error transition-colors p-0.5 ml-1 cursor-pointer"
                      title="Remove"
                      type="button"
                      onClick={() => removeHospital(hospital.id)}
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}

                {/* Add Hospital Button & Dropdown */}
                {selectedHospitals.length < 4 && (
                  <div className="relative">
                    <button
                      className="w-full h-full min-h-[44px] flex items-center justify-center gap-space-xs px-space-sm bg-surface-ice hover:bg-surface-container rounded-lg text-secondary transition-colors font-label-md text-label-md font-semibold border border-subtle cursor-pointer"
                      id="add-hospital-trigger"
                      type="button"
                      onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>+ Add Hospital</span>
                    </button>

                    {addDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-surface-card rounded-xl shadow-xl border border-subtle p-space-sm z-30 min-w-[240px]">
                        <input
                          className="w-full bg-surface-canvas rounded-lg px-space-sm py-space-xs text-body-sm font-body-sm text-on-surface focus:outline-none mb-space-xs border border-subtle"
                          placeholder="Search network..."
                          type="text"
                        />
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                          {AVAILABLE_TO_ADD.filter(
                            (a) => !selectedHospitals.some((s) => s.id === a.id)
                          ).map((avail) => (
                            <div
                              key={avail.id}
                              className="px-space-sm py-1.5 rounded-lg hover:bg-surface-ice cursor-pointer font-body-sm text-body-sm flex justify-between items-center"
                              onClick={() => addHospital(avail)}
                            >
                              <span className="font-semibold text-on-surface truncate">{avail.name}</span>
                              <span className="font-label-sm text-label-sm text-badge-cashless font-semibold shrink-0">
                                100% Cashless
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Toggles & Insurance Pill */}
              <div className="flex items-center gap-space-sm shrink-0">
                <label className="flex items-center gap-space-xs cursor-pointer select-none px-space-sm py-space-xs rounded-lg hover:bg-surface-container-low transition-colors text-label-sm text-on-surface-variant">
                  <input
                    checked={diffOnly}
                    onChange={(e) => setDiffOnly(e.target.checked)}
                    className="accent-brand-blue-interactive rounded cursor-pointer"
                    id="toggle-diff"
                    type="checkbox"
                  />
                  <span className="text-on-surface font-medium">Show differences only</span>
                </label>

                <div className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-ice rounded-lg text-secondary text-label-sm font-semibold border border-subtle">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Star Health Comprehensive</span>
                </div>
              </div>

            </div>
          </div>

          {/* Mobile Swipe Guidance Banner */}
          <div className="md:hidden flex items-center justify-between px-3 py-2 bg-surface-ice rounded-lg text-secondary text-xs font-semibold mb-2 border border-border-subtle">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              Swipe horizontally to compare side-by-side
            </span>
            <span className="font-bold">{selectedHospitals.length} Selected</span>
          </div>

          {/* Benchmark Matrix Table Container */}
          <div className="overflow-x-auto w-full pb-2 no-scrollbar">
            <div className="min-w-[700px] bg-surface-card rounded-xl shadow-sm border border-subtle overflow-hidden flex flex-col">
              
              {/* Table Header: Hospital Overview */}
              <div style={gridColStyle} className="bg-surface-card sticky top-20 z-20 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border-b border-subtle">
                <div className="flex flex-col justify-end p-space-md bg-surface-card border-r border-subtle">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">Metrics</span>
                  <span className="font-title-md text-title-md text-on-surface font-bold">Hospital Overview</span>
                </div>

                {selectedHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="p-space-md flex flex-col gap-space-xs bg-surface-card relative group border-r border-subtle last:border-r-0"
                  >
                    <div className="h-28 w-full rounded-lg overflow-hidden relative mb-space-xs bg-surface-container">
                      <img className="w-full h-full object-cover" src={hospital.imageUrl} alt={hospital.name} />
                      <span className="absolute bottom-2 right-2 px-space-xs py-0.5 rounded bg-surface-card/95 font-label-sm text-label-sm text-on-surface font-semibold shadow-sm">
                        {hospital.distance}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-space-xs">
                      <div>
                        <h2 className="font-title-md text-title-md text-on-surface font-bold leading-tight">
                          {hospital.name}
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{hospital.location}</p>
                      </div>
                      <div className="flex items-center gap-0.5 bg-badge-rating/10 px-1.5 py-0.5 rounded text-badge-rating font-bold text-label-sm shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-badge-rating" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span>{hospital.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 1: Cashless & Insurance Pre-Auth */}
              <div className="bg-surface-canvas px-space-md py-space-xs flex items-center justify-between border-b border-subtle">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider text-[11px]">
                  Cashless &amp; Insurance Pre-Auth
                </span>
              </div>

              {/* Row 1: Cashless Eligibility (Skip if diffOnly) */}
              {!diffOnly && (
                <div style={gridColStyle} className="p-space-md items-center bg-surface-card hover:bg-surface-container-low/30 transition-colors border-b border-subtle">
                  <div className="font-label-md text-label-md text-on-surface font-medium border-r border-subtle pr-space-xs">
                    Cashless Eligibility
                    <span className="block font-body-sm text-body-sm text-outline">Star Health Network</span>
                  </div>
                  {selectedHospitals.map((h) => (
                    <div key={h.id} className="text-badge-cashless font-semibold font-label-md text-label-md flex items-center gap-space-xs px-2">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>{h.cashlessEligibility}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Row 2: Approval Turnaround */}
              <div style={gridColStyle} className="p-space-md items-center bg-surface-canvas/50 hover:bg-surface-container-low/30 transition-colors border-b border-subtle">
                <div className="font-label-md text-label-md text-on-surface font-medium border-r border-subtle pr-space-xs">
                  Approval Turnaround
                  <span className="block font-body-sm text-body-sm text-outline">Median admission clearance</span>
                </div>
                {selectedHospitals.map((h) => (
                  <div key={h.id} className="px-2">
                    <span className={`font-headline-md text-headline-md font-bold ${h.turnaroundMinutes <= 30 ? "text-secondary" : "text-on-surface"}`}>
                      {h.approvalTurnaround}
                    </span>
                    <span className="block font-body-sm text-body-sm text-on-surface-variant font-medium">
                      {h.turnaroundNote}
                    </span>
                  </div>
                ))}
              </div>

              {/* Row 3: Upfront Deposit */}
              {!diffOnly && (
                <div style={gridColStyle} className="p-space-md items-center bg-surface-card hover:bg-surface-container-low/30 transition-colors border-b border-subtle">
                  <div className="font-label-md text-label-md text-on-surface font-medium border-r border-subtle pr-space-xs">
                    Upfront Deposit
                    <span className="block font-body-sm text-body-sm text-outline">Under pre-auth guarantee</span>
                  </div>
                  {selectedHospitals.map((h) => (
                    <div key={h.id} className="font-title-md text-title-md font-bold text-badge-cashless px-2">
                      {h.upfrontDeposit}
                    </div>
                  ))}
                </div>
              )}

              {/* Section 2: Ward & Bed Capacity */}
              <div className="bg-surface-canvas px-space-md py-space-xs flex items-center justify-between border-b border-subtle">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider text-[11px]">
                  Ward &amp; Bed Capacity
                </span>
              </div>

              {/* Row 4: Live ICU Bed Capacity */}
              <div style={gridColStyle} className="p-space-md items-center bg-surface-card hover:bg-surface-container-low/30 transition-colors border-b border-subtle">
                <div className="font-label-md text-label-md text-on-surface font-medium border-r border-subtle pr-space-xs">
                  Live ICU Bed Capacity
                  <span className="block font-body-sm text-body-sm text-outline">Real-time verified status</span>
                </div>
                {selectedHospitals.map((h) => (
                  <div key={h.id} className="px-2">
                    <span className="font-title-md text-title-md text-on-surface font-bold">{h.icuBeds}</span>
                    <span className="block font-body-sm text-body-sm text-badge-cashless font-semibold">{h.openIcus}</span>
                  </div>
                ))}
              </div>

              {/* Row 5: Single Deluxe Tariff */}
              <div style={gridColStyle} className="p-space-md items-center bg-surface-canvas/50 hover:bg-surface-container-low/30 transition-colors border-b border-subtle">
                <div className="font-label-md text-label-md text-on-surface font-medium border-r border-subtle pr-space-xs">
                  Single Deluxe Tariff
                  <span className="block font-body-sm text-body-sm text-outline">Cap: ₹6,000/day</span>
                </div>
                {selectedHospitals.map((h) => (
                  <div key={h.id} className="px-2">
                    <span className="font-title-md text-title-md text-on-surface font-bold">{h.deluxeTariff}</span>
                    <span className="block text-badge-cashless font-body-sm text-body-sm font-semibold">{h.tariffCoverage}</span>
                  </div>
                ))}
              </div>

              {/* Section 3: Clinical Quality & Ratings */}
              <div className="bg-surface-canvas px-space-md py-space-xs flex items-center justify-between border-b border-subtle">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider text-[11px]">
                  Clinical Quality &amp; Ratings
                </span>
              </div>

              {/* Row 6: Accreditations */}
              <div style={gridColStyle} className="p-space-md items-center bg-surface-card hover:bg-surface-container-low/30 transition-colors border-b border-subtle">
                <div className="font-label-md text-label-md text-on-surface font-medium border-r border-subtle pr-space-xs">
                  Accreditations
                  <span className="block font-body-sm text-body-sm text-outline">Quality standards</span>
                </div>
                {selectedHospitals.map((h) => (
                  <div key={h.id} className="flex flex-wrap gap-1 px-2">
                    {h.accreditations.map((acc) => (
                      <span key={acc} className="px-2 py-0.5 bg-surface-container rounded text-label-sm text-on-surface font-semibold">
                        {acc}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Row 7: Net Promoter Score */}
              <div style={gridColStyle} className="p-space-md items-center bg-surface-canvas/50 hover:bg-surface-container-low/30 transition-colors border-b border-subtle">
                <div className="font-label-md text-label-md text-on-surface font-medium border-r border-subtle pr-space-xs">
                  Net Promoter Score
                  <span className="block font-body-sm text-body-sm text-outline">Patient feedback</span>
                </div>
                {selectedHospitals.map((h) => (
                  <div key={h.id} className="px-2">
                    <span className="font-headline-md text-headline-md font-bold text-secondary">{h.nps}</span>
                    <span className="block font-body-sm text-body-sm text-on-surface-variant font-medium">Recommended</span>
                  </div>
                ))}
              </div>

              {/* Section 4: Direct Admission Action Row */}
              <div style={gridColStyle} className="p-space-md bg-surface-card gap-space-md items-center">
                <div className="flex flex-col border-r border-subtle pr-space-xs">
                  <span className="font-label-md text-label-md font-bold text-on-surface">Direct Admission</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Lock verified tariff and pre-notify helpdesk.</p>
                </div>
                {selectedHospitals.map((h) => (
                  <div key={h.id} className="flex flex-col gap-space-xs px-2">
                    <button
                      className={`w-full py-2.5 px-space-md rounded-lg font-label-md text-label-md font-semibold text-center shadow-sm transition-colors cursor-pointer ${
                        bookedHospital === h.id
                          ? "bg-badge-cashless text-on-primary"
                          : "bg-primary-container hover:bg-primary text-on-primary"
                      }`}
                      type="button"
                      onClick={() => {
                        setBookedHospital(h.id);
                        setTimeout(() => setBookedHospital(null), 3000);
                      }}
                    >
                      {bookedHospital === h.id ? "Admission Reserved!" : "Book Cashless Admission"}
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Comparative Visual Infographic Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-space-sm">
            
            {/* Bento Card 1: Speed Benchmark */}
            <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                  Speed Benchmark
                </span>
                <h3 className="font-headline-md text-headline-md text-primary-container font-bold">
                  Median Approval Time
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Pre-auth clearance benchmarked across Bangalore network.
                </p>
              </div>

              <div className="flex flex-col gap-space-xs py-space-xs">
                {selectedHospitals.map((h) => (
                  <div key={h.id} className="mb-2">
                    <div className="flex items-center justify-between font-body-sm">
                      <span className="font-medium text-on-surface">{h.name}</span>
                      <span className="font-bold text-secondary">{h.approvalTurnaround}</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2 mt-1">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${Math.min(100, (h.turnaroundMinutes / 60) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Average regional non-network turnaround is 58 minutes.
              </p>
            </div>

            {/* Bento Card 2: Geo Proximity */}
            <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                  Geo Proximity
                </span>
                <h3 className="font-headline-md text-headline-md text-primary-container font-bold">
                  Ambulance &amp; Distance
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Active GPS trajectory from your location.
                </p>
              </div>

              <div
                style={{ display: "grid", gridTemplateColumns: `repeat(${selectedHospitals.length}, minmax(0, 1fr))` }}
                className="gap-space-xs text-center py-space-xs"
              >
                {selectedHospitals.map((h) => (
                  <div key={h.id} className="p-space-xs bg-surface-canvas rounded-lg border border-subtle">
                    <p className="font-label-sm text-label-sm text-on-surface-variant font-medium truncate">{h.shortName}</p>
                    <p className="font-title-md text-title-md text-on-surface font-bold">{h.distance}</p>
                    <span className="font-label-sm text-label-sm text-secondary font-bold">{h.eta}</span>
                  </div>
                ))}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Traffic calibrated dynamically via city telemetry sensors.
              </p>
            </div>

            {/* Bento Card 3: Policy Protection */}
            <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                  Policy Protection
                </span>
                <h3 className="font-headline-md text-headline-md text-primary-container font-bold">
                  Star Health Room Cap
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  All compared hospitals qualify under daily ceiling limit.
                </p>
              </div>

              <div className="flex items-center justify-around py-space-xs">
                <div className="flex flex-col items-center">
                  <span className="font-headline-md text-headline-md font-bold text-badge-cashless">100%</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 font-medium">Pre-Authorized</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-md text-headline-md font-bold text-badge-cashless">₹0</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 font-medium">Room Co-Pay</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-md text-headline-md font-bold text-badge-cashless">0hr</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 font-medium">Wait Period</span>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No proportionate deduction penalties on single deluxe rooms.
              </p>
            </div>

          </div>

          {/* Frequently Asked Questions Accordion */}
          <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col gap-space-md mt-space-sm">
            <div className="flex flex-col gap-1">
              <h2 className="font-headline-lg text-headline-lg text-primary-container font-bold">
                Frequently Asked Questions
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                How Medi Route coordinates clinical comparisons and cashless admissions.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-surface-container">
              <details className="group py-space-sm cursor-pointer transition-colors" open>
                <summary className="flex items-center justify-between font-label-md text-label-md text-on-surface list-none font-semibold">
                  <span>How does Medi Route calculate the cashless approval guarantee?</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform text-[18px]">
                    expand_more
                  </span>
                </summary>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
                  Medi Route interfaces directly via IRDAI-compliant API gateways to the hospital TPA desk. By pre-filling patient ABHA medical records and verified coverage, authorizations are processed through priority queues in under 28 minutes.
                </p>
              </details>

              <details className="group py-space-sm cursor-pointer transition-colors">
                <summary className="flex items-center justify-between font-label-md text-label-md text-on-surface list-none font-semibold">
                  <span>What happens if a selected room tariff exceeds my insurance policy ceiling?</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform text-[18px]">
                    expand_more
                  </span>
                </summary>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
                  Our tool dynamically checks the room tariff ceiling of your synced health policy and flags potential deductions upfront, avoiding unexpected out-of-pocket bills at discharge.
                </p>
              </details>

              <details className="group py-space-sm cursor-pointer transition-colors">
                <summary className="flex items-center justify-between font-label-md text-label-md text-on-surface list-none font-semibold">
                  <span>Can I switch hospitals if live bed availability changes unexpectedly?</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform text-[18px]">
                    expand_more
                  </span>
                </summary>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
                  Yes. The on-ground buddy service can instantly re-route your pre-authorization claim package to any other Tier-1 partner hospital without restarting the insurer paperwork.
                </p>
              </details>

              <details className="group py-space-sm cursor-pointer transition-colors">
                <summary className="flex items-center justify-between font-label-md text-label-md text-on-surface list-none font-semibold">
                  <span>What is the difference between NABH and JCI accreditations?</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform text-[18px]">
                    expand_more
                  </span>
                </summary>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
                  NABH represents India's highest clinical safety standard from the Quality Council of India. JCI represents international clinical protocols. All listed partner hospitals maintain verified active credentials.
                </p>
              </details>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <div className="bg-surface-canvas min-h-screen text-on-surface antialiased">
      <Navbar />
      <Suspense fallback={<div className="pt-24 text-center">Loading comparison matrix...</div>}>
        <CompareContent />
      </Suspense>
      <Footer />
    </div>
  );
}
