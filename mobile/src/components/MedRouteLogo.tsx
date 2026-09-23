import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";
import { colors } from "../theme/colors";

export interface MedRouteLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showBadge?: boolean;
  layout?: "horizontal" | "vertical";
  theme?: "light" | "dark";
  onPress?: () => void;
}

const SIZES = {
  sm: { icon: 34, title: 16, subtitle: 10, badge: 9, gap: 8 },
  md: { icon: 42, title: 20, subtitle: 11, badge: 10, gap: 10 },
  lg: { icon: 54, title: 26, subtitle: 13, badge: 11, gap: 12 },
  xl: { icon: 70, title: 32, subtitle: 14, badge: 12, gap: 14 },
};

export default function MedRouteLogo({
  size = "md",
  showText = true,
  showBadge = false,
  layout = "horizontal",
  theme = "light",
  onPress,
}: MedRouteLogoProps) {
  const cfg = SIZES[size];
  const isDark = theme === "dark";

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        layout === "vertical" ? styles.vertical : styles.horizontal,
        { gap: cfg.gap },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Dynamic Native SVG Emblem */}
      <View style={{ width: cfg.icon, height: cfg.icon }}>
        <Svg viewBox="0 0 80 80" width={cfg.icon} height={cfg.icon}>
          <Defs>
            <LinearGradient id="m-plum" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#8E3B95" />
              <Stop offset="100%" stopColor="#581C87" />
            </LinearGradient>
            <LinearGradient id="m-teal" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#06B6D4" />
              <Stop offset="100%" stopColor="#0284C7" />
            </LinearGradient>
            <LinearGradient id="m-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FB7185" />
              <Stop offset="100%" stopColor="#E11D48" />
            </LinearGradient>
            <LinearGradient id="m-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={isDark ? "#2D1F35" : "#FFFFFF"} />
              <Stop offset="100%" stopColor={isDark ? "#1F1426" : "#F7EFF9"} />
            </LinearGradient>
          </Defs>

          {/* Squircle Tile Base */}
          <Rect
            x="2"
            y="2"
            width="76"
            height="76"
            rx="20"
            fill="url(#m-bg)"
            stroke={isDark ? "#4A2F55" : "#E5D5E8"}
            strokeWidth="1.5"
          />

          {/* Interlocking Healthcare & Route Petals */}
          <G>
            {/* Left Petal: Discovery & Routing (Teal) */}
            <Path
              d="M 22 40 C 22 34 27 29 33 29 C 39 29 40 33 40 40 C 40 47 35 51 29 51 C 25 51 22 46 22 40 Z"
              fill="url(#m-teal)"
            />

            {/* Top Petal: Emergency Waypoint Loop (Plum) */}
            <Path
              d="M 40 22 C 46 22 51 27 51 33 C 51 39 47 40 40 40 C 33 40 29 35 29 29 C 29 25 34 22 40 22 Z"
              fill="url(#m-plum)"
            />

            {/* Bottom Petal: Hospital Infrastructure Anchor */}
            <Path
              d="M 40 58 C 34 58 29 53 29 47 C 29 41 33 40 40 40 C 47 40 51 45 51 51 C 51 55 46 58 40 58 Z"
              fill="url(#m-plum)"
            />

            {/* Right Petal: Cashless Outflow (Coral Rose) */}
            <Path
              d="M 58 40 C 58 46 53 51 47 51 C 41 51 40 47 40 40 C 40 33 45 29 51 29 C 55 29 58 34 58 40 Z"
              fill="url(#m-rose)"
            />

            {/* Central Bridge */}
            <Path
              d="M 25 40 C 32 32 48 32 55 40 C 48 48 32 48 25 40 Z"
              fill="#FFFFFF"
              fillOpacity={0.3}
            />

            {/* Core Waypoint Node */}
            <Circle cx="40" cy="40" r="5" fill="#FFFFFF" />
            <Circle cx="40" cy="40" r="2.5" fill="#581C87" />
          </G>

          {/* Active Navigation Pulse Node */}
          <Circle cx="62" cy="22" r="3.5" fill="#FB7185" />
          <Circle cx="62" cy="22" r="6" stroke="#FB7185" strokeWidth="1" strokeOpacity={0.4} />
        </Svg>
      </View>

      {/* Brand Title & Badges */}
      {showText && (
        <View style={[styles.textWrapper, layout === "vertical" && styles.textCenter]}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { fontSize: cfg.title },
                isDark ? styles.titleDark : styles.titleLight,
              ]}
            >
              Med<Text style={{ color: colors.primary }}>Route</Text>
            </Text>

            {showBadge && (
              <View
                style={[
                  styles.partnerBadge,
                  isDark ? styles.partnerBadgeDark : styles.partnerBadgeLight,
                ]}
              >
                <View style={styles.badgePulseDot} />
                <Text
                  style={[
                    styles.partnerBadgeText,
                    { fontSize: cfg.badge },
                    isDark ? styles.badgeTextDark : styles.badgeTextLight,
                  ]}
                >
                  MediBuddy Partner
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  horizontal: {
    flexDirection: "row",
  },
  vertical: {
    flexDirection: "column",
    justifyContent: "center",
  },
  textWrapper: {
    justifyContent: "center",
  },
  textCenter: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  titleLight: {
    color: colors.textPrimary,
  },
  titleDark: {
    color: "#FFFFFF",
  },
  partnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  partnerBadgeLight: {
    backgroundColor: colors.thistleLight,
    borderColor: colors.border,
  },
  partnerBadgeDark: {
    backgroundColor: "#2D1F35",
    borderColor: "#4A2F55",
  },
  badgePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  partnerBadgeText: {
    fontWeight: "700",
  },
  badgeTextLight: {
    color: colors.primary,
  },
  badgeTextDark: {
    color: "#D8BFD8",
  },
});
