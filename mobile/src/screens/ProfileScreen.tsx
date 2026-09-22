/**
 * ProfileScreen.tsx — Mobile User Profile & Transparency Settings
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing, borderRadius, shadows } from "../theme/spacing";

export default function ProfileScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 28, color: colors.textInverse, fontWeight: "900" }}>
              KC
            </Text>
          </View>
          <Text style={styles.userName}>Keshav Chaudhary</Text>
          <Text style={styles.userEmail}>keshav@medroute.in</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Verified Community Contributor</Text>
          </View>
        </View>

        {/* Emergency Contacts Section */}
        <Text style={styles.sectionTitle}>Emergency Dialers</Text>
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
            <Text style={styles.callArrow}>Call →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => Linking.openURL("tel:112")}
          >
            <View style={[styles.listIcon, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 16 }}>🚨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>Emergency Helpline (112)</Text>
              <Text style={styles.listSubtitle}>All-in-one national emergency helpline</Text>
            </View>
            <Text style={styles.callArrow}>Call →</Text>
          </TouchableOpacity>
        </View>

        {/* Data Provenance & Trust Policy */}
        <Text style={styles.sectionTitle}>Data Provenance & Trust Standard</Text>
        <View style={styles.cardSection}>
          <View style={styles.policyItem}>
            <Text style={styles.policyBadge}>⚪ SIMULATED</Text>
            <Text style={styles.policyDesc}>
              Benchmark regional estimates modeled after real PMJAY HBP packages.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <Text style={[styles.policyBadge, { backgroundColor: colors.successLight, color: colors.success }]}>
              🟢 MANUAL_VERIFIED
            </Text>
            <Text style={styles.policyDesc}>
              Audited and verified by Med Route medical network coordinators.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <Text style={[styles.policyBadge, { backgroundColor: "#FDF4FF", color: "#A21CAF" }]}>
              🟢 PMJAY_HBP
            </Text>
            <Text style={styles.policyDesc}>
              Derived directly from National Health Authority reimbursement catalogs.
            </Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Med Route Mobile • v1.0.0 (Expo SDK 52)</Text>
          <Text style={styles.appCopyright}>AI-Powered Hospital Discovery for India</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    width: 68,
    height: 68,
    borderRadius: 34,
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
  sectionTitle: {
    fontSize: 15,
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: {
    fontSize: 14,
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
    fontSize: 13,
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
