# RERUM API → Website API Migration Plan

## Overview

Replace the RERUM API (`lived-religion-dev.rerum.io/deer-lr/`) with the lrda_website API (`/api/notes/*`, `/api/users/*`) for all note CRUD and data fetching. Media uploads via the S3 proxy are handled separately.

## Strategy: Adapter Layer

Rather than updating every screen to use new field names, add a **mapping layer** in `api_calls.ts` that translates website API responses into the existing RERUM field format. This means:

- `DataConversion.convertMediaTypes()` stays untouched
- All screens consuming `Note` objects stay untouched
- Only `api_calls.ts` and `S3_proxy.ts` change

This is the fastest and lowest-risk approach. Field names can be normalized across the codebase in a future cleanup pass.

## Prerequisites

- [ ] Auth migration complete (bearer tokens working — see `MIGRATION_PLAN.md`)
- [ ] Website API running and accessible from mobile
- [ ] Confirm `GET /api/notes` supports all needed query params (`published`, `creatorId`, `search`, `limit`, `offset`)
- [ ] Add a `GET /api/users/{id}` endpoint to the website API (for creator name lookup) — or include creator name in note responses
- [ ] Decide on media upload strategy (keep S3 proxy vs. add upload endpoint to website API)

---

## Step 1: Update API Base URL and Auth Headers

**File:** `lib/utils/api_calls.ts`

### Changes

Replace:

```typescript
const API_BASE_URL = process.env.API_BASE_URL || "https://lived-religion-dev.rerum.io/deer-lr/";
```

With:

```typescript
import { authFetch, AUTH_API_URL } from "../config/auth";
```

All API calls should use `authFetch` (from the auth migration) which attaches the bearer token. The website API requires auth for create/update/delete operations.

---

## Step 2: Rewrite Note Fetching Methods

**File:** `lib/utils/api_calls.ts`

### `fetchMessages()` (lines 21-65) — Fetch all user notes

**Before:** `POST /query` with `{ type: "message", creator: userId }`, recursive pagination via `limit`/`skip`
**After:** `GET /api/notes?creatorId={userId}&limit=200&offset=0`, paginate with offset

Response mapping (website → RERUM format):

```typescript
// Map each note from website format to RERUM format
function mapNoteResponse(note: any): any {
  return {
    "@id": note.id,
    title: note.title,
    BodyText: note.text,
    creator: note.creatorId,
    media:
      note.media?.map((m) => ({
        uuid: m.uuid,
        type: m.type,
        uri: m.uri,
        thumbnail: m.thumbnailUri,
      })) || [],
    audio:
      note.audio?.map((a) => ({
        uuid: a.uuid,
        type: "audio",
        uri: a.uri,
        duration: a.duration,
        name: a.name,
      })) || [],
    latitude: note.latitude?.toString() || "",
    longitude: note.longitude?.toString() || "",
    published: note.isPublished,
    tags: note.tags?.map((t) => t.label) || [],
    time: note.time,
    isArchived: false, // website API doesn't have archive — notes are deleted
    __rerum: {
      createdAt: note.createdAt,
    },
  };
}
```

This mapper is the core of the adapter — all fetch methods return data through it, so `DataConversion.convertMediaTypes()` and all screens continue working unchanged.

### `fetchMessagesBatch()` (lines 67-101) — Paginated user notes

**Before:** `POST /query?limit=20&skip=0` with `{ type: "message", creator: userId, published }`
**After:** `GET /api/notes?creatorId={userId}&published={published}&limit=20&offset={skip}`

Map response through `mapNoteResponse()`.

### `fetchMapsMessagesBatch()` (lines 103-136) — Published notes for map

**Before:** `POST /query?limit=20&skip=0` with `{ type: "message", published }`
**After:** `GET /api/notes?published=true&limit=20&offset={skip}`

The website API also supports geographic bounding box filtering (`minLat`, `maxLat`, `minLng`, `maxLng`) which could improve map performance — only fetch notes visible in the viewport instead of all published notes.

### `searchMessages()` (lines 385-434) — Search notes

**Before:** `POST /query` fetches ALL messages, then filters client-side by title and tags
**After:** `GET /api/notes?search={query}&published=true`

