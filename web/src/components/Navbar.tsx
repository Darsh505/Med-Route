"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [compareCount, setCompareCount] = useState(2);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("medroute_compare_ids");
      if (saved) {
        setCompareCount(JSON.parse(saved).length);
      }
    } catch {}
  }, []);

  const isSearch = pathname === "/search" || pathname === "/";
  const isCompare = pathname.startsWith("/compare");
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-surface-container-high/40">
      <div className="h-16 w-full max-w-7xl mx-auto px-gutter flex items-center justify-between">
        {/* Brand & Live Indicator */}
        <div className="flex items-center gap-space-lg">
          <Link className="flex items-center gap-space-sm group" href="/">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
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
              Live Regional Grid
            </span>
          </div>
        </div>

        {/* Center Nav Pills */}
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
            <span>Compare</span>
            <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full font-bold">
              {compareCount}
            </span>
          </Link>

          <Link
            href="/admin"
            className={`px-space-md py-space-xs font-body-sm text-body-sm transition-colors rounded-lg ${
              isAdmin
                ? "bg-surface-container-high text-on-surface font-semibold shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Admin Portal
          </Link>
        </nav>

        {/* Right Tools & Telemetry */}
        <div className="flex items-center gap-space-md">
          <Link
            href="/sos"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-error text-on-error rounded-lg font-label-md font-bold text-label-md shadow-sm hover:bg-error-container hover:text-on-error-container transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">e911_emergency</span>
            <span>SOS 108</span>
          </Link>

          <div className="hidden lg:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Audited Telemetry:
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-bold">99.98%</span>
          </div>

          <Link
            href="/auth/login"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm text-on-primary hover:bg-primary-container transition-colors"
            title="Account"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
