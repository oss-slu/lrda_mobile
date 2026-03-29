# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LRDA Mobile ("Where's Religion?") is a React Native/Expo mobile app for ethnographers to collect and share field data. It uses Firebase for authentication and a custom REST API (RERUM) for data persistence.

## Common Commands

```bash
yarn install          # Install dependencies
yarn start            # Start Expo dev server (press 'a' for Android, 'i' for iOS)
yarn ios              # Run on iOS simulator
yarn android          # Run on Android simulator
yarn test -u          # Run tests (with snapshot updates)
yarn build:android    # Production Android build via EAS
```

**Note:** Web build is not supported due to react-native-maps dependency.

## Architecture

### State Management
- **Redux Toolkit** with three slices:
  - `navigationSlice` - App navigation state (onboarding/login/home)
  - `themeSlice` - Theme/color customization
  - `addNoteStateSlice` - Note creation workflow
- **Redux Persist** with AsyncStorage for offline persistence
- **AddNoteContext** - React Context for note publishing coordination

### Navigation Structure (AppNavigator.tsx)
The app has three main navigation states controlled by Redux:
1. `onboarding` - First-time user flow
2. `login` - Authentication screens
3. `home` - Main app with bottom tabs: Home, Library, Add Note, Map, More

### Key Singletons and Classes
- **User class** (`lib/models/user_class.ts`) - Authentication singleton managing user state and login callbacks
- **Media hierarchy** (`lib/models/media_class.ts`) - Photo, Video, Audio classes extending base Media

### Backend Integration
- **Firebase** - Authentication (email/password), Firestore, Storage
- **RERUM API** - Base URL: `https://lived-religion-dev.rerum.io/deer-lr/` for note CRUD
- **S3 Proxy** - `http://s3-proxy.rerum.io/S3/` for media uploads

### Directory Layout
```
lib/
├── screens/           # Screen components (21 files)
│   ├── loginScreens/  # Auth screens
│   └── mapPage/       # Map-related screens
├── components/        # Reusable UI components
├── models/            # User and Media classes
├── utils/             # API calls, validation, storage helpers
├── navigation/        # AppNavigator.tsx
├── context/           # AddNoteContext
└── config/            # Firebase config
redux/
├── slice/             # Redux slices
└── store/             # Store configuration
```

## Testing

Tests are in `__tests__/` using Jest with jest-expo preset and React Testing Library.

**Key test patterns:**
- Redux store wrapped with `redux-mock-store`
- Firebase Auth globally mocked in `setupTests.js`
- Expo modules mocked in `__mocks__/`
- ThemeProvider and User singleton commonly mocked per-test

Run a single test file:
```bash
yarn test __tests__/HomeScreen.test.tsx
```

## Code Style

- TypeScript throughout
- Prettier configured with 140 char width, double quotes, ES5 trailing commas
- React Native Paper for Material Design components
- Ionicons via react-native-vector-icons

## Known Issues

- Web compilation fails (react-native-maps)
- Location data section may display "NaN" errors
- iOS note scroller sometimes doesn't work on Add/Edit screens
- Android note positioning is off-center on map