This is a significant improvement — search moves server-side. The website API searches title and text fields. Tag search would need to remain client-side or be added to the website API.

---

## Step 3: Rewrite Note Creation

**File:** `lib/utils/api_calls.ts`

### `writeNewNote()` (lines 334-354)

**Before:**

```typescript
POST {RERUM}/create
{
  type: "message",
  title, media, BodyText, creator,
  latitude, longitude, audio, published, tags, time
}
```

**After:**

```typescript
POST /api/notes  (with bearer token)
{
  title,
  text: note.text,           // was BodyText
  latitude: parseFloat(note.latitude) || null,
  longitude: parseFloat(note.longitude) || null,
  isPublished: note.published, // was published
  tags: note.tags.map(t => ({ label: t, origin: "user" })),  // string[] → {label, origin}[]
  time: note.time,
  media: note.media.map(m => ({
    type: m.type,
    uri: m.uri,
    thumbnailUri: m.thumbnail || null,  // was thumbnail
    uuid: m.uuid,
  })),
  audio: note.audio.map(a => ({
    uri: a.uri,
    name: a.name,
    duration: a.duration,
    uuid: a.uuid,
  })),
}
```

Note: `creator` is no longer sent in the body — the website API infers it from the bearer token session.

---

## Step 4: Rewrite Note Update

**File:** `lib/utils/api_calls.ts`

### `overwriteNote()` (lines 361-383)

**Before:**

```typescript
PUT {RERUM}/overwrite
{ "@id": note.id, title, BodyText, type: "message", creator, media, ... }
```

**After:**

```typescript
PATCH /api/notes/{note.id}  (with bearer token)
{
  title,
  text: note.text,
  latitude: parseFloat(note.latitude) || null,
  longitude: parseFloat(note.longitude) || null,
  isPublished: note.published,
  tags: note.tags.map(t => ({ label: t, origin: "user" })),
  time: note.time,
  media: note.media.map(m => ({
    type: m.type,
    uri: m.uri,
    thumbnailUri: m.thumbnail || null,
    uuid: m.uuid,
  })),
  audio: note.audio.map(a => ({
    uri: a.uri,
    name: a.name,
    duration: a.duration,
    uuid: a.uuid,
  })),
}
```

Note: the website API replaces media/audio arrays in full on update (deletes old, inserts new). This matches the current behavior since RERUM's `/overwrite` also replaces the entire object.

### Archive behavior

The mobile app currently "deletes" notes by setting `isArchived: true` via `overwriteNote()`. The website API uses actual `DELETE /api/notes/{id}` instead. Decision needed:

- **Option A:** Add `isArchived` to the website's note schema and keep soft-delete behavior
- **Option B:** Use real deletion (`DELETE /api/notes/{id}`) and update the mobile app's archive logic

---

## Step 5: Rewrite Note Deletion

**File:** `lib/utils/api_calls.ts`

### `deleteNoteFromAPI()` (lines 300-327)

**Before:**

```typescript
DELETE {RERUM}/delete
Headers: "Content-Type": "text/plain; charset=utf-8"
Body: { type: "message", creator: userId, "@id": id }
```

**After:**

```typescript
DELETE /api/notes/{id}  (with bearer token)
// No body needed — note ID in URL, auth from token
```

