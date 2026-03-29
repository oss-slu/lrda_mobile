# Firebase Auth → Better-Auth Migration Plan

## Overview

Replace Firebase Authentication with better-auth using bearer tokens. The mobile app will authenticate against the lrda_website API (`/api/auth/*` endpoints) and send bearer tokens on all authenticated requests.

## Prerequisites

- [ ] Confirm the website API's better-auth endpoints are deployed and accessible from mobile
- [ ] Confirm the following endpoints work with bearer tokens:
  - `POST /api/auth/sign-in/email` — returns session token
  - `POST /api/auth/sign-up/email` — returns session token
  - `POST /api/auth/forget-password` — sends reset email
  - `GET /api/auth/get-session` — validates token, returns user + session
  - `POST /api/auth/sign-out` — invalidates session
- [ ] Confirm an account deletion endpoint exists (or create one)
- [ ] Confirm a user profile endpoint exists that returns user data by session (or create one)

---

## Step 1: Create an Auth Client Module

**Replace:** `lib/config/firebase.js` and `lib/config/index.js`

**Create:** `lib/config/auth.ts`

This module replaces the Firebase config. It should export:

- `AUTH_API_URL` — base URL of the website API (e.g., from `Constants.expoConfig?.extra?.authApiUrl`)
- `authFetch(path, options)` — a wrapper around `fetch` that:
  1. Reads the bearer token from AsyncStorage (`authToken` key — same key already used)
  2. Attaches `Authorization: Bearer <token>` header
  3. Sets `Content-Type: application/json`
  4. Returns the response
- Keep exporting `db`, `realtimeDb`, `storage` from `firebase.js` **only if** they're still needed elsewhere (see Step 6)

```
lib/config/
├── auth.ts        ← NEW: better-auth client + authFetch helper
├── firebase.js    ← KEEP temporarily (Firestore still used in api_calls.ts)
└── index.js       ← UPDATE: export from auth.ts instead of firebase.js
```

---

## Step 2: Rewrite the User Singleton

**File:** `lib/models/user_class.ts`

This is the core of the migration. Replace all Firebase auth calls with REST calls to the website API.

### Changes

#### Remove imports
```
- signInWithEmailAndPassword, onAuthStateChanged, signOut, getAuth from "firebase/auth"
- doc, getDoc from "firebase/firestore"
- auth, db from "../config/firebase"
```

#### Add imports
```
+ authFetch, AUTH_API_URL from "../config/auth"
+ AsyncStorage (already imported)
```

#### `login(email, password)` method
- **Before:** `signInWithEmailAndPassword(auth, email, password)` → `user.getIdToken()`
- **After:** `POST /api/auth/sign-in/email` with `{ email, password }` → extract token from response → store in AsyncStorage under `authToken`
- Fetch user data from the session response (better-auth returns user object with sign-in)
- Remove the Firestore fallback (`getDoc(doc(db, "users", user.uid))`)

#### `logout(dispatch)` method
- **Before:** `signOut(auth)`
- **After:** `POST /api/auth/sign-out` using `authFetch`
- Keep: clearing AsyncStorage (`userData`, `authToken`), dispatching Redux state, notifying login state

#### `initializeUser()` method
- **Before:** `onAuthStateChanged(auth, callback)` — Firebase's realtime auth listener
- **After:** Check session validity on startup:
  1. Read `authToken` from AsyncStorage
  2. If token exists, call `GET /api/auth/get-session` with bearer header
  3. If valid → set `this.userData` from session response, call `notifyLoginState()`
  4. If invalid/expired → clear token, call `notifyLoginState()` with null
- This runs once on construction, not as a listener. Optionally also run on app foreground (`AppState` listener)

#### `getId()` method
- No changes needed — it reads from `this.userData` / AsyncStorage. Just ensure the user object from better-auth has an `id` field (map it to `uid` if needed, or update references)

#### `getName()` method
- better-auth stores `name` as a single field — simplify by removing the `firstName`/`lastName` Firestore fallback

#### `getRoles()` method
- better-auth uses a `role` field (string: "admin" | "user") via the admin plugin, not `{ administrator, contributor }` booleans
- Either: map better-auth's role to the existing shape, or update all consumers of `getRoles()` to use the new format

