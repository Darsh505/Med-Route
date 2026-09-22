---
name: Clinical Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#47464a'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#78767b'
  outline-variant: '#c8c5ca'
  surface-tint: '#5f5e60'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1d'
  on-primary-container: '#858386'
  inverse-primary: '#c8c6c8'
  secondary: '#5d5e66'
  on-secondary: '#ffffff'
  secondary-container: '#e3e1ec'
  on-secondary-container: '#63646c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00174b'
  on-tertiary-container: '#497cff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e1e4'
  primary-fixed-dim: '#c8c6c8'
  on-primary-fixed: '#1c1b1d'
  on-primary-fixed-variant: '#474649'
  secondary-fixed: '#e3e1ec'
  secondary-fixed-dim: '#c6c5cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#46464e'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets modern clinical practitioners, patient logistics coordinators, and health-tech operators navigating critical transport, dynamic routing, and care delivery. The brand personality is hyper-focused, uncompromisingly clear, and tranquil under pressure. It eschews superficial decoration in favor of high-legibility monochrome discipline, instilling clinical confidence and immediate situational awareness. 

The aesthetic is ultra-minimalist modern: stark contrasts anchored by absolute blacks and sterile whites, balanced by structural slate neutrals, hairline dividers, and surgical data density. Interaction states prioritize clarity over flourish, creating a native mobile utility that feels like an advanced clinical instrument.

## Colors

The core palette is strictly monochrome, operating on a high-contrast binary architecture supported by cool, slate-tinted foundation layers:

- **Primary (`#09090B` / Zinc-950):** The definitive ground for foreground text, primary interactive states, and definitive iconography.
- **Secondary (`#71717A` / Zinc-500):** Subdued functional meta-text, secondary structural outlines, and inactive control thresholds.
- **Tertiary (`#2563EB` / Clinical Blue):** Reserved exclusively as an operational accent for live telemetry, active GPS waypoints, and urgent status indicators to prevent cognitive fatigue.
- **Neutral (`#F8FAFC` / Slate-50):** The sterile canvas background. 

Supporting neutral steps:
- **Surface Elevation 0:** `#FFFFFF` (Base card surface and floating sheets)
- **Surface Canvas:** `#F8FAFC` (Slate-50 ambient background)
- **Border / Divider:** `#E2E8F0` (Slate-200 hairline borders)
- **Border Subdued:** `#F1F5F9` (Slate-100 soft internal cell dividers)
- **Dark Inversion / HUD:** `#18181B` (Zinc-900 for dark mode sheets or persistent clinical telemetry bars)

## Typography

Inter serves as the single typographic family across all roles to maximize clarity and systematic cohesion. Numerical data, timestamps, and route codes must employ tabular figures (`tnum`) and slashed zeros (`zero`) via OpenType features to preserve vertical alignment in dynamic lists.

- **Scale Rationale:** The scale is tightly calibrated for handheld tactical viewing. Dense information hierarchies are managed through weight contrasts (Semibold vs. Regular) and tracking rather than extreme shifts in font size.
- **Case Conventions:** `label-sm` and `label-md` are styled in uppercase with expanded tracking (`0.04em` to `0.06em`) when denoting medical route statuses, priority tags, and metric units.

## Layout & Spacing

The layout utilizes a 4-column fluid grid on mobile devices (320px–480px width) with 16px (`1rem`) outer margins and 16px (`1rem`) column gutters. Content conforms strictly to a 4px base vertical rhythm.

- **Vertical Stacking:** Information-dense feeds (e.g., patient route logs, dispatch lists) use a consistent `space-sm` (8px) gap between cards and `space-md` (12px) padding inside compact containers.
- **Section Breaks:** Major clinical status transitions utilize `space-xl` (24px) spacing to visually isolate separate patient cases or transport runs.
- **Safe Areas:** Mobile headers and action drawers strictly observe device safe areas, anchoring bottom-sheet actions with a fixed 16px baseline cushion above hardware indicators.

## Elevation & Depth

Visual hierarchy is achieved via surface tonal shifts and low-contrast outlines rather than heavy drop shadows, reinforcing a lightweight, precise instrument feel:

- **Level 0 (Canvas):** `#F8FAFC` base layer.
- **Level 1 (Card & Module Surfaces):** Pure `#FFFFFF` enclosed in a crisp 1px solid border (`#E2E8F0`). Zero shadow in resting state.
- **Level 2 (Active/Selected Card):** `#FFFFFF` with a 1px solid `#09090B` border and an ambient micro-shadow: `0 1px 3px rgba(0, 0, 0, 0.05)`.
- **Level 3 (Modal Sheets & Route HUDs):** High-precision frosted glass (`background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-top: 1px solid rgba(226, 232, 240, 0.8)`) or absolute inverted contrast (`#09090B` with `0 8px 24px rgba(0, 0, 0, 0.12)`).

## Shapes

The geometric framework uses restrained, soft corner radii to communicate clinical structure and modern utility:

- **Base Elements (`rounded`):** Standard inputs, small buttons, status indicators, and list items inherit a compact 4px (`0.25rem`) border radius.
- **Structural Cards (`rounded-lg`):** Transit modules, patient overview cards, and diagnostic blocks use 8px (`0.5rem`).
- **Interactive Badges / Status Pills:** Full circular caps (`9999px`) are reserved exclusively for dynamic state pills to distinguish transient status indicators from structural interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#09090B` fill, `#FFFFFF` text, 40px height, 4px corner radius. Pressed state: `#27272A`.
- **Secondary:** `#FFFFFF` surface, 1px solid `#E2E8F0`, `#09090B` text. Active/Pressed state: `#F1F5F9`.
- **Destructive/Critical:** White background, 1px solid `#DC2626`, `#DC2626` text.

### Status Pills
- **Geometry:** Height 22px, `rounded-full` (pill shape), padding: 0 8px.
- **Neutral/Standby:** `#F1F5F9` background, `#334155` text, 1px solid `#E2E8F0`.
- **En Route / Active:** `#EFF6FF` background, `#1D4ED8` text, 1px solid `#BFDBFE`.
- **Critical / Delayed:** `#FEF2F2` background, `#B91C1C` text, 1px solid `#FECACA`.

### Cards
- Pure `#FFFFFF` background, framed by a continuous 1px `#E2E8F0` border.
- Internal padding: `space-lg` (16px).
- Internal dividers between route checkpoints must use a 1px solid `#F1F5F9` hairline rule.

### Input Fields
- Single-line height: 44px (touch-target compliant).
- Border: 1px solid `#E2E8F0`, background: `#FFFFFF`, text: `#09090B`, placeholder: `#A1A1AA`.
- Focused state: 1px solid `#09090B`, no outer glow.

### Checkboxes & Radio Controls
- Base: 18px × 18px square (checkbox) or circle (radio), 1px solid `#71717A`.
- Selected: `#09090B` fill with `#FFFFFF` micro-check or inner radio dot.

### Specialized Route HUD (Bottom Sheet)
- Floating dock resting 12px above bottom safe margin.
- Translucent backdrop blur (`rgba(255, 255, 255, 0.92)`) with a 1px solid `#E2E8F0` top perimeter.
- Integrates tabular telemetry (ETA, Distance Remaining, Patient Stability Vector) separated by thin vertical slate hairpins.