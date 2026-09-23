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
    patients_treated?: number;
    success_ratio?: string;
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

                  {(hosp.patients_treated !== undefined || !!hosp.success_ratio) && (
                    <View style={styles.miniCardMetricRow}>
                      <Text style={styles.miniCardMetricText}>
                        {hosp.success_ratio ? `★ ${hosp.success_ratio} Success` : ""}
                        {hosp.patients_treated ? ` • ${hosp.patients_treated.toLocaleString()} Treated` : ""}
                      </Text>
                    </View>
                  )}

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

// ─────────────────────────────────────────────────────────────
// Clinical Disease Knowledge Registry & Mobile NLP Engine
// ─────────────────────────────────────────────────────────────

interface DiseaseKBItem {
  id: string;
  name: string;
  commonName: string;
  keywords: string[];
  specialty: string;
  procedureName: string;
  overview: string;
  govtTariff: string;
  privateTariff: string;
  pmjayRate: string;
  successRatio: string;
  stayDays: string;
  procedureKeywords: string[];
}

const CLINICAL_DISEASES_KB: DiseaseKBItem[] = [
  {
    id: "cataract",
    name: "Senile Cataract & Vision Impairment",
    commonName: "Cataract (Motiyabind)",
    keywords: ["cataract", "motiyabind", "phaco", "eye lens", "cloudy vision", "eye surgery", "vision loss", "lens replacement"],
    specialty: "Ophthalmology / Eye Surgery",
    procedureName: "Cataract Surgery (Phaco + Foldable IOL)",
    overview: "Gradual opacification of the crystalline eye lens leading to glare sensitivity, blurred acuity, and progressive visual loss.",
    govtTariff: "₹8,000 – ₹18,000",
    privateTariff: "₹28,000 – ₹65,000 (Monofocal / Toric / Multifocal IOL)",
    pmjayRate: "₹12,500 (100% Cashless including Foldable IOL)",
    successRatio: "99.2%",
    stayDays: "Daycare (Discharge in 3–4 hours)",
    procedureKeywords: ["cataract", "phaco", "eye", "vision"],
  },
  {
    id: "hernia",
    name: "Inguinal & Abdominal Wall Hernia",
    commonName: "Hernia (Inguinal / Umbilical / Ventral)",
    keywords: ["hernia", "inguinal hernia", "umbilical hernia", "ventral hernia", "mesh repair", "herniotomy", "abdominal bulge"],
    specialty: "General & Laparoscopic Surgery",
    procedureName: "Laparoscopic Hernia Mesh Repair (TEP / TAPP)",
    overview: "Protrusion of intra-abdominal contents through a localized abdominal muscular wall defect, presenting as a reducible or tender bulge.",
    govtTariff: "₹15,000 – ₹28,000",
    privateTariff: "₹45,000 – ₹95,000 (3D Mesh / Laparoscopic)",
    pmjayRate: "₹32,000 (100% Cashless including Certified Mesh)",
    successRatio: "98.5%",
    stayDays: "1–2 days",
    procedureKeywords: ["hernia", "mesh repair", "abdominal wall"],
  },
  {
    id: "gallbladder_stone",
    name: "Cholelithiasis (Gallbladder Stones)",
    commonName: "Gallbladder Stones (Pitta Ki Pathri)",
    keywords: ["gallbladder", "gall bladder", "gallstone", "gallstones", "cholelithiasis", "cholecystectomy", "pitta ki pathri", "pitta"],
    specialty: "Gastroenterology & Laparoscopic Surgery",
    procedureName: "Laparoscopic Cholecystectomy (Keyhole Removal)",
    overview: "Biliary calculus concretions inside the gallbladder lumen causing recurrent right hypochondriac colic, dyspepsia, or acute cholecystitis.",
    govtTariff: "₹18,000 – ₹32,000",
    privateTariff: "₹55,000 – ₹1,15,000",
    pmjayRate: "₹38,000 (100% Cashless with 3-day hospitalization)",
    successRatio: "99.1%",
    stayDays: "1–2 days",
    procedureKeywords: ["cholelithiasis", "gallbladder", "cholecystectomy"],
  },
  {
    id: "kidney_stone",
    name: "Kidney & Ureteric Calculi (Stones)",
    commonName: "Kidney Stones (Gurde Ki Pathri / Renal Calculi)",
    keywords: ["kidney stone", "renal calculi", "ureteric stone", "pathri", "gurde ki pathri", "pcnl", "ursl", "lithotripsy", "renal stone", "kidney calculi"],
    specialty: "Urology & Endourology",
    procedureName: "PCNL / Holmium Laser Lithotripsy (URSL)",
    overview: "Crystalline mineral aggregates in the renal calyces or ureter generating acute radiating loin-to-groin colic, hematuria, or obstructive uropathy.",
    govtTariff: "₹15,000 – ₹30,000",
    privateTariff: "₹42,000 – ₹95,000 (Holmium Laser)",
    pmjayRate: "₹35,000 (100% Cashless with DJ Stenting)",
    successRatio: "98.2%",
    stayDays: "1–2 days",
    procedureKeywords: ["calculi", "stone", "pcnl", "renal stone", "lithotripsy"],
  },
  {
    id: "appendicitis",
    name: "Acute Appendicitis & Cecal Inflammation",
    commonName: "Appendicitis (Appendix Infection)",
    keywords: ["appendix", "appendicitis", "appendicectomy", "appendectomy", "right lower abdominal pain", "cecal"],
    specialty: "Emergency & General Surgery",
    procedureName: "Laparoscopic Appendectomy",
    overview: "Acute luminal obstruction and bacterial inflammation of the vermiform appendix requiring urgent surgical resection to prevent rupture.",
    govtTariff: "₹12,000 – ₹25,000",
    privateTariff: "₹45,000 – ₹85,000",
    pmjayRate: "₹28,000 (100% Cashless Emergency Admission)",
    successRatio: "99.0%",
    stayDays: "1–2 days",
    procedureKeywords: ["appendicitis", "appendectomy", "appendix"],
  },
  {
    id: "knee_osteoarthritis",
    name: "Severe Knee Osteoarthritis & Degeneration",
    commonName: "Knee Arthritis (Ghutne Ka Dard / TKR)",
    keywords: ["knee", "tkr", "knee replacement", "ghutna", "knee arthritis", "knee surgery", "joint pain", "knee pain"],
    specialty: "Orthopedics & Joint Reconstruction",
    procedureName: "Total Knee Replacement (Unilateral / Robotic)",
    overview: "End-stage tricompartmental articular cartilage degradation and osteophyte formation resulting in joint space loss, severe pain, and ambulation restriction.",
    govtTariff: "₹75,000 – ₹95,000",
    privateTariff: "₹1,45,000 – ₹2,20,000 (Robotic / High-Flex Implants)",
    pmjayRate: "₹80,000 (100% Cashless including US-FDA certified implants)",
    successRatio: "97.5%",
    stayDays: "4–5 days",
    procedureKeywords: ["knee replacement", "osteoarthritis", "tkr", "knee"],
  },
  {
    id: "hip_arthritis",
    name: "Avascular Necrosis & Severe Hip Arthritis",
    commonName: "Hip Arthritis (Hip Replacement / THR)",
    keywords: ["hip", "thr", "hip replacement", "avascular necrosis", "hip arthritis", "hip fracture", "hip pain"],
    specialty: "Orthopedics & Joint Reconstruction",
    procedureName: "Total Hip Replacement (Bipolar / Ceramic)",
    overview: "Femoral head osteonecrosis or degenerative coxarthrosis resulting in severe groin pain, limb shortening, and mechanical joint restriction.",
    govtTariff: "₹85,000 – ₹1,10,000",
    privateTariff: "₹1,60,000 – ₹2,50,000 (Ceramic on Ceramic)",
    pmjayRate: "₹90,000 (100% Cashless Implants)",
    successRatio: "96.8%",
    stayDays: "4–5 days",
    procedureKeywords: ["hip replacement", "hip arthritis", "thr", "hip"],
  },
  {
    id: "coronary_artery_disease",
    name: "Coronary Artery Disease (CAD) & Myocardial Infarction",
    commonName: "Coronary Blockage / Angioplasty",
    keywords: ["stent", "angioplasty", "cardiac stent", "coronary", "blockage", "heart block", "ptca", "cad"],
    specialty: "Cardiology & Interventional Cath Lab",
    procedureName: "Coronary Angioplasty (Single / Double DES Stent)",
    overview: "Atherosclerotic luminal narrowing of coronary arteries depriving myocardium of oxygen, manifesting as angina or acute myocardial infarction.",
    govtTariff: "₹15,000 – ₹45,000",
    privateTariff: "₹1,20,000 – ₹1,85,000 (Drug-Eluting Stent)",
    pmjayRate: "₹65,000 (100% Cashless pre-fixed tariff)",
    successRatio: "98.5%",
    stayDays: "2 days",
    procedureKeywords: ["angioplasty", "stent", "coronary artery disease", "cad"],
  },
  {
    id: "triple_vessel_disease",
    name: "Triple Vessel CAD & Complex Ischemia",
    commonName: "Bypass Surgery (CABG / Open Heart)",
    keywords: ["bypass", "cabg", "heart bypass", "open heart", "triple vessel"],
    specialty: "Cardiothoracic & Vascular Surgery (CTVS)",
    procedureName: "Coronary Artery Bypass Graft (CABG)",
    overview: "Multivessel critical stenosis of main coronary branches requiring arterial or venous conduit grafting to revascularize ischemic myocardium.",
    govtTariff: "₹75,000 – ₹1,20,000",
    privateTariff: "₹2,20,000 – ₹3,50,000 (Beating Heart / Minimally Invasive)",
    pmjayRate: "₹1,30,000 (100% Cashless surgical package)",
    successRatio: "96.5%",
    stayDays: "6–7 days",
    procedureKeywords: ["cabg", "bypass", "triple vessel"],
  },
  {
    id: "chronic_kidney_disease",
    name: "Chronic Kidney Disease (Stage 5 / ESRD)",
    commonName: "Kidney Failure / Dialysis",
    keywords: ["dialysis", "hemodialysis", "kidney failure", "renal failure", "ckd", "esrd", "creatinine", "dialysis slot"],
    specialty: "Nephrology & Renal Replacement",
    procedureName: "Hemodialysis (Maintenance Session & AV Fistula)",
    overview: "Irreversible decline in glomerular filtration rate (eGFR < 15) leading to uremic toxicity, hyperkalemia, and fluid retention requiring extracorporeal clearance.",
    govtTariff: "₹800 – ₹1,200 per session",
    privateTariff: "₹2,000 – ₹3,500 per session",
    pmjayRate: "100% Free recurring sessions under Ayushman Bharat",
    successRatio: "97.2%",
    stayDays: "4 hours per session (Outpatient recurring)",
    procedureKeywords: ["hemodialysis", "dialysis", "chronic kidney disease", "esrd"],
  },
  {
    id: "acute_stroke",
    name: "Acute Ischemic Stroke & Cerebrovascular Attack",
    commonName: "Stroke (Brain Attack / Lakwa)",
    keywords: ["stroke", "paralysis", "lakwa", "brain stroke", "brain clot", "thrombolysis", "ischemic stroke"],
    specialty: "Neurology & Neuro-Intervention",
    procedureName: "Acute Stroke Thrombolysis (IV rtPA) & Neuro-ICU",
    overview: "Sudden thromboembolic occlusion of cerebral arterial supply causing rapid focal neurological deficits within the critical 4.5-hour golden window.",
    govtTariff: "₹15,000 – ₹45,000 (Subsidized rtPA)",
    privateTariff: "₹75,000 – ₹1,80,000 (Thrombolysis + Neuro-ICU)",
    pmjayRate: "100% Cashless Emergency Neuro Protocol",
    successRatio: "94.5%",
    stayDays: "4–6 days",
    procedureKeywords: ["stroke", "thrombolysis", "ischemic stroke"],
  },
  {
    id: "cancer_tumors",
    name: "Solid Tumors & Oncological Carcinoma",
    commonName: "Cancer Care (Chemotherapy / Radiation)",
    keywords: ["cancer", "tumor", "chemotherapy", "chemo", "oncology", "radiation", "carcinoma", "lymphoma", "leukemia", "biopsy"],
    specialty: "Medical & Surgical Oncology",
    procedureName: "Chemotherapy Protocol & Target Radiation",
    overview: "Uncontrolled malignant cellular proliferation invading surrounding tissues and lymphatic basins, requiring multimodal systemic and targeted interventions.",
    govtTariff: "₹8,000 – ₹25,000 per cycle",
    privateTariff: "₹35,000 – ₹85,000 per cycle / ₹1.5L–₹3L Radiation",
    pmjayRate: "100% Cashless up to ₹5,00,000 per family per year",
    successRatio: "93.0%",
    stayDays: "Daycare or 2–3 days per cycle",
    procedureKeywords: ["carcinoma", "tumor", "chemotherapy", "cancer", "oncology"],
  },
  {
    id: "pregnancy_delivery",
    name: "High-Risk Pregnancy & Obstetric Delivery",
    commonName: "Delivery & Maternity (C-Section / Normal)",
    keywords: ["cesarean", "c-section", "lscs", "delivery", "pregnancy", "maternity", "labor", "normal delivery"],
    specialty: "Obstetrics & Gynecology",
    procedureName: "Cesarean Section Delivery (LSCS) / Normal Delivery",
    overview: "Surgical abdominal hysterotomy or spontaneous vaginal delivery with neonatal resuscitation backup and maternal hemodynamic monitoring.",
    govtTariff: "₹0 – ₹15,000 (Janani Suraksha Subsidized)",
    privateTariff: "₹45,000 – ₹1,10,000",
    pmjayRate: "100% Free under PMJAY Maternity Package",
    successRatio: "99.4%",
    stayDays: "2–4 days",
    procedureKeywords: ["cesarean", "lscs", "pregnancy", "delivery", "maternity"],
  },
  {
    id: "dengue_fever",
    name: "Dengue Hemorrhagic Fever & Thrombocytopenia",
    commonName: "Dengue Fever (Platelet Fall)",
    keywords: ["dengue", "thrombocytopenia", "low platelets", "platelet", "platelets", "mosquito fever"],
    specialty: "Internal Medicine & Critical Care",
    procedureName: "Platelet Telemetry & Targeted Inpatient Hydration",
    overview: "Arboviral illness transmitted by Aedes mosquitoes triggering severe thrombocytopenia, plasma leakage, and potential hemorrhagic complications.",
    govtTariff: "₹0 – ₹5,000 (Subsidized)",
    privateTariff: "₹18,000 – ₹45,000 (Ward) / ₹80,000 (ICU)",
    pmjayRate: "100% Covered under Ayushman Bharat Inpatient Protocol",
    successRatio: "99.4%",
    stayDays: "3–5 days",
    procedureKeywords: ["medicine", "critical care", "icu"],
  },
  {
    id: "pneumonia",
    name: "Community-Acquired & Bacterial Pneumonia",
    commonName: "Pneumonia (Lung Infection)",
    keywords: ["pneumonia", "lung infection", "chest infection", "sputum", "pleural effusion"],
    specialty: "Pulmonology & Respiratory Medicine",
    procedureName: "High-Flow Oxygenation & IV Targeted Antibiotic Therapy",
    overview: "Acute alveolar parenchymal infection leading to exudative consolidation, hypoxia, persistent cough, and dyspnea.",
    govtTariff: "₹5,000 – ₹15,000",
    privateTariff: "₹25,000 – ₹65,000 (Ward) / ₹1,20,000 (ICU Ventilator)",
    pmjayRate: "100% Cashless under PMJAY Respiratory Care Package",
    successRatio: "97.0%",
    stayDays: "4–6 days",
    procedureKeywords: ["pulmonology", "respiratory", "icu"],
  },
  {
    id: "diabetes",
    name: "Type-2 Diabetes Mellitus & Metabolic Syndromes",
    commonName: "Diabetes (Sugar / Madhumeh)",
    keywords: ["diabetes", "sugar", "diabetic", "madhumeh", "insulin", "hba1c", "blood glucose", "hyperglycemia"],
    specialty: "Endocrinology & Diabetology",
    procedureName: "Comprehensive Diabetic Staging & Glycemic Control",
    overview: "Chronic endocrine metabolic dysfunction caused by peripheral insulin resistance, requiring systematic glycemic regulation to prevent organ complications.",
    govtTariff: "₹0 – ₹1,200 (Diagnostics & Medications)",
    privateTariff: "₹3,500 – ₹12,000 (Annual Screening & Staging)",
    pmjayRate: "Covered under PMJAY Non-Communicable Disease OPD & IPD",
    successRatio: "96.5%",
    stayDays: "Outpatient (1–3 days if Inpatient Ketoacidosis)",
    procedureKeywords: ["endocrinology", "medicine"],
  },
  {
    id: "asthma",
    name: "Bronchial Asthma & Chronic Bronchospasm",
    commonName: "Asthma (Dama / Wheeze)",
    keywords: ["asthma", "dama", "bronchial asthma", "wheezing", "inhaler", "bronchospasm", "nebulization"],
    specialty: "Pulmonology & Allergy Care",
    procedureName: "Spirometry Pulmonary Function & Nebulization Protocol",
    overview: "Chronic hyperreactive inflammatory disorder of the bronchial tree causing episodic wheezing, nocturnal dyspnea, and reversible airflow obstruction.",
    govtTariff: "₹500 – ₹2,500 (Diagnostics & Maintenance)",
    privateTariff: "₹4,500 – ₹15,000 (Comprehensive Allergy & PFT)",
    pmjayRate: "Acute asthmatic episodes covered 100% in network emergency",
    successRatio: "98.0%",
    stayDays: "Daycare or 1–2 days if severe exacerbation",
    procedureKeywords: ["pulmonology", "allergy"],
  },
  {
    id: "tuberculosis",
    name: "Pulmonary & Extrapulmonary Tuberculosis (TB)",
    commonName: "Tuberculosis (T.B. / Tapdik)",
    keywords: ["tuberculosis", "tb", "tapdik", "dots", "mycobacterium", "hemoptysis"],
    specialty: "Pulmonology & Infectious Diseases",
    procedureName: "CBNAAT / GeneXpert Diagnosis & Daily Anti-TB Regimen (DOTS)",
    overview: "Mycobacterium tuberculosis airborne infection causing chronic cough, hemoptysis, night fevers, and pulmonary parenchymal cavitations.",
    govtTariff: "100% Free under National Tuberculosis Elimination Program (NTEP)",
    privateTariff: "₹15,000 – ₹35,000 (Diagnostic Staging & Second-Line)",
    pmjayRate: "100% Free with Monthly ₹500 Nikshay Nutrition Support",
    successRatio: "94.2%",
    stayDays: "Outpatient DOTS (5–7 days only if severe hemoptysis)",
    procedureKeywords: ["pulmonology", "infectious"],
  },
  {
    id: "piles",
    name: "Hemorrhoidal Disease & Anal Fissure / Fistula",
    commonName: "Piles (Bawaseer / Fissure / Fistula)",
    keywords: ["piles", "hemorrhoids", "bawaseer", "fissure", "fistula", "kshar sutra", "anal bleeding"],
    specialty: "Proctology & General Surgery",
    procedureName: "Laser Hemorrhoidoplasty (LHP) / Fistulectomy",
    overview: "Pathological vascular dilation of the submucosal hemorrhoidal cushions generating painless rectal bleeding, prolapse, or painful perianal thrombosis.",
    govtTariff: "₹8,000 – ₹18,000",
    privateTariff: "₹35,000 – ₹75,000 (Minimally Invasive Laser)",
    pmjayRate: "₹24,000 (100% Cashless surgical package)",
    successRatio: "98.5%",
    stayDays: "Daycare or 1 day",
    procedureKeywords: ["general surgery", "proctology"],
  },
  {
    id: "jaundice",
    name: "Hepatic Jaundice & Hepatitis / Liver Dysfunction",
    commonName: "Jaundice (Piliya / Hepatitis / Liver Cirrhosis)",
    keywords: ["jaundice", "hepatitis", "liver cirrhosis", "fatty liver", "piliya", "bilirubin", "liver"],
    specialty: "Hepatology & Gastroenterology",
    procedureName: "Liver Function Staging & Viral Hepatitis Protocol",
    overview: "Hyperbilirubinemia caused by hepatocellular dysfunction or biliary stasis, causing scleral icterus, dark urine, and elevated liver transaminases.",
    govtTariff: "₹2,000 – ₹8,000",
    privateTariff: "₹25,000 – ₹65,000 (Inpatient Hepatology)",
    pmjayRate: "100% Covered under Ayushman Bharat Hepato-Biliary Package",
    successRatio: "96.0%",
    stayDays: "3–5 days",
    procedureKeywords: ["gastro", "hepatology", "liver"],
  },
  {
    id: "hypertension",
    name: "Essential Hypertension & Cardiovascular Risk",
    commonName: "High Blood Pressure (High BP / Hypertension)",
    keywords: ["hypertension", "high bp", "blood pressure", "high blood pressure", "systolic"],
    specialty: "Cardiology & Internal Medicine",
    procedureName: "Ambulatory BP Monitoring & Cardiac Risk Stratification",
    overview: "Persistent elevation of systemic arterial blood pressure (> 140/90 mmHg) accelerating vascular end-organ damage across heart, kidneys, and brain.",
    govtTariff: "₹0 – ₹800 (Diagnostics & ACE/ARB Therapy)",
    privateTariff: "₹2,500 – ₹8,000 (ECHO, Lipid & 24h Holter Screening)",
    pmjayRate: "Covered under PMJAY Non-Communicable Disease OPD & IPD",
    successRatio: "97.5%",
    stayDays: "Outpatient (1–2 days if Hypertensive Crisis)",
    procedureKeywords: ["cardiac", "medicine"],
  },
  {
    id: "bone_fracture",
    name: "Acute Bone Fracture & Musculoskeletal Trauma",
    commonName: "Fracture (Haddi Tootna / Bone Fracture / Plaster)",
    keywords: ["fracture", "bone fracture", "broken bone", "haddi tootna", "plaster", "orif", "bone crack", "broken leg", "broken arm"],
    specialty: "Orthopedics & Trauma Surgery",
    procedureName: "Open Reduction and Internal Fixation (ORIF) / Closed Reduction & Plaster",
    overview: "Mechanical discontinuity in bone cortex due to acute trauma, requiring precise anatomic reduction and stable internal or cast fixation.",
    govtTariff: "₹5,000 – ₹18,000",
    privateTariff: "₹35,000 – ₹85,000 (Titanium Plates / Screws)",
    pmjayRate: "100% Cashless Fracture Fixation & Implant Package",
    successRatio: "98.8%",
    stayDays: "2–3 days",
    procedureKeywords: ["orthopedic", "fracture", "trauma"],
  },
];

