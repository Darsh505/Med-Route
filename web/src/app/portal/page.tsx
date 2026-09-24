"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PortalPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.email?.toLowerCase().includes("admin");

  return (
    <div className="min-h-screen bg-surface-canvas text-on-surface flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-margin lg:px-margin-lg pt-24 pb-16 flex flex-col gap-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">{t("portal.dashboardTitle")}</span>
          </nav>

          <span className="text-[11px] font-mono uppercase tracking-wider bg-surface-ice text-secondary px-2.5 py-0.5 rounded-full border border-border-subtle">
            {t("portal.abhaConnected")}
          </span>
        </div>

        {/* Admin Callout Card (if admin or demo) */}
        <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest font-mono text-cyan-400 block font-semibold">
                Administrative Operations Node
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">{t("portal.telemetryNode")}</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                {t("portal.telemetryDesc")}
              </p>
            </div>
          </div>

          <a
            href={process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin-med-route.vercel.app/"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white text-black hover:bg-slate-200 text-xs font-bold rounded-xl transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Launch Admin Portal</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>

        {/* Citizen Profile & Health Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: ABHA Health Identity */}
          <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-primary tracking-wide uppercase">Ayushman Bharat ID</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Verified
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface">ABHA Digital Health Locker</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Linked to National Health Authority (NHA) health data exchange. Enables instant cashless hospitalization approvals.
              </p>

              <div className="mt-4 p-3 bg-surface-ice rounded-xl border border-border-subtle font-mono text-xs">
                <span className="text-[10px] text-on-surface-variant block uppercase">ABHA Address</span>
                <span className="text-primary font-bold text-sm">91-4829-1029-4820@abdm</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Insurance Status:</span>
              <span className="font-bold text-secondary">PMJAY Active (₹5 Lakh Cover)</span>
            </div>
          </div>

          {/* Card 2: Cashless Pre-Authorizations */}
          <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-secondary tracking-wide uppercase">Claims Telemetry</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  20-Min SLA
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface">Cashless Admission Tracker</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Real-time tracking of institutional hospital TPA pre-authorization desks across Tricity and regional network hospitals.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-canvas border border-border-subtle flex items-center justify-between">
                  <span className="font-medium text-on-surface truncate">PGIMER Chandigarh</span>
                  <span className="text-[11px] font-bold text-emerald-600">Zero-Deposit Active</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-canvas border border-border-subtle flex items-center justify-between">
                  <span className="font-medium text-on-surface truncate">Max Super Speciality Mohali</span>
                  <span className="text-[11px] font-bold text-emerald-600">Empanelled</span>
                </div>
              </div>
            </div>

            <Link
              href="/emergency-cashless"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Emergency Cashless Routing</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>

          {/* Card 3: Monitored Hospitals & Radar */}
          <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-on-surface-variant tracking-wide uppercase">Hospital Discovery</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container font-mono text-on-surface">
                  1,451 Registry
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface">Regional Clinical Radar</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Filter by verified procedure costs, clinical success rates, and live critical care ICU availability.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/search"
                  className="w-full py-2 px-3 rounded-xl bg-primary text-on-primary text-xs font-bold text-center hover:opacity-90 transition-opacity"
                >
                  Open AI Radar Search
                </Link>
                <Link
                  href="/compare"
                  className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold text-center transition-colors border border-border-subtle"
                >
                  Side-by-Side Compare Matrix
                </Link>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle text-[11px] text-on-surface-variant text-center">
              Emergency Helpline: <a href="tel:18006334768" className="font-bold text-primary hover:underline">1800-MEDI-ROUTE</a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
