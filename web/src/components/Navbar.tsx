"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useTranslations, useLocale } from "next-intl";
import { localizeCity } from "@/i18n/hospitalLocalization";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MedRouteLogo from "@/components/MedRouteLogo";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { selectedCity } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const t = useTranslations();
  const locale = useLocale();

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
            <MedRouteLogo size="sm" clickable={true} />

            {/* City Selector Pill */}
            <Link
              href="/location"
              className="hidden md:flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-ice border border-border-subtle hover:border-secondary/40 text-secondary transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {localizeCity(selectedCity || "Chandigarh / Tricity", locale)}
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">keyboard_arrow_down</span>
            </Link>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-space-sm lg:gap-space-md">
            
            {/* 24x7 Emergency Phone CTA */}
            <div className="hidden lg:flex items-center gap-space-xs text-secondary">
              <span className="material-symbols-outlined text-[20px] text-secondary">phone_in_talk</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">{t("navbar.emergency24x7")}</span>
                <a
                  href="tel:18006334768"
                  className="font-label-md text-label-md text-on-surface font-bold leading-tight hover:text-secondary transition-colors"
                >
                  1800-633-4768
                </a>
              </div>
            </div>

            {/* ABHA Badge Trigger */}
            <Link
              href="/emergency-cashless#checker-tool"
              className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container text-secondary font-label-sm text-label-sm hover:bg-secondary-container transition-colors min-w-fit"
            >
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>{t("navbar.abhaId")}</span>
            </Link>

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Auth State / Login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-canvas transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  <span className="font-semibold">{user.email?.split("@")[0] || "User"}</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-surface-card rounded-xl shadow-lg border border-border-subtle z-50">
                    <Link
                      href="/portal"
                      className="block px-4 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-ice"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      {t("navbar.medicalRecords")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 font-label-md text-label-md text-error hover:bg-error/10"
                    >
                      {t("navbar.signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-sm font-bold min-w-fit"
              >
                {t("navbar.loginSignUp")}
              </Link>
            )}

            {/* Profile Avatar Circle */}
            <Link
              href={user ? "/portal" : "/auth/login"}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity"
              title={t("navbar.profile")}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-on-surface hover:bg-surface-canvas"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t("navbar.toggleNavigation")}
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Row 2: Centered Sub-Nav Bar */}
        <div className="hidden lg:flex items-center justify-center bg-surface-card border-t border-border-subtle/40 py-2.5">
          <nav className="flex flex-wrap items-center justify-center gap-space-sm max-w-[1280px] w-full px-margin">
            <Link
              href="/"
              className={`px-space-md py-1.5 transition-all text-title-md rounded-lg min-w-fit ${
                pathname === "/"
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "font-semibold text-on-surface hover:text-primary-container hover:bg-surface-container"
              }`}
            >
              {t("navbar.home")}
            </Link>

            <Link
              href="/search"
              className={`px-space-md py-1.5 transition-all text-title-md rounded-lg flex items-center gap-1.5 min-w-fit ${
                pathname === "/search"
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "font-semibold text-on-surface hover:text-primary-container hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>{t("navbar.radarSearch")}</span>
            </Link>

            <Link
              href="/compare"
              className={`px-space-md py-1.5 transition-all text-title-md rounded-lg min-w-fit ${
                isCompare
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "font-semibold text-on-surface hover:text-primary-container hover:bg-surface-container"
              }`}
            >
              {t("navbar.compareMatrix")}
            </Link>

            <Link
              href="/emergency-cashless"
              className={`px-space-md py-1.5 transition-all text-title-md rounded-lg min-w-fit ${
                isEmergency
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "font-semibold text-on-surface hover:text-primary-container hover:bg-surface-container"
              }`}
            >
              {t("navbar.emergencyCashless")}
            </Link>

            <Link
              href="/portal/admin"
              className="px-space-md py-1.5 transition-all text-title-md rounded-lg font-semibold text-on-surface-variant hover:text-secondary hover:bg-surface-container flex items-center gap-1 min-w-fit"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>{t("navbar.adminPortal")}</span>
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
              <span>{localizeCity(selectedCity || "Chandigarh / Tricity", locale)}</span>
            </span>
            <span className="text-xs text-on-surface-variant font-bold">{t("navbar.change")}</span>
          </Link>

          <Link
            href="/"
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md ${
              pathname === "/" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface font-semibold"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("navbar.home")}
          </Link>

          <Link
            href="/search"
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md flex items-center gap-1.5 ${
              pathname === "/search" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface font-semibold"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>{t("navbar.radarSearch")}</span>
          </Link>

          <Link
            href="/compare"
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md ${
              isCompare ? "bg-primary-container text-on-primary font-bold" : "text-on-surface font-semibold"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("navbar.compareMatrix")}
          </Link>

          <Link
            href="/emergency-cashless"
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md ${
              isEmergency ? "bg-primary-container text-on-primary font-bold" : "text-on-surface font-semibold"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("navbar.emergencyCashlessAdmission")}
          </Link>

          <Link
            href="/portal/admin"
            className="px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant font-semibold flex items-center gap-1.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            <span>{t("navbar.adminTelemetryPortal")}</span>
          </Link>

          {/* Mobile Language Switcher */}
          <div className="px-space-md py-space-xs">
            <LanguageSwitcher />
          </div>

          <div className="pt-space-xs border-t border-border-subtle flex flex-col gap-space-xs">
            <a
              href="tel:18006334768"
              className="flex items-center justify-center gap-2 py-space-sm bg-error text-on-error rounded-lg font-label-md font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
              <span>{t("navbar.callEmergency")}</span>
            </a>
            {!user && (
              <Link
                href="/auth/login"
                className="flex items-center justify-center py-space-sm bg-primary-container text-on-primary rounded-lg font-label-md font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("navbar.loginSignUp")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
