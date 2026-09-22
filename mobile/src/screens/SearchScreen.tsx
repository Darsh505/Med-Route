/**
 * SearchScreen.tsx — Mobile Search & Discovery Screen
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

export default function SearchScreen({ route, navigation }: any) {
  const initialQuery = route.params?.query || "";
  const initialCategory = route.params?.category || "";

  const [query, setQuery] = useState(initialQuery || initialCategory);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [hospitals, setHospitals] = useState<MobileHospital[]>(MOCK_HOSPITALS);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    performSearch(query);
    loadCompare();
  }, [query]);

  const loadCompare = async () => {
    const ids = await storage.getCompareIds();
    setCompareIds(ids);
  };

  const performSearch = async (q: string) => {
    const results = await api.searchHospitals(q);
    setHospitals(results);
  };

  const filteredHospitals = hospitals.filter((h) => {
    if (selectedFilter === "govt") return h.type === "Government";
    if (selectedFilter === "private") return h.type === "Private";
    if (selectedFilter === "pmjay") return h.is_pmjay_empanelled;
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
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search procedure, city, hospital..."
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
      </View>

      {/* Filter Chips Scroll */}
      <View style={{ height: 44, marginBottom: spacing.xs }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { id: "all", label: "All Types" },
            { id: "govt", label: "Government" },
            { id: "private", label: "Private" },
            { id: "pmjay", label: "PMJAY Empanelled" },
            { id: "trauma", label: "Trauma Center" },
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
          {filteredHospitals.length} verified hospitals found
        </Text>
        <Text style={styles.provenanceTag}>⚪ Benchmark Verified</Text>
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
            <Text style={styles.emptyTitle}>No matching hospitals</Text>
            <Text style={styles.emptySubtitle}>
              Try searching with general terms like &quot;Cardiology&quot;, &quot;Ortho&quot;, or &quot;Chandigarh&quot;.
            </Text>
          </View>
        ) : (
          filteredHospitals.map((hosp) => (
            <HospitalCard
              key={hosp.id}
              hospital={hosp}
              onPress={() => navigation.navigate("HospitalDetail", { slug: hosp.slug })}
              onCompare={() => handleToggleCompare(hosp.id)}
              isInCompare={compareIds.includes(hosp.id)}
            />
          ))
        )}
      </ScrollView>

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
    paddingBottom: 110,
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
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: spacing.xl,
  },
});
