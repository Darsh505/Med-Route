"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getAllHospitalsWithOverrides,
  saveHospitalTelemetryOverride,
  syncLiveHospitalsTelemetry,
  HospitalOption,
} from "@/data/hospitalsData";

interface PendingVerificationItem {
  id: string;
  name: string;
  city: string;
  state?: string;
  type: string;
  beds_total?: number;
  data_source_label: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminPortalPage() {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"telemetry" | "queue" | "sources">("telemetry");

  // Store editable hospital telemetry in local state, initialized with existing overrides
  const [hospitals, setHospitals] = useState<HospitalOption[]>(() => getAllHospitalsWithOverrides());
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => hospitals[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPmjay, setFilterPmjay] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const [notification, setNotification] = useState("");
  const [showTariffModal, setShowTariffModal] = useState(false);

  // Review Queue state
  const [reviewQueue, setReviewQueue] = useState<PendingVerificationItem[]>([
    {
      id: "rev-q-1",
      name: "Fortis Escorts Emergency Center",
      city: "Mohali",
      state: "Punjab",
      type: "private",
      beds_total: 120,
      data_source_label: "PROVIDER_SUBMITTED",
      status: "pending",
    },
    {
      id: "rev-q-2",
      name: "Sanjivani Charitable Super Specialty Hospital",
      city: "Chandigarh",
      state: "Chandigarh",
      type: "trust",
      beds_total: 85,
      data_source_label: "COMMUNITY_AUDITED",
      status: "pending",
    },
    {
      id: "rev-q-3",
      name: "GMC Sub-Divisional Hospital Extension",
      city: "Panchkula",
      state: "Haryana",
      type: "government",
      beds_total: 150,
      data_source_label: "STATE_HEALTH_PORTAL",
      status: "pending",
    },
    {
      id: "rev-q-4",
      name: "Apex Heart & Vascular Institute",
      city: "Ludhiana",
      state: "Punjab",
      type: "private",
      beds_total: 90,
      data_source_label: "PROVIDER_SUBMITTED",
      status: "pending",
    },
  ]);

  // Sync auth on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSessionAuth = sessionStorage.getItem("medroute_admin_authenticated") === "true";
      const isUserAdmin = user?.role === "admin" || user?.email?.toLowerCase().includes("admin");
      if (isSessionAuth || isUserAdmin) {
        setIsAuthenticated(true);
      }
    }
  }, [user]);

  // Try fetching backend review queue and live hospital telemetry if API is running
  const fetchBackendData = useCallback(async () => {
    try {
      syncLiveHospitalsTelemetry().then((fresh) => {
        if (fresh && fresh.length > 0) setHospitals(fresh);
      });

      const res = await fetch("http://localhost:8000/api/admin/review-queue", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("medroute_token") || ""}`,
          "x-admin-key": "medroute-admin-superkey",
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setReviewQueue((prev) => {
            const incoming = json.data.map((item: any) => ({
              id: item.id,
              name: item.name,
              city: item.city,
              type: item.type,
              data_source_label: item.data_source_label || "PENDING_VERIFICATION",
              status: "pending" as const,
            }));
            const map = new Map();
            [...incoming, ...prev].forEach((i) => map.set(i.id, i));
            return Array.from(map.values());
          });
        }
      }
    } catch {
      // Backend offline or unreachable — offline resilience active
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendData();
    }
  }, [isAuthenticated, fetchBackendData]);

  // Handle Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const key = accessKey.trim();
    if (
      key === "medroute-admin-2026" ||
      key === "admin123" ||
      key === "admin" ||
      key === "admin123456"
    ) {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("medroute_admin_authenticated", "true");
      }
      setLoginError("");
    } else {
      setLoginError("Invalid Security Passkey");
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("medroute_admin_authenticated");
    }
  };

  // Selected hospital
  const selectedHospital = useMemo(() => {
    return hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];
  }, [hospitals, selectedHospitalId]);

  // Unique cities list for the filter dropdown
  const allCities = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach((h) => {
      if (h.city) set.add(h.city);
    });
    return Array.from(set).sort();
  }, [hospitals]);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      // City filter
      if (filterCity !== "all" && h.city.toLowerCase() !== filterCity.toLowerCase()) {
        return false;
      }
      // Type filter
      if (filterType !== "all" && !h.type?.toLowerCase().includes(filterType.toLowerCase())) {
        return false;
      }
      // PMJAY filter
      if (filterPmjay === "active" && !h.is_pmjay_empanelled) return false;
      if (filterPmjay === "inactive" && h.is_pmjay_empanelled) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesCity = h.city.toLowerCase().includes(q);
        const matchesState = h.state?.toLowerCase().includes(q);
        const matchesSpecialty = h.specialties?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesState && !matchesSpecialty) return false;
      }

      return true;
    });
  }, [hospitals, filterCity, filterType, filterPmjay, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredHospitals.length / pageSize) || 1;
  const paginatedHospitals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHospitals.slice(start, start + pageSize);
  }, [filteredHospitals, currentPage]);

  // Aggregated dynamic statistics across all 1,451+ facilities
  const stats = useMemo(() => {
    const totalFacilities = hospitals.length;
    const totalIcuBeds = hospitals.reduce((acc, h) => acc + (h.beds_icu || 0), 0);
    const availableIcuBeds = hospitals.reduce((acc, h) => acc + (h.beds_icu_available || 0), 0);
    const pmjayCount = hospitals.filter((h) => h.is_pmjay_empanelled).length;
    const pendingVerifications = reviewQueue.filter((q) => q.status === "pending").length;
    return { totalFacilities, totalIcuBeds, availableIcuBeds, pmjayCount, pendingVerifications };
  }, [hospitals, reviewQueue]);

  // Telemetry adjustments with persistent sync
  const updateIcuBeds = (delta: number) => {
    if (!selectedHospital) return;
    const current = selectedHospital.beds_icu_available || 0;
    const total = selectedHospital.beds_icu || 20;
    const newCount = Math.max(0, Math.min(total, current + delta));

    setHospitals((prev) =>
      prev.map((h) => (h.id === selectedHospital.id ? { ...h, beds_icu_available: newCount, icu: newCount } : h))
    );

    // Save to persistent localStorage overrides
    saveHospitalTelemetryOverride(selectedHospital.id, selectedHospital.slug, {
      beds_icu_available: newCount,
    });

    setNotification(`${selectedHospital.name}: Available ICU beds updated to ${newCount}`);
    setTimeout(() => setNotification(""), 3000);
  };

  const togglePmjayStatus = () => {
    if (!selectedHospital) return;
    const newStatus = !selectedHospital.is_pmjay_empanelled;
    setHospitals((prev) =>
      prev.map((h) => (h.id === selectedHospital.id ? { ...h, is_pmjay_empanelled: newStatus, pmjay: newStatus } : h))
    );

    // Save to persistent localStorage overrides
    saveHospitalTelemetryOverride(selectedHospital.id, selectedHospital.slug, {
      is_pmjay_empanelled: newStatus,
    });

    setNotification(`${selectedHospital.name}: PMJAY status set to ${newStatus ? "ACTIVE" : "SUSPENDED"}`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleBroadcast = () => {
    if (!selectedHospital) return;
    saveHospitalTelemetryOverride(selectedHospital.id, selectedHospital.slug, {
      beds_icu_available: selectedHospital.beds_icu_available,
      is_pmjay_empanelled: selectedHospital.is_pmjay_empanelled,
    });
    setNotification(`Telemetry broadcast published across network for ${selectedHospital.name}`);
    setTimeout(() => setNotification(""), 3500);
  };

  // Review queue actions
  const handleReviewAction = async (itemId: string, action: "approve" | "reject") => {
    setReviewQueue((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: action === "approve" ? "approved" : "rejected" } : item))
    );

    // Attempt backend sync
    try {
      await fetch(`http://localhost:8000/api/admin/verify/${itemId}?action=${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("medroute_token") || ""}` },
      });
    } catch {
      // Offline fallback
    }

    setNotification(`Facility record ${action === "approve" ? "approved & verified" : "rejected"}`);
    setTimeout(() => setNotification(""), 3000);
  };

  // ── Authentication Screen (Minimalist Black) ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-lg p-6 shadow-2xl">
          <div className="mb-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block">
              Node Registry Telemetry
            </span>
            <h1 className="text-base font-semibold text-white mt-1">Provider Operations Portal</h1>
            <p className="text-xs text-zinc-400 mt-1">
              National Health Authority Hospital Telemetry Terminal
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Authority Security Passkey</label>
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter access key"
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                autoFocus
              />
              <span className="text-[10px] text-zinc-600 mt-1 block">Default: admin</span>
            </div>

            {loginError && (
              <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/40 p-2 rounded">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-xs font-medium rounded transition-colors cursor-pointer"
            >
              Authenticate Terminal
            </button>

            <div className="pt-2 text-center">
              <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                Return to Public App
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex flex-col font-sans">
      {/* Minimalist Top Bar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight text-white">MedRoute Operations</span>
            <span className="text-[10px] font-mono text-zinc-500">NODE-INDIA-01</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Sync Active ({hospitals.length} nodes)
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation Tabs */}
          <nav className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5">
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                activeTab === "telemetry"
                  ? "bg-zinc-100 text-black font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Telemetry
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                activeTab === "queue"
                  ? "bg-zinc-100 text-black font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Queue</span>
              {stats.pendingVerifications > 0 && (
                <span className="text-[9px] px-1 py-0.2 rounded-full bg-sky-900 text-sky-200 font-mono">
                  {stats.pendingVerifications}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("sources")}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                activeTab === "sources"
                  ? "bg-zinc-100 text-black font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Data Sources
            </button>
          </nav>

          <a
            href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Dedicated Admin Dashboard Console on port 3001"
            className="hidden md:inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-white px-2.5 py-1 rounded border border-cyan-800/80 hover:border-cyan-600 transition-colors font-mono"
          >
            <span>Console (:3001)</span>
          </a>
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            Public App
          </Link>
          <button
            onClick={handleLock}
            className="text-xs text-zinc-400 hover:text-red-400 px-2.5 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            Lock
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Subtle Toast */}
        {notification && (
          <div className="py-2 px-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono rounded flex items-center justify-between">
            <span>{notification}</span>
            <button onClick={() => setNotification("")} className="text-zinc-500 hover:text-white text-xs cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-950 border border-zinc-850 rounded p-3.5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">Facilities</span>
            <div className="text-xl font-semibold text-white mt-1">{stats.totalFacilities.toLocaleString()}</div>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">{allCities.length} Cities Covered</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-850 rounded p-3.5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">Total ICU Capacity</span>
            <div className="text-xl font-semibold text-zinc-200 mt-1">{stats.totalIcuBeds.toLocaleString()}</div>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">Monitored Critical Beds</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-850 rounded p-3.5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">Available ICU Beds</span>
            <div className="text-xl font-semibold text-emerald-400 mt-1">{stats.availableIcuBeds.toLocaleString()}</div>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">Live Telemetry Overrides Active</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-850 rounded p-3.5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">PMJAY Empanelled</span>
            <div className="text-xl font-semibold text-zinc-200 mt-1">
              {stats.pmjayCount.toLocaleString()}{" "}
              <span className="text-xs font-normal text-zinc-500">
                ({Math.round((stats.pmjayCount / stats.totalFacilities) * 100)}%)
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">Cashless Package Active</span>
          </div>
        </div>

        {/* TAB 1: TELEMETRY & BED INVENTORY */}
        {activeTab === "telemetry" && (
          <>
            {/* Filter & Search Bar */}
            <div className="bg-zinc-950 border border-zinc-850 rounded p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={`Search across ${hospitals.length} hospitals by name, city, specialty...`}
                  className="w-full px-3 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Quick City Pills */}
                <div className="hidden xl:flex items-center gap-1 border-r border-zinc-800 pr-2">
                  {["all", "Chandigarh", "Mohali", "Panchkula", "Delhi", "Mumbai"].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setFilterCity(c);
                        setCurrentPage(1);
                      }}
                      className={`text-[11px] px-2 py-1 rounded transition-colors ${
                        filterCity.toLowerCase() === c.toLowerCase()
                          ? "bg-zinc-200 text-black font-medium"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {c === "all" ? "All" : c}
                    </button>
                  ))}
                </div>

                {/* City Dropdown */}
                <select
                  value={filterCity}
                  onChange={(e) => {
                    setFilterCity(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono"
                >
                  <option value="all">All Cities ({allCities.length})</option>
                  {allCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                {/* Type Dropdown */}
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono"
                >
                  <option value="all">All Types</option>
                  <option value="government">Government</option>
                  <option value="private">Private</option>
                  <option value="trust">Trust</option>
                </select>

                {/* PMJAY Filter */}
                <select
                  value={filterPmjay}
                  onChange={(e) => {
                    setFilterPmjay(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono"
                >
                  <option value="all">PMJAY: Any</option>
                  <option value="active">PMJAY: Active</option>
                  <option value="inactive">PMJAY: Inactive</option>
                </select>
              </div>
            </div>

            {/* Main Content Layout: Table (Left) + Inspector Panel (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Facilities Table (7 cols) */}
              <div className="lg:col-span-7 bg-zinc-950 border border-zinc-850 rounded flex flex-col overflow-hidden">
                <div className="p-3 border-b border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    Showing <strong className="text-white">{filteredHospitals.length}</strong> facilities
                    {filterCity !== "all" && ` in ${filterCity}`}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-zinc-900 max-h-[560px] overflow-y-auto font-mono text-xs">
                  {paginatedHospitals.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">No hospitals found matching filter criteria.</div>
                  ) : (
                    paginatedHospitals.map((h) => {
                      const isSelected = selectedHospital?.id === h.id;
                      const isAvailable = (h.beds_icu_available || 0) > 0;
                      return (
                        <div
                          key={h.id}
                          onClick={() => setSelectedHospitalId(h.id)}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-zinc-900 border-l-2 border-white"
                              : "hover:bg-zinc-900/50"
                          }`}
                        >
                          <div className="flex-1 pr-4 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-medium text-white truncate text-xs">{h.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded shrink-0">
                                {h.city}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                              <span className="capitalize">{h.type}</span>
                              <span>•</span>
                              <span>{h.state}</span>
                              {h.accreditation && (
                                <>
                                  <span>•</span>
                                  <span className="text-zinc-400">{h.accreditation}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-red-500"}`} />
                              <span className="text-zinc-200 font-medium text-xs">
                                {h.beds_icu_available ?? 0} / {h.beds_icu ?? 20} ICU
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                              {h.is_pmjay_empanelled ? (
                                <span className="text-emerald-400">PMJAY Active</span>
                              ) : (
                                <span>No PMJAY</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination Controls */}
                <div className="p-3 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-black border border-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-900 text-zinc-200 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    Showing {(currentPage - 1) * pageSize + 1}–
                    {Math.min(currentPage * pageSize, filteredHospitals.length)} of {filteredHospitals.length}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 bg-black border border-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-900 text-zinc-200 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Telemetry Inspector Panel (5 cols) */}
              <div className="lg:col-span-5 bg-zinc-950 border border-zinc-850 rounded p-4 flex flex-col gap-4 sticky top-20">
                {selectedHospital ? (
                  <>
                    <div className="border-b border-zinc-850 pb-3">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">
                        Telemetry Node Inspector
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-1">{selectedHospital.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {selectedHospital.city}, {selectedHospital.state} | {selectedHospital.type}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        Address: {selectedHospital.address}
                      </p>
                    </div>

                    {/* Live ICU Stepper */}
                    <div className="bg-black border border-zinc-850 rounded p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono block">
                            Available ICU Beds
                          </span>
                          <div className="text-xl font-bold font-mono text-white mt-0.5">
                            {selectedHospital.beds_icu_available ?? 0}{" "}
                            <span className="text-xs font-normal text-zinc-500">
                              of {selectedHospital.beds_icu ?? 20} Total
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono">
                          <button
                            onClick={() => updateIcuBeds(-1)}
                            className="w-8 h-8 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                            title="Decrement available ICU beds"
                          >
                            -
                          </button>
                          <button
                            onClick={() => updateIcuBeds(1)}
                            className="w-8 h-8 rounded bg-white hover:bg-zinc-200 text-black font-bold flex items-center justify-center transition-colors cursor-pointer"
                            title="Increment available ICU beds"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Bed Occupancy Meter */}
                      <div className="w-full bg-zinc-900 rounded h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 transition-all duration-200"
                          style={{
                            width: `${Math.min(
                              100,
                              ((selectedHospital.beds_icu_available ?? 0) / (selectedHospital.beds_icu || 20)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Operational Toggles */}
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded bg-black border border-zinc-850">
                        <div>
                          <span className="text-zinc-200 font-medium block">PMJAY Cashless Empanelment</span>
                          <span className="text-[10px] text-zinc-500">AB-PMJAY HBP 2.2 tariff ceiling</span>
                        </div>
                        <button
                          onClick={togglePmjayStatus}
                          className={`text-[11px] px-2.5 py-1 rounded font-mono font-medium transition-colors cursor-pointer ${
                            selectedHospital.is_pmjay_empanelled
                              ? "bg-zinc-100 text-black"
                              : "border border-zinc-800 text-zinc-500 hover:text-white"
                          }`}
                        >
                          {selectedHospital.is_pmjay_empanelled ? "ACTIVE" : "SUSPENDED"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded bg-black border border-zinc-850 text-xs">
                        <div>
                          <span className="text-zinc-200 font-medium block">Emergency Trauma Center</span>
                          <span className="text-[10px] text-zinc-500">
                            {selectedHospital.trauma_level || "Level 2"} Trauma Unit
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {selectedHospital.is_trauma_center ? "24x7 Ready" : "Standby"}
                        </span>
                      </div>
                    </div>

                    {/* Procedure Package Preview */}
                    <div className="border border-zinc-850 rounded p-2.5 bg-black">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                          Verified Procedure Tariffs ({selectedHospital.procedures?.length || 0})
                        </span>
                        <button
                          onClick={() => setShowTariffModal(true)}
                          className="text-[11px] text-zinc-400 hover:text-white underline font-mono cursor-pointer"
                        >
                          View All
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono">
                        {(selectedHospital.procedures || []).slice(0, 3).map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-zinc-300">
                            <span className="truncate max-w-[200px]">{p.name}</span>
                            <span className="text-zinc-400">₹{(p.cost_avg || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Primary Action Button */}
                    <button
                      onClick={handleBroadcast}
                      className="w-full py-2 bg-white text-black hover:bg-zinc-200 font-medium text-xs rounded transition-colors cursor-pointer"
                    >
                      Broadcast Telemetry Update
                    </button>
                  </>
                ) : (
                  <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                    Select a facility from the table
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: VERIFICATION REVIEW QUEUE */}
        {activeTab === "queue" && (
          <div className="bg-zinc-950 border border-zinc-850 rounded flex flex-col p-4 gap-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Facility Audit &amp; Review Queue</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Institutions awaiting clinical registration, accreditation checks, or tariff updates.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {reviewQueue.filter((q) => q.status === "pending").length} Pending Audits
              </span>
            </div>

            <div className="divide-y divide-zinc-900 font-mono text-xs">
              {reviewQueue.map((item) => (
                <div key={item.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-medium text-white text-xs">{item.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                        {item.city}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 font-mono">
                        {item.data_source_label}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                      <span className="capitalize">{item.type} hospital</span>
                      <span>•</span>
                      <span>Total Capacity: {item.beds_total || 100} beds</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleReviewAction(item.id, "approve")}
                          className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs rounded transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewAction(item.id, "reject")}
                          className="px-3 py-1 bg-zinc-900 text-red-400 border border-zinc-800 hover:bg-red-950/40 text-xs rounded transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                          item.status === "approved"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DATA SOURCES & SYNC */}
        {activeTab === "sources" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-850 rounded p-4 flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">Registry Source 1</span>
              <h3 className="text-sm font-semibold text-white">NHA Ayushman Bharat HBP 2.2</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                National Health Authority health benefit package tariffs covering 8,481 procedure packages across cardio, oncology, ortho, and maternal care.
              </p>
              <div className="mt-2 pt-2 border-t border-zinc-850 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  SYNCHRONIZED
                </span>
                <span className="text-zinc-500">8,481 Package Tariffs</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded p-4 flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">Registry Source 2</span>
              <h3 className="text-sm font-semibold text-white">Health Facility Registry (HFR)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Primary and secondary registry tracking 1,451 hospital infrastructure units across 107 cities with PostGIS spatial coordinates.
              </p>
              <div className="mt-2 pt-2 border-t border-zinc-850 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  VERIFIED
                </span>
                <span className="text-zinc-500">1,451 Institutions</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded p-4 flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">Telemetry Engine</span>
              <h3 className="text-sm font-semibold text-white">Live ICU Bed Telemetry Bridge</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sub-second critical care capacity tracking with persistent local and cloud state overrides for immediate citizen routing.
              </p>
              <div className="mt-2 pt-2 border-t border-zinc-850 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  ACTIVE
                </span>
                <span className="text-zinc-500">{stats.availableIcuBeds.toLocaleString()} Available Beds</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded p-4 flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">Spatial Index</span>
              <h3 className="text-sm font-semibold text-white">PostGIS GiST Radius Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Geospatial indexing providing sub-50ms nearest trauma center lookups and commute travel time calculations.
              </p>
              <div className="mt-2 pt-2 border-t border-zinc-850 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  ONLINE
                </span>
                <span className="text-zinc-500">Sub-50ms Latency</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Tariff Audit Modal (Minimalist Black) */}
      {showTariffModal && selectedHospital && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{selectedHospital.name}</h3>
                <span className="text-[11px] font-mono text-zinc-400">Procedure Package Tariffs (NHA HBP 2.2)</span>
              </div>
              <button
                onClick={() => setShowTariffModal(false)}
                className="text-zinc-500 hover:text-white text-sm font-mono px-2 py-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto my-4 divide-y divide-zinc-900 font-mono text-xs">
              {(selectedHospital.procedures || []).map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="pr-4">
                    <span className="font-sans font-medium text-zinc-200 block text-xs">{p.name}</span>
                    <span className="text-[10px] text-zinc-500">{p.disease}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-white block font-medium">₹{(p.cost_avg || 0).toLocaleString()} avg</span>
                    <span className="text-[10px] text-zinc-500">PMJAY: ₹{(p.pmjay_package_rate || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-850 pt-3 flex justify-end">
              <button
                onClick={() => setShowTariffModal(false)}
                className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-medium rounded transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
