/**
 * colors.ts — Med Route Mobile Design Tokens
 * Follows the visual design system from Prompt 10 & Prompt 7:
 * - Primary: Deep Medical Blue (#1B4D89)
 * - Accent: Vibrant Health Teal (#0EA5A0)
 * - Emergency: Urgent Red (#DC2626)
 * - Success: Verified Green (#16A34A)
 * - Warning: Warm Amber (#F59E0B)
 */

export const colors = {
  // Brand Palette
  primary: "#1B4D89",
  primaryDark: "#0F172A",
  primaryLight: "#EFF6FF",
  primaryBorder: "#DBEAFE",

  accent: "#0EA5A0",
  accentLight: "#F0FDFA",
  accentDark: "#0F766E",
  accentBorder: "#CCFBF1",

  // Emergency & Critical Care
  emergency: "#DC2626",
  emergencyDark: "#991B1B",
  emergencyLight: "#FEF2F2",
  emergencyBorder: "#FEE2E2",

  // Status & Badges
  success: "#16A34A",
  successLight: "#F0FDF4",
  successBorder: "#DCFCE7",

  warning: "#D97706",
  warningLight: "#FFFBEB",
  warningBorder: "#FEF3C7",

  info: "#0284C7",
  infoLight: "#F0F9FF",

  // Neutral Surfaces
  background: "#F8FAFC",
  card: "#FFFFFF",
  cardElevated: "#FFFFFF",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  divider: "#E2E8F0",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  textInverse: "#FFFFFF",
  textLink: "#1B4D89",

  // Overlays
  overlayDark: "rgba(15, 23, 42, 0.75)",
  overlayEmergency: "rgba(220, 38, 38, 0.92)",
  shimmer: "#E2E8F0",
};

export default colors;
