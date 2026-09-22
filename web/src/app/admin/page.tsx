"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface AdminHospitalItem {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
  data_source_label: string;
  beds_icu_available: number;
  beds_icu: number;
  beds_ventilator: number;
  is_verified: boolean;
}

const INITIAL_ADMIN_HOSPITALS: AdminHospitalItem[] = [
  {
    id: "hosp-1",
    name: "Postgraduate Institute of Medical Education and Research (PGIMER)",
    city: "Chandigarh",
    state: "Chandigarh",
    type: "Government",
    data_source_label: "SIMULATED",
    beds_icu_available: 14,
    beds_icu: 180,
    beds_ventilator: 110,
    is_verified: false,
  },
  {
    id: "hosp-2",
    name: "Fortis Hospital Mohali",
    city: "Mohali",
    state: "Punjab",
    type: "Private",
    data_source_label: "SIMULATED",
    beds_icu_available: 9,
    beds_icu: 68,
    beds_ventilator: 42,
    is_verified: false,
  },
  {
    id: "hosp-3",
    name: "Christian Medical College (CMC) Ludhiana",
    city: "Ludhiana",
    state: "Punjab",
    type: "Trust",
    data_source_label: "SIMULATED",
    beds_icu_available: 12,
    beds_icu: 95,
    beds_ventilator: 55,
    is_verified: false,
  },
  {
    id: "hosp-4",
    name: "Government Medical College & Hospital (GMCH 32)",
    city: "Chandigarh",
    state: "Chandigarh",
    type: "Government",
    data_source_label: "USER_CONTRIBUTED",
    beds_icu_available: 6,
    beds_icu: 54,
    beds_ventilator: 30,
    is_verified: false,
  },
  {
    id: "hosp-5",
    name: "Max Super Speciality Hospital Mohali",
    city: "Mohali",
    state: "Punjab",
    type: "Private",
    data_source_label: "MANUAL_VERIFIED",
    beds_icu_available: 8,
    beds_icu: 50,
    beds_ventilator: 28,
    is_verified: true,
  },
];

