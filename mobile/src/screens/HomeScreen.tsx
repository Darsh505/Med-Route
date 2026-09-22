/**
 * HomeScreen.tsx — Mobile Home Screen
 * Follows Prompt 7 from Stitch Prompt:
 * - Top bar: Med Route logo on left, notification bell and user avatar on right
 * - Search bar: Rounded rectangle with subtle shadow, placeholder "Search hospitals, treatments..."
 * - Quick Actions row: 🔍 Search, ⚖️ Compare, 🆘 SOS (with red pulsing ring)
 * - Categories: Horizontally scrollable category chips in rounded pills
 * - Nearby Hospitals section: Cards with 16px corner radius and live ICU telemetry
 * - Floating SOS action button
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing, borderRadius, shadows } from "../theme/spacing";
import { api, MobileHospital, MOCK_HOSPITALS } from "../services/api";
import { storage } from "../services/storage";
import HospitalCard from "../components/HospitalCard";
import FloatingSOSButton from "../components/FloatingSOSButton";

const CATEGORIES = [
  { id: "cardiac", label: "Cardiac", emoji: "❤️" },
  { id: "ortho", label: "Ortho", emoji: "🦴" },
  { id: "neuro", label: "Neuro", emoji: "🧠" },
  { id: "eye", label: "Eye Care", emoji: "👁️" },
  { id: "renal", label: "Renal", emoji: "🫘" },
  { id: "pediatric", label: "Pediatric", emoji: "👶" },
  { id: "dental", label: "Dental", emoji: "🦷" },
  { id: "general", label: "General", emoji: "🩺" },
];

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState<MobileHospital[]>(MOCK_HOSPITALS);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await api.getNearbyHospitals();
    setHospitals(list);
    const savedCompare = await storage.getCompareIds();
    setCompareIds(savedCompare);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    navigation.navigate("Search", { query: searchQuery });
  };

  const handleCategoryPress = (categoryLabel: string) => {
    navigation.navigate("Search", { category: categoryLabel });
  };

  const handleToggleCompare = async (id: string) => {
    const updated = await storage.toggleCompare(id);
    setCompareIds(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={{ fontSize: 18 }}>🏥</Text>
            </View>
            <View>
              <Text style={styles.logoTitle}>Med Route</Text>
              <Text style={styles.logoSubtitle}>Chandigarh Tricity Node</Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={styles.avatarText}>KC</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search hospitals, treatments, doctor..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={{ color: colors.textTertiary, paddingHorizontal: 4 }}>✕</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 16 }}>🎙️</Text>
          )}
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate("Search")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 20 }}>🔍</Text>
            </View>
            <Text style={styles.quickActionLabel}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate("Compare")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.accentLight }]}>
              <Text style={{ fontSize: 20 }}>⚖️</Text>
            </View>
            <Text style={styles.quickActionLabel}>Compare</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate("SOSModal")}
          >
            <View style={[styles.quickActionIcon, styles.quickActionIconSOS]}>
              <Text style={{ fontSize: 20 }}>🆘</Text>
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.emergency, fontWeight: "800" }]}>
              SOS Alert
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medical Specialties</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryPill}
              onPress={() => handleCategoryPress(cat.label)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Nearby Hospitals Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
            <Text style={styles.sectionSubtitle}>Verified critical care & live ICU capacity</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Text style={styles.seeAllText}>View All ({hospitals.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hospitalsList}>
          {hospitals.map((hosp) => (
            <HospitalCard
              key={hosp.id}
              hospital={hosp}
              onPress={() => navigation.navigate("HospitalDetail", { slug: hosp.slug })}
              onCompare={() => handleToggleCompare(hosp.id)}
              isInCompare={compareIds.includes(hosp.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) for Instant SOS */}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120, // Give room for FAB and tab bar
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primaryDark,
    lineHeight: 22,
  },
  logoSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.textInverse,
    fontWeight: "800",
    fontSize: 12,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: spacing.sm,
    ...shadows.card,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: spacing.md,
    paddingVertical: spacing.sm,
  },
  quickActionItem: {
    alignItems: "center",
    gap: 6,
  },
  quickActionIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  quickActionIconSOS: {
    backgroundColor: colors.emergencyLight,
    borderWidth: 2,
    borderColor: colors.emergency,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  categoriesScroll: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 6,
    ...shadows.card,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  hospitalsList: {
    marginTop: spacing.sm,
  },
});
