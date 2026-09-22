"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface HospitalComparisonItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  state: string;
  address: string;
  tag: string;
  cost_amount: string;
  cost_desc: string;
  scheme_badge: string;
  scheme_desc: string;
  icu_beds: string;
  icu_capacity: string;
  wait_time: string;
  wait_desc: string;
  quality_pct: string;
  quality_badge: string;
  quality_desc: string;
}

const COMPARISON_MASTER: Record<string, HospitalComparisonItem> = {
  "pgimer-chandigarh": {
    id: "hosp-1",
    name: "PGIMER Chandigarh",
    slug: "pgimer-chandigarh",
    type: "Government",
    city: "Chandigarh",
    state: "Chandigarh",
    address: "Sector 12, Chandigarh",
    tag: "Government Apex",
    cost_amount: "₹38,000",
    cost_desc: "Subsidized Government Rate",
    scheme_badge: "100% Cashless PM-JAY",
    scheme_desc: "Direct admission via CGHS, ECHS & state quotas",
    icu_beds: "14 Beds Free",
    icu_capacity: "78% Capacity (220 Total)",
    wait_time: "22 Mins",
    wait_desc: "High triage volume",
    quality_pct: "96.8%",
    quality_badge: "INI Apex / MoHFW",
    quality_desc: "Quarterly NABH sterility compliance pass",
  },
  "max-super-speciality-mohali": {
    id: "hosp-2",
    name: "Max Super Speciality Mohali",
    slug: "max-super-speciality-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Phase VI, Mohali",
    tag: "Private Accredited",
    cost_amount: "₹1,45,000",
    cost_desc: "Standard Fixed Private Package",
    scheme_badge: "Empanelled TPAs + PM-JAY",
    scheme_desc: "Cashless for major corporate insurers & PM-JAY card",
    icu_beds: "6 Beds Free",
    icu_capacity: "55% Capacity (52 Total)",
    wait_time: "8 Mins",
    wait_desc: "Fast-track acute intake",
    quality_pct: "99.2%",
    quality_badge: "JCI & NABH Gold",
    quality_desc: "Continuous patient safety accreditation",
  },
  "fortis-hospital-mohali": {
    id: "hosp-3",
    name: "Fortis Hospital Mohali",
    slug: "fortis-hospital-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 62, Mohali",
    tag: "NABH / JCI Accredited",
    cost_amount: "₹1,55,000",
    cost_desc: "Standard Fixed Package",
    scheme_badge: "Empanelled Corporate TPAs",
    scheme_desc: "Cashless for 30+ insurance providers",
    icu_beds: "9 Beds Free",
    icu_capacity: "68% Capacity (68 Total)",
    wait_time: "10 Mins",
    wait_desc: "Emergency rapid response",
    quality_pct: "98.5%",
    quality_badge: "JCI & NABH Gold",
    quality_desc: "Annual clinical protocol audit",
  },
  "gmch-32-chandigarh": {
    id: "hosp-4",
    name: "GMCH Sector 32 Chandigarh",
    slug: "gmch-32-chandigarh",
    type: "Government",
    city: "Chandigarh",
    state: "Chandigarh",
    address: "Sector 32, Chandigarh",
    tag: "Government Teaching",
    cost_amount: "₹28,000",
    cost_desc: "Public Sector Subsidized",
    scheme_badge: "100% Cashless PM-JAY",
    scheme_desc: "Ayushman Bharat kiosk on ground floor",
    icu_beds: "9 Beds Free",
    icu_capacity: "82% Capacity (95 Total)",
    wait_time: "18 Mins",
    wait_desc: "Tricity emergency intake",
    quality_pct: "95.4%",
    quality_badge: "NABH Accredited",
    quality_desc: "Government clinical audit verified",
  },
  "ivy-hospital-mohali": {
    id: "hosp-5",
    name: "Ivy Hospital Mohali",
    slug: "ivy-hospital-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 71, SAS Nagar, Mohali",
    tag: "NABH Super Speciality",
    cost_amount: "₹1,20,000",
    cost_desc: "All-Inclusive Package",
    scheme_badge: "PM-JAY + Private TPAs",
    scheme_desc: "Cashless approval within 60 minutes",
    icu_beds: "7 Beds Free",
    icu_capacity: "62% Capacity (38 Total)",
    wait_time: "12 Mins",
    wait_desc: "Direct emergency triage",
    quality_pct: "97.1%",
    quality_badge: "NABH Accredited",
    quality_desc: "Routine infection surveillance pass",
  },
  "sohana-hospital-mohali": {
    id: "hosp-7",
    name: "Sohana Multi Speciality Hospital",
    slug: "sohana-hospital-mohali",
    type: "Trust",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 77, Mohali",
    tag: "Charitable Trust",
    cost_amount: "₹65,000",
    cost_desc: "Subsidized Trust Package",
    scheme_badge: "PM-JAY Gold Partner",
    scheme_desc: "Complete cashless coverage with zero top-up",
    icu_beds: "8 Beds Free",
    icu_capacity: "70% Capacity (45 Total)",
    wait_time: "15 Mins",
    wait_desc: "Community care rapid intake",
    quality_pct: "96.5%",
    quality_badge: "NABH Accredited",
    quality_desc: "Quality verified charitable care",
  },
  "alchemist-hospital-panchkula": {
    id: "hosp-6",
    name: "Alchemist Hospital Panchkula",
    slug: "alchemist-hospital-panchkula",
    type: "Private",
    city: "Panchkula",
    state: "Haryana",
    address: "Sector 21, Panchkula",
    tag: "Private Accredited",
    cost_amount: "₹1,35,000",
    cost_desc: "Transparent Private Tariff",
    scheme_badge: "PM-JAY Empanelled",
    scheme_desc: "Empanelled with Haryana state & national schemes",
    icu_beds: "5 Beds Free",
    icu_capacity: "60% Capacity (32 Total)",
    wait_time: "9 Mins",
    wait_desc: "Rapid triage protocol",
    quality_pct: "97.8%",
    quality_badge: "NABH Certified",
    quality_desc: "Quarterly patient safety inspection pass",
  },
  "christian-medical-college-ludhiana": {
    id: "hosp-9",
    name: "CMC Ludhiana",
    slug: "christian-medical-college-ludhiana",
    type: "Trust",
    city: "Ludhiana",
    state: "Punjab",
    address: "Brown Road, Ludhiana",
    tag: "Mission Apex",
    cost_amount: "₹95,000",
    cost_desc: "Mission Subsidized Package",
    scheme_badge: "PM-JAY + CGHS",
    scheme_desc: "Full cashless facility for eligible cardholders",
    icu_beds: "12 Beds Free",
    icu_capacity: "75% Capacity (95 Total)",
    wait_time: "14 Mins",
    wait_desc: "Regional acute trauma center",
    quality_pct: "98.1%",
    quality_badge: "NABH Gold",
    quality_desc: "Centennial teaching hospital protocols",
  },
  "dayanand-medical-college-ludhiana": {
    id: "hosp-10",
    name: "DMCH Ludhiana",
    slug: "dayanand-medical-college-ludhiana",
    type: "Trust",
    city: "Ludhiana",
    state: "Punjab",
    address: "Civil Lines, Ludhiana",
    tag: "Apex Teaching Hospital",
    cost_amount: "₹88,000",
    cost_desc: "Hero Heart Institute Rate",
    scheme_badge: "PM-JAY Empanelled",
    scheme_desc: "High volume PM-JAY cashless clearances",
    icu_beds: "16 Beds Free",
    icu_capacity: "72% Capacity (140 Total)",
    wait_time: "16 Mins",
    wait_desc: "High volume emergency triage",
    quality_pct: "98.4%",
    quality_badge: "NABH & NABL",
    quality_desc: "Continuous hospital clinical governance",
  },
  "aiims-new-delhi": {
    id: "hosp-18",
    name: "AIIMS New Delhi",
    slug: "aiims-new-delhi",
    type: "Government",
    city: "Delhi",
    state: "Delhi",
    address: "Ansari Nagar, New Delhi",
    tag: "National Apex",
    cost_amount: "₹22,000",
    cost_desc: "Central Government Subsidized",
    scheme_badge: "100% Cashless PM-JAY",
    scheme_desc: "National referral admission protocol",
    icu_beds: "28 Beds Free",
    icu_capacity: "90% Capacity (380 Total)",
    wait_time: "35 Mins",
    wait_desc: "National referral triage",
    quality_pct: "99.4%",
    quality_badge: "Apex National Benchmark",
    quality_desc: "Highest national sterilization and clinical audit",
  },
  "medanta-the-medicity-gurugram": {
    id: "hosp-17",
    name: "Medanta The Medicity Gurugram",
    slug: "medanta-the-medicity-gurugram",
    type: "Private",
    city: "Gurugram",
    state: "Haryana",
    address: "Sector 38, Gurugram",
    tag: "Quaternary Multi-Organ",
    cost_amount: "₹2,20,000",
    cost_desc: "Standard Private Tertiary",
    scheme_badge: "Global & Domestic TPAs",
    scheme_desc: "Cashless for 45+ corporate and private insurers",
    icu_beds: "24 Beds Free",
    icu_capacity: "65% Capacity (280 Total)",
    wait_time: "7 Mins",
    wait_desc: "Acute cardiac chest pain unit",
    quality_pct: "99.5%",
    quality_badge: "JCI & NABH Apex",
    quality_desc: "Joint Commission International benchmark",
  },
  "sir-ganga-ram-hospital-delhi": {
    id: "hosp-19",
    name: "Sir Ganga Ram Hospital Delhi",
    slug: "sir-ganga-ram-hospital-delhi",
    type: "Trust",
    city: "Delhi",
    state: "Delhi",
    address: "Rajinder Nagar, New Delhi",
    tag: "Trust Super Speciality",
    cost_amount: "₹1,25,000",
    cost_desc: "Subsidized Trust Tariff",
    scheme_badge: "Empanelled TPAs + PM-JAY",
    scheme_desc: "Dedicated charitable and insurance wing",
    icu_beds: "15 Beds Free",
    icu_capacity: "76% Capacity (125 Total)",
    wait_time: "15 Mins",
    wait_desc: "Tertiary trauma and medical ICU",
    quality_pct: "98.7%",
    quality_badge: "NABH Gold",
    quality_desc: "Academic trust compliance pass",
  },
};

