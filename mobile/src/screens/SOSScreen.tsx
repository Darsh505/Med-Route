/**
 * SOSScreen.tsx — Mobile SOS Emergency Modal Screen
 * Follows Prompt 5 from Stitch Prompt:
 * - Full-screen high-contrast emergency view
 * - Header: "EMERGENCY DISPATCH" with alert icon
 * - Big message: "Connecting to Nearest Trauma Center..." with radar pulse animation
 * - Hospital card with phone number in very large text: "📞 0172-274-6018"
 * - Large white button with red text: "📞 CALL NOW"
 * - "🗺️ Get Directions" link
 * - "Hospital has been notified of your emergency" with green checkmark
 * - Fallback: "Can't connect? Call 108 for National Ambulance"
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing, borderRadius, shadows } from "../theme/spacing";
import { locationService } from "../services/location";
import { api } from "../services/api";

export default function SOSScreen({ navigation }: any) {
  const [status, setStatus] = useState<"locating" | "resolved">("locating");
  const [nearestHospital, setNearestHospital] = useState<any>(null);

  // Radar pulse animation
  const radarScale = useRef(new Animated.Value(0.8)).current;
  const radarOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.parallel([
        Animated.timing(radarScale, {
          toValue: 2.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(radarOpacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Trigger SOS dispatch
    dispatchEmergency();
  }, []);

  const dispatchEmergency = async () => {
    const coords = await locationService.getCurrentLocation();
    const result = await api.triggerSOS(coords.latitude, coords.longitude);
    setNearestHospital(result);
    setStatus("resolved");
  };

  const handleCallHospital = () => {
    const phone = nearestHospital?.hospital_emergency_phone || "01722746018";
    Linking.openURL(`tel:${phone}`);
  };

  const handleCall108 = () => {
    Linking.openURL("tel:108");
  };

  const handleDirections = () => {
    Linking.openURL("https://maps.google.com/?q=PGIMER+Chandigarh+Emergency");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>✕ Close</Text>
        </TouchableOpacity>
        <View style={styles.titleBadge}>
          <Text style={styles.alertIcon}>🚨</Text>
          <Text style={styles.titleText}>EMERGENCY DISPATCH</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {status === "locating" ? (
          <View style={styles.locatingContainer}>
            <View style={styles.radarWrapper}>
              <Animated.View
                style={[
                  styles.radarRing,
                  {
                    transform: [{ scale: radarScale }],
                    opacity: radarOpacity,
                  },
                ]}
              />
              <View style={styles.radarCenter}>
                <Text style={{ fontSize: 36 }}>📡</Text>
              </View>
            </View>

            <Text style={styles.locatingTitle}>
              Locating Nearest Trauma Center...
            </Text>
            <Text style={styles.locatingSubtitle}>
              Acquiring GPS coordinates & matching Level-1 critical care units
            </Text>
          </View>
        ) : (
          <View style={styles.resolvedContainer}>
            <Text style={styles.traumaAlertBadge}>
              🚨 NEAREST LEVEL 1 TRAUMA CENTER
            </Text>

            {/* Hospital Card */}
            <View style={styles.hospitalCard}>
              <Text style={styles.hospitalName}>
                {nearestHospital?.hospital_name || "PGIMER Chandigarh"}
              </Text>
              <Text style={styles.hospitalDetails}>
                📍 {nearestHospital?.distance_km || 3.2} km away • ~{nearestHospital?.estimated_arrival_minutes || 8} mins transit
              </Text>

              <View style={styles.icuBadge}>
                <Text style={styles.icuText}>
                  🟢 {nearestHospital?.beds_icu_available || 14} ICU Beds Immediately Available
                </Text>
              </View>

              {/* Very Large Phone Display */}
              <View style={styles.phoneDisplay}>
                <Text style={styles.phoneLabel}>Direct Emergency Desk:</Text>
                <Text style={styles.phoneValue}>
                  📞 {nearestHospital?.hospital_emergency_phone || "0172-274-6018"}
                </Text>
              </View>

              {/* CALL NOW Big Button */}
              <TouchableOpacity
                style={styles.callNowButton}
                activeOpacity={0.88}
                onPress={handleCallHospital}
              >
                <Text style={styles.callNowText}>📞 CALL EMERGENCY NOW</Text>
              </TouchableOpacity>

              {/* Get Directions Link */}
              <TouchableOpacity
                onPress={handleDirections}
                style={styles.directionsLink}
              >
                <Text style={styles.directionsText}>🗺️ Open Turn-by-Turn GPS Directions ↗</Text>
              </TouchableOpacity>
            </View>

            {/* Acknowledged Status Box */}
            <View style={styles.statusBox}>
              <Text style={styles.statusCheck}>✅</Text>
              <Text style={styles.statusText}>
                Hospital ER and triage staff have been alerted to incoming emergency dispatch
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* National Ambulance Fallback Banner */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.fallbackButton}
          onPress={handleCall108}
          activeOpacity={0.8}
        >
          <Text style={styles.fallbackText}>
            Can&apos;t connect? Tap here to call <Text style={{ fontWeight: "900" }}>108 (National Ambulance)</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B91C1C", // High contrast emergency red
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: borderRadius.pill,
  },
  closeText: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 12,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertIcon: {
    fontSize: 16,
  },
  titleText: {
    color: colors.textInverse,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  locatingContainer: {
    alignItems: "center",
    paddingVertical: spacing.huge,
  },
  radarWrapper: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl,
  },
  radarRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  radarCenter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.floatingButton,
  },
  locatingTitle: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  locatingSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  resolvedContainer: {
    gap: spacing.md,
  },
  traumaAlertBadge: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
  },
  hospitalCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.card, // 16px
    padding: spacing.xl,
    alignItems: "center",
    ...shadows.cardHover,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
    textAlign: "center",
    marginBottom: 4,
  },
  hospitalDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  icuBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.lg,
  },
  icuText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "800",
  },
  phoneDisplay: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  phoneLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  phoneValue: {
    fontSize: 26, // Very large phone number
    fontWeight: "900",
    color: colors.emergency,
    marginTop: 2,
  },
  callNowButton: {
    width: "100%",
    backgroundColor: colors.emergency,
    paddingVertical: 16,
    borderRadius: borderRadius.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.floatingButton,
  },
  callNowText: {
    color: colors.textInverse,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  directionsLink: {
    marginTop: spacing.md,
    paddingVertical: 6,
  },
  directionsText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    padding: spacing.md,
    borderRadius: borderRadius.card,
    gap: spacing.sm,
  },
  statusCheck: {
    fontSize: 18,
  },
  statusText: {
    flex: 1,
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "android" ? 24 : spacing.lg,
  },
  fallbackButton: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.card,
    alignItems: "center",
  },
  fallbackText: {
    color: colors.textInverse,
    fontSize: 12,
    textAlign: "center",
  },
});
