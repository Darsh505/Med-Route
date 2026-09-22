"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "@/context/LocationContext";

const CATEGORIES = [
  { emoji: "❤️", label: "Cardiology", slug: "cardiac" },
  { emoji: "🦴", label: "Orthopedics", slug: "orthopedic" },
  { emoji: "🧠", label: "Neurology", slug: "neurological" },
  { emoji: "👁️", label: "Ophthalmology", slug: "ophthalmology" },
  { emoji: "🫘", label: "Nephrology", slug: "renal" },
  { emoji: "👶", label: "Pediatrics", slug: "pediatric" },
  { emoji: "🦷", label: "Dental Surgery", slug: "dental" },
  { emoji: "🩺", label: "General Care", slug: "general" },
];

const ALL_FEATURED_HOSPITALS = [
  {
    name: "Civil Hospital Hoshiarpur",
    slug: "civil-hospital-hoshiarpur",
    city: "Hoshiarpur",
    type: "Government District Apex",
    location: "Civil Lines, Hoshiarpur · 1.8 km away",
    description: "24x7 Level-2 Trauma & Emergency triage, Jan Aushadhi round-the-clock pharmacy.",
    accreditation: "NQAS Accredited",
    cost: "100% Free / PMJAY",
    pmjay: "100% Cashless",
    icu: "07 Beds Available",
    ambulance_phone: "01882-220108",
    pros: ["100% Cashless PMJAY", "24x7 Level-2 Trauma triage"],
  },
  {
    name: "Ivy Hospital Hoshiarpur",
    slug: "ivy-hospital-hoshiarpur",
    city: "Hoshiarpur",
    type: "Private Super-Specialty",
    location: "Rama Mandi - Bypass Road, Hoshiarpur · 3.4 km away",
    description: "NABH super-specialty center with advanced flat-panel digital Cath Lab and 24x7 emergency triage.",
    accreditation: "NABH Accredited",
    cost: "₹85,000 – ₹1,80,000",
    pmjay: "Empanelled",
    icu: "08 Beds Available",
    ambulance_phone: "01882-506108",
    pros: ["NABH Cath Lab & 24x7 Angioplasty", "32-bed modern critical care ICU"],
  },
  {
    name: "PGIMER Chandigarh",
    slug: "pgimer-chandigarh",
    city: "Chandigarh",
    type: "Government Apex",
    location: "Sector 12, Chandigarh · 3.2 km away (11 min)",
    description: "Public tertiary research institute with dedicated round-the-clock cath labs and Level-1 trauma.",
    accreditation: "NABH",
    cost: "₹15,000 – ₹45,000",
    pmjay: "PMJAY Cashless",
    icu: "14 Beds Available",
    ambulance_phone: "0172-2747585",
    pros: ["Level-1 Emergency Trauma Center", "Highly subsidized surgical tariffs"],
  },
  {
    name: "Max Super Speciality Hospital",
    slug: "max-super-speciality-mohali",
    city: "Mohali",
    type: "Private Accredited",
    location: "Phase VI, Mohali · 7.4 km away (18 min)",
    description: "24/7 Primary Angioplasty Cath Unit with transparent audited pricing and JCI protocols.",
    accreditation: "NABH / JCI",
    cost: "₹1,42,000",
    pmjay: "All-Inclusive",
    icu: "06 Beds Available",
    ambulance_phone: "0172-5212000",
    pros: ["JCI & NABH dual clinical accreditations", "Full multi-organ emergency team"],
  },
  {
    name: "AIIMS New Delhi",
    slug: "aiims-new-delhi",
    city: "Delhi",
    type: "National Apex",
    location: "Ansari Nagar, New Delhi · Pan-India Apex",
    description: "India's highest national medical apex center with world-renowned surgical & trauma divisions.",
    accreditation: "NABH / NABL",
    cost: "₹15,000 – ₹60,000",
    pmjay: "PMJAY Cashless",
    icu: "28 Beds Available",
    ambulance_phone: "011-26593456",
    pros: ["Apex Level 1 JPNA Trauma Centre", "Subsidized robotic & transplant surgeries"],
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { selectedCity, isAutoDetected } = useLocation();
  const [query, setQuery] = useState("");
  const [icuOnly, setIcuOnly] = useState(false);

  const baseList = selectedCity
    ? [...ALL_FEATURED_HOSPITALS].sort((a, b) => {
        if (a.city.toLowerCase() === selectedCity.toLowerCase()) return -1;
        if (b.city.toLowerCase() === selectedCity.toLowerCase()) return 1;
        return 0;
      })
    : ALL_FEATURED_HOSPITALS;

  const featuredList = icuOnly
    ? baseList.filter((h) => !h.icu.startsWith("00"))
    : baseList;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-7xl mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
            {/* Minimal Hero Header */}
            <header className="flex flex-col gap-space-xs max-w-3xl pt-space-md">
              <div className="flex items-center gap-space-sm flex-wrap">
                <Link
                  href="/location"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 text-primary font-label-sm font-semibold transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">near_me</span>
                  <span>Care near <strong>{selectedCity}</strong></span>
                  <span className="text-on-surface-variant font-normal text-xs">({isAutoDetected ? "Auto-detected" : "Selected"})</span>
                  <span className="material-symbols-outlined text-[14px] text-outline">arrow_drop_down</span>
                </Link>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm uppercase tracking-wider font-semibold">
                  Transparent Clinical Discovery
                </span>
                <span className="inline-flex items-center gap-1.5 font-label-sm text-secondary font-semibold">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  National Health Authority Aligned
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold mt-2">
                Find the right hospital, verified tariffs, and live ICU beds.
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Compare verified package tariffs, genuine Ayushman PMJAY cashless coverage, and live ICU telemetry across North India with zero hidden charges.
              </p>
            </header>

            {/* Natural Language Intake Section */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high/40">
              <form onSubmit={handleSearch} className="relative flex flex-col gap-space-sm">
                <div className="relative flex items-center">
                  <textarea
                    rows={2}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe patient requirements in plain words (e.g. Elderly father needs angioplasty under ₹1.5 Lakh in Mohali with cashless PMJAY)..."
                    className="w-full bg-surface-container-low rounded-lg p-space-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors resize-none shadow-inner pr-28 border border-transparent focus:border-primary-container"
                  />
                  <button
                    type="submit"
                    className="absolute right-space-md bottom-space-md bg-primary hover:bg-primary-container text-on-primary px-space-md py-space-xs rounded-lg font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">search</span>
                    <span>Search</span>
                  </button>
                </div>

                {/* Example Quick Prompts */}
                <div className="flex flex-wrap items-center gap-space-xs pt-1">
                  <span className="font-label-sm text-label-sm text-outline mr-1">
                    Try searching:
                  </span>
                  {[
                    "Heart stent in Mohali under 2 lakh",
                    "Knee replacement with PMJAY in Chandigarh",
                    "Emergency dialysis near me",
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setQuery(example);
                        router.push(`/search?q=${encodeURIComponent(example)}`);
                      }}
                      className="font-label-sm text-label-sm bg-surface-container-high text-primary hover:bg-surface-container-highest px-2.5 py-1 rounded-md font-medium transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </form>
            </section>

            {/* Quick Specialty Grid */}
            <section className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Browse by Clinical Specialty
                </h2>
                <Link href="/search" className="font-label-md text-primary hover:underline font-bold">
                  View All Specialties →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/search?category=${encodeURIComponent(cat.label)}`}
                    className="bg-surface-container-lowest hover:bg-surface-container-low p-space-md rounded-xl border border-surface-container-high/40 transition-all flex items-center gap-space-sm shadow-xs hover:shadow-sm"
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <div className="font-label-md text-label-md font-bold text-on-surface">
                        {cat.label}
                      </div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">
                        Verified packages
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 3 KPI Telemetry Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-space-lg">
              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm uppercase text-on-surface-variant tracking-wider font-semibold">
                    Verified Facilities
                  </span>
                  <span className="material-symbols-outlined text-secondary text-xl">
                    domain_verification
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-xl text-primary font-extrabold">156</span>
                  <span className="font-label-sm text-secondary font-medium">Tricity &amp; NCR</span>
                </div>
              </div>

              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm uppercase text-on-surface-variant tracking-wider font-semibold">
                    Procedure Packages
                  </span>
                  <span className="material-symbols-outlined text-primary-container text-xl">
                    medical_services
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-xl text-primary font-extrabold">214+</span>
                  <span className="font-label-sm text-on-surface-variant font-medium">PMJAY 2.2 Aligned</span>
                </div>
              </div>

              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm uppercase text-on-surface-variant tracking-wider font-semibold">
                    Live ICU Beds
                  </span>
                  <span className="material-symbols-outlined text-secondary text-xl">
                    bed
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-xl text-secondary font-extrabold">34</span>
                  <span className="font-label-sm text-secondary font-medium">Available now</span>
                </div>
              </div>
            </section>

            {/* Procedure Tariff & PMJAY Cashless Coverage Matrix Banner */}
            <div className="p-space-lg rounded-2xl bg-gradient-to-r from-emerald-500/10 via-surface-container to-cyan-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-xs">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center text-2xl font-bold shadow-sm shrink-0">
                  ⚖️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold uppercase">
                      Procedure-Level Decision Matrix
                    </span>
                    <span className="font-label-sm text-secondary font-bold">AB-PMJAY HBP 2.2</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold mt-0.5">
                    Compare Hospital Tariffs vs. PMJAY Cashless Limits
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Compare Angioplasty, Knee Replacement, CABG bypass, C-Section, and Dialysis with itemized stent/implant inclusions and live ICU telemetry.
                  </p>
                </div>
              </div>

              <Link
                href="/compare"
                className="px-space-lg py-space-sm bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-xl transition-all shadow-sm shrink-0"
              >
                Open Procedure Matrix →
              </Link>
            </div>

            {/* Featured Hospitals Section */}
            <section className="flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-space-xs">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Featured Hospitals &amp; Critical Care
                  </h2>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Verified facilities near {selectedCity || "Tricity & Punjab"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
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
                    <span>{icuOnly ? "Live ICU Beds Free Only ✓" : "🟢 Free ICU Beds Only"}</span>
                  </button>

                  <Link
                    href="/compare"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-container-low hover:bg-surface-container-high text-primary border border-surface-container-high transition-colors"
                  >
                    <span>Compare All</span>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-space-md">
                {featuredList.map((hosp) => (
                  <article
                    key={hosp.slug}
                    className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg border border-surface-container-high/30"
                  >
                    <div className="flex flex-col gap-1 max-w-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/hospitals/${hosp.slug}`}
                          className="font-headline-md text-headline-md text-on-surface font-bold hover:text-primary transition-colors"
                        >
                          {hosp.name}
                        </Link>
                        <span className="font-label-sm text-label-sm bg-surface-container-high text-secondary px-2 py-0.5 rounded font-medium">
                          {hosp.accreditation}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {hosp.location}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        {hosp.description}
                      </p>
                      {hosp.pros && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hosp.pros.map((pro, idx) => (
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

                    <div className="flex flex-row md:flex-col items-baseline md:items-start gap-space-xs">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Package Cost
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-headline-lg text-headline-lg text-primary font-bold">
                          {hosp.cost}
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary font-semibold">
                          {hosp.pmjay}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-baseline md:items-start gap-space-xs">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        ICU Status
                      </span>
                      <span className="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        {hosp.icu}
                      </span>
                    </div>

                    <div className="flex items-center gap-space-sm w-full md:w-auto pt-space-xs md:pt-0 flex-wrap">
                      <a
                        href={`tel:${hosp.ambulance_phone || "108"}`}
                        className="flex-1 md:flex-none px-space-md py-space-xs bg-error/10 hover:bg-error/20 text-error rounded-lg font-label-md text-label-md font-bold transition-colors text-center flex items-center justify-center gap-1 border border-error/20"
                        title={`Call hospital ambulance: ${hosp.ambulance_phone || "108"}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">ambulance</span>
                        <span>Ambulance</span>
                      </a>
                      <Link
                        href={`/compare?ids=hosp-1,${hosp.slug}`}
                        className="flex-1 md:flex-none px-space-md py-space-xs bg-surface-container-low hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md transition-colors text-center"
                      >
                        Compare
                      </Link>
                      <Link
                        href={`/hospitals/${hosp.slug}`}
                        className="flex-1 md:flex-none px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-label-md transition-colors text-center shadow-sm"
                      >
                        Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