---

## Step 3: Update Login Screen

**File:** `lib/screens/loginScreens/LoginScreen.tsx`

Minimal changes — the screen already calls `user.login(username, password)` and checks the return value. The login logic is encapsulated in the User singleton.

### Changes
- Update error message matching: replace `auth/invalid-email` and `auth/invalid-credential` with whatever error format better-auth returns (likely HTTP status codes like 401, or error body messages like `"INVALID_CREDENTIALS"`)
- Everything else stays the same

---

## Step 4: Update Register Screen

**File:** `lib/screens/loginScreens/RegisterScreen.tsx`

### Changes

#### Remove imports
```
- createUserWithEmailAndPassword from "firebase/auth"
- doc, setDoc, Timestamp from "firebase/firestore"
- auth, db from "../../config/firebase"
```

#### Rewrite `handleRegister()`
- **Before:** `createUserWithEmailAndPassword(auth, email, password)` → `setDoc` to Firestore
- **After:** `POST /api/auth/sign-up/email` with `{ email, password, name: fullName }` — better-auth handles user record creation in PostgreSQL
- Update error handling: replace `auth/email-already-in-use` with better-auth's error format
- If custom fields are needed (roles, etc.), either:
  - Add them via better-auth's `additionalFields` on the server, OR
  - Make a follow-up API call to set them after registration

---

## Step 5: Update Forgot Password Screen

**File:** `lib/screens/loginScreens/ForgotPassword.tsx`

### Changes

#### Remove imports
```
- sendPasswordResetEmail from "firebase/auth"
- auth from "../../config"
```

#### Rewrite `handlePasswordReset()`
- **Before:** `sendPasswordResetEmail(auth, email)`
- **After:** `POST /api/auth/forget-password` with `{ email }` — better-auth sends the reset email via Resend (already configured in the website API)
- Update error handling to match better-auth response format

---

## Step 6: Update More Page (Account Deletion)

**File:** `lib/screens/MorePage.tsx`

This is the most involved screen change due to account deletion logic.

### Changes

#### Remove imports
```
- deleteUser, reauthenticateWithCredential, EmailAuthProvider from "firebase/auth"
- ref, remove from "firebase/database"
- deleteDoc, doc, deleteObject from "firebase/storage"
- auth from "../config"
- db, realtimeDb, storage from "../config/firebase"
- collection, addDoc, getDoc from "firebase/firestore"
```

