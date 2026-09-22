"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface AuditRecord {
  id: string;
  hospitalName: string;
  location: string;
  procedure: string;
  tariff: string;
  status: "Approved" | "Pending" | "Flagged";
}

const INITIAL_RECORDS: AuditRecord[] = [
  {
    id: "rec-1",
    hospitalName: "PGIMER Chandigarh",
    location: "Sector 12",
    procedure: "Nephrology Dialysis",
    tariff: "₹1,200",
    status: "Approved",
  },
  {
    id: "rec-2",
    hospitalName: "Fortis Hospital",
    location: "Sector 62, Mohali",
    procedure: "Knee Arthroplasty",
    tariff: "₹1,85,000",
    status: "Approved",
  },
  {
    id: "rec-3",
    hospitalName: "Landmark Hospital",
    location: "Sector 33-C, Chandigarh",
    procedure: "Cardiac Stent Procedure",
    tariff: "₹1,15,000",
    status: "Pending",
  },
  {
    id: "rec-4",
    hospitalName: "Healing Touch Clinic",
    location: "Phase 7, SAS Nagar",
    procedure: "Gallbladder Laparoscopy",
    tariff: "₹42,000",
    status: "Flagged",
  },
];

export default function AdminPage() {
  const { user, signIn } = useAuth();
  const [records, setRecords] = useState<AuditRecord[]>(INITIAL_RECORDS);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "flagged">("all");
  const [notification, setNotification] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const isAdmin = user?.role === "admin";

  const approveRecord = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" as const } : r))
    );
    setNotification("Record approved and published to public directory.");
    setTimeout(() => setNotification(""), 3000);
  };

  const syncTelemetry = () => {
    setNotification("Syncing hospital telemetry with PostGIS spatial registry...");
    setTimeout(() => {
      setNotification("Telemetry sync completed. All 156 nodes verified.");
      setTimeout(() => setNotification(""), 3000);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadStatus(`Uploaded: ${e.target.files[0].name} (12 procedure records staged)`);
      setTimeout(() => setUploadStatus(""), 4000);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (activeFilter === "pending") return r.status === "Pending";
    if (activeFilter === "flagged") return r.status === "Flagged";
    return true;
  });

  const pendingCount = records.filter((r) => r.status === "Pending").length;
  const flaggedCount = records.filter((r) => r.status === "Flagged").length;

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col w-full">
          {/* Interactive Admin Canvas Shell */}
          <div className="w-full max-w-7xl mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
            {/* Header */}
            {!isAdmin && (
              <div className="bg-primary-fixed/20 border border-primary/30 p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                  <span>Currently viewing as guest / standard user. Switch to an Admin session to enable full write permissions.</span>
                </div>
                <button
                  type="button"
                  onClick={() => signIn("admin@medroute.in", "admin123456")}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors shrink-0 shadow-xs"
                >
                  ⚡ Elevate to Admin Session
                </button>
              </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-xs">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm uppercase tracking-wider">
                    Registry Authority Console
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-label-sm text-secondary font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    FHIR v4.0.1 Connected
                  </span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                  Hospital Registry &amp; Tariff Audit
                </h1>
                <p className="font-body-md text-on-surface-variant">
                  Manage hospital records, audit rate packages, and monitor registry synchronizations.
                </p>
              </div>

              <div className="flex items-center gap-space-sm">
                <button
                  id="btn-sync-emr"
                  type="button"
                  onClick={syncTelemetry}
                  className="px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md shadow-sm hover:bg-surface-container transition-all flex items-center gap-2 border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-secondary text-base">sync</span>
                  <span>Sync Telemetry</span>
                </button>
                <label
                  htmlFor="file-selector"
                  className="px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-md shadow-sm hover:bg-primary-container transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">cloud_upload</span>
                  <span>Upload Batch</span>
                </label>
              </div>
            </div>

            {/* Notification Toast */}
            {notification && (
              <div className="bg-secondary-container text-on-secondary-container px-space-md py-2.5 rounded-lg font-label-md font-bold flex items-center gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{notification}</span>
              </div>
            )}

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-lg">
              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm uppercase text-on-surface-variant tracking-wider font-semibold">
                    Verified Hospitals
                  </span>
                  <span className="material-symbols-outlined text-secondary text-xl">
                    domain_verification
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-xl text-primary font-extrabold">156</span>
                  <span className="font-label-sm text-secondary font-medium">+4 this month</span>
                </div>
              </div>

              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm uppercase text-on-surface-variant tracking-wider font-semibold">
                    Pending Audits
                  </span>
                  <span className="material-symbols-outlined text-primary-container text-xl">
                    pending_actions
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-xl text-primary font-extrabold">{pendingCount}</span>
                  <span className="font-label-sm text-on-surface-variant font-medium">Awaiting review</span>
                </div>
              </div>

              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm uppercase text-on-surface-variant tracking-wider font-semibold">
                    Flagged Records
                  </span>
                  <span className="material-symbols-outlined text-error text-xl">warning</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-xl text-error font-extrabold">{flaggedCount}</span>
                  <span className="font-label-sm text-error font-medium">Tariff discrepancy</span>
                </div>
              </div>
            </div>

            {/* Grid Layout: Batch Ingestion & Review Queue */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
              {/* Left Col: Batch Ingestion */}
              <div className="xl:col-span-4 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline-md text-primary font-semibold">Batch Ingestion</h2>
                    <p className="font-body-sm text-on-surface-variant">Upload CSV or FHIR JSON</p>
                  </div>
                  <span className="p-2 bg-surface-container-low rounded-lg text-secondary">
                    <span className="material-symbols-outlined text-lg">upload_file</span>
                  </span>
                </div>

                <label
                  htmlFor="file-selector"
                  id="dropzone"
                  className="p-space-lg rounded-xl bg-surface-container-low/60 border border-dashed border-outline-variant flex flex-col items-center text-center gap-space-sm cursor-pointer hover:bg-surface-container-high transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shadow-xs">
                    <span className="material-symbols-outlined text-xl">cloud_upload</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-label-md text-primary font-semibold">
                      Drop files or click to browse
                    </p>
                    <p className="font-label-sm text-on-surface-variant">
                      CSV, JSON, or XML format
                    </p>
                  </div>
                  <input
                    id="file-selector"
                    type="file"
                    accept=".csv,.json,.xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadStatus && (
                    <div className="font-label-sm text-secondary mt-1 font-bold">
                      {uploadStatus}
                    </div>
                  )}
                </label>

                <div className="flex items-center justify-between pt-space-xs text-label-sm text-on-surface-variant">
                  <span>Need template?</span>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Sample template downloaded: PMJAY_HBP_Hospital_Tariff_Template.csv");
                    }}
                    className="text-secondary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">download</span> Download Sample
                  </a>
                </div>
              </div>

              {/* Right Col: Review & Audit Queue */}
              <div className="xl:col-span-8 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <h2 className="font-headline-md text-primary font-semibold">
                      Review &amp; Audit Queue
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm font-semibold">
                      {filteredRecords.length} records
                    </span>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg">
                    <button
                      onClick={() => setActiveFilter("all")}
                      className={`px-2.5 py-1 rounded-md font-label-sm font-semibold transition-all ${
                        activeFilter === "all"
                          ? "text-on-surface bg-surface-container-lowest shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveFilter("pending")}
                      className={`px-2.5 py-1 rounded-md font-label-sm font-semibold transition-all ${
                        activeFilter === "pending"
                          ? "text-on-surface bg-surface-container-lowest shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Pending ({pendingCount})
                    </button>
                    <button
                      onClick={() => setActiveFilter("flagged")}
                      className={`px-2.5 py-1 rounded-md font-label-sm font-semibold transition-all ${
                        activeFilter === "flagged"
                          ? "text-on-surface bg-surface-container-lowest shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Flagged ({flaggedCount})
                    </button>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="border-b border-surface-container-high">
                      <tr className="text-on-surface-variant font-label-sm uppercase tracking-wider">
                        <th className="py-3 px-space-md font-semibold">Hospital Name</th>
                        <th className="py-3 px-space-md font-semibold">Procedure</th>
                        <th className="py-3 px-space-md font-semibold">Tariff</th>
                        <th className="py-3 px-space-md font-semibold">Status</th>
                        <th className="py-3 px-space-md text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low font-body-sm">
                      {filteredRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-space-md px-space-md">
                            <span className="font-medium text-primary block">{r.hospitalName}</span>
                            <span className="text-on-surface-variant font-label-sm">{r.location}</span>
                          </td>
                          <td className="py-space-md px-space-md text-on-surface">{r.procedure}</td>
                          <td
                            className={`py-space-md px-space-md font-semibold ${
                              r.status === "Flagged" ? "text-error" : "text-primary"
                            }`}
                          >
                            {r.tariff}
                          </td>
                          <td className="py-space-md px-space-md">
                            {r.status === "Approved" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm font-semibold">
                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                Approved
                              </span>
                            )}
                            {r.status === "Pending" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm font-semibold">
                                <span className="material-symbols-outlined text-xs">schedule</span>
                                Pending
                              </span>
                            )}
                            {r.status === "Flagged" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm font-semibold">
                                <span className="material-symbols-outlined text-xs">warning</span>
                                Flagged
                              </span>
                            )}
                          </td>
                          <td className="py-space-md px-space-md text-right">
                            {r.status === "Pending" ? (
                              <button
                                type="button"
                                onClick={() => approveRecord(r.id)}
                                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm font-semibold hover:bg-primary-container transition-colors shadow-xs"
                              >
                                Approve
                              </button>
                            ) : r.status === "Flagged" ? (
                              <button
                                type="button"
                                onClick={() => alert(`Audit initiated for ${r.hospitalName}`)}
                                className="px-3 py-1.5 rounded-lg bg-tertiary-container text-on-tertiary font-label-sm font-semibold hover:bg-tertiary transition-colors shadow-xs"
                              >
                                Review
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => alert(`Viewing details for ${r.hospitalName}`)}
                                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm font-semibold hover:bg-surface-container-high transition-colors"
                              >
                                Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
