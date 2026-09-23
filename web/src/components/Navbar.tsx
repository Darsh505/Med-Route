"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { selectedCity } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isFind = pathname === "/" || pathname === "/search";
  const isCompare = pathname.startsWith("/compare");
  const isEmergency = pathname.startsWith("/emergency-cashless") || pathname.startsWith("/sos");
  const isDoctors = pathname.includes("doctors");

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface-card/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-margin lg:px-margin-lg flex flex-col">
        
        {/* Row 1: Brand, City, 24x7 Emergency, Login, Profile */}
        <div className="h-16 flex items-center justify-between gap-space-md">
          
          {/* Brand & City Selector */}
          <div className="flex items-center gap-space-lg shrink-0">
            <Link href="/" className="flex items-center gap-space-sm group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                  <rect x="11" y="2" width="10" height="28" rx="4" fill="#0C1253" />
                  <rect x="2" y="11" width="28" height="10" rx="4" fill="#006781" />
                  <circle cx="16" cy="16" r="4" fill="#8FDFFF" />
                </svg>
              </div>
              <span className="font-headline-md text-headline-md text-primary-container tracking-tight font-bold">
                Medi Route
              </span>
            </Link>

            <Link
              href="/location"
              className="hidden sm:flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-ice rounded-lg text-secondary cursor-pointer hover:bg-surface-container-high transition-colors border border-border-subtle"
              title="Select city or locality"
            >
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {selectedCity || "Bangalore, KA"}
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">keyboard_arrow_down</span>
            </Link>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-space-md shrink-0">
            {/* 24x7 Emergency Hotline */}
            <div className="hidden lg:flex items-center gap-space-xs text-secondary">
              <span className="material-symbols-outlined text-[20px] text-secondary">phone_in_talk</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">24x7 Emergency</span>
                <a
                  href="tel:18006334768"
                  className="font-label-md text-label-md text-on-surface font-bold leading-tight hover:text-secondary transition-colors"
                >
                  1800-MEDI-ROUTE
                </a>
              </div>
            </div>

            {/* ABHA Badge Trigger */}
            <Link
              href="/emergency-cashless#checker-tool"
              className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container text-secondary font-label-sm text-label-sm hover:bg-secondary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>ABHA ID</span>
            </Link>

            {/* Auth State / Login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-canvas border border-border-subtle"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline font-label-md text-label-md text-on-surface font-semibold max-w-[100px] truncate">
                    {user.name || "User"}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-card rounded-xl shadow-lg border border-border-subtle py-2 z-50">
                    <div className="px-4 py-2 border-b border-border-subtle">
                      <p className="font-label-md text-label-md text-on-surface font-bold truncate">{user.name}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/portal"
                      className="block px-4 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-ice"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Medical Records
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 font-label-md text-label-md text-error hover:bg-error/10"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-sm font-bold"
              >
                Login / Sign Up
              </Link>
            )}

            {/* Profile Avatar Circle */}
            <Link
              href={user ? "/portal" : "/auth/login"}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity"
              title="Profile"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-on-surface hover:bg-surface-canvas"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Row 2: Centered Sub-Nav Bar (Exact match to PNG) */}
        <div className="hidden lg:flex items-center justify-center bg-surface-card border-t border-border-subtle/40 py-2.5">
          <nav className="flex items-center justify-center gap-space-sm max-w-[1280px] w-full px-margin">
            <Link
              href="/"
              className={`px-space-md py-1.5 transition-all text-title-md rounded-lg ${
                isFind
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "font-semibold text-on-surface hover:text-primary-container hover:bg-surface-container"
              }`}
            >
              Find Hospitals
            </Link>

            <Link
              href="/compare"
              className={`px-space-md py-1.5 transition-all text-title-md rounded-lg ${
                isCompare
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "font-semibold text-on-surface hover:text-primary-container hover:bg-surface-container"
              }`}
            >
              Compare Hospitals
            </Link>

            <Link
              href="/emergency-cashless"
              className={`px-space-md py-1.5 transition-all text-title-md rounded-lg ${
                isEmergency
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "font-semibold text-on-surface hover:text-primary-container hover:bg-surface-container"
              }`}
            >
              Emergency &amp; Cashless
            </Link>

            <Link
              href="/#specialty-hub"
              className={`px-space-md py-1.5 transition-all text-title-md rounded-lg ${
                isDoctors
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "font-semibold text-on-surface hover:text-primary-container hover:bg-surface-container"
              }`}
            >
              Doctors &amp; Specialists
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-subtle bg-surface-card px-margin py-space-md flex flex-col gap-space-sm shadow-xl">
          <Link
            href="/location"
            className="flex items-center justify-between p-space-sm rounded-lg bg-surface-ice text-secondary font-label-md"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span>{selectedCity || "Bangalore, KA"}</span>
            </span>
            <span className="text-xs text-on-surface-variant font-bold">Change</span>
          </Link>

          <Link
            href="/"
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md ${
              isFind ? "bg-primary-container text-on-primary font-bold" : "text-on-surface font-semibold"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Hospitals
          </Link>

          <Link
            href="/compare"
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md ${
              isCompare ? "bg-primary-container text-on-primary font-bold" : "text-on-surface font-semibold"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Compare Hospitals
          </Link>

          <Link
            href="/emergency-cashless"
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md ${
              isEmergency ? "bg-primary-container text-on-primary font-bold" : "text-on-surface font-semibold"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Emergency &amp; Cashless Admission
          </Link>

          <div className="pt-space-xs border-t border-border-subtle flex flex-col gap-space-xs">
            <a
              href="tel:18006334768"
              className="flex items-center justify-center gap-2 py-space-sm bg-error text-on-error rounded-lg font-label-md font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
              <span>Call 1800-MEDI-ROUTE</span>
            </a>
            {!user && (
              <Link
                href="/auth/login"
                className="flex items-center justify-center py-space-sm bg-primary-container text-on-primary rounded-lg font-label-md font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
