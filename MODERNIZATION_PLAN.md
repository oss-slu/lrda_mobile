# Codebase Modernization Plan

## Overview

Post-migration improvements to modernize the codebase after Firebase Auth and RERUM API migrations are complete. These changes are independent of each other and can be tackled in any order.

---

## 1. Replace Redux with Zustand

### Why

Redux is overkill here — 3 tiny slices, no async thunks, no complex middleware. Zustand eliminates the boilerplate (Provider, PersistGate, slices, store config) and has built-in persist middleware that replaces redux-persist.

### Current Redux State

```typescript
{
  navigation: { navState: 'loading' | 'onboarding' | 'login' | 'home' }
  themeSlice: { theme: string }             // hex color, default '#7FADE1'
  addNoteState: { isAddNoteOpned: boolean }  // typo in original
}
```

### Zustand Equivalent

Two stores (theme + UI state). Navigation state moves to the auth hook (see item 3).

```typescript
// stores/themeStore.ts
export const useThemeStore = create(
  persist(
    (set) => ({
      themeColor: '#7FADE1',
      setThemeColor: (color: string) => set({ themeColor: color }),
      clearTheme: () => set({ themeColor: '#7FADE1' }),
    }),
    { name: 'theme-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// stores/uiStore.ts
export const useUIStore = create((set) => ({
  isAddNoteOpen: false,
  toggleAddNote: () => set((s) => ({ isAddNoteOpen: !s.isAddNoteOpen })),
}));
```

### Files to Update (9 consumers)

| File | Redux Usage | Zustand Change |
|------|------------|----------------|
| `App.tsx` | `<Provider>`, `<PersistGate>` | Remove both wrappers entirely |
| `AppNavigator.tsx` | Reads `navState`, `theme`; dispatches `setNavState` | Use `useAuthStore` for nav, `useThemeStore` for theme |
| `HomeScreen.tsx` | Reads/dispatches `addNoteState` | `useUIStore()` |
| `LoginScreen.tsx` | Reads `navState`; dispatches `setNavState` | `useAuthStore()` |
| `AddNoteScreen.tsx` | Reads `addNoteState` | `useUIStore()` |
| `EditNoteScreen.tsx` | Imports dispatch (barely used) | `useUIStore()` |
| `MorePage.tsx` | Dispatches `clearThemeReducer` | `useThemeStore().clearTheme()` |
| `AppThemeSelectorScreen.tsx` | Dispatches `themeReducer` | `useThemeStore().setThemeColor()` |
| `AddNoteBtnComponent.tsx` | Reads `theme`, `addNoteState` | `useThemeStore()`, `useUIStore()` |
| `ThemeProvider.js` | Reads `theme` | `useThemeStore()` |

### Cleanup

- Delete `redux/` directory entirely (4 files)
- Remove `@reduxjs/toolkit`, `react-redux`, `redux-persist` from `package.json`
- Fix the `isAddNoteOpned` typo → `isAddNoteOpen`
- Fix the `toogleAddNoteState` typo → `toggleAddNote`

---

## 2. Add TanStack Query for Data Fetching

### Why

The app currently manages loading states, pagination, caching, and error handling manually in every screen. TanStack Query gives you all of that for free, plus background refetching and stale-while-revalidate.

### What Moves to TanStack Query

| Current Pattern | TanStack Query Replacement |
|----------------|---------------------------|
| `fetchMessagesBatch()` + manual `useState` for notes, loading, hasMore | `useInfiniteQuery` with `getNextPageParam` |
| `fetchMapsMessagesBatch()` + manual state in ExploreScreen | `useQuery` (or `useInfiniteQuery` with bounding box params) |
| `searchMessages()` + manual state | `useQuery` with debounced search key |
| `fetchCreatorName()` called per-note | `useQuery` with caching — same creator only fetched once |
| Manual `try/catch` + `console.error` in every screen | `onError` callbacks, `error` state from query |

### Example: HomeScreen Notes

