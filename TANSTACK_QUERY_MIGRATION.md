# TanStack Query Migration Plan

This document describes the full migration from hand-rolled useEffect/useState data fetching
to TanStack Query (React Query). The API layer (`api_calls.ts`) stays untouched -- TanStack Query
wraps existing functions as query/mutation functions. The migration is purely in the consumption layer.

## Current Problems

- **No caching or request deduplication.** Every screen focus triggers a full re-fetch.
- **N+1 creator lookups.** `NotesComponent` and `NoteDetailModal` each fire a `fetchCreatorName`
  call per note card. 20 notes by the same author = 20 identical requests.
- **Manual pagination state.** `useNotesList` and `ExploreScreen` both maintain `page`,
  `isLoadingMore`, `hasMore`, and `updateCounter` state by hand.
- **No error state exposed.** Most screens swallow errors into `console.error` or a Toast with
  no way for the UI to render an error state.
- **No offline support.** If the device is offline on launch, the app redirects to login.
- **Cache sync via focus re-fetch only.** After mutations, screens rely on `useFocusEffect` to
  re-fetch stale data when the user navigates back.

---

## Phase 1: Foundation

### Install

```bash
pnpm add @tanstack/react-query
```

### Create QueryClient (`lib/query/queryClient.ts`)

Configure a `QueryClient` with:
- `staleTime: 30_000` (30s before background refetch)
- `gcTime: 5 * 60 * 1000` (5 min garbage collection)
- `retry: 2` on queries, `retry: 0` on mutations
- Global `onError` handler for 401 responses to trigger auth re-initialization

### Create query key factory (`lib/query/queryKeys.ts`)

```ts
export const queryKeys = {
  notes: {
    all: ["notes"] as const,
    list: (opts: { creatorId?: string; published?: boolean }) =>
      ["notes", opts] as const,
    detail: (id: string) => ["notes", id] as const,
  },
  users: {
    detail: (id: string) => ["users", id] as const,
    name: (id: string) => ["users", id, "name"] as const,
  },
  profile: {
    notes: (userId: string) => ["profile", "notes", userId] as const,
  },
};
```

### Wrap app in provider (`app/_layout.tsx`)

Add `<QueryClientProvider client={queryClient}>` around the existing tree.

---

## Phase 2: Query Hooks

Replace all useEffect-based data fetching with useQuery/useInfiniteQuery.

### `lib/hooks/useNotesList.ts` -- rewrite to useInfiniteQuery

**Current state:** `notes`, `page`, `isLoadingMore`, `hasMore`, `rendering`, `updateCounter`
state + `useFocusEffect` + manual `doFetch`.

**New:** `useInfiniteQuery` with:
- `getNextPageParam` returning the next offset
- `select` to flatten pages + run `DataConversion.convertMediaTypes`
- A `useFocusEffect` that calls `refetch()` (simpler than the current approach)
- Returns: `{ data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch }`

**Eliminates:** `updateCounter`, `hasLoadedOnce` ref, `doFetch`, all `useState` for
loading/pagination, `setNotes` exposure.

### `lib/components/NotesComponent.tsx` (lines 60-65) -- useQuery for creator name

Replace the per-card `useEffect` calling `fetchCreatorName` with:

```ts
const { data: author } = useQuery({
  queryKey: queryKeys.users.name(item.creatorId),
  queryFn: () => fetchCreatorName(item.creatorId),
  staleTime: Infinity, // creator names don't change
});
```

**Highest-impact single change:** TanStack Query deduplicates requests for the same `creatorId`,
so 20 notes by the same author = 1 request instead of 20.

### `lib/screens/mapPage/NoteDetailModal.tsx` (line 358) -- useQuery for creator name

Same pattern as NotesComponent. Shares the cache automatically via the same query key.

### `lib/screens/mapPage/ExploreScreen.tsx` -- rewrite to useInfiniteQuery