function CompareContent() {
  const searchParams = useSearchParams();
  const [hosp1Key, setHosp1Key] = useState<string>("pgimer-chandigarh");
  const [hosp2Key, setHosp2Key] = useState<string>("max-super-speciality-mohali");

  useEffect(() => {
    const ids = searchParams.get("ids")?.split(",") || [];
    if (ids.length >= 2) {
      const k1 = Object.keys(COMPARISON_MASTER).find(
        (k) => k === ids[0] || COMPARISON_MASTER[k].id === ids[0]
      );
      const k2 = Object.keys(COMPARISON_MASTER).find(
        (k) => k === ids[1] || COMPARISON_MASTER[k].id === ids[1]
      );
      if (k1) setHosp1Key(k1);
      if (k2) setHosp2Key(k2);
    } else if (ids.length === 1) {
      const k1 = Object.keys(COMPARISON_MASTER).find(
        (k) => k === ids[0] || COMPARISON_MASTER[k].id === ids[0]
      );
      if (k1) {
        setHosp1Key(k1);
        const alt = Object.keys(COMPARISON_MASTER).find((k) => k !== k1);
        if (alt) setHosp2Key(alt);
      }
    }
  }, [searchParams]);

  const hosp1 = COMPARISON_MASTER[hosp1Key] || COMPARISON_MASTER["pgimer-chandigarh"];
  const hosp2 = COMPARISON_MASTER[hosp2Key] || COMPARISON_MASTER["max-super-speciality-mohali"];

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col w-full">
          {/* Header */}
          <section className="w-full py-space-xl px-gutter bg-surface">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 font-body-sm text-body-sm text-primary hover:text-on-surface transition-colors font-medium self-start"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Search</span>
              </Link>
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm uppercase tracking-wider font-semibold">
                    Clinical Telemetry
                  </span>
                  <span className="font-label-sm text-secondary font-semibold">
                    Side-by-Side Matrix
                  </span>
                </div>
                <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
                  Compare Hospitals
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1.5">
                  Side-by-side comparison of costs, verified PMJAY cashless coverage, and live ICU beds.
                </p>
              </div>
            </div>
          </section>

          {/* Comparison Cards & Selectors */}
          <div className="w-full px-gutter py-space-lg bg-background pb-space-xl">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
              {/* Hospital Headers Card Grid */}
              <div className="grid grid-cols-12 gap-space-md items-stretch">
                <div className="hidden md:flex md:col-span-4 flex-col justify-end p-space-md">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                    Select &amp; Swap
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-primary font-bold mt-1">
                    Facility Metrics
                  </h2>
                  <p className="font-body-sm text-on-surface-variant mt-1">
                    Choose any accredited facility from the regional cluster to compare.
                  </p>
                </div>

                {/* Card 1 */}
                <div className="col-span-12 sm:col-span-6 md:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border-t-4 border-primary flex flex-col justify-between gap-space-sm border border-surface-container-high/40">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                      {hosp1.tag}
                    </span>
                    <span className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span> Verified
                    </span>
                  </div>
                  <div>
                    <select
                      value={hosp1Key}
                      onChange={(e) => setHosp1Key(e.target.value)}
                      className="w-full font-headline-md text-headline-md text-on-surface font-bold bg-surface-container-low rounded-lg p-2 focus:outline-none cursor-pointer border border-transparent focus:border-primary"
                    >
                      {Object.entries(COMPARISON_MASTER).map(([k, h]) => (
                        <option key={k} value={k}>
                          {h.name} ({h.city})
                        </option>
                      ))}
                    </select>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                      {hosp1.address}
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="col-span-12 sm:col-span-6 md:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border-t-4 border-secondary flex flex-col justify-between gap-space-sm border border-surface-container-high/40">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      {hosp2.tag}
                    </span>
                    <span className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span> Verified
                    </span>
                  </div>
                  <div>
                    <select
                      value={hosp2Key}
                      onChange={(e) => setHosp2Key(e.target.value)}
                      className="w-full font-headline-md text-headline-md text-on-surface font-bold bg-surface-container-low rounded-lg p-2 focus:outline-none cursor-pointer border border-transparent focus:border-primary"
                    >
                      {Object.entries(COMPARISON_MASTER).map(([k, h]) => (
                        <option key={k} value={k}>
                          {h.name} ({h.city})
                        </option>
                      ))}
                    </select>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                      {hosp2.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm divide-y divide-surface-container overflow-hidden border border-surface-container-high/40">
                {/* Row 1: Estimated Cost */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Estimated Package Tariff
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Standard angioplasty with drug-eluting stent
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4 bg-surface-container-low p-space-md rounded-lg">
                    <div className="font-metric-xl text-metric-xl text-primary font-bold">
                      {hosp1.cost_amount}
                    </div>
                    <div className="font-body-sm text-body-sm text-secondary font-semibold mt-1">
                      {hosp1.cost_desc}
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-4 bg-surface-container-low p-space-md rounded-lg">
                    <div className="font-metric-xl text-metric-xl text-primary font-bold">
                      {hosp2.cost_amount}
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant font-medium mt-1">
                      {hosp2.cost_desc}
                    </div>
                  </div>
                </div>

                {/* Row 2: Insurance & PMJAY */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      PMJAY / Cashless Empanelment
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Government schemes and TPA admissions
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <span className="font-label-md text-label-md bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-md font-semibold">
                      {hosp1.scheme_badge}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                      {hosp1.scheme_desc}
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <span className="font-label-md text-label-md bg-surface-container-high text-primary px-2.5 py-1 rounded-md font-semibold">
                      {hosp2.scheme_badge}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                      {hosp2.scheme_desc}
                    </p>
                  </div>
                </div>

                {/* Row 3: ICU Bed Availability */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Real-Time ICU Bed Status
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Telemetry updated via regional spatial registry
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                      <span className="font-headline-md text-headline-md text-on-surface font-bold">
                        {hosp1.icu_beds}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {hosp1.icu_capacity}
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                      <span className="font-headline-md text-headline-md text-on-surface font-bold">
                        {hosp2.icu_beds}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {hosp2.icu_capacity}
                    </p>
                  </div>
                </div>

                {/* Row 4: Wait Times */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Emergency Intake Latency
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Door-to-balloon / acute triage wait period
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="font-headline-lg text-headline-lg text-primary font-bold">
                      ~{hosp1.wait_time}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {hosp1.wait_desc}
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="font-headline-lg text-headline-lg text-secondary font-bold">
                      ~{hosp2.wait_time}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {hosp2.wait_desc}
                    </p>
                  </div>
                </div>

                {/* Row 5: Quality & Audit Score */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Sterility &amp; Audit Compliance
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      National Health Authority protocol audit rating
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-lg text-headline-lg text-primary font-bold">
                        {hosp1.quality_pct}
                      </span>
                      <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface px-2 py-0.5 rounded font-medium">
                        {hosp1.quality_badge}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {hosp1.quality_desc}
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-lg text-headline-lg text-secondary font-bold">
                        {hosp2.quality_pct}
                      </span>
                      <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface px-2 py-0.5 rounded font-medium">
                        {hosp2.quality_badge}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {hosp2.quality_desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-12 gap-space-md">
                <div className="hidden md:block md:col-span-4" />
                <div className="col-span-6 md:col-span-4 flex gap-space-sm">
                  <Link
                    href={`/hospitals/${hosp1.slug}`}
                    className="w-full text-center py-space-sm px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold transition-all shadow-sm"
                  >
                    View {hosp1.name.split(" ")[0]}
                  </Link>
                </div>
                <div className="col-span-6 md:col-span-4 flex gap-space-sm">
                  <Link
                    href={`/hospitals/${hosp2.slug}`}
                    className="w-full text-center py-space-sm px-space-md rounded-lg bg-secondary hover:opacity-95 text-on-secondary font-label-md text-label-md font-bold transition-all shadow-sm"
                  >
                    View {hosp2.name.split(" ")[0]}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center font-body-md text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
            <span>Loading Hospital Comparison...</span>
          </div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
