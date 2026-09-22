"use client";

import { useState } from "react";
import Link from "next/link";

interface HospitalNode {
  id: string;
  name: string;
  city: string;
  type: string;
  icuTotal: number;
  icuAvailable: number;
  ventilators: number;
  pmjayEmpanelled: boolean;
  lastUpdated: string;
}

const INITIAL_NODES: HospitalNode[] = [
  {
    id: "pgimer-chandigarh",
    name: "PGIMER Chandigarh",
    city: "Chandigarh",
    type: "Public Autonomous",
    icuTotal: 88,
    icuAvailable: 14,
    ventilators: 42,
    pmjayEmpanelled: true,
    lastUpdated: "2 mins ago",
  },
  {
    id: "max-mohali",
    name: "Max Super Speciality Hospital",
    city: "Mohali",
    type: "Private Super-Speciality",
    icuTotal: 45,
    icuAvailable: 8,
    ventilators: 18,
    pmjayEmpanelled: true,
    lastUpdated: "4 mins ago",
  },
  {
    id: "fortis-mohali",
    name: "Fortis Hospital Mohali",
    city: "Mohali",
    type: "Private Quaternary Care",
    icuTotal: 52,
    icuAvailable: 6,
    ventilators: 24,
    pmjayEmpanelled: true,
    lastUpdated: "8 mins ago",
  },
  {
    id: "civil-hoshiarpur",
    name: "Civil Hospital Hoshiarpur",
    city: "Hoshiarpur",
    type: "Government District Hospital",
    icuTotal: 18,
    icuAvailable: 3,
    ventilators: 6,
    pmjayEmpanelled: true,
    lastUpdated: "12 mins ago",
  },
  {
    id: "ivy-hoshiarpur",
    name: "Ivy Hospital Hoshiarpur",
    city: "Hoshiarpur",
    type: "Private Multi-Speciality",
    icuTotal: 22,
    icuAvailable: 5,
    ventilators: 8,
    pmjayEmpanelled: true,
    lastUpdated: "15 mins ago",
  },
  {
    id: "aiims-delhi",
    name: "AIIMS New Delhi",
    city: "New Delhi",
    type: "Apex Autonomous Public",
    icuTotal: 140,
    icuAvailable: 19,
    ventilators: 75,
    pmjayEmpanelled: true,
    lastUpdated: "Just now",
  },
];

