/**
 * ChatScreen.tsx — Mobile AI Clinical Care & Dispatch Chatbot (Clinical Architecture Health)
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { api, MOCK_HOSPITALS, CITY_ALIASES, haversineKm, USER_LAT, USER_LNG } from "../services/api";

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

function FormattedClinicalTextRN({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <Text style={styles.userBubbleText}>{content}</Text>;
  }

  const lines = content.split("\n");

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <Text key={i} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={i}>{part}</Text>;
    });
  };

  return (
    <View style={{ gap: 4 }}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return <View key={idx} style={{ height: 4 }} />;

        if (line.startsWith("• ") || line.startsWith("- ")) {
          return (
            <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
              <Text style={{ color: colors.secondary, fontSize: 13, marginTop: 1 }}>•</Text>
              <Text style={[styles.aiBubbleText, { flex: 1 }]}>{renderInline(line.replace(/^[•\-]\s*/, ""))}</Text>
            </View>
          );
        }

        const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          const [, num, stepContent] = numMatch;
          return (
            <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{num}</Text>
              </View>
              <Text style={[styles.aiBubbleText, { flex: 1 }]}>{renderInline(stepContent)}</Text>
            </View>
          );
        }

        return (
          <Text key={idx} style={styles.aiBubbleText}>
            {renderInline(line)}
          </Text>
        );
      })}
    </View>
  );
}

