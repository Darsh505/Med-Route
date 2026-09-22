---
name: Clinical Dispatch
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#41474e'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#72787f'
  outline-variant: '#c1c7cf'
  surface-tint: '#2f6388'
  primary: '#00334f'
  on-primary: '#ffffff'
  primary-container: '#0c4a6e'
  on-primary-container: '#88b9e3'
  inverse-primary: '#9bccf6'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#660019'
  on-tertiary: '#ffffff'
  tertiary-container: '#900027'
  on-tertiary-container: '#ff969c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cbe6ff'
  primary-fixed-dim: '#9bccf6'
  on-primary-fixed: '#001e30'
  on-primary-fixed-variant: '#0e4b6f'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  metric-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  metric-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered for mission-critical health technology platforms, emergency transit logistics, and enterprise hospital telemetry networks. It embodies high-reliability engineering, verified clinical accuracy, and calm authority under high-stress conditions. 

The aesthetic synthesizes modern **Corporate Precision** with **Functional Clinical Minimalism**:
- **Clarity over Density**: Strip away presentation slide-deck artifacting, cramped badges, and multi-tier sub-containers in favor of generous white space, deliberate grouping, and clear hierarchical scan paths.
- **Urgency with Composure**: Critical alerts and emergency telemetry demand immediate perception without creating cognitive panic. High-contrast clinical signals (emergency vermilion, golden hour alerts, active corridors) operate strictly against pristine slate and neutral foundations.
- **Target Audience**: Hospital administrators, emergency dispatchers, trauma surgeons, and prospective institutional healthcare partners who require zero latency, high-density data legibility, and unquestionable trust.

## Colors

The color palette grounds the UI in institutional clinical depth while retaining hyper-visible state signals for emergency triage and live network telemetry.

### Palette Roles
- **Primary (`#0C4A6E` - Deep Clinical Cyan / Navy)**: Anchors key structural layouts, navigation bars, primary CTAs, and authoritative metric headers. Conveys clinical reliability and deep institutional grounding.
- **Secondary (`#0D9488` - Surgical Teal)**: Used for live network pulses, verified status indicators, active triage states, and confirmed facility telemetry.
- **Tertiary (`#E11D48` - Crimson / Emergency Signal)**: Reserved strictly for life-critical anomalies, ambulance SOS dispatches, active triage flags, and diversion hazard warnings.
- **Neutral (`#0F172A` - Slate Black)**: Governs primary typographic layers. Neutral scale is built on clean blue-tinted slates (`#F8FAFC`, `#F1F5F9`, `#E2E8F0`, `#64748B`) rather than dirty grays, sustaining an immaculate clinical finish.

### Functional Roles
- **Success / Corridors**: `#059669` (Emerald) for active green corridors and open capacity.
- **Surface Elevation**: `#FFFFFF` for elevated data cards, nested within a `#F8FAFC` canvas backdrop.

## Typography

The type system blends the contemporary, authoritative geometry of **Plus Jakarta Sans** for headlines and high-impact clinical metrics with the utilitarian legibility of **Inter** for dense dashboards, audit tables, and medical telemetry readouts.

### Hierarchy Guidelines
- **Metric Figures**: Numbers representing triage locks, bed capacity, and transit ETAs must use `metric-xl` or `metric-md` with tabular numerals (`font-feature-settings: 'tnum'`) to avoid layout jitter during live updates.
- **Labels & Overlines**: Uppercase labels (`label-sm`, `label-md`) strictly employ positive letter-spacing (`+0.04em` to `+0.05em`) to balance small sizes and improve immediate visual parsing.
- **Display Headlines**: Restricted to high-level system summaries and product milestone hero areas. Avoid nesting multiple display sizes on a single screen to maintain a decluttered surface.

## Layout & Spacing

A 12-column fluid grid system governs desktop dashboards, transitioning to an 8-column layout on tablets and a 4-column layout on mobile viewports.

