/**
 * SelectLocationScreen.tsx — Mobile Location Selection Screen
 * Enables selecting any city across India with auto-selection on boot,
 * GPS one-click detection, and Hoshiarpur priority.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors } from "../theme/colors";
import { spacing, borderRadius, shadows } from "../theme/spacing";
import { locationService, INDIAN_CITIES, CityLocation } from "../services/location";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { localizeCity } from "../i18n/hospitalLocalization";

export default function SelectLocationScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const [currentCity, setCurrentCity] = useState("Hoshiarpur");
  const [isAuto, setIsAuto] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async () => {
    const loc = await locationService.getSelectedCity();
    setCurrentCity(loc.city);
    setIsAuto(loc.isAuto);
  };

  const handleSelectCity = async (city: CityLocation) => {
    await locationService.setSelectedCity(city.name, city.coords);
    setCurrentCity(city.name);
    setIsAuto(false);
    navigation.goBack();
  };

  const handleAutoDetectGPS = async () => {
    setIsLocating(true);
    const detected = await locationService.detectGPSLocation();
    setIsLocating(false);
    if (detected) {
      setCurrentCity(detected.city);
      setIsAuto(true);
      navigation.goBack();
    } else {
      alert("Unable to detect GPS coordinates. Defaulting to Hoshiarpur, Punjab.");
    }
  };

  const filteredCities = INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularCities = INDIAN_CITIES.filter((c) => c.isPopular);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>{t("location.selectLocation")}</Text>
          <Text style={styles.headerSubtitle}>
            {t("location.subtitle")}
          </Text>
        </View>
        <LanguageSwitcher compact />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Location Banner */}
        <View style={styles.activeCard}>
          <View style={styles.activeCardHeader}>
            <View style={styles.activeIconCircle}>
              <Text style={styles.activeIconText}>📍</Text>
            </View>
            <View style={styles.activeInfo}>
              <Text style={styles.activeLabel}>Currently Selected</Text>
              <Text style={styles.activeCityName}>{localizeCity(currentCity, currentLang)}</Text>
            </View>
            <View
              style={[
                styles.badge,
                isAuto ? styles.badgeAuto : styles.badgeCustom,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isAuto ? styles.badgeTextAuto : styles.badgeTextCustom,
                ]}
              >
                {isAuto ? "Auto-Selected" : "Custom"}
              </Text>
            </View>
          </View>
          <Text style={styles.activeNote}>
            Hospitals, emergency ambulances, and ICU occupancy are prioritized around this location.
          </Text>
        </View>

        {/* GPS Auto-Detect Button */}
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleAutoDetectGPS}
          disabled={isLocating}
          activeOpacity={0.8}
        >
          {isLocating ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={styles.gpsIcon}>🎯</Text>
          )}
          <View style={styles.gpsTexts}>
            <Text style={styles.gpsTitle}>
              {isLocating ? t("location.detectingGPS") : t("location.autoDetectGPS")}
            </Text>
            <Text style={styles.gpsSubtitle}>
              Pinpoints nearest accredited trauma center using device coordinates
            </Text>
          </View>
        </TouchableOpacity>

        {/* City Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t("location.searchPlaceholder")}
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Popular Cities Chips */}
        {searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("location.featuredHubs")}</Text>
            <View style={styles.popularGrid}>
              {popularCities.map((city) => {
                const isSelected = city.name.toLowerCase() === currentCity.toLowerCase();
                return (
                  <TouchableOpacity
                    key={city.name}
                    style={[
                      styles.popularChip,
                      isSelected && styles.popularChipSelected,
                      city.name === "Hoshiarpur" && styles.popularChipHoshiarpur,
                    ]}
                    onPress={() => handleSelectCity(city)}
                  >
                    <Text
                      style={[
                        styles.popularChipText,
                        isSelected && styles.popularChipTextSelected,
                        city.name === "Hoshiarpur" && styles.popularChipTextHoshiarpur,
                      ]}
                    >
                      {city.name === "Hoshiarpur" ? `⭐ ${localizeCity("Hoshiarpur", currentLang)}` : localizeCity(city.name, currentLang)}
                    </Text>
                    {isSelected && <Text style={styles.checkMark}> ✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* All Indian Cities List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery.length > 0
              ? `Matching Cities (${filteredCities.length})`
              : "All Indian Cities (Pan-India)"}
          </Text>

          {filteredCities.map((city) => {
            const isSelected = city.name.toLowerCase() === currentCity.toLowerCase();
            return (
              <TouchableOpacity
                key={`${city.name}-${city.state}`}
                style={[styles.cityRow, isSelected && styles.cityRowSelected]}
                onPress={() => handleSelectCity(city)}
                activeOpacity={0.7}
              >
                <View style={styles.cityRowLeft}>
                  <Text style={styles.cityPin}>
                    {city.name === "Hoshiarpur" ? "⭐" : "📍"}
                  </Text>
                  <View>
                    <Text
                      style={[
                        styles.cityName,
                        isSelected && styles.cityNameSelected,
                      ]}
                    >
                      {city.name}
                    </Text>
                    <Text style={styles.cityState}>{localizeCity(city.state, currentLang)}</Text>
                  </View>
                </View>

                {isSelected ? (
                  <View style={styles.activeIndicator}>
                    <Text style={styles.activeIndicatorText}>Active ✓</Text>
                  </View>
                ) : (
                  <Text style={styles.selectArrow}>→</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "700",
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  activeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  activeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  activeIconText: {
    fontSize: 18,
  },
  activeInfo: {
    flex: 1,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activeCityName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeAuto: {
    backgroundColor: colors.accentLight,
  },
  badgeCustom: {
    backgroundColor: colors.primaryLight,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextAuto: {
    color: colors.accentDark,
  },
  badgeTextCustom: {
    color: colors.primary,
  },
  activeNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  gpsIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  gpsTexts: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  gpsSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.sm : spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    color: colors.textTertiary,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  clearSearch: {
    fontSize: 14,
    color: colors.textTertiary,
    padding: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  popularChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  popularChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  popularChipHoshiarpur: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  popularChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  popularChipTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
  popularChipTextHoshiarpur: {
    color: colors.accentDark,
    fontWeight: "700",
  },
  checkMark: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xs,
  },
  cityRowSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  cityRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cityPin: {
    fontSize: 18,
  },
  cityName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cityNameSelected: {
    color: colors.accentDark,
    fontWeight: "700",
  },
  cityState: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  activeIndicator: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  activeIndicatorText: {
    fontSize: 11,
    color: colors.textInverse,
    fontWeight: "700",
  },
  selectArrow: {
    fontSize: 16,
    color: colors.textTertiary,
  },
});
