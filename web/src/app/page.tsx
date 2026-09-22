"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Category data
const CATEGORIES = [
  { emoji: "❤️", label: "Cardiac", slug: "cardiac" },
  { emoji: "🦴", label: "Orthopedic", slug: "orthopedic" },
  { emoji: "🧠", label: "Neurological", slug: "neurological" },
  { emoji: "👁️", label: "Eye Care", slug: "ophthalmology" },
  { emoji: "🫘", label: "Renal", slug: "renal" },
  { emoji: "🦷", label: "Dental", slug: "dental" },
  { emoji: "🩺", label: "General", slug: "general" },
  { emoji: "👶", label: "Pediatric", slug: "pediatric" },
];

const TRUST_METRICS = [
  { value: "50+", label: "Verified Hospitals", icon: "🏥" },
  { value: "200+", label: "Medical Procedures", icon: "💊" },
  { value: "₹0", label: "Cost to Compare", icon: "📊" },
];

const FEATURED_HOSPITALS = [
  {
    name: "PGIMER Chandigarh",
    city: "Chandigarh",
    distance: "3.2 km",
    rating: 4.8,
    type: "Government",
    accreditation: "NABH",
    slug: "pgimer-chandigarh",
    isTrauma: true,
    isPmjay: true,
  },
  {
    name: "Fortis Hospital Mohali",
    city: "Mohali",
    distance: "8.5 km",
    rating: 4.6,
    type: "Private",
    accreditation: "NABH",
    slug: "fortis-hospital-mohali",
    isTrauma: true,
    isPmjay: false,
  },
  {
    name: "CMC Ludhiana",
    city: "Ludhiana",
    distance: "90 km",
    rating: 4.9,
    type: "Trust",
    accreditation: "NABH",
    slug: "christian-medical-college-ludhiana",
    isTrauma: true,
    isPmjay: true,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/search?category=${slug}`);
  };

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero Section ───────────────────────────────────────── */}
        <section
          className="hero-section"
          style={{
            background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 50%, var(--color-accent-600) 100%)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative background circles */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 70% 30%, rgba(14,165,160,0.2) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.15) 0%, transparent 50%)",
            }}
          />

          <div className="container" style={{ position: "relative", zIndex: 1, paddingBlock: "var(--space-20)" }}>
            <div style={{ maxWidth: "720px" }}>
              {/* Headline */}
              <div className="animate-fade-in">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "var(--radius-full)",
                    padding: "6px 16px",
                    color: "#A5F3FC",
                    fontSize: "var(--text-sm)",
                    fontWeight: "600",
                    marginBottom: "var(--space-6)",
                  }}
                >
                  🤖 AI-Powered Hospital Discovery
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: "white",
                  marginBottom: "var(--space-4)",
                }}
              >
                Find the Right Hospital.
                <br />
                <span style={{ color: "#5EEAD4" }}>At the Right Cost.</span>
                <br />
                <span style={{ color: "#93C5FD" }}>Near You.</span>
              </h1>

              <p
                style={{
                  fontSize: "var(--text-lg)",
                  color: "rgba(255,255,255,0.75)",
                  marginBottom: "var(--space-10)",
                  lineHeight: 1.6,
                  maxWidth: "520px",
                }}
              >
                Search in plain language. Compare costs. Check live ICU availability.
                Trigger SOS emergency dispatch — all in one place.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} id="hero-search-form">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "var(--radius-2xl)",
                    padding: "8px 8px 8px 20px",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                    border: "2px solid rgba(255,255,255,0.5)",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>🔍</span>
                  <input
                    id="main-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Find kidney treatment near Chandigarh under ₹2 lakhs..."
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: "var(--text-base)",
                      color: "var(--color-gray-800)",
                      fontFamily: "var(--font-body)",
                    }}
                    aria-label="Search hospitals by condition, location, or budget"
                  />
                  <button
                    id="hero-search-btn"
                    type="submit"
                    disabled={isSearching}
                    style={{
                      background: "var(--color-primary-600)",
                      color: "white",
                      border: "none",
                      borderRadius: "var(--radius-xl)",
                      padding: "12px 24px",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 200ms",
                    }}
                  >
                    {isSearching ? "Searching..." : "Search →"}
                  </button>
                </div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--text-sm)", marginTop: "var(--space-3)", marginLeft: "4px" }}>
                  Try: &ldquo;NABH hospital cardiac bypass Delhi&rdquo; · &ldquo;gurdey ka ilaj Ludhiana 2 lakh&rdquo;
                </p>
              </form>

              {/* SOS Button */}
              <div style={{ marginTop: "var(--space-6)" }}>
                <a
                  href="/sos"
                  id="hero-sos-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(220,38,38,0.9)",
                    color: "white",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderRadius: "var(--radius-full)",
                    padding: "10px 24px",
                    fontWeight: 700,
                    fontSize: "var(--text-sm)",
                    textDecoration: "none",
                    animation: "emergency-pulse 2s infinite",
                  }}
                >
                  🚨 Emergency SOS — Find Nearest Hospital
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Categories Section ──────────────────────────────────── */}
        <section style={{ padding: "var(--space-16) 0", background: "white" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
              <h2 style={{ fontSize: "var(--text-3xl)", marginBottom: "var(--space-3)" }}>
                Browse by Specialty
              </h2>
              <p style={{ color: "var(--color-gray-500)", fontSize: "var(--text-base)" }}>
                Find specialized hospitals for your medical condition
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "var(--space-4)",
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  id={`category-${cat.slug}`}
                  onClick={() => handleCategoryClick(cat.slug)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-5)",
                    background: "var(--color-gray-50)",
                    border: "2px solid var(--surface-border)",
                    borderRadius: "var(--radius-xl)",
                    cursor: "pointer",
                    transition: "all 200ms",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-primary-400)";
                    (e.currentTarget as HTMLElement).style.background = "var(--color-primary-50)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--surface-border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--color-gray-50)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{cat.emoji}</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-gray-700)" }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust Metrics ───────────────────────────────────────── */}
        <section
          style={{
            padding: "var(--space-16) 0",
            background: "linear-gradient(135deg, var(--color-primary-50) 0%, #EFF6FF 100%)",
          }}
        >
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-8)", textAlign: "center" }}>
              {TRUST_METRICS.map((metric) => (
                <div key={metric.label}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>{metric.icon}</div>
                  <div
                    style={{
                      fontSize: "3rem",
                      fontWeight: 900,
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-primary-600)",
                      lineHeight: 1,
                      marginBottom: "var(--space-2)",
                    }}
                  >
                    {metric.value}
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-600)", fontWeight: 500 }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Hospitals ──────────────────────────────────── */}
        <section style={{ padding: "var(--space-16) 0", background: "white" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
              <h2 style={{ fontSize: "var(--text-2xl)" }}>Featured Hospitals</h2>
              <a href="/search" style={{ color: "var(--color-primary-600)", fontWeight: 600, fontSize: "var(--text-sm)" }}>
                View All →
              </a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
              {FEATURED_HOSPITALS.map((hospital) => (
                <a
                  key={hospital.slug}
                  href={`/hospitals/${hospital.slug}`}
                  id={`featured-hospital-${hospital.slug}`}
                  className="hospital-card"
                  data-type={hospital.type.toLowerCase()}
                  style={{ padding: "var(--space-6)", textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                    <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-gray-900)" }}>
                      {hospital.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#FEF3C7", padding: "4px 8px", borderRadius: "20px" }}>
                      <span style={{ color: "#F59E0B" }}>⭐</span>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#92400E" }}>{hospital.rating}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)", marginBottom: "var(--space-3)" }}>
                    📍 {hospital.city} · {hospital.distance}
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span className={`badge badge-${hospital.type === "Government" ? "government" : "nabh"}`}>
                      {hospital.type}
                    </span>
                    {hospital.accreditation && (
                      <span className="badge badge-nabh">{hospital.accreditation}</span>
                    )}
                    {hospital.isPmjay && <span className="badge badge-pmjay">PMJAY ✓</span>}
                    {hospital.isTrauma && <span className="badge badge-emergency">🚨 Trauma</span>}
                  </div>
                  <div style={{ marginTop: "var(--space-4)", color: "var(--color-primary-600)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
                    View Details →
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ────────────────────────────────────────── */}
        <section style={{ padding: "var(--space-20) 0", background: "var(--color-gray-50)" }}>
          <div className="container">
            <h2 style={{ textAlign: "center", fontSize: "var(--text-3xl)", marginBottom: "var(--space-4)" }}>
              How Med Route Works
            </h2>
            <p style={{ textAlign: "center", color: "var(--color-gray-500)", marginBottom: "var(--space-12)" }}>
              Three simple steps to find the right hospital
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-8)" }}>
              {[
                { step: "1", title: "Search in Plain Language", desc: "Type what you need — in English, Hindi, or Hinglish. Our AI understands.", icon: "🔍" },
                { step: "2", title: "Compare Side by Side", desc: "Compare hospitals by cost, distance, ICU beds, accreditation, and ratings.", icon: "📊" },
                { step: "3", title: "Make an Informed Decision", desc: "See transparent cost data and data provenance for every record.", icon: "✅" },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    textAlign: "center",
                    padding: "var(--space-8)",
                    background: "white",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>{item.icon}</div>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "var(--color-primary-600)",
                      color: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      margin: "0 auto var(--space-4)",
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-3)" }}>{item.title}</h3>
                  <p style={{ color: "var(--color-gray-500)", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
