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
  StatusBar,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    if (data) {
      setHospital(data);
      if (data.reviews && data.reviews.length > 0) {
        setReviewsList(
          data.reviews.map((r: any, idx: number) => ({
            id: r.id ? String(r.id) : String(idx + 1),
            author: r.author_name || r.user_name || "Verified Patient",
            rating: r.overall_rating || r.rating || 5,
            transparency: r.cost_transparency_rating || 5,
            title: r.procedure_name ? `${r.procedure_name} Experience` : "Clinical Care Review",
            text: r.comment || r.body || "Experienced prompt clinical care and transparent billing under verified protocols.",
            date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent",
          }))
        );
      }
    }
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

  const handleCallAmbulance = () => {
    const phone = hospital.ambulance_phone || hospital.emergency_phone || "108";
    Linking.openURL(`tel:${phone}`);
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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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
              <View style={[styles.badge, styles.badgeMockData]}>
                <Text style={styles.badgeMockDataText}>🧪 Mock Data</Text>
              </View>
              <View style={[styles.badge, styles.badgeGovt]}>
                <Text style={styles.badgeGovtText}>🏛️ {hospital.type}</Text>
              </View>
              <View style={[styles.badge, styles.badgeAccr]}>
                <Text style={styles.badgeAccrText}>{hospital.accreditation}</Text>
              </View>
              <View style={[styles.badge, styles.badgePmjay]}>
                <Text style={styles.badgePmjayText}>PMJAY ✓</Text>
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

            {/* Action Buttons: Emergency Ambulance Hotline + Desk Call & Compare */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.callAmbulanceButton}
                activeOpacity={0.85}
                onPress={handleCallAmbulance}
              >
                <Text style={styles.callAmbulanceButtonText}>
                  🚑 Call Hospital Ambulance ({hospital.ambulance_phone || hospital.emergency_phone || "108"})
                </Text>
              </TouchableOpacity>

              <View style={styles.subActionsRow}>
                <TouchableOpacity
                  style={styles.callButton}
                  activeOpacity={0.85}
                  onPress={handleCall}
                >
                  <Text style={styles.callButtonText}>📞 Hospital Desk</Text>
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
                    {isInCompare ? "✓ Added" : "⚖️ Compare"}
                  </Text>
                </TouchableOpacity>
              </View>
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

            {/* Disease Treatment & Clinical Volume Card */}
            <View style={[styles.prosConsCard, { marginBottom: spacing.md }]}>
              <Text style={styles.prosConsTitle}>🩺 Disease Care &amp; Clinical Track Record</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Top Treated Disease</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primaryDark }}>{hospital.top_disease_treated || "Cardiology & Surgery"}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Patients Treated</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textPrimary }}>
                  {hospital.total_patients_treated ? `👥 ${hospital.total_patients_treated.toLocaleString()} Patients` : "👥 14,500+ Patients"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Overall Success Ratio</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.success }}>
                  ✓ {hospital.overall_success_ratio || "97.8%"} Track Record
                </Text>
              </View>
            </View>

            {/* Quick Pros and Cons (Clinical Strengths vs Watchouts) */}
            <View style={styles.prosConsCard}>
              <Text style={styles.prosConsTitle}>⚖️ Clinical Assessment: Quick Pros &amp; Cons</Text>

              {/* Pros */}
              <View style={styles.prosSection}>
                <Text style={styles.prosHeading}>✓ Clinical Strengths (Pros)</Text>
                {(hospital.pros && hospital.pros.length > 0
                  ? hospital.pros
                  : [
                      "Empanelled under Ayushman Bharat PMJAY for cashless surgery",
                      "24x7 emergency resuscitation and ICU telemetry available",
                      "NABH/NQAS certified clinical protocol adherence",
                    ]
                ).map((pro, idx) => (
                  <View key={idx} style={styles.proItem}>
                    <Text style={styles.proBullet}>✓</Text>
                    <Text style={styles.proText}>{pro}</Text>
                  </View>
                ))}
              </View>

              {/* Cons */}
              <View style={styles.consSection}>
                <Text style={styles.consHeading}>⚠️ Important Considerations (Cons)</Text>
                {(hospital.cons && hospital.cons.length > 0
                  ? hospital.cons
                  : [
                      "Higher wait times during morning OPD peak hours (30-45 mins)",
                      "Super-specialist elective consults may require advance booking",
                    ]
                ).map((con, idx) => (
                  <View key={idx} style={styles.conItem}>
                    <Text style={styles.conBullet}>⚠️</Text>
                    <Text style={styles.conText}>{con}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Departments */}
            <Text style={styles.subheading}>Departments &amp; Consultants</Text>
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
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subheading}>Disease Treatments &amp; Benchmark Pricing</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                Includes clinical outcomes, audited success rates, and PM-JAY 2.2 cashless package rates.
              </Text>
              <View style={styles.mockDataStrip}>
                <Text style={styles.mockDataStripText}>
                  🧪 Benchmark Note: All tariffs, patient volume counts, and success ratios below are simulated demonstration mock data.
                </Text>
              </View>
            </View>

            {(hospital.procedures && hospital.procedures.length > 0
              ? hospital.procedures
              : [
                  {
                    name: "Coronary Angioplasty (Single Stent)",
                    disease: "Coronary Artery Disease (CAD)",
                    cost_formatted: "₹95,000 avg (₹75k – ₹1.4L)",
                    cost_avg: 95000,
                    pmjay_covered: true,
                    pmjay_package_rate: 65000,
                    success_ratio: "96.8%",
                    patients_treated: 1850,
                  },
                  {
                    name: "Total Knee Replacement",
                    disease: "Severe Knee Osteoarthritis",
                    cost_formatted: "₹1,15,000 avg (₹90k – ₹1.65L)",
                    cost_avg: 115000,
                    pmjay_covered: true,
                    pmjay_package_rate: 80000,
                    success_ratio: "97.4%",
                    patients_treated: 1420,
                  },
                  {
                    name: "Cataract Surgery (Phaco + IOL)",
                    disease: "Senile Cataract & Vision Impairment",
                    cost_formatted: "₹18,000 avg (₹12k – ₹32k)",
                    cost_avg: 18000,
                    pmjay_covered: true,
                    pmjay_package_rate: 8500,
                    success_ratio: "99.1%",
                    patients_treated: 3600,
                  },
                  {
                    name: "Hemodialysis (Maintenance)",
                    disease: "Chronic Kidney Disease (ESRD)",
                    cost_formatted: "₹1,800 / session",
                    cost_avg: 1800,
                    pmjay_covered: true,
                    pmjay_package_rate: 1500,
                    success_ratio: "99.2%",
                    patients_treated: 4800,
                  },
                  {
                    name: "Laparoscopic Cholecystectomy",
                    disease: "Cholelithiasis (Gallbladder Stones)",
                    cost_formatted: "₹48,000 avg (₹35k – ₹72k)",
                    cost_avg: 48000,
                    pmjay_covered: true,
                    pmjay_package_rate: 28000,
                    success_ratio: "98.6%",
                    patients_treated: 2100,
                  },
                ]
            ).map((proc: any, idx: number) => (
              <View key={idx} style={styles.procedureCard}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.procedureName}>{proc.name}</Text>
                  {proc.disease ? (
                    <Text style={{ fontSize: 11, color: colors.accentDark, fontWeight: "600", marginTop: 2 }}>
                      🩺 Disease: {proc.disease}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <Text style={styles.procedurePmjay}>
                      {proc.pmjay_covered
                        ? `PMJAY: ₹${(proc.pmjay_package_rate || 0).toLocaleString()}`
                        : "PMJAY: Direct Pay"}
                    </Text>
                    {proc.patients_treated ? (
                      <Text style={{ fontSize: 11, color: colors.textTertiary }}>
                        👥 {proc.patients_treated.toLocaleString()} treated
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
                  <Text style={styles.procedureCost}>
                    {proc.cost_formatted || `₹${(proc.cost_avg || 0).toLocaleString()}`}
                  </Text>
                  <Text style={styles.procedureSuccess}>
                    ✓ {proc.success_ratio || `${proc.success_rate || 95}%`} Success
                  </Text>
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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0,
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
  badgeMockData: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  badgeMockDataText: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "800",
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
  actionButtonsContainer: {
    gap: spacing.sm,
  },
  callAmbulanceButton: {
    backgroundColor: colors.emergency,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  callAmbulanceButtonText: {
    color: colors.textInverse,
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  subActionsRow: {
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
  prosConsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  prosConsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  prosSection: {
    backgroundColor: colors.accentLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  prosHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.accentDark,
    marginBottom: 6,
  },
  proItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  proBullet: {
    fontSize: 12,
    color: colors.accentDark,
    fontWeight: "800",
    marginRight: 6,
    marginTop: 1,
  },
  proText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  consSection: {
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  consHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.warning,
    marginBottom: 6,
  },
  conItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  conBullet: {
    fontSize: 11,
    marginRight: 6,
    marginTop: 1,
  },
  conText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 16,
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
  mockDataStrip: {
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    marginTop: 6,
  },
  mockDataStripText: {
    fontSize: 10,
    color: "#92400E",
    fontWeight: "600",
    lineHeight: 14,
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
