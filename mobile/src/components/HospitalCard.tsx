/**
 * HospitalCard.tsx — Mobile Hospital Card
 * Clean, modern, de-cluttered healthcare card with essential signals.
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
  onViewReviews?: () => void;
  isInCompare?: boolean;
}

export default function HospitalCard({
  hospital,
  onPress,
  onCompare,
  isInCompare = false,
}: HospitalCardProps) {
  const isGovt = hospital.type?.toLowerCase() === "government";

  const handleCallAmbulance = () => {
    const phone = hospital.ambulance_phone || hospital.emergency_phone || "108";
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      {/* Header Row: Name & Govt/Pvt Badge */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          <Text style={styles.name} numberOfLines={1}>
            {hospital.name}
          </Text>
          <Text style={styles.location}>
            📍 {hospital.city}, {hospital.state} • {hospital.distance_km || 3.2} km
          </Text>
        </View>

        <View style={styles.ratingBadge}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>
            {typeof hospital.overall_rating === "number"
              ? hospital.overall_rating.toFixed(1)
              : "4.6"}
          </Text>
          <Text style={styles.reviewCount}>({hospital.total_reviews})</Text>
        </View>
      </View>

      {/* Clinical Telemetry & Key Signals */}
      <View style={styles.signalsRow}>
        {/* ICU Signal */}
        <View style={[styles.signalPill, styles.icuPill]}>
          <View style={[styles.dot, { backgroundColor: hospital.beds_icu_available > 0 ? colors.success : colors.emergency }]} />
          <Text style={styles.icuText}>
            {hospital.beds_icu_available} ICU Beds Free
          </Text>
        </View>

        {/* PMJAY Signal */}
        {hospital.is_pmjay_empanelled ? (
          <View style={[styles.signalPill, styles.pmjayPill]}>
            <Text style={styles.pmjayText}>🛡️ PM-JAY Cashless</Text>
          </View>
        ) : null}

        {/* Type Pill */}
        <View style={[styles.signalPill, isGovt ? styles.govtPill : styles.pvtPill]}>
          <Text style={[styles.typeText, isGovt ? styles.govtText : styles.pvtText]}>
            {hospital.type}
          </Text>
        </View>
      </View>

      {/* Clinical Track Record (Mock Data) */}
      {hospital.top_disease_treated ? (
        <View style={styles.clinicalRow}>
          <Text style={styles.clinicalIcon}>🩺</Text>
          <Text style={styles.clinicalText} numberOfLines={1}>
            <Text style={styles.clinicalHighlight}>{hospital.top_disease_treated}</Text>
            {hospital.total_patients_treated ? ` • ${Number(hospital.total_patients_treated).toLocaleString()} treated` : ""}
            {hospital.overall_success_ratio ? ` (✓ ${hospital.overall_success_ratio})` : ""}
          </Text>
        </View>
      ) : null}

      {/* Indicative Tariff */}
      <View style={styles.tariffRow}>
        <Text style={styles.tariffLabel}>Indicative Tariff:</Text>
        <Text style={styles.tariffValue} numberOfLines={1}>
          {hospital.cost_indicative || (isGovt ? "100% Free / Subsidized" : "₹75,000 – ₹1,80,000")}
        </Text>
      </View>

      {/* Action Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCallAmbulance}
          activeOpacity={0.8}
        >
          <Text style={styles.callIcon}>📞</Text>
          <Text style={styles.callText}>Emergency Call</Text>
        </TouchableOpacity>

        {onCompare && (
          <TouchableOpacity
            style={[styles.compareButton, isInCompare && styles.compareActive]}
            onPress={onCompare}
            activeOpacity={0.8}
          >
            <Text style={[styles.compareText, isInCompare && styles.compareActiveText]}>
              {isInCompare ? "✓ Added" : "+ Compare"}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  star: {
    color: "#D97706",
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B45309",
  },
  reviewCount: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  signalsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.sm,
  },
  signalPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  icuPill: {
    backgroundColor: "rgba(22, 163, 74, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(22, 163, 74, 0.25)",
  },
  icuText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.success,
  },
  pmjayPill: {
    backgroundColor: colors.thistleLight,
    borderWidth: 1,
    borderColor: colors.thistleBorder,
  },
  pmjayText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  govtPill: {
    backgroundColor: "#F4ECF6",
    borderWidth: 1,
    borderColor: colors.thistleBorder,
  },
  pvtPill: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  govtText: {
    color: colors.primary,
  },
  pvtText: {
    color: colors.textSecondary,
  },
  clinicalRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 148, 136, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: spacing.xs,
    gap: 4,
  },
  clinicalIcon: {
    fontSize: 11,
  },
  clinicalText: {
    fontSize: 11,
    color: "#0f766e",
    flex: 1,
  },
  clinicalHighlight: {
    fontWeight: "700",
  },
  tariffRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  tariffLabel: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  tariffValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.sm,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  callIcon: {
    fontSize: 12,
  },
  callText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.emergency,
  },
  compareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  compareActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  compareText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  compareActiveText: {
    color: colors.textInverse,
  },
  viewDetailsButton: {
    marginLeft: "auto",
    paddingVertical: 6,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.accent,
  },
});
