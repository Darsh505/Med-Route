/**
 * CompareScreen.tsx — Mobile Side-by-Side Hospital Comparison Screen
 * Follows Prompt 7 / Member 2 specs:
 * - Horizontal swipeable cards comparing metrics
 * - Best-in-row 🏆 highlights for rating, ICU capacity, and costs
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing, borderRadius, shadows } from "../theme/spacing";
import { MobileHospital, MOCK_HOSPITALS } from "../services/api";
import { storage } from "../services/storage";
import FloatingSOSButton from "../components/FloatingSOSButton";

export default function CompareScreen({ navigation }: any) {
  const [selectedHospitals, setSelectedHospitals] = useState<MobileHospital[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadComparison();
    });
    loadComparison();
    return unsubscribe;
  }, [navigation]);

  const loadComparison = async () => {
    const ids = await storage.getCompareIds();
    const matched = MOCK_HOSPITALS.filter((h) => ids.includes(h.id));
    if (matched.length > 0) {
      setSelectedHospitals(matched);
    } else {
      setSelectedHospitals([MOCK_HOSPITALS[0], MOCK_HOSPITALS[1]]);
    }
  };

  const handleRemove = async (id: string) => {
    const updated = await storage.toggleCompare(id);
    setSelectedHospitals(MOCK_HOSPITALS.filter((h) => updated.includes(h.id)));
  };

  const maxRating = Math.max(...selectedHospitals.map((h) => h.overall_rating), 0);
  const maxIcu = Math.max(...selectedHospitals.map((h) => h.beds_icu_available), 0);
  const maxBeds = Math.max(...selectedHospitals.map((h) => h.beds_total), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Compare Hospitals</Text>
        <Text style={styles.subtitle}>
          Side-by-side evaluation of critical care & costs
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedHospitals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40 }}>⚖️</Text>
            <Text style={styles.emptyTitle}>No hospitals selected</Text>
            <Text style={styles.emptySubtitle}>
              Tap &quot;+ Compare&quot; on any hospital card to see side-by-side metrics.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate("Search")}
            >
              <Text style={styles.browseButtonText}>Browse Hospitals →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cardsRow}>
              {selectedHospitals.map((h) => {
                const isTopRating = h.overall_rating === maxRating;
                const isTopIcu = h.beds_icu_available === maxIcu;
                const isTopBeds = h.beds_total === maxBeds;

                return (
                  <View key={h.id} style={styles.compareCard}>
                    {/* Top Row: Name + Remove */}
                    <View style={styles.cardHeader}>
                      <Text style={styles.hospitalName} numberOfLines={2}>
                        {h.name}
                      </Text>
                      <TouchableOpacity onPress={() => handleRemove(h.id)}>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.locationText}>
                      📍 {h.city}, {h.state}
                    </Text>

                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, h.type === "Government" ? styles.badgeGovt : styles.badgePvt]}>
                        <Text style={styles.badgeText}>{h.type}</Text>
                      </View>
                      <View style={[styles.badge, styles.badgeAccr]}>
                        <Text style={styles.badgeText}>{h.accreditation}</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Metric 1: Rating */}
                    <View style={[styles.metricBox, isTopRating && styles.bestMetricBox]}>
                      <Text style={styles.metricLabel}>Patient Rating</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={styles.metricValue}>⭐ {h.overall_rating}</Text>
                        {isTopRating && <Text>🏆</Text>}
                      </View>
                    </View>

                    {/* Metric 2: Live ICU */}
                    <View style={[styles.metricBox, isTopIcu && styles.bestMetricBox]}>
                      <Text style={styles.metricLabel}>Available ICU Beds</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text
                          style={[
                            styles.metricValue,
                            { color: h.beds_icu_available > 0 ? colors.success : colors.emergency },
                          ]}
                        >
                          {h.beds_icu_available} / {h.beds_icu}
                        </Text>
                        {isTopIcu && <Text>🏆</Text>}
                      </View>
                    </View>

                    {/* Metric 3: Total Bed Capacity */}
                    <View style={[styles.metricBox, isTopBeds && styles.bestMetricBox]}>
                      <Text style={styles.metricLabel}>Total Capacity</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={styles.metricValue}>{h.beds_total} beds</Text>
                        {isTopBeds && <Text>🏆</Text>}
                      </View>
                    </View>

                    {/* Metric 4: PMJAY */}
                    <View style={styles.metricBox}>
                      <Text style={styles.metricLabel}>PMJAY Empanelled</Text>
                      <Text style={styles.metricValue}>
                        {h.is_pmjay_empanelled ? "Covered ✓" : "No"}
                      </Text>
                    </View>

                    {/* Metric 5: Trauma Care */}
                    <View style={styles.metricBox}>
                      <Text style={styles.metricLabel}>Trauma Center</Text>
                      <Text style={styles.metricValue}>
                        {h.is_trauma_center ? `🚨 ${h.trauma_level}` : "Basic"}
                      </Text>
                    </View>

                    {/* Metric 6: Indicative Cost Range */}
                    <View style={styles.metricBox}>
                      <Text style={styles.metricLabel}>Indicative Cost Range</Text>
                      <Text style={[styles.metricValue, { color: colors.primary }]}>
                        {h.cost_indicative}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => navigation.navigate("HospitalDetail", { slug: h.slug })}
                    >
                      <Text style={styles.detailButtonText}>Full Profile →</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </ScrollView>

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
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    paddingBottom: 110,
  },
  cardsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  compareCard: {
    width: 250,
    backgroundColor: colors.card,
    borderRadius: borderRadius.card, // 16px
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  hospitalName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  removeText: {
    color: colors.textTertiary,
    fontSize: 14,
    paddingLeft: 4,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  badgeGovt: {
    backgroundColor: colors.primaryLight,
  },
  badgePvt: {
    backgroundColor: colors.accentLight,
  },
  badgeAccr: {
    backgroundColor: colors.successLight,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  metricBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: 6,
  },
  bestMetricBox: {
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 2,
  },
  detailButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  detailButtonText: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryDark,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  browseButtonText: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 13,
  },
});