```typescript
// Before: manual state + useEffect + pagination logic
const [notes, setNotes] = useState([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(0);

useEffect(() => {
  fetchMessagesBatch(false, false, userId, 20, page)
    .then(data => { ... })
    .catch(err => { ... });
}, [page]);

// After: useInfiniteQuery
const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
  queryKey: ['notes', userId],
  queryFn: ({ pageParam = 0 }) => ApiService.fetchMessagesBatch(false, false, userId, 20, pageParam),
  getNextPageParam: (lastPage, allPages) => lastPage.length === 20 ? allPages.flat().length : undefined,
});
```

### Setup

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AddNoteProvider>
          <AppNavigator />
        </AddNoteProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

### Screens to Update

| Screen | Current Data Fetching | TanStack Query Hook |
|--------|----------------------|---------------------|
| `HomeScreen.tsx` | `fetchMessagesBatch` + manual pagination | `useInfiniteQuery` |
| `Library.tsx` | `fetchMapsMessagesBatch` + manual pagination | `useInfiniteQuery` |
| `ExploreScreen.js` | `fetchMapsMessagesBatch` + all-at-once load | `useQuery` (with bbox params) |
| `ProfilePage.tsx` | `fetchUserData` | `useQuery` |
| `NoteDetailModal.tsx` | `fetchCreatorName` | `useQuery` (cached per creator) |

### Mutation Hooks

Note create/update/delete become mutations with automatic cache invalidation:

```typescript
const createNote = useMutation({
  mutationFn: ApiService.writeNewNote,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
});
```

---

## 3. Replace User Singleton with `useAuth()` Hook

### Why

The `User` singleton is the biggest anti-pattern in the codebase:
- Not reactive to React renders
- Mixes auth, persistence, and callback concerns
- Untestable (shared instance across tests)
- Uses manual callback pattern instead of React state

### Replace With

An auth store (Zustand) + a `useAuth()` hook:

```typescript
// stores/authStore.ts
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null as UserData | null,
      token: null as string | null,
      navState: 'loading' as 'loading' | 'onboarding' | 'login' | 'home',
      setUser: (user: UserData | null) => set({ user }),
      setToken: (token: string | null) => set({ token }),
      setNavState: (navState: string) => set({ navState }),
      clearAuth: () => set({ user: null, token: null, navState: 'login' }),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { user, token, setUser, setToken, setNavState, clearAuth } = useAuthStore();

  const login = async (email: string, password: string) => { ... };
  const logout = async () => { ... };
  const checkSession = async () => { ... };

  return { user, token, login, logout, checkSession, isLoggedIn: !!user };
}
```

### What Gets Deleted

- `lib/models/user_class.ts` — the entire singleton class
- `lib/config/index.js` — was just re-exporting `auth`
- The callback pattern (`setLoginCallback`, `notifyLoginState`)

### Navigation State

`navState` moves into the auth store. `AppNavigator` reads it from Zustand instead of Redux:

```typescript
const navState = useAuthStore((s) => s.navState);
```

This also absorbs `navigationSlice` — one less Redux slice, now zero.

---

## 4. Tighten TypeScript Config

### Changes to `tsconfig.json`

```diff
- "target": "es5"
+ "target": "es2020"

- "jsx": "react"
+ "jsx": "react-jsx"

+ "strict": true
+ "noImplicitAny": true
```

### Files That Will Need `any` Fixes (~25 instances)

| File | `any` Count | Typical Fix |
|------|------------|-------------|
| `data_conversion.ts` | 6 | Type the RERUM/API response shape |
| `HomeScreen.tsx` | 5 | Type `renderItem` callback params |
| `api_calls.ts` | 4 | Type API response bodies |
| `ForgotPassword.tsx` | 2 | Type error catches as `unknown` |
| `Library.tsx` | 2 | Type list item params |
| `time.tsx` | 2 | Type component props |
| Others | 4 | Misc |

### Also

