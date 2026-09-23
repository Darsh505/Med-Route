/**
 * SOSScreen.tsx — Mobile Emergency & Cashless Admission (Clinical Architecture Health)
 * Strictly matches stitch/stitch_healthcare_finder_and_comparison_platform (1)/code.html
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

export default function SOSScreen({ navigation }: any) {
  // Pre-Auth Checker State
  const [policyId, setPolicyId] = useState("STAR-2024-8849-BLR");
  const [selectedHospital, setSelectedHospital] = useState("Sakra World Hospital");
  const [tokenGenerated, setTokenGenerated] = useState(false);

  // Emergency Telemetry Modal
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [targetHospital, setTargetHospital] = useState("Sakra World Hospital");

  const triggerSOS = (hosp: string) => {
    setTargetHospital(hosp);
    setSosModalOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Emergency &amp; Cashless</Text>
            <Text style={styles.headerSub}>Live Telemetry &amp; 20-Min Admission</Text>
          </View>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.livePulse} />
          <Text style={styles.statusPillText}>Live Grid</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. IMMEDIATE MEDICAL RESPONSE MASTER CARD */}
        <View style={styles.masterCard}>
          <View style={styles.masterBadgeRow}>
            <Text style={styles.masterSuper}>IMMEDIATE MEDICAL RESPONSE</Text>
          </View>

          <Text style={styles.masterTitle}>Need an Emergency Ambulance &amp; Bed?</Text>
          <Text style={styles.masterDesc}>
            ALS/BLS cardiac ambulances routed immediately with real-time GPS telemetry and reserved emergency bed admission.
          </Text>

          <View style={styles.statsStrip}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Live ICU Beds</Text>
              <Text style={styles.statVal}>118 Open</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Avg. Dispatch</Text>
              <Text style={[styles.statVal, { color: colors.secondaryContainer }]}>12 Mins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Deposit</Text>
              <Text style={styles.statVal}>₹0 Upfront</Text>
            </View>
          </View>

          <View style={styles.masterActions}>
            <TouchableOpacity
              style={styles.masterCallBtn}
              onPress={() => Linking.openURL("tel:18006334768")}
            >
              <Text style={styles.masterCallText}>📞 Call 1800-MEDI-ROUTE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.masterSosBtn}
              onPress={() => triggerSOS("Apollo Hospitals, Bannerghatta")}
            >
              <Text style={styles.masterSosText}>🚨 Request Ambulance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. PRE-AUTH SELF-SERVICE TERMINAL */}
        <View style={styles.terminalCard}>
          <View style={styles.terminalHeader}>
            <View>
              <Text style={styles.terminalSuper}>SELF-SERVICE TERMINAL</Text>
              <Text style={styles.terminalTitle}>Pre-Auth Simulator</Text>
            </View>
            <View style={styles.tpaLockBadge}>
              <Text style={styles.tpaLockText}>🔒 TPA Encrypted</Text>
            </View>
          </View>

          {/* Step 1 */}
          <View style={styles.stepBox}>
            <Text style={styles.stepNum}>STEP 01</Text>
            <Text style={styles.stepLabel}>Policy or ABHA ID</Text>
            <TextInput
              style={styles.stepInput}
              value={policyId}
              onChangeText={setPolicyId}
              placeholder="e.g. 14-digit ABHA / Policy ID"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={styles.stepVerify}>✓ Verified with IRDAI Registry</Text>
          </View>

          {/* Step 2 */}
          <View style={styles.stepBox}>
            <Text style={styles.stepNum}>STEP 02</Text>
            <Text style={styles.stepLabel}>Network Hospital</Text>
            <View style={styles.stepInputMock}>
              <Text style={styles.stepInputMockText}>{selectedHospital}</Text>
            </View>
            <Text style={styles.stepVerify}>✓ Medi Route Care Desk Active</Text>
          </View>

          {/* Step 3 */}
          <View style={styles.stepBox}>
            <Text style={styles.stepNum}>STEP 03</Text>
            <Text style={styles.stepLabel}>Instant Pre-Auth Limit</Text>
            <Text style={styles.stepSumText}>₹10,00,000</Text>

            <View style={styles.stepMetaRow}>
              <Text style={styles.stepMetaKey}>Room Category:</Text>
              <Text style={styles.stepMetaVal}>Single Private Deluxe</Text>
            </View>
            <View style={styles.stepMetaRow}>
              <Text style={styles.stepMetaKey}>Upfront Deposit:</Text>
              <Text style={[styles.stepMetaVal, { color: colors.secondary }]}>Waived (₹0)</Text>
            </View>

            <TouchableOpacity
              style={styles.tokenGenBtn}
              onPress={() => setTokenGenerated(true)}
            >
              <Text style={styles.tokenGenBtnText}>Generate Admission Token</Text>
            </TouchableOpacity>

            {tokenGenerated && (
              <View style={styles.tokenSuccessBox}>
                <Text style={styles.tokenSuccessTitle}>Token #MR-8829-BLR Generated!</Text>
                <Text style={styles.tokenSuccessSub}>
                  Present at Reception Desk 4 for instant cashless admission without deposit.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 3. 20-MINUTE WORKFLOW TIMELINE */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineSuper}>SURGICAL-GRADE PRECISION</Text>
          <Text style={styles.timelineTitle}>How We Secure Cashless in 20 Mins</Text>

          <View style={styles.timelineList}>
            {[
              { num: "1", time: "0 - 3 min", title: "Digital Intake & ABHA Link", desc: "OCR parses policy credentials without paperwork." },
              { num: "2", time: "3 - 8 min", title: "TPA Gateway Sync", desc: "Automated pre-underwriting validates active coverage." },
              { num: "3", time: "8 - 15 min", title: "Zero-Deposit Guarantee", desc: "Medi Route issues direct cashless guarantee to billing." },
              { num: "4", time: "15 - 20 min", title: "Express Room Allotment", desc: "Proceed straight to inpatient room with Care Buddy." },
            ].map((step) => (
              <View key={step.num} style={styles.timelineItem}>
                <View style={styles.timelineCircle}>
                  <Text style={styles.timelineCircleText}>{step.num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.timelineStepTitle}>{step.title}</Text>
                    <Text style={styles.timelineStepTime}>{step.time}</Text>
                  </View>
                  <Text style={styles.timelineStepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 4. EMERGENCY TRAUMA CENTERS ROSTER */}
        <View style={styles.rosterCard}>
          <Text style={styles.rosterSuper}>LIVE HOSPITAL ROSTER</Text>
          <Text style={styles.rosterTitle}>Bangalore Trauma Hubs &amp; Bed Grid</Text>

          {[
            { name: "Manipal Hospital", loc: "Old Airport Road, Kodihalli", dist: "2.4 km", icu: "9 Open", phone: "08025024444" },
            { name: "Apollo Hospitals", loc: "Bannerghatta Main Rd", dist: "5.1 km", icu: "14 Open", phone: "08026304050" },
            { name: "Sakra World Hospital", loc: "Outer Ring Rd, Marathahalli", dist: "1.2 km", icu: "6 Open", phone: "08049694969" },
          ].map((center) => (
            <View key={center.name} style={styles.centerItem}>
              <View style={styles.centerTop}>
                <View>
                  <Text style={styles.centerName}>{center.name}</Text>
                  <Text style={styles.centerLoc}>{center.loc}</Text>
                </View>
                <View style={styles.centerDistBadge}>
                  <Text style={styles.centerDistText}>{center.dist}</Text>
                </View>
              </View>

              <View style={styles.centerIcuBox}>
                <Text style={styles.centerIcuLabel}>Live ICU Status</Text>
                <Text style={styles.centerIcuVal}>● {center.icu} ICU Beds</Text>
              </View>

              <View style={styles.centerActions}>
                <TouchableOpacity
                  style={styles.centerCallBtn}
                  onPress={() => Linking.openURL(`tel:${center.phone}`)}
                >
                  <Text style={styles.centerCallText}>📞 Call Desk</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.centerSosBtn}
                  onPress={() => triggerSOS(center.name)}
                >
                  <Text style={styles.centerSosText}>Route SOS</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* SOS TELEMETRY MODAL */}
      {sosModalOpen && (
        <Modal visible={sosModalOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.sosModalBox}>
              <View style={styles.sosModalTop}>
                <Text style={styles.sosModalHeading}>🚨 Ambulance Dispatched!</Text>
                <TouchableOpacity onPress={() => setSosModalOpen(false)}>
                  <Text style={{ fontSize: 18, color: colors.textSecondary }}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sosTelemetryData}>
                <View style={styles.sosDataRow}>
                  <Text style={styles.sosDataKey}>Assigned Vehicle:</Text>
                  <Text style={styles.sosDataVal}>KA-01-MJ-9921 (Cardiac ALS)</Text>
                </View>
                <View style={styles.sosDataRow}>
                  <Text style={styles.sosDataKey}>Driver &amp; Paramedic:</Text>
                  <Text style={styles.sosDataVal}>Suraj P. (+91 98450-XXXXX)</Text>
                </View>
                <View style={styles.sosDataRow}>
                  <Text style={styles.sosDataKey}>Reserved Facility:</Text>
                  <Text style={styles.sosDataVal}>{targetHospital}</Text>
                </View>
                <View style={styles.sosDataRow}>
                  <Text style={styles.sosDataKey}>Live ETA:</Text>
                  <Text style={[styles.sosDataVal, { color: colors.secondary }]}>8 Mins (GPS Tracked)</Text>
                </View>
                <View style={styles.sosDataRow}>
                  <Text style={styles.sosDataKey}>Deposit Status:</Text>
                  <Text style={[styles.sosDataVal, { color: colors.badgeCashless }]}>Waived (₹0)</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.sosHotlineBtn}
                onPress={() => Linking.openURL("tel:18006334768")}
              >
                <Text style={styles.sosHotlineText}>📞 Call Dispatch Desk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 11,
    color: colors.primaryLight,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(13, 148, 136, 0.25)",
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.badgeCashless,
  },
  statusPillText: {
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
  },
  masterCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  masterBadgeRow: {
    marginBottom: 6,
  },
  masterSuper: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.secondaryContainer,
    letterSpacing: 0.5,
  },
  masterTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 26,
    marginBottom: 6,
  },
  masterDesc: {
    fontSize: 12,
    color: colors.primaryLight,
    lineHeight: 18,
    marginBottom: 14,
  },
  statsStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginBottom: 14,
  },
  statCol: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    color: colors.primaryLight,
  },
  statVal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  masterActions: {
    flexDirection: "row",
    gap: 8,
  },
  masterCallBtn: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  masterCallText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  masterSosBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  masterSosText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  terminalCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
  },
  terminalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  terminalSuper: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  terminalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },
  tpaLockBadge: {
    backgroundColor: colors.surfaceIce,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tpaLockText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  stepBox: {
    backgroundColor: colors.canvas,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 10,
  },
  stepNum: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.secondary,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurface,
    marginTop: 2,
    marginBottom: 6,
  },
  stepInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  stepInputMock: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  stepInputMockText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurface,
  },
  stepVerify: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.badgeCashless,
    marginTop: 6,
  },
  stepSumText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
  },
  stepMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  stepMetaKey: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  stepMetaVal: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSurface,
  },
  tokenGenBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  tokenGenBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tokenSuccessBox: {
    backgroundColor: colors.surfaceIce,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tokenSuccessTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  tokenSuccessSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  timelineCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
  },
  timelineSuper: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 12,
  },
  timelineList: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  timelineCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceIce,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineCircleText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.secondary,
  },
  timelineStepTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.onSurface,
  },
  timelineStepTime: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  timelineStepDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  rosterCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
  },
  rosterSuper: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.error,
    letterSpacing: 0.5,
  },
  rosterTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 12,
  },
  centerItem: {
    backgroundColor: colors.canvas,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 10,
  },
  centerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  centerName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurface,
  },
  centerLoc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  centerDistBadge: {
    backgroundColor: colors.surfaceIce,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  centerDistText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  centerIcuBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  centerIcuLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  centerIcuVal: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.badgeCashless,
  },
  centerActions: {
    flexDirection: "row",
    gap: 8,
  },
  centerCallBtn: {
    flex: 1,
    backgroundColor: colors.surfaceIce,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  centerCallText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  centerSosBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  centerSosText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.7)",
    justifyContent: "center",
    padding: 20,
  },
  sosModalBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sosModalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sosModalHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.error,
  },
  sosTelemetryData: {
    backgroundColor: colors.canvas,
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sosDataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sosDataKey: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sosDataVal: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.onSurface,
  },
  sosHotlineBtn: {
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  sosHotlineText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
