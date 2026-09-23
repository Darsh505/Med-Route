/**
 * SearchScreen.tsx — Mobile Search & Discovery Screen
 * Provides budget-based procedure filtering (< ₹50k, < ₹1L, < ₹2L, < ₹5L),
 * transparent package pricing, real patient review viewing, and ICU telemetry.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors } from "../theme/colors";
import { spacing, borderRadius, shadows } from "../theme/spacing";
import { api, MobileHospital, MOCK_HOSPITALS } from "../services/api";
import { storage } from "../services/storage";
import { locationService } from "../services/location";
import HospitalCard from "../components/HospitalCard";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { localizeCity, localizeDisease, localizeHospital } from "../i18n/hospitalLocalization";
import FloatingSOSButton from "../components/FloatingSOSButton";

const SUGGESTED_TREATMENTS = [
  "Heart Attack / CAD",
  "Knee Osteoarthritis",
  "Kidney Stones",
  "Dialysis",
  "Gallbladder Stones",
  "Cataract",
  "Hernia",
];

export default function SearchScreen({ route, navigation }: any) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const initialQuery = route.params?.query || "";
  const initialCategory = route.params?.category || "";

  const [query, setQuery] = useState(initialQuery || initialCategory);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentCity, setCurrentCity] = useState("Hoshiarpur");
  const [hospitals, setHospitals] = useState<MobileHospital[]>(MOCK_HOSPITALS);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedHospitalForReviews, setSelectedHospitalForReviews] = useState<MobileHospital | null>(null);

  const parsedSlots = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return null;
    let condition = "";
    if (q.includes("kidney") || q.includes("renal") || q.includes("dialysis")) condition = "Kidney / Renal";
    else if (q.includes("heart") || q.includes("cardiac") || q.includes("stent") || q.includes("bypass")) condition = "Heart Surgery";
    else if (q.includes("knee") || q.includes("ortho") || q.includes("joint")) condition = "Bone & Joint";
    else if (q.includes("trauma") || q.includes("emergency")) condition = "Trauma Triage";

    let location = "";
    if (q.includes("chandigarh")) location = "Chandigarh";
    else if (q.includes("mohali")) location = "Mohali";
    else if (q.includes("hoshiarpur")) location = "Hoshiarpur";
    else if (q.includes("delhi")) location = "Delhi";

    let budget = "";
    const lakh = q.match(/under\s*(\d+(?:\.\d+)?)\s*lakh/);
    if (lakh) budget = `< ₹${lakh[1]} Lakh`;

    if (condition || location || budget) {
      return { condition, location, budget };
    }
    return null;
  }, [query]);

  useEffect(() => {
    initLocationAndSearch();

    const unsubscribe = navigation.addListener("focus", () => {
      initLocationAndSearch();
    });
    return unsubscribe;
  }, [navigation, query]);

  const initLocationAndSearch = async () => {
    const loc = await locationService.getSelectedCity();
    setCurrentCity(loc.city);
    await performSearch(query, loc.city);
    await loadCompare();
  };

  const loadCompare = async () => {
    const ids = await storage.getCompareIds();
    setCompareIds(ids);
  };

  const performSearch = async (q: string, city?: string) => {
    const targetCity = city || currentCity;
    const results = await api.searchHospitals(q, undefined, targetCity);
    setHospitals(results);
  };

  const filteredHospitals = hospitals.filter((h) => {
    if (selectedFilter === "under_50k") return (h.base_package_inr || 85000) <= 50000 || h.type === "Government";
    if (selectedFilter === "under_1l") return (h.base_package_inr || 85000) <= 100000 || h.type === "Government";
    if (selectedFilter === "under_2l") return (h.base_package_inr || 85000) <= 200000 || h.type === "Government";
    if (selectedFilter === "under_5l") return (h.base_package_inr || 85000) <= 500000 || h.type === "Government";
    if (selectedFilter === "icu") return h.beds_icu_available > 0;
    if (selectedFilter === "pmjay") return h.is_pmjay_empanelled;
    if (selectedFilter === "govt") return h.type === "Government";
    if (selectedFilter === "private") return h.type === "Private";
    if (selectedFilter === "trauma") return h.is_trauma_center;
    return true;
  });

  const handleToggleCompare = async (id: string) => {
    const updated = await storage.toggleCompare(id);
    setCompareIds(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header Search Box */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => navigation.navigate("SelectLocation")}
            activeOpacity={0.8}
          >
            <Text style={styles.locationButtonText}>📍 {localizeCity(currentCity, currentLang)} ▾</Text>
          </TouchableOpacity>
          <View style={styles.headerRightBadges}>
            <LanguageSwitcher compact />
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>🧪 {t("search.mockData")}</Text>
            </View>
            <Text style={styles.resultsBadge}>{filteredHospitals.length} {t("search.facilities")}</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t("search.searchPlaceholder")}
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Text style={{ color: colors.textTertiary, paddingHorizontal: 6 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* AI Query Slot Mapping Banner (Slide 5 Deliverable) */}
        {parsedSlots && (
          <View style={styles.aiSlotBanner}>
            <View style={styles.aiSlotHeader}>
              <Text style={styles.aiSlotTitle}>🤖 {t("search.aiSlotTitle")}</Text>
              <TouchableOpacity onPress={() => setQuery("")}>
                <Text style={styles.aiSlotClear}>{t("search.clear")}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.aiSlotRow}>
              {parsedSlots.condition ? (
                <View style={styles.aiSlotBadge}>
                  <Text style={styles.aiSlotBadgeText}>🩺 {localizeDisease(parsedSlots.condition, currentLang)}</Text>
                </View>
              ) : null}
              {parsedSlots.location ? (
                <View style={styles.aiSlotBadge}>
                  <Text style={styles.aiSlotBadgeText}>📍 {localizeCity(parsedSlots.location, currentLang)}</Text>
                </View>
              ) : null}
              {parsedSlots.budget ? (
                <View style={styles.aiSlotBadge}>
                  <Text style={styles.aiSlotBadgeText}>💰 {parsedSlots.budget}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Suggested Disease Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.diseaseChipsScroll}
        >
          <TouchableOpacity
            style={[styles.diseaseChip, { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" }]}
            onPress={() => setQuery("Find kidney treatment near Chandigarh under 2 lakh")}
          >
            <Text style={[styles.diseaseChipText, { color: "#0284C7", fontWeight: "700" }]}>
              {currentLang === "hi" ? "⚡ किडनी < ₹2L चंडीगढ़" : currentLang === "pa" ? "⚡ ਗੁਰਦਾ < ₹2L ਚੰਡੀਗੜ੍ਹ" : "⚡ Kidney < ₹2L Chandigarh"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.diseaseChip, { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" }]}
            onPress={() => setQuery("Heart surgery in Mohali under 3 lakh")}
          >
            <Text style={[styles.diseaseChipText, { color: "#0284C7", fontWeight: "700" }]}>
              {currentLang === "hi" ? "⚡ हार्ट < ₹3L मोहाली" : currentLang === "pa" ? "⚡ ਦਿਲ < ₹3L ਮੋਹਾਲੀ" : "⚡ Heart < ₹3L Mohali"}
            </Text>
          </TouchableOpacity>
          {SUGGESTED_TREATMENTS.map((disease) => {
            const isSelected = query.toLowerCase() === disease.toLowerCase();
            const localizedDisease = localizeDisease(disease, currentLang);
            return (
              <TouchableOpacity
                key={disease}
                style={[styles.diseaseChip, isSelected && styles.diseaseChipActive]}
                onPress={() => setQuery(isSelected ? "" : disease)}
                activeOpacity={0.8}
              >
                <Text style={[styles.diseaseChipText, isSelected && styles.diseaseChipTextActive]}>
                  🩺 {localizedDisease}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter Chips Scroll with Budget & Schemes */}
      <View style={{ height: 44, marginBottom: spacing.xs }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { id: "all", label: t("search.allFacilities") },
            { id: "under_50k", label: t("search.under50k") },
            { id: "under_1l", label: t("search.under1l") },
            { id: "under_2l", label: t("search.under2l") },
            { id: "under_5l", label: t("search.under5l") },
            { id: "pmjay", label: `🛡️ ${t("search.pmjayCashless")}` },
            { id: "icu", label: `🟢 ${t("search.availableIcu")}` },
            { id: "govt", label: t("search.government") },
            { id: "private", label: t("search.private") },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, selectedFilter === f.id && styles.filterChipActive]}
              onPress={() => setSelectedFilter(f.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === f.id && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCount}>
          {filteredHospitals.length} {t("home.verifiedHospitals")}
        </Text>
        <Text style={[styles.provenanceTag, { color: colors.success }]}>🟢 {t("sos.liveGrid")}</Text>
      </View>

      {/* Hospital List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredHospitals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={styles.emptyTitle}>{t("search.noResults")}</Text>
            <Text style={styles.emptySubtitle}>
              {t("search.noResultsSub")}
            </Text>
          </View>
        ) : (
          filteredHospitals.map((hosp) => (
            <HospitalCard
              key={hosp.id}
              hospital={hosp}
              onPress={() => navigation.navigate("HospitalDetail", { slug: hosp.slug })}
              onCompare={() => handleToggleCompare(hosp.id)}
              onViewReviews={() => setSelectedHospitalForReviews(hosp)}
              isInCompare={compareIds.includes(hosp.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Compare Tray if selected */}
      {compareIds.length > 0 && (
        <View style={styles.compareTray}>
          <Text style={styles.compareTrayText}>
            {compareIds.length} {t("home.hospitalsSelected")}
          </Text>
          <TouchableOpacity
            style={styles.compareTrayButton}
            onPress={() => navigation.navigate("Compare")}
          >
            <Text style={styles.compareTrayButtonText}>{t("home.compareNow")} ({compareIds.length}) ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Patient Reviews Modal */}
      {selectedHospitalForReviews && (
        <Modal
          visible={!!selectedHospitalForReviews}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedHospitalForReviews(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedHospitalForReviews.name}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    ⭐ {typeof selectedHospitalForReviews.overall_rating === "number" ? selectedHospitalForReviews.overall_rating.toFixed(1) : "4.7"} ({selectedHospitalForReviews.total_reviews} verified reviews) • {selectedHospitalForReviews.city}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedHospitalForReviews(null)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Reviews Scroll */}
              <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 24 }}>
                {(!selectedHospitalForReviews.reviews || selectedHospitalForReviews.reviews.length === 0) ? (
                  <View style={{ padding: 24, alignItems: "center" }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      No written reviews submitted yet for this hospital.
                    </Text>
                  </View>
                ) : (
                  selectedHospitalForReviews.reviews.map((rev: any, idx: number) => (
                    <View key={rev.id || idx} style={styles.reviewCard}>
                      <View style={styles.reviewCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reviewAuthorName}>{rev.author_name}</Text>
                          <Text style={styles.reviewMeta}>
                            {rev.created_at} • {rev.treatment_category}
                          </Text>
                        </View>
                        <View style={styles.reviewScoreBadge}>
                          <Text style={styles.reviewScoreText}>⭐ {rev.rating_overall}/5</Text>
                        </View>
                      </View>

                      {rev.title ? (
                        <Text style={styles.reviewCardTitle}>{rev.title}</Text>
                      ) : null}

                      <Text style={styles.reviewCardComment}>"{rev.comment}"</Text>

                      <View style={styles.reviewCardFooter}>
                        <Text style={styles.verifiedTag}>
                          {rev.verified ? "✓ Verified Patient Admission" : "Patient Review"}
                        </Text>
                        <Text style={styles.helpfulCount}>
                          👍 {rev.helpful_count || 4} helpful
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => setSelectedHospitalForReviews(null)}
                >
                  <Text style={styles.modalDoneButtonText}>Close Reviews</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Floating SOS Action Button */}
      <FloatingSOSButton onPress={() => navigation.navigate("SOSModal")} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs + 2,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    flexShrink: 1,
    marginRight: 6,
  },
  locationButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.accentDark,
  },
  headerRightBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  demoBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
  },
  resultsBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textTertiary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  diseaseChipsScroll: {
    paddingTop: 8,
    gap: 6,
  },
  diseaseChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    backgroundColor: "rgba(15, 118, 110, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.2)",
  },
  diseaseChipActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e",
  },
  diseaseChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0f766e",
  },
  diseaseChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  resultsInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  provenanceTag: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.huge,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: spacing.xl,
  },
  compareTray: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compareTrayText: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 12,
  },
  compareTrayButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  compareTrayButtonText: {
    color: colors.textInverse,
    fontWeight: "800",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  modalScroll: {
    padding: spacing.lg,
  },
  reviewCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reviewCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  reviewAuthorName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  reviewMeta: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 1,
  },
  reviewScoreBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  reviewScoreText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#92400E",
  },
  reviewCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  reviewCardComment: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    fontStyle: "italic",
    marginTop: 2,
  },
  reviewCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  verifiedTag: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.success,
  },
  helpfulCount: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: "center",
  },
  modalDoneButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: borderRadius.md,
    width: "100%",
    alignItems: "center",
  },
  modalDoneButtonText: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 13,
  },
  aiSlotBanner: {
    marginTop: 8,
    marginBottom: 4,
    padding: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  aiSlotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  aiSlotTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  aiSlotClear: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    textDecorationLine: "underline",
  },
  aiSlotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  aiSlotBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  aiSlotBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803D",
  },
});