export default function AdminDashboardPage() {
  const [hospitals, setHospitals] = useState<AdminHospitalItem[]>(INITIAL_ADMIN_HOSPITALS);
  const [activeTab, setActiveTab] = useState<"hospitals" | "telemetry" | "reviews">("hospitals");
  const [statusMessage, setStatusMessage] = useState("");

  const verifyHospital = (id: string) => {
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, data_source_label: "MANUAL_VERIFIED", is_verified: true }
          : h
      )
    );
    setStatusMessage("Hospital verified and promoted to MANUAL_VERIFIED status.");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const updateIcuBeds = (id: string, newCount: number) => {
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, beds_icu_available: Math.max(0, newCount) } : h
      )
    );
    setStatusMessage("Live telemetry updated.");
    setTimeout(() => setStatusMessage(""), 2000);
  };

  const totalCount = hospitals.length;
  const verifiedCount = hospitals.filter((h) => h.data_source_label === "MANUAL_VERIFIED").length;
  const simulatedCount = hospitals.filter((h) => h.data_source_label === "SIMULATED").length;
  const pendingCount = hospitals.filter((h) => h.data_source_label === "USER_CONTRIBUTED").length;

  return (
    <>
      <Navbar />

      <main style={{ background: "var(--color-gray-50)", minHeight: "100vh", padding: "var(--space-8) 0 var(--space-16)" }}>
        <div className="container">
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-primary-600)", fontWeight: 700, textTransform: "uppercase" }}>
                🛡️ Operational Command Center
              </div>
              <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 900, color: "var(--color-gray-900)", marginTop: "4px" }}>
                Hospital Verification & Telemetry Admin
              </h1>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-600)", marginTop: "4px" }}>
                Manage data provenance labels, verify community additions, and update live ICU bed telemetry.
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <span className="badge badge-government" style={{ padding: "8px 16px", fontSize: "var(--text-xs)" }}>
                Logged in as Admin (Superuser)
              </span>
            </div>
          </div>

          {statusMessage && (
            <div
              style={{
                background: "var(--color-success-bg)",
                color: "var(--color-success)",
                padding: "12px 16px",
                borderRadius: "var(--radius-lg)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                marginBottom: "var(--space-6)",
              }}
            >
              ✅ {statusMessage}
            </div>
          )}

          {/* Metric Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-4)",
              marginBottom: "var(--space-8)",
            }}
          >
            <div style={{ background: "var(--color-white)", padding: "var(--space-5)", borderRadius: "var(--radius-xl)", border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", fontWeight: 700 }}>TOTAL HOSPITALS</div>
              <div style={{ fontSize: "var(--text-3xl)", fontWeight: 900, color: "var(--color-gray-900)", marginTop: "4px" }}>{totalCount}</div>
              <div style={{ fontSize: "11px", color: "var(--color-gray-400)", marginTop: "4px" }}>Across North India Node</div>
            </div>

            <div style={{ background: "var(--color-white)", padding: "var(--space-5)", borderRadius: "var(--radius-xl)", border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-success)", fontWeight: 700 }}>MANUALLY VERIFIED</div>
              <div style={{ fontSize: "var(--text-3xl)", fontWeight: 900, color: "var(--color-success)", marginTop: "4px" }}>{verifiedCount}</div>
              <div style={{ fontSize: "11px", color: "var(--color-gray-400)", marginTop: "4px" }}>Green Provenance Badge</div>
            </div>

            <div style={{ background: "var(--color-white)", padding: "var(--space-5)", borderRadius: "var(--radius-xl)", border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", fontWeight: 700 }}>SIMULATED BENCHMARKS</div>
              <div style={{ fontSize: "var(--text-3xl)", fontWeight: 900, color: "var(--color-gray-700)", marginTop: "4px" }}>{simulatedCount}</div>
              <div style={{ fontSize: "11px", color: "var(--color-gray-400)", marginTop: "4px" }}>Ready for Field Audit</div>
            </div>

            <div style={{ background: "var(--color-white)", padding: "var(--space-5)", borderRadius: "var(--radius-xl)", border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-warning)", fontWeight: 700 }}>PENDING SUBMISSIONS</div>
              <div style={{ fontSize: "var(--text-3xl)", fontWeight: 900, color: "var(--color-warning)", marginTop: "4px" }}>{pendingCount}</div>
              <div style={{ fontSize: "11px", color: "var(--color-gray-400)", marginTop: "4px" }}>Requires Admin Action</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: "flex", gap: "var(--space-2)", borderBottom: "2px solid var(--surface-border)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-6)" }}>
            <button
              onClick={() => setActiveTab("hospitals")}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-lg)",
                border: "none",
                background: activeTab === "hospitals" ? "var(--color-primary-600)" : "transparent",
                color: activeTab === "hospitals" ? "var(--color-white)" : "var(--color-gray-600)",
                fontWeight: 700,
                fontSize: "var(--text-sm)",
                cursor: "pointer",
              }}
            >
              Provenance Verification Queue
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-lg)",
                border: "none",
                background: activeTab === "telemetry" ? "var(--color-primary-600)" : "transparent",
                color: activeTab === "telemetry" ? "var(--color-white)" : "var(--color-gray-600)",
                fontWeight: 700,
                fontSize: "var(--text-sm)",
                cursor: "pointer",
              }}
            >
              Live ICU & Bed Telemetry
            </button>
          </div>

          {/* TAB 1: VERIFICATION QUEUE */}
          {activeTab === "hospitals" && (
            <div style={{ background: "var(--color-white)", borderRadius: "var(--radius-2xl)", border: "1px solid var(--surface-border)", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "var(--text-sm)" }}>
                  <thead>
                    <tr style={{ background: "var(--color-gray-50)", borderBottom: "1px solid var(--surface-border)", color: "var(--color-gray-600)", fontSize: "var(--text-xs)", textTransform: "uppercase" }}>
                      <th style={{ padding: "var(--space-4)" }}>Hospital Entity</th>
                      <th style={{ padding: "var(--space-4)" }}>Location</th>
                      <th style={{ padding: "var(--space-4)" }}>Type</th>
                      <th style={{ padding: "var(--space-4)" }}>Current Provenance</th>
                      <th style={{ padding: "var(--space-4)", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitals.map((h) => (
                      <tr key={h.id} style={{ borderBottom: "1px solid var(--surface-border)" }}>
                        <td style={{ padding: "var(--space-4)", fontWeight: 700, color: "var(--color-gray-900)" }}>
                          {h.name}
                        </td>
                        <td style={{ padding: "var(--space-4)", color: "var(--color-gray-600)" }}>
                          {h.city}, {h.state}
                        </td>
                        <td style={{ padding: "var(--space-4)" }}>
                          <span className={`badge badge-${h.type === "Government" ? "government" : "nabh"}`} style={{ fontSize: "11px" }}>
                            {h.type}
                          </span>
                        </td>
                        <td style={{ padding: "var(--space-4)" }}>
                          <span
                            className="provenance-badge"
                            style={{
                              background: h.data_source_label === "MANUAL_VERIFIED" ? "var(--color-success-bg)" : h.data_source_label === "USER_CONTRIBUTED" ? "var(--color-warning-bg)" : "var(--color-gray-100)",
                              color: h.data_source_label === "MANUAL_VERIFIED" ? "var(--color-success)" : h.data_source_label === "USER_CONTRIBUTED" ? "var(--color-warning)" : "var(--color-gray-600)",
                              fontSize: "11px",
                            }}
                          >
                            {h.data_source_label}
                          </span>
                        </td>
                        <td style={{ padding: "var(--space-4)", textAlign: "right" }}>
                          {h.data_source_label !== "MANUAL_VERIFIED" ? (
                            <button
                              onClick={() => verifyHospital(h.id)}
                              className="btn btn-primary"
                              style={{ fontSize: "11px", padding: "6px 14px" }}
                            >
                              Verify & Promote ✓
                            </button>
                          ) : (
                            <span style={{ fontSize: "11px", color: "var(--color-success)", fontWeight: 700 }}>
                              ✓ Verified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TELEMETRY UPDATER */}
          {activeTab === "telemetry" && (
            <div style={{ background: "var(--color-white)", borderRadius: "var(--radius-2xl)", border: "1px solid var(--surface-border)", overflow: "hidden" }}>
              <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--surface-border)", background: "var(--color-gray-50)", fontSize: "var(--text-xs)", color: "var(--color-gray-600)" }}>
                💡 Emergency responders and patients rely on this real-time telemetry during SOS dispatch.
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "var(--text-sm)" }}>
                  <thead>
                    <tr style={{ background: "var(--color-gray-50)", borderBottom: "1px solid var(--surface-border)", color: "var(--color-gray-600)", fontSize: "var(--text-xs)", textTransform: "uppercase" }}>
                      <th style={{ padding: "var(--space-4)" }}>Hospital Name</th>
                      <th style={{ padding: "var(--space-4)" }}>Total ICU Beds</th>
                      <th style={{ padding: "var(--space-4)" }}>Available ICU Beds (Live)</th>
                      <th style={{ padding: "var(--space-4)" }}>Ventilators</th>
                      <th style={{ padding: "var(--space-4)", textAlign: "right" }}>Telemetry Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitals.map((h) => (
                      <tr key={h.id} style={{ borderBottom: "1px solid var(--surface-border)" }}>
                        <td style={{ padding: "var(--space-4)", fontWeight: 700 }}>
                          {h.name}
                        </td>
                        <td style={{ padding: "var(--space-4)", color: "var(--color-gray-600)" }}>
                          {h.beds_icu}
                        </td>
                        <td style={{ padding: "var(--space-4)" }}>
                          <span
                            style={{
                              fontSize: "var(--text-base)",
                              fontWeight: 900,
                              color: h.beds_icu_available > 0 ? "var(--color-success)" : "var(--color-emergency)",
                            }}
                          >
                            {h.beds_icu_available}
                          </span>
                        </td>
                        <td style={{ padding: "var(--space-4)", color: "var(--color-gray-600)" }}>
                          {h.beds_ventilator}
                        </td>
                        <td style={{ padding: "var(--space-4)", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                            <button
                              onClick={() => updateIcuBeds(h.id, h.beds_icu_available - 1)}
                              disabled={h.beds_icu_available <= 0}
                              className="btn btn-outline"
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                            >
                              - 1 Bed
                            </button>
                            <button
                              onClick={() => updateIcuBeds(h.id, h.beds_icu_available + 1)}
                              disabled={h.beds_icu_available >= h.beds_icu}
                              className="btn btn-outline"
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                            >
                              + 1 Bed
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
