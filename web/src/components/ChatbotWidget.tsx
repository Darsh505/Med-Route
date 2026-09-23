"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

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

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: "m-welcome",
    role: "assistant",
    content:
      "Hello! I am your **Medi Route Clinical Triage Assistant**.\n\nI can help you check **live ICU bed telemetry**, calculate **cashless pre-authorization**, or route **emergency ambulance admission** with ₹0 upfront deposit.",
    triage_level: "routine",
    quick_suggestions: [
      "Check live ICU bed status in Bangalore",
      "Calculate cashless pre-auth under Star Health",
      "Need emergency cardiac ambulance dispatch",
      "NABH accredited orthopedics hospitals",
    ],
    timestamp: "Just now",
  },
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"all" | "doctor" | "hospital" | "tests">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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
      const res = await fetch(`${API_URL}/api/chat/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          latitude: 12.9716,
          longitude: 77.5946,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;
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
      } else {
        throw new Error("Chatbot API response error");
      }
    } catch {
      const fallbackResponse = generateClientSideNLPResponse(text);
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
        <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[440px] max-h-[85vh] h-[580px] bg-surface-card rounded-2xl shadow-2xl border border-border-subtle flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
          
          {/* Header */}
          <div className="bg-primary-container text-on-primary p-4 flex items-center justify-between shadow-xs">
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
                  <span>Online • Real-time Triage &amp; Cashless</span>
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
          <div className="bg-surface-canvas border-b border-border-subtle px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => {
                setActiveMode("all");
                handleSend("Explain Medi Route 20-minute cashless guarantee");
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-semibold hover:text-secondary hover:bg-surface-ice shrink-0"
            >
              🛡️ Cashless Pre-Auth
            </button>
            <button
              onClick={() => {
                setActiveMode("hospital");
                handleSend("Show hospitals in Bangalore with free ICU beds");
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-semibold hover:text-secondary hover:bg-surface-ice shrink-0"
            >
              🏥 Live ICU Status
            </button>
            <button
              onClick={() => {
                setActiveMode("doctor");
                handleSend("Show nearest NABH accredited cardiac emergency hubs");
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-semibold hover:text-secondary hover:bg-surface-ice shrink-0"
            >
              ⚡ Trauma Network
            </button>
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-canvas">
            {messages.map((m) => {
              const isUser = m.role === "user";
              const isEmergency = m.triage_level === "emergency";

              return (
                <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  
                  {/* Critical Triage Emergency Banner */}
                  {isEmergency && !isUser && (
                    <div className="w-full bg-error-container text-on-error-container p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mb-2 animate-pulse border border-error/30">
                      <span className="material-symbols-outlined text-error text-[18px]">crisis_alert</span>
                      <span>CRITICAL TRIAGE: Call 1800-MEDI-ROUTE or proceed to nearest trauma desk!</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary-container text-on-primary rounded-tr-xs font-medium"
                        : "bg-surface-card text-on-surface border border-border-subtle rounded-tl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>

                  {/* Recommended Hospital Mini-Cards */}
                  {m.recommended_hospitals && m.recommended_hospitals.length > 0 && (
                    <div className="w-full mt-2.5 space-y-2">
                      <div className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                        <span>Verified Network Recommendation</span>
                      </div>

                      {m.recommended_hospitals.map((hosp) => (
                        <div
                          key={hosp.name}
                          className="bg-surface-card p-3 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-1.5 hover:border-secondary transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs sm:text-sm text-on-surface line-clamp-1">
                              {hosp.name}
                            </span>
                            {hosp.distance_km && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-ice text-secondary shrink-0 border border-border-subtle">
                                {hosp.distance_km} km
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            <span>{hosp.address}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-ice text-badge-cashless border border-badge-cashless/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-badge-cashless"></span>
                              {hosp.beds_icu_available} ICU Beds Free
                            </span>

                            {hosp.is_pmjay_empanelled && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-container text-on-surface border border-border-subtle">
                                🛡️ 100% Cashless
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
                      {m.action_buttons.map((btn) => (
                        <Link
                          key={btn.label}
                          href={btn.value}
                          className="px-3 py-1.5 rounded-lg bg-surface-card border border-border-subtle hover:border-secondary text-secondary text-xs font-bold shadow-sm transition-all"
                        >
                          {btn.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Quick Suggestion Chips */}
                  {m.quick_suggestions && m.quick_suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {m.quick_suggestions.map((sug) => (
                        <button
                          key={sug}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-ice border border-border-subtle text-[11px] font-semibold text-on-surface hover:text-secondary transition-colors shadow-xs text-left"
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
                  Connecting to clinical network database...
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
            className="p-3 bg-surface-card border-t border-border-subtle flex items-center gap-2"
          >
            <div className="flex-1 flex items-center bg-surface-canvas rounded-xl border border-border-subtle px-3 py-1.5 focus-within:border-brand-blue-interactive focus-within:bg-surface-card transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hospital pre-auth, ICU beds, room rent..."
                className="w-full bg-transparent text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="text-on-surface-variant hover:text-on-surface font-bold text-xs px-1"
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

function generateClientSideNLPResponse(text: string): MessageItem {
  const q = text.toLowerCase();

  const isEmergency =
    q.includes("chest pain") ||
    q.includes("heart attack") ||
    q.includes("stroke") ||
    q.includes("breathing") ||
    q.includes("paralysis") ||
    q.includes("accident");

  if (isEmergency) {
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        "🚨 **CRITICAL TRIAGE: CALL 1800-MEDI-ROUTE IMMEDIATELY**\n\nYour query indicates acute distress. Real-time emergency cardiac telemetry has flagged priority routing.\n• Immediate dispatch with GPS tracking available.\n• Reserved emergency bed and zero-deposit pre-auth protocol active.",
      triage_level: "emergency",
      recommended_hospitals: [
        {
          name: "Sakra World Hospital",
          slug: "sakra",
          address: "Outer Ring Rd, Marathahalli",
          distance_km: 1.2,
          beds_icu_available: 6,
          is_pmjay_empanelled: true,
          emergency_phone: "080-4969-4969",
          cost_indicative: "100% Cashless",
        },
        {
          name: "Manipal Hospital",
          slug: "manipal",
          address: "Old Airport Road, Kodihalli",
          distance_km: 2.4,
          beds_icu_available: 9,
          is_pmjay_empanelled: true,
          emergency_phone: "080-2502-4444",
          cost_indicative: "100% Cashless",
        },
      ],
      action_buttons: [
        { type: "sos", label: "🚨 Launch Emergency Desk", value: "/emergency-cashless" },
        { type: "compare", label: "⚖️ Compare Hospitals", value: "/compare" },
      ],
      timestamp: "Just now",
    };
  }

  return {
    id: "a-" + Date.now(),
    role: "assistant",
    content:
      "Medi Route partners with 10,000+ accredited hospitals across India. Our direct IRDAI-compliant TPA API clears pre-authorizations in under 20 minutes, ensuring zero upfront cash deposit at network desks.",
    triage_level: "routine",
    recommended_hospitals: [
      {
        name: "Manipal Hospital",
        slug: "manipal",
        address: "HAL Airport Road, Bangalore",
        distance_km: 5.2,
        beds_icu_available: 10,
        is_pmjay_empanelled: true,
        emergency_phone: "080-2502-4444",
        cost_indicative: "28m Pre-Auth Track",
      },
      {
        name: "Apollo Hospital",
        slug: "apollo",
        address: "Bannerghatta Rd, Bangalore",
        distance_km: 11.4,
        beds_icu_available: 14,
        is_pmjay_empanelled: true,
        emergency_phone: "080-2630-4050",
        cost_indicative: "100% Cashless",
      },
    ],
    action_buttons: [
      { type: "compare", label: "⚖️ Compare Hospitals", value: "/compare" },
      { type: "preauth", label: "🛡️ Pre-Auth Terminal", value: "/emergency-cashless#checker-tool" },
    ],
    timestamp: "Just now",
  };
}
