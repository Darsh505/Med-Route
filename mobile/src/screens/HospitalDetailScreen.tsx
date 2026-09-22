/**
 * HospitalDetailScreen.tsx — Mobile Hospital Detail Screen
 * Follows Prompt 9 from Stitch Prompt:
 * - Back arrow and "Hospital Detail" header
 * - Overlapping card with hospital name, Government/Private badges, rating
 * - Two action buttons: "📞 Call" (teal) and "⚖️ Compare" (outline)
 * - Tab navigation: Overview | Procedures | Facilities | Reviews
 * - Overview tab: 2x2 grid (Beds, ICU, Distance, Cost Range) + Departments
 * - Procedures tab with cost ranges and PMJAY package rates
 * - Facilities grid with 24x7 indicators
 * - Reviews list with Write Review modal
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing, borderRadius, shadows } from "../theme/spacing";
import { api, MobileHospital, MOCK_HOSPITALS } from "../services/api";
import { storage } from "../services/storage";

export default function HospitalDetailScreen({ route, navigation }: any) {
  const { slug } = route.params || { slug: "pgimer-chandigarh" };
  const [hospital, setHospital] = useState<MobileHospital>(MOCK_HOSPITALS[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "procedures" | "facilities" | "reviews">("overview");
  const [isInCompare, setIsInCompare] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Review Form state
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTransparency, setReviewTransparency] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewsList, setReviewsList] = useState([
    {
      id: "1",
      author: "Gurpreet S. (Mohali)",
      rating: 5,
      transparency: 5,
      title: "Immediate emergency stent without hidden fees",
      text: "The cardiology department primed the cath lab at 2 AM. Upfront transparent package pricing with zero unexpected charges.",
      date: "2 weeks ago",
    },
    {
      id: "2",
      author: "Ananya Sharma (Chandigarh)",
      rating: 5,
      transparency: 4,
      title: "Smooth PMJAY cashless handling for knee surgery",
      text: "Ayushman desk was very cooperative. Implant choices and rehabilitation were thoroughly explained.",
      date: "1 month ago",
    },
  ]);

  useEffect(() => {
    loadHospital();
  }, [slug]);

  const loadHospital = async () => {
    const data = await api.getHospitalBySlug(slug);
    if (data) setHospital(data);
    const compareIds = await storage.getCompareIds();
    setIsInCompare(compareIds.includes(data?.id || ""));
  };

  const handleToggleCompare = async () => {
    const updated = await storage.toggleCompare(hospital.id);
    setIsInCompare(updated.includes(hospital.id));
  };

  const handleCall = () => {
    Linking.openURL(`tel:${hospital.phone}`);
  };

  const handleDirections = () => {
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(hospital.name + " " + hospital.city)}`);
  };

  const handleAddReview = () => {
    if (!reviewerName || !reviewContent) return;
    const newRev = {
      id: Date.now().toString(),
      author: reviewerName,
      rating: reviewRating,
      transparency: reviewTransparency,
      title: "Patient Experience Feedback",
      text: reviewContent,
      date: "Just now",
    };
    setReviewsList([newRev, ...reviewsList]);
    setShowReviewModal(false);
    setReviewerName("");
    setReviewContent("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Hospital Details
        </Text>
        <TouchableOpacity onPress={handleToggleCompare}>
          <Text style={{ fontSize: 16 }}>{isInCompare ? "✓" : "⚖️"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGradient}>
            <Text style={styles.heroEmoji}>🏥</Text>
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.hospitalName}>{hospital.name}</Text>
            <Text style={styles.hospitalAddress}>
              📍 {hospital.address}, {hospital.city}, {hospital.state}
            </Text>

            {/* Badges */}
            <View style={styles.badgesRow}>
              <View style={[styles.badge, styles.badgeGovt]}>
                <Text style={styles.badgeGovtText}>🏛️ {hospital.type}</Text>
              </View>
              <View style={[styles.badge, styles.badgeAccr]}>
                <Text style={styles.badgeAccrText}>{hospital.accreditation}</Text>
              </View>
              <View style={[styles.badge, styles.badgePmjay]}>
                <Text style={styles.badgePmjayText}>PMJAY ✓</Text>
              </View>
              <View style={[styles.badge, styles.badgeSimulated]}>
                <Text style={styles.badgeSimulatedText}>⚪ Benchmark Data</Text>
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingRow}>
              <Text style={{ fontSize: 16 }}>⭐</Text>
              <Text style={styles.ratingValue}>{hospital.overall_rating}</Text>
              <Text style={styles.ratingReviews}>({hospital.total_reviews} reviews)</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.emergencyTag}>
                {hospital.is_trauma_center ? "🚨 Level 1 Trauma 24x7" : "Emergency"}
              </Text>
            </View>

            {/* Prompt 9: "Two action buttons: 📞 Call (teal) and ⚖️ Compare (outline)" */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.callButton}
                activeOpacity={0.85}
                onPress={handleCall}
              >
                <Text style={styles.callButtonText}>📞 Call Line</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.compareOutlineButton, isInCompare && styles.compareOutlineActive]}
                activeOpacity={0.85}
                onPress={handleToggleCompare}
              >
                <Text
                  style={[
                    styles.compareOutlineText,
                    isInCompare && styles.compareOutlineTextActive,
                  ]}
                >
                  {isInCompare ? "✓ Added to Compare" : "⚖️ Compare"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab Navigation: "Overview | Procedures | Facilities | Reviews" */}
        <View style={styles.tabsContainer}>
          {[
            { id: "overview", label: "Overview" },
            { id: "procedures", label: "Procedures" },
            { id: "facilities", label: "Facilities" },
            { id: "reviews", label: `Reviews (${reviewsList.length})` },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <View style={styles.tabContent}>
            {/* 2x2 Quick Stats Grid (Prompt 9 requirement) */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{hospital.beds_total}</Text>
                <Text style={styles.statLabel}>Total Beds</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {hospital.beds_icu_available}
                </Text>
                <Text style={styles.statLabel}>ICU Available ({hospital.beds_icu} Total)</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{hospital.distance_km} km</Text>
                <Text style={styles.statLabel}>Distance from You</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {hospital.cost_indicative}
                </Text>
                <Text style={styles.statLabel}>Cost Range (Est.)</Text>
              </View>
            </View>

            {/* Departments */}
            <Text style={styles.subheading}>Departments & Consultants</Text>
            <View style={styles.departmentItem}>
              <Text style={styles.deptName}>Department of Cardiology</Text>
              <Text style={styles.deptDoctor}>Head: Dr. Yash Paul Sharma, DM</Text>
              <Text style={styles.deptSpec}>Interventional Cardiology & Cath Lab</Text>
            </View>

            <View style={styles.departmentItem}>
              <Text style={styles.deptName}>Department of Orthopedics</Text>
              <Text style={styles.deptDoctor}>Head: Dr. M. S. Dhillon, MS, FRCS</Text>
              <Text style={styles.deptSpec}>Arthroplasty & Trauma Surgery</Text>
            </View>

            <View style={styles.departmentItem}>
              <Text style={styles.deptName}>Department of Nephrology</Text>
              <Text style={styles.deptDoctor}>Head: Dr. K. L. Gupta, DM</Text>
              <Text style={styles.deptSpec}>Renal Care & Dialysis Wing</Text>
            </View>

            {/* Location & Navigation */}
            <Text style={styles.subheading}>Location & Directions</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locAddress}>📍 {hospital.address}, {hospital.city}</Text>
              <TouchableOpacity style={styles.navButton} onPress={handleDirections}>
                <Text style={styles.navButtonText}>🗺️ Get Directions in Maps ↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 2: PROCEDURES */}
        {activeTab === "procedures" && (
          <View style={styles.tabContent}>
            <Text style={styles.subheading}>Benchmark Procedure Pricing</Text>
            {[
              { name: "Coronary Angioplasty (Single Stent)", cost: "₹95,000", pmjay: "₹65,000 Rate", success: "96%" },
              { name: "Total Knee Replacement", cost: "₹1,15,000", pmjay: "₹80,000 Rate", success: "94%" },
              { name: "Cataract Surgery (Phaco + IOL)", cost: "₹12,000", pmjay: "₹8,500 Rate", success: "99%" },
              { name: "Hemodialysis (Per Session)", cost: "₹1,200", pmjay: "₹1,500 Rate", success: "98%" },
              { name: "Gallbladder Removal (Lap)", cost: "₹45,000", pmjay: "₹28,000 Rate", success: "97%" },
            ].map((proc, idx) => (
              <View key={idx} style={styles.procedureCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.procedureName}>{proc.name}</Text>
                  <Text style={styles.procedurePmjay}>PMJAY: {proc.pmjay}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.procedureCost}>{proc.cost}</Text>
                  <Text style={styles.procedureSuccess}>✓ {proc.success} Success</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: FACILITIES */}
        {activeTab === "facilities" && (
          <View style={styles.tabContent}>
            <Text style={styles.subheading}>Critical Diagnostic Facilities</Text>
            {[
              { name: "3.0 Tesla Silent MRI", desc: "In-house 24x7 Diagnostic Imaging" },
              { name: "128-Slice High-Speed CT Scan", desc: "Emergency Trauma Protocol" },
              { name: "Dual-Plane Cardiac Cath Lab", desc: "Dedicated Interventional Suite" },
              { name: "Licensed Blood Component Bank", desc: "PRBC, FFP, Platelets Available" },
              { name: "28-Station Dialysis Wing", desc: "Advanced Hemofiltration Units" },
            ].map((fac, idx) => (
              <View key={idx} style={styles.facilityCard}>
                <Text style={{ fontSize: 24 }}>✅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.facilityName}>{fac.name}</Text>
                  <Text style={styles.facilityDesc}>{fac.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === "reviews" && (
          <View style={styles.tabContent}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.subheading}>Patient Feedback</Text>
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => setShowReviewModal(true)}
              >
                <Text style={styles.writeReviewText}>✍️ Write Review</Text>
              </TouchableOpacity>
            </View>

            {reviewsList.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewAuthor}>{rev.author}</Text>
                  <Text style={styles.reviewStars}>⭐ {rev.rating}/5</Text>
                </View>
                <Text style={styles.reviewTitle}>{rev.title}</Text>
                <Text style={styles.reviewBody}>{rev.text}</Text>
                <View style={styles.reviewBottom}>
                  <Text style={styles.transparencyTag}>
                    💰 Price Transparency: {rev.transparency}/5
                  </Text>
                  <Text style={styles.reviewDate}>{rev.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* WRITE REVIEW MODAL */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Write Patient Review</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Your Name (e.g. Ramesh K.)"
              placeholderTextColor={colors.textTertiary}
              value={reviewerName}
              onChangeText={setReviewerName}
            />
            <TextInput
              style={[styles.modalInput, { height: 90, textAlignVertical: "top" }]}
              placeholder="Explain doctor availability, billing transparency, and wait times..."
              placeholderTextColor={colors.textTertiary}
              multiline
              value={reviewContent}
              onChangeText={setReviewContent}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleAddReview}
              >
                <Text style={styles.modalSubmitText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  heroCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.card, // 16px
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  heroGradient: {
    height: 100,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroInfo: {
    padding: spacing.lg,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  badgeGovt: {
    backgroundColor: colors.primaryLight,
  },
  badgeGovtText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  badgeAccr: {
    backgroundColor: colors.successLight,
  },
  badgeAccrText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "700",
  },
  badgePmjay: {
    backgroundColor: "#FDF4FF",
  },
  badgePmjayText: {
    color: "#A21CAF",
    fontSize: 11,
    fontWeight: "700",
  },
  badgeSimulated: {
    backgroundColor: colors.borderLight,
  },
  badgeSimulatedText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.lg,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#92400E",
  },
  ratingReviews: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  dot: {
    color: colors.border,
    marginHorizontal: 4,
  },
  emergencyTag: {
    fontSize: 11,
    color: colors.emergency,
    fontWeight: "700",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.accent, // Prompt 9: "📞 Call (teal)"
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  callButtonText: {
    color: colors.textInverse,
    fontWeight: "800",
    fontSize: 14,
  },
  compareOutlineButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  compareOutlineActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  compareOutlineText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 14,
  },
  compareOutlineTextActive: {
    color: colors.accentDark,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textTertiary,
  },
  tabTextActive: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primaryDark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  departmentItem: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  deptName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  deptDoctor: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  deptSpec: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  locationCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  locAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  navButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  navButtonText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  procedureCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
  },
  procedureName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  procedurePmjay: {
    fontSize: 11,
    color: colors.accentDark,
    marginTop: 2,
  },
  procedureCost: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  procedureSuccess: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "600",
    marginTop: 2,
  },
  facilityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  facilityName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  facilityDesc: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  writeReviewButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
  },
  writeReviewText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  reviewCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  reviewStars: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "700",
  },
  reviewTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  reviewBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  reviewBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 6,
  },
  transparencyTag: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  reviewDate: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primaryDark,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 10,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: "700",
  },
  modalSubmit: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
  },
  modalSubmitText: {
    color: colors.textInverse,
    fontWeight: "700",
  },
});
