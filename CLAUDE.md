# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LRDA Mobile ("Where's Religion?") is a React Native/Expo mobile app for ethnographers to collect and share field data. It uses Better Auth for authentication and the Hono REST API (shared with the `lrda_website` repo) backed by PostgreSQL for data persistence.

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm start            # Start Expo dev server (press 'a' for Android, 'i' for iOS)
pnpm ios              # Run on iOS simulator
pnpm android          # Run on Android simulator
pnpm test -u          # Run tests (with snapshot updates)
pnpm build:android    # Production Android build via EAS
```

**Note:** Web build is not supported due to react-native-maps dependency.

## Architecture

### State Management
- **Redux Toolkit** with slices: `themeSlice`, `addNoteStateSlice`
- **Redux Persist** with AsyncStorage for offline persistence
- **AddNoteContext** - React Context for note publishing coordination
- **Zustand** - `addNoteStore` for note creation state

### Navigation Structure (Expo Router)
File-based routing via `app/` directory:
1. `onboarding` - First-time user flow
2. `(auth)/` - Authentication screens (login, register, forgot password)
3. `(tabs)/` - Main app with bottom tabs: Home, Library, Add Note, Map, More
4. Modal screens: add-note, edit-note, account, video-player

### Key Singletons and Classes
- **User class** (`lib/models/user_class.ts`) - Auth singleton with Better Auth session/token management
- **Media hierarchy** (`lib/models/media_class.ts`) - Photo, Video, Audio classes extending base Media
- **ApiService** (`lib/utils/api_calls.ts`) - Static class for all Hono API interactions

### Backend Integration
- **Hono REST API** - Configured via `API_BASE_URL` env var, authenticated via Bearer tokens
  - `GET/POST/PATCH/DELETE /api/notes` - Note CRUD
  - `GET /api/users/:id` - User profiles
- **Better Auth** - Configured via `AUTH_API_URL` env var, session-based with Bearer token support
- **S3 Proxy** - `http://s3-proxy.rerum.io/S3/` for media uploads (to be migrated)

### Data Model
- **Note**: `id`, `title`, `text`, `creatorId`, `latitude` (number), `longitude` (number), `isPublished`, `tags` (string[]), `time`, `media[]`, `audio[]`
- **UserData**: `id`, `name`, `email`, `role`, `isInstructor`
- Tags are stored as `{label, origin}` objects in the API but handled as `string[]` internally in the mobile app (converted at the API boundary)

### Directory Layout
```
app/                   # Expo Router routes (file-based routing)
lib/
├── screens/           # Screen components
│   ├── loginScreens/  # Auth screens
│   └── mapPage/       # Map-related screens
├── components/        # Reusable UI components
├── models/            # User and Media classes
├── utils/             # API calls, validation, storage helpers
├── auth/              # Better Auth client
├── context/           # AddNoteContext
├── stores/            # Zustand stores
└── onboarding/        # Tutorial components
redux/
├── slice/             # Redux slices
└── store/             # Store configuration
```

## Testing

Tests are in `__tests__/` using Jest with jest-expo preset and React Testing Library.

Run a single test file:
```bash
pnpm test __tests__/HomeScreen.test.tsx
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