- Convert `ThemeProvider.js` → `ThemeProvider.tsx`
- Convert `ExploreScreen.js` → `ExploreScreen.tsx`

---

## 5. Remove Dead Dependencies

Remove from `package.json`:

```
expo-app-loading          # imported nowhere
enzyme                    # deprecated, incompatible with React 19
enzyme-adapter-react-16   # for React 16, we're on React 19
@types/enzyme             # unnecessary
@types/mocha              # unnecessary (using Jest)
```

---

## 6. Standardize Styling

### Current Issues

- Mix of `StyleSheet.create()`, inline `style={{...}}`, and factory functions like `NotePageStyles()`
- `NotePageStyles()` creates new style objects on every render
- `ThemeProvider.js` mutates `colors.darkColors.homeColor` directly outside of state

### Approach

- Standardize on `StyleSheet.create()` at the bottom of each file
- Replace inline styles with named styles
- Memoize or convert `NotePageStyles()` to a static `StyleSheet.create()` call
- Theme colors should flow through the Zustand theme store → ThemeProvider context, not through direct object mutation

---

## 7. Modernize Testing

### Unit/Component Tests: Keep Jest + React Native Testing Library

Jest is still the right choice for React Native unit and component tests. Vitest is winning on the web, but `vitest-react-native` is still a work in progress with known compatibility issues with Expo and RNTL. Expo officially ships `jest-expo` as a first-party preset — stick with it.

The modernization here is cleaning up test patterns, not swapping the runner.

### Remove

- `enzyme`, `enzyme-adapter-react-16`, `@types/enzyme` (dead, incompatible with React 19)
- `redux-mock-store` (no longer needed after Zustand migration)
- `@types/mocha` (using Jest, not Mocha)

### Update Unit/Component Tests

- Any test using `shallow()` or `mount()` from enzyme → use `render()` from `@testing-library/react-native`
- Replace `redux-mock-store` with real Zustand stores (trivial to create in tests)
- Mock the auth hook instead of the User singleton

### Add E2E Tests with Maestro

