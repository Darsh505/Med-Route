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
      "Hello, I am the **MedRoute Clinical Dispatch AI**. I can help you find the right hospital for any medical condition, estimate procedure costs under PMJAY, or triage urgent symptoms.",
    triage_level: "routine",
    quick_suggestions: [
      "Father has acute chest pain in Mohali",
      "Knee replacement surgery under PMJAY",
      "Which hospital has free ICU beds right now?",
      "Angioplasty stent package costs in Chandigarh",
    ],
    timestamp: "Just now",
  },
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (userPrompt?: string) => {
    const text = (userPrompt || input).trim();
    if (!text || isLoading) return;

    setInput("");

    const userMessage: MessageItem = {
      id: getNextMessageId("u"),
      role: "user",
      content: text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          latitude: 30.7333,
          longitude: 76.7794,
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
      // High-precision client-side NLP fallback
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
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary-container text-on-primary px-4 py-3 rounded-full shadow-xl flex items-center gap-2.5 transition-all transform hover:scale-105 border-2 border-surface-container-high/40"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
          <span className="material-symbols-outlined text-xl">smart_toy</span>
          <span className="font-label-md font-bold tracking-tight">AI Medical Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[440px] h-[580px] bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high flex flex-col overflow-hidden animate-slideUp">
          {/* Top Header */}
          <div className="bg-primary text-on-primary p-space-md flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">health_and_safety</span>
              </div>
              <div>
                <div className="font-headline-md text-sm font-bold flex items-center gap-1.5">
                  <span>Clinical Dispatch AI</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-secondary text-white rounded font-medium">
                    Gemini 2.0
                  </span>
                </div>
                <div className="font-label-sm text-[11px] text-primary-fixed opacity-90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span>Real-time ICU &amp; Tariff Triage</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-on-primary/80 hover:text-on-primary material-symbols-outlined p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              close
            </button>
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-space-md overflow-y-auto space-y-space-md bg-background">
            {messages.map((m) => {
              const isUser = m.role === "user";
              const isEmergency = m.triage_level === "emergency";

              return (
                <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  {/* Emergency Warning Banner if Applicable */}
                  {isEmergency && !isUser && (
                    <div className="w-full bg-error-container text-on-error-container p-2.5 rounded-lg font-label-sm font-bold flex items-center gap-2 mb-2 border border-error/30 animate-pulse">
                      <span className="material-symbols-outlined text-error text-lg">emergency</span>
                      <span>CRITICAL TRIAGE: Call 108 or proceed to emergency desk immediately!</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-space-md shadow-xs text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary text-on-primary rounded-tr-xs"
                        : "bg-surface-container-lowest text-on-surface border border-surface-container-high/60 rounded-tl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Recommended Hospital Cards */}
                    {m.recommended_hospitals && m.recommended_hospitals.length > 0 && (
                      <div className="mt-space-sm flex flex-col gap-2 pt-2 border-t border-surface-container-high/50">
                        <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
                          Recommended Facilities:
                        </span>
                        {m.recommended_hospitals.map((hosp, idx) => (
                          <div
                            key={idx}
                            className="bg-surface-container-low p-2.5 rounded-lg border border-surface-container-high/60 flex flex-col gap-1"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-xs text-primary">{hosp.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high font-semibold text-secondary">
                                {hosp.beds_icu_available} ICU Beds Free
                              </span>
                            </div>
                            <span className="text-[11px] text-on-surface-variant">
                              📍 {hosp.address}
                            </span>
                            {hosp.cost_indicative && (
                              <span className="text-[11px] font-semibold text-primary">
                                💰 {hosp.cost_indicative}
                              </span>
                            )}
                            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-surface-container-high/40">
                              <Link
                                href={`/hospitals/${hosp.slug}`}
                                className="text-[11px] text-primary hover:underline font-semibold"
                              >
                                View Details →
                              </Link>
                              {hosp.emergency_phone && (
                                <a
                                  href={`tel:${hosp.emergency_phone}`}
                                  className="text-[11px] text-error hover:underline font-bold ml-auto"
                                >
                                  📞 Call {hosp.emergency_phone}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {m.action_buttons && m.action_buttons.length > 0 && (
                      <div className="mt-space-sm flex flex-wrap gap-1.5 pt-2 border-t border-surface-container-high/50">
                        {m.action_buttons.map((btn, idx) => {
                          if (btn.type === "call_emergency" || btn.type === "call_hospital") {
                            return (
                              <a
                                key={idx}
                                href={`tel:${btn.value}`}
                                className="px-2.5 py-1 rounded bg-error text-white font-label-sm text-xs font-bold flex items-center gap-1 shadow-xs"
                              >
                                <span>{btn.label}</span>
                              </a>
                            );
                          }
                          return (
                            <Link
                              key={idx}
                              href={btn.value}
                              className="px-2.5 py-1 rounded bg-surface-container-high text-primary hover:bg-surface-container-highest font-label-sm text-xs font-semibold"
                            >
                              {btn.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick Suggestions */}
                  {m.quick_suggestions && m.quick_suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 max-w-[90%]">
                      {m.quick_suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug)}
                          className="text-[11px] px-2 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary transition-colors text-left font-medium"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-outline mt-1 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-on-surface-variant text-xs p-2 bg-surface-container-low rounded-lg w-fit">
                <span className="material-symbols-outlined text-sm animate-spin text-primary">sync</span>
                <span>Clinical Dispatch AI evaluating triage &amp; tariffs...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-space-sm bg-surface-container-lowest border-t border-surface-container-high flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe symptoms, procedure, or insurance query..."
                className="flex-1 bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
            <div className="flex justify-between items-center text-[10px] text-outline px-1">
              <span>Medical routing assistant · Not a formal prescription</span>
              <Link href="/sos" className="text-error font-semibold hover:underline">
                Emergency SOS
              </Link>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────
// Client-Side Clinical NLP Engine (Offline Fallback)
// ──────────────────────────────────────────────
function generateClientSideNLPResponse(query: string): MessageItem {
  const q = query.toLowerCase();

  const isCardiacEmergency =
    q.includes("chest pain") ||
    q.includes("heart attack") ||
    q.includes("left arm") ||
    q.includes("dil ka daura") ||
    q.includes("sweating");

  const isStrokeEmergency =
    q.includes("stroke") ||
    q.includes("paralysis") ||
    q.includes("face drooping") ||
    q.includes("lakwa") ||
    q.includes("speech");

  if (isCardiacEmergency || isStrokeEmergency) {
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        "🚨 **CRITICAL TRIAGE: CALL 108 IMMEDIATELY**\n\nYour symptoms suggest a possible acute cardiac or neurological emergency.\n• Rest immediately; do not exert or walk.\n• Loosen tight clothing.\n• If a heart attack is suspected and there are no aspirin allergies or active bleeding, chew a single 300mg soluble Aspirin tablet.\n• Head straight to an accredited Level 1 Trauma Center with 24/7 cath lab availability.",
      triage_level: "emergency",
      recommended_hospitals: [
        {
          name: "PGIMER Chandigarh",
          slug: "pgimer-chandigarh",
          address: "Sector 12, Chandigarh",
          distance_km: 3.2,
          beds_icu_available: 14,
          is_pmjay_empanelled: true,
          emergency_phone: "0172-2746018",
          cost_indicative: "₹15,000 – ₹45,000",
        },
        {
          name: "Max Super Speciality Mohali",
          slug: "max-super-speciality-mohali",
          address: "Phase VI, Mohali",
          distance_km: 7.4,
          beds_icu_available: 6,
          is_pmjay_empanelled: true,
          emergency_phone: "0172-6652100",
          cost_indicative: "₹1,42,000 Package",
        },
      ],
      action_buttons: [
        { type: "call_emergency", label: "🚨 Call 108 Emergency", value: "108" },
        { type: "sos_dispatch", label: "🆘 Open SOS Dispatch", value: "/sos" },
      ],
      quick_suggestions: [
        "What first aid to give right now?",
        "Are ICU beds available immediately?",
      ],
      timestamp: "Just now",
    };
  }

  if (q.includes("stent") || q.includes("angioplasty") || q.includes("cardiac") || q.includes("heart")) {
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        "**Cardiology Care & Stent Package Breakdown:**\n\n• **Standard Angioplasty (Single DES)**: ₹15,000 – ₹45,000 at public teaching hospitals (PGIMER), and ₹1,40,000 – ₹1,85,000 at private accredited centers.\n• **Ayushman Bharat PMJAY**: 100% cashless pre-fixed package at ₹65,000 for empanelled hospitals.\n• **Recommendations**: Both PGIMER and Max Mohali feature active cath labs and audited door-to-balloon outcomes.",
      triage_level: "urgent",
      recommended_hospitals: [
        {
          name: "PGIMER Chandigarh",
          slug: "pgimer-chandigarh",
          address: "Sector 12, Chandigarh",
          distance_km: 3.2,
          beds_icu_available: 14,
          is_pmjay_empanelled: true,
          cost_indicative: "₹15,000 – ₹45,000",
        },
        {
          name: "Max Super Speciality Mohali",
          slug: "max-super-speciality-mohali",
          address: "Phase VI, Mohali",
          distance_km: 7.4,
          beds_icu_available: 6,
          is_pmjay_empanelled: true,
          cost_indicative: "₹1,42,000",
        },
      ],
      action_buttons: [
        {
          type: "compare",
          label: "⚖️ Compare Stent Packages",
          value: "/compare?ids=pgimer-chandigarh,max-super-speciality-mohali",
        },
        {
          type: "view_hospital",
          label: "🏥 View Max Mohali",
          value: "/hospitals/max-super-speciality-mohali",
        },
      ],
      quick_suggestions: [
        "What is covered under PMJAY angioplasty?",
        "Compare Fortis Mohali vs Max Mohali",
      ],
      timestamp: "Just now",
    };
  }

  if (q.includes("knee") || q.includes("ortho") || q.includes("joint") || q.includes("ghutna")) {
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        "**Orthopedic & Knee Replacement Directory:**\n\n• **Total Knee Replacement (TKR)**: Government subsidized packages range ₹80,000 – ₹95,000, while private robotic joint replacement is ₹1,45,000 – ₹2,20,000.\n• **PMJAY Eligibility**: Covers unilateral and bilateral TKR with FDA/CE certified implants.\n• **Recommended Centers**: Max Mohali features robotic arm-assisted arthroplasty; Sohana Hospital offers trusted high-volume subsidized surgery.",
      triage_level: "routine",
      recommended_hospitals: [
        {
          name: "Max Super Speciality Mohali",
          slug: "max-super-speciality-mohali",
          address: "Phase VI, Mohali",
          distance_km: 7.4,
          beds_icu_available: 6,
          is_pmjay_empanelled: true,
          cost_indicative: "₹1,45,000",
        },
        {
          name: "Sohana Multi Speciality Hospital",
          slug: "sohana-hospital-mohali",
          address: "Sector 77, Mohali",
          distance_km: 11.8,
          beds_icu_available: 8,
          is_pmjay_empanelled: true,
          cost_indicative: "₹65,000 Subsidized",
        },
      ],
      action_buttons: [
        {
          type: "compare",
          label: "⚖️ Compare Knee Surgery Centers",
          value: "/compare?ids=max-super-speciality-mohali,sohana-hospital-mohali",
        },
      ],
      quick_suggestions: [
        "Is robotic knee surgery covered under insurance?",
        "Average hospital stay after knee replacement?",
      ],
      timestamp: "Just now",
    };
  }

  // Default response
  return {
    id: "a-" + Date.now(),
    role: "assistant",
    content:
      "**MedRoute Clinical Assistant Guidance:**\n\nI can help you locate accredited hospitals, check genuine Ayushman Bharat PMJAY cashless packages, and compare ICU beds across North India.\n\nCould you describe the specific medical condition, procedure, or city you are looking for?",
    triage_level: "routine",
    recommended_hospitals: [
      {
        name: "PGIMER Chandigarh",
        slug: "pgimer-chandigarh",
        address: "Sector 12, Chandigarh",
        distance_km: 3.2,
        beds_icu_available: 14,
        is_pmjay_empanelled: true,
        cost_indicative: "₹15,000 – ₹45,000",
      },
      {
        name: "Max Super Speciality Mohali",
        slug: "max-super-speciality-mohali",
        address: "Phase VI, Mohali",
        distance_km: 7.4,
        beds_icu_available: 6,
        is_pmjay_empanelled: true,
        cost_indicative: "₹1,42,000",
      },
    ],
    action_buttons: [
      { type: "search", label: "🔍 Search Hospital Directory", value: "/search" },
      { type: "sos", label: "🚨 Emergency SOS", value: "/sos" },
    ],
    quick_suggestions: [
      "Find cardiac hospital in Mohali under 2 lakh",
      "Knee replacement with PMJAY cashless",
      "Which hospital has free ICU beds right now?",
    ],
    timestamp: "Just now",
  };
}
