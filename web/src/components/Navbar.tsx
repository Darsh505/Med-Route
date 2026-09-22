"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { selectedCity, isAutoDetected } = useLocation();
  const [compareCount, setCompareCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("medroute_compare_ids");
      if (saved) {
        setCompareCount(JSON.parse(saved).length);
      }
    } catch {}
  }, [pathname]);

  const isSearch = pathname === "/search" || pathname === "/";
  const isCompare = pathname.startsWith("/compare");
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-surface-container-high/40">
      <div className="h-16 w-full max-w-7xl mx-auto px-gutter flex items-center justify-between">
        {/* Brand & Live Indicator */}
        <div className="flex items-center gap-space-lg">
          <Link className="flex items-center gap-space-sm group" href="/">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm group-hover:scale-105 transition-transform">
              🏥
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md tracking-tight text-primary leading-none font-bold">
                MedRoute
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider scale-90 -translate-x-1">
                Telemetry Core
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-space-xs pl-space-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold tracking-wider">
              Live Grid
            </span>
          </div>

          <Link
            href="/location"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-xs font-semibold text-primary transition-all group shadow-xs"
            title="Switch Location (Auto-Selected Every Time)"
          >
            <span className="material-symbols-outlined text-[15px] text-error">location_on</span>
            <span className="font-bold">{selectedCity}</span>
            <span className="text-[9px] text-secondary font-extrabold uppercase bg-secondary-container px-1 py-0.2 rounded-full">
              {isAutoDetected ? "Auto" : "Set"}
            </span>
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant group-hover:translate-y-0.5 transition-transform">expand_more</span>
          </Link>
        </div>

        {/* Center Nav Pills (Desktop) */}
        <nav className="hidden md:flex items-center gap-space-xs p-1 bg-surface-container-low rounded-xl">
          <Link
            href="/search"
            className={`px-space-md py-space-xs font-body-sm text-body-sm transition-colors rounded-lg ${
              isSearch
                ? "bg-surface-container-high text-on-surface font-semibold shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Find Hospitals
          </Link>

          <Link
            href="/compare"
            className={`px-space-md py-space-xs transition-colors flex items-center gap-space-xs rounded-lg font-body-sm text-body-sm ${
              isCompare
                ? "bg-surface-container-high text-on-surface font-semibold shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>Compare Tariffs &amp; ICU</span>
            {compareCount > 0 && (
              <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full font-bold">
                {compareCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right Tools & Telemetry */}
        <div className="flex items-center gap-2 sm:gap-space-md">
          {/* SOS 108 Emergency Button */}
          <Link
            href="/sos"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error text-on-error rounded-lg font-label-md font-bold text-label-md shadow-sm hover:bg-error-container hover:text-on-error-container transition-all"
          >
            <span className="material-symbols-outlined text-[16px] animate-pulse">e911_emergency</span>
            <span>SOS 108</span>
          </Link>

          <div className="hidden lg:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Audited:
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-bold">99.98%</span>
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors border border-surface-container-high"
              >
                <span className="text-xs font-semibold text-primary max-w-[90px] truncate hidden sm:inline">
                  {user.name || user.email.split("@")[0]}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs shadow-xs">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-surface-container-high">
                    <p className="text-xs font-bold text-on-surface">{user.name || "MedRoute User"}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-fixed text-primary font-semibold">
                      {user.role}
                    </span>
                  </div>

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">shield_person</span>
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    href="/compare"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">compare_arrows</span>
                    <span>Saved Comparisons</span>
                  </Link>

                  <button
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-error hover:bg-error-container/20 transition-colors border-t border-surface-container-high mt-1"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold text-xs transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-surface-container-high px-gutter py-4 flex flex-col gap-3 shadow-lg">
          <Link
            href="/location"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low font-label-md font-semibold text-primary border border-surface-container-high"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-base">location_on</span>
              <span className="font-bold">Location: {selectedCity}</span>
            </span>
            <span className="text-xs text-secondary font-bold">Change City →</span>
          </Link>

          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low font-label-md font-semibold text-on-surface"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">search</span>
              <span>Find Hospitals</span>
            </span>
            <span className="text-xs text-outline">Search &amp; Triage →</span>
          </Link>

          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low font-label-md font-semibold text-on-surface"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">compare_arrows</span>
              <span>Compare Tariffs &amp; ICU</span>
            </span>
            {compareCount > 0 && (
              <span className="text-xs bg-secondary text-white px-2 py-0.5 rounded-full font-bold">
                {compareCount}
              </span>
            )}
          </Link>

          <Link
            href="/sos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-error-container text-on-error-container font-label-md font-bold"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-base">emergency</span>
              <span>Emergency SOS 108</span>
            </span>
            <span className="text-xs">Immediate Dispatch →</span>
          </Link>
        </div>
      )}
    </header>
  );
}
