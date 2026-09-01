# @devlearn/mobile — React Native & Expo Mobile Companion

> **The frictionless mobile companion app for fast learning capture, live study timers, and daily progress tracking.**

`@devlearn/mobile` is a cross-platform mobile application built with **React Native**, **Expo (SDK 54)**, and **TypeScript**. It is designed to complement the DevLearn web portal with a mobile-first focus on rapid session capture (3–5 seconds), a dedicated stopwatch focus timer, and instant daily streak visibility.

---

## 📱 Mobile Philosophy & Shared Architecture

1. **Unified Backend**:
   - Web and mobile clients share the exact same Express.js REST API (`@devlearn/api`).
   - No separate mobile-only endpoints or database forks.
2. **Instant Capture**:
   - Optimized for fast, low-friction interactions. Users can record a study session in under 5 seconds with just a subject and duration.
3. **Consistent Monochrome Aesthetics**:
   - Shares the same dark monochrome visual tokens as the web application.
4. **Shared Domain Contracts**:
   - Directly imports shared TypeScript DTOs from `@devlearn/types`.

```text
┌────────────────────────────────────────────────────────┐
│               DevLearn Express.js API                  │
└───────────────────────────┬────────────────────────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
   Next.js 15 Web App           React Native Mobile App
   (Deep Analytics & Admin)     (Fast Capture & Live Timer)
```

---

## 🛠️ Technology Stack

* **Framework**: [React Native 0.81](https://reactnative.dev/) + [Expo SDK 54](https://expo.dev/)
* **Language**: TypeScript 5
* **Navigation**: [React Navigation 7](https://reactnavigation.org/) (Native Stack + Bottom Tabs)
* **Icons**: [Lucide React Native](https://lucide.dev/)
* **HTTP Client**: [Axios](https://axios-http.com/) with automated bearer tokens and retry handling
* **Local Storage**: [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)
* **Safe Area & Screens**: `react-native-safe-area-context` + `react-native-screens`

---

## 📁 Project Structure

```text
apps/mobile/
├── App.tsx                       # Root app component & theme provider
├── index.js                      # Expo entrypoint
├── app.json                      # Expo project configuration
├── metro.config.js               # Metro bundler config supporting monorepo packages
└── src/
    ├── api/                      # Axios REST client configured for web & native LAN IPs
    │   └── client.ts
    ├── components/               # Reusable mobile UI primitives:
    │   ├── ConfirmModal.tsx      # Confirmation dialogs
    │   ├── LearningSessionCard.tsx # Session list card
    │   ├── QuickLogModal.tsx     # Fast 3-second study logging bottom sheet
    │   └── ui/                   # Buttons, Inputs, Badges, Heatmap grid
    ├── context/                  # AuthContext managing user sessions and offline cache
    ├── navigation/               # RootNavigator, AuthStack, and MainTabNavigator
    ├── screens/                  # Mobile screens:
    │   ├── DashboardScreen.tsx   # Daily summary, streak badge, quick log action
    │   ├── TimerScreen.tsx       # Live stopwatch focus timer with auto-save
    │   ├── HistoryScreen.tsx     # Filterable chronological session list
    │   ├── ProgressScreen.tsx    # Subject time distribution and contribution graph
    │   ├── SettingsScreen.tsx    # Profile management, theme settings, logout
    │   ├── LoginScreen.tsx       # User sign-in
    │   └── RegisterScreen.tsx    # New user onboarding
    └── theme/                    # Mobile color tokens & typography presets
```

---

## 📱 Mobile Screens & Capabilities

### 1. Dashboard (`DashboardScreen`)
* Today's total focus time and weekly volume counter.
* Active streak badge with celebration indicator.
* Quick-action "+ Log Learning" button triggering the modal sheet.

### 2. Live Focus Timer (`TimerScreen`)
* Large high-contrast `HH:MM:SS` stopwatch display.
* One-touch Start, Pause, Resume, and Finish controls.
* Auto-fills subject and duration into the log flow upon completion.

### 3. Learning History (`HistoryScreen`)
* Chronological feed of past study sessions.
* Filter by specific subjects or date ranges.
* Edit and delete past session logs.

### 4. Progress & Analytics (`ProgressScreen`)
* Today's breakdown by subject (e.g., *DSA: 1h, Redis: 30m, SQL: 45m*).
* 7-day consistency streak and mobile contribution calendar.

### 5. Authentication & Settings (`LoginScreen`, `SettingsScreen`)
* Seamless login/register with token caching in `AsyncStorage`.
* Profile view and instant account sign-out.

---

## ⚙️ Getting Started Locally

### 1. Prerequisites
Ensure the backend API (`@devlearn/api`) is running locally.

### 2. Configure API Endpoint
In `apps/mobile/src/api/client.ts`, configure the backend host:
* **Android Emulator**: `http://10.0.2.2:5000`
* **iOS Simulator**: `http://localhost:5000`
* **Physical Device (Expo Go)**: `http://<YOUR_LOCAL_LAN_IP>:5000` (e.g., `http://192.168.1.50:5000`)

### 3. Run Development Server
From the repository root:
```bash
# Start Expo development bundler
npm run dev:mobile

# Or run directly inside the workspace:
npm run start --workspace=apps/mobile
```

### 4. Open the App
* **iOS Simulator**: Press `i` in the terminal.
* **Android Emulator**: Press `a` in the terminal.
* **Web Browser**: Press `w` in the terminal.
* **Physical Phone**: Open camera (iOS) or Expo Go app (Android) and scan the terminal QR code.

---

## 🚀 Building for Production

DevLearn Mobile is fully compatible with **Expo Application Services (EAS Build)**:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build profile
eas build:configure

# Build Android APK / AAB
eas build --platform android

# Build iOS IPA
eas build --platform ios
```