export default function ChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: MessageItem = {
      id: "u-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendChatMessage(textToSend, history);
      const data = res?.data || res;
      if (data && data.reply) {
        const aiMessage: MessageItem = {
          id: "a-" + Date.now(),
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
      const fallbackResponse = generateClientSideNLP(textToSend);
      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: MessageItem }) => {
    const isUser = item.role === "user";
    const isEmergency = item.triage_level === "emergency";

    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
        {isEmergency && !isUser && (
          <View style={styles.emergencyBanner}>
            <Text style={styles.emergencyBannerText}>
              🚨 CRITICAL TRIAGE: Call 1800-MEDI-ROUTE immediately!
            </Text>
          </View>
        )}

        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <FormattedClinicalTextRN content={item.content} isUser={isUser} />

          {item.recommended_hospitals && item.recommended_hospitals.length > 0 && (
            <View style={styles.hospitalsContainer}>
              <Text style={styles.hospitalsHeader}>Recommended Network Facilities:</Text>
              {item.recommended_hospitals.map((hosp, idx) => (
                <View key={idx} style={styles.hospitalMiniCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.miniCardName}>{hosp.name}</Text>
                    {hosp.distance_km && (
                      <Text style={styles.miniCardDist}>{hosp.distance_km} km</Text>
                    )}
                  </View>
                  <Text style={styles.miniCardAddress}>📍 {hosp.address}</Text>

                  <View style={styles.miniCardMeta}>
                    <Text style={styles.miniCardIcu}>● {hosp.beds_icu_available} ICU Beds Free</Text>
                    {hosp.is_pmjay_empanelled && (
                      <Text style={styles.miniCardPmjay}>✓ 100% Cashless</Text>
                    )}
                  </View>

                  <View style={styles.miniCardActions}>
                    <TouchableOpacity
                      style={styles.miniCardViewBtn}
                      onPress={() => navigation.navigate("SOS")}
                    >
                      <Text style={styles.miniCardViewBtnText}>Reserve Bed</Text>
                    </TouchableOpacity>

                    {hosp.emergency_phone && (
                      <TouchableOpacity
                        style={styles.miniCardCallBtn}
                        onPress={() => Linking.openURL(`tel:${hosp.emergency_phone}`)}
                      >
                        <Text style={styles.miniCardCallBtnText}>Call Desk</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {item.action_buttons && item.action_buttons.length > 0 && (
            <View style={styles.actionsContainer}>
              {item.action_buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.actionBtn}
                  onPress={() => {
                    if (btn.type === "sos" || btn.value.includes("/sos") || btn.value.includes("/emergency")) {
                      navigation.navigate("SOS");
                    } else if (btn.type === "compare" || btn.value.includes("/compare")) {
                      navigation.navigate("Compare");
                    } else if (btn.type === "call_emergency" || btn.type === "call_hospital" || btn.value.startsWith("tel:") || btn.value === "108") {
                      const num = btn.value.replace("tel:", "");
                      Linking.openURL(`tel:${num}`).catch(() => {});
                    } else if (btn.value.includes("/hospitals/")) {
                      const slug = btn.value.split("/").pop();
                      navigation.navigate("HospitalDetail", { slug });
                    }
                  }}
                >
                  <Text style={styles.actionBtnText}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {item.quick_suggestions && item.quick_suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {item.quick_suggestions.map((sug, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => handleSend(sug)}
              >
                <Text style={styles.suggestionText}>💬 {sug}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 18 }}>🩺</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.headerTitle}>Medi Route Clinical AI</Text>
              <View style={styles.partnerBadge}>
                <Text style={styles.partnerBadgeText}>TPA Verified</Text>
              </View>
            </View>
            <View style={styles.headerStatusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.headerSubtitle}>Online • Clinical Triage &amp; Bed Telemetry</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Category Bar */}
      <View style={styles.quickBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBarScroll}>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => handleSend("Explain Medi Route 20-minute cashless guarantee")}
          >
            <Text style={styles.quickPillText}>🛡️ Cashless Pre-Auth</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => handleSend("Show hospitals in Bangalore with free ICU beds")}
          >
            <Text style={styles.quickPillText}>🛏️ Live ICU Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => handleSend("Nearest accredited cardiac emergency hubs")}
          >
            <Text style={styles.quickPillText}>⚡ Emergency Hubs</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Connecting to clinical database...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about hospital pre-auth, ICU beds, room rent..."
            placeholderTextColor={colors.textTertiary}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function resolveMobileHospitals(
  query: string,
  category: "emergency" | "cardiac" | "orthopedic" | "renal" | "general" = "general"
) {
  const q = query.toLowerCase();

  // Detect city from query
  let matchedCity: string | null = null;
  const tokens = q.replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
  for (const token of tokens) {
    if (token.length < 3) continue;
    if (CITY_ALIASES[token]) {
      matchedCity = CITY_ALIASES[token];
      break;
    }
  }

  let pool = MOCK_HOSPITALS;
  if (matchedCity) {
    const term = matchedCity.toLowerCase();
    const cityFiltered = pool.filter(
      (h) =>
        (h.city && (h.city.toLowerCase() === term || h.city.toLowerCase().includes(term) || term.includes(h.city.toLowerCase()))) ||
        (h.state && (h.state.toLowerCase() === term || h.state.toLowerCase().includes(term)))
    );
    if (cityFiltered.length > 0) {
      pool = cityFiltered;
    }
  }

  // Score & sort based on category
  const scored = pool.map((h) => ({
    name: h.name,
    slug: h.slug,
    address: h.address,
    distance_km: h.distance_km,
    beds_icu_available: h.beds_icu_available ?? 6,
    is_pmjay_empanelled: h.is_pmjay_empanelled ?? true,
    emergency_phone: h.emergency_phone || h.phone || "108",
    cost_indicative: h.cost_indicative,
    rating: h.overall_rating,
    specialties: h.specialties || [],
    is_trauma: h.is_trauma_center,
  }));

  if (category === "emergency") {
    scored.sort((a, b) => {
      const aTrauma = a.is_trauma ? 1 : 0;
      const bTrauma = b.is_trauma ? 1 : 0;
      if (bTrauma !== aTrauma) return bTrauma - aTrauma;
      return b.beds_icu_available - a.beds_icu_available || (a.distance_km ?? 0) - (b.distance_km ?? 0);
    });
  } else if (category === "cardiac") {
    scored.sort((a, b) => {
      const aCardiac = a.specialties.some((s) => s.toLowerCase().includes("cardiac") || s.toLowerCase().includes("heart")) ? 1 : 0;
      const bCardiac = b.specialties.some((s) => s.toLowerCase().includes("cardiac") || s.toLowerCase().includes("heart")) ? 1 : 0;
      if (bCardiac !== aCardiac) return bCardiac - aCardiac;
      return b.rating - a.rating || (a.distance_km ?? 0) - (b.distance_km ?? 0);
    });
  } else if (category === "orthopedic") {
    scored.sort((a, b) => {
      const aOrtho = a.specialties.some((s) => s.toLowerCase().includes("ortho") || s.toLowerCase().includes("bone")) ? 1 : 0;
      const bOrtho = b.specialties.some((s) => s.toLowerCase().includes("ortho") || s.toLowerCase().includes("bone")) ? 1 : 0;
      if (bOrtho !== aOrtho) return bOrtho - aOrtho;
      return b.rating - a.rating || (a.distance_km ?? 0) - (b.distance_km ?? 0);
    });
  } else {
    scored.sort((a, b) => b.rating - a.rating || (a.distance_km ?? 0) - (b.distance_km ?? 0));
  }

  return scored.slice(0, 2);
}

function generateClientSideNLP(text: string): MessageItem {
  const q = text.toLowerCase().trim();

  // 0. Greeting & Introductory Queries
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
    q === "what can you do";

  if (isGreeting) {
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        `👋 **Hello! Welcome to Medi Route Clinical AI.**\n\n` +
        `I am your real-time medical guide and hospital dispatch assistant. Here is what I can assist you with right now:\n\n` +
        `• **Emergency Red-Flag Triage**: Immediate clinical guidance for chest pain, stroke symptoms, head injury, and direct 108 ambulance dispatch.\n` +
        `• **Live ICU & Ventilator Telemetry**: Check verified vacant ICU beds near you with zero-deposit bed reservations.\n` +
        `• **Surgical & Treatment Tariffs**: Audited cost benchmarks for Angioplasty (stents), Knee/Hip Replacement, Dialysis, and Maternity under PMJAY Ayushman Bharat.\n` +
        `• **20-Minute Cashless Guarantee**: Pre-authorization processing with ₹0 upfront cash deposit at accredited network hospitals.\n\n` +
        `How can I assist you right now? Tap a suggestion below or type your symptom or question:`,
      triage_level: "routine",
      recommended_hospitals: [],
      action_buttons: [
        { type: "sos", label: "🛏️ Live ICU Beds", value: "/emergency-cashless" },
        { type: "compare", label: "⚖️ Compare Hospitals", value: "/compare" },
        { type: "sos", label: "🛡️ Cashless Pre-Auth", value: "/emergency-cashless" },
      ],
      quick_suggestions: [
        "Show hospitals with free ICU beds",
        "Cost of angioplasty stent under PMJAY",
        "Knee replacement surgery package rate",
        "Chest pain emergency first aid",
      ],
      timestamp: "Just now",
    };
  }

  // 1. Critical Red-Flag Emergency Triage
  const isEmergency =
    q.includes("chest pain") ||
    q.includes("heart attack") ||
    q.includes("dil ka daura") ||
    q.includes("stroke") ||
    q.includes("paralysis") ||
    q.includes("breathing") ||
    q.includes("breathless") ||
    q.includes("accident") ||
    q.includes("head injury") ||
    q.includes("bleeding") ||
    q.includes("unconscious") ||
    q.includes("poison") ||
    q.includes("ambulance");

  if (isEmergency) {
    const isCardiac = q.includes("chest") || q.includes("heart") || q.includes("dil");
    const recs = resolveMobileHospitals(q, "emergency");

    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        `🚨 **CRITICAL TRIAGE: HIGH-PRIORITY EMERGENCY PROTOCOL**\n\n` +
        `Your symptoms indicate an acute medical emergency requiring immediate intervention.\n\n` +
        `**Immediate Action Steps:**\n` +
        `1. **Call 108 Ambulance immediately** — do not attempt to drive yourself.\n` +
        `2. **Patient Posture**: Keep the patient seated or resting in recovery position.\n` +
        (isCardiac
          ? `3. **First Aid**: If conscious with no aspirin allergy, chew a 300mg soluble Aspirin tablet.\n`
          : `3. **Airway**: Keep airway open and unobstructed. Do not give oral food or water.\n`) +
        `4. **Zero Upfront Deposit**: Partner facilities guarantee immediate emergency bed intake without upfront cash friction.\n\n` +
        `Nearest network trauma centers with active ICU telemetry:`,
      triage_level: "emergency",
      recommended_hospitals: recs,
      action_buttons: [
        { type: "call_emergency", label: "🚨 Call 108 Ambulance", value: "tel:108" },
        { type: "sos", label: "🆘 Launch Emergency Desk", value: "/sos" },
        ...(recs[0]?.emergency_phone
          ? [{ type: "call_hospital", label: `📞 Call ${recs[0].name.split(" ")[0]} Trauma`, value: `tel:${recs[0].emergency_phone}` }]
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

  // 2. Cardiology & Stents
  if (
    q.includes("stent") ||
    q.includes("angioplasty") ||
    q.includes("bypass") ||
    q.includes("cabg") ||
    q.includes("cardiac") ||
    q.includes("heart") ||
    q.includes("cardiologist")
  ) {
    const recs = resolveMobileHospitals(q, "cardiac");
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        `**Cardiology Care & Stent Package Guidance:**\n\n` +
        `• **Angioplasty Tariff**: Standard single Drug-Eluting Stent (DES) ranges from ₹15,000–₹45,000 (Govt) and ₹1,20,000–₹1,85,000 (Private).\n` +
        `• **Ayushman Bharat PMJAY**: 100% Cashless package is pre-fixed at ₹65,000 (single) and ₹85,000 (double stent) with ₹0 out-of-pocket implant charges.\n` +
        `• **CABG Bypass Surgery**: ₹75,000–₹1,20,000 (Govt) vs ₹2,20,000–₹3,50,000 (Private).\n` +
        `• **Pre-Auth Speed**: TPA cashless clearances cleared in under 20 minutes.\n\n` +
        `Top accredited cardiac catheterization centers:`,
      triage_level: "routine",
      recommended_hospitals: recs,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Cardiac Centers", value: "/compare" },
        { type: "sos", label: "🛡️ Cashless Pre-Auth Desk", value: "/emergency-cashless" },
      ],
      quick_suggestions: [
        "What documents are needed for PMJAY stent?",
        "Single vs double stent package rate",
        "Recovery time after angioplasty",
      ],
      timestamp: "Just now",
    };
  }

  // 3. Orthopedics & Joint Replacement
  if (
    q.includes("knee") ||
    q.includes("joint") ||
    q.includes("hip") ||
    q.includes("orthopedic") ||
    q.includes("ghutna") ||
    q.includes("tkr") ||
    q.includes("thr") ||
    q.includes("fracture")
  ) {
    const recs = resolveMobileHospitals(q, "orthopedic");
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        `**Orthopedics & Joint Surgery Directory:**\n\n` +
        `• **Total Knee Replacement (TKR)**: Subsidized rate is ₹75,000–₹95,000; private robotic knee replacement ranges from ₹1,45,000–₹2,20,000.\n` +
        `• **Total Hip Replacement (THR)**: Subsidized ₹85,000–₹1,10,000 vs Private ₹1,60,000–₹2,50,000.\n` +
        `• **PMJAY Coverage**: Ayushman Bharat covers unilateral and bilateral TKR with certified implants.\n\n` +
        `Recommended NABH orthopedic centers near you:`,
      triage_level: "routine",
      recommended_hospitals: recs,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Knee Centers", value: "/compare" },
        { type: "view_hospital", label: `🏥 View ${recs[0]?.name.split(" ")[0]}`, value: `/hospitals/${recs[0]?.slug || ""}` },
      ],
      quick_suggestions: [
        "Robotic vs traditional knee replacement",
        "Does insurance cover bilateral knee surgery?",
        "Physiotherapy timeline after TKR",
      ],
      timestamp: "Just now",
    };
  }

  // 4. Dialysis & Kidney
  if (
    q.includes("dialysis") ||
    q.includes("kidney") ||
    q.includes("renal") ||
    q.includes("creatinine") ||
    q.includes("nephro") ||
    q.includes("stone")
  ) {
    const recs = resolveMobileHospitals(q, "renal");
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        `**Renal Care & Dialysis Support:**\n\n` +
        `• **Hemodialysis Tariffs**: ₹800–₹1,200 per session at government hospitals; ₹2,000–₹3,500 at private centers. Under **PMJAY Ayushman Bharat**, recurring dialysis is **100% free**.\n` +
        `• **Kidney Stone Removal (PCNL / URSL)**: ₹25,000–₹55,000 with laser lithotripsy.\n` +
        `• **Zero Deposit Protocol**: Show your ABHA ID or insurance card for instant cashless dialysis slot confirmation.\n\n` +
        `Empanelled dialysis centers in your network:`,
      triage_level: "routine",
      recommended_hospitals: recs,
      action_buttons: [
        { type: "compare", label: "⚖️ Compare Dialysis Units", value: "/compare" },
        { type: "sos", label: "🛡️ Check PMJAY Dialysis", value: "/emergency-cashless" },
      ],
      quick_suggestions: [
        "PMJAY free dialysis registration process",
        "AV Fistula surgery cost & recovery",
        "Which hospital has evening dialysis slots?",
      ],
      timestamp: "Just now",
    };
  }

  // 5. ICU & Bed Availability
  if (
    q.includes("icu") ||
    q.includes("ventilator") ||
    q.includes("bed") ||
    q.includes("beds") ||
    q.includes("oxygen") ||
    q.includes("vacant")
  ) {
    const recs = resolveMobileHospitals(q, "emergency");
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        `**Live ICU & Critical Care Bed Telemetry:**\n\n` +
        `• Real-time hospital feeds confirm verified vacant ICU and ventilator beds in your region.\n` +
        `• **Instant Digital Hold**: You can reserve an ICU bed for up to 90 minutes while the patient is en route.\n` +
        `• Direct zero-deposit pre-auth protocol is activated automatically upon reservation.\n\n` +
        `Hospitals with highest available ICU capacity in your area:`,
      triage_level: "routine",
      recommended_hospitals: recs,
      action_buttons: [
        { type: "sos", label: "🛏️ Reserve ICU Bed", value: "/sos" },
        { type: "compare", label: "⚖️ Compare Facilities", value: "/compare" },
      ],
      quick_suggestions: [
        "What is the daily ICU bed tariff?",
        "Is ICU stay 100% cashless under insurance?",
        "Do these centers have ventilator support?",
      ],
      timestamp: "Just now",
    };
  }

  // 6. Cashless Pre-Auth & Insurance
  if (
    q.includes("cashless") ||
    q.includes("pre-auth") ||
    q.includes("preauth") ||
    q.includes("insurance") ||
    q.includes("pmjay") ||
    q.includes("ayushman") ||
    q.includes("tpa") ||
    q.includes("zero deposit")
  ) {
    const recs = resolveMobileHospitals(q, "general");
    return {
      id: "a-" + Date.now(),
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
      recommended_hospitals: recs,
      action_buttons: [
        { type: "sos", label: "🛡️ Open Pre-Auth Terminal", value: "/emergency-cashless" },
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

  // 7. General Clinical Advisory
  const recs = resolveMobileHospitals(q, "general");
  return {
    id: "a-" + Date.now(),
    role: "assistant",
    content:
      `**Medi Route Clinical Advisory:**\n\n` +
      `Regarding your inquiry on **"${text}"**, our network connects you with verified clinical specialists and accredited facilities across India:\n\n` +
      `• **Accredited Quality**: Connect with NABH/JCI accredited centers with transparent clinical audits.\n` +
      `• **Tariff Transparency**: All surgery & treatment packages benchmarked against standard CGHS/PMJAY rates with ₹0 hidden charges.\n` +
      `• **20-Minute Cashless Sanction**: Dedicated Medi Route admission desks expedite pre-authorization without upfront deposit.\n\n` +
      `Recommended verified network facilities:`,
    triage_level: "routine",
    recommended_hospitals: recs,
    action_buttons: [
      { type: "compare", label: "⚖️ Compare Hospitals", value: "/compare" },
      { type: "sos", label: "🛡️ Pre-Auth Terminal", value: "/emergency-cashless" },
    ],
    quick_suggestions: [
      "Check live ICU beds available right now",
      "What are the PMJAY package rates?",
      "Compare top hospitals side-by-side",
    ],
    timestamp: "Just now",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  partnerBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  partnerBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.badgeCashless,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: "500",
  },
  quickBar: {
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingVertical: 8,
  },
  quickBarScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickPill: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSurface,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  messageList: {
    padding: 12,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginVertical: 5,
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  aiWrapper: {
    alignItems: "flex-start",
  },
  emergencyBanner: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    maxWidth: "92%",
  },
  emergencyBannerText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.error,
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderTopLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userBubbleText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  aiBubbleText: {
    color: colors.onSurface,
  },
  hospitalsContainer: {
    marginTop: 10,
    gap: 8,
  },
  hospitalsHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  hospitalMiniCard: {
    backgroundColor: colors.canvas,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  miniCardName: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurface,
  },
  miniCardDist: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: "700",
  },
  miniCardAddress: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  miniCardMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  miniCardIcu: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.badgeCashless,
  },
  miniCardPmjay: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  miniCardActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  miniCardViewBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  miniCardViewBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  miniCardCallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceIce,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  miniCardCallBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceIce,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    maxWidth: "90%",
  },
  suggestionChip: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  suggestionText: {
    fontSize: 11,
    color: colors.onSurface,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  loadingText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  boldText: {
    fontWeight: "700",
    color: colors.onSurface,
  },
  stepBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surfaceIce,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.secondary,
  },
});
