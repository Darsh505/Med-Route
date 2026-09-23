# Med Route — Mobile Application (React Native / Expo)

Cross-platform mobile application for citizen healthcare discovery, transparent surgical pricing, and emergency SOS routing across India.

---

## Overview

The Med Route mobile client is built on **React Native (Expo SDK 57)** and **TypeScript**, specifically designed for low-bandwidth, high-stress citizen medical emergencies. It features instant offline capability via an embedded 60+ hospital benchmark store, GPS auto-triage, and an AI-driven slot mapping search interface.

---

## Key Features

- **AI Query Slot Mapping**: As users type queries like *"Find kidney transplant hospitals near Chandigarh under 2 lakh"*, the app displays an **🤖 AI Query Slot Mapping** banner identifying Procedure, Budget Ceiling, and City.
- **Tricity Benchmark Presets**: One-tap query chips for instant demonstration:
  - `Kidney < ₹2L Chandigarh`
  - `Heart < ₹3L Mohali`
  - `PMJAY Cashless Tricity`
- **4 Verifiable Metrics Comparison**: Dedicated multi-facility comparison matrix covering:
  1. *Annual Procedure Volume* (High-volume safety indicators)
  2. *Clinical Success Ratio* (Verified outcome percentages)
  3. *Government Package Tariffs* (PMJAY Cashless vs Out-of-Pocket)
  4. *Accreditation Tiers* (NABH Digital / JCI / NABL)
- **Sub-Second Emergency SOS**: One-touch emergency trauma dispatch locating the closest Level 1/2 trauma unit with ETA, routing, and direct telephone links to 108 and hospital desks.
- **Offline Zero-Network Resilience**: Automatically fails over to local JSON benchmark dataset if mobile network or backend API drops.

---

## Architecture & Directory Layout

```text
mobile/
├── assets/                 # App icons, splash screens, and adaptive vector graphics
├── src/
│   ├── components/         # HospitalCard, FloatingSOSButton, MedRouteLogo
│   ├── data/               # Embedded fallback allHospitals.json (60+ facilities)
│   ├── navigation/         # BottomTabNavigator & RootStackNavigator
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Intake hero, quick specialties, emergency radar
│   │   ├── SearchScreen.tsx         # AI slot mapping, commute time, filter modal
│   │   ├── CompareScreen.tsx        # 4 Verifiable Metrics side-by-side matrix
│   │   ├── HospitalDetailScreen.tsx # Bed counts, tariffs, accreditation, doctor ratio
│   │   ├── SOSScreen.tsx            # Emergency beacon dispatch and trauma corridor
│   │   └── ChatScreen.tsx           # Clinical triage assistant
│   ├── services/
│   │   ├── api.ts          # Resilient REST client with regex NLP fallback
│   │   ├── location.ts     # Device geolocation and reverse geocoding
│   │   └── storage.ts      # Offline AsyncStorage caching
│   └── theme/              # Color palette (Deep Blue, Emerald, Coral) & typography
├── app.json                # Expo configuration
├── package.json            # Expo 57 & React Native 0.86 dependencies
└── tsconfig.json           # Strict TypeScript configuration
```

---

## Setup & Local Development

### 1. Prerequisites
- Node.js 20 or higher
- Expo Go application on iOS / Android device (or Android Studio emulator)

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Run Development Server
```bash
npx expo start
```

### 4. Running the App
- **Physical Device**: Open the camera (iOS) or Expo Go app (Android) and scan the QR code displayed in the terminal.
- **Web Preview**: Press `w` in the terminal to launch the interactive web browser preview.
- **Android Emulator**: Press `a` in the terminal with an active Android emulator.
- **iOS Simulator**: Press `i` in the terminal (macOS only).

---

## Verification & Type Safety

Verify TypeScript compilation without starting Metro bundler:
```bash
npx tsc --noEmit
```
Passed with 0 errors.
