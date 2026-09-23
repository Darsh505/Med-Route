/**
 * CompareScreen.tsx — Mobile Hospital Comparison Matrix (Clinical Architecture Health)
 * Strictly matches stitch/stitch_healthcare_finder_and_comparison_platform/code.html
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
  Switch,
  Share,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

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
  turnaroundNote: string;
  turnaroundMinutes: number;
  upfrontDeposit: string;
  icuBeds: string;
  openIcus: string;
  deluxeTariff: string;
  tariffCoverage: string;
  accreditations: string[];
  nps: string;
  patientsTreated?: string;
  successRatio?: string;
  procedureTariff?: string;
}

const DEFAULT_HOSPITALS: CompareHospital[] = [
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
    turnaroundNote: "Apex Ayushman Mitra Desk",
    turnaroundMinutes: 18,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "88 Beds",
    openIcus: "14 open ICUs",
    deluxeTariff: "Subsidized Ward",
    tariffCoverage: "100% covered",
    accreditations: ["Apex Autonomous", "NABH", "Level 1 Trauma"],
    nps: "98%",
    patientsTreated: "24,500 / yr",
    successRatio: "98.5% Success",
    procedureTariff: "100% Free (PMJAY Cashless)",
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
    turnaroundNote: "Max Priority TPA Desk",
    turnaroundMinutes: 25,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "45 Beds",
    openIcus: "8 open ICUs",
    deluxeTariff: "₹5,200",
    tariffCoverage: "100% covered",
    accreditations: ["NABH", "JCI Global", "Level 2 Trauma"],
    nps: "95%",
    patientsTreated: "16,200 / yr",
    successRatio: "97.8% Success",
    procedureTariff: "₹1,45,000 (or ₹0 PMJAY)",
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
    turnaroundNote: "Priority corridor",
    turnaroundMinutes: 28,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "52 Beds",
    openIcus: "6 open ICUs",
    deluxeTariff: "₹5,600",
    tariffCoverage: "100% covered",
    accreditations: ["NABH", "NABL", "Level 2 Trauma"],
    nps: "94%",
    patientsTreated: "15,800 / yr",
    successRatio: "97.4% Success",
    procedureTariff: "₹1,55,000 (or ₹0 PMJAY)",
  },
];

const AVAILABLE_TO_ADD: CompareHospital[] = [
  {
    id: "civil-hoshiarpur",
    name: "Civil Hospital Hoshiarpur",
    shortName: "Civil Hosp",
    location: "Mall Road, Hoshiarpur",
    distance: "4.2 km",
    eta: "10m ETA",
    rating: 4.3,
    imageUrl: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80",
    cashlessEligibility: "100% Cashless",
    approvalTurnaround: "15 mins",
    turnaroundNote: "District EMR Desk",
    turnaroundMinutes: 15,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "18 Beds",
    openIcus: "3 open ICUs",
    deluxeTariff: "Free Ward",
    tariffCoverage: "100% covered",
    accreditations: ["NQAS Certified", "Government"],
    nps: "91%",
    patientsTreated: "18,900 / yr",
    successRatio: "96.2% Success",
    procedureTariff: "100% Free / Subsidized",
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
    cashlessEligibility: "100% Cashless",
    approvalTurnaround: "22 mins",
    turnaroundNote: "TPA Desk",
    turnaroundMinutes: 22,
    upfrontDeposit: "₹0 Deposit",
    icuBeds: "22 Beds",
    openIcus: "5 open ICUs",
    deluxeTariff: "₹4,200",
    tariffCoverage: "100% covered",
    accreditations: ["NABH", "NABL"],
    nps: "93%",
    patientsTreated: "11,400 / yr",
    successRatio: "97.1% Success",
    procedureTariff: "₹85,000 (or ₹0 PMJAY)",
  },
];

export default function CompareScreen({ navigation }: any) {
  const [hospitals, setHospitals] = useState<CompareHospital[]>(DEFAULT_HOSPITALS);
  const [diffOnly, setDiffOnly] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [bookedHospId, setBookedHospId] = useState<string | null>(null);

  const removeHospital = (id: string) => {
    if (hospitals.length <= 1) {
      alert("At least 1 hospital must remain in comparison.");
      return;
    }
    setHospitals((prev) => prev.filter((h) => h.id !== id));
  };

  const addHospital = (h: CompareHospital) => {
    if (hospitals.some((item) => item.id === h.id)) return;
    if (hospitals.length >= 4) {
      alert("Maximum 4 hospitals can be compared.");
      return;
    }
    setHospitals((prev) => [...prev, h]);
    setAddModalOpen(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Compare hospitals side-by-side on Medi Route for cashless pre-auth and live ICU bed status.",
      });
    } catch {}
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
          <View>
            <Text style={styles.headerTitle}>Hospital Comparison</Text>
            <Text style={styles.headerSub}>Side-by-side clinical benchmark</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareIcon}>🔗 Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Hospital Chips Strip */}
        <View style={styles.dockCard}>
          <View style={styles.hospChipsRow}>
            {hospitals.map((h, idx) => (
              <View key={h.id} style={styles.hospChip}>
                <View style={styles.chipNumBadge}>
                  <Text style={styles.chipNumText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.chipName} numberOfLines={1}>
                    {h.shortName}
                  </Text>
                  <Text style={styles.chipLoc} numberOfLines={1}>
                    {h.location}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeHospital(h.id)} style={{ padding: 2 }}>
                  <Text style={styles.chipClose}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {hospitals.length < 4 && (
              <TouchableOpacity
                style={styles.addHospBtn}
                onPress={() => setAddModalOpen(true)}
              >
                <Text style={styles.addHospBtnText}>+ Add Hospital</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Toggle Diff Strip */}
          <View style={styles.toggleStrip}>
            <View style={styles.diffToggleRow}>
              <Switch
                value={diffOnly}
                onValueChange={setDiffOnly}
                trackColor={{ false: colors.borderSubtle, true: colors.brandBlue }}
                thumbColor="#FFFFFF"
              />
              <Text style={styles.diffLabel}>Show differences only</Text>
            </View>

            <View style={styles.starBadge}>
              <Text style={styles.starBadgeText}>🛡️ Star Health</Text>
            </View>
          </View>
        </View>

        {/* Benchmark Matrix Table */}
        <View style={styles.tableCard}>
          {/* Hospital Headers Row (Horizontal Scroll) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Top Overview Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCellLabel, { justifyContent: "flex-end" }]}>
                  <Text style={styles.metricSuper}>METRICS</Text>
                  <Text style={styles.metricMainHeader}>Hospital Overview</Text>
                </View>

                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellHeader}>
                    <Image source={{ uri: h.imageUrl }} style={styles.tableHospImage} />
                    <View style={styles.tableHospInfo}>
                      <Text style={styles.tableHospName} numberOfLines={1}>{h.name}</Text>
                      <Text style={styles.tableHospDist}>{h.distance} • {h.location}</Text>
                      <View style={styles.tableRatingPill}>
                        <Text style={{ fontSize: 10, color: colors.badgeRating }}>★</Text>
                        <Text style={styles.tableRatingVal}>{h.rating}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Section 1: Cashless & Insurance Pre-Auth */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderText}>CASHLESS &amp; INSURANCE PRE-AUTH</Text>
              </View>

              {!diffOnly && (
                <View style={styles.tableRow}>
                  <View style={styles.tableCellLabel}>
                    <Text style={styles.rowTitle}>Cashless Eligibility</Text>
                    <Text style={styles.rowSub}>Star Health Network</Text>
                  </View>
                  {hospitals.map((h) => (
                    <View key={h.id} style={styles.tableCellData}>
                      <Text style={[styles.cellValueBold, { color: colors.badgeCashless }]}>
                        ✓ {h.cashlessEligibility}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={[styles.tableRow, { backgroundColor: colors.canvas }]}>
                <View style={styles.tableCellLabel}>
                  <Text style={styles.rowTitle}>Approval Turnaround</Text>
                  <Text style={styles.rowSub}>Median clearance</Text>
                </View>
                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellData}>
                    <Text style={[styles.cellValueBig, h.turnaroundMinutes <= 30 && { color: colors.secondary }]}>
                      {h.approvalTurnaround}
                    </Text>
                    <Text style={styles.rowSub}>{h.turnaroundNote}</Text>
                  </View>
                ))}
              </View>

              {!diffOnly && (
                <View style={styles.tableRow}>
                  <View style={styles.tableCellLabel}>
                    <Text style={styles.rowTitle}>Upfront Deposit</Text>
                    <Text style={styles.rowSub}>Under pre-auth guarantee</Text>
                  </View>
                  {hospitals.map((h) => (
                    <View key={h.id} style={styles.tableCellData}>
                      <Text style={[styles.cellValueBold, { color: colors.badgeCashless }]}>
                        {h.upfrontDeposit}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Section: Mandatory Verifiable Metrics */}
              <View style={[styles.sectionHeaderRow, { backgroundColor: "#E0F2FE" }]}>
                <Text style={[styles.sectionHeaderText, { color: "#0369A1" }]}>
                  MANDATORY VERIFIABLE CLINICAL METRICS
                </Text>
              </View>

              <View style={styles.tableRow}>
                <View style={styles.tableCellLabel}>
                  <Text style={styles.rowTitle}>Annual Patient Volume</Text>
                  <Text style={styles.rowSub}>Patients treated / yr</Text>
                </View>
                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellData}>
                    <Text style={styles.cellValueBold}>{h.patientsTreated || "16,500 / yr"}</Text>
                    <Text style={styles.rowSub}>Audited clinical volume</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.tableRow, { backgroundColor: colors.canvas }]}>
                <View style={styles.tableCellLabel}>
                  <Text style={styles.rowTitle}>Clinical Success Ratio</Text>
                  <Text style={styles.rowSub}>Verified outcome rate</Text>
                </View>
                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellData}>
                    <Text style={[styles.cellValueBold, { color: colors.success }]}>
                      {h.successRatio || "98% Success"}
                    </Text>
                    <Text style={styles.rowSub}>Post-op success</Text>
                  </View>
                ))}
              </View>

              <View style={styles.tableRow}>
                <View style={styles.tableCellLabel}>
                  <Text style={styles.rowTitle}>Angioplasty Tariff</Text>
                  <Text style={styles.rowSub}>PMJAY MC004 Stent</Text>
                </View>
                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellData}>
                    <Text style={[styles.cellValueBold, { color: colors.primary }]}>
                      {h.procedureTariff || "100% Cashless"}
                    </Text>
                    <Text style={styles.rowSub}>Package ceiling</Text>
                  </View>
                ))}
              </View>

              {/* Section 2: Ward & Bed Capacity */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderText}>WARD &amp; BED CAPACITY</Text>
              </View>

              <View style={styles.tableRow}>
                <View style={styles.tableCellLabel}>
                  <Text style={styles.rowTitle}>Live ICU Beds</Text>
                  <Text style={styles.rowSub}>Verified telemetry</Text>
                </View>
                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellData}>
                    <Text style={styles.cellValueBold}>{h.icuBeds}</Text>
                    <Text style={[styles.rowSub, { color: colors.badgeCashless, fontWeight: "700" }]}>
                      {h.openIcus}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.tableRow, { backgroundColor: colors.canvas }]}>
                <View style={styles.tableCellLabel}>
                  <Text style={styles.rowTitle}>Single Deluxe Tariff</Text>
                  <Text style={styles.rowSub}>Cap: ₹6,000/day</Text>
                </View>
                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellData}>
                    <Text style={styles.cellValueBold}>{h.deluxeTariff}</Text>
                    <Text style={[styles.rowSub, { color: colors.badgeCashless, fontWeight: "700" }]}>
                      {h.tariffCoverage}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Section 3: Clinical Quality & Ratings */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderText}>CLINICAL QUALITY &amp; RATINGS</Text>
              </View>

              <View style={styles.tableRow}>
                <View style={styles.tableCellLabel}>
                  <Text style={styles.rowTitle}>Accreditations</Text>
                  <Text style={styles.rowSub}>Safety standards</Text>
                </View>
                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellData}>
                    <Text style={styles.cellValueBold}>{h.accreditations.join(" • ")}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.tableRow, { backgroundColor: colors.canvas }]}>
                <View style={styles.tableCellLabel}>
                  <Text style={styles.rowTitle}>Net Promoter Score</Text>
                  <Text style={styles.rowSub}>Patient feedback</Text>
                </View>
                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellData}>
                    <Text style={[styles.cellValueBig, { color: colors.secondary }]}>{h.nps}</Text>
                    <Text style={styles.rowSub}>Recommended</Text>
                  </View>
                ))}
              </View>

              {/* Direct Admission CTAs */}
              <View style={styles.tableRow}>
                <View style={styles.tableCellLabel}>
                  <Text style={styles.rowTitle}>Direct Admission</Text>
                  <Text style={styles.rowSub}>Lock tariff rate</Text>
                </View>
                {hospitals.map((h) => (
                  <View key={h.id} style={styles.tableCellData}>
                    <TouchableOpacity
                      style={[
                        styles.tableActionBtn,
                        bookedHospId === h.id && styles.tableActionBtnSuccess,
                      ]}
                      onPress={() => {
                        setBookedHospId(h.id);
                        setTimeout(() => setBookedHospId(null), 3000);
                      }}
                    >
                      <Text style={styles.tableActionBtnText}>
                        {bookedHospId === h.id ? "Reserved!" : "Book Cashless"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Comparative Bento Cards */}
        <View style={styles.bentoContainer}>
          {/* Card 1: Speed Benchmark */}
          <View style={styles.bentoCard}>
            <Text style={styles.bentoSuper}>SPEED BENCHMARK</Text>
            <Text style={styles.bentoTitle}>Median Approval Time</Text>
            <Text style={styles.bentoDesc}>Pre-auth clearance across corridor.</Text>

            <View style={{ marginTop: 12 }}>
              {hospitals.map((h) => (
                <View key={h.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.barLabel}>{h.shortName}</Text>
                    <Text style={styles.barVal}>{h.approvalTurnaround}</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.min(100, (h.turnaroundMinutes / 60) * 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Card 2: Geo Proximity */}
          <View style={styles.bentoCard}>
            <Text style={styles.bentoSuper}>GEO PROXIMITY</Text>
            <Text style={styles.bentoTitle}>Ambulance &amp; Distance</Text>
            <Text style={styles.bentoDesc}>Active GPS trajectory from your location.</Text>

            <View style={styles.geoGrid}>
              {hospitals.map((h) => (
                <View key={h.id} style={styles.geoBox}>
                  <Text style={styles.geoName}>{h.shortName}</Text>
                  <Text style={styles.geoDist}>{h.distance}</Text>
                  <Text style={styles.geoEta}>{h.eta}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card 3: Policy Protection */}
          <View style={styles.bentoCard}>
            <Text style={styles.bentoSuper}>POLICY PROTECTION</Text>
            <Text style={styles.bentoTitle}>Star Health Room Cap</Text>
            <Text style={styles.bentoDesc}>100% pre-authorized under daily ceiling limit.</Text>

            <View style={styles.capRow}>
              <View style={styles.capCol}>
                <Text style={styles.capVal}>100%</Text>
                <Text style={styles.capSub}>Pre-Authorized</Text>
              </View>
              <View style={styles.capCol}>
                <Text style={styles.capVal}>₹0</Text>
                <Text style={styles.capSub}>Room Co-Pay</Text>
              </View>
              <View style={styles.capCol}>
                <Text style={styles.capVal}>0hr</Text>
                <Text style={styles.capSub}>Wait Period</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Frequently Asked Questions */}
        <View style={styles.faqCard}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <Text style={styles.faqSub}>How Medi Route coordinates clinical comparisons.</Text>

          {[
            {
              q: "How does Medi Route calculate the cashless approval guarantee?",
              a: "Medi Route interfaces directly via IRDAI-compliant API gateways to the hospital TPA desk. Approvals are cleared in under 28 minutes.",
            },
            {
              q: "What happens if room tariff exceeds policy ceiling?",
              a: "Our system calculates daily room limits dynamically and alerts you to avoid out-of-pocket deductions upfront.",
            },
            {
              q: "Can I switch hospitals if ICU beds fill up?",
              a: "Yes. Our Care Buddy coordinates re-routing your pre-auth dossier to any partner hospital without restarting insurer paperwork.",
            },
          ].map((item, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.faqItem}
                onPress={() => setExpandedFaq(isExpanded ? null : idx)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQ}>{item.q}</Text>
                  <Text style={styles.faqToggle}>{isExpanded ? "▲" : "▼"}</Text>
                </View>
                {isExpanded && <Text style={styles.faqA}>{item.a}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Add Hospital Modal */}
      <Modal visible={addModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalTop}>
              <Text style={styles.modalHeaderTitle}>Add Network Hospital</Text>
              <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                <Text style={{ fontSize: 18, color: colors.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {AVAILABLE_TO_ADD.filter(
                (a) => !hospitals.some((h) => h.id === a.id)
              ).map((avail) => (
                <TouchableOpacity
                  key={avail.id}
                  style={styles.availItem}
                  onPress={() => addHospital(avail)}
                >
                  <View>
                    <Text style={styles.availName}>{avail.name}</Text>
                    <Text style={styles.availLoc}>{avail.location}</Text>
                  </View>
                  <Text style={styles.availTag}>100% Cashless</Text>
                </TouchableOpacity>
              ))}
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
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
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
    backgroundColor: colors.surfaceIce,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
  headerSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  shareBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceIce,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  shareIcon: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.secondary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    padding: 16,
  },
  dockCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
  },
  hospChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hospChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    maxWidth: (SCREEN_WIDTH - 64) / 2,
  },
  chipNumBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  chipNumText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  chipName: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSurface,
  },
  chipLoc: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  chipClose: {
    fontSize: 11,
    color: colors.textTertiary,
    marginLeft: 2,
  },
  addHospBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceIce,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    justifyContent: "center",
  },
  addHospBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  toggleStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  diffToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  diffLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurface,
  },
  starBadge: {
    backgroundColor: colors.surfaceIce,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  starBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  tableCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tableCellLabel: {
    width: 140,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
    backgroundColor: colors.card,
  },
  metricSuper: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.outline,
    letterSpacing: 0.5,
  },
  metricMainHeader: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurface,
    marginTop: 2,
  },
  tableCellHeader: {
    width: 150,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
    backgroundColor: colors.card,
  },
  tableHospImage: {
    width: "100%",
    height: 70,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainer,
  },
  tableHospInfo: {
    marginTop: 6,
  },
  tableHospName: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurface,
  },
  tableHospDist: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  tableRatingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tableRatingVal: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.onSurface,
  },
  sectionHeaderRow: {
    backgroundColor: colors.canvas,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: 0.5,
  },
  tableCellData: {
    width: 150,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSurface,
  },
  rowSub: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1,
  },
  cellValueBold: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurface,
  },
  cellValueBig: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
  },
  tableActionBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center",
  },
  tableActionBtnSuccess: {
    backgroundColor: colors.badgeCashless,
  },
  tableActionBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  bentoContainer: {
    gap: 12,
    marginBottom: 16,
  },
  bentoCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  bentoSuper: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  bentoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 1,
  },
  bentoDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  barLabel: {
    fontSize: 11,
    color: colors.onSurface,
    fontWeight: "600",
  },
  barVal: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.secondary,
  },
  barBg: {
    height: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 3,
    marginTop: 3,
  },
  barFill: {
    height: 6,
    backgroundColor: colors.secondary,
    borderRadius: 3,
  },
  geoGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  geoBox: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
  },
  geoName: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  geoDist: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurface,
    marginVertical: 2,
  },
  geoEta: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  capRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    backgroundColor: colors.canvas,
    borderRadius: 8,
    padding: 10,
  },
  capCol: {
    alignItems: "center",
  },
  capVal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.badgeCashless,
  },
  capSub: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
  },
  faqCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  faqTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  faqSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  faqItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQ: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.onSurface,
    flex: 1,
    paddingRight: 8,
  },
  faqToggle: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  faqA: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 6,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.65)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    marginBottom: 10,
  },
  modalHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  availItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  availName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurface,
  },
  availLoc: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  availTag: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.badgeCashless,
  },
});
