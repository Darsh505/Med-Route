---
name: Clinical Discovery System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006948'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855d'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  metric-val:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is built for critical medical discovery, hospital navigation, and healthcare triage where clarity, immediate comprehension, and clinical trust are vital. The interface serves patients, caregivers, and emergency contacts navigating high-stakes healthcare choices under time-sensitive conditions.

### Design Movement & Aesthetic
The system draws from **Modern Clean Healthcare & High-Legibility Utilitarianism**:
- **Pristine Clinical Clarity:** Crisp white foreground containers sit on calm, cool-tinted slate neutral backgrounds (`#F8FAFC`).
- **Triage Visual Hierarchy:** Color is reserved strictly for semantic guidance—vibrant medical blue for wayfinding and primary digital utility, emerald green for trust and verified accreditation, and high-impact emergency red for urgent action points (SOS, critical triage, trauma care).
- **Tactile Rounded Modernism:** Softened geometries (pill badges, 16px–24px curved container cards) counterbalance medical sterility with approachability, reducing cognitive friction during high-stress interactions.

## Colors

The palette is engineered around instant legibility, institutional validation, and urgency signaling.

- **Primary (`#0284C7` / `#1976D2`):** Vibrant Clinical Blue. Used for primary focus indicators, active navigation tabs, action buttons, dynamic filter selections, and location indicators.
- **Secondary (`#0F172A` / `#1E293B`):** Deep Hospital Navy/Slate. Serves as high-contrast primary text, deep slate CTAs (`#0F172A` "View Hospital" buttons), and structural iconography.
- **Tertiary (`#059669` / `#10B981`):** Accreditation Emerald. Used exclusively for verified credentials (e.g., NABH, JCI verification badges), live bed availability indicators, and positive status metrics.
- **Emergency Accent (`#DC2626` / `#EF4444`):** Urgent Red. Reserved for urgent triage, emergency hotline access, and the floating SOS triage action pill.
- **Backgrounds & Neutrals:** Surface canvas uses `#F8FAFC`, stepping to `#FFFFFF` on elevated card bodies. Subtle borders rely on `#E2E8F0`, with muted metadata text rendered in `#64748B`.

## Typography

Typography relies entirely on **Inter** across all roles to ensure rapid legibility at varying scales, tabular number alignment for pricing/distance metadata, and neutral authority.

- **Headlines:** Dense tracking (`-0.02em` to `-0.03em`) and heavy weights (`700` and `800`) ensure quick scannability during critical searches. Key value assertions utilize contextual underlined typography (e.g., "when every minute counts").
- **Metrics & Numbers:** All pricing data, distance stats, and ICU bed counters leverage medium-to-bold weights with tight spacing for quick scanning.
- **Micro-Copy:** Badges and metadata chips utilize `label-sm` with slight positive tracking (`0.02em`) for clarity when viewed over photographic card headers or tinted pill surfaces.

## Layout & Spacing

The layout is built upon a standard mobile-first fluid grid that transitions into a multi-column responsive workspace on larger viewports.

### Grid & Canvas
- **Mobile (<768px):** Single column fluid flow with `margin: 1rem` (16px) outer gutter. Elements stack vertically with consistent `space-lg` (16px) or `space-xl` (24px) gap separation.
- **Tablet & Desktop (≥768px):** 12-column layout with 24px gutters, max canvas width capped at 1280px, centering hospital discovery search feeds and filter rail sidebars.

### Component Spacing Rhythm
- **Internal Card Padding:** Hospital discovery cards use `space-lg` (16px) padding around textual and pricing bodies.
- **Nested Tier Groups:** Package estimate containers and metadata rows use `space-md` (12px) horizontal and vertical inner spacing with `space-sm` (8px) inter-item spacing.
- **Horizontal Chips:** Filter bars and specialty carousels maintain an 8px (`space-sm`) horizontal gap with free-overflow scrolling.

## Elevation & Depth

Visual hierarchy uses crisp boundary surfaces supplemented by soft, tinted ambient shadows to keep the UI light and clinical rather than heavy or dark.