### Spacing Principles
- **Uncluttered Canvas**: Unlike dense slide decks that wrap every metric in nested chips and mini-boxes, this system enforces a minimum of `space-lg` (24px) internal card padding and `gutter` (24px) separation between major modules.
- **Information Grouping**: Elements with direct spatial relationships (e.g., metric label, primary value, and delta indicator) are held tightly with `space-xs` (4px) to `space-sm` (8px). Sibling clinical modules are separated cleanly with `space-md` (16px) or `space-lg` (24px).
- **Reflow Rules**: Multi-column telemetry grids (such as 3-up emergency stages or side-by-side hospital comparisons) collapse into stacked progressive accordions or swipeable segmented views on mobile screens to preserve vital touch targets.

## Elevation & Depth

Visual hierarchy is maintained through **Tonal Surface Separation** complemented by ultra-soft, diffused ambient shadows and crisp low-contrast borders.

### Elevation Architecture
- **Canvas Base (`surface-base`)**: Pure neutral tint `#F8FAFC`. All primary content sits over this light, fatigue-reducing background.
- **Card Surface (`surface-raised`)**: Pure white `#FFFFFF` paired with a delicate 1px border (`#E2E8F0`) and an ambient shadow: `0px 1px 3px rgba(15, 23, 42, 0.04), 0px 6px 16px rgba(15, 23, 42, 0.03)`.
- **Active / Alert Surface (`surface-critical`)**: Soft crimson wash `#FFF1F2` paired with `#FECDD3` border for unconfirmed hospital locks or red-tier emergencies.
- **Command / Telemetry Inset (`surface-inset`)**: Dark slate surface `#0F172A` with interior edge shadow `inset 0px 1px 2px rgba(0, 0, 0, 0.3)` reserved exclusively for real-time live map corridors, radar sync modules, and telemetry consoles.

## Shapes

The design uses a clean, modern **Rounded** form language (`roundedness: 2`):
- **Base Components**: Inputs, action buttons, table rows, and status badges take `0.5rem` (8px) radius, conveying modern software poise without whimsical softness.
- **Structural Cards & Panels**: Containers and modal viewports use `1rem` (16px) corner radius, softening edge tensions on high-density medical charts.
- **Status Pills & Live Indicators**: Badges displaying connection status, live telemetry locks, and protocol markers maintain a full pill radius (`9999px`) to immediately visually differentiate tags from structural containers.

## Components

### Buttons
- **Primary CTA**: Deep clinical blue background (`#0C4A6E`), white bold text, 8px corner radius, with subtle hover elevation and state transition (`#075985`).
- **Emergency Action**: Saturated red fill (`#E11D48`), white text, accompanied by a pulsing ping dot for active SOS triggers.
- **Secondary / Ghost**: White background, 1px border (`#CBD5E1`), text `#0F172A`, turning `#F1F5F9` on hover.

### Telemetry Badges & Chips
- Status badges feature a 2-tone appearance: light pastel background with dark saturated text (e.g., `#CCFBF1` with `#0F766E` text for active telemetry).
- Pulsing status dots (`w-2 h-2 rounded-full`) accompany real-time data feeds to show live connectivity without intrusive animations.

### Metric Callout Cards
- Decluttered architecture: a high-contrast label (`label-sm`), followed by an oversized tabular metric (`metric-xl`), and an inline status indicator (delta arrow, unit suffix, or compliance badge). 
- Avoid double-boxing metrics inside sub-cards; leverage clean horizontal rules or clear vertical whitespace dividers.

### Data Inputs & Search Fields
- Crisp `#FFFFFF` background with `#CBD5E1` borders, scaling to `#0284C7` with a 3px ring (`rgba(2, 132, 199, 0.15)`) on focus.
- Integrated left icons for rapid query identification (e.g., hospital node search, specialty lookup, ICD-10 code intake).

### Hospital Node & Comparison Cards
- Visual split: left side contains node identification, accreditation tags (`NABH`, `JCI`), and geographic distance; right side contains live capacity gauges (ICU beds, ER intake delay, ventilator availability).
- Micro-progress bars and gauges use surgical teal (`#0D9488`) for safe operating bandwidth and amber/red for diverted/at-capacity states.