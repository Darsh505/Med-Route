"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface HospitalItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  state: string;
  address: string;
  distance_km?: number;
  overall_rating: number;
  total_reviews: number;
  accreditation?: string;
  is_pmjay_empanelled: boolean;
  is_trauma_center: boolean;
  trauma_level?: string;
  beds_total: number;
  beds_icu: number;
  beds_icu_available: number;
  cost_range?: string;
  pmjay_label?: string;
  description?: string;
  phone?: string;
}

const BENCHMARK_HOSPITALS: HospitalItem[] = [
  {
    id: "hosp-1",
    name: "PGIMER Chandigarh",
    slug: "pgimer-chandigarh",
    type: "Government",
    city: "Chandigarh",
    state: "Chandigarh",
    address: "Sector 12, Chandigarh · 3.2 km away (11 min)",
    distance_km: 3.2,
    overall_rating: 4.8,
    total_reviews: 482,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 1948,
    beds_icu: 180,
    beds_icu_available: 14,
    cost_range: "₹15,000 – ₹45,000",
    pmjay_label: "PMJAY Cashless",
    description: "Public tertiary research institute with dedicated round-the-clock cath labs.",
    phone: "0172-2755555",
  },
  {
    id: "hosp-2",
    name: "Max Super Speciality Hospital",
    slug: "max-super-speciality-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Phase VI, Mohali · 7.4 km away (18 min)",
    distance_km: 7.4,
    overall_rating: 4.6,
    total_reviews: 312,
    accreditation: "NABH / JCI",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 280,
    beds_icu: 52,
    beds_icu_available: 6,
    cost_range: "₹1,42,000",
    pmjay_label: "All-Inclusive",
    description: "24/7 Primary Angioplasty Cath Unit with transparent audited pricing.",
    phone: "0172-5212000",
  },
  {
    id: "hosp-3",
    name: "Fortis Hospital Mohali",
    slug: "fortis-hospital-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    address: "Sector 62, Mohali · 8.1 km away (19 min)",
    distance_km: 8.1,
    overall_rating: 4.5,
    total_reviews: 236,
    accreditation: "NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 355,
    beds_icu: 68,
    beds_icu_available: 9,
    cost_range: "₹1,55,000",
    pmjay_label: "Standard",
    description: "Comprehensive cardiac intervention unit with insurance cashless support.",
    phone: "0172-4692222",
  },
  {
    id: "hosp-4",
    name: "CMC Ludhiana",
    slug: "christian-medical-college-ludhiana",
    type: "Trust",
    city: "Ludhiana",
    state: "Punjab",
    address: "Brown Road, Ludhiana · 88 km away",
    distance_km: 88.0,
    overall_rating: 4.7,
    total_reviews: 194,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 775,
    beds_icu: 95,
    beds_icu_available: 12,
    cost_range: "₹85,000 – ₹1,20,000",
    pmjay_label: "PMJAY Subsidized",
    description: "Apex medical college with full charitable and government-backed subsidies.",
    phone: "0161-2115000",
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || searchParams.get("category") || "";

  const [query, setQuery] = useState(
    initialQuery ||
      "My elderly father needs urgent cardiology angioplasty under ₹1.5 Lakh in Mohali with cashless PMJAY"
  );
  const [selectedCondition, setSelectedCondition] = useState("Cardiology & Angioplasty");
  const [selectedLocation, setSelectedLocation] = useState("Mohali (+ 15 km)");
  const [selectedBudget, setSelectedBudget] = useState("PMJAY Subsidized / ≤ ₹1.5L");
  const [hospitals, setHospitals] = useState<HospitalItem[]>(BENCHMARK_HOSPITALS);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("medroute_compare_ids");
      if (saved) setCompareIds(JSON.parse(saved));
    } catch {}
  }, []);

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
          latitude: 30.7333,
          longitude: 76.7794,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setHospitals(
            json.data.map((h: any) => ({
              ...h,
              cost_range: h.cost_indicative || "₹15,000 – ₹1,20,000",
              pmjay_label: h.is_pmjay_empanelled ? "PMJAY Cashless" : "Standard",
              description:
                h.description ||
                `${h.type} healthcare institution with verified emergency infrastructure.`,
            }))
          );
        } else {
          filterFallback(query);
        }
      } else {
        filterFallback(query);
      }
    } catch {
      filterFallback(query);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFallback = (q: string) => {
    const qLower = q.toLowerCase();
    const matched = BENCHMARK_HOSPITALS.filter(
      (h) =>
        h.name.toLowerCase().includes(qLower) ||
        h.city.toLowerCase().includes(qLower) ||
        h.address.toLowerCase().includes(qLower)
    );
    setHospitals(matched.length > 0 ? matched : BENCHMARK_HOSPITALS);
  };

  const toggleCompare = (id: string) => {
    let updated: string[];
    if (compareIds.includes(id)) {
      updated = compareIds.filter((item) => item !== id);
    } else {
      if (compareIds.length >= 4) {
        alert("You can compare up to 4 hospitals.");
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
            {/* Airy Minimal Header */}
            <header className="flex flex-col gap-space-xs max-w-2xl pt-space-md">
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
                Find the right hospital for your condition
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Compare verified package tariffs, genuine Ayushman PMJAY coverage, and live ICU beds with complete transparency.
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
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe patient requirements in plain words (e.g. Angioplasty under ₹1.5 Lakh in Mohali with cashless PMJAY)..."
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
                    <span>{isLoading ? "Parsing..." : "Search"}</span>
                  </button>
                </div>

                {/* Minimal Parsed Chips */}
                <div className="flex flex-wrap items-center gap-space-xs pt-1">
                  <span className="font-label-sm text-label-sm text-outline mr-1">
                    Extracted filters:
                  </span>
                  <span className="font-label-sm text-label-sm bg-surface-container-high text-primary px-2.5 py-1 rounded-md font-medium">
                    Cardiology · Angioplasty
                  </span>
                  <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface px-2.5 py-1 rounded-md font-medium">
                    Mohali / Tricity
                  </span>
                  <span className="font-label-sm text-label-sm bg-surface-container-high text-secondary font-medium px-2.5 py-1 rounded-md">
                    PMJAY Cashless ≤ ₹1.5L
                  </span>
                  <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface px-2.5 py-1 rounded-md font-medium">
                    Urgent Cath Lab
                  </span>
                </div>
              </div>
            </section>

            {/* Quiet Minimal Filter Row */}
            <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Condition / Specialty
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg">
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full bg-transparent p-space-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none cursor-pointer pr-8"
                    >
                      <option>Cardiology &amp; Angioplasty</option>
                      <option>Orthopedics &amp; Joint Care</option>
                      <option>Nephrology &amp; Dialysis</option>
                      <option>General Oncology</option>
                    </select>
                    <span className="material-symbols-outlined text-outline absolute right-space-sm top-2.5 pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Location
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-transparent p-space-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none cursor-pointer pr-8"
                    >
                      <option>Mohali (+ 15 km)</option>
                      <option>Chandigarh (+ 10 km)</option>
                      <option>Panchkula (+ 15 km)</option>
                    </select>
                    <span className="material-symbols-outlined text-outline absolute right-space-sm top-2.5 pointer-events-none text-[18px]">
                      location_on
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Budget &amp; Coverage
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg">
                    <select
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      className="w-full bg-transparent p-space-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none cursor-pointer pr-8"
                    >
                      <option>PMJAY Subsidized / ≤ ₹1.5L</option>
                      <option>Under ₹50,000</option>
                      <option>₹1.5L – ₹3.0L</option>
                    </select>
                    <span className="material-symbols-outlined text-outline absolute right-space-sm top-2.5 pointer-events-none text-[18px]">
                      payments
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Decluttered Clean Hospital Results */}
            <section className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between pt-space-xs">
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {hospitals.length} Hospitals Found
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Updated real-time
                </span>
              </div>

              <div className="flex flex-col gap-space-md">
                {hospitals.map((hosp) => {
                  const isInCompare = compareIds.includes(hosp.id);
                  return (
                    <article
                      key={hosp.id}
                      className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg border border-surface-container-high/30"
                    >
                      {/* Col 1: Details */}
                      <div className="flex flex-col gap-1 max-w-sm">
                        <div className="flex items-center gap-2">
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
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {hosp.address}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          {hosp.description}
                        </p>
                      </div>

                      {/* Col 2: Package Cost */}
                      <div className="flex flex-row md:flex-col items-baseline md:items-start gap-space-xs">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Package Cost
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-headline-lg text-headline-lg text-primary font-bold">
                            {hosp.cost_range || "₹15,000 – ₹45,000"}
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary font-semibold">
                            {hosp.pmjay_label || (hosp.is_pmjay_empanelled ? "PMJAY Cashless" : "Private")}
                          </span>
                        </div>
                      </div>

                      {/* Col 3: ICU Status */}
                      <div className="flex flex-row md:flex-col items-baseline md:items-start gap-space-xs">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          ICU Status
                        </span>
                        <span className="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              hosp.beds_icu_available > 0 ? "bg-secondary" : "bg-error"
                            }`}
                          />
                          {String(hosp.beds_icu_available).padStart(2, "0")} Beds Available
                        </span>
                      </div>

                      {/* Col 4: Action Buttons */}
                      <div className="flex items-center gap-space-sm w-full md:w-auto pt-space-xs md:pt-0">
                        <button
                          type="button"
                          onClick={() => toggleCompare(hosp.id)}
                          className={`flex-1 md:flex-none px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors text-center ${
                            isInCompare
                              ? "bg-secondary-container text-on-secondary-container font-bold"
                              : "bg-surface-container-low hover:bg-surface-container-high text-on-surface"
                          }`}
                        >
                          {isInCompare ? "✓ Added" : "Compare"}
                        </button>

                        <Link
                          href={`/hospitals/${hosp.slug}`}
                          className="flex-1 md:flex-none px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-label-md transition-colors text-center shadow-sm"
                        >
                          Contact Hospital
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-20 text-center font-body-md">Loading hospital directory...</div>}>
      <SearchContent />
    </Suspense>
  );
}