### Elevation Levels
- **Level 0 (Canvas Base):** Default viewport background set to `#F8FAFC`. Zero elevation.
- **Level 1 (Clinical Cards & Search):** Pure white `#FFFFFF` surface accompanied by a subtle stroke `border: 1px solid #E2E8F0` and a diffuse ambient shadow: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Active Modals & Floating Pills):** The emergency SOS action button and active dropdowns sit elevated with `box-shadow: 0 8px 24px -4px rgba(220, 38, 38, 0.35)` for urgent items, or `rgba(15, 23, 42, 0.12)` for standard floating elements.
- **Overlay Pills (Over Media):** Distance and accreditation tags situated directly on hospital imagery use frosted backdrop blurs (`backdrop-filter: blur(8px)`) with semi-translucent fills (e.g., `rgba(255, 255, 255, 0.92)` or solid brand fills with crisp inner contrast).

## Shapes

The geometric identity balances approachable modern healthcare with structured utility:

- **Cards & Primary Modules:** Standardized to `rounded-2xl` (16px to 20px) radius to soften card perimeters and frame medical imagery cleanly.
- **Buttons & Filter Badges:** Utilize full pill styling (`rounded-full` / 9999px) for active search criteria, distance markers, and urgent triage triggers.
- **Specialty Icons & Small Widgets:** Feature rounded square contours (`rounded-xl` / 12px to 14px) for category navigation (Renal, Cardiac, Ortho), providing a tactile touch target.
- **Inner Data Boxes:** Package estimate blocks embedded within cards use `rounded-xl` (12px) to clearly group complex pricing data without fighting the parent container's curve.

## Components

### Buttons
- **Primary Deep Slate Action ("View Hospital"):** Solid `#0F172A` background, white label text, `rounded-xl` (10px–12px) radius, 40px height, high visual contrast for conversion.
- **Emergency Action Pill ("SOS Triage"):** Pill-shaped floating badge with solid `#DC2626` background, crisp white icon and text, elevated with red glow shadow (`0 8px 20px -4px rgba(220, 38, 38, 0.4)`).
- **Secondary Icon Utility:** Minimal circular or rounded-square buttons (36px–40px) with 1px border `#E2E8F0` on white, used for directional navigation, audio search, and share/bookmark actions.

### Chips & Filter Tags
- **Selected Filter Chip:** White background, 1px border `#CBD5E1`, dark slate text `#0F172A`, integrated cross (`×`) icon for clearing.
- **Status Indicator Chip:** Soft emerald green wash (`#ECFDF5`), `#065F46` label, featuring a live ping dot (`#10B981`) for "Live Beds Available".
- **Overlay Badges (On Card Images):**
  - *Accreditation:* Solid `#047857` (NABH & JCI) badge with white text, pill-shaped.
  - *Location:* Semi-transparent white (`rgba(255,255,255,0.92)`) pill with dark slate text and direction arrow.
  - *Live Availability:* Translucent dark slate overlay (`rgba(15, 23, 42, 0.7)`) with green indicator dot.

### Cards
- **Hospital Listing Card:**
  - Structure: Upper 16:9 ratio photo container with top/bottom contextual pill overlays; lower structured info section.
  - Sub-Section: "Package Estimates" inner container finished in `#F8FAFC` tint, paired with dual-column tabular pricing breakdown.
  - Footer Action Bar: Dual layout with left-aligned "Compare" checkbox control and right-aligned "View Hospital" action button.

### Form Inputs & Search
- **Primary Search Bar:** Large input height (48px), pill or rounded-xl frame, inset magnifying glass `#64748B`, microphone action, and right-aligned circular or square submit action (`#0F172A`).
- **Checkboxes:** Standard 18px rounded square with subtle border `#CBD5E1`. When selected, filled with `#0284C7` and crisp white checkmark.

### Category Selector
- **Specialty Icon Tiles:** Rounded square boxes (56px × 56px), unselected state uses white fill with 1px `#E2E8F0` border; active state utilizes inverted `#0F172A` fill with clean white line-art medical iconography.