Replace its independent pagination (`fetchMessages`, `page`, `isLoadingMore`, `hasMore`,
`markers` state) with `useInfiniteQuery`.

For search: when the user searches, switch to a separate `useQuery` with the search term in the
key. When cleared, revert to the paginated query.

### `lib/screens/ProfilePage.tsx` (lines 18-43) -- useQuery

Replace the `useEffect` calling `fetchAllNotes` with:

```ts
const { data: images, isLoading } = useQuery({
  queryKey: queryKeys.profile.notes(authUser?.id ?? ""),
  queryFn: () => fetchAllNotes({ creatorId: authUser?.id }),
  select: (notes) =>
    DataConversion.extractImages(DataConversion.convertMediaTypes(notes)),
  enabled: !!authUser?.id,
});
```

---

## Phase 3: Mutation Hooks

Create `lib/hooks/mutations/` with shared mutation hooks.

### `useCreateNote` -- wraps `createNote()`

- `onSuccess`: invalidate `queryKeys.notes.all`
- Used by: `AddNoteScreen.saveNote()` (both manual save and auto-save on blur)

### `useUpdateNote` -- wraps `apiUpdateNote()`

- `onSuccess`: invalidate `queryKeys.notes.all`
- Optionally do optimistic updates for archive/publish toggles in HomeScreen
- Used by: `EditNoteScreen` (3 save paths), `HomeScreen` (archive, publish toggle)

### `useDeleteNote` -- wraps `deleteNote()`

- `onSuccess`: invalidate `queryKeys.notes.all`
- Currently unused in the UI (delete = archive), but available for future use

### `useUploadMedia` and `useUploadAudio` -- wraps S3 proxy calls

- Wraps `uploadMedia()` and `uploadAudio()` from `S3_proxy.ts`
- Gives loading/error state to `audio.tsx` and `photoScroller.tsx` which currently have none
- `onError`: surface a Toast or inline error so the user knows the upload failed

---

## Phase 4: Screen-Level Changes

### `lib/screens/HomeScreen.tsx`

- Consume refactored `useNotesList` hook's new return shape
- Remove `setNotes` usage -- manual `setNotes(prev => prev.map(...))` in `handleArchiveNote`
  becomes optimistic update via `queryClient.setQueryData` inside `useUpdateNote`'s `onMutate`
- Remove direct `apiUpdateNote` calls, use `updateNoteMutation.mutate()` instead
- `publishNote` and `handleArchiveNote` become thin wrappers around the mutation

### `lib/screens/EditNoteScreen.tsx`

- Replace all 3 `apiUpdateNote` call sites with `updateNoteMutation.mutate()`
- Replace `isUpdating` state with `updateNoteMutation.isPending`
- Auto-save on blur calls `updateNoteMutation.mutate()`
- Keep the `ispublishBtnClicked` flag to prevent double-fire (TanStack Query doesn't
  auto-deduplicate mutations)

### `lib/screens/AddNoteScreen.tsx`

- Replace `createNote()` call with `createNoteMutation.mutate()`
- Replace `isUpdating` state with `createNoteMutation.isPending`

### `lib/screens/Library.tsx`

- Minimal change -- consume new `useNotesList` return shape

### `lib/components/audio.tsx`

- Wrap `uploadAudio` in `useUploadAudio` mutation hook
- Use `isPending` for loading state, `isError` for error feedback

### `lib/components/photoScroller.tsx`

- Wrap `uploadMedia` in `useUploadMedia` mutation hook
- Use `isPending` for loading state, `isError` for error feedback

---

## Phase 5: Cleanup -- What to Remove

