"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// Hospital card component
function HospitalCard({ hospital, onCompare, isInCompare }: {
  hospital: any;
  onCompare: (id: string) => void;
  isInCompare: boolean;
}) {
  const typeColors: Record<string, string> = {
    government: "var(--color-primary-600)",
    private: "var(--color-accent-500)",
    trust: "#7C3AED",
    semi_government: "#0284C7",
  };

  const sourceLabel: Record<string, { text: string; cls: string }> = {
    SIMULATED: { text: "⚪ Demo Data", cls: "provenance-simulated" },
    PMJAY_HBP: { text: "🟢 PMJAY", cls: "provenance-pmjay" },
    MANUAL_VERIFIED: { text: "🟢 Verified", cls: "provenance-verified" },
    HFR_REGISTRY: { text: "🟡 HFR", cls: "provenance-hfr" },
    USER_CONTRIBUTED: { text: "🔵 Community", cls: "provenance-community" },
  };

  const src = sourceLabel[hospital.data_source_label] || sourceLabel.SIMULATED;

  return (
    <div
      className="hospital-card"
      data-type={hospital.type}
      style={{ padding: "var(--space-5)" }}
    >
      {/* Top row: name + rating */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
        <div>
          <a
            href={`/hospitals/${hospital.slug}`}
            style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-gray-900)", textDecoration: "none" }}
          >
            {hospital.name}
          </a>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)", marginTop: "2px" }}>
            📍 {hospital.city}, {hospital.state}
            {hospital.distance_km && <span> · {hospital.distance_km} km away</span>}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#FEF3C7", padding: "4px 10px", borderRadius: "20px" }}>
            <span style={{ color: "#F59E0B" }}>⭐</span>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#92400E" }}>{hospital.overall_rating}</span>
            <span style={{ fontSize: "11px", color: "#B45309" }}>({hospital.total_reviews})</span>
          </div>
          {hospital.ranking_score && (
            <div className="ranking-score">
              🎯 {hospital.ranking_score.toFixed(0)}/100
            </div>
          )}
        </div>
      </div>

      {/* Badges row */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "var(--space-3)" }}>
        <span className={`badge badge-${hospital.type === "government" ? "government" : "nabh"}`} style={{ textTransform: "capitalize" }}>
          {hospital.type}
        </span>
        {hospital.accreditation && <span className="badge badge-nabh">{hospital.accreditation}</span>}
        {hospital.is_pmjay_empanelled && <span className="badge badge-pmjay">PMJAY ✓</span>}
        {hospital.is_trauma_center && <span className="badge badge-emergency">🚨 Trauma Center</span>}
        <span className={`provenance-badge ${src.cls}`}>{src.text}</span>
      </div>

      {/* ICU availability */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-4)",
          padding: "var(--space-3)",
          background: "var(--color-gray-50)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-3)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: hospital.beds_icu_available > 0 ? "var(--color-success)" : "var(--color-emergency)" }}>
            {hospital.beds_icu_available}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-gray-500)" }}>ICU Available</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--color-gray-700)" }}>{hospital.beds_icu}</div>
          <div style={{ fontSize: "11px", color: "var(--color-gray-500)" }}>ICU Total</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--color-gray-700)" }}>{hospital.beds_total}</div>
          <div style={{ fontSize: "11px", color: "var(--color-gray-500)" }}>Total Beds</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <a
          href={`/hospitals/${hospital.slug}`}
          className="btn btn-primary"
          id={`view-hospital-${hospital.id}`}
          style={{ flex: 1, textAlign: "center", padding: "10px", fontSize: "var(--text-sm)" }}
        >
          View Details
        </a>
        <button
          onClick={() => onCompare(hospital.id)}
          className={`btn ${isInCompare ? "btn-accent" : "btn-outline"}`}
          id={`compare-hospital-${hospital.id}`}
          style={{ padding: "10px 14px", fontSize: "var(--text-sm)" }}
        >
          {isInCompare ? "✓ Added" : "Compare"}
        </button>
      </div>
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    type: "",
    pmjay_only: false,
    nabh_only: false,
    trauma_only: false,
    min_rating: 0,
    sort_by: "relevance",
  });

  useEffect(() => {
    if (initialQuery || initialCategory) {
      doSearch(initialQuery || initialCategory);
    }
  }, []);

  const doSearch = async (q: string) => {
    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // Try NL search
      const res = await fetch(`${API_URL}/api/search/nl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          latitude: 30.7333,
          longitude: 76.7794,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setHospitals(json.data || []);
        setMeta(json.meta || {});
      } else {
        // Use fallback mock data
        setHospitals(getMockHospitals());
        setMeta({ total: 5, ai_provider: "demo", extracted_filters: { location_text: "Chandigarh" } });
      }
    } catch {
      // Offline / dev mode — show mock data
      setHospitals(getMockHospitals());
      setMeta({ total: 5, ai_provider: "demo", extracted_filters: { location_text: "Chandigarh" } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    doSearch(query);
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: "var(--color-gray-50)" }}>
        {/* Search Header */}
        <div style={{ background: "var(--color-primary-900)", padding: "var(--space-8) 0" }}>
          <div className="container">
            <form onSubmit={handleSearch}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "white",
                  borderRadius: "var(--radius-2xl)",
                  padding: "8px 8px 8px 20px",
                  boxShadow: "var(--shadow-xl)",
                  gap: "12px",
                }}
              >
                <span>🔍</span>
                <input
                  id="search-page-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hospitals, conditions, cities..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: "var(--text-base)", fontFamily: "var(--font-body)" }}
                />
                <button
                  id="search-page-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ borderRadius: "var(--radius-xl)", padding: "10px 20px" }}
                >
                  Search
                </button>
              </div>
            </form>

            {/* AI filter chips */}
            {meta?.extracted_filters && (
              <div style={{ display: "flex", gap: "8px", marginTop: "var(--space-4)", flexWrap: "wrap" }}>
                {meta.extracted_filters.location_text && (
                  <span style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "var(--text-sm)" }}>
                    📍 {meta.extracted_filters.location_text}
                  </span>
                )}
                {meta.extracted_filters.max_budget && (
                  <span style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "var(--text-sm)" }}>
                    💰 Under ₹{(meta.extracted_filters.max_budget / 100000).toFixed(1)}L
                  </span>
                )}
                {meta.extracted_filters.procedure_categories?.map((cat: string) => (
                  <span key={cat} style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "var(--text-sm)" }}>
                    🏥 {cat}
                  </span>
                ))}
                <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", padding: "4px 12px", borderRadius: "20px", fontSize: "11px" }}>
                  {meta.ai_provider === "gemini" ? "🤖 AI-powered" : "📋 Basic search"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "var(--space-6)" }}>
            {/* Filter Sidebar */}
            <aside>
              <div
                style={{
                  background: "white",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-5)",
                  boxShadow: "var(--shadow-card)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
                  Filters
                </h3>

                {/* Hospital Type */}
                <div style={{ marginBottom: "var(--space-4)" }}>
                  <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-gray-700)", display: "block", marginBottom: "8px" }}>
                    Hospital Type
                  </label>
                  {["government", "private", "trust"].map((type) => (
                    <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", cursor: "pointer", fontSize: "var(--text-sm)" }}>
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={filters.type === type}
                        onChange={() => setFilters((f) => ({ ...f, type }))}
                      />
                      <span style={{ textTransform: "capitalize" }}>{type}</span>
                    </label>
                  ))}
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", cursor: "pointer", fontSize: "var(--text-sm)" }}>
                    <input type="radio" name="type" value="" checked={filters.type === ""} onChange={() => setFilters((f) => ({ ...f, type: "" }))} />
                    <span>All Types</span>
                  </label>
                </div>

                {/* Toggle Filters */}
                {[
                  { key: "pmjay_only", label: "PMJAY Empanelled" },
                  { key: "nabh_only", label: "NABH Accredited" },
                  { key: "trauma_only", label: "Trauma Center" },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", cursor: "pointer", fontSize: "var(--text-sm)" }}>
                    <input
                      type="checkbox"
                      checked={(filters as any)[key]}
                      onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.checked }))}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </aside>

            {/* Hospital List */}
            <div>
              {/* Results header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-600)" }}>
                  {isLoading ? "Searching..." : `${hospitals.length} hospitals found`}
                </p>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters((f) => ({ ...f, sort_by: e.target.value }))}
                  style={{ fontSize: "var(--text-sm)", padding: "6px 12px", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-border)", fontFamily: "var(--font-body)" }}
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="distance">Nearest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="cost">Lowest Cost</option>
                </select>
              </div>

              {/* Loading skeletons */}
              {isLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "200px", borderRadius: "var(--radius-xl)" }} />
                  ))}
                </div>
              )}

              {/* Hospital cards */}
              {!isLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  {hospitals.map((hospital) => (
                    <HospitalCard
                      key={hospital.id || hospital.slug}
                      hospital={hospital}
                      onCompare={toggleCompare}
                      isInCompare={compareList.includes(hospital.id)}
                    />
                  ))}
                  {hospitals.length === 0 && (
                    <div style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--color-gray-500)" }}>
                      <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>🏥</div>
                      <h3>No hospitals found</h3>
                      <p style={{ marginTop: "var(--space-2)" }}>Try a different search term or expand the radius</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compare bar */}
        {compareList.length >= 2 && (
          <div
            style={{
              position: "fixed",
              bottom: "var(--space-6)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--color-primary-900)",
              color: "white",
              padding: "var(--space-4) var(--space-6)",
              borderRadius: "var(--radius-2xl)",
              boxShadow: "var(--shadow-xl)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              zIndex: "var(--z-overlay)",
            }}
          >
            <span style={{ fontSize: "var(--text-sm)" }}>
              {compareList.length} hospitals selected
            </span>
            <button
              onClick={() => router.push(`/compare?ids=${compareList.join(",")}`)}
              className="btn btn-accent"
              id="go-compare-btn"
              style={{ padding: "8px 20px", fontSize: "var(--text-sm)" }}
            >
              Compare Now →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Mock data for offline/dev mode
function getMockHospitals() {
  return [
    {
      id: "mock-1",
      name: "PGIMER Chandigarh",
      slug: "pgimer-chandigarh",
      type: "government",
      city: "Chandigarh",
      state: "Chandigarh",
      latitude: 30.765,
      longitude: 76.781,
      distance_km: 2.4,
      beds_total: 1844,
      beds_icu: 200,
      beds_icu_available: 12,
      overall_rating: 4.8,
      total_reviews: 1250,
      ranking_score: 87,
      is_trauma_center: true,
      is_pmjay_empanelled: true,
      accreditation: "NABH",
      verified: true,
      data_source_label: "SIMULATED",
    },
    {
      id: "mock-2",
      name: "Fortis Hospital Mohali",
      slug: "fortis-hospital-mohali",
      type: "private",
      city: "Mohali",
      state: "Punjab",
      distance_km: 8.1,
      beds_total: 262,
      beds_icu: 45,
      beds_icu_available: 6,
      overall_rating: 4.6,
      total_reviews: 870,
      ranking_score: 74,
      is_trauma_center: true,
      is_pmjay_empanelled: false,
      accreditation: "NABH",
      verified: true,
      data_source_label: "SIMULATED",
    },
    {
      id: "mock-3",
      name: "CMC Ludhiana",
      slug: "christian-medical-college-ludhiana",
      type: "trust",
      city: "Ludhiana",
      state: "Punjab",
      distance_km: 91,
      beds_total: 850,
      beds_icu: 80,
      beds_icu_available: 10,
      overall_rating: 4.9,
      total_reviews: 2100,
      ranking_score: 82,
      is_trauma_center: true,
      is_pmjay_empanelled: true,
      accreditation: "NABH",
      verified: true,
      data_source_label: "SIMULATED",
    },
  ];
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}