The app currently has zero E2E tests. [Maestro](https://maestro.dev) is the modern standard for React Native / Expo E2E testing:

- **YAML-based** — no code, anyone on the team can write tests
- **Zero build integration** — installs as a standalone CLI, points at your running app, no native dependencies to configure
- **First-party Expo support** — [EAS Workflows docs](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) for running Maestro in CI
- **Much simpler than Detox** — Detox requires complex native build config and has stability issues. Maestro just works.

#### Setup

```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run against a running app
maestro test e2e/
```

#### Critical Flows to Cover

```yaml
# e2e/login.yaml
appId: com.wheresreligion.app
---
- tapOn: "Email..."
- inputText: "test@example.com"
- tapOn: "Password..."
- inputText: "password123"
- tapOn: "Login"
- assertVisible: "Home"
```

```yaml
# e2e/create-note.yaml
appId: com.wheresreligion.app
---
- runFlow: login.yaml          # reusable login flow
- tapOn: "Add Note"
- tapOn: "Title"
- inputText: "Field Note from E2E"
- assertVisible: "Field Note from E2E"
```

#### Recommended E2E Test Suite

| Flow | What It Validates |
|------|-------------------|
| `login.yaml` | Email/password login → home screen |
| `register.yaml` | Registration → redirect to login |
| `create-note.yaml` | Create note with title and text |
| `edit-note.yaml` | Edit existing note, verify changes persist |
| `publish-note.yaml` | Publish a note, verify it appears in Library |
| `logout.yaml` | Logout → redirect to login screen |
| `forgot-password.yaml` | Password reset flow triggers success message |

Maestro tests can run in [EAS Workflows](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) for CI, or locally during development with `maestro test`.

---

## 8. Migrate to Expo Router (File-Based Routing)

### Why

The current `AppNavigator.tsx` is 285 lines of imperative navigation configuration — stack navigators nested inside tab navigators, conditional rendering based on Redux state, manual screen registration. Expo Router replaces all of this with file-based routing where the directory structure *is* the navigation.

Benefits:
- Navigation structure is self-documenting from the file tree
- Automatic deep linking and URL handling
- Typed routes generated from the file system
- Eliminates `AppNavigator.tsx` entirely
- Built-in layout system for tabs, stacks, and auth gates

### Current Structure → Expo Router Structure

```
# Current (imperative)
lib/navigation/AppNavigator.tsx   ← 285 lines of manual config
lib/screens/HomeScreen.tsx
lib/screens/Library.tsx
lib/screens/AddNoteScreen.tsx
lib/screens/MorePage.tsx
lib/screens/loginScreens/LoginScreen.tsx
lib/screens/loginScreens/RegisterScreen.tsx
lib/screens/loginScreens/ForgotPassword.tsx
lib/screens/mapPage/ExploreScreen.js
...

# After (file-based)
app/
├── _layout.tsx                    ← root layout: auth gate + QueryClientProvider
├── (auth)/
│   ├── _layout.tsx                ← stack layout for auth screens
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── (onboarding)/
│   ├── _layout.tsx
│   └── index.tsx
├── (tabs)/
│   ├── _layout.tsx                ← bottom tab navigator config
│   ├── index.tsx                  ← Home (tab 1)
│   ├── library.tsx                ← Library (tab 2)
│   ├── add-note.tsx               ← Add Note (tab 3)
│   ├── map/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              ← ExploreScreen
│   │   └── [noteId].tsx           ← NoteDetailModal
│   └── more/
│       ├── _layout.tsx            ← stack inside More tab
│       ├── index.tsx              ← MorePage
│       ├── about.tsx
│       ├── team.tsx
│       ├── resource.tsx
│       ├── settings.tsx
│       └── account.tsx            ← ProfilePage
├── edit-note/[id].tsx             ← EditNote (modal/stack)
└── video-player.tsx               ← VideoPlayer (modal)
```

### Auth Gate

The root `_layout.tsx` handles the auth gate using the Zustand auth store, replacing the conditional rendering in `AppNavigator.tsx`:

```typescript
// app/_layout.tsx
export default function RootLayout() {
  const navState = useAuthStore((s) => s.navState);

  if (navState === 'loading') return null;
  if (navState === 'onboarding') return <Redirect href="/(onboarding)" />;
  if (navState === 'login') return <Redirect href="/(auth)/login" />;

  return <Slot />;
}
```

### Migration Steps

1. Install `expo-router` (included with Expo SDK 53+, just needs config)
2. Update `app.json` / `app.config.js` to set `"scheme"` and entry point
3. Create `app/` directory with layout files
4. Move screen components from `lib/screens/` into `app/` route files (screens themselves barely change — just remove navigation prop drilling and use `useRouter()` / `useLocalSearchParams()`)
5. Delete `lib/navigation/AppNavigator.tsx`
6. Update `App.tsx` entry point (Expo Router uses `expo-router/entry`)

### What Changes in Screen Components

Minimal — mainly navigation calls:

```typescript
// Before
navigation.navigate("EditNote", { note, onSave });

// After
router.push({ pathname: '/edit-note/[id]', params: { id: note.id } });
```

```typescript
// Before
const { note } = route.params;

// After
const { id } = useLocalSearchParams();
// fetch note by id (TanStack Query handles this)
```

### Reference

Expo provides a migration guide: [Migrate from React Navigation](https://docs.expo.dev/router/migrate/from-react-navigation/)

---

## 9. Upgrade to Expo SDK 54

### Why

SDK 54 (September 2025) brings meaningful build and runtime improvements.

### Key Improvements

| Feature | Impact |
|---------|--------|
| **Precompiled XCFrameworks** | iOS clean builds drop from ~120s to ~10s |
| **Edge-to-edge enabled by default** | Android apps render behind system bars — screens may need safe area adjustments |
| **`expo-file-system/next` stable** | Modern object-oriented file API for future media handling |
| **Last SDK where New Architecture is optional** | After SDK 54, New Architecture is mandatory (you're already on it) |
| **React Native 0.81** | Up from 0.79 (SDK 53) |

### Migration Steps

```bash
# In lrda_mobile/
npx expo install expo@^54.0.0
npx expo install --fix    # updates all Expo packages to compatible versions
```

Then fix any breaking changes — the main one is edge-to-edge:

### Edge-to-Edge Considerations

With edge-to-edge enabled by default, your screens render behind the status bar and navigation bar. Screens that currently use hardcoded `marginTop` or `paddingTop` for the status bar (e.g., `MorePage.tsx` line 509: `paddingTop: Platform.OS === "android" ? 25 : 0`) will need to use `SafeAreaView` or `useSafeAreaInsets()` instead.

Files likely needing safe area fixes:
- `MorePage.tsx` — hardcoded Android padding
- `HomeScreen.tsx` — header area
- Any screen with custom headers that offset for the status bar

### Watch: `react-native-maps`

There's an [open discussion](https://github.com/react-native-maps/react-native-maps/discussions/5782) about `react-native-maps` compatibility with SDK 54 and the New Architecture. This is already a known issue in your app (web build fails due to this dep). Test the map screen thoroughly after upgrading. If it breaks, you may need to pin `react-native-maps` to a compatible version or wait for a patch.

---

## 10. Future Considerations (No Action Now)

### `expo-background-task`

SDK 53+ introduces `expo-background-task` (replaces deprecated `expo-background-fetch`). Uses modern platform APIs — WorkManager on Android, BGTaskScheduler on iOS. Useful if you ever need offline note sync or background media uploads. Not needed today, but available when you want it.

### Static Hermes

Experimental in late 2025 — compiles JavaScript to native code at build time instead of interpreting bytecode. Early benchmarks show significant startup and runtime performance improvements. When it stabilizes (likely 2026-2027), it's a free performance upgrade with no code changes. Watch the React Native blog for announcements.

### Mapping Alternatives

If `react-native-maps` becomes a persistent blocker with the New Architecture, alternatives to evaluate:
- `maplibre-react-native` — open-source, good Fabric support
- `@rnmapbox/maps` — Mapbox-powered, actively maintained for New Architecture

---

## Recommended Order

These can be done independently, but this sequence minimizes conflicts:

1. **Item 5** — Remove dead deps (5 min, clean slate)
2. **Item 3** — Replace User singleton with auth hook/store (natural extension of auth migration)
3. **Item 1** — Replace Redux with Zustand (small surface, auth store already exists from item 3)
4. **Item 2** — Add TanStack Query (touch each screen once for data fetching)
5. **Item 8** — Migrate to Expo Router (restructure screens, delete AppNavigator)
6. **Item 9** — Upgrade to Expo SDK 54 (build speed, edge-to-edge)
7. **Item 4** — Tighten TypeScript (fix the errors surfaced by strict mode)
8. **Item 6** — Standardize styling (cleanup pass, fix edge-to-edge safe areas)
9. **Item 7** — Migrate tests (align with new patterns)

Note: Items 8 and 9 (Expo Router + SDK 54) could be done together since the SDK upgrade may require navigation changes anyway.

---

## Estimated Timeline

| Item | Time |
|------|------|
| 1. Redux → Zustand | 1-2 days |
| 2. Add TanStack Query | 2-3 days |
| 3. User singleton → useAuth hook | 1-2 days (likely done during auth migration) |
| 4. TypeScript strict mode | 1 day |
| 5. Remove dead deps | 15 minutes |
| 6. Standardize styling | 1-2 days |
| 7. Migrate unit tests + add Maestro E2E | 2-3 days |
| 8. Migrate to Expo Router | 2-3 days |
| 9. Upgrade to Expo SDK 54 | 1-2 days |
| **Total** | **~12-19 days** |

Most of this can be parallelized across contributors if needed.
