/**
 * ProfileScreen.tsx — Mobile User Profile, Auth State & System Transparency
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing, borderRadius, shadows } from "../theme/spacing";
import { authService, MobileUser } from "../services/auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [user, setUser] = useState<MobileUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    setLoading(true);
    try {
      const u = await authService.getUser();
      setUser(u);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadUser();
    });
    loadUser();
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 26, color: colors.textInverse, fontWeight: "900" }}>
              {user ? (user.name ? user.name.slice(0, 2).toUpperCase() : "MR") : "👤"}
            </Text>
          </View>
          <Text style={styles.userName}>{user ? user.name : "Guest Citizen"}</Text>
          <Text style={styles.userEmail}>
            {user ? user.email : "Sign in to save searches, sync comparisons & audit facilities"}
          </Text>

          {user && (
            <View
              style={[
                styles.roleBadge,
                user.role === "admin" && { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  user.role === "admin" && { color: colors.primary },
                ]}
              >
                {user.role === "admin" ? "🛡️ Verified Hospital Administrator" : "👤 Verified Citizen / Patient"}
              </Text>
            </View>
          )}

          {/* Auth Action Buttons */}
          <View style={styles.authButtonsRow}>
            {user ? (
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>{t("profile.logout")}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.signInBtnText}>{t("profile.signInBtn")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        
        {/* Language Selection Card */}
        <Text style={styles.sectionTitle}>{t("profile.languageSettings")}</Text>
        <View style={styles.cardSection}>
          <View style={[styles.listItem, { justifyContent: "space-between" }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.listTitle}>{t("profile.selectLanguage")}</Text>
              <Text style={styles.listSubtitle}>English (EN) • हिंदी (HI) • ਪੰਜਾਬੀ (PA)</Text>
            </View>
            <LanguageSwitcher />
          </View>
        </View>

        {/* Ayushman Bharat PM-JAY National Assistance */}
        <Text style={styles.sectionTitle}>Ayushman Bharat &amp; Patient Assistance</Text>
        <View style={styles.cardSection}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => Linking.openURL("tel:14555")}
          >
            <View style={[styles.listIcon, { backgroundColor: "#FDF4FF" }]}>
              <Text style={{ fontSize: 16 }}>🏛️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>PM-JAY National Toll-Free (14555)</Text>
              <Text style={styles.listSubtitle}>24x7 Ayushman Card &amp; cashless eligibility desk</Text>
            </View>
            <Text style={styles.callArrow}>Call 14555 →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => Linking.openURL("https://nha.gov.in")}
          >
            <View style={[styles.listIcon, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 16 }}>🌐</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>National Health Authority Portal</Text>
              <Text style={styles.listSubtitle}>Official empanelled hospitals &amp; package catalogs</Text>
            </View>
            <Text style={styles.callArrow}>Visit →</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Dialers Section */}
        <Text style={styles.sectionTitle}>Emergency Dispatch Helplines</Text>
        <View style={styles.cardSection}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => Linking.openURL("tel:108")}
          >
            <View style={[styles.listIcon, { backgroundColor: colors.emergencyLight }]}>
              <Text style={{ fontSize: 16 }}>🚑</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>National Ambulance (108)</Text>
              <Text style={styles.listSubtitle}>Toll-free emergency medical transit</Text>
            </View>
            <Text style={styles.callArrow}>Call 108 →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => Linking.openURL("tel:112")}
          >
            <View style={[styles.listIcon, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 16 }}>🚨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>National Unified Emergency (112)</Text>
              <Text style={styles.listSubtitle}>All-in-one disaster &amp; acute response</Text>
            </View>
            <Text style={styles.callArrow}>Call 112 →</Text>
          </TouchableOpacity>
        </View>

        {/* Clinical Quality Standards */}
        <Text style={styles.sectionTitle}>Clinical Quality &amp; Trust Standards</Text>
        <View style={styles.cardSection}>
          <View style={styles.policyItem}>
            <Text
              style={[
                styles.policyBadge,
                { backgroundColor: colors.primaryLight, color: colors.primary },
              ]}
            >
              NABH ACCREDITED
            </Text>
            <Text style={styles.policyDesc}>
              National Accreditation Board for Hospitals patient safety protocols.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <Text
              style={[
                styles.policyBadge,
                { backgroundColor: colors.successLight, color: colors.success },
              ]}
            >
              NHA HBP 2.2
            </Text>
            <Text style={styles.policyDesc}>
              Standardized procedure package limits verified by National Health Authority.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <Text
              style={[
                styles.policyBadge,
                { backgroundColor: "#FDF4FF", color: "#A21CAF" },
              ]}
            >
              PMJAY CASHLESS
            </Text>
            <Text style={styles.policyDesc}>
              100% cashless coverage for eligible golden cardholders with zero top-up.
            </Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>{t("brand.name")} Mobile • v1.2.0 (Expo SDK 52 / React Native 0.86)</Text>
          <Text style={styles.appCopyright}>AI-Powered Hospital Discovery &amp; Triage for India</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 110,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  userName: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    marginTop: spacing.sm,
  },
  roleText: {
    color: colors.accentDark,
    fontSize: 11,
    fontWeight: "700",
  },
  authButtonsRow: {
    marginTop: 14,
    width: "100%",
  },
  signInBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  signInBtnText: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 13,
  },
  logoutBtn: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  logoutBtnText: {
    color: colors.emergency,
    fontWeight: "700",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primaryDark,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  cardSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  demoButtonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  demoRoleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: "center",
  },
  demoRoleBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  demoRoleBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  demoRoleBtnTextActive: {
    color: colors.primary,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  listIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  listSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  callArrow: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  policyItem: {
    marginBottom: spacing.sm,
  },
  policyBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.borderLight,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    marginBottom: 2,
  },
  policyDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  appInfo: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  appVersion: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textTertiary,
  },
  appCopyright: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
