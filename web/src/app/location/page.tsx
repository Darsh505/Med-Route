"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation, INDIAN_CITIES, CityInfo } from "@/context/LocationContext";
import { useTranslations } from "next-intl";

export default function LocationPage() {
  const t = useTranslations();
  const {
    selectedCity,
    selectedState,
    coords,
    isAutoDetected,
    selectCity,
    autoDetect,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<"all" | "featured" | "north" | "south" | "west" | "east">("all");
  const [detecting, setDetecting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAutoDetect = async () => {
    setDetecting(true);
    setToastMessage(null);
    const success = await autoDetect();
    setDetecting(false);
    if (success) {
      setToastMessage("Location auto-detected successfully via GPS!");
    } else {
      setToastMessage("GPS unavailable. Auto-selected default regional hub.");
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredCities = INDIAN_CITIES.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion =
      activeRegion === "all" || city.region === activeRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-gutter">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-md font-semibold text-xs mb-3 shadow-xs">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span>National Healthcare Grid • Pan-India Coverage</span>
            </div>
            <h1 className="font-display-lg text-display-lg font-extrabold text-primary tracking-tight">
              Select Your Location
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Your location is automatically selected on every visit. Switch anytime to discover nearest trauma centers, ICU telemetry, and direct hospital ambulances in your district.
            </p>
          </div>

          {/* Active Location Hero Card */}
          <div className="bg-surface-container-lowest border-2 border-primary/20 rounded-2xl p-6 sm:p-8 mb-10 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-sm text-2xl shrink-0">
                  📍
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Active Telemetry Center
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      {isAutoDetected ? "Auto-Detected via GPS / Grid" : "Manually Selected"}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-primary mt-1">
                    {selectedCity}, <span className="font-medium text-on-surface-variant text-xl">{selectedState}</span>
                  </h2>

                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    Lat: {coords.lat.toFixed(4)}° N • Long: {coords.lng.toFixed(4)}° E • All search results &amp; ambulance dispatches calibrated to this hub
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleAutoDetect}
                  disabled={detecting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-label-md font-bold text-sm shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[18px] ${detecting ? "animate-spin" : ""}`}>
                    {detecting ? "sync" : "my_location"}
                  </span>
                  <span>{detecting ? "Detecting GPS..." : "Auto-Detect My GPS"}</span>
                </button>

                <Link
                  href={`/search?city=${encodeURIComponent(selectedCity)}`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-bold text-sm border border-outline-variant/30 transition-all"
                >
                  <span>Explore Hospitals →</span>
                </Link>
              </div>
            </div>

            {toastMessage && (
              <div className="mt-4 p-3 rounded-xl bg-secondary-container/40 border border-secondary/30 text-on-secondary-container text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                <span>{toastMessage}</span>
              </div>
            )}
          </div>

          {/* Search & Regional Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search city, district, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-outline hover:text-on-surface text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Region Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
              {[
                { id: "all", label: "All Hubs" },
                { id: "featured", label: "⭐ Featured (Hoshiarpur & Tricity)" },
                { id: "north", label: "North" },
                { id: "south", label: "South" },
                { id: "west", label: "West" },
                { id: "east", label: "East & Central" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRegion(tab.id as "all" | "north" | "south" | "west" | "east")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeRegion === tab.id
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* City Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCities.map((city: CityInfo) => {
              const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();

              return (
                <div
                  key={city.name}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-surface-container-lowest border-primary shadow-md ring-2 ring-primary/20"
                      : "bg-surface-container-lowest hover:bg-surface-container-low border-surface-container-high/60 shadow-xs hover:shadow-sm"
                  }`}
                >
                  <div>
                    {/* Header: Name, Badge, Flag */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-primary">
                            {city.name}
                          </h3>
                          {city.name === "Hoshiarpur" && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold tracking-wide uppercase">
                              ⭐ Featured District
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium">
                          {city.state}
                        </p>
                      </div>

                      {isSelected ? (
                        <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold flex items-center gap-1 shadow-xs">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant font-mono">
                          {city.lat.toFixed(2)}°N, {city.lng.toFixed(2)}°E
                        </span>
                      )}
                    </div>

                    {/* Stats badges */}
                    <div className="flex flex-wrap gap-2 my-3">
                      <div className="px-2.5 py-1 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-[11px] font-semibold text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">local_hospital</span>
                        <span>{city.hospitalsCount} Hospitals</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-[11px] font-semibold text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-error">emergency</span>
                        <span>{city.traumaCenter}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-surface-container-high/50 mt-2">
                    <button
                      onClick={() => selectCity(city.name, { lat: city.lat, lng: city.lng })}
                      className={`flex-1 py-2 px-3 rounded-xl font-label-md font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-secondary text-on-secondary shadow-xs cursor-default"
                          : "bg-primary text-on-primary hover:opacity-95 active:scale-95"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isSelected ? "done" : "touch_app"}
                      </span>
                      <span>{isSelected ? "Current Location" : "Select Location"}</span>
                    </button>

                    <Link
                      href={`/search?city=${encodeURIComponent(city.name)}`}
                      className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-semibold text-xs border border-outline-variant/30 transition-all flex items-center justify-center gap-1"
                    >
                      <span>Hospitals</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCities.length === 0 && (
            <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high mt-6">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-bold text-primary mt-2">No city matched &ldquo;{searchQuery}&rdquo;</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Try searching for Hoshiarpur, Chandigarh, Delhi, Mumbai, or use Auto-Detect GPS.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveRegion("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* National Ambulance Callout Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-error-container/20 border-2 border-error/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-error text-on-error flex items-center justify-center font-bold text-xl shrink-0">
                🚨
              </div>
              <div>
                <h3 className="text-lg font-bold text-error">
                  National Emergency &amp; Ambulance Dispatch
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Regardless of your selected location, dial 108 for free National Ambulance Service or 112 for all-India emergency response.
                </p>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <a
                href="tel:108"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-error text-on-error font-bold text-xs text-center shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>Call 108 Ambulance</span>
              </a>
              <Link
                href="/sos"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-surface-container-lowest text-error font-bold text-xs text-center border border-error/40 hover:bg-error-container/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">emergency</span>
                <span>Live SOS Dispatch</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
