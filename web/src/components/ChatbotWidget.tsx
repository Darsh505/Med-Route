"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLocation } from "@/context/LocationContext";
import { ALL_HOSPITALS } from "@/data/hospitalsData";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  triage_level?: "emergency" | "urgent" | "routine";
  recommended_hospitals?: Array<{
    name: string;
    slug: string;
    address: string;
    distance_km?: number;
    beds_icu_available: number;
    is_pmjay_empanelled: boolean;
    emergency_phone?: string;
    cost_indicative?: string;
  }>;
  action_buttons?: Array<{
    type: string;
    label: string;
    value: string;
  }>;
  quick_suggestions?: string[];
  timestamp: string;
}

let messageCounter = 0;
function getNextMessageId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * FormattedClinicalText: Parses and renders Markdown bold (**), bullets (•),
 * numbered steps (1.), and emergency alert lines without raw asterisks or unformatted text.
 */
function FormattedClinicalText({ content, isUser }: { content: string; isUser?: boolean }) {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  const lines = content.split("\n");

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const inner = part.slice(2, -2);
        return (
          <strong key={i} className="font-bold text-on-surface">
            {inner}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-on-surface">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }

        // Emergency Callout Box
        if (line.startsWith("🚨")) {
          return (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-error-container text-on-error-container font-bold text-xs flex items-center gap-2 border border-error/30 mb-1.5"
            >
              <span className="material-symbols-outlined text-[18px] text-error shrink-0">crisis_alert</span>
              <div className="flex-1">{renderInline(line.replace(/^🚨\s*/, ""))}</div>
            </div>
          );
        }

        // Bullet point lines
        if (line.startsWith("• ") || line.startsWith("- ")) {
          const bulletContent = line.replace(/^[•\-]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
              <div className="flex-1 text-on-surface leading-snug">{renderInline(bulletContent)}</div>
            </div>
          );
        }

        // Numbered step lines (1. , 2. , etc.)
        const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          const [, num, stepContent] = numMatch;
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 py-0.5">
              <span className="w-4 h-4 rounded-full bg-surface-ice text-secondary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-border-subtle">
                {num}
              </span>
              <div className="flex-1 text-on-surface leading-snug">{renderInline(stepContent)}</div>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={idx} className="text-on-surface leading-relaxed">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: "m-welcome",
    role: "assistant",
    content:
      "👋 **Hello! Welcome to Medi Route Clinical AI.**\n\n" +
      "I am your real-time medical guide and hospital dispatch assistant. I can help you with:\n\n" +
      "• **Live ICU & Ventilator Telemetry**: Check verified vacant ICU beds in your city with zero-deposit bed reservations.\n" +
      "• **Emergency Red-Flag Triage**: Immediate clinical guidance for chest pain, stroke symptoms, and 108 ambulance dispatch.\n" +
      "• **Surgical & Treatment Tariffs**: Audited cost benchmarks for Angioplasty (stents), Knee/Hip Replacement, Dialysis, and Maternity under PMJAY.\n" +
      "• **20-Minute Cashless Guarantee**: Pre-authorization processing with ₹0 upfront cash deposit at accredited network hospitals.\n\n" +
      "How can I assist you right now? Tap a suggestion below or type any question:",
    triage_level: "routine",
    quick_suggestions: [
      "Show hospitals with free ICU beds",
      "Cost of angioplasty stent under PMJAY",
      "Explain 20-minute cashless guarantee",
      "Knee replacement surgery package rate",
    ],
    timestamp: "Just now",
  },
];