function matchDiseaseFromQuery(query: string): DiseaseKBItem | null {
  const q = query.toLowerCase().trim();
  for (const item of CLINICAL_DISEASES_KB) {
    if (item.keywords.some((kw) => q.includes(kw))) {
      return item;
    }
  }
  return null;
}

function resolveMobileHospitalsForDisease(
  diseaseId: string,
  userCity: string = "Hoshiarpur",
  refLat: number = USER_LAT,
  refLng: number = USER_LNG,
  procedureKeywords: string[] = []
) {
  const cityTerm = (userCity || "hoshiarpur").toLowerCase().trim();

  let cityHospitals = MOCK_HOSPITALS.filter(
    (h) =>
      ((h.city ?? "").toLowerCase().includes(cityTerm) || (h.state ?? "").toLowerCase().includes(cityTerm))
  );

  if (cityHospitals.length === 0) {
    cityHospitals = MOCK_HOSPITALS.slice(0, 15);
  }

  const centerLat = cityHospitals[0]?.latitude ?? refLat;
  const centerLng = cityHospitals[0]?.longitude ?? refLng;

  const scored = cityHospitals.map((h) => {
    const dist = parseFloat(haversineKm(centerLat, centerLng, h.latitude, h.longitude).toFixed(1));

    let matchedProc: any = null;
    if (h.procedures && Array.isArray(h.procedures)) {
      matchedProc = h.procedures.find((p: any) => {
        const dName = (p.disease || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        return procedureKeywords.some((kw) => dName.includes(kw) || pName.includes(kw));
      });
    }

    const topDis = (h.top_disease_treated || "").toLowerCase();
    const isTopDisease = procedureKeywords.some((kw) => topDis.includes(kw));

    const hasSpecialty = (h.specialties || []).some((s: string) => {
      const sLower = s.toLowerCase();
      return procedureKeywords.some((kw) => sLower.includes(kw));
    });

    let score = (h.overall_rating ?? 4.5) * 10;
    if (matchedProc) score += 60;
    if (isTopDisease) score += 40;
    if (hasSpecialty) score += 20;

    const treatedCount = matchedProc?.patients_treated || (isTopDisease ? h.total_patients_treated : undefined);
    const successRatio = matchedProc?.success_ratio || (isTopDisease ? h.overall_success_ratio : undefined);
    const procCost = matchedProc?.cost_formatted || (matchedProc?.cost_avg
      ? `₹${Math.round(matchedProc.cost_avg / 1000)}k Avg`
      : h.base_package_inr
      ? `₹${Math.round(h.base_package_inr / 1000)}k Package`
      : "100% Cashless");

    return {
      name: h.name,
      slug: h.slug,
      address: h.address || `${h.city}, ${h.state}`,
      distance_km: dist,
      beds_icu_available: h.beds_icu_available ?? 6,
      is_pmjay_empanelled: h.is_pmjay_empanelled ?? true,
      emergency_phone: h.emergency_phone || h.phone || "108",
      cost_indicative: procCost,
      score,
      patients_treated: treatedCount,
      success_ratio: successRatio,
    };
  });

  scored.sort((a, b) => b.score - a.score || (a.distance_km ?? 0) - (b.distance_km ?? 0));

  return scored.slice(0, 2);
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
    patients_treated: h.total_patients_treated,
    success_ratio: h.overall_success_ratio,
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
        `I am your real-time medical guide and hospital dispatch assistant. You can enter any **disease name, symptom, or treatment**:\n\n` +
        `• **Direct Disease Search**: Enter e.g. *Cataract, Hernia, Gallbladder stones, Kidney stones, Dengue, Pneumonia, Asthma, Diabetes* to get instant tariffs, success rates & empanelled centers.\n` +
        `• **Live ICU & Ventilator Telemetry**: Check verified vacant ICU beds near you with zero-deposit bed reservations.\n` +
        `• **Emergency Red-Flag Triage**: Immediate clinical guidance for chest pain, stroke symptoms, head injury, and direct 108 ambulance dispatch.\n` +
        `• **20-Minute Cashless Guarantee**: Pre-authorization processing with ₹0 upfront cash deposit at accredited network hospitals.\n\n` +
        `What condition or hospital would you like to check today?`,
      triage_level: "routine",
      recommended_hospitals: [],
      action_buttons: [
        { type: "sos", label: "🛏️ Live ICU Beds", value: "/emergency-cashless" },
        { type: "compare", label: "⚖️ Compare Hospitals", value: "/compare" },
        { type: "sos", label: "🛡️ Cashless Pre-Auth", value: "/emergency-cashless" },
      ],
      quick_suggestions: [
        "Cataract surgery cost & success rate",
        "Gallbladder stone removal under PMJAY",
        "Show hospitals with free ICU beds",
        "Hernia laparoscopic repair tariff",
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
    q.includes("lakwa") ||
    q.includes("breathing") ||
    q.includes("breathless") ||
    q.includes("accident") ||
    q.includes("head injury") ||
    q.includes("bleeding") ||
    q.includes("unconscious") ||
    q.includes("poison") ||
    q.includes("ambulance") ||
    q === "emergency" ||
    q === "sos";

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

  // 2. Direct Clinical Disease & Procedure KB Matching
  const matchedDisease = matchDiseaseFromQuery(q);
  if (matchedDisease) {
    // Detect city from query or default to Hoshiarpur
    let queryCity = "Hoshiarpur";
    const tokens = q.replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
    for (const token of tokens) {
      if (token.length < 3) continue;
      if (CITY_ALIASES[token]) {
        queryCity = CITY_ALIASES[token];
        break;
      }
    }

    const diseaseHospitals = resolveMobileHospitalsForDisease(
      matchedDisease.id,
      queryCity,
      USER_LAT,
      USER_LNG,
      matchedDisease.procedureKeywords
    );

    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        `**Clinical Profile: ${matchedDisease.name}**\n\n` +
        `• **Specialty Department**: ${matchedDisease.specialty}\n` +
        `• **Standard Procedure**: ${matchedDisease.procedureName}\n` +
        `• **Clinical Overview**: ${matchedDisease.overview}\n` +
        `• **Indicative Package Tariffs**:\n` +
        `  - Government Subsidized: **${matchedDisease.govtTariff}**\n` +
        `  - Private NABH Accredited: **${matchedDisease.privateTariff}**\n` +
        `  - Ayushman Bharat PMJAY: **${matchedDisease.pmjayRate}**\n` +
        `• **Clinical Outcome Benchmark**: **${matchedDisease.successRatio}** audited success ratio • Expected stay: **${matchedDisease.stayDays}**\n\n` +
        `Top accredited network hospitals with audited volumes for ${matchedDisease.commonName}:`,
      triage_level: "routine",
      recommended_hospitals: diseaseHospitals,
      action_buttons: [
        { type: "compare", label: `⚖️ Compare ${matchedDisease.commonName.split(" ")[0]} Centers`, value: "/compare" },
        { type: "sos", label: "🛡️ Check Cashless Sanction", value: "/emergency-cashless" },
        ...(diseaseHospitals[0]?.slug
          ? [{ type: "view_hospital", label: `🏥 View ${diseaseHospitals[0].name.split(" ")[0]} Packages`, value: `/hospitals/${diseaseHospitals[0].slug}` }]
          : []),
      ],
      quick_suggestions: [
        `Is ${matchedDisease.commonName.split(" ")[0]} 100% cashless under PMJAY?`,
        `What diagnostic tests are needed for ${matchedDisease.commonName.split(" ")[0]}?`,
        `Typical recovery time and post-procedure care?`,
      ],
      timestamp: "Just now",
    };
  }

  // 3. ICU & Bed Availability
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

  // 4. Cashless Pre-Auth & Insurance
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

  // 5. General Clinical Advisory
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
  miniCardMetricRow: {
    marginTop: 4,
  },
  miniCardMetricText: {
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
