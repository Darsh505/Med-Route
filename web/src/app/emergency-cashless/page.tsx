"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslations } from "next-intl";

export default function EmergencyCashlessPage() {
  const t = useTranslations();
  // Pre-Auth Checker State
  const [policyId, setPolicyId] = useState("STAR-2024-8849-BLR");
  const [selectedHospital, setSelectedHospital] = useState("sakra");
  const [tokenGenerated, setTokenGenerated] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  // SOS Telemetry Modal State
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [targetHospital, setTargetHospital] = useState("Sakra World Hospital");

  const hospitalNames: Record<string, string> = {
    sakra: "Sakra World Hospital, Marathahalli",
    manipal: "Manipal Hospital, Old Airport Road",
    apollo: "Apollo Hospitals, Bannerghatta",
    fortis: "Fortis Hospital, Cunningham Road",
    aster: "Aster CMI Hospital, Hebbal",
  };

  const triggerSOS = (hospName?: string) => {
    if (hospName) setTargetHospital(hospName);
    setSosModalOpen(true);
  };

  return (
    <div className="bg-surface-canvas min-h-screen text-on-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 lg:pt-28 bg-surface-canvas min-h-screen">
        <div className="flex flex-col w-full">
          
          {/* Sub-Header Status Ticker */}
          <section className="w-full bg-surface-card shadow-sm py-space-sm px-margin lg:px-margin-lg border-b border-border-subtle">
            <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
                <Link className="hover:text-primary-container transition-colors" href="/">
                  Home
                </Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-secondary font-bold">{t("emergencyCashless.title")}</span>
              </div>
              <div className="flex items-center gap-space-xs text-badge-cashless font-label-sm text-label-sm bg-surface-ice px-space-sm py-0.5 rounded-full border border-border-subtle">
                <span className="w-2 h-2 rounded-full bg-badge-cashless animate-pulse"></span>
                <span>Live Telemetry Grid Active</span>
              </div>
            </div>
          </section>

          {/* Hero Section with Dual Quick Action Master Cards */}
          <section className="w-full px-margin lg:px-margin-lg py-space-xl relative overflow-hidden bg-surface-canvas">
            <div className="max-w-[1280px] mx-auto flex flex-col gap-space-xl relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                
                {/* Emergency Response Master Card */}
                <div className="bg-primary-container text-on-primary rounded-xl p-space-lg shadow-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="flex flex-col gap-space-md relative z-10">
                    <div>
                      <span className="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider font-bold">
                        Immediate Medical Response
                      </span>
                      <h2 className="font-headline-xl text-headline-xl text-on-primary mt-space-xs font-bold leading-tight">
                        Need an Emergency Ambulance &amp; Bed?
                      </h2>
                      <p className="font-body-md text-body-md text-surface-container mt-space-xs leading-relaxed">
                        ALS/BLS cardiac ambulances routed immediately with real-time GPS telemetry and reserved emergency bed admission.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:gap-space-lg py-space-sm border-y border-surface-container/20 text-center sm:text-left">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-surface-container-high text-xs">Live ICU Beds</span>
                        <span className="font-headline-md text-sm sm:text-headline-md font-bold text-on-primary">118 Available</span>
                      </div>
                      <div className="w-px h-8 bg-surface-container/20"></div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-surface-container-high text-xs">Avg. Dispatch</span>
                        <span className="font-headline-md text-sm sm:text-headline-md font-bold text-secondary-container">12 Mins</span>
                      </div>
                      <div className="w-px h-8 bg-surface-container/20"></div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-surface-container-high text-xs">Deposit</span>
                        <span className="font-headline-md text-sm sm:text-headline-md font-bold text-on-primary">₹0 Upfront</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-space-md flex flex-col sm:flex-row items-center gap-space-sm relative z-10">
                    <a
                      className="w-full sm:w-auto flex-1 bg-error hover:bg-on-tertiary-container text-on-error py-space-sm px-space-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors shadow-sm font-semibold"
                      href="tel:18006334768"
                    >
                      <span className="material-symbols-outlined text-[20px]">call</span>
                      <span>Call 1800-MEDI-ROUTE</span>
                    </a>
                    <button
                      className="w-full sm:w-auto bg-surface-card hover:bg-surface-ice text-primary-container py-space-sm px-space-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors shadow-sm font-bold cursor-pointer"
                      onClick={() => triggerSOS("Apollo Bannerghatta")}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-error text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        emergency_share
                      </span>
                      <span>Request Ambulance</span>
                    </button>
                  </div>
                </div>

                {/* Cashless Hospitalization Master Card */}
                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between">
                  <div className="flex flex-col gap-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">
                        Zero-Deposit Guarantee
                      </span>
                      <h2 className="font-headline-xl text-headline-xl text-primary-container mt-space-xs font-bold leading-tight">
                        Cashless Admission in 20 Minutes
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs leading-relaxed">
                        Pre-authenticate your insurance before arrival. Direct API settlement across Star Health, HDFC ERGO, ICICI Lombard &amp; Care.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-space-sm py-space-xs">
                      <div className="p-space-sm bg-surface-canvas rounded-lg border border-border-subtle">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">TPA Desks Active</span>
                        <div className="font-headline-md font-bold text-secondary mt-0.5">24/7 Priority</div>
                      </div>
                      <div className="p-space-sm bg-surface-canvas rounded-lg border border-border-subtle">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Out-of-Pocket</span>
                        <div className="font-headline-md font-bold text-badge-cashless mt-0.5">₹0 Under Cap</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-space-md">
                    <button
                      type="button"
                      onClick={() => {
                        const target = document.getElementById("checker-tool");
                        if (target) target.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full py-space-sm px-space-md bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary rounded-lg font-label-md text-label-md font-bold transition-colors flex items-center justify-center gap-space-xs shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      <span>Launch Pre-Auth Terminal</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Interactive Pre-Auth Status Tracker & Eligibility Checker */}
          <section className="w-full px-margin lg:px-margin-lg py-space-xl bg-surface-card shadow-sm border-y border-border-subtle" id="checker-tool">
            <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-bold">
                    Self-Service Terminal
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-primary-container font-bold">
                    Pre-Auth Eligibility &amp; Room-Rent Simulator
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Direct API link into ICICI Lombard, Star Health, HDFC ERGO, Medi Assist, Vidal Health &amp; FHPL.
                  </p>
                </div>
                
                <div className="flex items-center gap-space-xs text-badge-cashless font-label-sm text-label-sm bg-surface-ice px-space-sm py-space-xs rounded-full self-start md:self-auto border border-border-subtle">
                  <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                  <span>End-to-End Encrypted TPA Sandbox</span>
                </div>
              </div>

              {/* Stepper Container */}
              <div className="bg-surface-canvas rounded-xl p-space-md lg:p-space-lg shadow-sm border border-border-subtle">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                  
                  {/* Step 1 */}
                  <div className="bg-surface-card p-space-lg rounded-xl flex flex-col justify-between shadow-sm border border-subtle">
                    <div className="flex flex-col gap-space-xs">
                      <span className="font-label-sm text-label-sm text-secondary font-bold">STEP 01</span>
                      <label className="font-title-md text-title-md text-on-surface font-semibold" htmlFor="policyInput">
                        Policy or ABHA ID
                      </label>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                        Auto-queries active dependents and insurer limits.
                      </p>
                      <input
                        className="w-full bg-surface-canvas border border-subtle text-on-surface px-space-md py-space-sm rounded-lg font-body-md text-body-md focus:outline-none focus:bg-surface-card"
                        id="policyInput"
                        placeholder="e.g. 14-digit ABHA / Policy ID"
                        type="text"
                        value={policyId}
                        onChange={(e) => setPolicyId(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mt-space-md">
                      <span className="material-symbols-outlined text-badge-cashless text-[16px]">verified</span>
                      <span>Verified with IRDAI Registry</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-surface-card p-space-lg rounded-xl flex flex-col justify-between shadow-sm border border-subtle">
                    <div className="flex flex-col gap-space-xs">
                      <span className="font-label-sm text-label-sm text-secondary font-bold">STEP 02</span>
                      <label className="font-title-md text-title-md text-on-surface font-semibold" htmlFor="hospitalSelect">
                        Network Hospital
                      </label>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                        Select facility for on-site cashless triage approval.
                      </p>
                      <select
                        className="w-full bg-surface-canvas border border-subtle text-on-surface px-space-md py-space-sm rounded-lg font-body-md text-body-md focus:outline-none focus:bg-surface-card cursor-pointer"
                        id="hospitalSelect"
                        value={selectedHospital}
                        onChange={(e) => setSelectedHospital(e.target.value)}
                      >
                        <option value="sakra">Sakra World Hospital, Marathahalli</option>
                        <option value="manipal">Manipal Hospital, Old Airport Road</option>
                        <option value="apollo">Apollo Hospitals, Bannerghatta</option>
                        <option value="fortis">Fortis Hospital, Cunningham Road</option>
                        <option value="aster">Aster CMI Hospital, Hebbal</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mt-space-md">
                      <span className="material-symbols-outlined text-badge-cashless text-[16px]">shield_with_heart</span>
                      <span>Medi Route Care Desk Available</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-surface-card p-space-lg rounded-xl flex flex-col justify-between shadow-sm border border-subtle">
                    <div className="flex flex-col gap-space-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-secondary font-bold">STEP 03</span>
                        <span className="font-label-sm text-label-sm text-badge-cashless font-semibold">
                          Instant Approval Ready
                        </span>
                      </div>
                      <div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">Eligible Pre-Auth Sum</div>
                        <div className="font-headline-xl text-headline-xl text-primary-container font-bold" id="coverageLimit">
                          ₹10,00,000
                        </div>
                      </div>
                      <div className="bg-surface-canvas rounded-lg p-space-sm flex flex-col gap-space-xs text-body-sm font-body-sm border border-border-subtle">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Room Category:</span>
                          <span className="font-bold text-on-surface" id="roomCapText">
                            Single Private Room
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Upfront Deposit:</span>
                          <span className="font-bold text-secondary">Waived (₹0)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="w-full mt-space-md bg-primary-container hover:bg-primary text-on-primary py-space-sm px-space-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors shadow-sm font-bold cursor-pointer"
                      onClick={() => setTokenGenerated(true)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      <span>Generate Admission Token</span>
                    </button>
                  </div>

                </div>

                {/* Token Modal / Banner */}
                {tokenGenerated && (
                  <div className="mt-space-md bg-surface-ice rounded-lg p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md border border-border-subtle animate-in fade-in duration-200">
                    <div className="flex items-center gap-space-md">
                      <div className="w-10 h-10 rounded-full bg-badge-cashless text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">done</span>
                      </div>
                      <div>
                        <div className="font-title-md text-title-md text-primary-container font-bold">
                          Pre-Auth Guarantee Approved for {hospitalNames[selectedHospital] || "Network Hospital"}
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Token #MR-8829-BLR generated. Present at Reception Desk 4 for immediate cashless admission.
                        </p>
                      </div>
                    </div>
                    
                    <button
                      className="bg-primary-container text-on-primary px-space-md py-space-xs rounded-lg font-label-sm text-label-sm flex items-center gap-space-xs shrink-0 cursor-pointer hover:bg-primary transition-colors font-semibold"
                      type="button"
                      onClick={() => setSmsSent(true)}
                    >
                      <span className="material-symbols-outlined text-[16px]">sms</span>
                      <span>{smsSent ? "Token Sent via SMS!" : "SMS Token to Phone"}</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          </section>

          {/* Visual Workflow: The 20-Minute Pre-Auth Architecture */}
          <section className="w-full px-margin lg:px-margin-lg py-space-xl bg-surface-canvas">
            <div className="max-w-[1280px] mx-auto flex flex-col gap-space-xl">
              <div className="flex flex-col gap-space-xs text-center items-center max-w-2xl mx-auto">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-bold">
                  Surgical-Grade Precision
                </span>
                <h2 className="font-headline-lg text-headline-lg text-primary-container font-bold">
                  How Medi Route Secures Cashless in 20 Minutes
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Standard hospital pre-authorization takes 4 to 8 hours of waiting in the lobby. Here is how our automated gateway eliminates friction.
                </p>
              </div>

              {/* Timeline Bento Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-surface-ice text-secondary font-bold flex items-center justify-center font-label-md text-label-md">
                        1
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">0 - 3 min</span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mt-space-xs font-bold">
                      Digital Intake &amp; ABHA Link
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      OCR instantly parses policy credentials and verifies initial admission dockets without paperwork.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-surface-ice text-secondary font-bold flex items-center justify-center font-label-md text-label-md">
                        2
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">3 - 8 min</span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mt-space-xs font-bold">
                      TPA Direct Gateway Sync
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Automated pre-underwriting validates active coverage, exclusions, and approved room categories.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-surface-ice text-secondary font-bold flex items-center justify-center font-label-md text-label-md">
                        3
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">8 - 15 min</span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mt-space-xs font-bold">
                      Zero-Deposit Guarantee
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Medi Route issues a direct cashless guarantee to hospital billing, waiving upfront cash deposits.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center font-label-md text-label-md">
                        4
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">15 - 20 min</span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mt-space-xs font-bold">
                      Express Room Allotment
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Proceed straight to the inpatient room where your dedicated Care Buddy coordinates bedside care.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Network Emergency Centers: Map & Bangalore Directory */}
          <section className="w-full px-margin lg:px-margin-lg py-space-xl bg-surface-canvas border-t border-border-subtle">
            <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-error uppercase tracking-widest font-bold">
                    Live Hospital Roster
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-primary-container font-bold">
                    Bangalore Emergency Trauma Hubs &amp; Live Bed Grid
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Direct tele-connect to emergency triage charge nurses with verified cashless desks.
                  </p>
                </div>
                
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Region:</span>
                  <span className="bg-surface-card text-on-surface font-label-sm text-label-sm px-space-sm py-space-xs rounded-lg shadow-sm border border-border-subtle font-semibold">
                    Bangalore Metropolitan
                  </span>
                </div>
              </div>

              {/* Map Telemetry Banner */}
              <div className="relative w-full rounded-xl overflow-hidden shadow-md border border-border-subtle">
                <div
                  className="w-full h-80 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=80')",
                  }}
                ></div>
                <div className="absolute top-space-sm left-space-sm bg-surface-card/95 backdrop-blur-md p-space-sm rounded-lg shadow-md flex items-center gap-space-sm max-w-sm border border-border-subtle">
                  <span className="w-3 h-3 rounded-full bg-error animate-pulse shrink-0"></span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium">
                    Showing 24 accredited trauma network centers with live emergency telemetry.
                  </span>
                </div>
              </div>

              {/* Emergency Centers Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                
                {/* Center 1: Manipal */}
                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Manipal Hospital</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Old Airport Road, Kodihalli</p>
                      </div>
                      <span className="bg-surface-ice text-secondary font-label-sm text-label-sm px-space-xs py-0.5 rounded font-bold border border-border-subtle">
                        2.4 km
                      </span>
                    </div>
                    <div className="bg-surface-canvas p-space-sm rounded-lg flex items-center justify-between my-space-xs border border-border-subtle">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">ICU Beds Available</span>
                      <span className="font-title-md text-title-md text-badge-cashless font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-badge-cashless animate-pulse"></span>
                        9 Open
                      </span>
                    </div>
                  </div>
                  <div className="pt-space-md flex items-center gap-space-sm">
                    <a
                      className="flex-1 bg-surface-ice hover:bg-surface-container-high text-secondary py-space-xs px-space-sm rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-space-xs transition-colors border border-border-subtle font-semibold"
                      href="tel:08025024444"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      <span>080-2502-4444</span>
                    </a>
                    <button
                      className="bg-primary-container hover:bg-primary text-on-primary py-space-xs px-space-md rounded-lg font-label-sm text-label-sm flex items-center justify-center transition-colors cursor-pointer font-bold"
                      onClick={() => triggerSOS("Manipal Hospital, Old Airport Rd")}
                      type="button"
                    >
                      Route SOS
                    </button>
                  </div>
                </div>

                {/* Center 2: Apollo */}
                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Apollo Hospitals</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Bannerghatta Main Rd</p>
                      </div>
                      <span className="bg-surface-ice text-secondary font-label-sm text-label-sm px-space-xs py-0.5 rounded font-bold border border-border-subtle">
                        5.1 km
                      </span>
                    </div>
                    <div className="bg-surface-canvas p-space-sm rounded-lg flex items-center justify-between my-space-xs border border-border-subtle">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">ICU Beds Available</span>
                      <span className="font-title-md text-title-md text-badge-cashless font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-badge-cashless animate-pulse"></span>
                        14 Open
                      </span>
                    </div>
                  </div>
                  <div className="pt-space-md flex items-center gap-space-sm">
                    <a
                      className="flex-1 bg-surface-ice hover:bg-surface-container-high text-secondary py-space-xs px-space-sm rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-space-xs transition-colors border border-border-subtle font-semibold"
                      href="tel:08026304050"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      <span>080-2630-4050</span>
                    </a>
                    <button
                      className="bg-primary-container hover:bg-primary text-on-primary py-space-xs px-space-md rounded-lg font-label-sm text-label-sm flex items-center justify-center transition-colors cursor-pointer font-bold"
                      onClick={() => triggerSOS("Apollo Hospitals, Bannerghatta")}
                      type="button"
                    >
                      Route SOS
                    </button>
                  </div>
                </div>

                {/* Center 3: Sakra */}
                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-subtle flex flex-col justify-between">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Sakra World Hospital</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Outer Ring Rd, Marathahalli</p>
                      </div>
                      <span className="bg-surface-ice text-secondary font-label-sm text-label-sm px-space-xs py-0.5 rounded font-bold border border-border-subtle">
                        1.2 km
                      </span>
                    </div>
                    <div className="bg-surface-canvas p-space-sm rounded-lg flex items-center justify-between my-space-xs border border-border-subtle">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">ICU Beds Available</span>
                      <span className="font-title-md text-title-md text-badge-cashless font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-badge-cashless animate-pulse"></span>
                        6 Open
                      </span>
                    </div>
                  </div>
                  <div className="pt-space-md flex items-center gap-space-sm">
                    <a
                      className="flex-1 bg-surface-ice hover:bg-surface-container-high text-secondary py-space-xs px-space-sm rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-space-xs transition-colors border border-border-subtle font-semibold"
                      href="tel:08049694969"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      <span>080-4969-4969</span>
                    </a>
                    <button
                      className="bg-primary-container hover:bg-primary text-on-primary py-space-xs px-space-md rounded-lg font-label-sm text-label-sm flex items-center justify-center transition-colors cursor-pointer font-bold"
                      onClick={() => triggerSOS("Sakra World Hospital, Marathahalli")}
                      type="button"
                    >
                      Route SOS
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* Emergency Dispatch Telemetry Simulation Modal */}
          {sosModalOpen && (
            <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-space-md animate-in fade-in duration-150">
              <div className="bg-surface-card rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-space-lg shadow-2xl flex flex-col gap-space-md border border-border-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs text-error font-bold font-title-md text-title-md">
                    <span className="material-symbols-outlined text-error animate-pulse">crisis_alert</span>
                    <span>Ambulance Dispatched &amp; Bed Reserved</span>
                  </div>
                  <button
                    className="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                    onClick={() => setSosModalOpen(false)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="bg-surface-canvas p-space-md rounded-lg flex flex-col gap-space-xs border border-border-subtle">
                  <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Target Hospital:</span>
                    <span className="font-bold text-on-surface">{targetHospital}</span>
                  </div>
                  <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Assigned Vehicle:</span>
                    <span className="font-bold text-on-surface font-mono">KA-01-MJ-9921 (Cardiac ALS)</span>
                  </div>
                  <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Driver &amp; Paramedic:</span>
                    <span className="font-bold text-on-surface">Suraj P. (+91 98450-XXXXX)</span>
                  </div>
                  <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>ETA at Location:</span>
                    <span className="font-bold text-secondary">8 Mins (Live GPS Tracked)</span>
                  </div>
                  <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Reserved Bed:</span>
                    <span className="font-bold text-badge-cashless">Emergency Bay #3 (Cashless ₹0)</span>
                  </div>
                </div>

                <div className="flex gap-space-sm">
                  <a
                    href="tel:18006334768"
                    className="flex-1 py-space-sm bg-error text-on-error rounded-lg text-center font-label-md font-bold flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                    <span>Call Dispatch Hotline</span>
                  </a>
                  <button
                    className="px-space-md py-space-sm bg-surface-canvas text-on-surface rounded-lg font-label-md font-semibold border border-border-subtle cursor-pointer hover:bg-surface-container"
                    onClick={() => setSosModalOpen(false)}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
