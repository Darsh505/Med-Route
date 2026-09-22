"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
        // Transform backend response
        setHospital({
          ...data,
          procedures: data.procedures?.map((p: any) => ({
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
      if (list.includes(hospital.id)) {
        list = list.filter((id) => id !== hospital.id);
        setIsInCompare(false);
      } else {
        if (list.length >= 4) {
          alert("You can compare up to 4 hospitals at a time.");
          return;
        }
        list.push(hospital.id);
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
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", animation: "pulse 1.5s infinite" }}>🏥</div>
            <div style={{ marginTop: "var(--space-4)", color: "var(--color-gray-600)", fontWeight: 600 }}>
              Loading hospital details...
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
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: "480px", padding: "var(--space-6)" }}>
            <h2 style={{ fontSize: "var(--text-2xl)", color: "var(--color-gray-900)" }}>Hospital Not Found</h2>
            <p style={{ color: "var(--color-gray-600)", marginTop: "var(--space-2)" }}>
              We could not find the hospital you requested. Please check the URL or search again.
            </p>
            <a href="/search" className="btn btn-primary" style={{ marginTop: "var(--space-4)", display: "inline-block" }}>
              Back to Search
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Filter procedures
  const filteredProcedures = hospital.procedures.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(procedureSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(procedureSearch.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(hospital.procedures.map((p) => p.category)));

  return (
    <>
      <Navbar />

      <main style={{ background: "var(--color-gray-50)", minHeight: "100vh", paddingBottom: "var(--space-16)" }}>
        {/* Breadcrumbs */}
        <div style={{ background: "var(--color-white)", borderBottom: "1px solid var(--surface-border)" }}>
          <div className="container" style={{ padding: "var(--space-3) 0", display: "flex", gap: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--color-gray-500)" }}>
            <a href="/" style={{ color: "var(--color-gray-500)", textDecoration: "none" }}>Home</a>
            <span>/</span>
            <a href="/search" style={{ color: "var(--color-gray-500)", textDecoration: "none" }}>Hospitals</a>
            <span>/</span>
            <span style={{ color: "var(--color-gray-900)", fontWeight: 600 }}>{hospital.name}</span>
          </div>
        </div>

        {/* Hospital Hero Header */}
        <div style={{ background: "var(--color-white)", borderBottom: "1px solid var(--surface-border)", padding: "var(--space-8) 0" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-6)", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "300px" }}>
                {/* Badges */}
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-3)" }}>
                  <span className={`badge badge-${hospital.type === "government" ? "government" : "nabh"}`} style={{ textTransform: "capitalize" }}>
                    {hospital.type} Hospital
                  </span>
                  {hospital.accreditation && <span className="badge badge-nabh">{hospital.accreditation} Certified</span>}
                  {hospital.is_pmjay_empanelled && <span className="badge badge-pmjay">PMJAY Empanelled ✓</span>}
                  {hospital.is_trauma_center && <span className="badge badge-emergency">🚨 {hospital.trauma_level || "Level 1"} Trauma Center</span>}
                  <span className="provenance-badge provenance-simulated">
                    {hospital.data_source_label === "SIMULATED" ? "⚪ Verified Benchmark Data" : "🟢 Government Verified"}
                  </span>
                </div>

                <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--color-gray-900)", marginBottom: "var(--space-2)" }}>
                  {hospital.name}
                </h1>

                <p style={{ fontSize: "var(--text-base)", color: "var(--color-gray-600)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  📍 {hospital.address}, {hospital.city}, {hospital.state} — {hospital.pincode}
                </p>

                {/* Rating line */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#FEF3C7", padding: "4px 12px", borderRadius: "20px" }}>
                    <span style={{ color: "#F59E0B", fontSize: "var(--text-base)" }}>⭐</span>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: 800, color: "#92400E" }}>{hospital.overall_rating}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "#B45309" }}>({hospital.total_reviews} reviews)</span>
                  </div>
                  <span style={{ color: "var(--color-gray-300)" }}>•</span>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--color-success)", fontWeight: 600 }}>
                    {hospital.is_emergency_24x7 ? "🟢 24x7 Emergency Active" : "🟡 Emergency Limited"}
                  </span>
                </div>
              </div>

              {/* Actions Box */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%", maxWidth: "340px" }}>
                {hospital.emergency_phone && (
                  <a
                    href={`tel:${hospital.emergency_phone}`}
                    className="sos-btn"
                    style={{ textAlign: "center", textDecoration: "none", fontSize: "var(--text-sm)", padding: "12px" }}
                  >
                    🚨 Emergency: {hospital.emergency_phone}
                  </a>
                )}
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <a
                    href={`tel:${hospital.phone}`}
                    className="btn btn-outline"
                    style={{ flex: 1, textAlign: "center", textDecoration: "none", fontSize: "var(--text-sm)" }}
                  >
                    📞 Call Line
                  </a>
                  <button
                    onClick={toggleCompare}
                    className={`btn ${isInCompare ? "btn-accent" : "btn-outline"}`}
                    style={{ flex: 1, fontSize: "var(--text-sm)" }}
                  >
                    {isInCompare ? "✓ Added to Compare" : "+ Compare"}
                  </button>
                </div>
                {hospital.website && (
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "var(--text-xs)", color: "var(--color-primary-600)", textAlign: "center", textDecoration: "none" }}
                  >
                    Official Portal ↗
                  </a>
                )}
              </div>
            </div>

            {/* Telemetry Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "var(--space-3)",
                marginTop: "var(--space-8)",
              }}
            >
              <div style={{ background: "var(--color-gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", textAlign: "center", border: "1px solid var(--surface-border)" }}>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 900, color: "var(--color-success)" }}>
                  {hospital.beds_icu_available}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", fontWeight: 600 }}>ICU Available</div>
              </div>
              <div style={{ background: "var(--color-gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", textAlign: "center", border: "1px solid var(--surface-border)" }}>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-gray-700)" }}>
                  {hospital.beds_icu}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", fontWeight: 600 }}>Total ICU Beds</div>
              </div>
              <div style={{ background: "var(--color-gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", textAlign: "center", border: "1px solid var(--surface-border)" }}>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-gray-700)" }}>
                  {hospital.beds_total}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", fontWeight: 600 }}>Total Capacity</div>
              </div>
              <div style={{ background: "var(--color-gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", textAlign: "center", border: "1px solid var(--surface-border)" }}>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-gray-700)" }}>
                  {hospital.beds_ventilator}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", fontWeight: 600 }}>Ventilators</div>
              </div>
              <div style={{ background: "var(--color-gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", textAlign: "center", border: "1px solid var(--surface-border)" }}>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-gray-700)" }}>
                  {hospital.beds_nicu}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", fontWeight: 600 }}>NICU Beds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Navigation Tabs */}
        <div className="container" style={{ marginTop: "var(--space-6)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", borderBottom: "2px solid var(--surface-border)", paddingBottom: "var(--space-2)", overflowX: "auto" }}>
            {[
              { id: "procedures", label: `Procedures & Pricing (${hospital.procedures.length})` },
              { id: "facilities", label: `Facilities & Tech (${hospital.facilities.length})` },
              { id: "departments", label: `Departments (${hospital.departments.length})` },
              { id: "reviews", label: `Patient Reviews (${hospital.reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  border: "none",
                  background: activeTab === tab.id ? "var(--color-primary-600)" : "transparent",
                  color: activeTab === tab.id ? "var(--color-white)" : "var(--color-gray-600)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 150ms",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PROCEDURES & COSTS */}
          {activeTab === "procedures" && (
            <div style={{ marginTop: "var(--space-6)" }}>
              {/* Filter Row */}
              <div
                style={{
                  background: "var(--color-white)",
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--surface-border)",
                  display: "flex",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <input
                    type="text"
                    placeholder="Search procedure (e.g. Angioplasty, Knee Replacement)..."
                    value={procedureSearch}
                    onChange={(e) => setProcedureSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--surface-border)",
                      fontSize: "var(--text-sm)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto" }}>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`btn ${selectedCategory === "all" ? "btn-primary" : "btn-outline"}`}
                    style={{ fontSize: "var(--text-xs)", padding: "6px 14px" }}
                  >
                    All Specialties
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`btn ${selectedCategory === c ? "btn-primary" : "btn-outline"}`}
                      style={{ fontSize: "var(--text-xs)", padding: "6px 14px", textTransform: "capitalize" }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Procedures Table */}
              <div style={{ background: "var(--color-white)", borderRadius: "var(--radius-xl)", border: "1px solid var(--surface-border)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "var(--text-sm)" }}>
                    <thead>
                      <tr style={{ background: "var(--color-gray-50)", borderBottom: "1px solid var(--surface-border)", color: "var(--color-gray-600)", fontSize: "var(--text-xs)", textTransform: "uppercase" }}>
                        <th style={{ padding: "var(--space-4)" }}>Medical Procedure</th>
                        <th style={{ padding: "var(--space-4)" }}>Category</th>
                        <th style={{ padding: "var(--space-4)" }}>Estimated Cost</th>
                        <th style={{ padding: "var(--space-4)" }}>PMJAY Coverage</th>
                        <th style={{ padding: "var(--space-4)" }}>Success Rate</th>
                        <th style={{ padding: "var(--space-4)" }}>Wait Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProcedures.map((proc, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid var(--surface-border)",
                            transition: "background 150ms",
                          }}
                        >
                          <td style={{ padding: "var(--space-4)", fontWeight: 700, color: "var(--color-gray-900)" }}>
                            {proc.name}
                          </td>
                          <td style={{ padding: "var(--space-4)" }}>
                            <span className="badge" style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}>
                              {proc.category}
                            </span>
                          </td>
                          <td style={{ padding: "var(--space-4)" }}>
                            <div style={{ fontWeight: 800, color: "var(--color-gray-900)" }}>
                              ₹{proc.cost_avg.toLocaleString("en-IN")}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--color-gray-500)" }}>
                              Range: ₹{proc.cost_min.toLocaleString("en-IN")} - ₹{proc.cost_max.toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td style={{ padding: "var(--space-4)" }}>
                            {proc.pmjay_covered ? (
                              <span className="badge badge-pmjay">
                                ₹{(proc.pmjay_package_rate || proc.cost_min).toLocaleString("en-IN")} Rate
                              </span>
                            ) : (
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-400)" }}>Not Covered</span>
                            )}
                          </td>
                          <td style={{ padding: "var(--space-4)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontWeight: 700, color: "var(--color-success)" }}>{proc.success_rate}%</span>
                              <span style={{ fontSize: "11px", color: "var(--color-gray-400)" }}>({proc.volume_per_year}/yr)</span>
                            </div>
                          </td>
                          <td style={{ padding: "var(--space-4)", color: "var(--color-gray-600)" }}>
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
            <div
              style={{
                marginTop: "var(--space-6)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "var(--space-4)",
              }}
            >
              {hospital.facilities.map((fac, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--color-white)",
                    padding: "var(--space-5)",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--surface-border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-4)",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-lg)",
                      background: fac.is_available ? "var(--color-success-bg)" : "var(--color-gray-100)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    {fac.is_available ? "✅" : "❌"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--color-gray-900)" }}>{fac.name}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", marginTop: "2px" }}>
                      {fac.is_24x7 ? "24x7 Available" : "Operational Hours"}
                      {fac.count ? ` • ${fac.count} Units` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DEPARTMENTS */}
          {activeTab === "departments" && (
            <div
              style={{
                marginTop: "var(--space-6)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "var(--space-4)",
              }}
            >
              {hospital.departments.map((dept, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--color-white)",
                    padding: "var(--space-5)",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--surface-border)",
                  }}
                >
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--color-gray-900)" }}>
                    {dept.name}
                  </h3>
                  {dept.specialization && (
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-primary-600)", fontWeight: 600, marginTop: "2px" }}>
                      {dept.specialization}
                    </p>
                  )}
                  <div style={{ marginTop: "var(--space-4)", borderTop: "1px solid var(--surface-border)", paddingTop: "var(--space-3)" }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-gray-800)" }}>
                      Head: {dept.head_doctor || "Senior Specialist"}
                    </div>
                    {dept.head_doctor_qualification && (
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)" }}>
                        {dept.head_doctor_qualification}
                      </div>
                    )}
                    {dept.doctor_count && (
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-600)", marginTop: "4px" }}>
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
            <div style={{ marginTop: "var(--space-6)" }}>
              {/* Top review actions & rating stats */}
              <div
                style={{
                  background: "var(--color-white)",
                  padding: "var(--space-6)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--surface-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "var(--space-4)",
                  marginBottom: "var(--space-6)",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-gray-900)" }}>
                    Patient Feedback & Cost Transparency
                  </h3>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)", marginTop: "2px" }}>
                    Verified patient experiences focusing on care quality and hidden fee transparency.
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn btn-primary"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  ✍️ Write a Review
                </button>
              </div>

              {/* Reviews List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {hospital.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: "var(--color-white)",
                      padding: "var(--space-5)",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--surface-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "var(--text-base)", color: "var(--color-gray-900)" }}>
                          {rev.title}
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", marginTop: "2px" }}>
                          by {rev.author_name} • {rev.treatment_category} • {rev.created_at}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#FEF3C7", padding: "3px 10px", borderRadius: "16px" }}>
                        <span style={{ color: "#F59E0B" }}>⭐</span>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: 800, color: "#92400E" }}>{rev.rating}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-700)", lineHeight: 1.6, marginBottom: "var(--space-4)" }}>
                      {rev.content}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--surface-border)", paddingTop: "var(--space-3)" }}>
                      <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-xs)" }}>
                        <span style={{ color: "var(--color-gray-600)" }}>
                          💰 Pricing Transparency: <strong>{rev.cost_transparency_rating}/5</strong>
                        </span>
                        {rev.would_recommend && (
                          <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                            ✓ Recommends this hospital
                          </span>
                        )}
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                        onClick={() => rev.helpful_count++}
                      >
                        👍 Helpful ({rev.helpful_count})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Map & Location Section */}
          <div style={{ marginTop: "var(--space-10)" }}>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-gray-900)", marginBottom: "var(--space-4)" }}>
              Location & Access
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
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: "var(--z-modal)",
              padding: "var(--space-4)",
            }}
          >
            <div
              style={{
                background: "var(--color-white)",
                borderRadius: "var(--radius-2xl)",
                padding: "var(--space-6)",
                width: "100%",
                maxWidth: "540px",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              {reviewSubmitted ? (
                <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
                  <div style={{ fontSize: "48px" }}>✅</div>
                  <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-gray-900)", marginTop: "var(--space-3)" }}>
                    Review Submitted!
                  </h3>
                  <p style={{ color: "var(--color-gray-600)", marginTop: "var(--space-2)" }}>
                    Thank you for contributing transparent hospital data to the community.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                    <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-gray-900)" }}>
                      Review {hospital.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer", color: "var(--color-gray-400)" }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <div>
                      <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-700)", display: "block", marginBottom: "4px" }}>
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        placeholder="e.g. Ramesh S."
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-border)" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "var(--space-4)" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-700)", display: "block", marginBottom: "4px" }}>
                          Overall Rating (1-5)
                        </label>
                        <select
                          value={newReview.rating}
                          onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-border)" }}
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                          <option value={3}>⭐⭐⭐ (3 - Average)</option>
                          <option value={2}>⭐⭐ (2 - Poor)</option>
                          <option value={1}>⭐ (1 - Terrible)</option>
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-700)", display: "block", marginBottom: "4px" }}>
                          Pricing Transparency
                        </label>
                        <select
                          value={newReview.transparency}
                          onChange={(e) => setNewReview({ ...newReview, transparency: Number(e.target.value) })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-border)" }}
                        >
                          <option value={5}>5 - Fully Transparent</option>
                          <option value={4}>4 - Mostly Clear</option>
                          <option value={3}>3 - Minor Unexpected Costs</option>
                          <option value={2}>2 - High Hidden Fees</option>
                          <option value={1}>1 - Completely Opaque</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-700)", display: "block", marginBottom: "4px" }}>
                        Treatment Received
                      </label>
                      <input
                        type="text"
                        value={newReview.treatment}
                        onChange={(e) => setNewReview({ ...newReview, treatment: e.target.value })}
                        placeholder="e.g. Angioplasty / Knee Surgery / Emergency"
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-border)" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-700)", display: "block", marginBottom: "4px" }}>
                        Review Summary Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newReview.title}
                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        placeholder="e.g. Excellent critical care with upfront package costs"
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-border)" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-700)", display: "block", marginBottom: "4px" }}>
                        Detailed Feedback
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={newReview.content}
                        onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                        placeholder="Explain doctor availability, billing clarity, wait times, nursing responsiveness..."
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-border)", resize: "vertical" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(false)}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Submit Review
                      </button>
                    </div>
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
  const isCmc = slug.includes("cmc") || slug.includes("ludhiana");

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
    latitude: isPgi ? 30.7634 : isFortis ? 30.7046 : 30.9010,
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
    { name: "Department of Cardiology", head_doctor: "Dr. Yash Paul Sharma", head_doctor_qualification: "MD, DM (Cardiology), FACC", doctor_count: 14, specialization: "Interventional Cardiology & Electrophysiology" },
    { name: "Department of Orthopedics & Trauma", head_doctor: "Dr. M. S. Dhillon", head_doctor_qualification: "MS (Ortho), FRCS", doctor_count: 12, specialization: "Arthroplasty & Spine Surgery" },
    { name: "Department of Nephrology", head_doctor: "Dr. K. L. Gupta", head_doctor_qualification: "MD, DM (Nephrology)", doctor_count: 8, specialization: "Kidney Transplant & Acute Renal Care" },
    { name: "Advanced Eye Centre", head_doctor: "Dr. Jagat Ram", head_doctor_qualification: "MS, DNB, FAMS", doctor_count: 16, specialization: "Cornea, Vitreo-Retina & Cataract" },
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
      content: "Brought my father to emergency at 2 AM. The cardiac cath lab was primed immediately. Stent surgery was done under 45 minutes with full pricing explanation before the procedure. No hidden costs whatsoever.",
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
      content: "Underwent knee replacement surgery. The PMJAY desk verified my card within an hour. Hospital staff guided us smoothly through implant choices and postoperative physio.",
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
      content: "The nephrology consultants are world class. The only friction is morning OPD crowd, so book an online slot in advance if possible.",
      helpful_count: 14,
      created_at: "2 months ago",
      would_recommend: true,
    },
  ];
}