Response: website API returns 200 with success message (vs RERUM's 204). Update the success check accordingly.

Note: This method is currently not actively called — the app uses archive instead. But it should be updated for completeness.

---

## Step 6: Rewrite User Data Fetching

**File:** `lib/utils/api_calls.ts`

### `fetchUserData()` (lines 143-204)

**Before:** Queries Firestore first, then RERUM API as fallback with `{ "@type": "Agent", "uid": uid }`
**After:** Handled by the auth migration — user data comes from `GET /api/auth/get-session` via bearer token

This method can be simplified to just read from the session or a dedicated user endpoint. Remove all Firestore imports.

### `fetchCreatorName()` (lines 215-266)

**Before:** Queries RERUM API for Agent by uid, falls back to Firestore
**After:** `GET /api/users/{creatorId}` on the website API

**Requires:** A new endpoint on the website API that returns a user's public profile (at minimum: `id`, `name`). This could also be solved by including `creatorName` in note responses via a join.

Remove Firestore imports (`doc`, `getDoc`, `db`).

### `createUserData()` (lines 275-292)

**Before:** `POST {RERUM}/create` with `{ "@type": "Agent", ...userData }`
**After:** No longer needed — better-auth handles user creation during registration

This method can be deleted.

---

## Step 7: Media Upload Decision

**File:** `lib/utils/S3_proxy.ts`

The S3 proxy (`s3-proxy.rerum.io`) is a separate service from RERUM. Two options:

### Option A: Keep the S3 proxy (recommended for now)

- No changes to `S3_proxy.ts`, `photoScroller.tsx`, or `audio.tsx`
- Media URIs remain S3 proxy URLs stored in note objects
- The website API already stores media URIs as-is (it doesn't care where the file lives)
- Simplest path — decouple this from the API migration

### Option B: Add upload endpoint to website API

- Create `POST /api/uploads` on the website backend that stores files in S3/R2/local storage
- Rewrite `uploadMedia()` and `uploadAudio()` to hit the new endpoint with bearer auth
- More work, but removes the last external dependency on RERUM infrastructure

**Recommendation:** Go with Option A now. Migrate media uploads in a separate issue later if needed.

---

## Step 8: Update ExploreScreen Map Data

**File:** `lib/screens/mapPage/ExploreScreen.js`

This screen does NOT use `DataConversion` — it maps raw API responses directly to map markers in `mapNoteToMarker()`.

### Changes

The `mapNoteToMarker()` function accesses RERUM-specific fields directly:

- `note.__rerum.createdAt` → will be `note.createdAt` from website API (but if using the adapter from Step 2, this is already mapped to `__rerum.createdAt`)
- `note.media[i].uri` → same field name, no change
- `note.BodyText` → mapped to `BodyText` by adapter

If using the adapter layer from Step 2, **no changes needed here**. The adapter ensures raw responses look like RERUM format.

If NOT using the adapter (direct website format), update field references:

- `note.__rerum.createdAt` → `note.createdAt`
- `note.BodyText` → `note.text`
- `note.published` → `note.isPublished`

---

## Step 9: Update Environment Config

**File:** `app.config.js`

- Remove `apiBaseUrl` (RERUM URL) from `extra` config
- The website API URL is already configured as `authApiUrl` from the auth migration — reuse it for note API calls
- Keep `s3ProxyPrefix` in `extra` if keeping S3 proxy (Option A)
- Note: `api_calls.ts` currently reads `process.env.API_BASE_URL` directly via `babel-plugin-transform-inline-environment-variables`, not through `Constants.expoConfig?.extra`. Remove the env var from `.env` as well.

---

## Step 10: Remove RERUM Dependencies

Once all steps are complete and tested:

- [ ] Remove RERUM base URL constant from `api_calls.ts`
- [ ] Remove all Firestore imports from `api_calls.ts` (`doc`, `getDoc`, `db`)
- [ ] Delete `createUserData()` method (replaced by auth registration)
- [ ] If Firebase is fully removed (no other Firestore/Storage/RealtimeDB usage), delete `lib/config/firebase.js`
- [ ] Update tests that mock RERUM API responses

---

## Step 11: Update Tests

**Files:** `__tests__/*.test.tsx`, `lib/utils/testing.js`

- `testing.js` (lines 20, 59, 84) uses `ApiService` — update to mock website API responses
- Update response shapes in mocks to match website API format (or RERUM format if using adapter)
- Mock `authFetch` for authenticated endpoints

---

## Files Changed Summary

| File                                      | Action                                     | Effort        |
| ----------------------------------------- | ------------------------------------------ | ------------- |
| `lib/utils/api_calls.ts`                  | **Rewrite all methods + add adapter**      | Medium        |
| `lib/utils/S3_proxy.ts`                   | No change (Option A) or rewrite (Option B) | None / Medium |
| `lib/utils/data_conversion.ts`            | No change (adapter handles mapping)        | None          |
| `lib/screens/mapPage/ExploreScreen.js`    | No change (adapter) or update field refs   | None / Low    |
| `lib/screens/HomeScreen.tsx`              | No change                                  | None          |
| `lib/screens/Library.tsx`                 | No change                                  | None          |
| `lib/screens/AddNoteScreen.tsx`           | No change                                  | None          |
| `lib/screens/EditNoteScreen.tsx`          | No change                                  | None          |
| `lib/screens/ProfilePage.tsx`             | No change                                  | None          |
| `lib/screens/mapPage/NoteDetailModal.tsx` | No change                                  | None          |
| `types.ts`                                | No change                                  | None          |
| `lib/models/media_class.ts`               | No change                                  | None          |
| `app.config.js` / `.env`                  | Remove RERUM URL                           | Low           |
| `lib/utils/testing.js`                    | Update mocks                               | Low           |

---

## Migration Order

1. **Step 1** — Update base URL and auth headers
2. **Step 2** — Write `mapNoteResponse()` adapter + rewrite fetch methods
3. **Step 3** — Rewrite note creation
4. **Step 4** — Rewrite note update
5. **Step 5** — Rewrite note deletion
6. **Step 6** — Rewrite user data fetching (remove Firestore)
7. **Step 8** — Verify ExploreScreen works with adapter
8. **Step 9** — Environment config cleanup
9. **Step 10** — Remove RERUM dependencies
10. **Step 11** — Update tests

Step 7 (media uploads) is independent and can be done in a separate issue.

---

## Testing Strategy

### Local Dev Server

Same setup as the auth migration — run against the website API locally:

```bash
# In lrda_website/
pnpm dev                # API on :3002
pnpm api:db:seed        # seed test data (includes sample notes)
pnpm api:db:studio      # Drizzle Studio on :5555 for DB inspection
```

### What to Validate

- [ ] **Home screen loads** — user's notes appear, sorted by date, media thumbnails display
- [ ] **Library loads** — published notes from all users appear
- [ ] **Map loads** — published notes appear as markers with correct coordinates
- [ ] **Note detail** — tapping a note shows full content, media, audio, creator name
- [ ] **Create note** — new note with text, photos, video, audio, tags, location saves correctly
- [ ] **Edit note** — changes persist, media additions/removals work
- [ ] **Delete/archive** — note disappears from list
- [ ] **Search** — returns matching notes by title/text
- [ ] **Pagination** — scrolling loads more notes without duplicates
- [ ] **Media display** — S3 proxy URLs still load images/video/audio correctly
- [ ] **Offline → online** — app handles network errors gracefully

### Data Shape Verification

Use Drizzle Studio (`localhost:5555`) to verify:

- Notes are created with correct fields in the `note` table
- Media records appear in the `media` table with correct `noteId` references
- Audio records appear in the `audio` table
- Tags are stored as JSONB `[{label, origin}]` arrays

---

## Estimated Timeline

For one developer (assumes auth migration is already done):

| Phase                                                  | Time          |
| ------------------------------------------------------ | ------------- |
| Backend prep (creator name endpoint, archive decision) | 0.5-1 day     |
| Steps 1-5 (api_calls.ts rewrite + adapter)             | 2-3 days      |
| Step 6 (user data cleanup)                             | 0.5 day       |
| Steps 8-10 (ExploreScreen, config, cleanup)            | 0.5 day       |
| Step 11 (tests)                                        | 0.5-1 day     |
| QA / both platforms                                    | 1-2 days      |
| **Total**                                              | **~5-7 days** |

This is smaller than the auth migration because the adapter layer keeps changes contained to `api_calls.ts`.

---

## Decisions to Make Before Starting

1. **Archive vs. delete** — Keep soft-delete (`isArchived` field, add to website schema) or switch to hard delete (`DELETE /api/notes/{id}`)?
2. **Creator name** — Add `GET /api/users/{id}` endpoint, or include `creatorName` in note responses?
3. **Tag format** — RERUM uses `string[]`, website uses `{label, origin}[]`. The adapter maps `label` → string for now, but should the mobile app start using the richer format?
4. **Media uploads** — Keep S3 proxy for now, or migrate in the same pass?
5. **Geographic filtering** — The website API supports bounding box queries. Worth using on the map screen to reduce data transfer?