#### Rewrite `onDeleteAccount()`
- **Before:** Saves deletion review to Firestore → deletes Firestore user doc → calls `deleteUser(currentUser)` → handles reauthentication
- **After:**
  1. Call a new API endpoint (e.g., `POST /api/account/delete` or use better-auth's admin plugin `removeUser`) with bearer token
  2. Include deletion reasons in the request body (the API should store them)
  3. On success, clear local state and log out
  4. No reauthentication needed — the bearer token proves the session is valid. If the token is expired, redirect to login

#### Decision needed
- Where do account deletion reviews go? Options:
  - A new API endpoint on the website backend that stores them in PostgreSQL
  - Keep a minimal Firestore write (not recommended — defeats the purpose of migrating away)

---

## Step 7: Update AppNavigator

**File:** `lib/navigation/AppNavigator.tsx`

### Changes

#### `checkOnboarding` useEffect (line 128-143)
- `user.getId()` — no change needed, it reads from AsyncStorage
- The rewritten `initializeUser()` in Step 2 handles session validation on startup

#### Login callback useEffect (line 145-149)
- Keep as-is — the callback mechanism doesn't depend on Firebase
- Note: `setLoginCallback` still works the same way, just triggered by session check instead of `onAuthStateChanged`

---

## Step 8: Update API Calls

**File:** `lib/utils/api_calls.ts`

### Changes

#### `fetchUserData(uid)`
- **Before:** Queries Firestore first, then falls back to RERUM API
- **After:** Fetch from the website API using bearer token (e.g., `GET /api/auth/get-session` already returns user data, or add a `GET /api/users/:id` endpoint)
- Remove all Firestore imports and calls

#### `fetchCreatorName(creatorId)`
- **Before:** Queries RERUM API, then falls back to Firestore
- **After:** Query the website API for user data by ID, or keep the RERUM API query and drop the Firestore fallback
- Remove Firestore imports

#### Add bearer token to RERUM API calls (optional)
- If/when the RERUM API starts requiring auth, use `authFetch` for all calls
- For now, the RERUM API doesn't use auth headers, so this is future work

---

## Step 9: Update Environment Config

**File:** `app.config.js` (Expo config)

- Add `authApiUrl` to the `extra` config (the base URL of the website API)
- Example: `authApiUrl: process.env.AUTH_API_URL` in extra, with `AUTH_API_URL=http://localhost:3002` in `.env`
- Note: The app currently reads env vars via `process.env` directly (through `babel-plugin-transform-inline-environment-variables`) and also via `Constants.expoConfig?.extra`. Be consistent — either approach works, just pick one.

---

## Step 10: Remove Firebase Auth Dependencies

Once all the above steps are complete and tested:

- [ ] Remove `firebase/auth` usage from all files
- [ ] If no other Firebase services are used (check if Firestore/Storage/RealtimeDB are still needed):
  - Remove `firebase` package from `package.json`
  - Delete `lib/config/firebase.js`
- [ ] If some Firebase services are still needed (e.g., for push notifications):
  - Keep `firebase.js` but remove auth initialization (`initializeAuth`, `getReactNativePersistence`)
- [ ] Update `setupTests.js` — remove Firebase auth mocks, add mocks for `authFetch` or the auth module
- [ ] Update all test files that mock Firebase auth functions

---

## Step 11: Update Tests

**Files:** `__tests__/*.test.tsx`, `setupTests.js`

- Remove global Firebase auth mocks from `setupTests.js`
- Mock `authFetch` or the new auth module instead
- Update test assertions that check for Firebase error codes
- User singleton tests should mock fetch responses from `/api/auth/*`

---

## Migration Order

Recommended implementation sequence:

1. **Step 1** — Auth client module (foundation for everything else)
2. **Step 2** — User singleton (core auth logic)
3. **Step 3** — Login screen (can test login flow end-to-end)
4. **Step 4** — Register screen
5. **Step 5** — Forgot password screen
6. **Step 8** — API calls (remove Firestore from data fetching)
7. **Step 6** — More page / account deletion
8. **Step 7** — AppNavigator (minimal changes)
9. **Step 9** — Environment config
10. **Step 10** — Cleanup Firebase deps
11. **Step 11** — Tests

---

## Files Changed Summary

| File | Action | Effort |
|------|--------|--------|
| `lib/config/auth.ts` | **Create** | Low |
| `lib/config/firebase.js` | Modify → eventually delete | Low |
| `lib/config/index.js` | Update exports | Low |
| `lib/models/user_class.ts` | **Rewrite auth methods** | Medium |
| `lib/screens/loginScreens/LoginScreen.tsx` | Update error handling | Low |
| `lib/screens/loginScreens/RegisterScreen.tsx` | Rewrite registration | Low-Medium |
| `lib/screens/loginScreens/ForgotPassword.tsx` | Swap one function call | Low |
| `lib/screens/MorePage.tsx` | Rewrite account deletion | Medium |
| `lib/utils/api_calls.ts` | Remove Firestore, use API | Medium |
| `lib/navigation/AppNavigator.tsx` | Minimal tweaks | Low |
| `app.config.js` | Add auth API URL | Low |
| `setupTests.js` | Update mocks | Low |
| `__tests__/*.test.tsx` | Update mocks/assertions | Low |

---

## Testing Strategy

### Local Dev Server Setup

Test the mobile app against the lrda_website API running locally. This gives instant feedback, database inspection, and console-visible emails.

```bash
# In lrda_website/
pnpm setup              # creates .env files from .env.example
pnpm dev                # starts PostgreSQL (Docker) + API on :3002 + web on :3000
pnpm api:db:seed        # seed test users into the database
```

**Key dev server details:**
- API runs on `http://localhost:3002`
- PostgreSQL runs in Docker on port `5433` (user: `lrda`, password: `lrda_dev`, db: `lrda_api`)
- Auth endpoints at `http://localhost:3002/api/auth/*`
- API docs at `http://localhost:3002/docs`
- CORS already allows `Authorization` header

### Localhost Networking by Platform

The mobile app can't always reach `localhost:3002` — it depends on the platform:

| Platform | URL to use | Notes |
|----------|-----------|-------|
| iOS Simulator | `http://localhost:3002` | Works out of the box |
| Android Emulator | `http://10.0.2.2:3002` | Android's alias for host machine |
| Physical device | `http://<your-lan-ip>:3002` | Both devices must be on the same WiFi network |

Set `authApiUrl` in the Expo config accordingly per environment.

### CORS for Mobile Dev

Native mobile apps (iOS/Android) don't enforce CORS — it's a browser-only mechanism. React Native's `fetch` sends requests directly without Origin headers or preflight checks, so the server's CORS config doesn't block native requests.

CORS only matters if you're testing in a web browser (which isn't supported anyway due to `react-native-maps`). No CORS changes needed for mobile testing.

