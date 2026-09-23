/**
 * HospitalCard.tsx — Mobile Hospital Card
 * Clean, modern, de-cluttered healthcare card with essential signals and 100% localization.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { colors } from "../theme/colors";
import { borderRadius, shadows, spacing } from "../theme/spacing";
import { MobileHospital } from "../services/api";
import { localizeHospital } from "../i18n/hospitalLocalization";

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
  const { t, i18n } = useTranslation();
  const locHosp = localizeHospital(hospital, i18n.language || "en");
  const isGovt = hospital.type?.toLowerCase() === "government";

  const handleCallAmbulance = () => {
    const phone = locHosp.ambulance_phone || locHosp.emergency_phone || "108";
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
            {locHosp.name}
          </Text>
          <Text style={styles.location}>
            📍 {locHosp.city}, {locHosp.state} • {locHosp.distance_km || 3.2} {t("common.km")}
          </Text>
        </View>

        <View style={styles.ratingBadge}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>
            {typeof locHosp.overall_rating === "number"
              ? locHosp.overall_rating.toFixed(1)
              : "4.6"}
          </Text>
          <Text style={styles.reviewCount}>({locHosp.total_reviews})</Text>
        </View>
      </View>

      {/* Clinical Telemetry & Key Signals */}
      <View style={styles.signalsRow}>
        {/* ICU Signal */}
        <View style={[styles.signalPill, styles.icuPill]}>
          <View style={[styles.dot, { backgroundColor: locHosp.beds_icu_available > 0 ? colors.success : colors.emergency }]} />
          <Text style={styles.icuText}>
            {t("hospitalCard.icuBedsFree", { count: locHosp.beds_icu_available })}
          </Text>
        </View>

        {/* PMJAY Signal */}
        {locHosp.is_pmjay_empanelled ? (
          <View style={[styles.signalPill, styles.pmjayPill]}>
            <Text style={styles.pmjayText}>💳 {t("hospitalCard.pmjayCashless")}</Text>
          </View>
        ) : null}

        {/* Type Pill */}
        <View style={[styles.signalPill, isGovt ? styles.govtPill : styles.pvtPill]}>
          <Text style={[styles.typeText, isGovt ? styles.govtText : styles.pvtText]}>
            {locHosp.type}
          </Text>
        </View>
      </View>

      {/* Clinical Track Record */}
      {locHosp.top_disease_treated ? (
        <View style={styles.clinicalRow}>
          <Text style={styles.clinicalIcon}>🔬</Text>
          <Text style={styles.clinicalText} numberOfLines={1}>
            <Text style={styles.clinicalHighlight}>{locHosp.top_disease_treated}</Text>
            {locHosp.total_patients_treated ? ` • ${Number(locHosp.total_patients_treated).toLocaleString()} ${t("hospitalCard.treated")}` : ""}
            {locHosp.overall_success_ratio ? ` (✓ ${locHosp.overall_success_ratio})` : ""}
          </Text>
        </View>
      ) : null}

      {/* Indicative Tariff */}
      <View style={styles.tariffRow}>
        <Text style={styles.tariffLabel}>{t("hospitalCard.indicativeTariff")}</Text>
        <Text style={styles.tariffValue} numberOfLines={1}>
          {locHosp.cost_indicative || (isGovt ? t("hospitalCard.freeSubsidized") : "₹75,000 - ₹1,80,000")}
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
          <Text style={styles.callText}>{t("hospitalCard.emergencyCall")}</Text>
        </TouchableOpacity>

        {onCompare && (
          <TouchableOpacity
            style={[styles.compareButton, isInCompare && styles.compareActive]}
            onPress={onCompare}
            activeOpacity={0.8}
          >
            <Text style={[styles.compareText, isInCompare && styles.compareActiveText]}>
              {isInCompare ? `✓ ${t("hospitalCard.added")}` : t("hospitalCard.compare")}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>{t("hospitalCard.viewDetails")} ➔</Text>
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 22,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAmber,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    gap: 3,
  },
  star: {
    color: colors.warning,
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  reviewCount: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  signalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  signalPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  icuPill: {
    backgroundColor: colors.surfaceMint,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  icuText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "600",
  },
  pmjayPill: {
    backgroundColor: colors.surfaceIce,
  },
  pmjayText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
  },
  govtPill: {
    backgroundColor: colors.surfaceAmber,
  },
  govtText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: "600",
  },
  pvtPill: {
    backgroundColor: colors.surfaceIce,
  },
  pvtText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: "600",
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  clinicalRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  clinicalIcon: {
    fontSize: 12,
  },
  clinicalText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  clinicalHighlight: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  tariffRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  tariffLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tariffValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  callIcon: {
    fontSize: 12,
  },
  callText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.success,
  },
  compareButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  compareActive: {
    backgroundColor: colors.surfaceIce,
    borderColor: colors.primary,
  },
  compareText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  compareActiveText: {
    color: colors.primary,
    fontWeight: "700",
  },
  viewDetailsButton: {
    flex: 1,
    alignItems: "flex-end",
  },
  viewDetailsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
});