| Remove | Replaced by |
|---|---|
| `updateCounter` state in `useNotesList` | `queryClient.invalidateQueries` |
| `hasLoadedOnce` ref in `useNotesList` | `isLoading` vs `isFetching` distinction |
| `rendering` state in `useNotesList` | `isLoading` (first load) vs `isFetching` (background) |
| `page`, `isLoadingMore`, `hasMore` in `useNotesList` | Built into `useInfiniteQuery` |
| `setNotes` exposure from `useNotesList` | `queryClient.setQueryData` in mutations |
| `refreshPage()` function | `refetch()` from query or `invalidateQueries` from mutations |
| `useFocusEffect` counter pattern in `useNotesList` | Simpler `useFocusEffect(() => refetch())` |
| All pagination state in `ExploreScreen` | `useInfiniteQuery` |
| `useEffect` for `fetchCreatorName` in `NotesComponent` | `useQuery` with shared cache |
| `useEffect` for `fetchCreatorName` in `NoteDetailModal` | `useQuery` with shared cache |
| `isUpdating` state in `AddNoteScreen` / `EditNoteScreen` | `mutation.isPending` |
| Direct `apiUpdateNote` calls in `HomeScreen` | `useUpdateNote` mutation hook |

---

## Phase 6: Optional Improvements

### Offline cache persistence

Add `@tanstack/query-async-storage-persister` + AsyncStorage. Notes loaded in prior sessions
appear instantly while a background refetch runs. This gives offline reading for free.

### Prefetching

When the user taps a map marker, prefetch the note detail and creator name so the modal opens
instantly:

```ts
queryClient.prefetchQuery({
  queryKey: queryKeys.users.name(note.creatorId),
  queryFn: () => fetchCreatorName(note.creatorId),
});
```

### Global 401 handler

Add a query cache `onError` handler that catches `ApiError` with `status === 401` and calls
`authStore.getState().initialize()` to refresh the session. This addresses the current gap
where expired tokens cause silent failures.

### Suspense + error boundaries

TanStack Query supports `useSuspenseQuery` which pairs with React Suspense boundaries for
declarative loading states (no more `if (isLoading) return <Skeleton>`). Can be adopted
incrementally per screen. Pair with error boundaries for a complete declarative data layer.

---

## Files Changed Summary

| File | Change type |
|---|---|
| `package.json` | Add `@tanstack/react-query` |
| `app/_layout.tsx` | Add `QueryClientProvider` wrapper |
| `lib/query/queryClient.ts` | **New** -- QueryClient config |
| `lib/query/queryKeys.ts` | **New** -- centralized key factory |
| `lib/hooks/useNotesList.ts` | Rewrite to `useInfiniteQuery` |
| `lib/hooks/mutations/useCreateNote.ts` | **New** -- create note mutation |
| `lib/hooks/mutations/useUpdateNote.ts` | **New** -- update note mutation |
| `lib/hooks/mutations/useDeleteNote.ts` | **New** -- delete note mutation |
| `lib/hooks/mutations/useUploadMedia.ts` | **New** -- media upload mutation |
| `lib/hooks/mutations/useUploadAudio.ts` | **New** -- audio upload mutation |
| `lib/screens/HomeScreen.tsx` | Use mutation hooks, remove `setNotes` |
| `lib/screens/EditNoteScreen.tsx` | Use mutation hooks, remove `isUpdating` |
| `lib/screens/AddNoteScreen.tsx` | Use mutation hooks, remove `isUpdating` |
| `lib/screens/Library.tsx` | Consume new `useNotesList` shape |
| `lib/screens/mapPage/ExploreScreen.tsx` | Rewrite to `useInfiniteQuery` |
| `lib/screens/ProfilePage.tsx` | Replace `useEffect` with `useQuery` |
| `lib/screens/mapPage/NoteDetailModal.tsx` | Replace `useEffect` with `useQuery` |
| `lib/components/NotesComponent.tsx` | Replace `useEffect` with `useQuery` |
| `lib/components/audio.tsx` | Wrap upload in `useUploadAudio` |
| `lib/components/photoScroller.tsx` | Wrap upload in `useUploadMedia` |
| `lib/utils/api_calls.ts` | **No changes** |
