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

- **Zustand** stores in `lib/stores/`: `authStore` (session/user), `themeStore` (persisted to AsyncStorage), `addNoteStore` (note creation state), `onboardingStore`
- **TanStack Query** (`lib/query/`, `lib/hooks/`) - server state: note lists and create/update mutations
- **AddNoteContext** (`lib/context/`) - React Context for note publishing coordination

### Navigation Structure (Expo Router)

File-based routing via `app/` directory:

1. `onboarding` - First-time user flow
2. `(auth)/` - Authentication screens (login, register, forgot password)
3. `(tabs)/` - Main app with bottom tabs: Home, Library, Add Note, Map, More
4. Modal screens: add-note, edit-note, account, video-player

### Key Modules

- **Auth** - Better Auth client in `lib/auth/client.ts`, session state in `lib/stores/authStore.ts`
- **Media hierarchy** (`lib/models/media_class.ts`) - Photo, Video, Audio classes extending base Media
- **API layer** (`lib/utils/api_calls.ts`) - plain exported functions (`fetchNotes`, `createNote`, `updateNote`, `deleteNote`) for all Hono API interactions

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
├── models/            # Media classes
├── utils/             # API calls, validation, storage helpers
├── auth/              # Better Auth client
├── config/            # Env/auth configuration
├── context/           # AddNoteContext
├── hooks/             # TanStack Query hooks (note list, mutations)
├── query/             # Query client and query keys
├── stores/            # Zustand stores (auth, theme, addNote, onboarding)
└── onboarding/        # Tutorial components
```

## Testing

Tests are in `__tests__/` using Jest with jest-expo preset and React Testing Library.

Run a single test file:

```bash
pnpm test __tests__/api_calls.test.ts
```

Maestro E2E flows live in `.maestro/` (see `.maestro/config.yaml`). Run them with `pnpm e2e` (full suite) or `pnpm e2e <flow-name>` (single flow) — the script checks backend health, boots the simulator, fixes the hardware-keyboard/GPS settings, and starts Metro if needed before invoking Maestro. The backend must be running from the sibling `lrda_website` repo.

`react-native-css-interop` is patched (`patches/`) to stop its CSS fast-refresh event from crashing Metro on newer Metro versions (nativewind/nativewind#1786); drop the patch if a fixed upstream release ships.

## Code Style

- TypeScript throughout
- Prettier configured with 140 char width, double quotes, ES5 trailing commas
- Ionicons via @expo/vector-icons

## Known Issues

- Web compilation fails (react-native-maps)
- iOS note editor scroll overshoots into blank space past the end of long notes (editor WebView is full-screen height inside the outer ScrollView; see NoteEditorBody in lib/components/NoteEditor.tsx)
- Android note positioning is off-center on map
