"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface HospitalComparisonData {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  state: string;
  overall_rating: number;
  total_reviews: number;
  accreditation: string;
  is_pmjay_empanelled: boolean;
  is_trauma_center: boolean;
  trauma_level: string;
  beds_total: number;
  beds_icu: number;
  beds_icu_available: number;
  beds_ventilator: number;
  data_source_label: string;
  costs: {
    angioplasty: number;
    knee_replacement: number;
    cataract: number;
    dialysis: number;
  };
  diagnostics: {
    mri_3t: boolean;
    ct_scan: boolean;
    cath_lab: boolean;
    blood_bank: boolean;
  };
}

const ALL_MOCK_HOSPITALS: HospitalComparisonData[] = [
  {
    id: "hosp-pgi-001",
    name: "PGIMER Chandigarh",
    slug: "pgimer-chandigarh",
    type: "Government",
    city: "Chandigarh",
    state: "Chandigarh",
    overall_rating: 4.8,
    total_reviews: 482,
    accreditation: "NABH & NABL",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 1948,
    beds_icu: 180,
    beds_icu_available: 14,
    beds_ventilator: 110,
    data_source_label: "SIMULATED",
    costs: {
      angioplasty: 95000,
      knee_replacement: 115000,
      cataract: 12000,
      dialysis: 1200,
    },
    diagnostics: {
      mri_3t: true,
      ct_scan: true,
      cath_lab: true,
      blood_bank: true,
    },
  },
  {
    id: "hosp-fortis-002",
    name: "Fortis Hospital Mohali",
    slug: "fortis-hospital-mohali",
    type: "Private",
    city: "Mohali",
    state: "Punjab",
    overall_rating: 4.5,
    total_reviews: 236,
    accreditation: "JCI & NABH",
    is_pmjay_empanelled: false,
    is_trauma_center: true,
    trauma_level: "Level 2",
    beds_total: 355,
    beds_icu: 68,
    beds_icu_available: 9,
    beds_ventilator: 42,
    data_source_label: "SIMULATED",
    costs: {
      angioplasty: 195000,
      knee_replacement: 210000,
      cataract: 42000,
      dialysis: 2800,
    },
    diagnostics: {
      mri_3t: true,
      ct_scan: true,
      cath_lab: true,
      blood_bank: true,
    },
  },
  {
    id: "hosp-cmc-003",
    name: "CMC Ludhiana",
    slug: "christian-medical-college-ludhiana",
    type: "Trust",
    city: "Ludhiana",
    state: "Punjab",
    overall_rating: 4.7,
    total_reviews: 194,
    accreditation: "NABH",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Level 1",
    beds_total: 775,
    beds_icu: 95,
    beds_icu_available: 12,
    beds_ventilator: 55,
    data_source_label: "SIMULATED",
    costs: {
      angioplasty: 125000,
      knee_replacement: 145000,
      cataract: 24000,
      dialysis: 1600,
    },
    diagnostics: {
      mri_3t: true,
      ct_scan: true,
      cath_lab: true,
      blood_bank: true,
    },
  },
  {
    id: "hosp-aiims-004",
    name: "AIIMS New Delhi",
    slug: "aiims-new-delhi",
    type: "Government",
    city: "New Delhi",
    state: "Delhi",
    overall_rating: 4.9,
    total_reviews: 840,
    accreditation: "NABH, NABL & JCI",
    is_pmjay_empanelled: true,
    is_trauma_center: true,
    trauma_level: "Apex Level 1",
    beds_total: 2478,
    beds_icu: 260,
    beds_icu_available: 18,
    beds_ventilator: 180,
    data_source_label: "SIMULATED",
    costs: {
      angioplasty: 80000,
      knee_replacement: 98000,
      cataract: 9500,
      dialysis: 900,
    },
    diagnostics: {
      mri_3t: true,
      ct_scan: true,
      cath_lab: true,
      blood_bank: true,
    },
  },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedHospitals, setSelectedHospitals] = useState<HospitalComparisonData[]>([]);
  const [availableHospitals, setAvailableHospitals] = useState<HospitalComparisonData[]>(ALL_MOCK_HOSPITALS);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);

  useEffect(() => {
    // 1. Check URL query ids
    const urlIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];
    
    // 2. Check localStorage
    let storedIds: string[] = [];
    try {
      const saved = localStorage.getItem("medroute_compare_ids");
      if (saved) storedIds = JSON.parse(saved);
    } catch {}

    const combinedIds = Array.from(new Set([...urlIds, ...storedIds]));

    if (combinedIds.length > 0) {
      const matched = ALL_MOCK_HOSPITALS.filter((h) =>
        combinedIds.some((id) => id === h.id || id === h.slug)
      );
      if (matched.length > 0) {
        setSelectedHospitals(matched);
        return;
      }
    }

    // Default comparison if empty
    setSelectedHospitals([ALL_MOCK_HOSPITALS[0], ALL_MOCK_HOSPITALS[1]]);
  }, [searchParams]);

  const removeHospital = (id: string) => {
    const updated = selectedHospitals.filter((h) => h.id !== id);
    setSelectedHospitals(updated);
    try {
      localStorage.setItem("medroute_compare_ids", JSON.stringify(updated.map((h) => h.id)));
    } catch {}
  };

  const addHospital = (hospital: HospitalComparisonData) => {
    if (selectedHospitals.length >= 4) {
      alert("Maximum 4 hospitals can be compared simultaneously.");
      return;
    }
    if (selectedHospitals.some((h) => h.id === hospital.id)) return;

    const updated = [...selectedHospitals, hospital];
    setSelectedHospitals(updated);
    setAddDropdownOpen(false);
    try {
      localStorage.setItem("medroute_compare_ids", JSON.stringify(updated.map((h) => h.id)));
    } catch {}
  };

  // Best-in-row helpers
  const maxRating = Math.max(...selectedHospitals.map((h) => h.overall_rating), 0);
  const maxBeds = Math.max(...selectedHospitals.map((h) => h.beds_total), 0);
  const maxIcu = Math.max(...selectedHospitals.map((h) => h.beds_icu_available), 0);
  const minAngio = Math.min(...selectedHospitals.map((h) => h.costs.angioplasty), Infinity);
  const minKnee = Math.min(...selectedHospitals.map((h) => h.costs.knee_replacement), Infinity);
  const minCataract = Math.min(...selectedHospitals.map((h) => h.costs.cataract), Infinity);

  return (
    <>
      <Navbar />

      <main style={{ background: "var(--color-gray-50)", minHeight: "100vh", padding: "var(--space-8) 0 var(--space-16)" }}>
        <div className="container">
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-primary-600)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Side-by-Side Evaluation
              </div>
              <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 900, color: "var(--color-gray-900)", marginTop: "4px" }}>
                Compare Hospitals & Indicative Costs
              </h1>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-600)", marginTop: "4px" }}>
                Evaluate care capacity, PMJAY empanelment, live ICU telemetry, and transparent procedure costs.
              </p>
            </div>

            {/* Add Hospital Button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                className="btn btn-primary"
                style={{ fontSize: "var(--text-sm)" }}
                disabled={selectedHospitals.length >= 4}
              >
                + Add Hospital ({selectedHospitals.length}/4)
              </button>

              {addDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: "8px",
                    background: "var(--color-white)",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--shadow-xl)",
                    border: "1px solid var(--surface-border)",
                    width: "280px",
                    zIndex: "var(--z-dropdown)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--surface-border)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-500)" }}>
                    Select Hospital to Compare
                  </div>
                  {availableHospitals
                    .filter((h) => !selectedHospitals.some((s) => s.id === h.id))
                    .map((h) => (
                      <button
                        key={h.id}
                        onClick={() => addHospital(h)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 14px",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          borderBottom: "1px solid var(--surface-border)",
                          transition: "background 150ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-50)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-gray-900)" }}>
                          {h.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--color-gray-500)" }}>
                          📍 {h.city} • ⭐ {h.overall_rating} • {h.type}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {selectedHospitals.length === 0 ? (
            <div style={{ background: "var(--color-white)", padding: "var(--space-12)", borderRadius: "var(--radius-2xl)", textAlign: "center", border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: "48px" }}>⚖️</div>
              <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 800, marginTop: "var(--space-3)" }}>No Hospitals in Compare Tray</h3>
              <p style={{ color: "var(--color-gray-600)", marginTop: "var(--space-2)" }}>
                Add hospitals from the search page or click the button above to start your side-by-side comparison.
              </p>
              <a href="/search" className="btn btn-primary" style={{ marginTop: "var(--space-4)", display: "inline-block" }}>
                Browse Hospitals
              </a>
            </div>
          ) : (
            /* Comparison Table */
            <div style={{ background: "var(--color-white)", borderRadius: "var(--radius-2xl)", border: "1px solid var(--surface-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  {/* Top Hospital Headers */}
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--surface-border)" }}>
                      <th style={{ padding: "var(--space-5)", width: "240px", background: "var(--color-gray-50)", verticalAlign: "top" }}>
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-400)", textTransform: "uppercase" }}>
                          Attributes
                        </div>
                      </th>
                      {selectedHospitals.map((h) => (
                        <th key={h.id} style={{ padding: "var(--space-5)", minWidth: "260px", verticalAlign: "top", borderLeft: "1px solid var(--surface-border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
                            <div>
                              <a
                                href={`/hospitals/${h.slug}`}
                                style={{ fontSize: "var(--text-base)", fontWeight: 800, color: "var(--color-gray-900)", textDecoration: "none" }}
                              >
                                {h.name}
                              </a>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", marginTop: "2px" }}>
                                📍 {h.city}, {h.state}
                              </div>
                            </div>
                            <button
                              onClick={() => removeHospital(h.id)}
                              style={{ border: "none", background: "none", color: "var(--color-gray-400)", cursor: "pointer", fontSize: "16px" }}
                              title="Remove hospital"
                            >
                              ✕
                            </button>
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "var(--space-3)" }}>
                            <span className={`badge badge-${h.type === "Government" ? "government" : "nabh"}`} style={{ fontSize: "10px" }}>
                              {h.type}
                            </span>
                            <span className="provenance-badge provenance-simulated" style={{ fontSize: "10px" }}>
                              ⚪ Benchmark Data
                            </span>
                          </div>
                          <div style={{ marginTop: "var(--space-4)" }}>
                            <a
                              href={`/hospitals/${h.slug}`}
                              className="btn btn-outline"
                              style={{ width: "100%", textAlign: "center", fontSize: "var(--text-xs)", padding: "6px" }}
                            >
                              View Full Profile
                            </a>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* SECTION: RATING & TRUST */}
                    <tr style={{ background: "var(--color-gray-50)", borderBottom: "1px solid var(--surface-border)" }}>
                      <td colSpan={selectedHospitals.length + 1} style={{ padding: "var(--space-2) var(--space-5)", fontSize: "var(--text-xs)", fontWeight: 800, color: "var(--color-primary-700)", textTransform: "uppercase" }}>
                        ⭐ Quality & Trust Standards
                      </td>
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Patient Rating
                      </td>
                      {selectedHospitals.map((h) => {
                        const isBest = h.overall_rating === maxRating;
                        return (
                          <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)", background: isBest ? "var(--color-primary-50)" : "transparent" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontWeight: 800, fontSize: "var(--text-base)", color: "#92400E" }}>⭐ {h.overall_rating}</span>
                              <span style={{ fontSize: "11px", color: "var(--color-gray-500)" }}>({h.total_reviews})</span>
                              {isBest && <span title="Highest rated">🏆</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Accreditations
                      </td>
                      {selectedHospitals.map((h) => (
                        <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)" }}>
                          <span className="badge badge-nabh" style={{ fontWeight: 700 }}>
                            {h.accreditation}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        PMJAY Empanelled
                      </td>
                      {selectedHospitals.map((h) => (
                        <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)" }}>
                          {h.is_pmjay_empanelled ? (
                            <span className="badge badge-pmjay">Covered ✓</span>
                          ) : (
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-400)" }}>Not Empanelled</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Trauma Care Level
                      </td>
                      {selectedHospitals.map((h) => (
                        <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)" }}>
                          {h.is_trauma_center ? (
                            <span className="badge badge-emergency">🚨 {h.trauma_level}</span>
                          ) : (
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-400)" }}>Basic Emergency</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* SECTION: CAPACITY & TELEMETRY */}
                    <tr style={{ background: "var(--color-gray-50)", borderBottom: "1px solid var(--surface-border)" }}>
                      <td colSpan={selectedHospitals.length + 1} style={{ padding: "var(--space-2) var(--space-5)", fontSize: "var(--text-xs)", fontWeight: 800, color: "var(--color-primary-700)", textTransform: "uppercase" }}>
                        🛏️ Live Capacity & Critical Care
                      </td>
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Total Bed Capacity
                      </td>
                      {selectedHospitals.map((h) => {
                        const isBest = h.beds_total === maxBeds;
                        return (
                          <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)", background: isBest ? "var(--color-primary-50)" : "transparent" }}>
                            <span style={{ fontWeight: 800 }}>{h.beds_total.toLocaleString()}</span>
                            {isBest && <span style={{ marginLeft: "4px" }}>🏆</span>}
                          </td>
                        );
                      })}
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        ICU Beds Available Now
                      </td>
                      {selectedHospitals.map((h) => {
                        const isBest = h.beds_icu_available === maxIcu;
                        return (
                          <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)", background: isBest ? "var(--color-primary-50)" : "transparent" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "var(--text-lg)", fontWeight: 900, color: h.beds_icu_available > 0 ? "var(--color-success)" : "var(--color-emergency)" }}>
                                {h.beds_icu_available}
                              </span>
                              <span style={{ fontSize: "11px", color: "var(--color-gray-500)" }}>/ {h.beds_icu} total</span>
                              {isBest && <span>🏆</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Ventilators
                      </td>
                      {selectedHospitals.map((h) => (
                        <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)" }}>
                          <span style={{ fontWeight: 700 }}>{h.beds_ventilator}</span>
                        </td>
                      ))}
                    </tr>

                    {/* SECTION: ESTIMATED PROCEDURE PRICING */}
                    <tr style={{ background: "var(--color-gray-50)", borderBottom: "1px solid var(--surface-border)" }}>
                      <td colSpan={selectedHospitals.length + 1} style={{ padding: "var(--space-2) var(--space-5)", fontSize: "var(--text-xs)", fontWeight: 800, color: "var(--color-primary-700)", textTransform: "uppercase" }}>
                        💰 Benchmark Procedure Costs (Estimated)
                      </td>
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Coronary Angioplasty
                      </td>
                      {selectedHospitals.map((h) => {
                        const isBest = h.costs.angioplasty === minAngio;
                        return (
                          <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)", background: isBest ? "var(--color-primary-50)" : "transparent" }}>
                            <span style={{ fontWeight: 800, color: "var(--color-gray-900)" }}>
                              ₹{h.costs.angioplasty.toLocaleString("en-IN")}
                            </span>
                            {isBest && <span style={{ marginLeft: "4px" }} title="Most affordable">🏆</span>}
                          </td>
                        );
                      })}
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Total Knee Replacement
                      </td>
                      {selectedHospitals.map((h) => {
                        const isBest = h.costs.knee_replacement === minKnee;
                        return (
                          <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)", background: isBest ? "var(--color-primary-50)" : "transparent" }}>
                            <span style={{ fontWeight: 800, color: "var(--color-gray-900)" }}>
                              ₹{h.costs.knee_replacement.toLocaleString("en-IN")}
                            </span>
                            {isBest && <span style={{ marginLeft: "4px" }} title="Most affordable">🏆</span>}
                          </td>
                        );
                      })}
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Cataract Surgery
                      </td>
                      {selectedHospitals.map((h) => {
                        const isBest = h.costs.cataract === minCataract;
                        return (
                          <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)", background: isBest ? "var(--color-primary-50)" : "transparent" }}>
                            <span style={{ fontWeight: 800, color: "var(--color-gray-900)" }}>
                              ₹{h.costs.cataract.toLocaleString("en-IN")}
                            </span>
                            {isBest && <span style={{ marginLeft: "4px" }} title="Most affordable">🏆</span>}
                          </td>
                        );
                      })}
                    </tr>

                    {/* SECTION: DIAGNOSTICS */}
                    <tr style={{ background: "var(--color-gray-50)", borderBottom: "1px solid var(--surface-border)" }}>
                      <td colSpan={selectedHospitals.length + 1} style={{ padding: "var(--space-2) var(--space-5)", fontSize: "var(--text-xs)", fontWeight: 800, color: "var(--color-primary-700)", textTransform: "uppercase" }}>
                        🔬 Diagnostics & Infrastructure
                      </td>
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Cardiac Cath Lab
                      </td>
                      {selectedHospitals.map((h) => (
                        <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)" }}>
                          {h.diagnostics.cath_lab ? "✅ Active (24x7)" : "❌ Not Available"}
                        </td>
                      ))}
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        3.0T MRI & CT Scan
                      </td>
                      {selectedHospitals.map((h) => (
                        <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)" }}>
                          {h.diagnostics.mri_3t && h.diagnostics.ct_scan ? "✅ In-House" : "🟡 External tie-up"}
                        </td>
                      ))}
                    </tr>

                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "var(--space-4) var(--space-5)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                        Blood Bank with Components
                      </td>
                      {selectedHospitals.map((h) => (
                        <td key={h.id} style={{ padding: "var(--space-4) var(--space-5)", borderLeft: "1px solid var(--surface-border)" }}>
                          {h.diagnostics.blood_bank ? "✅ Licensed 24x7" : "❌ Limited"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
