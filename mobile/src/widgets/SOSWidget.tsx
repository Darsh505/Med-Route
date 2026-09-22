/**
 * SOSWidget.tsx — Android Home Screen Widget Reference
 * Follows Prompt 8 from Stitch Prompt:
 * - 2x1 Android widget for Med Route
 * - Widget background: Deep red (#DC2626) with rounded corners
 * - Large white "🆘 SOS" text on the left, "Emergency" smaller text below
 * - White arrow icon suggesting "tap to activate"
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { colors } from "../theme/colors";
import { borderRadius, shadows, spacing } from "../theme/spacing";

export default function SOSWidget({ onWidgetPress }: { onWidgetPress?: () => void }) {
  const handleTrigger = () => {
    if (onWidgetPress) {
      onWidgetPress();
    } else {
      Linking.openURL("tel:108");
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleTrigger}
      style={styles.widgetContainer}
    >
      <View style={styles.leftContent}>
        <View style={styles.sosRow}>
          <Text style={styles.sosEmoji}>🆘</Text>
          <Text style={styles.sosTitle}>SOS</Text>
        </View>
        <Text style={styles.sosSubtitle}>Emergency Trauma Dispatch</Text>
      </View>

      <View style={styles.rightAction}>
        <View style={styles.arrowCircle}>
          <Text style={styles.arrowIcon}>➔</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  widgetContainer: {
    width: "100%",
    height: 78,
    backgroundColor: colors.emergency, // #DC2626
    borderRadius: borderRadius.card, // 16px
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    ...shadows.floatingButton,
  },
  leftContent: {
    justifyContent: "center",
  },
  sosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sosEmoji: {
    fontSize: 20,
  },
  sosTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textInverse,
    letterSpacing: 1,
  },
  sosSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    marginTop: 2,
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: "900",
  },
});