export default function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [loginError, setLoginError] = useState("");
  const [nodes, setNodes] = useState<HospitalNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<HospitalNode | null>(INITIAL_NODES[0]);
  const [notification, setNotification] = useState("");
  const [filterCity, setFilterCity] = useState("all");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey === "medroute-admin-2026" || accessKey === "admin123" || accessKey === "admin") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid Security Key. Please contact National Health Authority EMR Coordinator.");
    }
  };

  const updateIcuBeds = (delta: number) => {
    if (!selectedNode) return;
    const newCount = Math.max(0, Math.min(selectedNode.icuTotal, selectedNode.icuAvailable + delta));
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNode.id ? { ...n, icuAvailable: newCount, lastUpdated: "Just now" } : n))
    );
    setSelectedNode((prev) => (prev ? { ...prev, icuAvailable: newCount, lastUpdated: "Just now" } : null));
    setNotification(`Telemetry broadcasted: ${selectedNode.name} ICU available beds updated to ${newCount}`);
    setTimeout(() => setNotification(""), 3500);
  };

  const togglePmjay = () => {
    if (!selectedNode) return;
    const newState = !selectedNode.pmjayEmpanelled;
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNode.id ? { ...n, pmjayEmpanelled: newState } : n))
    );
    setSelectedNode((prev) => (prev ? { ...prev, pmjayEmpanelled: newState } : null));
    setNotification(`${selectedNode.name} PMJAY status set to ${newState ? "ACTIVE" : "SUSPENDED"}`);
    setTimeout(() => setNotification(""), 3500);
  };

  const filteredNodes = nodes.filter((n) => {
    if (filterCity === "all") return true;
    return n.city.toLowerCase() === filterCity.toLowerCase();
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-cyan-500/20">
              🛡️
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800">
                Authorized Personnel Only
              </span>
              <h1 className="text-xl font-bold text-white mt-1.5">MedRoute EMR &amp; Telemetry Gateway</h1>
              <p className="text-xs text-slate-400 mt-1">
                Hospital Data Coordinator &amp; AB-PMJAY Registry Administration Node
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authority Access Passkey
              </label>
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter security key..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1">Default test key: <code className="text-cyan-400">admin</code> or <code className="text-cyan-400">admin123</code></p>
            </div>

            {loginError && (
              <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2.5 rounded-lg flex items-center gap-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Authenticate &amp; Open Console
            </button>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
                ← Return to Public MedRoute
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-base font-bold shadow-md">
              🏥
            </div>
            <div>
              <span className="font-bold text-white text-sm">MedRoute Provider Operations Portal</span>
              <span className="text-[10px] text-cyan-400 block -mt-0.5 font-mono">NODE-INDIA-CENTRAL-01</span>
            </div>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Telemetry Sync: Connected
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
          >
            Consumer App
          </Link>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Lock Terminal
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Notification Toast */}
        {notification && (
          <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-200 text-xs font-medium flex items-center gap-2 animate-fadeIn shadow-lg">
            <span>📡</span>
            <span>{notification}</span>
          </div>
        )}

        {/* Executive Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Reporting Hospitals</span>
            <div className="text-2xl font-bold text-white mt-1">86 Facilities</div>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">100% Verified NABH/PMJAY</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Total Live ICU Beds</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">363 Active</div>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">Across Punjab, Tricity, NCR</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Free ICU Beds Free Now</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {nodes.reduce((acc, curr) => acc + curr.icuAvailable, 0)} Available
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">Real-time telemetry</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">PMJAY Empanelled</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">
              {nodes.filter((n) => n.pmjayEmpanelled).length} / {nodes.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">Cashless ceiling linked</span>
          </div>
        </div>

        {/* Hospital Telemetry Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Facilities List (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-bold text-white">Live Facility Grid Telemetry</h2>
                <p className="text-xs text-slate-400">Click any hospital to adjust live bed counts or verify tariffs</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterCity("all")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filterCity === "all" ? "bg-cyan-600 text-white font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterCity("hoshiarpur")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filterCity === "hoshiarpur" ? "bg-cyan-600 text-white font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Hoshiarpur
                </button>
                <button
                  onClick={() => setFilterCity("chandigarh")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filterCity === "chandigarh" ? "bg-cyan-600 text-white font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Chandigarh
                </button>
                <button
                  onClick={() => setFilterCity("mohali")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filterCity === "mohali" ? "bg-cyan-600 text-white font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Mohali
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
              {filteredNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? "bg-cyan-950/40 border-l-4 border-cyan-400" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{n.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {n.city}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                        <span>{n.type}</span>
                        <span>•</span>
                        <span>Updated {n.lastUpdated}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            n.icuAvailable > 0 ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                          }`}
                        />
                        <span className="text-xs font-bold text-white">
                          {n.icuAvailable} / {n.icuTotal} ICU Free
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {n.ventilators} Ventilators
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry Control Panel (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5 sticky top-24">
            {selectedNode ? (
              <>
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider font-bold">
                    Telemetry Dispatch Terminal
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedNode.name}</h3>
                  <p className="text-xs text-slate-400">
                    Location: {selectedNode.city} | Category: {selectedNode.type}
                  </p>
                </div>

                {/* ICU Bed Counter Controls */}
                <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Available ICU Beds
                      </span>
                      <p className="text-2xl font-black text-emerald-400">
                        {selectedNode.icuAvailable}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          of {selectedNode.icuTotal} total
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateIcuBeds(-1)}
                        className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                        title="Decrement available ICU beds"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateIcuBeds(1)}
                        className="w-9 h-9 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer shadow-md shadow-cyan-600/20"
                        title="Increment available ICU beds"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (selectedNode.icuAvailable / selectedNode.icuTotal) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-white block">PMJAY Cashless Empanelment</span>
                      <span className="text-[11px] text-slate-400">AB-PMJAY HBP 2.2 cashless ceiling verification</span>
                    </div>
                    <button
                      onClick={togglePmjay}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        selectedNode.pmjayEmpanelled
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-red-950 text-red-400 border border-red-800"
                      }`}
                    >
                      {selectedNode.pmjayEmpanelled ? "ACTIVE" : "SUSPENDED"}
                    </button>
                  </div>
                </div>

                {/* Rapid Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setNotification(`Telemetry broadcast published for ${selectedNode.name}`);
                      setTimeout(() => setNotification(""), 3500);
                    }}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Broadcast Telemetry to MedRoute Network
                  </button>
                  <button
                    onClick={() => alert(`Procedure tariff audit initiated for ${selectedNode.name}. Data cross-checked with NHA HBP 2.2.`)}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Audit Procedure Tariffs &amp; Inclusions
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                Select a hospital to edit telemetry and tariff parameters
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
