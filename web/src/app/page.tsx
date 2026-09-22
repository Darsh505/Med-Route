"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

const FEATURED_HOSPITALS = [
  {
    name: "PGIMER Chandigarh",
    slug: "pgimer-chandigarh",
    type: "Government Apex",
    location: "Sector 12, Chandigarh · 3.2 km away (11 min)",
    description: "Public tertiary research institute with dedicated round-the-clock cath labs.",
    accreditation: "NABH",
    cost: "₹15,000 – ₹45,000",
    pmjay: "PMJAY Cashless",
    icu: "14 Beds Available",
  },
  {
    name: "Max Super Speciality Hospital",
    slug: "max-super-speciality-mohali",
    type: "Private Accredited",
    location: "Phase VI, Mohali · 7.4 km away (18 min)",
    description: "24/7 Primary Angioplasty Cath Unit with transparent audited pricing.",
    accreditation: "NABH / JCI",
    cost: "₹1,42,000",
    pmjay: "All-Inclusive",
    icu: "06 Beds Available",
  },
  {
    name: "Fortis Hospital Mohali",
    slug: "fortis-hospital-mohali",
    type: "Private Accredited",
    location: "Sector 62, Mohali · 8.1 km away (19 min)",
    description: "Comprehensive cardiac intervention unit with insurance cashless support.",
    accreditation: "NABH",
    cost: "₹1,55,000",
    pmjay: "Standard",
    icu: "09 Beds Available",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

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
              <div className="flex items-center gap-space-sm">
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

            {/* Featured Hospitals Section */}
            <section className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between pt-space-xs">
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Featured Hospitals &amp; Critical Care
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Updated real-time telemetry
                </span>
              </div>

              <div className="flex flex-col gap-space-md">
                {FEATURED_HOSPITALS.map((hosp) => (
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

                    <div className="flex items-center gap-space-sm w-full md:w-auto pt-space-xs md:pt-0">
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
                        Contact Hospital
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
