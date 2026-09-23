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

const getFirstAidProtocols = (lang: string) => [
  {
    id: "cardiac",
    icon: "💔",
    title: lang === "hi" ? "हार्ट अटैक / सीने में तेज़ दर्द" : lang === "pa" ? "ਦਿਲ ਦਾ ਦੌਰਾ / ਛਾਤੀ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ" : "Heart Attack / Severe Chest Pain",
    badge: lang === "hi" ? "अति-गंभीर 0-10 मिनट" : lang === "pa" ? "ਬਹੁਤ ਗੰਭੀਰ 0-10 ਮਿੰਟ" : "CRITICAL 0-10 MIN",
    steps: lang === "hi"
      ? [
          "मरीज को आराम से सीधा बैठाएं। उन्हें चलने न दें।",
          "यदि होश में हैं और एलर्जी नहीं है, तो 300mg एस्पिरिन टैबलेट चबाने को कहें।",
          "सांस लेने में सहायता के लिए गर्दन और छाती के आसपास के कपड़े ढीले करें।",
          "तुरंत 108 एम्बुलेंस को कॉल करें — खुद गाड़ी न चलाएं।",
        ]
      : lang === "pa"
      ? [
          "ਮਰੀਜ਼ ਨੂੰ ਆਰਾਮ ਨਾਲ ਸਿੱਧਾ ਬਿਠਾਓ। ਉਹਨਾਂ ਨੂੰ ਤੁਰਨ ਨਾ ਦਿਓ।",
          "ਜੇਕਰ ਹੋਸ਼ ਵਿੱਚ ਹਨ ਅਤੇ ਕੋਈ ਐਲਰਜੀ ਨਹੀਂ ਹੈ, ਤਾਂ 300 ਮਿਲੀਗ੍ਰਾਮ ਐਸਪਰੀਨ ਚਬਾਉਣ ਲਈ ਕਹੋ।",
          "ਸਾਹ ਲੈਣ ਵਿੱਚ ਮਦਦ ਲਈ ਗਰਦਨ ਅਤੇ ਛਾਤੀ ਦੇ ਆਲੇ-ਦੁਆਲੇ ਤੰਗ ਕੱਪੜੇ ਢਿੱਲੇ ਕਰੋ।",
          "ਤੁਰੰਤ 108 ਐਂਬੂਲੈਂਸ ਨੂੰ ਕਾਲ ਕਰੋ — ਖੁਦ ਗੱਡੀ ਨਾ ਚਲਾਓ।",
        ]
      : [
          "Keep the patient seated upright at rest. Do not let them walk.",
          "If conscious and not allergic, have them chew a 300mg soluble Aspirin tablet.",
          "Loosen tight clothing around neck and chest to assist breathing.",
          "Call 108 ambulance immediately — do not drive yourself.",
        ],
  },
  {
    id: "stroke",
    icon: "🧠",
    title: lang === "hi" ? "स्ट्रोक आपातकाल (F.A.S.T.)" : lang === "pa" ? "ਸਟ੍ਰੋਕ ਐਮਰਜੈਂਸੀ (F.A.S.T.)" : "Stroke Emergency (F.A.S.T.)",
    badge: lang === "hi" ? "अति-गंभीर 0-4.5 घंटे" : lang === "pa" ? "ਬਹੁਤ ਗੰਭੀਰ 0-4.5 ਘੰਟੇ" : "CRITICAL 0-4.5 HRS",
    steps: lang === "hi"
      ? [
          "चेहरा: मुस्कुराने को कहें। क्या चेहरे का एक हिस्सा झुक रहा है?",
          "हाथ: दोनों हाथ ऊपर उठाने को कहें। क्या एक हाथ नीचे गिरता है?",
          "आवाज: एक सरल वाक्य दोहराने को कहें। क्या आवाज लड़खड़ा रही है?",
          "समय: तुरंत 108 पर कॉल करें। लक्षण शुरू होने का सटीक समय नोट करें।",
        ]
      : lang === "pa"
      ? [
          "ਚਿਹਰਾ: ਮੁਸਕਰਾਉਣ ਲਈ ਕਹੋ। ਕੀ ਚਿਹਰੇ ਦਾ ਇੱਕ ਪਾਸਾ ਲਟਕ ਰਿਹਾ ਹੈ?",
          "ਬਾਹਵਾਂ: ਦੋਵੇਂ ਬਾਹਵਾਂ ਚੁੱਕਣ ਲਈ ਕਹੋ। ਕੀ ਇੱਕ ਬਾਂਹ ਹੇਠਾਂ ਵੱਲ ਡਿੱਗਦੀ ਹੈ?",
          "ਬੋਲਣਾ: ਇੱਕ ਸਧਾਰਨ ਵਾਕ ਬੋਲਣ ਲਈ ਕਹੋ। ਕੀ ਬੋਲਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਹੈ?",
          "ਸਮਾਂ: ਤੁਰੰਤ 108 'ਤੇ ਕਾਲ ਕਰੋ। ਲੱਛਣ ਸ਼ੁਰੂ ਹੋਣ ਦਾ ਸਹੀ ਸਮਾਂ ਨੋਟ ਕਰੋ।",
        ]
      : [
          "Face: Ask to smile. Does one side of the face droop?",
          "Arms: Ask to raise both arms. Does one arm drift downward?",
          "Speech: Ask to repeat a simple sentence. Is speech slurred or strange?",
          "Time: Call 108 immediately. Note the exact time symptoms started.",
        ],
  },
  {
    id: "trauma",
    icon: "🩸",
    title: lang === "hi" ? "गंभीर रक्तस्राव एवं चोट (ट्रॉमा)" : lang === "pa" ? "ਗੰਭੀਰ ਖੂਨ ਵਹਿਣਾ ਅਤੇ ਸੱਟ (ਟਰੌਮਾ)" : "Severe Bleeding & Trauma",
    badge: lang === "hi" ? "तत्काल दबाव बनाएं" : lang === "pa" ? "ਤੁਰੰਤ ਦਬਾਅ ਪਾਓ" : "IMMEDIATE PRESSURE",
    steps: lang === "hi"
      ? [
          "साफ कपड़े या पट्टी से घाव पर लगातार सीधा दबाव डालें।",
          "यदि फ्रैक्चर न हो, तो घायल अंग को दिल के स्तर से ऊपर उठाएं।",
          "शरीर में चुभी हुई वस्तु को न निकालें — उसके चारों ओर पट्टी बांधें।",
          "108 टीम की प्रतीक्षा करते समय मरीज को कंबल से ढक कर रखें।",
        ]
      : lang === "pa"
      ? [
          "ਸਾਫ਼ ਕੱਪੜੇ ਜਾਂ ਪੱਟੀ ਨਾਲ ਜ਼ਖ਼ਮ 'ਤੇ ਲਗਾਤਾਰ ਸਿੱਧਾ ਦਬਾਅ ਪਾਓ।",
          "ਜੇਕਰ ਹੱਡੀ ਟੁੱਟਣ ਦਾ ਸ਼ੱਕ ਨਾ ਹੋਵੇ, ਤਾਂ ਜ਼ਖਮੀ ਅੰਗ ਨੂੰ ਦਿਲ ਦੇ ਪੱਧਰ ਤੋਂ ਉੱਚਾ ਚੁੱਕੋ।",
          "ਸਰੀਰ ਵਿੱਚ ਖੁੱਭੀ ਹੋਈ ਕਿਸੇ ਵੀ ਚੀਜ਼ ਨੂੰ ਬਾਹਰ ਨਾ ਕੱਢੋ — ਉਸਦੇ ਆਲੇ-ਦੁਆਲੇ ਪੱਟੀ ਬੰਨ੍ਹੋ।",
          "108 ਟੀਮ ਦੀ ਉਡੀਕ ਕਰਦੇ ਸਮੇਂ ਮਰੀਜ਼ ਨੂੰ ਕੰਬਲ ਨਾਲ ਨਿੱਘਾ ਰੱਖੋ।",
        ]
      : [
          "Apply firm, continuous direct pressure to wound using a clean cloth or gauze.",
          "Elevate the injured limb above heart level if no fracture is suspected.",
          "Do NOT remove any embedded or impaled objects — pack around them.",
          "Keep patient warm with a blanket while waiting for the 108 team.",
        ],
  },
  {
    id: "breathing",
    icon: "🫁",
    title: lang === "hi" ? "गंभीर सांस फूलना / अस्थमा" : lang === "pa" ? "ਗੰਭੀਰ ਸਾਹ ਚੜ੍ਹਨਾ / ਦਮਾ" : "Acute Breathlessness / Asthma",
    badge: lang === "hi" ? "सांस मार्ग प्राथमिकता" : lang === "pa" ? "ਸਾਹ ਨਾਲੀ ਤਰਜੀਹ" : "AIRWAY PRIORITY",
    steps: lang === "hi"
      ? [
          "मरीज को थोड़ा आगे झुकाकर सीधा बैठाएं। उन्हें लेटने न दें।",
          "उनके इनहेलर के 2 पफ लेने में सहायता करें।",
          "ताजी हवा सुनिश्चित करें और भीड़ को दूर रखें।",
          "यदि होंठ नीले पड़ें या मरीज बोल न पाए, तो तुरंत 108 बुलाएं।",
        ]
      : lang === "pa"
      ? [
          "ਮਰੀਜ਼ ਨੂੰ ਥੋੜ੍ਹਾ ਅੱਗੇ ਝੁਕਾ ਕੇ ਸਿੱਧਾ ਬਿਠਾਓ। ਉਹਨਾਂ ਨੂੰ ਸਿੱਧਾ ਨਾ ਲੰਮਾ ਪਾਓ।",
          "ਉਹਨਾਂ ਦੇ ਇਨਹੇਲਰ ਦੇ 2 ਪੱਫ ਲੈਣ ਵਿੱਚ ਮਦਦ ਕਰੋ।",
          "ਤਾਜ਼ੀ ਹਵਾ ਯਕੀਨੀ ਬਣਾਓ ਅਤੇ ਭੀੜ ਨੂੰ ਦੂਰ ਰੱਖੋ।",
          "ਜੇਕਰ ਬੁੱਲ੍ਹ ਨੀਲੇ ਪੈ ਜਾਣ ਜਾਂ ਮਰੀਜ਼ ਬੋਲ ਨਾ ਸਕੇ, ਤਾਂ ਤੁਰੰਤ 108 ਸੱਦੋ।",
        ]
      : [
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
  const firstAidProtocols = React.useMemo(() => getFirstAidProtocols(currentLang), [currentLang]);

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
            <Text style={styles.dispatchSuper}>{t("sos.freeAmbulance")}</Text>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>{t("sos.govtService")}</Text>
            </View>
          </View>

          <Text style={styles.dispatchTitle}>{t("sos.call108Hotline")}</Text>
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
              <Text style={styles.call108Label}>{t("sos.tapToCall108")}</Text>
              <Text style={styles.call108Number}>{t("sos.nationalDispatch")}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* WhatsApp Emergency Coordination Desk */}
        <View style={styles.whatsappCard}>
          <View style={styles.whatsappTopRow}>
            <Text style={styles.whatsappSuper}>{t("sos.zeroDepositDesk")}</Text>
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
              <Text style={styles.whatsappBtnLabel}>{t("sos.chatOnWhatsapp")}</Text>
              <Text style={styles.whatsappBtnSub}>{t("sos.instantBedHelp")}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Legal Rights Card — Zero Deposit Mandate */}
        <View style={styles.legalCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Text style={{ fontSize: 16 }}>⚖️</Text>
            <Text style={styles.legalTitle}>{t("sos.supremeCourtMandate")}</Text>
          </View>
          <Text style={styles.legalText}>
            Under Supreme Court of India directives and PMJAY emergency guidelines, accredited hospitals cannot deny emergency stabilization or demand upfront cash deposits before admission.
          </Text>
        </View>

        {/* Nearest Trauma & ICU Centers */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t("sos.nearestFacilities")}</Text>
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
          <Text style={styles.sectionTitle}>{t("sos.firstAidTitle")}</Text>
          <Text style={styles.sectionSub}>{t("sos.whileWaiting")}</Text>
        </View>

        {/* Protocol Selector Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.protocolTabs}>
          {firstAidProtocols.map((p) => (
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
          const proto = firstAidProtocols.find((p) => p.id === selectedProtocol) || firstAidProtocols[0];
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
