/**
 * HomeScreen.tsx — Mobile Home Screen (Clinical Architecture Health System)
 * Strictly matches the visual identity, tokens, and components of stitch (4)/code.html
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { MOCK_HOSPITALS, MobileHospital } from "../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MobileHospitalItem {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  liveIcu: number;
  roomAvailable: string;
  turnaround: string;
  qualityBadge: string;
  imageUrl: string;
  emergencyPhone: string;
  metrics: { label: string; value: string; isIcu?: boolean; isQuality?: boolean; isDesk?: boolean }[];
  tags: { label: string; isCheck?: boolean }[];
}

export default function HomeScreen({ navigation }: any) {
  // Search & Filter State
  const [cityInput, setCityInput] = useState("Bangalore, Indiranagar");
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("all");

  // Fast Filters
  const [cashlessOnly, setCashlessOnly] = useState(true);
  const [liveIcuOnly, setLiveIcuOnly] = useState(false);
  const [accreditedOnly, setAccreditedOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Discovery Filter
  const [distanceRadius, setDistanceRadius] = useState(15);
  const [sortBy, setSortBy] = useState<"relevance" | "beds" | "rating" | "turnaround">("relevance");

  // Pagination State (4 hospitals per tab)
  const [currentPage, setCurrentPage] = useState(1);
  const HOSPITALS_PER_PAGE = 4;

  // Comparison State
  const [comparedIds, setComparedIds] = useState<string[]>(["sakra", "aster-cmi"]);

  // Modal State
  const [activeModal, setActiveModal] = useState<{ type: "beds" | "admission"; hospital: MobileHospitalItem } | null>(null);
  const [admissionSuccess, setAdmissionSuccess] = useState(false);

  // Toggle Compare
  const toggleCompare = (id: string) => {
    setComparedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) {
          alert("Maximum 4 hospitals can be compared.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Hospital Data
  const hospitalList: MobileHospitalItem[] = useMemo(() => {
    let list: MobileHospitalItem[] = MOCK_HOSPITALS.map((h: MobileHospital) => {
      const isSakra = h.name.toLowerCase().includes("sakra");
      const isAster = h.name.toLowerCase().includes("aster");
      const isManipal = h.name.toLowerCase().includes("manipal");
      const isApollo = h.name.toLowerCase().includes("apollo");
      const isFortis = h.name.toLowerCase().includes("fortis");

      let liveIcu = h.beds_icu_available || 10;
      let turnaround = "15-20 min";
      let roomAvailable = "14 Deluxe Free";
      let qualityBadge = "NABH Accredited";
      let distance = h.distance_km || 4.2;
      let rating = h.overall_rating || 4.8;
      let reviewCount = h.total_reviews || 1840;

      let metrics: { label: string; value: string; isIcu?: boolean; isQuality?: boolean; isDesk?: boolean }[] = [];
      let tags: { label: string; isCheck?: boolean }[] = [];

      if (isSakra) {
        liveIcu = 12;
        turnaround = "Instant (Avg 14m)";
        roomAvailable = "18 Deluxe Free";
        qualityBadge = "NABH & JCI Gold";
        distance = 4.2;
        rating = 4.9;
        reviewCount = 1840;
        metrics = [
          { label: "Room Eligibility", value: "18 Deluxe Free" },
          { label: "Live ICU Status", value: "12 Open ICUs", isIcu: true },
          { label: "Pre-Auth Track", value: "Instant (Avg 14m)" },
          { label: "Quality Standard", value: "NABH & JCI Gold", isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Robotic Orthopedics" },
          { label: "Emergency 24x7 Cath Lab" },
        ];
      } else if (isAster) {
        liveIcu = 9;
        turnaround = "20-min Fast Track";
        roomAvailable = "12 Deluxe Free";
        qualityBadge = "NABH • NABL";
        distance = 8.1;
        rating = 4.8;
        reviewCount = 2110;
        metrics = [
          { label: "TPA Desk", value: "20-min Fast Track" },
          { label: "Medi Route Desk", value: "Counter #4 (Dedicated)", isDesk: true },
          { label: "ICU Readiness", value: "9 Open CCU/ICU", isIcu: true },
          { label: "Accreditations", value: "NABH • NABL", isQuality: true },
        ];
        tags = [
          { label: "Zero-Deposit Admission Protocol", isCheck: true },
          { label: "Organ Transplant Center" },
          { label: "Neuro Surgery Team" },
        ];
      } else if (isManipal) {
        liveIcu = 10;
        turnaround = "28 mins (Fast)";
        roomAvailable = "22 Deluxe Free";
        qualityBadge = "NABH • JCI";
        distance = 5.2;
        rating = 4.8;
        reviewCount = 3450;
        metrics = [
          { label: "Room Eligibility", value: "22 Deluxe Free" },
          { label: "Live ICU Status", value: "10 Open ICUs", isIcu: true },
          { label: "Pre-Auth Track", value: "28 mins (Fast)" },
          { label: "Quality Standard", value: "NABH • JCI", isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Cardiac Science Center" },
          { label: "Emergency 24x7 Trauma Desk" },
        ];
      } else if (isApollo) {
        liveIcu = 14;
        turnaround = "45 mins (Priority)";
        roomAvailable = "16 Deluxe Free";
        qualityBadge = "NABH • JCI Global";
        distance = 11.4;
        rating = 4.7;
        reviewCount = 4120;
        metrics = [
          { label: "Room Eligibility", value: "16 Deluxe Free" },
          { label: "Live ICU Status", value: "14 Open ICUs", isIcu: true },
          { label: "Pre-Auth Track", value: "45 mins (Priority)" },
          { label: "Quality Standard", value: "NABH • JCI Global", isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Advanced Oncology Wing" },
          { label: "Zero Upfront Security" },
        ];
      } else if (isFortis) {
        liveIcu = 12;
        turnaround = "38 mins (Priority)";
        roomAvailable = "15 Deluxe Free";
        qualityBadge = "NABH • NABL";
        distance = 7.1;
        rating = 4.6;
        reviewCount = 2980;
        metrics = [
          { label: "Room Eligibility", value: "15 Deluxe Free" },
          { label: "Live ICU Status", value: "12 Open ICUs", isIcu: true },
          { label: "Pre-Auth Track", value: "38 mins (Priority)" },
          { label: "Quality Standard", value: "NABH • NABL", isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Robotic Surgery Desk" },
          { label: "Emergency 24x7 Cath Lab" },
        ];
      } else {
        metrics = [
          { label: "Room Eligibility", value: roomAvailable },
          { label: "Live ICU Status", value: `${liveIcu} Open ICUs`, isIcu: true },
          { label: "Pre-Auth Track", value: turnaround },
          { label: "Quality Standard", value: qualityBadge, isQuality: true },
        ];
        tags = [
          { label: "Star / HDFC / Care Cashless Approved", isCheck: true },
          { label: "Robotic Surgery Desk" },
          { label: "Emergency 24x7 Cath Lab" },
        ];
      }

      return {
        id: h.id,
        name: h.name,
        address: h.address,
        distance,
        rating,
        reviewCount,
        liveIcu,
        roomAvailable,
        turnaround,
        qualityBadge,
        imageUrl: (h as any).image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80",
        emergencyPhone: h.emergency_phone || "18006334768",
        metrics,
        tags,
      };
    });

    if (cashlessOnly) {
      // All displayed are cashless
    }
    if (liveIcuOnly) {
      list = list.filter((h) => h.liveIcu > 8);
    }
    if (accreditedOnly) {
      list = list.filter((h) => h.qualityBadge.includes("NABH") || h.qualityBadge.includes("JCI"));
    }
    if (specialtyInput.trim()) {
      const term = specialtyInput.toLowerCase();
      list = list.filter((h) => h.name.toLowerCase().includes(term));
    }
    list = list.filter((h) => h.distance <= distanceRadius);

    if (sortBy === "beds") {
      list.sort((a, b) => b.liveIcu - a.liveIcu);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "turnaround") {
      list.sort((a, b) => (a.turnaround.includes("Instant") ? -1 : 1));
    } else {
      list.sort((a, b) => a.distance - b.distance);
    }

    return list;
  }, [cashlessOnly, liveIcuOnly, accreditedOnly, specialtyInput, distanceRadius, sortBy]);

  // Reset pagination to page 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [cashlessOnly, liveIcuOnly, accreditedOnly, emergencyOnly, specialtyInput, distanceRadius, sortBy, cityInput]);

  const totalPages = Math.ceil(hospitalList.length / HOSPITALS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedHospitals = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * HOSPITALS_PER_PAGE;
    return hospitalList.slice(startIndex, startIndex + HOSPITALS_PER_PAGE);
  }, [hospitalList, safeCurrentPage]);

  // Dynamic pagination items: 1, 2, ..., last
  const paginationItems = useMemo(() => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 2) {
      return [1, 2, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 1) {
      return [1, "...", totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage, "...", totalPages];
  }, [totalPages, safeCurrentPage]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. TOP INSTITUTIONAL HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>🏥</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Medi Route</Text>
            <TouchableOpacity
              style={styles.locationPill}
              onPress={() => navigation.navigate("SelectLocation")}
            >
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.locationText}>{cityInput}</Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.emergencyBtn}
          onPress={() => Linking.openURL("tel:18006334768")}
        >
          <Text style={styles.emergencyIcon}>📞</Text>
          <View>
            <Text style={styles.emergencySub}>24x7 Hotline</Text>
            <Text style={styles.emergencyTitle}>1800-MEDI</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. PAGE TITLE LEAD */}
        <View style={styles.pageTitleBlock}>
          <Text style={styles.heroHeading}>Find Verified Network Hospitals</Text>
          <Text style={styles.heroSub}>
            Access 10,000+ cashless partner hospitals, track real-time ICU beds, and verify insurance acceptance with zero upfront friction.
          </Text>
        </View>

        {/* 3. MULTI-FIELD SEARCH HUB */}
        <View style={styles.searchHubCard}>
          {/* Locality Input */}
          <View style={styles.searchField}>
            <Text style={styles.fieldLabel}>CITY / LOCALITY</Text>
            <View style={styles.inputRow}>
              <Text style={styles.fieldIcon}>📍</Text>
              <TextInput
                style={styles.textInput}
                value={cityInput}
                onChangeText={setCityInput}
                placeholder="e.g. Bangalore, Indiranagar"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>

          {/* Specialty / Doctor Input */}
          <View style={[styles.searchField, { marginTop: 10 }]}>
            <Text style={styles.fieldLabel}>SPECIALTY, HOSPITAL OR DOCTOR</Text>
            <View style={styles.inputRow}>
              <Text style={styles.fieldIcon}>🩺</Text>
              <TextInput
                style={styles.textInput}
                value={specialtyInput}
                onChangeText={setSpecialtyInput}
                placeholder="Cardiology, Aster, Ortho..."
                placeholderTextColor={colors.textTertiary}
              />
              {specialtyInput ? (
                <TouchableOpacity onPress={() => setSpecialtyInput("")}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Quick Specialty Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChipsScroll}>
            {["Cardiology", "Orthopedics", "Oncology", "Neurology", "Gynecology"].map((spec) => (
              <TouchableOpacity
                key={spec}
                style={[
                  styles.specChip,
                  specialtyInput.includes(spec) && styles.specChipActive,
                ]}
                onPress={() => setSpecialtyInput(spec)}
              >
                <Text
                  style={[
                    styles.specChipText,
                    specialtyInput.includes(spec) && styles.specChipTextActive,
                  ]}
                >
                  {spec}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Find Button */}
          <TouchableOpacity
            style={styles.findBtn}
            onPress={() => {}}
          >
            <Text style={styles.findBtnText}>🔍 Find Network Hospitals</Text>
          </TouchableOpacity>
        </View>

        {/* 4. FAST FILTERS ROW */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.fastFiltersScroll}
          contentContainerStyle={styles.fastFiltersContainer}
        >
          <TouchableOpacity
            style={[styles.filterPill, cashlessOnly && styles.filterPillActive]}
            onPress={() => setCashlessOnly(!cashlessOnly)}
          >
            <Text style={styles.filterPillIcon}>🛡️</Text>
            <Text style={[styles.filterPillText, cashlessOnly && styles.filterPillTextActive]}>
              Cashless Network
            </Text>
            {cashlessOnly && <Text style={styles.checkIcon}> ✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, liveIcuOnly && styles.filterPillActive]}
            onPress={() => setLiveIcuOnly(!liveIcuOnly)}
          >
            <Text style={styles.filterPillIcon}>🛏️</Text>
            <Text style={[styles.filterPillText, liveIcuOnly && styles.filterPillTextActive]}>
              Live ICU Beds
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, accreditedOnly && styles.filterPillActive]}
            onPress={() => setAccreditedOnly(!accreditedOnly)}
          >
            <Text style={styles.filterPillIcon}>🏅</Text>
            <Text style={[styles.filterPillText, accreditedOnly && styles.filterPillTextActive]}>
              NABH / JCI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, emergencyOnly && styles.filterPillActive]}
            onPress={() => setEmergencyOnly(!emergencyOnly)}
          >
            <Text style={styles.filterPillIcon}>⚡</Text>
            <Text style={[styles.filterPillText, emergencyOnly && styles.filterPillTextActive]}>
              24x7 Emergency
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 5. EMERGENCY ZERO-DEPOSIT TRIAGE BANNER */}
        <View style={styles.emergencyBanner}>
          <View style={styles.emergencyBannerTop}>
            <View style={styles.beaconDot} />
            <Text style={styles.emergencyBannerTitle}>
              Priority Zero-Deposit Emergency Triage Desk
            </Text>
          </View>
          <Text style={styles.emergencyBannerDesc}>
            Need instant bed reservation without upfront security deposit? Medi Route TPA field officers take over approvals in under 20 minutes.
          </Text>
          <View style={styles.emergencyBannerActions}>
            <TouchableOpacity
              style={styles.bannerCallBtn}
              onPress={() => Linking.openURL("tel:18006334768")}
            >
              <Text style={styles.bannerCallBtnText}>📞 1800-MEDI-ROUTE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bannerWhatsAppBtn}
              onPress={() => Linking.openURL("https://wa.me/9118006334768?text=Hello%20Medi%20Route,%20I%20need%20urgent%20hospital%20admission%20assistance.")}
            >
              <Text style={styles.bannerWhatsAppBtnText}>💬 WhatsApp Desk</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. DISCOVERY & DISTANCE BAR */}
        <View style={styles.discoveryHeader}>
          <View>
            <Text style={styles.resultsCount}>
              {hospitalList.length} Verified Hospitals
            </Text>
            <Text style={styles.resultsSub}>
              Showing {hospitalList.length > 0 ? (safeCurrentPage - 1) * HOSPITALS_PER_PAGE + 1 : 0} -{" "}
              {Math.min(safeCurrentPage * HOSPITALS_PER_PAGE, hospitalList.length)} of {hospitalList.length}
            </Text>
          </View>

          <View style={styles.radiusPills}>
            {[
              { km: 5, count: 4 },
              { km: 15, count: 9 },
              { km: 25, count: 14 },
            ].map((item) => (
              <TouchableOpacity
                key={item.km}
                style={[
                  styles.radiusPill,
                  distanceRadius === item.km && styles.radiusPillActive,
                ]}
                onPress={() => setDistanceRadius(item.km)}
              >
                <Text
                  style={[
                    styles.radiusPillText,
                    distanceRadius === item.km && styles.radiusPillTextActive,
                  ]}
                >
                  {distanceRadius === item.km ? "☑" : "☐"} {item.km}km ({item.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 7. STRUCTURED HOSPITAL CARDS (4 Hospitals per Page) */}
        {paginatedHospitals.map((hospital) => {
          const isCompared = comparedIds.includes(hospital.id);

          return (
            <View key={hospital.id} style={styles.hospitalCard}>
              {/* Card Top: Image & Header */}
              <View style={styles.cardHeader}>
                <Image source={{ uri: hospital.imageUrl }} style={styles.hospitalThumb} />
                <View style={styles.cardHeaderInfo}>
                  <View style={styles.badgeRow}>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>
                        {Math.round(hospital.distance * 3)}m • {hospital.distance} km
                      </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.starText}>★</Text>
                      <Text style={styles.ratingText}>{hospital.rating}</Text>
                      <Text style={styles.reviewCount}>({hospital.reviewCount})</Text>
                    </View>
                  </View>

                  <Text style={styles.hospitalName} numberOfLines={1}>
                    {hospital.name}
                  </Text>
                  <Text style={styles.hospitalAddress} numberOfLines={1}>
                    📍 {hospital.address}
                  </Text>
                </View>
              </View>

              {/* 4-Metric Telemetry Grid */}
              <View style={styles.telemetryGrid}>
                {hospital.metrics?.map((metric, mIdx) => (
                  <View key={mIdx} style={styles.telemetryCol}>
                    <Text style={styles.telemetryLabel}>{metric.label}</Text>
                    <Text
                      style={[
                        styles.telemetryValue,
                        metric.isIcu && { color: colors.badgeCashless },
                        (metric.isQuality || metric.isDesk) && { color: colors.secondary },
                      ]}
                      numberOfLines={1}
                    >
                      {metric.isIcu ? "● " : metric.isDesk ? "🏥 " : ""}
                      {metric.value}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Tag Strip */}
              <View style={styles.tagStrip}>
                {hospital.tags?.map((tag, tIdx) => (
                  <View
                    key={tIdx}
                    style={tag.isCheck ? styles.cashlessTag : styles.featureTag}
                  >
                    <Text
                      style={tag.isCheck ? styles.cashlessTagText : styles.featureTagText}
                    >
                      {tag.isCheck ? "✓ " : ""}{tag.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Actions Footer */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    styles.compareToggleBtn,
                    isCompared && styles.compareToggleBtnActive,
                  ]}
                  onPress={() => toggleCompare(hospital.id)}
                >
                  <Text
                    style={[
                      styles.compareToggleText,
                      isCompared && styles.compareToggleTextActive,
                    ]}
                  >
                    {isCompared ? "✓ Compared" : "+ Compare"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bedCheckBtn}
                  onPress={() => setActiveModal({ type: "beds", hospital })}
                >
                  <Text style={styles.bedCheckText}>Live Beds</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.admissionBtn}
                  onPress={() => {
                    setActiveModal({ type: "admission", hospital });
                    setAdmissionSuccess(false);
                  }}
                >
                  <Text style={styles.admissionBtnText}>Book Cashless</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Mobile Pagination Control Bar */}
        {totalPages > 1 && (
          <View style={styles.paginationBar}>
            <TouchableOpacity
              style={[styles.pageNavBtn, safeCurrentPage <= 1 && styles.pageNavBtnDisabled]}
              disabled={safeCurrentPage <= 1}
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <Text style={[styles.pageNavBtnText, safeCurrentPage <= 1 && styles.pageNavBtnTextDisabled]}>
                ‹ Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageNumbersRow}>
              {paginationItems.map((item, idx) => {
                if (item === "...") {
                  return (
                    <View key={`ellipsis-${idx}`} style={styles.pageEllipsisBox}>
                      <Text style={styles.pageEllipsisText}>...</Text>
                    </View>
                  );
                }
                const pageNum = item as number;
                const isActive = safeCurrentPage === pageNum;
                return (
                  <TouchableOpacity
                    key={pageNum}
                    style={[styles.pageNumBtn, isActive && styles.pageNumBtnActive]}
                    onPress={() => setCurrentPage(pageNum)}
                  >
                    <Text style={[styles.pageNumText, isActive && styles.pageNumTextActive]}>
                      {pageNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.pageNavBtn, safeCurrentPage >= totalPages && styles.pageNavBtnDisabled]}
              disabled={safeCurrentPage >= totalPages}
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <Text style={[styles.pageNavBtnText, safeCurrentPage >= totalPages && styles.pageNavBtnTextDisabled]}>
                Next ›
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 8. FLOATING COMPARE DOCK */}
      {comparedIds.length > 0 && (
        <View style={styles.floatingCompareDock}>
          <View style={styles.dockLeft}>
            <View style={styles.dockIconBox}>
              <Text style={{ fontSize: 16 }}>⚖️</Text>
            </View>
            <Text style={styles.dockText}>
              <Text style={{ fontWeight: "800", color: colors.secondary }}>{comparedIds.length}</Text> Hospitals selected
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dockCompareBtn}
            onPress={() => navigation.navigate("Compare")}
          >
            <Text style={styles.dockCompareText}>Compare Now →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 9. MODAL FOR BEDS & CASHLESS ADMISSION */}
      {activeModal && (
        <Modal transparent animationType="fade" visible={!!activeModal}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {activeModal.type === "beds" ? "Real-Time ICU Bed Status" : "Cashless Pre-Auth Admission"}
                </Text>
                <TouchableOpacity onPress={() => setActiveModal(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalHospitalSummary}>
                <Text style={styles.modalHospName}>{activeModal.hospital.name}</Text>
                <Text style={styles.modalHospAddr}>{activeModal.hospital.address}</Text>
              </View>

              {activeModal.type === "beds" ? (
                <View style={styles.modalBody}>
                  <View style={styles.modalMetricBox}>
                    <Text style={styles.modalMetricLabel}>Live CCU / ICU Beds</Text>
                    <Text style={[styles.modalMetricVal, { color: colors.badgeCashless }]}>
                      ● {activeModal.hospital.liveIcu} Open Now
                    </Text>
                  </View>
                  <View style={styles.modalMetricBox}>
                    <Text style={styles.modalMetricLabel}>Single Deluxe Room</Text>
                    <Text style={styles.modalMetricVal}>{activeModal.hospital.roomAvailable}</Text>
                  </View>
                  <Text style={styles.modalNote}>
                    Beds held for 90 minutes after admission request generation.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => setActiveModal({ type: "admission", hospital: activeModal.hospital })}
                  >
                    <Text style={styles.modalPrimaryBtnText}>Proceed to Cashless Admission</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.modalBody}>
                  {admissionSuccess ? (
                    <View style={styles.successBox}>
                      <Text style={{ fontSize: 36 }}>✅</Text>
                      <Text style={styles.successTitle}>Pre-Auth Guarantee Approved!</Text>
                      <Text style={styles.successDesc}>
                        Token #MR-8849-BLR generated. Upfront deposit ₹0 confirmed. Proceed to Reception Desk 4.
                      </Text>
                      <TouchableOpacity
                        style={styles.modalPrimaryBtn}
                        onPress={() => setActiveModal(null)}
                      >
                        <Text style={styles.modalPrimaryBtnText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.fieldLabel}>POLICY OR ABHA ID</Text>
                      <TextInput
                        style={styles.modalInput}
                        defaultValue="STAR-2024-8849-BLR"
                        placeholder="e.g. ABHA or Policy ID"
                      />
                      <Text style={[styles.fieldLabel, { marginTop: 8 }]}>PATIENT PHONE</Text>
                      <TextInput
                        style={styles.modalInput}
                        defaultValue="+91 98450 12345"
                        placeholder="+91 Mobile Number"
                      />
                      <View style={styles.depositWaivedBox}>
                        <Text style={styles.depositLabel}>Pre-Auth Security Deposit:</Text>
                        <Text style={styles.depositVal}>Waived (₹0)</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.modalPrimaryBtn}
                        onPress={() => setAdmissionSuccess(true)}
                      >
                        <Text style={styles.modalPrimaryBtnText}>Generate Cashless Token</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
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
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadgeText: {
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: -0.5,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  locationPin: {
    fontSize: 11,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.secondary,
    maxWidth: 130,
  },
  chevron: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceIce,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  emergencyIcon: {
    fontSize: 16,
  },
  emergencySub: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  emergencyTitle: {
    fontSize: 12,
    color: colors.error,
    fontWeight: "800",
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  pageTitleBlock: {
    marginBottom: 16,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  verifiedTagIcon: {
    fontSize: 12,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  heroHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  heroSub: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
  searchHubCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  searchField: {
    backgroundColor: colors.canvas,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  fieldIcon: {
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textTertiary,
    paddingHorizontal: 4,
  },
  quickChipsScroll: {
    marginTop: 10,
  },
  specChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.surfaceIce,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: 8,
  },
  specChipActive: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondary,
  },
  specChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.secondary,
  },
  specChipTextActive: {
    color: colors.onSecondaryContainer,
    fontWeight: "700",
  },
  findBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  findBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.onPrimary,
    letterSpacing: 0.3,
  },
  fastFiltersScroll: {
    marginBottom: 16,
  },
  fastFiltersContainer: {
    gap: 8,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceIce,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  filterPillActive: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondary,
  },
  filterPillIcon: {
    fontSize: 13,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.secondary,
  },
  filterPillTextActive: {
    color: colors.onSecondaryContainer,
    fontWeight: "800",
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.secondary,
  },
  emergencyBanner: {
    backgroundColor: "#410001",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(185, 28, 28, 0.4)",
  },
  emergencyBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  beaconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFB4A9",
  },
  emergencyBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    flex: 1,
  },
  emergencyBannerDesc: {
    fontSize: 11,
    color: "#FFDAD5",
    lineHeight: 16,
    marginBottom: 10,
  },
  emergencyBannerActions: {
    flexDirection: "row",
    gap: 8,
  },
  bannerCallBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  bannerCallBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.error,
  },
  bannerWhatsAppBtn: {
    flex: 1,
    backgroundColor: "#25D366",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  bannerWhatsAppBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  discoveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
  },
  resultsSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  radiusPills: {
    flexDirection: "row",
    gap: 6,
  },
  radiusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  radiusPillActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  radiusPillText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.onSurface,
  },
  radiusPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  hospitalCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
  },
  hospitalThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainer,
  },
  cardHeaderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  distanceBadge: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  distanceText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.secondary,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  starText: {
    fontSize: 9,
    color: colors.badgeRating,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.onSurface,
  },
  reviewCount: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  hospitalAddress: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.canvas,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  telemetryCol: {
    width: "50%",
    paddingVertical: 3,
  },
  telemetryLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  telemetryValue: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.onSurface,
    marginTop: 1,
  },
  tagStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  cashlessTag: {
    backgroundColor: "rgba(13, 148, 136, 0.1)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  cashlessTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.badgeCashless,
  },
  featureTag: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  featureTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.onSurface,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  compareToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceIce,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  compareToggleBtnActive: {
    backgroundColor: colors.brandBlue,
    borderColor: colors.brandBlue,
  },
  compareToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brandBlue,
  },
  compareToggleTextActive: {
    color: "#FFFFFF",
  },
  bedCheckBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceIce,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  bedCheckText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  admissionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  admissionBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  floatingCompareDock: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dockLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dockIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceIce,
    alignItems: "center",
    justifyContent: "center",
  },
  dockText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurface,
  },
  dockCompareBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dockCompareText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.textSecondary,
    padding: 4,
  },
  modalHospitalSummary: {
    backgroundColor: colors.surfaceIce,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  modalHospName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurface,
  },
  modalHospAddr: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    gap: 8,
  },
  modalMetricBox: {
    backgroundColor: colors.canvas,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  modalMetricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  modalMetricVal: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
    marginTop: 2,
  },
  modalNote: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  modalPrimaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalInput: {
    backgroundColor: colors.canvas,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  depositWaivedBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.canvas,
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
  depositLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  depositVal: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.secondary,
  },
  successBox: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },
  successDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  pageEllipsisBox: {
    width: 24,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pageEllipsisText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  paginationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pageNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceIce,
  },
  pageNavBtnDisabled: {
    opacity: 0.4,
  },
  pageNavBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.secondary,
  },
  pageNavBtnTextDisabled: {
    color: colors.textTertiary,
  },
  pageNumbersRow: {
    flexDirection: "row",
    gap: 6,
  },
  pageNumBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pageNumBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pageNumText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurface,
  },
  pageNumTextActive: {
    color: "#FFFFFF",
  },
});
