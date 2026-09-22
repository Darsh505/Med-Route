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
    icu_beds: "14 Beds",
    icu_capacity: "78% Capacity (Available)",
    wait_time: "22 Mins",
    wait_desc: "High triage volume",
    quality_pct: "96.8%",
    quality_badge: "INI Apex / MoHFW",
    quality_desc: "Quarterly NABH sterility compliance pass",
  },
  "max-super-speciality-mohali": {
    id: "hosp-2",
    name: "Max Super Speciality",
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
    icu_beds: "6 Beds",
    icu_capacity: "55% Capacity (Available)",
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
    tag: "NABH Accredited",
    cost_amount: "₹1,55,000",
    cost_desc: "Standard Fixed Package",
    scheme_badge: "Empanelled Corporate TPAs",
    scheme_desc: "Cashless for 30+ insurance providers",
    icu_beds: "9 Beds",
    icu_capacity: "68% Capacity (Available)",
    wait_time: "10 Mins",
    wait_desc: "Emergency rapid response",
    quality_pct: "98.5%",
    quality_badge: "NABH Gold",
    quality_desc: "Annual clinical protocol audit",
  },
};

function CompareContent() {
  const searchParams = useSearchParams();
  const [hosp1, setHosp1] = useState<HospitalComparisonItem>(COMPARISON_MASTER["pgimer-chandigarh"]);
  const [hosp2, setHosp2] = useState<HospitalComparisonItem>(COMPARISON_MASTER["max-super-speciality-mohali"]);

  useEffect(() => {
    const ids = searchParams.get("ids")?.split(",") || [];
    if (ids.length >= 2) {
      const found1 = Object.values(COMPARISON_MASTER).find((h) => h.id === ids[0] || h.slug === ids[0]);
      const found2 = Object.values(COMPARISON_MASTER).find((h) => h.id === ids[1] || h.slug === ids[1]);
      if (found1) setHosp1(found1);
      if (found2) setHosp2(found2);
    }
  }, [searchParams]);

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col w-full">
          {/* Primary Comparison Header */}
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
                <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
                  Compare Hospitals
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1.5">
                  Side-by-side comparison of costs, beds, and key clinical factors.
                </p>
              </div>
            </div>
          </section>

          {/* Comparison Core Content Body */}
          <div className="w-full px-gutter py-space-lg bg-background">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
              {/* Hospital Headers Card Grid */}
              <div className="grid grid-cols-12 gap-space-md items-stretch">
                <div className="hidden md:flex md:col-span-4 flex-col justify-end p-space-md">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                    Overview
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-primary font-bold mt-1">
                    Facility Details
                  </h2>
                </div>

                {/* Card 1 */}
                <div className="col-span-12 sm:col-span-6 md:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border-t-4 border-primary flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                      {hosp1.tag}
                    </span>
                    <span className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span> Verified
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                      {hosp1.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {hosp1.address}
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="col-span-12 sm:col-span-6 md:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border-t-4 border-secondary flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      {hosp2.tag}
                    </span>
                    <span className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span> Verified
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                      {hosp2.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {hosp2.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simplified Comparison Table */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm divide-y divide-surface-container overflow-hidden border border-surface-container-high/40">
                {/* Row 1: Estimated Cost */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Estimated Package Cost
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Standard angioplasty with single drug-eluting stent
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

                {/* Row 2: Government Scheme Coverage */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Scheme Coverage
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Ayushman Bharat (PM-JAY) &amp; cashless support
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      {hosp1.scheme_badge}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                      {hosp1.scheme_desc}
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      {hosp2.scheme_badge}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                      {hosp2.scheme_desc}
                    </p>
                  </div>
                </div>

                {/* Row 3: Available ICU Beds */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Available Cardiac ICU Beds
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Real-time operational beds ready for admission
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="font-metric-xl text-metric-xl text-primary font-bold">
                      {hosp1.icu_beds}
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">
                      {hosp1.icu_capacity}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="font-metric-xl text-metric-xl text-primary font-bold">
                      {hosp2.icu_beds}
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">
                      {hosp2.icu_capacity}
                    </span>
                  </div>
                </div>

                {/* Row 4: Emergency Wait Time */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Emergency Triage Wait
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Median time to attending cardiology team
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="font-metric-md text-metric-md text-primary font-bold">
                      {hosp1.wait_time}
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {hosp1.wait_desc}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="font-metric-md text-metric-md text-secondary font-bold">
                      {hosp2.wait_time}
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {hosp2.wait_desc}
                    </span>
                  </div>
                </div>

                {/* Row 5: Accreditation & Quality */}
                <div className="grid grid-cols-12 gap-space-md p-space-lg items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Accreditation &amp; Quality
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Certified clinical quality standard
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="font-metric-md text-metric-md text-primary font-bold">
                        {hosp1.quality_pct}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-sm text-label-sm font-bold">
                        {hosp1.quality_badge}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {hosp1.quality_desc}
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="font-metric-md text-metric-md text-secondary font-bold">
                        {hosp2.quality_pct}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                        {hosp2.quality_badge}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {hosp2.quality_desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="w-full bg-surface-container-lowest shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-gutter py-space-md sticky bottom-0 z-40 border-t border-surface-container-high/60">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  verified
                </span>
                <span className="font-body-sm text-body-sm">
                  Verified clinical data updated within the last 15 minutes
                </span>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Download Summary</span>
                </button>
                <Link
                  href={`/hospitals/${hosp1.slug}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-all font-label-md text-label-md font-bold shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Select Hospital</span>
                </Link>
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
    <Suspense fallback={<div className="pt-20 text-center font-body-md">Loading hospital comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
