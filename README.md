# 🔵 Blue X Mobile App

[![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-000000?style=flat-square&logo=expo)](https://expo.dev)
[![React Native 0.81](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

**Blue X** is a modern, cross-platform mobile application built with **React Native**, **Expo Router**, and **TypeScript**, powered by **Supabase** for backend authentication & data, and **Cloudinary** for image media management.

---

## ✨ Features

- 🔐 **Authentication & Onboarding**: Complete auth flow including Welcome splash, Email Sign In, Sign Up, and Password Reset powered by Supabase Auth.
- 🔍 **Service Discovery & Search**: Interactive home dashboard with category browsing, provider search, and detail views.
- 📅 **Booking & Calendar Management**: Complete booking flow, appointment scheduling, calendar view, and status updates.
- 💬 **Real-time Messaging**: Direct chat between clients and service providers with unread badges and instant delivery.
- 🔔 **Notifications**: In-app notifications center for booking updates, system alerts, and activity logs.
- 👤 **Profile & Provider Mode**: User profile management, avatar uploads via Cloudinary, and service provider profiles.
- 🎨 **Modern UI/UX**: Dark/Light mode support, fluid micro-animations with `react-native-reanimated`, glassmorphism effects with `expo-blur`, and custom icon sets.

---

## 🛠️ Tech Stack

- **Framework**: [Expo (SDK 54)](https://expo.dev) with React Native 0.81 (New Architecture enabled)
- **Routing**: [Expo Router v6](https://docs.expo.dev/router/introduction/) (File-based navigation with Typed Routes)
- **State & Storage**: React Context API, Async Storage
- **Backend & Database**: [Supabase](https://supabase.com) (`@supabase/supabase-js`)
- **Media Uploads**: [Cloudinary](https://cloudinary.com)
- **Icons & Styling**: Lucide React Native, Expo Vector Icons, Expo Linear Gradient
- **Language**: TypeScript

---

## 📁 Project Structure

```text
blue-x-mobile/
├── app/                  # Expo Router file-based pages & screens
│   ├── (auth)/           # Authentication screens (welcome, login, register, forgot)
│   ├── (tabs)/           # Main bottom-tab navigation screens
│   │   ├── index.tsx     # Home / Explore screen
│   │   ├── search.tsx    # Search & Filter screen
│   │   ├── bookings.tsx  # My Bookings screen
│   │   ├── calendar.tsx  # Calendar view
│   │   ├── messages.tsx  # Conversations list
│   │   └── profile.tsx   # User profile & settings
│   ├── booking/          # Booking details & checkout screens
│   ├── provider/         # Provider detail & listing screens
│   ├── chat.tsx          # Direct 1-on-1 messaging screen
│   ├── notifications.tsx # System notifications screen
│   └── _layout.tsx       # Root layout provider & auth protection
├── assets/               # Images, icons, splash screens, and fonts
├── components/           # Reusable UI components (buttons, inputs, cards, modally layout)
├── constants/            # Design tokens, colors, theme variables
├── context/              # Global application contexts (Auth, Theme, etc.)
├── hooks/                # Custom React hooks
├── services/             # API client services (Supabase, Cloudinary)
├── types/                # TypeScript interfaces and type definitions
├── app.json              # Expo configuration
├── eas.json              # EAS Build & Submit configuration
└── package.json          # Project dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn / pnpm / bun
- [Expo Go app](https://expo.dev/go) on your iOS/Android device OR an emulator/simulator
- Expo CLI (`npm install -g eas-cli` optional for builds)

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd blue-x-mobile-main
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Fill in your configuration keys in `.env`:

```env
# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary Configuration (Optional - for image/avatar uploads)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 3. Run Development Server

Start Metro bundler:

```bash
npm run dev
```

- Press `a` to open in Android Emulator
- Press `i` to open in iOS Simulator
- Press `w` to open in Web Browser
- Scan the QR code with **Expo Go** on physical device

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Expo development server |
| `npm run build:web` | Exports static web bundle |
| `npm run typecheck` | Runs TypeScript compiler verification |
| `npm run lint` | Runs Expo linter checks |

---

## 📱 Building & Deployment

### EAS Build (Mobile Apps)

Build Android APK / AAB or iOS IPA using Expo Application Services:

```bash
# Preview Build (Android APK)
npx eas-cli build -p android --profile preview

# Production Build (Android AAB & iOS IPA)
npx eas-cli build -p all --profile production
```

---

## 📄 License

This project is proprietary software. All rights reserved.

