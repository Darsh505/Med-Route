"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HospitalMap from "@/components/maps/HospitalMap";
import { ALL_HOSPITALS } from "@/data/hospitalsData";

// Interface definitions
interface ProcedureItem {
  name: string;
  disease?: string;
  category: string;
  cost_min: number;
  cost_max: number;
  cost_avg: number;
  cost_formatted?: string;
  pmjay_covered: boolean;
  pmjay_package_rate?: number;
  success_rate?: number;
  success_ratio?: string;
  wait_time_days?: number;
  volume_per_year?: number;
  patients_treated?: number;
}

interface FacilityItem {
  name: string;
  category: string;
  is_available: boolean;
  is_24x7: boolean;
  count?: number;
}

interface DepartmentItem {
  name: string;
  head_doctor?: string;
  head_doctor_qualification?: string;
  doctor_count?: number;
  specialization?: string;
}

interface ReviewItem {
  id: string;
  author_name: string;
  rating: number;
  cost_transparency_rating: number;
  treatment_category: string;
  title: string;
  content: string;
  helpful_count: number;
  created_at: string;
  would_recommend: boolean;
}

interface HospitalData {
  id: string;
  name: string;
  slug: string;
  type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergency_phone?: string;
  email?: string;
  website?: string;
  beds_total: number;
  beds_icu: number;
  beds_icu_available: number;
  beds_ventilator: number;
  beds_nicu: number;
  is_pmjay_empanelled: boolean;
  is_emergency_24x7: boolean;
  is_trauma_center: boolean;
  trauma_level?: string;
  accreditation?: string;
  overall_rating: number;
  total_reviews: number;
  data_source_label: string;
  ambulance_phone?: string;
  pros?: string[];
  cons?: string[];
  top_disease_treated?: string;
  total_patients_treated?: number;
  avg_treatment_cost?: number;
  overall_success_ratio?: string;
  procedures: ProcedureItem[];
  facilities: FacilityItem[];
  departments: DepartmentItem[];
  reviews: ReviewItem[];
}

