# 🎨 Med Route — UI Design Stitch Prompts

> Use these prompts with any AI image generator (Midjourney, DALL-E, Figma AI, or Antigravity's `generate_image` tool) to create high-fidelity UI mockups for Med Route.

---

## Design Identity

| Property | Value |
|---|---|
| **App Name** | Med Route |
| **Tagline** | "Find the Right Hospital. At the Right Cost. Near You." |
| **Primary Color** | Deep Medical Blue `#1B4D89` |
| **Accent Color** | Vibrant Teal `#0EA5A0` |
| **Emergency Color** | Urgent Red `#DC2626` |
| **Background** | Clean White `#F8FAFC` / Dark `#0F172A` |
| **Font (Headings)** | Outfit (Google Fonts) |
| **Font (Body)** | Inter (Google Fonts) |
| **Style** | Modern healthcare, glassmorphism cards, subtle gradients, micro-animations |
| **Mood** | Trustworthy, clean, premium, accessible |
| **Icon Style** | Lucide icons — thin, rounded, consistent |

---

## Prompt 1: Web Landing Page

```
Design a modern healthcare web application landing page for "Med Route" — an AI-powered hospital discovery platform for India.

Layout from top to bottom:
- Top navigation bar: Logo "Med Route" with a medical cross icon on the left, navigation links (Search, Compare, SOS) in center, Login and red SOS button on the right. White background with subtle bottom shadow.

- Hero section: Large gradient background transitioning from deep blue (#1B4D89) to teal (#0EA5A0). Centered white text: headline "Find the Right Hospital," second line "At the Right Cost," third line "Near You." — each line slightly staggered. Below the text, a large frosted glass search bar with placeholder text "Find kidney treatment near Chandigarh under ₹2 lakhs..." with a search icon and a teal search button.

- Quick Category section: 8 category cards in a horizontal row on white background. Each card is a rounded rectangle with a subtle gradient and an emoji icon: Heart (❤️ Cardiac), Bone (🦴 Orthopedic), Brain (🧠 Neurological), Eye (👁️ Ophthalmology), Kidney (🫘 Renal), Tooth (🦷 Dental), Stethoscope (🩺 General), Baby (👶 Pediatric). Each card has a soft hover shadow lift effect.

- Trust Metrics section: Three large stat counters on a subtle blue-tinted background: "50+ Verified Hospitals", "200+ Medical Procedures", "₹0 to Compare". Each with an icon above and a micro count-up animation implied.

- Featured Hospitals section: Three horizontal hospital cards showing: hospital name, city, distance (3.2 km), star rating (⭐ 4.8), type badge (Government/Private), accreditation badge (NABH), and a "View Details →" link. Cards have white backgrounds with subtle shadows and a colored left border indicating type (blue for govt, purple for private).

- How It Works section: Three-step horizontal flow: "1. Search in Plain Language" → "2. Compare Side by Side" → "3. Make an Informed Decision" — each with an illustration icon and brief description, connected by dotted line arrows.

- Footer: Dark blue background with links (About, Data Sources, Privacy, Contact), copyright, and a "Data Transparency" note explaining data provenance.

Style: Clean, premium, modern healthcare design. Use Inter font for body, Outfit for headings. White and light gray backgrounds with deep blue (#1B4D89) and teal (#0EA5A0) accents. Glassmorphism effect on the search bar. Cards have subtle shadows and rounded corners (12px). The overall feel should be trustworthy and medical, not playful.

Aspect ratio: 16:9, desktop viewport (1440px wide).
```

---

## Prompt 2: Search Results Page

```
Design a hospital search results page for "Med Route" healthcare platform.

Layout:
- Top: The same search bar from the landing page, now showing the query "kidney treatment near Chandigarh under 2 lakhs". Below the search bar, show AI-extracted filter chips in a row: a blue chip "🏥 Kidney / Renal", a green chip "📍 Chandigarh (50km radius)", and an orange chip "💰 Under ₹2,00,000". Each chip has an × close button.

- Left sidebar (250px wide): Filter panel with:
  - "Distance" section: range slider from 0 to 100 km, currently set to 50 km
  - "Budget" section: range slider from ₹0 to ₹10 Lakhs, currently set to ₹2L
  - "Hospital Type" section: checkboxes for Government (checked), Private (checked), Trust (unchecked)
  - "Accreditation" section: checkboxes for NABH, NABL, JCI
  - "Ranking Weights" section: four mini sliders labeled Distance (30%), Cost (25%), Rating (25%), Accreditation (20%)

- Main content area:
  - Header: "42 hospitals found" on left, Map/List toggle buttons on right
  - Hospital result cards stacked vertically:
    
    Card 1 (top result):
    - Left: Hospital name "PGIMER, Chandigarh" with "Government" badge in blue and "NABH" badge in green
    - Middle: Star rating "⭐ 4.8 (342 reviews)", Distance "3.2 km", Cost "₹80,000 — ₹1,50,000"
    - Right: Ranking score badge "95" in green circle, small breakdown text showing the weight contributions
    - Bottom right: "Compare ☐" checkbox and "View Details →" link in teal
    - A thin "✅ Verified" badge and a "SIMULATED" data source tag in light gray
    
    Card 2:
    - "Fortis Hospital, Mohali" with "Private" badge in purple
    - "⭐ 4.3 (128 reviews)", "7.1 km", "₹1,20,000 — ₹3,00,000"
    - Ranking score "82" in yellow circle
    
    Card 3:
    - "Max Super Speciality, Mohali" with "Private" badge
    - "⭐ 4.5 (215 reviews)", "12 km", "₹2,00,000 — ₹5,00,000"
    - Ranking score "74" in orange circle

Style: Clean white background, cards with subtle shadows, colored ranking score circles (green >85, yellow 70-85, orange <70). Teal accent color for interactive elements. Medical blue for primary headers. The data source tag should be subtle but always visible.

Aspect ratio: 16:9, desktop viewport.
```

---

## Prompt 3: Hospital Detail Page

```
Design a hospital detail page for "Med Route" showing PGIMER Chandigarh.

Layout:
- Hero header: Dark blue gradient background. Hospital name "PGIMER, Chandigarh" in large white text. Below: row of badges — "🏛️ Government", "NABH Accredited" (green badge), "✅ Verified", "PMJAY Empanelled" (blue badge). Star rating "⭐ 4.8 / 5.0 (342 reviews)". A teal "Add to Compare ⚖️" button on the right.

- Quick Stats bar: Four stat cards in a horizontal row with icons:
  - "🛏️ 1,800 Total Beds"
  - "🏥 200 ICU Beds"  
  - "📍 3.2 km from you"
  - "💰 ₹80k — ₹4.5L"

- Procedures & Costs section: A clean sortable table:
  | Procedure | Cost Range | Avg Cost | Success Rate | Data Source |
  | Hemodialysis | ₹80,000 — ₹1,50,000 | ₹1,10,000 | 94% | SIMULATED 🔵 |
  | Kidney Transplant | ₹3,00,000 — ₹4,50,000 | ₹3,80,000 | 89% | SIMULATED 🔵 |
  | Lithotripsy | ₹45,000 — ₹85,000 | ₹62,000 | 96% | SIMULATED 🔵 |
  Column headers should be clickable for sorting. Each row has alternating light gray/white backgrounds.

- Facilities Grid: 4-column grid of facility items, each showing an icon and name with availability:
  "✅ MRI Scanner", "✅ CT Scan", "✅ Blood Bank", "✅ ICU", "✅ Ventilators", "✅ Dialysis Unit", "❌ PET Scan", "✅ Pharmacy", "✅ Ambulance", "✅ Emergency 24/7", "✅ Cafeteria", "❌ Helipad"
  Available items in green text, unavailable in light gray with strikethrough.

- Reviews section: Rating distribution bar chart on the left (horizontal bars for 5-star through 1-star). Review cards on the right showing user name, date, star rating, treatment received, review text, cost transparency rating, and "👍 Helpful (12)" button.

- Location section: A Leaflet/OpenStreetMap map showing the hospital marker with a popup card, and a "Get Directions" button.

- Data Provenance footer: Small text "Data Source: SIMULATED — This data is generated for demonstration purposes based on PMJAY HBP package structures. It does not represent actual hospital records."

Style: Clean, professional medical design. White cards on light gray background. Blue headers, teal interactive elements, green for available/positive, red only for SOS/emergency.

Aspect ratio: 9:16 (tall page, scrollable).
```

---

## Prompt 4: Comparison Page

```
Design a side-by-side hospital comparison page for "Med Route" comparing 3 hospitals.

Layout:
- Header: "⚖️ Compare Hospitals" title with a "Clear All" button on the right.

- Comparison table with 4 columns: first column is row labels, columns 2-4 are hospitals.

  Hospital headers (sticky on scroll):
  - Column 2: "PGIMER, Chandigarh" with Government badge, ⭐ 4.8, [Remove ×]
  - Column 3: "Fortis Hospital, Mohali" with Private badge, ⭐ 4.3, [Remove ×]
  - Column 4: "Max Super Speciality" with Private badge, ⭐ 4.5, [Remove ×]

  Rows:
  | Row Label | PGIMER | Fortis | Max |
  |---|---|---|---|
  | Type | 🏛️ Government | 🏢 Private | 🏢 Private |
  | Distance | 3.2 km 🏆 | 7.1 km | 12 km |
  | Cost Range | ₹80k-1.5L 🏆 | ₹1.2L-3L | ₹2L-5L |
  | Overall Rating | ⭐ 4.8 🏆 | ⭐ 4.3 | ⭐ 4.5 |
  | Accreditation | NABH | NABH | NABH + JCI 🏆 |
  | Total Beds | 1,800 🏆 | 350 | 500 |
  | ICU Beds | 200 🏆 | 50 | 80 |
  | Trauma Center | ✅ | ❌ | ✅ |
  | PMJAY | ✅ | ✅ | ❌ |
  | Success Rate | 94% 🏆 | 91% | 93% |
  | Total Reviews | 342 🏆 | 128 | 215 |
  
  The "best" value in each row is highlighted with a teal background and a small 🏆 trophy icon.

- Bottom: "Data Source" row showing "🔵 SIMULATED" for each hospital. An "Add Another Hospital" button in outline style.

Style: Clean data table design. Alternating row colors (white and very light blue). Sticky first column and header row. Teal highlight on best values. Subtle card shadow around the entire table.

Aspect ratio: 16:9, desktop viewport.
```

---

## Prompt 5: SOS Emergency Page

```
Design a full-screen SOS emergency page for "Med Route" healthcare app.

The page has a deep red gradient background (from #DC2626 to #991B1B). All text is white.

Center of the screen:
- Large pulsing red circle with white "🆘" icon (animated pulse rings expanding outward)
- Below the icon: "Emergency — Nearest Trauma Center Found"
- Hospital name in large bold text: "PGIMER, Chandigarh"
- Distance: "3.2 km away • Estimated 8 min by car"
- Phone number in very large text: "📞 0172-274-6018"
- A large white button with red text: "📞 CALL NOW" (rounded, high contrast)
- Below: "🗺️ Get Directions" link
- At bottom: "Hospital has been notified of your emergency" with a green checkmark
- Very bottom: small text "Can't connect? Call 108 for National Ambulance"

The entire design should feel URGENT but CLEAR. Maximum readability, minimum distraction. Every element serves the purpose of getting the user help as fast as possible.

Aspect ratio: 9:16 (mobile-first design).
```

---

## Prompt 6: Admin Dashboard

```
Design an admin dashboard for "Med Route" hospital management platform.

Layout with left sidebar and main content:

Sidebar (dark blue #0F172A background, 250px wide):
- Logo "Med Route Admin" at top
- Navigation items with icons: 📊 Dashboard (active, highlighted in teal), 🏥 Hospitals, 📤 Upload Data, ⭐ Reviews, 📁 Data Sources, ⚙️ Settings
- User avatar and "Admin User" at bottom with logout link

Main content area (light gray #F8FAFC background):
- Top row: 4 KPI cards in a horizontal row:
  - "52 Hospitals" (blue icon, +3 this week in green)
  - "214 Procedures" (teal icon)
  - "1,247 Reviews" (yellow icon, +42 this week)
  - "8 SOS Alerts" (red icon, 2 active)
  
- Middle row: Two charts side by side:
  - Left: "Reviews This Month" line chart (x-axis: dates, y-axis: count, teal line)
  - Right: "Hospitals by Type" donut chart (Government: 42%, Private: 38%, Trust: 20%)

- Bottom section: "Pending Verification" table:
  | Hospital | City | Submitted | Source | Actions |
  | Healing Touch | Chandigarh | 2 hours ago | USER_CONTRIBUTED | [✅ Verify] [❌ Reject] |
  | City Heart | Ludhiana | 1 day ago | MANUAL | [✅ Verify] [❌ Reject] |
  | Apollo Clinic | Mohali | 3 days ago | USER_CONTRIBUTED | [✅ Verify] [❌ Reject] |

Style: Professional admin design. Dark sidebar with light content area. Cards with subtle shadows. Charts with smooth gradients. Teal accent for primary actions, red for destructive actions. Clean Inter font throughout.

Aspect ratio: 16:9, desktop viewport.
```

---

## Prompt 7: Mobile Home Screen

```
Design a mobile home screen for "Med Route" healthcare app, shown on a modern smartphone.

Screen layout from top to bottom (no device frame, just the screen):
- Status bar with time, signal, battery
- Top bar: "Med Route" logo on left, notification bell and user avatar on right
- Search bar: Rounded rectangle with subtle shadow, placeholder "Search hospitals, treatments..." with search icon and microphone icon
- "Quick Actions" row: Three circular action buttons — "🔍 Search", "⚖️ Compare", "🆘 SOS" (SOS has a red pulsing ring)
- "Categories" section: Horizontally scrollable category chips in rounded pills: "❤️ Cardiac", "🦴 Ortho", "🧠 Neuro", "👁️ Eye", "🫘 Renal"
- "Nearby Hospitals" section: 
  - Hospital card 1: "PGIMER" with government badge, "3.2 km", "⭐ 4.8", small map thumbnail
  - Hospital card 2: "Fortis Mohali" with private badge, "7.1 km", "⭐ 4.3"
- Floating SOS button: Large red circle with white "SOS" text, positioned at bottom-right, with animated pulse rings

Bottom navigation tab bar: 🏠 Home (active, teal), 🔍 Search, ⚖️ Compare, 👤 Profile

Style: Clean iOS-inspired design. White background, rounded cards with subtle shadows. Medical blue for headers, teal for active states, red only for SOS. Inter font. Cards have 16px corner radius.

Aspect ratio: 9:16 (mobile portrait, 390px wide).
```

---

## Prompt 8: Mobile SOS Widget (Home Screen)

```
Design an Android home screen showing the Med Route SOS widget alongside other app icons.

The home screen has a blurred nature wallpaper background. At the top, show the typical Android status bar and Google search widget.

In the middle of the home screen, show a 2×1 Android widget for Med Route:
- Widget background: Deep red (#DC2626) with rounded corners and subtle inner glow
- Content: Large white "🆘 SOS" text on the left, "Emergency" smaller text below
- Right side: A white arrow icon suggesting "tap to activate"
- Very subtle pulse animation ring around the widget

Around the widget, show regular app icons (WhatsApp, Maps, Phone, Camera, etc.) to contextualize it as a normal home screen.

Below the widget, show a notification-style preview of what happens when tapped:
"Finding nearest trauma center... PGIMER, Chandigarh (3.2 km) — Calling..."

Style: Realistic Android home screen. The SOS widget should stand out dramatically against other icons due to its red color and size. It should feel like a genuine emergency tool integrated into daily life.

Aspect ratio: 9:16 (mobile portrait).
```

---

## Prompt 9: Mobile Hospital Detail

```
Design a mobile hospital detail screen for "Med Route" showing PGIMER Chandigarh.

Screen layout (scrollable):
- Back arrow and "Hospital Detail" header
- Hero image area: Hospital exterior photo/illustration with a gradient overlay at bottom
- Overlapping card at bottom of hero:
  - "PGIMER, Chandigarh" in bold
  - Row of small badges: "🏛️ Government", "NABH", "✅ Verified"
  - Star rating "⭐ 4.8 (342 reviews)"
  - Two action buttons: "📞 Call" (teal) and "⚖️ Compare" (outline)

- Tab navigation: "Overview | Procedures | Facilities | Reviews"

- Overview tab (active):
  - Quick stats in 2×2 grid: Beds (1,800), ICU (200), Distance (3.2km), Cost Range (₹80k-4.5L)
  - Departments list: "Nephrology", "Cardiology", "Orthopedics" with doctor names
  - Mini map showing location

- The content should feel like a native iOS/Android medical app — clean, scannable, with clear hierarchy.

Style: White background, rounded cards, subtle shadows. Medical blue headers, teal interactive elements. 16px padding, 12px corner radius on cards.

Aspect ratio: 9:16 (mobile portrait).
```

---

## Prompt 10: Design System Reference Sheet

```
Create a design system reference sheet for "Med Route" healthcare application.

Show all design tokens in an organized grid layout:

COLOR PALETTE section:
- Primary colors: Deep Blue (#1B4D89), shades from 50 to 900
- Accent colors: Teal (#0EA5A0), shades from 400 to 600
- Emergency: Red (#DC2626)
- Success: Green (#16A34A)
- Warning: Amber (#F59E0B)
- Surface colors: White to dark gray scale
- Show each color as a rectangle swatch with hex code and name

TYPOGRAPHY section:
- Heading font: "Outfit" — show H1 through H6 samples
- Body font: "Inter" — show body, caption, label sizes
- Mono font: "JetBrains Mono" — show code sample

COMPONENTS section (show each component in different states):
- Buttons: Primary, Secondary, Danger, Ghost, Outline — normal, hover, active, disabled, loading
- Input fields: Default, focused, error, disabled, search variant
- Cards: Hospital card, stat card, category card
- Badges: Government (blue), Private (purple), Trust (green), NABH (green), Verified (checkmark), SIMULATED (gray)
- Star ratings: 1-5 stars, interactive and display variants
- Toasts: Success, error, info, warning

SPACING section: Show the spacing scale from 4px to 96px

SHADOW section: Show sm, md, lg, xl, glass shadows applied to cards

Style: Clean, organized design reference. Light gray background with white sections. Every element clearly labeled. This should look like a professional Figma design system page.

Aspect ratio: 3:4 (tall reference sheet).
```

---

## How to Use These Prompts

1. **With Antigravity's `generate_image` tool**: Copy any prompt above and use it directly.
2. **With Midjourney**: Prefix with `/imagine` and add `--ar 16:9` or `--ar 9:16` as needed.
3. **With DALL-E / ChatGPT**: Paste the prompt directly.
4. **With Figma AI**: Use as design brief with "Generate design" feature.

> [!TIP]
> Generate the **Design System Reference** (Prompt 10) FIRST. Then reference its colors, fonts, and component styles when generating all other screens. This ensures visual consistency across all mockups.

> [!TIP]
> After generating mockups, share them with all 4 team members so everyone builds toward the SAME visual design. Pin the design system reference in your team channel.