### Database Inspection

Use Drizzle Studio to inspect the database directly during testing:

```bash
# In lrda_website/
pnpm api:db:studio      # Opens Drizzle Studio at http://localhost:5555
```

Verify that:
- New users appear in the `user` table after registration
- Sessions appear in the `session` table after login
- Sessions are removed after logout
- Users are removed after account deletion

### What to Validate (Test Checklist)

- [ ] **Login** — returns a token, app navigates to home, user data is persisted in AsyncStorage
- [ ] **Session restore** — kill and reopen the app; token in AsyncStorage → `GET /api/auth/get-session` succeeds → app goes to home (not login)
- [ ] **Expired/invalid token** — app redirects to login gracefully, no crash
- [ ] **Registration** — creates user in PostgreSQL `user` table (verify in Drizzle Studio), app navigates to login
- [ ] **Password reset** — triggers email (in dev mode, logged to API console instead of sent via Resend)
- [ ] **Logout** — clears token from AsyncStorage, invalidates session on server, app navigates to login
- [ ] **Account deletion** — removes user + session from database, clears local state, app navigates to login
- [ ] **Error handling** — invalid credentials show snackbar, network errors show appropriate message
- [ ] **Both platforms** — test on iOS simulator and Android emulator at minimum

### Email in Dev Mode

Password reset and email verification emails are **logged to the API server console** in development mode (Resend API key is optional). Look for the token/link in the terminal running the API server instead of checking an inbox.

---

## Estimated Timeline

For one developer:

| Phase | Time |
|-------|------|
| Resolve open decisions + backend prep (missing endpoints) | 1-2 days |
| Steps 1-5 (auth client, User class, auth screens) | 2-3 days |
| Steps 6-8 (MorePage, AppNavigator, api_calls) | 1-2 days |
| Steps 9-11 (config, cleanup, tests) | 1 day |
| QA / edge cases / both platforms | 2-3 days |
| **Total** | **~1.5-2 weeks** |

Budget 2 sprints if pairing with other sprint work.

---

## Sequencing Notes

- **This plan references Redux** (dispatching `setNavState`, etc.) because Redux is still in place during the auth migration. If you do the Zustand migration (see `MODERNIZATION_PLAN.md`) first, replace Redux dispatch calls with Zustand store calls instead.
- **After this plan + RERUM migration are both complete**, all Firestore usage will be removed and the `firebase` package can be fully deleted from `package.json`.
- **The RERUM migration depends on this plan** — bearer tokens from the auth client are needed for authenticated API calls.

---

## Decisions to Make Before Starting

1. **User ID format** — Firebase uses `uid` (string like `"abc123"`). Better-auth uses `id`. Do we rename throughout, or map `id` → `uid` in the auth client?
2. **Roles format** — Firebase: `{ administrator: boolean, contributor: boolean }`. Better-auth: `role: "admin" | "user"`. Adapt consumers or add a mapping layer?
3. **Account deletion reviews** — New API endpoint on the website backend, or alternative storage?
4. **Email verification** — The website requires email verification (`requireEmailVerification: true`). Should the mobile app also enforce this flow? If so, need to handle the verification state in the login flow.
5. **Firestore for non-auth data** — `api_calls.ts` uses Firestore for user data lookup and creator names. Once those move to the website API, can Firebase be fully removed?