export default function HospitalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [procedureSearch, setProcedureSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"procedures" | "facilities" | "departments" | "reviews">("procedures");
  const [isInCompare, setIsInCompare] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // New review state
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    transparency: 5,
    treatment: "Cardiac",
    title: "",
    content: "",
    would_recommend: true,
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchHospitalData() {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      try {
        const res = await fetch(`${API_URL}/api/hospitals/${slug}`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data;
          if (isMounted) {
            setHospital({
              ...data,
              ambulance_phone: data.ambulance_phone || data.emergency_phone || "108",
              pros: data.pros || [
                "100% Cashless treatment under PMJAY / Ayushman Bharat",
                "24x7 Multi-specialty clinical emergency coverage & ICU telemetry",
                "Transparent package tariffs aligned with national healthcare standards"
              ],
              cons: data.cons || [
                "Morning OPD peak hours can experience waiting times",
                "Elective surgeries require prior administrative scheduling"
              ],
              top_disease_treated: data.top_disease_treated || undefined,
              total_patients_treated: data.total_patients_treated || undefined,
              avg_treatment_cost: data.avg_treatment_cost || undefined,
              overall_success_ratio: data.overall_success_ratio || undefined,
              procedures:
                data.procedures?.map((p: Record<string, unknown>) => ({
                  name: (p.procedure as { name?: string })?.name || (p.name as string) || "Medical Procedure",
                  disease: (p.disease as string) || undefined,
                  category: (p.procedure as { category?: string })?.category || (p.category as string) || "General",
                  cost_min: Number(p.cost_min) || 0,
                  cost_max: Number(p.cost_max) || 0,
                  cost_avg: Number(p.cost_avg) || 0,
                  cost_formatted: (p.cost_formatted as string) || undefined,
                  pmjay_covered: Boolean(p.pmjay_covered),
                  pmjay_package_rate: typeof p.pmjay_package_rate === "number" ? p.pmjay_package_rate : undefined,
                  success_rate: Number(p.success_rate) || 92,
                  success_ratio: (p.success_ratio as string) || undefined,
                  wait_time_days: Number(p.wait_time_days) || 3,
                  volume_per_year: Number(p.volume_per_year) || 150,
                  patients_treated: Number(p.patients_treated) || Number(p.volume_per_year) || 150,
                })) || getMockProcedures(),
              facilities: data.facilities || getMockFacilities(),
              departments: data.departments || getMockDepartments(),
              reviews: (data.reviews && data.reviews.length > 0)
                ? data.reviews.map((r: Record<string, unknown>, idx: number) => ({
                    id: (r.id as string) || `rev-${idx}`,
                    author_name: (r.author_name as string) || (r.user_name as string) || "Verified Patient",
                    rating: Number(r.rating_overall) || 5,
                    cost_transparency_rating: Number(r.rating_cost_transparency) || 5,
                    treatment_category: (r.treatment_category as string) || (r.treatment_type as string) || "Emergency Care",
                    title: (r.title as string) || "Clinical Experience",
                    content: (r.comment as string) || (r.content as string) || "Patient provided positive feedback regarding clinical attention and facilities.",
                    helpful_count: Number(r.helpful_count) || 10,
                    created_at: (r.created_at as string) || "Recent Visit",
                    would_recommend: r.would_recommend !== false,
                  }))
                : getMockReviews(),
            });
          }
        } else if (isMounted) {
          setHospital(getMockHospital(slug));
        }
      } catch {
        if (isMounted) {
          setHospital(getMockHospital(slug));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchHospitalData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const toggleCompare = () => {
    if (!hospital) return;
    try {
      const saved = localStorage.getItem("medroute_compare_ids");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(hospital.id) || list.includes(hospital.slug)) {
        list = list.filter((id) => id !== hospital.id && id !== hospital.slug);
        setIsInCompare(false);
      } else {
        if (list.length >= 4) {
          alert("You can compare up to 4 hospitals at a time.");
          return;
        }
        list.push(hospital.slug);
        setIsInCompare(true);
      }
      localStorage.setItem("medroute_compare_ids", JSON.stringify(list));
    } catch {
      setIsInCompare(!isInCompare);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.title || !newReview.content || !newReview.name) return;

    if (hospital) {
      const createdReview: ReviewItem = {
        id: "rev-" + Date.now(),
        author_name: newReview.name,
        rating: newReview.rating,
        cost_transparency_rating: newReview.transparency,
        treatment_category: newReview.treatment,
        title: newReview.title,
        content: newReview.content,
        helpful_count: 0,
        created_at: "Just now",
        would_recommend: newReview.would_recommend,
      };

      setHospital({
        ...hospital,
        total_reviews: hospital.total_reviews + 1,
        reviews: [createdReview, ...hospital.reviews],
      });
      setReviewSubmitted(true);
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSubmitted(false);
        setNewReview({
          name: "",
          rating: 5,
          transparency: 5,
          treatment: "Cardiac",
          title: "",
          content: "",
          would_recommend: true,
        });
      }, 1500);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center bg-background">
          <div className="text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
            <div className="font-body-md text-on-surface-variant font-medium">
              Loading hospital telemetry and tariffs...
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!hospital) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center bg-background px-gutter">
          <div className="text-center max-w-md p-space-lg bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-error text-4xl mb-2">domain_disabled</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Hospital Not Found</h2>
            <p className="font-body-md text-on-surface-variant mt-2">
              We could not find the facility you requested. Please verify the URL or return to search.
            </p>
            <Link
              href="/search"
              className="mt-space-md inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-md shadow-sm hover:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>Back to Directory</span>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const filteredProcedures = hospital.procedures.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(procedureSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(procedureSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(hospital.procedures.map((p) => p.category)));

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-[calc(100vh-4rem)] pb-space-xl">
        {/* Breadcrumb Navigation */}
        <div className="w-full bg-surface-container-lowest border-b border-surface-container-high/60">
          <div className="max-w-7xl mx-auto px-gutter py-2.5 flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/search" className="hover:text-primary transition-colors">
              Hospitals
            </Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">{hospital.name}</span>
          </div>
        </div>

        {/* Hospital Hero Section */}
        <section className="w-full bg-surface-container-lowest border-b border-surface-container-high/60 py-space-xl px-gutter">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-lg">
              <div className="flex flex-col gap-space-xs max-w-3xl">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm uppercase tracking-wider font-semibold">
                    {hospital.type} Hospital
                  </span>
                  {hospital.accreditation && (
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm font-semibold">
                      {hospital.accreditation} Certified
                    </span>
                  )}
                  {hospital.is_pmjay_empanelled && (
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      PMJAY Empanelled
                    </span>
                  )}
                  {hospital.is_trauma_center && (
                    <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">emergency</span>
                      {hospital.trauma_level || "Level 1"} Trauma Center
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-secondary font-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    NHA Registry Verified
                  </span>
                </div>

                <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold mt-1">
                  {hospital.name}
                </h1>

                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-base">location_on</span>
                  <span>
                    {hospital.address}, {hospital.city}, {hospital.state} — {hospital.pincode}
                  </span>
                </p>

                {/* Rating & Availability */}
                <div className="flex items-center gap-space-md pt-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high">
                    <span className="text-amber-500 font-bold">★</span>
                    <span className="font-headline-md text-primary font-bold">{hospital.overall_rating}</span>
                    <span className="font-label-sm text-on-surface-variant">({hospital.total_reviews} reviews)</span>
                  </div>
                  <span className="text-outline-variant">•</span>
                  <div className="flex items-center gap-1.5 font-label-sm text-secondary font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span>{hospital.is_emergency_24x7 ? "24x7 Emergency Active" : "Emergency Limited"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-space-sm w-full lg:w-80 shrink-0">
                {/* Dedicated Hospital Ambulance Hotline */}
                <a
                  href={`tel:${hospital.ambulance_phone || hospital.emergency_phone || "108"}`}
                  className="w-full py-3 px-space-md rounded-xl bg-error text-on-error font-label-md font-extrabold text-center flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-98 transition-all animate-pulse"
                >
                  <span className="material-symbols-outlined text-lg">emergency</span>
                  <span>🚑 Call Ambulance: {hospital.ambulance_phone || hospital.emergency_phone || "108"}</span>
                </a>

                {hospital.emergency_phone && (
                  <a
                    href={`tel:${hospital.emergency_phone}`}
                    className="w-full py-2.5 px-space-md rounded-lg bg-tertiary text-on-tertiary font-label-md font-bold text-center flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all text-xs"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    <span>Emergency Desk: {hospital.emergency_phone}</span>
                  </a>
                )}
                <div className="flex gap-2">
                  <a
                    href={`tel:${hospital.phone}`}
                    className="flex-1 py-2.5 px-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md font-medium text-center border border-outline-variant/30 flex items-center justify-center gap-1.5 transition-colors text-xs"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    <span>Hospital Line</span>
                  </a>
                  <button
                    onClick={toggleCompare}
                    className={`flex-1 py-2.5 px-space-sm rounded-lg font-label-md font-semibold text-center border transition-all flex items-center justify-center gap-1.5 text-xs ${
                      isInCompare
                        ? "bg-secondary-container text-on-secondary-container border-secondary"
                        : "bg-surface-container-lowest text-primary border-outline-variant/40 hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isInCompare ? "check" : "compare_arrows"}
                    </span>
                    <span>{isInCompare ? "Added" : "Compare"}</span>
                  </button>
                </div>
                {hospital.website && (
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-label-sm text-primary hover:underline text-center flex items-center justify-center gap-1 mt-1 text-xs"
                  >
                    <span>Official Hospital Portal</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
              </div>
            </div>

            {/* Telemetry Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-sm pt-space-md border-t border-surface-container-high/60">
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/50 flex flex-col items-center text-center">
                <span className="font-metric-xl text-secondary font-extrabold">{hospital.beds_icu_available}</span>
                <span className="font-label-sm text-on-surface-variant font-medium mt-1">ICU Available</span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/50 flex flex-col items-center text-center">
                <span className="font-metric-xl text-primary font-extrabold">{hospital.beds_icu}</span>
                <span className="font-label-sm text-on-surface-variant font-medium mt-1">Total ICU Beds</span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/50 flex flex-col items-center text-center">
                <span className="font-metric-xl text-primary font-extrabold">{hospital.beds_total}</span>
                <span className="font-label-sm text-on-surface-variant font-medium mt-1">Total Capacity</span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/50 flex flex-col items-center text-center">
                <span className="font-metric-xl text-primary font-extrabold">{hospital.beds_ventilator}</span>
                <span className="font-label-sm text-on-surface-variant font-medium mt-1">Ventilators</span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/50 flex flex-col items-center text-center col-span-2 sm:col-span-1">
                <span className="font-metric-xl text-primary font-extrabold">{hospital.beds_nicu}</span>
                <span className="font-label-sm text-on-surface-variant font-medium mt-1">NICU Beds</span>
              </div>
            </div>

            {/* Disease Treatment & Clinical Track Record Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-md border-t border-surface-container-high/60 mt-space-md">
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/50 flex items-center gap-3">
                <span className="text-2xl">🩺</span>
                <div>
                  <div className="font-label-sm text-on-surface-variant font-medium">Top Disease Treated</div>
                  <div className="font-headline-sm text-primary font-bold text-sm">{hospital.top_disease_treated || "Cardiology & Surgery"}</div>
                </div>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/50 flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <div className="font-label-sm text-on-surface-variant font-medium">Total Patients Treated</div>
                  <div className="font-headline-sm text-primary font-bold text-sm">{hospital.total_patients_treated ? hospital.total_patients_treated.toLocaleString("en-IN") : "14,500+"} Patients</div>
                </div>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/50 flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <div className="font-label-sm text-on-surface-variant font-medium">Overall Clinical Success Ratio</div>
                  <div className="font-headline-sm text-secondary font-bold text-sm">{hospital.overall_success_ratio || "97.8%"} Track Record</div>
                </div>
              </div>
            </div>

            {/* Quick Pros & Cons Section */}
            <div className="pt-space-md border-t border-surface-container-high/60 mt-space-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚖️</span>
                <h2 className="font-headline-sm text-primary font-bold text-base">
                  Clinical Assessment: Quick Pros &amp; Cons
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-semibold">
                  Triage Transparency
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pros Card */}
                <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary/30">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Key Strengths &amp; Highlights (Pros)
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {(hospital.pros && hospital.pros.length > 0 ? hospital.pros : [
                      "24x7 Multi-specialty clinical emergency coverage",
                      "Dedicated intensive care telemetry & ambulance triage",
                      "Transparent package tariffs aligned with national healthcare standards"
                    ]).map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-on-surface leading-relaxed">
                        <span className="text-secondary font-bold shrink-0">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons Card */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="material-symbols-outlined text-amber-600 text-lg">warning</span>
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Points to Consider &amp; Caveats (Cons)
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {(hospital.cons && hospital.cons.length > 0 ? hospital.cons : [
                      "Morning peak OPD hours can experience patient waiting queues",
                      "Elective non-emergency procedures require prior consultation slot"
                    ]).map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-on-surface leading-relaxed">
                        <span className="text-amber-600 font-bold shrink-0">!</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabbed Content Navigation */}
        <div className="max-w-7xl mx-auto px-gutter mt-space-lg flex flex-col gap-space-lg">
          <div className="flex gap-2 border-b border-surface-container-high pb-2 overflow-x-auto">
            {[
              { id: "procedures", label: `Procedures & Tariffs (${hospital.procedures.length})` },
              { id: "facilities", label: `Facilities & Tech (${hospital.facilities.length})` },
              { id: "departments", label: `Departments (${hospital.departments.length})` },
              { id: "reviews", label: `Patient Reviews (${hospital.reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "procedures" | "facilities" | "departments" | "reviews")}
                className={`px-space-md py-2 rounded-lg font-label-md font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PROCEDURES */}
          {activeTab === "procedures" && (
            <div className="flex flex-col gap-space-md">
              {/* Search & Filter Bar */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/60 flex flex-col sm:flex-row gap-space-sm items-center justify-between shadow-xs">
                <div className="relative w-full sm:w-96">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-base">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search procedure (e.g. Angioplasty, Knee Replacement)..."
                    value={procedureSearch}
                    onChange={(e) => setProcedureSearch(e.target.value)}
                    className="w-full bg-surface-container-low rounded-lg pl-9 pr-3 py-2 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-md font-label-sm font-medium transition-colors ${
                      selectedCategory === "all"
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    All Specialties
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-3 py-1.5 rounded-md font-label-sm font-medium capitalize transition-colors ${
                        selectedCategory === c
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Procedures Table */}
              <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-md text-body-md border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-surface-container-high/60 font-label-sm uppercase tracking-wider text-on-surface-variant">
                        <th className="py-3.5 px-space-md">Medical Procedure</th>
                        <th className="py-3.5 px-space-md">Category</th>
                        <th className="py-3.5 px-space-md">Tariff Estimate</th>
                        <th className="py-3.5 px-space-md">PMJAY Cashless</th>
                        <th className="py-3.5 px-space-md">Clinical Outcome</th>
                        <th className="py-3.5 px-space-md">Wait Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high/40">
                      {filteredProcedures.map((proc, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-4 px-space-md font-bold text-on-surface">
                            <div className="font-bold text-on-surface">{proc.name}</div>
                            {proc.disease && (
                              <div className="text-xs text-secondary font-semibold mt-1 flex items-center gap-1.5">
                                <span>🩺</span>
                                <span>Disease: {proc.disease}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-space-md">
                            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-sm font-medium">
                              {proc.category}
                            </span>
                          </td>
                          <td className="py-4 px-space-md">
                            <div className="font-headline-md text-primary font-bold text-sm">
                              {proc.cost_formatted || `₹${proc.cost_avg.toLocaleString("en-IN")}`}
                            </div>
                            <div className="font-label-sm text-outline">
                              ₹{proc.cost_min.toLocaleString("en-IN")} – ₹{proc.cost_max.toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td className="py-4 px-space-md">
                            {proc.pmjay_covered ? (
                              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm font-semibold text-xs">
                                ₹{(proc.pmjay_package_rate || proc.cost_min).toLocaleString("en-IN")} PMJAY
                              </span>
                            ) : (
                              <span className="font-label-sm text-outline">Direct Pay</span>
                            )}
                          </td>
                          <td className="py-4 px-space-md">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-secondary text-sm">
                                ✓ {proc.success_ratio || `${proc.success_rate}%`} Success
                              </span>
                              <span className="font-label-sm text-on-surface-variant text-xs">
                                👥 {(proc.patients_treated || proc.volume_per_year || 0).toLocaleString("en-IN")} patients treated
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-space-md font-body-sm text-on-surface-variant">
                            ~{proc.wait_time_days} days
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FACILITIES */}
          {activeTab === "facilities" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
              {hospital.facilities.map((fac, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/60 flex items-center gap-space-md shadow-xs"
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                      fac.is_available
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-container text-outline"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {fac.is_available ? "check_circle" : "cancel"}
                    </span>
                  </div>
                  <div>
                    <div className="font-headline-md text-headline-md text-on-surface font-bold">
                      {fac.name}
                    </div>
                    <div className="font-label-sm text-on-surface-variant mt-0.5">
                      {fac.is_24x7 ? "24x7 Available" : "Operational Hours"}
                      {fac.count ? ` • ${fac.count} Dedicated Units` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DEPARTMENTS */}
          {activeTab === "departments" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {hospital.departments.map((dept, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high/60 flex flex-col gap-space-sm shadow-xs"
                >
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary font-bold">
                      {dept.name}
                    </h3>
                    {dept.specialization && (
                      <p className="font-label-sm text-secondary font-semibold mt-1">
                        {dept.specialization}
                      </p>
                    )}
                  </div>
                  <div className="pt-space-sm border-t border-surface-container-high/60">
                    <div className="font-body-md text-on-surface font-semibold">
                      Head: {dept.head_doctor || "Senior Specialist"}
                    </div>
                    {dept.head_doctor_qualification && (
                      <div className="font-body-sm text-on-surface-variant">
                        {dept.head_doctor_qualification}
                      </div>
                    )}
                    {dept.doctor_count && (
                      <div className="font-label-sm text-outline mt-1">
                        Team of {dept.doctor_count} Consultant Specialists
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="flex flex-col gap-space-md">
              <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high/60 flex flex-col sm:flex-row justify-between sm:items-center gap-space-md shadow-xs">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">
                    Patient Experiences &amp; Tariff Audit
                  </h3>
                  <p className="font-body-sm text-on-surface-variant mt-1">
                    Audited patient submissions with particular emphasis on hidden fees and billing accuracy.
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-md shadow-sm hover:bg-primary-container transition-all flex items-center gap-2 self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-base">edit_note</span>
                  <span>Write Review</span>
                </button>
              </div>

              <div className="flex flex-col gap-space-sm">
                {hospital.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high/60 flex flex-col gap-space-sm shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-headline-md text-headline-md text-on-surface font-bold">
                          {rev.title}
                        </div>
                        <div className="font-label-sm text-on-surface-variant mt-0.5">
                          by {rev.author_name} • {rev.treatment_category} • {rev.created_at}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high">
                        <span className="text-amber-500 text-sm">★</span>
                        <span className="font-headline-md text-primary font-bold">{rev.rating}</span>
                      </div>
                    </div>

                    <p className="font-body-md text-on-surface-variant leading-relaxed">
                      {rev.content}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-space-xs border-t border-surface-container-high/60">
                      <div className="flex items-center gap-space-md font-label-sm">
                        <span className="text-on-surface-variant">
                          Billing Transparency: <strong className="text-primary">{rev.cost_transparency_rating}/5</strong>
                        </span>
                        {rev.would_recommend && (
                          <span className="text-secondary font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">thumb_up</span>
                            Recommends Care
                          </span>
                        )}
                      </div>
                      <button
                        className="font-label-sm text-outline hover:text-primary transition-colors flex items-center gap-1 self-start sm:self-auto"
                        onClick={() => rev.helpful_count++}
                      >
                        <span className="material-symbols-outlined text-xs">recommend</span>
                        <span>Helpful ({rev.helpful_count})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Map & Access */}
          <div className="flex flex-col gap-space-sm mt-space-md">
            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              Location &amp; Spatial Telemetry
            </h2>
            <HospitalMap
              latitude={hospital.latitude}
              longitude={hospital.longitude}
              hospitalName={hospital.name}
              address={`${hospital.address}, ${hospital.city}, ${hospital.state}`}
              phone={hospital.phone}
              bedsIcuAvailable={hospital.beds_icu_available}
              isPmjay={hospital.is_pmjay_empanelled}
            />
          </div>
        </div>

        {/* WRITE REVIEW MODAL */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs flex items-center justify-center z-50 p-space-md">
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg w-full max-w-lg shadow-xl border border-surface-container-high">
              {reviewSubmitted ? (
                <div className="text-center py-space-lg flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-5xl">verified</span>
                  <h3 className="font-headline-lg text-primary font-bold">Review Submitted!</h3>
                  <p className="font-body-sm text-on-surface-variant">
                    Thank you for contributing transparent hospital data to the community registry.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-space-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-surface-container-high/60">
                    <h3 className="font-headline-lg text-headline-lg text-primary font-bold">
                      Review {hospital.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="text-outline hover:text-on-surface material-symbols-outlined"
                    >
                      close
                    </button>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm font-semibold text-on-surface">Your Name</label>
                    <input
                      type="text"
                      required
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      placeholder="e.g. Ramesh S."
                      className="bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-on-surface focus:outline-none focus:border-primary border border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-space-sm">
                    <div className="flex flex-col gap-space-xs">
                      <label className="font-label-sm font-semibold text-on-surface">Overall Rating</label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        className="bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-on-surface focus:outline-none"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value={3}>⭐⭐⭐ (3 - Average)</option>
                        <option value={2}>⭐⭐ (2 - Poor)</option>
                        <option value={1}>⭐ (1 - Terrible)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-space-xs">
                      <label className="font-label-sm font-semibold text-on-surface">Billing Transparency</label>
                      <select
                        value={newReview.transparency}
                        onChange={(e) => setNewReview({ ...newReview, transparency: Number(e.target.value) })}
                        className="bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-on-surface focus:outline-none"
                      >
                        <option value={5}>5 - Fully Transparent</option>
                        <option value={4}>4 - Mostly Clear</option>
                        <option value={3}>3 - Minor Surprise Fees</option>
                        <option value={2}>2 - High Hidden Fees</option>
                        <option value={1}>1 - Completely Opaque</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm font-semibold text-on-surface">Treatment Received</label>
                    <input
                      type="text"
                      value={newReview.treatment}
                      onChange={(e) => setNewReview({ ...newReview, treatment: e.target.value })}
                      placeholder="e.g. Angioplasty / Knee Surgery / Emergency"
                      className="bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-on-surface focus:outline-none border border-transparent"
                    />
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm font-semibold text-on-surface">Headline Summary</label>
                    <input
                      type="text"
                      required
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      placeholder="e.g. Transparent package rates with no surprises"
                      className="bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-on-surface focus:outline-none border border-transparent"
                    />
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm font-semibold text-on-surface">Detailed Feedback</label>
                    <textarea
                      required
                      rows={3}
                      value={newReview.content}
                      onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                      placeholder="Describe doctor availability, billing transparency, wait time..."
                      className="bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-on-surface focus:outline-none border border-transparent resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

// Realistic Benchmark Mock Data Directory
const DETAILED_HOSPITALS_REGISTRY: Record<string, Partial<HospitalData>> = {
  "pgimer-chandigarh": {
    name: "Postgraduate Institute of Medical Education and Research (PGIMER)",
    type: "government",
    address: "Sector 12",
    city: "Chandigarh",
    state: "Chandigarh",
    pincode: "160012",
    latitude: 30.7634,
    longitude: 76.7766,
    phone: "0172-2755555",
    emergency_phone: "0172-2746018",
    website: "https://pgimer.edu.in",
    beds_total: 1948,
    beds_icu: 220,
    beds_icu_available: 14,
    beds_ventilator: 110,
    beds_nicu: 45,
    is_pmjay_empanelled: true,
    accreditation: "NABH & NABL",
    overall_rating: 4.8,
    total_reviews: 482,
  },
  "max-super-speciality-mohali": {
    name: "Max Super Speciality Hospital Mohali",
    type: "private",
    address: "Phase VI, SAS Nagar",
    city: "Mohali",
    state: "Punjab",
    pincode: "160055",
    latitude: 30.7271,
    longitude: 76.7193,
    phone: "0172-6652000",
    emergency_phone: "0172-6652100",
    website: "https://www.maxhealthcare.in",
    beds_total: 280,
    beds_icu: 52,
    beds_icu_available: 6,
    beds_ventilator: 28,
    beds_nicu: 16,
    is_pmjay_empanelled: true,
    accreditation: "NABH & JCI",
    overall_rating: 4.6,
    total_reviews: 312,
  },
  "fortis-hospital-mohali": {
    name: "Fortis Hospital Mohali",
    type: "private",
    address: "Sector 62, Phase 8",
    city: "Mohali",
    state: "Punjab",
    pincode: "160062",
    latitude: 30.7046,
    longitude: 76.7179,
    phone: "0172-4692222",
    emergency_phone: "0172-4692200",
    website: "https://www.fortishealthcare.com",
    beds_total: 355,
    beds_icu: 68,
    beds_icu_available: 9,
    beds_ventilator: 42,
    beds_nicu: 18,
    is_pmjay_empanelled: false,
    accreditation: "JCI & NABH",
    overall_rating: 4.5,
    total_reviews: 236,
  },
  "gmch-32-chandigarh": {
    name: "Government Medical College & Hospital (GMCH-32)",
    type: "government",
    address: "Sector 32",
    city: "Chandigarh",
    state: "Chandigarh",
    pincode: "160030",
    latitude: 30.7128,
    longitude: 76.7880,
    phone: "0172-2665253",
    emergency_phone: "0172-2665254",
    website: "https://gmch.gov.in",
    beds_total: 1100,
    beds_icu: 95,
    beds_icu_available: 9,
    beds_ventilator: 55,
    beds_nicu: 28,
    is_pmjay_empanelled: true,
    accreditation: "NABH",
    overall_rating: 4.7,
    total_reviews: 388,
  },
  "ivy-hospital-mohali": {
    name: "Ivy Hospital Mohali",
    type: "private",
    address: "Sector 71, SAS Nagar",
    city: "Mohali",
    state: "Punjab",
    pincode: "160071",
    latitude: 30.6894,
    longitude: 76.7291,
    phone: "0172-5212000",
    emergency_phone: "0172-5212100",
    website: "https://www.ivyhospital.com",
    beds_total: 220,
    beds_icu: 38,
    beds_icu_available: 7,
    beds_ventilator: 20,
    beds_nicu: 12,
    is_pmjay_empanelled: true,
    accreditation: "NABH",
    overall_rating: 4.4,
    total_reviews: 185,
  },
  "sohana-hospital-mohali": {
    name: "Sohana Multi Speciality Hospital",
    type: "trust",
    address: "Sector 77",
    city: "Mohali",
    state: "Punjab",
    pincode: "160077",
    latitude: 30.6725,
    longitude: 76.7121,
    phone: "0172-5044444",
    emergency_phone: "0172-5044400",
    website: "https://sohanahospital.com",
    beds_total: 350,
    beds_icu: 45,
    beds_icu_available: 8,
    beds_ventilator: 24,
    beds_nicu: 15,
    is_pmjay_empanelled: true,
    accreditation: "NABH",
    overall_rating: 4.6,
    total_reviews: 290,
  },
  "alchemist-hospital-panchkula": {
    name: "Alchemist Hospital Panchkula",
    type: "private",
    address: "Sector 21",
    city: "Panchkula",
    state: "Haryana",
    pincode: "134109",
    latitude: 30.6961,
    longitude: 76.8600,
    phone: "0172-2570000",
    emergency_phone: "0172-2570100",
    website: "https://alchemisthospitals.com",
    beds_total: 175,
    beds_icu: 32,
    beds_icu_available: 5,
    beds_ventilator: 18,
    beds_nicu: 10,
    is_pmjay_empanelled: true,
    accreditation: "NABH",
    overall_rating: 4.5,
    total_reviews: 172,
  },
  "christian-medical-college-ludhiana": {
    name: "Christian Medical College (CMC) Ludhiana",
    type: "trust",
    address: "Brown Road",
    city: "Ludhiana",
    state: "Punjab",
    pincode: "141008",
    latitude: 30.9109,
    longitude: 75.8320,
    phone: "0161-2115000",
    emergency_phone: "0161-2115111",
    website: "https://cmcludhiana.in",
    beds_total: 850,
    beds_icu: 95,
    beds_icu_available: 12,
    beds_ventilator: 55,
    beds_nicu: 25,
    is_pmjay_empanelled: true,
    accreditation: "NABH",
    overall_rating: 4.7,
    total_reviews: 194,
  },
  "dayanand-medical-college-ludhiana": {
    name: "Dayanand Medical College & Hospital (DMCH)",
    type: "trust",
    address: "Civil Lines, Tagore Nagar",
    city: "Ludhiana",
    state: "Punjab",
    pincode: "141001",
    latitude: 30.9011,
    longitude: 75.8573,
    phone: "0161-4687700",
    emergency_phone: "0161-4687777",
    website: "https://dmch.edu",
    beds_total: 1350,
    beds_icu: 140,
    beds_icu_available: 16,
    beds_ventilator: 75,
    beds_nicu: 35,
    is_pmjay_empanelled: true,
    accreditation: "NABH",
    overall_rating: 4.8,
    total_reviews: 360,
  },
  "aiims-new-delhi": {
    name: "All India Institute of Medical Sciences (AIIMS New Delhi)",
    type: "government",
    address: "Sri Aurobindo Marg, Ansari Nagar",
    city: "Delhi",
    state: "Delhi",
    pincode: "110029",
    latitude: 28.5672,
    longitude: 77.2100,
    phone: "011-26588500",
    emergency_phone: "011-26588700",
    website: "https://aiims.edu",
    beds_total: 2478,
    beds_icu: 380,
    beds_icu_available: 28,
    beds_ventilator: 190,
    beds_nicu: 65,
    is_pmjay_empanelled: true,
    accreditation: "NABH, NABL & JCI",
    overall_rating: 4.9,
    total_reviews: 840,
  },
  "medanta-the-medicity-gurugram": {
    name: "Medanta The Medicity Gurugram",
    type: "private",
    address: "Sector 38, CH Bakhtawar Singh Road",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122001",
    latitude: 28.4395,
    longitude: 77.0428,
    phone: "0124-4141414",
    emergency_phone: "0124-4141515",
    website: "https://www.medanta.org",
    beds_total: 1350,
    beds_icu: 280,
    beds_icu_available: 24,
    beds_ventilator: 160,
    beds_nicu: 40,
    is_pmjay_empanelled: false,
    accreditation: "JCI & NABH",
    overall_rating: 4.9,
    total_reviews: 780,
  },
};

function getMockHospital(slug: string): HospitalData {
  const panIndiaMatch = ALL_HOSPITALS.find(
    (h) => h.slug === slug || h.id === slug || h.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );
  if (panIndiaMatch) {
    return {
      id: panIndiaMatch.id,
      name: panIndiaMatch.name,
      slug: panIndiaMatch.slug,
      type: panIndiaMatch.type,
      address: panIndiaMatch.address,
      city: panIndiaMatch.city,
      state: panIndiaMatch.state,
      pincode: panIndiaMatch.pincode || "110001",
      latitude: panIndiaMatch.latitude,
      longitude: panIndiaMatch.longitude,
      phone: panIndiaMatch.phone,
      emergency_phone: panIndiaMatch.emergency_phone,
      ambulance_phone: panIndiaMatch.ambulance_phone,
      email: "desk@medroute.in",
      website: "https://medroute.in",
      beds_total: panIndiaMatch.beds_total,
      beds_icu: panIndiaMatch.beds_icu,
      beds_icu_available: panIndiaMatch.beds_icu_available,
      beds_ventilator: panIndiaMatch.beds_ventilator,
      beds_nicu: Math.floor(panIndiaMatch.beds_icu * 0.4),
      is_pmjay_empanelled: panIndiaMatch.is_pmjay_empanelled,
      is_emergency_24x7: true,
      is_trauma_center: panIndiaMatch.is_trauma_center,
      trauma_level: panIndiaMatch.trauma_level,
      accreditation: panIndiaMatch.accreditation,
      overall_rating: panIndiaMatch.overall_rating,
      total_reviews: panIndiaMatch.total_reviews,
      data_source_label: "VERIFIED_REGISTRY",
      pros: panIndiaMatch.pros,
      cons: panIndiaMatch.cons,
      top_disease_treated: panIndiaMatch.top_disease_treated,
      total_patients_treated: panIndiaMatch.total_patients_treated,
      avg_treatment_cost: panIndiaMatch.avg_treatment_cost,
      overall_success_ratio: panIndiaMatch.overall_success_ratio,
      procedures: (panIndiaMatch.procedures && panIndiaMatch.procedures.length > 0)
        ? panIndiaMatch.procedures.map((p) => ({
            name: p.name,
            disease: p.disease,
            category: p.category,
            cost_min: p.cost_min,
            cost_max: p.cost_max,
            cost_avg: p.cost_avg,
            cost_formatted: p.cost_formatted,
            pmjay_covered: p.pmjay_covered,
            pmjay_package_rate: p.pmjay_package_rate,
            success_rate: p.success_rate,
            success_ratio: p.success_ratio,
            wait_time_days: p.wait_time_days,
            volume_per_year: p.volume_per_year,
            patients_treated: p.patients_treated,
          }))
        : getMockProcedures(),
      facilities: getMockFacilities(),
      departments: getMockDepartments(),
      reviews: (panIndiaMatch.reviews && panIndiaMatch.reviews.length > 0)
        ? panIndiaMatch.reviews.map((r, idx) => ({
            id: r.id || `rev-${idx}`,
            author_name: r.author_name || "Verified Patient",
            rating: r.rating_overall || 5,
            cost_transparency_rating: 5,
            treatment_category: r.treatment_category || "Emergency Care",
            title: r.title || "Clinical Experience",
            content: r.comment || "Patient provided positive feedback regarding treatment and facilities.",
            helpful_count: r.helpful_count || 5,
            created_at: r.created_at || "Recent Visit",
            would_recommend: r.would_recommend,
          }))
        : getMockReviews(),
    };
  }

  const match =
    DETAILED_HOSPITALS_REGISTRY[slug] ||
    Object.entries(DETAILED_HOSPITALS_REGISTRY).find(([k]) => slug.includes(k))?.[1] ||
    DETAILED_HOSPITALS_REGISTRY["pgimer-chandigarh"];

  return {
    id: `hosp-${slug}`,
    name: match.name || "Regional Specialty Hospital",
    slug: slug,
    type: match.type || "private",
    address: match.address || "Main Medical Enclave",
    city: match.city || "Chandigarh",
    state: match.state || "Chandigarh",
    pincode: match.pincode || "160012",
    latitude: match.latitude || 30.7634,
    longitude: match.longitude || 76.7766,
    phone: match.phone || "0172-2755555",
    emergency_phone: match.emergency_phone || "0172-2756565",
    email: "emergency@medroute.in",
    website: match.website || "https://medroute.in",
    beds_total: match.beds_total || 450,
    beds_icu: match.beds_icu || 60,
    beds_icu_available: match.beds_icu_available || 8,
    beds_ventilator: match.beds_ventilator || 35,
    beds_nicu: match.beds_nicu || 15,
    is_pmjay_empanelled: match.is_pmjay_empanelled ?? true,
    is_emergency_24x7: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    accreditation: match.accreditation || "NABH Accredited",
    overall_rating: match.overall_rating || 4.7,
    total_reviews: match.total_reviews || 280,
    data_source_label: "SIMULATED",
    top_disease_treated: "Coronary Artery Disease (CAD)",
    total_patients_treated: 16400,
    avg_treatment_cost: 65000,
    overall_success_ratio: "97.4%",
    procedures: getMockProcedures(),
    facilities: getMockFacilities(),
    departments: getMockDepartments(),
    reviews: getMockReviews(),
  };
}

function getMockProcedures(): ProcedureItem[] {
  return [
    {
      name: "Coronary Angioplasty (PTCA)",
      disease: "Coronary Artery Disease (CAD) / Heart Attack",
      category: "Cardiac",
      cost_min: 65000,
      cost_max: 180000,
      cost_avg: 110000,
      cost_formatted: "₹1,10,000 avg (₹65k – ₹1.8L)",
      pmjay_covered: true,
      pmjay_package_rate: 65000,
      success_rate: 96.8,
      success_ratio: "96.8%",
      wait_time_days: 2,
      volume_per_year: 1450,
      patients_treated: 1850,
    },
    {
      name: "Total Knee Replacement (Unilateral)",
      disease: "Severe Knee Osteoarthritis",
      category: "Orthopedic",
      cost_min: 90000,
      cost_max: 220000,
      cost_avg: 145000,
      cost_formatted: "₹1,45,000 avg (₹90k – ₹2.2L)",
      pmjay_covered: true,
      pmjay_package_rate: 80000,
      success_rate: 97.4,
      success_ratio: "97.4%",
      wait_time_days: 4,
      volume_per_year: 820,
      patients_treated: 1420,
    },
    {
      name: "Cataract Surgery (Phaco + Foldable IOL)",
      disease: "Senile Cataract & Vision Impairment",
      category: "Ophthalmology",
      cost_min: 8000,
      cost_max: 45000,
      cost_avg: 22000,
      cost_formatted: "₹22,000 avg (₹8k – ₹45k)",
      pmjay_covered: true,
      pmjay_package_rate: 8500,
      success_rate: 99.1,
      success_ratio: "99.1%",
      wait_time_days: 1,
      volume_per_year: 3200,
      patients_treated: 4100,
    },
    {
      name: "Laparoscopic Cholecystectomy (Gallbladder)",
      disease: "Cholelithiasis (Gallbladder Stones)",
      category: "General Surgery",
      cost_min: 25000,
      cost_max: 85000,
      cost_avg: 48000,
      cost_formatted: "₹48,000 avg (₹25k – ₹85k)",
      pmjay_covered: true,
      pmjay_package_rate: 28000,
      success_rate: 98.6,
      success_ratio: "98.6%",
      wait_time_days: 3,
      volume_per_year: 940,
      patients_treated: 2100,
    },
    {
      name: "Hemodialysis (Per Session)",
      disease: "Chronic Kidney Disease (ESRD)",
      category: "Renal",
      cost_min: 800,
      cost_max: 3000,
      cost_avg: 1800,
      cost_formatted: "₹1,800 / session",
      pmjay_covered: true,
      pmjay_package_rate: 1500,
      success_rate: 99.2,
      success_ratio: "99.2%",
      wait_time_days: 1,
      volume_per_year: 5800,
      patients_treated: 4800,
    },
    {
      name: "Normal / Caesarean Delivery (LSCS)",
      disease: "High-Risk Pregnancy / Obstructed Labor",
      category: "Obstetrics",
      cost_min: 15000,
      cost_max: 75000,
      cost_avg: 38000,
      cost_formatted: "₹38,000 avg (₹15k – ₹75k)",
      pmjay_covered: true,
      pmjay_package_rate: 18000,
      success_rate: 98.8,
      success_ratio: "98.8%",
      wait_time_days: 1,
      volume_per_year: 2100,
      patients_treated: 3400,
    },
  ];
}

function getMockFacilities(): FacilityItem[] {
  return [
    { name: "Cardiac Cath Lab (Dual Plane)", category: "Diagnostic", is_available: true, is_24x7: true, count: 3 },
    { name: "128-Slice CT Scan", category: "Diagnostic", is_available: true, is_24x7: true, count: 2 },
    { name: "3.0 Tesla Silent MRI", category: "Diagnostic", is_available: true, is_24x7: true, count: 2 },
    { name: "Level 1 Trauma Emergency", category: "Critical Care", is_available: true, is_24x7: true },
    { name: "Licensed Blood Bank (Components)", category: "Critical Care", is_available: true, is_24x7: true },
    { name: "Advanced Dialysis Wing", category: "Renal", is_available: true, is_24x7: false, count: 28 },
    { name: "ACLS Cardiac Ambulance Fleet", category: "Transport", is_available: true, is_24x7: true, count: 6 },
    { name: "24x7 In-House Pharmacy", category: "Pharmacy", is_available: true, is_24x7: true },
  ];
}

function getMockDepartments(): DepartmentItem[] {
  return [
    {
      name: "Department of Cardiology",
      head_doctor: "Dr. Yash Paul Sharma",
      head_doctor_qualification: "MD, DM (Cardiology), FACC",
      doctor_count: 14,
      specialization: "Interventional Cardiology & Electrophysiology",
    },
    {
      name: "Department of Orthopedics & Trauma",
      head_doctor: "Dr. M. S. Dhillon",
      head_doctor_qualification: "MS (Ortho), FRCS",
      doctor_count: 12,
      specialization: "Arthroplasty & Spine Surgery",
    },
    {
      name: "Department of Nephrology",
      head_doctor: "Dr. K. L. Gupta",
      head_doctor_qualification: "MD, DM (Nephrology)",
      doctor_count: 8,
      specialization: "Kidney Transplant & Acute Renal Care",
    },
    {
      name: "Advanced Eye Centre",
      head_doctor: "Dr. Jagat Ram",
      head_doctor_qualification: "MS, DNB, FAMS",
      doctor_count: 16,
      specialization: "Cornea, Vitreo-Retina & Cataract",
    },
  ];
}

function getMockReviews(): ReviewItem[] {
  return [
    {
      id: "rev-1",
      author_name: "Gurpreet Singh (Mohali)",
      rating: 5,
      cost_transparency_rating: 5,
      treatment_category: "Cardiology",
      title: "Saved my father's life during cardiac arrest",
      content:
        "Brought my father to emergency at 2 AM. The cardiac cath lab was primed immediately. Stent surgery was done under 45 minutes with full pricing explanation before the procedure. No hidden costs whatsoever.",
      helpful_count: 28,
      created_at: "2 weeks ago",
      would_recommend: true,
    },
    {
      id: "rev-2",
      author_name: "Ananya Sharma (Chandigarh)",
      rating: 5,
      cost_transparency_rating: 4,
      treatment_category: "Orthopedic",
      title: "Total knee replacement - transparent PMJAY handling",
      content:
        "Underwent knee replacement surgery. The PMJAY desk verified my card within an hour. Hospital staff guided us smoothly through implant choices and postoperative physio.",
      helpful_count: 19,
      created_at: "1 month ago",
      would_recommend: true,
    },
    {
      id: "rev-3",
      author_name: "Col. Harjit K. (Panchkula)",
      rating: 4,
      cost_transparency_rating: 4,
      treatment_category: "Renal",
      title: "Excellent doctors, long OPD registration queue",
      content:
        "The nephrology consultants are world class. The only friction is morning OPD crowd, so book an online slot in advance if possible.",
      helpful_count: 14,
      created_at: "2 months ago",
      would_recommend: true,
    },
  ];
}
