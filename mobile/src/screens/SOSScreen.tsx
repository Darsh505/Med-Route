/**
 * SOSScreen.tsx — Mobile Emergency Response & 108 Dispatch
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors } from "../theme/colors";
import MedRouteLogo from "../components/MedRouteLogo";
import { MOCK_HOSPITALS } from "../services/api";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { localizeHospital, localizeAccreditation } from "../i18n/hospitalLocalization";

const FIRST_AID_PROTOCOLS = [
  {
    id: "cardiac",
    icon: "💔",
    title: "Heart Attack / Severe Chest Pain",
    badge: "CRITICAL 0-10 MIN",
    steps: [
      "Keep the patient seated upright at rest. Do not let them walk.",
      "If conscious and not allergic, have them chew a 300mg soluble Aspirin tablet.",
      "Loosen tight clothing around neck and chest to assist breathing.",
      "Call 108 ambulance immediately — do not drive yourself.",
    ],
  },
  {
    id: "stroke",
    icon: "🧠",
    title: "Stroke Emergency (F.A.S.T.)",
    badge: "CRITICAL 0-4.5 HRS",
    steps: [
      "Face: Ask to smile. Does one side of the face droop?",
      "Arms: Ask to raise both arms. Does one arm drift downward?",
      "Speech: Ask to repeat a simple sentence. Is speech slurred or strange?",
      "Time: Call 108 immediately. Note the exact time symptoms started.",
    ],
  },
  {
    id: "trauma",
    icon: "🩸",
    title: "Severe Bleeding & Trauma",
    badge: "IMMEDIATE PRESSURE",
    steps: [
      "Apply firm, continuous direct pressure to wound using a clean cloth or gauze.",
      "Elevate the injured limb above heart level if no fracture is suspected.",
      "Do NOT remove any embedded or impaled objects — pack around them.",
      "Keep patient warm with a blanket while waiting for the 108 team.",
    ],
  },
  {
    id: "breathing",
    icon: "🫁",
    title: "Acute Breathlessness / Asthma",
    badge: "AIRWAY PRIORITY",
    steps: [
      "Sit patient upright leaning slightly forward. Do not lay them flat.",
      "Assist them with 2 puffs of their prescribed rescue inhaler (with spacer if available).",
      "Ensure fresh air ventilation and keep onlookers at a distance.",
      "If lips turn blue or patient cannot speak full words, dispatch 108 immediately.",
    ],
  },
];

export default function SOSScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const [selectedProtocol, setSelectedProtocol] = useState<string>("cardiac");

  // Get top 3 nearest trauma/emergency facilities
  const emergencyHospitals = MOCK_HOSPITALS.filter(
    (h) => h.is_trauma_center || (h.beds_icu_available ?? 0) > 4
  ).slice(0, 3);

  const handleCall108 = () => {
    Linking.openURL("tel:108").catch(() => {
      Alert.alert("Emergency Dial", "Unable to open dialer. Please dial 108 directly.");
    });
  };

  const handleWhatsAppDesk = () => {
    const text = encodeURIComponent(
      "EMERGENCY: I need urgent hospital bed admission and emergency coordination."
    );
    Linking.openURL(`https://wa.me/919592543404?text=${text}`).catch(() => {
      Alert.alert("WhatsApp Unavailable", "Please dial 9592543404 directly.");
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <MedRouteLogo size="sm" showBadge={false} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.headerTitle}>{t("sos.title")}</Text>
            <Text style={styles.headerSub}>{t("sos.subtitle")}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <LanguageSwitcher compact />
          <View style={styles.liveGridBadge}>
            <View style={styles.livePulse} />
            <Text style={styles.liveGridText}>24/7 {t("common.emergency")}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Master Call To Action — 108 Ambulance */}
        <View style={styles.dispatchCard}>
          <View style={styles.dispatchTopRow}>
            <Text style={styles.dispatchSuper}>{currentLang === "hi" ? "मुफ़्त राष्ट्रीय एम्बुलेंस" : currentLang === "pa" ? "ਮੁਫ਼ਤ ਰਾਸ਼ਟਰੀ ਐਂਬੂਲੈਂਸ" : "FREE NATIONAL AMBULANCE"}</Text>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>{currentLang === "hi" ? "सरकारी सेवा" : currentLang === "pa" ? "ਸਰਕਾਰੀ ਸੇਵਾ" : "GOVERNMENT SERVICE"}</Text>
            </View>
          </View>

          <Text style={styles.dispatchTitle}>{currentLang === "hi" ? "108 एम्बुलेंस हेल्पलाइन पर कॉल करें" : currentLang === "pa" ? "108 ਐਂਬੂਲੈਂਸ ਹੈਲਪਲਾਈਨ 'ਤੇ ਕਾਲ ਕਰੋ" : "Call 108 Ambulance Hotline"}</Text>
          <Text style={styles.dispatchSub}>
            Toll-free emergency response across India. Dispatches nearest ALS/BLS cardiac ambulance with trained paramedics.
          </Text>

          <TouchableOpacity
            style={styles.call108Button}
            onPress={handleCall108}
            activeOpacity={0.85}
          >
            <Text style={styles.call108Icon}>🚨</Text>
            <View>
              <Text style={styles.call108Label}>{currentLang === "hi" ? "108 पर कॉल करने के लिए टैप करें" : currentLang === "pa" ? "108 'ਤੇ ਕਾਲ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ" : "TAP TO CALL 108"}</Text>
              <Text style={styles.call108Number}>{currentLang === "hi" ? "राष्ट्रीय एम्बुलेंस प्रेषण" : currentLang === "pa" ? "ਰਾਸ਼ਟਰੀ ਐਂਬੂਲੈਂਸ ਰਵਾਨਗੀ" : "National Ambulance Dispatch"}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* WhatsApp Emergency Coordination Desk */}
        <View style={styles.whatsappCard}>
          <View style={styles.whatsappTopRow}>
            <Text style={styles.whatsappSuper}>{currentLang === "hi" ? "शून्य-जमा बेड सहायता" : currentLang === "pa" ? "ਜ਼ੀਰੋ-ਡਿਪਾਜ਼ਿਟ ਬੈੱਡ ਸਹਾਇਤਾ" : "ZERO-DEPOSIT BED DESK"}</Text>
            <Text style={styles.whatsappPhone}>9592543404</Text>
          </View>

          <Text style={styles.whatsappTitle}>{t("home.whatsappDesk")}</Text>
          <Text style={styles.whatsappSub}>
            Connect instantly with Medi Route coordinators for zero upfront deposit bed reservation and nearest ICU priority intake.
          </Text>

          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={handleWhatsAppDesk}
            activeOpacity={0.85}
          >
            <Text style={styles.whatsappBtnIcon}>💬</Text>
            <View>
              <Text style={styles.whatsappBtnLabel}>Chat on WhatsApp (9592543404)</Text>
              <Text style={styles.whatsappBtnSub}>Instant Bed &amp; Admission Help</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Legal Rights Card — Zero Deposit Mandate */}
        <View style={styles.legalCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Text style={{ fontSize: 16 }}>⚖️</Text>
            <Text style={styles.legalTitle}>Supreme Court Zero-Deposit Mandate</Text>
          </View>
          <Text style={styles.legalText}>
            Under Supreme Court of India directives and PMJAY emergency guidelines, accredited hospitals cannot deny emergency stabilization or demand upfront cash deposits before admission.
          </Text>
        </View>

        {/* Nearest Trauma & ICU Centers */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{currentLang === "hi" ? "निकटतम आपातकालीन अस्पताल" : currentLang === "pa" ? "ਨਜ਼ਦੀਕੀ ਐਮਰਜੈਂਸੀ ਹਸਪਤਾਲ" : "Nearest Emergency Facilities"}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("MainTabs")}>
            <Text style={styles.sectionLink}>{t("common.viewAll")} ➔</Text>
          </TouchableOpacity>
        </View>

        {emergencyHospitals.map((hosp) => (
          <View key={hosp.id} style={styles.hospitalCard}>
            <View style={styles.hospCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hospName} numberOfLines={1}>{hosp.name}</Text>
                <Text style={styles.hospAddress}>📍 {hosp.address}</Text>
              </View>
              <View style={styles.distBadge}>
                <Text style={styles.distBadgeText}>{hosp.distance_km} km</Text>
              </View>
            </View>

            <View style={styles.hospMetricsRow}>
              <View style={styles.hospMetricPill}>
                <View style={styles.icuDot} />
                <Text style={styles.icuText}>{hosp.beds_icu_available ?? 6} ICU Beds Free</Text>
              </View>

              {hosp.is_pmjay_empanelled && (
                <View style={styles.pmjayPill}>
                  <Text style={styles.pmjayText}>✓ PMJAY Cashless</Text>
                </View>
              )}

              {hosp.is_trauma_center && (
                <View style={styles.traumaPill}>
                  <Text style={styles.traumaText}>⚡ Level {hosp.trauma_level || "1"} Trauma</Text>
                </View>
              )}
            </View>

            <View style={styles.hospCardActions}>
              <TouchableOpacity
                style={styles.hospCallBtn}
                onPress={() => Linking.openURL(`tel:${hosp.emergency_phone || hosp.phone || "108"}`)}
              >
                <Text style={styles.hospCallBtnText}>📞 Call ER Desk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.hospReserveBtn}
                onPress={handleWhatsAppDesk}
              >
                <Text style={styles.hospReserveBtnText}>Reserve Emergency Bed</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* First-Aid Emergency Guidance */}
        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Critical First-Aid Instructions</Text>
          <Text style={styles.sectionSub}>While Waiting for Ambulance</Text>
        </View>

        {/* Protocol Selector Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.protocolTabs}>
          {FIRST_AID_PROTOCOLS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.protocolTab,
                selectedProtocol === p.id && styles.protocolTabActive,
              ]}
              onPress={() => setSelectedProtocol(p.id)}
            >
              <Text style={styles.protocolTabIcon}>{p.icon}</Text>
              <Text
                style={[
                  styles.protocolTabText,
                  selectedProtocol === p.id && styles.protocolTabTextActive,
                ]}
              >
                {p.title.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Protocol Card */}
        {(() => {
          const proto = FIRST_AID_PROTOCOLS.find((p) => p.id === selectedProtocol) || FIRST_AID_PROTOCOLS[0];
          return (
            <View style={styles.protocolCard}>
              <View style={styles.protocolCardTop}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 24 }}>{proto.icon}</Text>
                  <Text style={styles.protocolCardTitle}>{proto.title}</Text>
                </View>
                <View style={styles.protoBadge}>
                  <Text style={styles.protoBadgeText}>{proto.badge}</Text>
                </View>
              </View>

              <View style={styles.stepsContainer}>
                {proto.steps.map((step, idx) => (
                  <View key={idx} style={styles.stepRow}>
                    <View style={styles.stepNumBubble}>
                      <Text style={styles.stepNumBubbleText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stepDescription}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#B91C1C",
  },
  header: {
    backgroundColor: "#B91C1C",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  liveGridBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
  },
  liveGridText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  dispatchCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
  },
  dispatchTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dispatchSuper: {
    fontSize: 10,
    fontWeight: "800",
    color: "#DC2626",
    letterSpacing: 0.8,
  },
  freeBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freeBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  dispatchTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#991B1B",
    marginBottom: 4,
  },
  dispatchSub: {
    fontSize: 12,
    color: "#7F1D1D",
    lineHeight: 17,
    marginBottom: 14,
  },
  call108Button: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  call108Icon: {
    fontSize: 26,
  },
  call108Label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  call108Number: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    fontWeight: "600",
  },
  whatsappCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
  },
  whatsappTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  whatsappSuper: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.8,
  },
  whatsappPhone: {
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },
  whatsappTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#065F46",
    marginBottom: 4,
  },
  whatsappSub: {
    fontSize: 12,
    color: "#064E3B",
    lineHeight: 17,
    marginBottom: 14,
  },
  whatsappButton: {
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  whatsappBtnIcon: {
    fontSize: 22,
  },
  whatsappBtnLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  whatsappBtnSub: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    fontWeight: "500",
  },
  legalCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  legalTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurface,
  },
  legalText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.secondary,
  },
  hospitalCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  hospCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  hospName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurface,
  },
  hospAddress: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  distBadge: {
    backgroundColor: colors.surfaceIce,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  distBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  hospMetricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  hospMetricPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  icuDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  icuText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },
  pmjayPill: {
    backgroundColor: colors.surfaceIce,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pmjayText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  traumaPill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  traumaText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D97706",
  },
  hospCardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  hospCallBtn: {
    flex: 1,
    backgroundColor: colors.surfaceIce,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  hospCallBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  hospReserveBtn: {
    flex: 1.2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  hospReserveBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  protocolTabs: {
    marginVertical: 4,
  },
  protocolTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 6,
  },
  protocolTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  protocolTabIcon: {
    fontSize: 14,
  },
  protocolTabText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSurface,
  },
  protocolTabTextActive: {
    color: "#FFFFFF",
  },
  protocolCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  protocolCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 10,
    marginBottom: 10,
  },
  protocolCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurface,
  },
  protoBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  protoBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#DC2626",
  },
  stepsContainer: {
    gap: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  stepNumBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceIce,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumBubbleText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.secondary,
  },
  stepDescription: {
    flex: 1,
    fontSize: 12,
    color: colors.onSurface,
    lineHeight: 18,
  },
});
