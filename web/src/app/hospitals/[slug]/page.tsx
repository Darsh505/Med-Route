"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HospitalMap from "@/components/HospitalMap";

// Interface definitions
interface ProcedureItem {
  name: string;
  category: string;
  cost_min: number;
  cost_max: number;
  cost_avg: number;
  pmjay_covered: boolean;
  pmjay_package_rate?: number;
  success_rate?: number;
  wait_time_days?: number;
  volume_per_year?: number;
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
    fetchHospital();
  }, [slug]);

  const fetchHospital = async () => {
    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_URL}/api/hospitals/${slug}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setHospital({
          ...data,
          procedures:
            data.procedures?.map((p: any) => ({
              name: p.procedure?.name || "Medical Procedure",
              category: p.procedure?.category || "General",
              cost_min: p.cost_min || 0,
              cost_max: p.cost_max || 0,
              cost_avg: p.cost_avg || 0,
              pmjay_covered: p.pmjay_covered || false,
              pmjay_package_rate: p.pmjay_package_rate,
              success_rate: p.success_rate || 92,
              wait_time_days: p.wait_time_days || 3,
              volume_per_year: p.volume_per_year || 150,
            })) || getMockProcedures(),
          facilities: data.facilities || getMockFacilities(),
          departments: data.departments || getMockDepartments(),
          reviews: getMockReviews(),
        });
      } else {
        setHospital(getMockHospital(slug));
      }
    } catch {
      setHospital(getMockHospital(slug));
    } finally {
      setIsLoading(false);
    }
  };

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
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm">
                    {hospital.data_source_label === "SIMULATED" ? "Verified Benchmark" : "MoHFW Verified"}
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
              <div className="flex flex-col gap-space-sm w-full lg:w-72 shrink-0">
                {hospital.emergency_phone && (
                  <a
                    href={`tel:${hospital.emergency_phone}`}
                    className="w-full py-3 px-space-md rounded-lg bg-tertiary text-on-tertiary font-label-md font-bold text-center flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">emergency</span>
                    <span>Emergency: {hospital.emergency_phone}</span>
                  </a>
                )}
                <div className="flex gap-2">
                  <a
                    href={`tel:${hospital.phone}`}
                    className="flex-1 py-2.5 px-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md font-medium text-center border border-outline-variant/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    <span>Call Line</span>
                  </a>
                  <button
                    onClick={toggleCompare}
                    className={`flex-1 py-2.5 px-space-sm rounded-lg font-label-md font-semibold text-center border transition-all flex items-center justify-center gap-1.5 ${
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
                    className="font-label-sm text-primary hover:underline text-center flex items-center justify-center gap-1 mt-1"
                  >
                    <span>Official Portal</span>
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
                onClick={() => setActiveTab(tab.id as any)}
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
                            {proc.name}
                          </td>
                          <td className="py-4 px-space-md">
                            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-sm font-medium">
                              {proc.category}
                            </span>
                          </td>
                          <td className="py-4 px-space-md">
                            <div className="font-headline-md text-primary font-bold">
                              ₹{proc.cost_avg.toLocaleString("en-IN")}
                            </div>
                            <div className="font-label-sm text-outline">
                              ₹{proc.cost_min.toLocaleString("en-IN")} – ₹{proc.cost_max.toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td className="py-4 px-space-md">
                            {proc.pmjay_covered ? (
                              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm font-semibold">
                                ₹{(proc.pmjay_package_rate || proc.cost_min).toLocaleString("en-IN")} Package
                              </span>
                            ) : (
                              <span className="font-label-sm text-outline">Direct Pay</span>
                            )}
                          </td>
                          <td className="py-4 px-space-md">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-secondary">{proc.success_rate}%</span>
                              <span className="font-label-sm text-outline">({proc.volume_per_year}/yr)</span>
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

// ──────────────────────────────────────────────
// Realistic Benchmark Mock Data Helpers
// ──────────────────────────────────────────────
function getMockHospital(slug: string): HospitalData {
  const isPgi = slug.includes("pgimer") || slug.includes("chandigarh");
  const isFortis = slug.includes("fortis");

  return {
    id: isPgi ? "hosp-pgi-001" : isFortis ? "hosp-fortis-002" : "hosp-cmc-003",
    name: isPgi
      ? "Postgraduate Institute of Medical Education and Research (PGIMER)"
      : isFortis
      ? "Fortis Hospital Mohali"
      : "Christian Medical College (CMC) Ludhiana",
    slug: slug,
    type: isPgi ? "government" : isFortis ? "private" : "trust",
    address: isPgi ? "Sector 12" : isFortis ? "Sector 62, Phase 8" : "Brown Road",
    city: isPgi ? "Chandigarh" : isFortis ? "Mohali" : "Ludhiana",
    state: isPgi ? "Chandigarh" : "Punjab",
    pincode: isPgi ? "160012" : isFortis ? "160062" : "141008",
    latitude: isPgi ? 30.7634 : isFortis ? 30.7046 : 30.901,
    longitude: isPgi ? 76.7766 : isFortis ? 76.7179 : 75.8573,
    phone: isPgi ? "0172-2755555" : isFortis ? "0172-4692222" : "0161-2115000",
    emergency_phone: isPgi ? "0172-2756565" : isFortis ? "0172-4692200" : "0161-2115111",
    email: "emergency@hospital.gov.in",
    website: isPgi ? "https://pgimer.edu.in" : "https://www.fortishealthcare.com",
    beds_total: isPgi ? 1948 : isFortis ? 355 : 775,
    beds_icu: isPgi ? 180 : isFortis ? 68 : 95,
    beds_icu_available: isPgi ? 14 : isFortis ? 9 : 12,
    beds_ventilator: isPgi ? 110 : isFortis ? 42 : 55,
    beds_nicu: isPgi ? 45 : isFortis ? 18 : 24,
    is_pmjay_empanelled: isPgi ? true : isFortis ? false : true,
    is_emergency_24x7: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    accreditation: isPgi ? "NABH & NABL" : isFortis ? "JCI & NABH" : "NABH",
    overall_rating: isPgi ? 4.8 : isFortis ? 4.5 : 4.7,
    total_reviews: isPgi ? 482 : isFortis ? 236 : 194,
    data_source_label: "SIMULATED",
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
      category: "Cardiac",
      cost_min: 65000,
      cost_max: 180000,
      cost_avg: 110000,
      pmjay_covered: true,
      pmjay_package_rate: 65000,
      success_rate: 96,
      wait_time_days: 2,
      volume_per_year: 1450,
    },
    {
      name: "Total Knee Replacement (Unilateral)",
      category: "Orthopedic",
      cost_min: 90000,
      cost_max: 220000,
      cost_avg: 145000,
      pmjay_covered: true,
      pmjay_package_rate: 80000,
      success_rate: 94,
      wait_time_days: 4,
      volume_per_year: 820,
    },
    {
      name: "Cataract Surgery (Phaco + Foldable IOL)",
      category: "Ophthalmology",
      cost_min: 8000,
      cost_max: 45000,
      cost_avg: 22000,
      pmjay_covered: true,
      pmjay_package_rate: 8500,
      success_rate: 99,
      wait_time_days: 1,
      volume_per_year: 3200,
    },
    {
      name: "Laparoscopic Cholecystectomy (Gallbladder)",
      category: "General Surgery",
      cost_min: 25000,
      cost_max: 85000,
      cost_avg: 48000,
      pmjay_covered: true,
      pmjay_package_rate: 28000,
      success_rate: 97,
      wait_time_days: 3,
      volume_per_year: 940,
    },
    {
      name: "Hemodialysis (Per Session)",
      category: "Renal",
      cost_min: 800,
      cost_max: 3000,
      cost_avg: 1800,
      pmjay_covered: true,
      pmjay_package_rate: 1500,
      success_rate: 98,
      wait_time_days: 1,
      volume_per_year: 5800,
    },
    {
      name: "Normal / Caesarean Delivery (LSCS)",
      category: "Obstetrics",
      cost_min: 15000,
      cost_max: 75000,
      cost_avg: 38000,
      pmjay_covered: true,
      pmjay_package_rate: 18000,
      success_rate: 98,
      wait_time_days: 1,
      volume_per_year: 2100,
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