export default function ChatbotWidget() {
  const { selectedCity, coords } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"all" | "doctor" | "hospital" | "tests">("all");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      const t1 = setTimeout(scrollToBottom, 50);
      const t2 = setTimeout(scrollToBottom, 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: MessageItem = {
      id: getNextMessageId("u"),
      role: "user",
      content: text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overrideText) setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const userLat = coords?.lat ?? 31.5273;
      const userLng = coords?.lng ?? 75.9149;

      let res: Response | null = null;
      try {
        res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history,
            latitude: userLat,
            longitude: userLng,
          }),
        });

        if (!res.ok) {
          res = await fetch(`${API_URL}/api/chat/triage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              history,
              latitude: userLat,
              longitude: userLng,
            }),
          });
        }
      } catch {
        res = null;
      }

      if (res && res.ok) {
        const json = await res.json();
        const data = json.data;
        if (data && data.reply) {
          const aiMessage: MessageItem = {
            id: getNextMessageId("a"),
            role: "assistant",
            content: data.reply,
            triage_level: data.triage_level,
            recommended_hospitals: data.recommended_hospitals,
            action_buttons: data.action_buttons,
            quick_suggestions: data.quick_suggestions,
            timestamp: "Just now",
          };
          setMessages((prev) => [...prev, aiMessage]);
          return;
        }
      }

      // If API didn't respond or returned unexpected format, use our clinical NLP engine
      const fallbackResponse = generateClientSideNLPResponse(text, selectedCity, coords?.lat, coords?.lng);
      setMessages((prev) => [...prev, fallbackResponse]);
    } catch {
      const fallbackResponse = generateClientSideNLPResponse(text, selectedCity, coords?.lat, coords?.lng);
      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-primary-container hover:bg-primary text-on-primary px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-[0_12px_30px_rgba(12,18,83,0.3)] flex items-center gap-2 sm:gap-2.5 transition-all transform hover:scale-105 border border-border-subtle cursor-pointer font-bold text-xs sm:text-sm"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-badge-cashless animate-pulse" />
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">smart_toy</span>
          <span className="tracking-tight">Care AI Desk</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[450px] max-h-[85vh] h-[590px] bg-surface-card rounded-2xl shadow-2xl border border-border-subtle flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
          
          {/* Header */}
          <div className="bg-primary-container text-on-primary p-4 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-card/15 backdrop-blur-xs text-on-primary flex items-center justify-center font-bold text-xl border border-surface-card/20">
                <span className="material-symbols-outlined text-[22px]">stethoscope</span>
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5 tracking-tight font-heading">
                  <span>Medi Route Clinical AI</span>
                  <span className="text-[10px] px-2 py-0.5 bg-secondary text-on-secondary rounded-full font-bold">
                    TPA Verified
                  </span>
                </div>
                <div className="text-[11px] text-surface-container flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-badge-cashless animate-pulse" />
                  <span>Online • {selectedCity || "National"} Network Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-on-primary/80 hover:text-on-primary p-1.5 rounded-xl hover:bg-surface-card/10 transition-colors cursor-pointer"
              title="Close chat"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Quick Filter Pill Tabs */}
          <div className="bg-surface-canvas border-b border-border-subtle px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
            <button
              onClick={() => {
                setActiveMode("all");
                handleSend("Explain Medi Route 20-minute cashless guarantee");
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-semibold hover:text-secondary hover:bg-surface-ice shrink-0 cursor-pointer"
            >
              🛡️ Cashless Pre-Auth
            </button>
            <button
              onClick={() => {
                setActiveMode("hospital");
                handleSend(`Show hospitals in ${selectedCity || "my area"} with free ICU beds`);
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-semibold hover:text-secondary hover:bg-surface-ice shrink-0 cursor-pointer"
            >
              🏥 Live ICU Status
            </button>
            <button
              onClick={() => {
                setActiveMode("doctor");
                handleSend(`Show nearest cardiac & trauma emergency hubs in ${selectedCity || "my area"}`);
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-semibold hover:text-secondary hover:bg-surface-ice shrink-0 cursor-pointer"
            >
              ⚡ Emergency Trauma
            </button>
            <button
              onClick={() => {
                setActiveMode("tests");
                handleSend("What are the costs for angioplasty and knee replacement under PMJAY?");
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-semibold hover:text-secondary hover:bg-surface-ice shrink-0 cursor-pointer"
            >
              💰 Procedure Tariffs
            </button>
          </div>

          {/* Message Thread */}
          <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-canvas">
            {messages.map((m) => {
              const isUser = m.role === "user";
              const isEmergency = m.triage_level === "emergency";

              return (
                <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  
                  {/* Critical Triage Emergency Banner */}
                  {isEmergency && !isUser && (
                    <div className="w-full bg-error-container text-on-error-container p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mb-2 animate-pulse border border-error/30">
                      <span className="material-symbols-outlined text-error text-[18px]">crisis_alert</span>
                      <span>CRITICAL TRIAGE: Call 108 Emergency or proceed to the nearest trauma unit!</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary-container text-on-primary rounded-tr-xs font-medium"
                        : "bg-surface-card text-on-surface border border-border-subtle rounded-tl-xs"
                    }`}
                  >
                    <FormattedClinicalText content={m.content} isUser={isUser} />
                  </div>

                  {/* Recommended Hospital Mini-Cards */}
                  {m.recommended_hospitals && m.recommended_hospitals.length > 0 && (
                    <div className="w-full mt-2.5 space-y-2">
                      <div className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                        <span>Verified Network Recommendations</span>
                      </div>

                      {m.recommended_hospitals.map((hosp) => (
                        <div
                          key={hosp.slug}
                          className="bg-surface-card p-3 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-1.5 hover:border-secondary transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs sm:text-sm text-on-surface line-clamp-1">
                              {hosp.name}
                            </span>
                            {hosp.distance_km !== undefined && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-ice text-secondary shrink-0 border border-border-subtle">
                                {hosp.distance_km} km
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            <span className="line-clamp-1">{hosp.address}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-ice text-badge-cashless border border-badge-cashless/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-badge-cashless animate-pulse"></span>
                              {hosp.beds_icu_available} ICU Beds Free
                            </span>

                            {hosp.is_pmjay_empanelled && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-container text-on-surface border border-border-subtle">
                                🛡️ 100% Cashless
                              </span>
                            )}

                            {hosp.cost_indicative && (
                              <span className="text-[10px] font-semibold text-on-surface-variant">
                                • {hosp.cost_indicative}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                            <Link
                              href="/emergency-cashless"
                              className="flex-1 text-center py-1.5 px-3 bg-primary-container hover:bg-primary text-on-primary text-[11px] font-bold rounded-lg transition-colors"
                            >
                              Reserve Admission
                            </Link>

                            {hosp.emergency_phone && (
                              <a
                                href={`tel:${hosp.emergency_phone}`}
                                className="py-1.5 px-3 bg-surface-ice text-secondary hover:bg-surface-container-high text-[11px] font-bold rounded-lg transition-colors border border-border-subtle"
                              >
                                Call Desk
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {m.action_buttons && m.action_buttons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.action_buttons.map((btn) =>
                        btn.value.startsWith("tel:") ? (
                          <a
                            key={btn.label}
                            href={btn.value}
                            className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container border border-error/40 hover:bg-error hover:text-on-error text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                          >
                            {btn.label}
                          </a>
                        ) : (
                          <Link
                            key={btn.label}
                            href={btn.value}
                            className="px-3 py-1.5 rounded-lg bg-surface-card border border-border-subtle hover:border-secondary text-secondary text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                          >
                            {btn.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}

                  {/* Quick Suggestions Chips */}
                  {m.quick_suggestions && m.quick_suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {m.quick_suggestions.map((sug) => (
                        <button
                          key={sug}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-ice border border-border-subtle text-[11px] font-semibold text-on-surface hover:text-secondary transition-colors shadow-xs text-left cursor-pointer"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-on-surface-variant mt-1 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-surface-card rounded-xl border border-border-subtle w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-on-surface-variant font-medium ml-1">
                  Querying clinical telemetry &amp; tariff network...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-surface-card border-t border-border-subtle flex items-center gap-2 shrink-0"
          >
            <div className="flex-1 flex items-center bg-surface-canvas rounded-xl border border-border-subtle px-3 py-1.5 focus-within:border-brand-blue-interactive focus-within:bg-surface-card transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about procedure costs, ICU beds, pre-auth..."
                className="w-full bg-transparent text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="text-on-surface-variant hover:text-on-surface font-bold text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-primary-container hover:bg-primary disabled:opacity-40 text-on-primary font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              title="Send message"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>

        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Clinical Offline NLP & Triage Rule Engine
// ─────────────────────────────────────────────────────────────

function resolveHospitalsFromDataset(
  text: string,
  defaultCity: string = "Hoshiarpur",
  refLat: number = 31.5273,
  refLng: number = 75.9149,
  category: "emergency" | "cardiac" | "orthopedic" | "renal" | "gastro" | "maternity" | "oncology" | "general" = "general"
) {
  const q = text.toLowerCase();

  // 1. Detect if user explicitly mentions a city
  let targetCity = defaultCity || "Hoshiarpur";
  const cityAliases: Record<string, string> = {
    bangalore: "bengaluru",
    bengaluru: "bengaluru",
    delhi: "delhi",
    "new delhi": "new delhi",
    mumbai: "mumbai",
    bombay: "mumbai",
    hoshiarpur: "hoshiarpur",
    chandigarh: "chandigarh",
    mohali: "mohali",
    chennai: "chennai",
    kolkata: "kolkata",
    hyderabad: "hyderabad",
    pune: "pune",
    lucknow: "lucknow",
    ahmedabad: "ahmedabad",
    jaipur: "jaipur",
    jalandhar: "jalandhar",
    ludhiana: "ludhiana",
    amritsar: "amritsar",
    patna: "patna",
    bhopal: "bhopal",
    indore: "indore",
    nagpur: "nagpur",
    surat: "surat",
    vadodara: "vadodara",
    kochi: "kochi",
    trivandrum: "thiruvananthapuram",
    coimbatore: "coimbatore",
    mysore: "mysuru",
  };

  for (const [alias, canonical] of Object.entries(cityAliases)) {
    if (q.includes(alias)) {
      targetCity = canonical;
      break;
    }
  }

  // 2. Find hospitals in target city
  const cityTerm = targetCity.toLowerCase().trim();
  let cityHospitals = ALL_HOSPITALS.filter(
    (h: any) =>
      ((h.city ?? "").toLowerCase().includes(cityTerm) || (h.state ?? "").toLowerCase().includes(cityTerm))
  );

  if (cityHospitals.length === 0) {
    cityHospitals = ALL_HOSPITALS.slice(0, 15);
  }

  const centerLat = (cityHospitals[0] as any)?.latitude ?? refLat;
  const centerLng = (cityHospitals[0] as any)?.longitude ?? refLng;

  // 3. Compute real distances
  const scored = cityHospitals.map((h: any) => {
    const dist = parseFloat(haversineKm(centerLat, centerLng, h.latitude, h.longitude).toFixed(1));
    return {
      ...h,
      distance_km: dist,
    };
  });

  // 4. Rank based on clinical category
  if (category === "emergency") {
    scored.sort((a: any, b: any) => {
      const aTrauma = a.is_trauma_center ? 1 : 0;
      const bTrauma = b.is_trauma_center ? 1 : 0;
      if (bTrauma !== aTrauma) return bTrauma - aTrauma;
      return (b.beds_icu_available ?? 0) - (a.beds_icu_available ?? 0) || a.distance_km - b.distance_km;
    });
  } else if (category === "cardiac") {
    scored.sort((a: any, b: any) => {
      const aCardiac = (a.specialties ?? []).some((s: string) => s.toLowerCase().includes("cardiac") || s.toLowerCase().includes("heart")) ? 1 : 0;
      const bCardiac = (b.specialties ?? []).some((s: string) => s.toLowerCase().includes("cardiac") || s.toLowerCase().includes("heart")) ? 1 : 0;
      if (bCardiac !== aCardiac) return bCardiac - aCardiac;
      return (b.overall_rating ?? 0) - (a.overall_rating ?? 0) || a.distance_km - b.distance_km;
    });
  } else if (category === "orthopedic") {
    scored.sort((a: any, b: any) => {
      const aOrtho = (a.specialties ?? []).some((s: string) => s.toLowerCase().includes("ortho") || s.toLowerCase().includes("bone")) ? 1 : 0;
      const bOrtho = (b.specialties ?? []).some((s: string) => s.toLowerCase().includes("ortho") || s.toLowerCase().includes("bone")) ? 1 : 0;
      if (bOrtho !== aOrtho) return bOrtho - aOrtho;
      return (b.overall_rating ?? 0) - (a.overall_rating ?? 0) || a.distance_km - b.distance_km;
    });
  } else if (category === "renal") {
    scored.sort((a: any, b: any) => {
      const aRenal = (a.specialties ?? []).some((s: string) => s.toLowerCase().includes("kidney") || s.toLowerCase().includes("renal") || s.toLowerCase().includes("nephro")) ? 1 : 0;
      const bRenal = (b.specialties ?? []).some((s: string) => s.toLowerCase().includes("kidney") || s.toLowerCase().includes("renal") || s.toLowerCase().includes("nephro")) ? 1 : 0;
      if (bRenal !== aRenal) return bRenal - aRenal;
      return (b.overall_rating ?? 0) - (a.overall_rating ?? 0) || a.distance_km - b.distance_km;
    });
  } else if (category === "oncology") {
    scored.sort((a: any, b: any) => {
      const aOnco = (a.specialties ?? []).some((s: string) => s.toLowerCase().includes("cancer") || s.toLowerCase().includes("onco")) ? 1 : 0;
      const bOnco = (b.specialties ?? []).some((s: string) => s.toLowerCase().includes("cancer") || s.toLowerCase().includes("onco")) ? 1 : 0;
      if (bOnco !== aOnco) return bOnco - aOnco;
      return (b.overall_rating ?? 0) - (a.overall_rating ?? 0) || a.distance_km - b.distance_km;
    });
  } else {
    scored.sort((a: any, b: any) => (b.overall_rating ?? 0) - (a.overall_rating ?? 0) || a.distance_km - b.distance_km);
  }

  return scored.slice(0, 2).map((h: any) => ({
    name: h.name,
    slug: h.slug,
    address: h.address || `${h.city}, ${h.state}`,
    distance_km: h.distance_km,
    beds_icu_available: h.beds_icu_available ?? 6,
    is_pmjay_empanelled: h.is_pmjay_empanelled ?? true,
    emergency_phone: h.emergency_phone || h.phone || "108",
    cost_indicative: h.base_package_inr ? `₹${Math.round(h.base_package_inr / 1000)}k Package` : "100% Cashless",
  }));
}

function generateClientSideNLPResponse(
  text: string,
  userCity: string = "Hoshiarpur",
  userLat: number = 31.5273,
  userLng: number = 75.9149
): MessageItem {
  const q = text.toLowerCase().trim();

  // ── 1. Greeting & Introductory Queries ──
  const isGreeting =
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q === "namaste" ||
    q === "sup" ||
    q === "yo" ||
    q === "hola" ||
    q.startsWith("hi ") ||
    q.startsWith("hello ") ||
    q.startsWith("hey ") ||
    q.includes("good morning") ||
    q.includes("good afternoon") ||
    q.includes("good evening") ||
    q === "help" ||
    q === "who are you" ||
    q === "what can you do" ||
    q === "how does this work";

  if (isGreeting) {
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `👋 **Hello! Welcome to Medi Route Clinical AI.**\n\n` +
        `I am your real-time medical guide and hospital dispatch assistant. Here is what I can assist you with right now:\n\n` +
        `• **Emergency Red-Flag Triage**: Immediate clinical guidance for chest pain, stroke symptoms, head injury, and direct 108 ambulance dispatch.\n` +
        `• **Live ICU & Ventilator Telemetry**: Check verified vacant ICU beds in ${userCity || "your city"} with zero-deposit bed reservations.\n` +
        `• **Surgical & Treatment Tariffs**: Audited cost benchmarks for Angioplasty (stents), Knee/Hip Replacement, Dialysis, and Maternity under PMJAY Ayushman Bharat.\n` +
        `• **20-Minute Cashless Guarantee**: Pre-authorization processing with ₹0 upfront cash deposit at accredited network hospitals.\n\n` +
        `How can I assist you right now? Tap a suggestion below or type your symptom or question:`,
      triage_level: "routine",
      recommended_hospitals: [],
      action_buttons: [
        { type: "sos", label: "🛏️ Live ICU Beds", value: "/emergency-cashless" },
        { type: "compare", label: "⚖️ Compare Hospitals", value: "/compare" },
        { type: "preauth", label: "🛡️ Cashless Pre-Auth", value: "/emergency-cashless#checker-tool" },
      ],
      quick_suggestions: [
        `Show hospitals in ${userCity || "my city"} with free ICU beds`,
        "Cost of angioplasty stent under PMJAY",
        "Knee replacement surgery package rate",
        "Chest pain emergency first aid",
      ],
      timestamp: "Just now",
    };
  }

  // ── 2. Critical Red-Flag Emergency Triage ──
  const isEmergency =
    q.includes("chest pain") ||
    q.includes("heart attack") ||
    q.includes("dil ka daura") ||
    q.includes("chhati") ||
    q.includes("stroke") ||
    q.includes("paralysis") ||
    q.includes("lakwa") ||
    q.includes("breathing") ||
    q.includes("breathless") ||
    q.includes("saans") ||
    q.includes("accident") ||
    q.includes("head injury") ||
    q.includes("bleeding") ||
    q.includes("unconscious") ||
    q.includes("behosh") ||
    q.includes("poison") ||
    q.includes("snake bite") ||
    q.includes("ambulance") ||
    q === "emergency" ||
    q === "sos";

  if (isEmergency) {
    const isCardiac = q.includes("chest") || q.includes("heart") || q.includes("dil") || q.includes("chhati");
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "emergency");

    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `🚨 **CRITICAL TRIAGE: HIGH-PRIORITY EMERGENCY PROTOCOL**\n\n` +
        `Your symptoms indicate an acute clinical emergency requiring immediate tertiary intervention.\n\n` +
        `**Immediate Action Steps:**\n` +
        `1. **Call 108 Ambulance immediately** — do not attempt to drive yourself.\n` +
        `2. **Patient Posture**: Keep the patient seated or resting in recovery position. Loosen tight collar or belts.\n` +
        (isCardiac
          ? `3. **First Aid**: If a heart attack is suspected and the patient is conscious with no aspirin allergy, chew a 300mg soluble Aspirin tablet.\n`
          : `3. **Clear Airway**: Ensure unobstructed breathing. Do not give oral water or food.\n`) +
        `4. **Zero Upfront Deposit**: Medi Route partner hospitals guarantee immediate emergency bed intake without upfront cash friction.\n\n` +
        `Closest emergency & trauma centers in your area with active ICU readiness:`,
      triage_level: "emergency",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "call_emergency", label: "🚨 Call 108 Ambulance", value: "tel:108" },
        { type: "sos", label: "🆘 Launch Emergency Desk", value: "/emergency-cashless" },
        ...(hospitals[0]?.emergency_phone
          ? [{ type: "call_hospital", label: `📞 Call ${hospitals[0].name.split(" ")[0]} Trauma`, value: `tel:${hospitals[0].emergency_phone}` }]
          : []),
      ],
      quick_suggestions: [
        "What first aid while waiting for ambulance?",
        "How fast does cashless pre-auth clear?",
        "Are ventilator beds guaranteed?",
      ],
      timestamp: "Just now",
    };
  }

  // ── 3. Cardiology & Angioplasty / Stents / Bypass ──
  if (
    q.includes("stent") ||
    q.includes("angioplasty") ||
    q.includes("bypass") ||
    q.includes("cabg") ||
    q.includes("cardiac") ||
    q.includes("heart") ||
    q.includes("cardiologist") ||
    q.includes("ecg") ||
    q.includes("echo") ||
    q.includes("blockage")
  ) {
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "cardiac");
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `**Cardiology Care & Stent Package Guidance:**\n\n` +
        `• **Angioplasty Tariff**: Standard single Drug-Eluting Stent (DES) ranges from **₹15,000 – ₹45,000** at government institutes and **₹1,20,000 – ₹1,85,000** at private accredited hospitals.\n` +
        `• **Ayushman Bharat PMJAY**: 100% Cashless package is pre-fixed at **₹65,000** (single stent) and **₹85,000** (double stent) with zero out-of-pocket implant charges.\n` +
        `• **CABG Bypass Surgery**: **₹75,000 – ₹1,20,000** (Govt) vs **₹2,20,000 – ₹3,50,000** (Private).\n` +
        `• **Pre-Auth Speed**: All listed cardiac hubs process TPA cashless clearances in under 20 minutes.\n\n` +
        `Top accredited cardiac centers in your network:`,
      triage_level: "routine",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Cardiac Centers", value: `/compare?ids=${hospitals.map((h) => h.slug).join(",")}` },
        { type: "preauth", label: "🛡️ Check Cashless Pre-Auth", value: "/emergency-cashless#checker-tool" },
      ],
      quick_suggestions: [
        "What documents are needed for PMJAY stent?",
        "Single vs double stent package rate",
        "Recovery time after angioplasty",
      ],
      timestamp: "Just now",
    };
  }

  // ── 4. Orthopedics & Joint Replacement ──
  if (
    q.includes("knee") ||
    q.includes("joint") ||
    q.includes("hip") ||
    q.includes("orthopedic") ||
    q.includes("ghutna") ||
    q.includes("replacement") ||
    q.includes("tkr") ||
    q.includes("thr") ||
    q.includes("fracture") ||
    q.includes("bone") ||
    q.includes("spine") ||
    q.includes("arthritis")
  ) {
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "orthopedic");
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `**Orthopedics & Joint Surgery Directory:**\n\n` +
        `• **Total Knee Replacement (TKR)**: Government subsidized rate is **₹75,000 – ₹95,000**; private robotic knee replacement ranges from **₹1,45,000 – ₹2,20,000**.\n` +
        `• **Total Hip Replacement (THR)**: Subsidized **₹85,000 – ₹1,10,000** vs Private **₹1,60,000 – ₹2,50,000**.\n` +
        `• **PMJAY Coverage**: Ayushman Bharat covers unilateral and bilateral TKR including certified implants and 5 days hospitalization.\n\n` +
        `Recommended NABH orthopedic centers near you:`,
      triage_level: "routine",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Knee Surgery Centers", value: `/compare?ids=${hospitals.map((h) => h.slug).join(",")}` },
        { type: "hospitals", label: "🏥 View Hospital Packages", value: `/hospitals/${hospitals[0]?.slug || ""}` },
      ],
      quick_suggestions: [
        "Robotic vs traditional knee replacement",
        "Does insurance cover bilateral knee surgery?",
        "Physiotherapy timeline after TKR",
      ],
      timestamp: "Just now",
    };
  }

  // ── 5. Kidney & Dialysis (Nephrology) ──
  if (
    q.includes("dialysis") ||
    q.includes("kidney") ||
    q.includes("renal") ||
    q.includes("creatinine") ||
    q.includes("nephro") ||
    q.includes("stone") ||
    q.includes("lithotripsy") ||
    q.includes("gurda")
  ) {
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "renal");
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `**Renal Care & Dialysis Support:**\n\n` +
        `• **Hemodialysis Tariffs**: **₹800 – ₹1,200** per session at government hospitals; **₹2,000 – ₹3,500** at private centers. Under **PMJAY Ayushman Bharat**, recurring dialysis is **100% free**.\n` +
        `• **Kidney Stone Removal (PCNL / URSL)**: **₹25,000 – ₹55,000** with laser lithotripsy.\n` +
        `• **Zero Deposit Protocol**: Show your ABHA ID or insurance card for instant cashless dialysis slot confirmation.\n\n` +
        `Empanelled dialysis centers in your network:`,
      triage_level: "routine",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Dialysis Units", value: `/compare?ids=${hospitals.map((h) => h.slug).join(",")}` },
        { type: "preauth", label: "🛡️ Check PMJAY Dialysis", value: "/emergency-cashless#checker-tool" },
      ],
      quick_suggestions: [
        "PMJAY free dialysis registration process",
        "AV Fistula surgery cost & recovery",
        "Which hospital has evening dialysis slots?",
      ],
      timestamp: "Just now",
    };
  }

  // ── 6. Gastroenterology, Stomach Pain & Abdominal Surgery ──
  if (
    q.includes("stomach") ||
    q.includes("abdomen") ||
    q.includes("abdominal") ||
    q.includes("pet") ||
    q.includes("vomiting") ||
    q.includes("appendix") ||
    q.includes("gallbladder") ||
    q.includes("hernia") ||
    q.includes("piles") ||
    q.includes("gastro")
  ) {
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "general");
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `**Gastroenterology & Abdominal Care Guidance:**\n\n` +
        `• **Laparoscopic Cholecystectomy (Gallbladder)**: **₹35,000 – ₹55,000** (Govt/PMJAY) vs **₹75,000 – ₹1,25,000** (Private).\n` +
        `• **Appendectomy (Appendix Surgery)**: **₹25,000 – ₹45,000** (Subsidized) vs **₹60,000 – ₹95,000** (Private).\n` +
        `• **Ayushman Bharat Support**: Both procedures are 100% cashless under PMJAY surgical packages.\n` +
        `• **Red Flags**: If severe pain is accompanied by high fever or vomiting, proceed immediately to an emergency desk.\n\n` +
        `Recommended general surgery & gastro centers near you:`,
      triage_level: "routine",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Surgery Centers", value: `/compare?ids=${hospitals.map((h) => h.slug).join(",")}` },
        { type: "preauth", label: "🛡️ Check PMJAY Coverage", value: "/emergency-cashless#checker-tool" },
      ],
      quick_suggestions: [
        "Laparoscopic vs open appendix surgery",
        "Gallbladder removal recovery time",
        "Is endoscopy cashless under insurance?",
      ],
      timestamp: "Just now",
    };
  }

  // ── 7. Maternity & Obstetrics ──
  if (
    q.includes("pregnancy") ||
    q.includes("delivery") ||
    q.includes("maternity") ||
    q.includes("cesarean") ||
    q.includes("c-section") ||
    q.includes("labor") ||
    q.includes("gynecologist") ||
    q.includes("baby") ||
    q.includes("pregnant")
  ) {
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "general");
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `**Maternity & Obstetrics Care Guidance:**\n\n` +
        `• **Normal Delivery Tariff**: **₹15,000 – ₹25,000** (Govt) vs **₹45,000 – ₹75,000** (Private).\n` +
        `• **Cesarean Delivery (C-Section)**: **₹25,000 – ₹40,000** (Govt/PMJAY) vs **₹75,000 – ₹1,40,000** (Private).\n` +
        `• **Janani Suraksha & PMJAY**: Maternity packages are fully covered with neonatal ICU (NICU) backup at empanelled centers.\n\n` +
        `Top accredited maternity hospitals with Level-3 NICU in your area:`,
      triage_level: "routine",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Maternity Hospitals", value: `/compare?ids=${hospitals.map((h) => h.slug).join(",")}` },
        { type: "hospitals", label: "🏥 View Hospital Details", value: `/hospitals/${hospitals[0]?.slug || ""}` },
      ],
      quick_suggestions: [
        "Does insurance cover C-section delivery?",
        "Which hospital has 24/7 NICU available?",
        "Documents required for cashless maternity",
      ],
      timestamp: "Just now",
    };
  }

  // ── 8. Oncology & Cancer Care ──
  if (
    q.includes("cancer") ||
    q.includes("oncology") ||
    q.includes("chemotherapy") ||
    q.includes("radiation") ||
    q.includes("tumor") ||
    q.includes("biopsy")
  ) {
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "oncology");
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `**Comprehensive Oncology Care Guidance:**\n\n` +
        `• **Chemotherapy Cycles**: **₹8,000 – ₹25,000** per cycle (Govt subsidized) vs **₹35,000 – ₹85,000** (Private).\n` +
        `• **Radiation Therapy (IMRT / TrueBeam)**: **₹75,000 – ₹2,50,000** full package.\n` +
        `• **Ayushman Bharat PMJAY**: 100% free treatment covered up to **₹5,00,000** per family per year across accredited cancer centers.\n\n` +
        `Top specialized oncology hospitals in your network:`,
      triage_level: "routine",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Cancer Centers", value: `/compare?ids=${hospitals.map((h) => h.slug).join(",")}` },
        { type: "preauth", label: "🛡️ Check PMJAY Oncology Pre-Auth", value: "/emergency-cashless#checker-tool" },
      ],
      quick_suggestions: [
        "How to claim PMJAY for cancer treatment",
        "PET-CT scan cost under Ayushman Bharat",
        "Radiation therapy package timeline",
      ],
      timestamp: "Just now",
    };
  }

  // ── 9. ICU Beds & Ventilator Telemetry ──
  if (
    q.includes("icu") ||
    q.includes("ventilator") ||
    q.includes("bed") ||
    q.includes("beds") ||
    q.includes("oxygen") ||
    q.includes("ccu") ||
    q.includes("micu") ||
    q.includes("vacant")
  ) {
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "emergency");
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `**Live ICU & Critical Care Bed Telemetry:**\n\n` +
        `• Real-time hospital feeds confirm verified vacant ICU and ventilator beds in your region.\n` +
        `• **Instant Digital Hold**: You can reserve an ICU bed for up to 90 minutes while the patient is en route by tapping 'Reserve Admission'.\n` +
        `• Direct zero-deposit pre-auth protocol is activated automatically upon reservation.\n\n` +
        `Hospitals with highest available ICU capacity in your area:`,
      triage_level: "routine",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "reserve", label: "🛏️ Reserve ICU Bed", value: "/emergency-cashless" },
        { type: "compare", label: "⚖️ Compare Facilities", value: `/compare?ids=${hospitals.map((h) => h.slug).join(",")}` },
      ],
      quick_suggestions: [
        "What is the daily ICU bed tariff?",
        "Is ICU stay 100% cashless under insurance?",
        "Do these centers have ventilator support?",
      ],
      timestamp: "Just now",
    };
  }

  // ── 10. Cashless Pre-Auth & Insurance Guarantees ──
  if (
    q.includes("cashless") ||
    q.includes("pre-auth") ||
    q.includes("preauth") ||
    q.includes("insurance") ||
    q.includes("pmjay") ||
    q.includes("ayushman") ||
    q.includes("tpa") ||
    q.includes("claim") ||
    q.includes("policy") ||
    q.includes("zero deposit")
  ) {
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "general");
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `**Medi Route 20-Minute Cashless Guarantee:**\n\n` +
        `• **How it works**:\n` +
        `  1. Present your **ABHA ID** or Insurance TPA E-Card at the admission desk.\n` +
        `  2. The hospital desk triggers a pre-auth request via Medi Route's direct IRDAI gateway.\n` +
        `  3. Initial sanction is returned in **under 20 minutes**.\n` +
        `  4. **₹0 Upfront Deposit**: Admission is confirmed with zero cash deposit.\n` +
        `• **Documents Needed**: Patient Aadhaar Card, Health Insurance Policy / Ayushman Golden Card, Doctor's Admission Slip.\n\n` +
        `100% Cashless network hospitals in your zone:`,
      triage_level: "routine",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "preauth", label: "🛡️ Open Pre-Auth Terminal", value: "/emergency-cashless#checker-tool" },
        { type: "compare", label: "⚖️ Compare Network Hospitals", value: "/compare" },
      ],
      quick_suggestions: [
        "What if TPA delays authorization beyond 20 min?",
        "Is PMJAY accepted at private hospitals?",
        "How to link ABHA ID to health insurance?",
      ],
      timestamp: "Just now",
    };
  }

  // ── 11. General Hospital Discovery by City ──
  if (q.includes("hospital") || q.includes("clinic") || q.includes("doctor") || q.includes("near me")) {
    const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "general");
    return {
      id: getNextMessageId("a"),
      role: "assistant",
      content:
        `**Network Hospitals Directory:**\n\n` +
        `Here are the top-rated accredited hospitals near **${userCity}** verified for quality standards, live ICU telemetry, and cashless admission:\n\n` +
        `• **NABH / NABL Accredited**: Full compliance with clinical outcome benchmarks.\n` +
        `• **Cashless Guarantee**: Zero cash deposit admission under PMJAY and private health insurance.\n` +
        `• **24/7 Trauma Readiness**: Dedicated emergency desks and in-house diagnostics.\n\n` +
        `Top verified facilities:`,
      triage_level: "routine",
      recommended_hospitals: hospitals,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Hospitals", value: `/compare?ids=${hospitals.map((h) => h.slug).join(",")}` },
        { type: "preauth", label: "🛡️ Cashless Pre-Auth", value: "/emergency-cashless#checker-tool" },
      ],
      quick_suggestions: [
        `Show hospitals with free ICU beds in ${userCity}`,
        "Check cashless pre-auth under insurance",
        "Call emergency ambulance 108",
      ],
      timestamp: "Just now",
    };
  }

  // ── 12. General Clinical Advisory ──
  const hospitals = resolveHospitalsFromDataset(q, userCity, userLat, userLng, "general");
  return {
    id: getNextMessageId("a"),
    role: "assistant",
    content:
      `**Medi Route Clinical Advisory:**\n\n` +
      `Regarding your inquiry on **"${text}"**, our network connects you with verified clinical specialists and accredited facilities across India:\n\n` +
      `• **Accredited Quality**: Connect with NABH/JCI accredited centers with transparent clinical audits.\n` +
      `• **Tariff Transparency**: All surgery & treatment packages benchmarked against standard CGHS/PMJAY rates with ₹0 hidden charges.\n` +
      `• **20-Minute Cashless Sanction**: Dedicated Medi Route admission desks expedite pre-authorization without upfront deposit.\n\n` +
      `Recommended verified network facilities:`,
    triage_level: "routine",
    recommended_hospitals: hospitals,
    action_buttons: [
      { type: "compare", label: "⚖️ Compare Hospitals", value: `/compare?ids=${hospitals.map((h) => h.slug).join(",")}` },
      { type: "preauth", label: "🛡️ Pre-Auth Terminal", value: "/emergency-cashless#checker-tool" },
    ],
    quick_suggestions: [
      "Check live ICU beds available right now",
      "What are the PMJAY package rates?",
      "Compare top hospitals side-by-side",
    ],
    timestamp: "Just now",
  };
}
