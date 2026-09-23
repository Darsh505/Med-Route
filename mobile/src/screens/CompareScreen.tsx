/**
 * CompareScreen.tsx — Mobile 2-Hospital Side-by-Side Comparison
 * Optimized for mobile screens with zero horizontal scrolling.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Share,
  Modal,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors } from "../theme/colors";
import MedRouteLogo from "../components/MedRouteLogo";
import { localizeHospital, localizeHospitalName, localizeAddress, localizeAccreditation, localizeTurnaround, localizeTariff } from "../i18n/hospitalLocalization";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CompareHospital {
  id: string;
  name: string;
  shortName: string;
  location: string;
  distance: string;
  eta: string;
  rating: number;
  imageUrl: string;
  cashlessEligibility: string;
  approvalTurnaround: string;
  turnaroundMinutes: number;
  upfrontDeposit: string;
  icuBeds: string;
  openIcus: string;
  deluxeTariff: string;
  accreditations: string[];
  patientsTreated?: string;
  successRatio?: string;
  procedureTariff?: string;
  phone?: string;
}

const ALL_COMPARE_HOSPITALS: CompareHospital[] = [
  {
    id: "pgimer-chandigarh",
    name: "PGIMER Chandigarh",
    shortName: "PGIMER",
    location: "Sector 12, Chandigarh",
    distance: "3.2 km",
    eta: "10m ETA",
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80",
    cashlessEligibility: "100% Cashless (PMJAY)",
    approvalTurnaround: "18 mins",
    turnaroundMinutes: 18,
    upfrontDeposit: "₹0 Waived",
    icuBeds: "88 Beds",
    openIcus: "14 Open ICUs",
    deluxeTariff: "Subsidized Ward",
    accreditations: ["Apex Autonomous", "NABH", "Level 1 Trauma"],
    patientsTreated: "24,500 / yr",
    successRatio: "98.5% Success",
    procedureTariff: "100% Free (PMJAY)",
    phone: "01722747585",
  },
  {
    id: "max-mohali",
    name: "Max Super Speciality Hospital",
    shortName: "Max Mohali",
    location: "Phase 6, Mohali",
    distance: "5.8 km",
    eta: "14m ETA",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
    cashlessEligibility: "100% Cashless (PMJAY)",
    approvalTurnaround: "25 mins",
    turnaroundMinutes: 25,
    upfrontDeposit: "₹0 Waived",
    icuBeds: "45 Beds",
    openIcus: "8 Open ICUs",
    deluxeTariff: "₹5,200 / day",
    accreditations: ["NABH", "JCI Global", "Level 2 Trauma"],
    patientsTreated: "16,200 / yr",
    successRatio: "97.8% Success",
    procedureTariff: "₹1,45,000 (or ₹0 PMJAY)",
    phone: "01725212000",
  },
  {
    id: "fortis-mohali",
    name: "Fortis Hospital Mohali",
    shortName: "Fortis Mohali",
    location: "Sector 62, Mohali",
    distance: "7.1 km",
    eta: "17m ETA",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80",
    cashlessEligibility: "100% Cashless (PMJAY)",
    approvalTurnaround: "28 mins",
    turnaroundMinutes: 28,
    upfrontDeposit: "₹0 Waived",
    icuBeds: "52 Beds",
    openIcus: "6 Open ICUs",
    deluxeTariff: "₹5,600 / day",
    accreditations: ["NABH", "NABL", "Level 2 Trauma"],
    patientsTreated: "15,800 / yr",
    successRatio: "97.4% Success",
    procedureTariff: "₹1,55,000 (or ₹0 PMJAY)",
    phone: "01725021222",
  },
  {
    id: "civil-hoshiarpur",
    name: "Civil Hospital Hoshiarpur",
    shortName: "Civil Hosp",
    location: "Mall Road, Hoshiarpur",
    distance: "4.2 km",
    eta: "10m ETA",
    rating: 4.3,
    imageUrl: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80",
    cashlessEligibility: "100% Cashless (PMJAY)",
    approvalTurnaround: "15 mins",
    turnaroundMinutes: 15,
    upfrontDeposit: "₹0 Waived",
    icuBeds: "18 Beds",
    openIcus: "4 Open ICUs",
    deluxeTariff: "Free Ward",
    accreditations: ["NQAS Certified", "Govt"],
    patientsTreated: "18,900 / yr",
    successRatio: "96.2% Success",
    procedureTariff: "100% Free (PMJAY)",
    phone: "01882220108",
  },
  {
    id: "ivy-hoshiarpur",
    name: "Ivy Hospital Hoshiarpur",
    shortName: "Ivy Hosp",
    location: "Chandigarh Rd, Hoshiarpur",
    distance: "6.1 km",
    eta: "14m ETA",
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80",
    cashlessEligibility: "100% Cashless (PMJAY)",
    approvalTurnaround: "22 mins",
    turnaroundMinutes: 22,
    upfrontDeposit: "₹0 Waived",
    icuBeds: "22 Beds",
    openIcus: "5 Open ICUs",
    deluxeTariff: "₹4,200 / day",
    accreditations: ["NABH", "NABL"],
    patientsTreated: "11,400 / yr",
    successRatio: "97.1% Success",
    procedureTariff: "₹85,000 (or ₹0 PMJAY)",
    phone: "01882500000",
  },
];

export default function CompareScreen({ navigation, route }: any) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const [hosp1Id, setHosp1Id] = useState<string>("pgimer-chandigarh");
  const [hosp2Id, setHosp2Id] = useState<string>("max-mohali");
  const [pickerModalSlot, setPickerModalSlot] = useState<1 | 2 | null>(null);

  const hosp1 = ALL_COMPARE_HOSPITALS.find((h) => h.id === hosp1Id) || ALL_COMPARE_HOSPITALS[0];
  const hosp2 = ALL_COMPARE_HOSPITALS.find((h) => h.id === hosp2Id) || ALL_COMPARE_HOSPITALS[1];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Comparing ${hosp1.name} vs ${hosp2.name} on Med Route: Live ICU Beds, Pre-Auth Turnaround & Cashless Tariffs.`,
      });
    } catch {}
  };

  const swapHospitals = () => {
    const temp = hosp1Id;
    setHosp1Id(hosp2Id);
    setHosp2Id(temp);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <MedRouteLogo size="sm" showBadge={false} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.headerTitle}>{t("compare.title")}</Text>
            <Text style={styles.headerSub}>{t("compare.subtitle")}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          <TouchableOpacity style={styles.swapBtn} onPress={swapHospitals}>
            <Text style={styles.swapBtnText}>⇄ {t("compare.swap")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareIcon}>🔗</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top 2 Hospitals Header Cards (50% / 50% Split) */}
        <View style={styles.topCardsRow}>
          {/* Hospital 1 */}
          <View style={styles.hospColumnCard}>
            <Image source={{ uri: hosp1.imageUrl }} style={styles.hospImage} />
            <Text style={styles.columnTag}>{t("compare.hospitalA")}</Text>
            <Text style={styles.hospName} numberOfLines={2}>{hosp1.name}</Text>
            <Text style={styles.hospLoc} numberOfLines={1}>📍 {hosp1.location}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{t("compare.ratingScore", { rating: hosp1.rating })}</Text>
            </View>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => setPickerModalSlot(1)}
            >
              <Text style={styles.changeBtnText}>{t("compare.change")}</Text>
            </TouchableOpacity>
          </View>

          {/* Hospital 2 */}
          <View style={styles.hospColumnCard}>
            <Image source={{ uri: hosp2.imageUrl }} style={styles.hospImage} />
            <Text style={[styles.columnTag, { color: colors.secondary }]}>{t("compare.hospitalB")}</Text>
            <Text style={styles.hospName} numberOfLines={2}>{hosp2.name}</Text>
            <Text style={styles.hospLoc} numberOfLines={1}>📍 {hosp2.location}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{t("compare.ratingScore", { rating: hosp2.rating })}</Text>
            </View>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => setPickerModalSlot(2)}
            >
              <Text style={styles.changeBtnText}>{t("compare.change")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* METRIC 1: Live ICU Beds */}
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>🛏️ LIVE ICU BEDS AVAILABLE</Text>
          <View style={styles.metricComparisonRow}>
            <View style={[styles.metricValBox, styles.metricHighlight]}>
              <Text style={styles.metricValPrimary}>{hosp1.openIcus}</Text>
              <Text style={styles.metricSub}>{hosp1.icuBeds} Total</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricValBox}>
              <Text style={styles.metricValPrimary}>{hosp2.openIcus}</Text>
              <Text style={styles.metricSub}>{hosp2.icuBeds} Total</Text>
            </View>
          </View>
        </View>

        {/* METRIC 2: Pre-Auth Clearance Time */}
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>⚡ {t("compare.turnaroundTitle")}</Text>
          <View style={styles.metricComparisonRow}>
            <View style={styles.metricValBox}>
              <Text style={[styles.metricValPrimary, hosp1.turnaroundMinutes <= hosp2.turnaroundMinutes && { color: "#16A34A" }]}>
                {hosp1.approvalTurnaround}
              </Text>
              <Text style={styles.metricSub}>
                {hosp1.turnaroundMinutes <= hosp2.turnaroundMinutes ? t("compare.fasterApproval") : t("compare.standardSpeed")}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricValBox}>
              <Text style={[styles.metricValPrimary, hosp2.turnaroundMinutes <= hosp1.turnaroundMinutes && { color: "#16A34A" }]}>
                {hosp2.approvalTurnaround}
              </Text>
              <Text style={styles.metricSub}>
                {hosp2.turnaroundMinutes <= hosp1.turnaroundMinutes ? t("compare.fasterApproval") : t("compare.standardSpeed")}
              </Text>
            </View>
          </View>
        </View>

        {/* METRIC 3: Cashless & PMJAY Eligibility */}
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>🛡️ {t("compare.cashlessTitle")}</Text>
          <View style={styles.metricComparisonRow}>
            <View style={styles.metricValBox}>
              <Text style={styles.metricValPrimary}>{hosp1.cashlessEligibility}</Text>
              <Text style={styles.metricSub}>{t("compare.zeroOutOfPocket")}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricValBox}>
              <Text style={styles.metricValPrimary}>{hosp2.cashlessEligibility}</Text>
              <Text style={styles.metricSub}>{t("compare.zeroOutOfPocket")}</Text>
            </View>
          </View>
        </View>

        {/* METRIC 4: Upfront Security Deposit */}
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>💰 {t("compare.depositTitle")}</Text>
          <View style={styles.metricComparisonRow}>
            <View style={styles.metricValBox}>
              <Text style={[styles.metricValPrimary, { color: "#16A34A" }]}>{hosp1.upfrontDeposit}</Text>
              <Text style={styles.metricSub}>{t("compare.waivedAtIntake")}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricValBox}>
              <Text style={[styles.metricValPrimary, { color: "#16A34A" }]}>{hosp2.upfrontDeposit}</Text>
              <Text style={styles.metricSub}>{t("compare.waivedAtIntake")}</Text>
            </View>
          </View>
        </View>

        {/* METRIC 5: Estimated Package Cost */}
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>📊 {t("compare.packageTitle")}</Text>
          <View style={styles.metricComparisonRow}>
            <View style={styles.metricValBox}>
              <Text style={styles.metricValPrimary}>{hosp1.procedureTariff}</Text>
              <Text style={styles.metricSub}>{hosp1.deluxeTariff}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricValBox}>
              <Text style={styles.metricValPrimary}>{hosp2.procedureTariff}</Text>
              <Text style={styles.metricSub}>{hosp2.deluxeTariff}</Text>
            </View>
          </View>
        </View>

        {/* METRIC 6: Quality & Accreditation */}
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>🏅 {t("compare.accreditationTitle")}</Text>
          <View style={styles.metricComparisonRow}>
            <View style={styles.metricValBox}>
              <Text style={styles.metricValPrimary}>{hosp1.accreditations.join(" • ")}</Text>
              <Text style={styles.metricSub}>{hosp1.successRatio}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricValBox}>
              <Text style={styles.metricValPrimary}>{hosp2.accreditations.join(" • ")}</Text>
              <Text style={styles.metricSub}>{hosp2.successRatio}</Text>
            </View>
          </View>
        </View>

        {/* ACTION BUTTONS (50% / 50% Split) */}
        <View style={styles.actionsRow}>
          <View style={{ flex: 1, gap: 6 }}>
            <TouchableOpacity
              style={styles.actionCallBtn}
              onPress={() => Linking.openURL(`tel:${hosp1.phone || "108"}`)}
            >
              <Text style={styles.actionCallText}>📞 {t("compare.callHospital", { name: hosp1.shortName })}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionDetailBtn}
              onPress={() => navigation.navigate("HospitalDetail", { slug: hosp1.id })}
            >
              <Text style={styles.actionDetailText}>{t("compare.viewDetails")}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, gap: 6 }}>
            <TouchableOpacity
              style={styles.actionCallBtn}
              onPress={() => Linking.openURL(`tel:${hosp2.phone || "108"}`)}
            >
              <Text style={styles.actionCallText}>📞 {t("compare.callHospital", { name: hosp2.shortName })}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionDetailBtn}
              onPress={() => navigation.navigate("HospitalDetail", { slug: hosp2.id })}
            >
              <Text style={styles.actionDetailText}>{t("compare.viewDetails")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Hospital Picker Modal */}
      <Modal visible={pickerModalSlot !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("compare.selectHospital", { slot: pickerModalSlot })}</Text>
              <TouchableOpacity onPress={() => setPickerModalSlot(null)} style={{ padding: 4 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {ALL_COMPARE_HOSPITALS.map((h) => {
                const isSelected = (pickerModalSlot === 1 && h.id === hosp1Id) || (pickerModalSlot === 2 && h.id === hosp2Id);
                return (
                  <TouchableOpacity
                    key={h.id}
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => {
                      if (pickerModalSlot === 1) setHosp1Id(h.id);
                      if (pickerModalSlot === 2) setHosp2Id(h.id);
                      setPickerModalSlot(null);
                    }}
                  >
                    <Image source={{ uri: h.imageUrl }} style={styles.modalItemImg} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalItemName}>{h.name}</Text>
                      <Text style={styles.modalItemLoc}>{h.location} • ★ {h.rating}</Text>
                      <Text style={styles.modalItemIcu}>● {h.openIcus}</Text>
                    </View>
                    {isSelected && <Text style={styles.modalItemCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
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
    fontSize: 20,
    fontWeight: "700",
    color: colors.onSurface,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.onSurface,
  },
  headerSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  swapBtn: {
    backgroundColor: colors.surfaceIce,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  swapBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  shareBtn: {
    backgroundColor: colors.surfaceIce,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  shareIcon: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
  topCardsRow: {
    flexDirection: "row",
    gap: 10,
  },
  hospColumnCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  hospImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  columnTag: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  hospName: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurface,
    marginTop: 2,
    minHeight: 32,
  },
  hospLoc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
  },
  changeBtn: {
    backgroundColor: colors.surfaceIce,
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  changeBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 8,
    textAlign: "center",
  },
  metricComparisonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricValBox: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  metricHighlight: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    paddingVertical: 6,
  },
  metricDivider: {
    width: 1,
    height: "80%",
    backgroundColor: colors.borderSubtle,
  },
  metricValPrimary: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurface,
    textAlign: "center",
  },
  metricSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionCallBtn: {
    backgroundColor: colors.surfaceIce,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  actionCallText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  actionDetailBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionDetailText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  modalItemSelected: {
    backgroundColor: colors.surfaceIce,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  modalItemImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  modalItemName: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurface,
  },
  modalItemLoc: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  modalItemIcu: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },
  modalItemCheck: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
});
