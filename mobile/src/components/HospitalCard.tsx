/**
 * HospitalCard.tsx — Mobile Hospital Card
 * Prompt 7: "Cards have 16px corner radius. White background, rounded cards with subtle shadows.
 * Medical blue for headers, teal for active states, red only for SOS."
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { colors } from "../theme/colors";
import { borderRadius, shadows, spacing } from "../theme/spacing";
import { MobileHospital } from "../services/api";

interface HospitalCardProps {
  hospital: MobileHospital;
  onPress: () => void;
  onCompare?: () => void;
  isInCompare?: boolean;
}

export default function HospitalCard({
  hospital,
  onPress,
  onCompare,
  isInCompare = false,
}: HospitalCardProps) {
  const isGovt = hospital.type === "Government";

  const handleCallAmbulance = () => {
    const phone = hospital.ambulance_phone || hospital.emergency_phone || "108";
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          <Text style={styles.name} numberOfLines={1}>
            {hospital.name}
          </Text>
          <Text style={styles.location}>
            📍 {hospital.city}, {hospital.state} • {hospital.distance_km} km
          </Text>
        </View>

        <View style={styles.ratingBadge}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.ratingText}>{hospital.overall_rating}</Text>
          <Text style={styles.reviewCount}>({hospital.total_reviews})</Text>
        </View>
      </View>

      {/* Badges Row */}
      <View style={styles.badgesRow}>
        <View style={[styles.badge, isGovt ? styles.badgeGovt : styles.badgePvt]}>
          <Text style={[styles.badgeText, isGovt ? styles.badgeGovtText : styles.badgePvtText]}>
            {hospital.type}
          </Text>
        </View>

        {hospital.accreditation ? (
          <View style={[styles.badge, styles.badgeAccr]}>
            <Text style={styles.badgeAccrText}>{hospital.accreditation}</Text>
          </View>
        ) : null}

        {hospital.is_pmjay_empanelled ? (
          <View style={[styles.badge, styles.badgePmjay]}>
            <Text style={styles.badgePmjayText}>PMJAY ✓</Text>
          </View>
        ) : null}

        {hospital.is_trauma_center ? (
          <View style={[styles.badge, styles.badgeTrauma]}>
            <Text style={styles.badgeTraumaText}>🚨 {hospital.trauma_level || "Trauma"}</Text>
          </View>
        ) : null}
      </View>

      {/* Clinical Pros Badges */}
      {hospital.pros && hospital.pros.length > 0 && (
        <View style={styles.prosContainer}>
          {hospital.pros.slice(0, 2).map((pro, idx) => (
            <View key={idx} style={styles.proChip}>
              <Text style={styles.proChipText} numberOfLines={1}>
                ✓ {pro}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* ICU Telemetry Row */}
      <View style={styles.telemetryRow}>
        <View style={styles.telemetryItem}>
          <Text
            style={[
              styles.telemetryValue,
              { color: hospital.beds_icu_available > 0 ? colors.success : colors.emergency },
            ]}
          >
            {hospital.beds_icu_available}
          </Text>
          <Text style={styles.telemetryLabel}>ICU Available</Text>
        </View>

        <View style={styles.telemetryDivider} />

        <View style={styles.telemetryItem}>
          <Text style={styles.telemetryValue}>{hospital.beds_icu}</Text>
          <Text style={styles.telemetryLabel}>Total ICU</Text>
        </View>

        <View style={styles.telemetryDivider} />

        <View style={styles.telemetryItem}>
          <Text style={styles.telemetryValue}>{hospital.beds_total}</Text>
          <Text style={styles.telemetryLabel}>Total Beds</Text>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.ambulanceButton}
          onPress={handleCallAmbulance}
          activeOpacity={0.85}
        >
          <Text style={styles.ambulanceButtonText}>🚑 Ambulance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Details →</Text>
        </TouchableOpacity>

        {onCompare && (
          <TouchableOpacity
            style={[styles.compareButton, isInCompare && styles.compareButtonActive]}
            onPress={onCompare}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.compareButtonText,
                isInCompare && styles.compareButtonTextActive,
              ]}
            >
              {isInCompare ? "✓" : "+"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.card, // 16px
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryDark,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    gap: 3,
  },
  star: {
    fontSize: 12,
    color: colors.warning,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400E",
  },
  reviewCount: {
    fontSize: 11,
    color: "#B45309",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeGovt: {
    backgroundColor: colors.primaryLight,
  },
  badgeGovtText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  badgePvt: {
    backgroundColor: colors.accentLight,
  },
  badgePvtText: {
    color: colors.accentDark,
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
  badgeTrauma: {
    backgroundColor: colors.emergencyLight,
  },
  badgeTraumaText: {
    color: colors.emergency,
    fontSize: 11,
    fontWeight: "700",
  },
  telemetryRow: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  telemetryItem: {
    alignItems: "center",
  },
  telemetryValue: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  telemetryLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 1,
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  ambulanceButton: {
    backgroundColor: colors.emergencyLight,
    borderWidth: 1,
    borderColor: colors.emergencyBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  ambulanceButtonText: {
    color: colors.emergency,
    fontWeight: "700",
    fontSize: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 13,
  },
  compareButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  compareButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  compareButtonText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  compareButtonTextActive: {
    color: colors.accentDark,
  },
  prosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.sm,
  },
  proChip: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    maxWidth: "100%",
  },
  proChipText: {
    color: colors.accentDark,
    fontSize: 11,
    fontWeight: "600",
  },
});
