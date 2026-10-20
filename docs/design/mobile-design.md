# Where's Religion? Mobile — Design Artifacts

Design artifacts for the Expo / React Native app. The shared backend (API, database, deployment) is documented in [`lrda_website/docs/design/system-design.md`](https://github.com/oss-slu/lrda_website/blob/main/docs/design/system-design.md). That document also has the system context, the ERD and the note lifecycle, all of which apply to mobile too.

All diagrams are [Mermaid](https://mermaid.js.org/) and render on GitHub. To edit one, paste it into [mermaid.live](https://mermaid.live).

**Legend:** solid line = current state · dashed line = planned or future state · **DEBT** = known technical debt (red nodes)

| # | Artifact | Type | Notation |
|---|---|---|---|
| 1 | [Mobile in the system](#1-mobile-in-the-system) | Component | C4-style container diagram |
| 2 | [App startup and navigation gating](#2-app-startup-and-navigation-gating) | State | UML state machine |
| 3 | [Information architecture](#3-information-architecture-screens-and-tabs) | Navigation hierarchy | Flowchart |
| 4 | [Module layers](#4-module-layers) | Software architecture | Layered component diagram |
| 5 | [Field capture flow](#5-user-flow--capturing-a-note-in-the-field) | User flow | Flowchart |
| 6 | [Build and release](#6-build-and-release-pipeline) | Deployment | Flowchart |
| 7 | [Technical debt and future state](#7-technical-debt-and-intended-future-state) | Annotated summary | Table |

---

## 1. Mobile in the system

```mermaid
flowchart LR
  U["Field researcher"] --> APP

  subgraph APP["lrda_mobile (Expo SDK 56, React Native 0.85)"]
    UI["Screens (expo-router)"]
    Q["TanStack Query<br/>server cache"]
    Z["Zustand stores<br/>auth · theme · onboarding · addNote"]
    SS[("SecureStore<br/>session token")]
    AS[("AsyncStorage<br/>theme, tutorial flags")]
    UI --> Q & Z
    Z --> SS & AS
  end

  Q -- "REST + Bearer token" --> API["Hono API<br/>api.wheresreligion.org"]
  Z -- "Better Auth (expo plugin)" --> API
  API --> PG[("PostgreSQL")]
  UI -- "DEBT: media bytes over plain HTTP" --> S3P["RERUM S3 proxy"]
  UI -- "react-native-maps" --> GM["Google Maps SDK"]
  UI --> DEV["Device APIs<br/>camera · gallery · mic · GPS"]
  APP -. "OTA JS updates" .- EAS["EAS Update channels"]
  classDef debt fill:#fde2e2,stroke:#c0392b,color:#7b1d1d
  class S3P debt
```

The mobile app is a **thin client**. It has no database of its own, and every note is read from and written to the shared API. Unlike the web app, auth uses a **Bearer token** kept in SecureStore, not a cookie.

---

## 2. App startup and navigation gating

`app/_layout.tsx` restores the onboarding and auth state, then uses `Stack.Protected` guards to show exactly one route group.

```mermaid
stateDiagram-v2
  [*] --> Booting
  Booting --> Booting : restore onboarding flag and session from SecureStore
  Booting --> Onboarding : not onboarded
  Booting --> Auth : onboarded and no session
  Booting --> Tabs : onboarded and valid session

  Onboarding --> Auth : finish tutorial
  Auth --> Tabs : login / register succeeds
  Tabs --> Auth : logout or session expired

  state Auth {
    [*] --> Login
    Login --> Register
    Login --> ForgotPassword
    Register --> Login
    ForgotPassword --> Login
  }
```

**Decision:** gating is declarative (route guards), not imperative `router.replace()` calls, so it's impossible to deep-link into `(tabs)` without a session.

---

## 3. Information architecture (screens and tabs)

```mermaid
flowchart TB
  ROOT["Root Stack"] --> ONB["onboarding"]
  ROOT --> AUTH["(auth)<br/>login · register · forgot-password"]
  ROOT --> TABS["(tabs) bottom bar"]
  ROOT --> ACC["account (modal)"]
  ROOT --> VID["video-player (modal)"]

  TABS --> T1["Home<br/>my notes, swipe to edit/delete"]
  TABS --> T2["Library<br/>all published notes, search"]
  TABS --> T3(("+ Add Note<br/>center FAB"))
  TABS --> T4["Map<br/>ExploreScreen, note markers"]
  TABS --> T5["More"]

  T3 --> AN["add-note<br/>(hidden tab, FAB becomes Publish)"]
  T1 --> EN["edit-note<br/>(hidden tab)"]
  T4 --> ND["NoteDetailModal<br/>images · video · audio"]

  T5 --> M1["about"]
  T5 --> M2["team"]
  T5 --> M3["resource"]
  T5 --> M4["read-more"]
  T5 --> M5["app-theme"]
  T5 -.-> ACC
```

The **More** tab mirrors the website's public pages (about, team, resources), so content changes the client asks for on the website usually need matching changes here.

---

## 4. Module layers

Dependencies point downward only. Screens never call `fetch` directly.

```mermaid
flowchart TB
  subgraph L1["Routes — app/"]
    R["Expo Router files<br/>(auth), (tabs), more/*"]
  end
  subgraph L2["Screens and components — lib/screens, lib/components"]
    S["HomeScreen · Library · AddNoteScreen · EditNoteScreen<br/>ExploreScreen · ProfilePage · MorePage"]
    C["NoteEditor (tentap) · photoScroller · audio<br/>tagging · NotesList · MapNotesComponent"]
  end
  subgraph L3["State and data hooks — lib/hooks, lib/stores, lib/context"]
    H["useNotesList · useNoteEditor · useNoteLocation<br/>mutations/useCreateNote · useUpdateNote"]
    ST["authStore · themeStore · onboardingStore · addNoteStore<br/>AddNoteContext"]
    QK["query/queryClient · queryKeys"]
  end
  subgraph L4["I/O — lib/utils, lib/auth, lib/models"]
    API["api_calls.ts → /api/notes, /api/users"]
    S3["S3_proxy.ts → uploadFile"]
    AUTH["auth/client.ts (Better Auth + SecureStore)"]
    MOD["models/media_class.ts<br/>PhotoType · VideoType · AudioType"]
  end

  R --> S --> C
  S --> H & ST
  C --> H
  H --> QK
  H --> API & S3
  ST --> AUTH
  API --> MOD
  S3 --> MOD
```

---

## 5. User flow — capturing a note in the field

This is the main mobile workflow and the reason the app exists alongside the website.

```mermaid
flowchart TD
  START(["Tap + Add Note"]) --> LOC{"Location permission?"}
  LOC -- granted --> GPS["Auto-fill GPS coordinates"]
  LOC -- "denied or location off" --> ZERO["DEBT: coordinates set to 0,0<br/>(note lands off the coast of Africa)"]
  GPS & ZERO --> EDIT["Write title + rich text"]
  ZERO -.-> PIN["Planned: let the user drop a pin manually"]

  EDIT --> ADD{"Add media?"}
  ADD -- photo/video --> CAM["Camera or gallery"]
  ADD -- audio --> REC["Record with expo-audio"]
  ADD -- tags --> TAG["Add tags"]
  CAM & REC & TAG --> EDIT

  ADD -- done --> NET{"Online?"}
  NET -- no --> FAIL["DEBT: save fails,<br/>no offline queue"]
  NET -- yes --> UP["Upload each file to S3 proxy<br/>get URL back"]
  UP --> POST["POST /api/notes with media URLs"]
  POST --> PUB{"Publish now?"}
  PUB -- yes --> LIVE(["Visible on map and Library"])
  PUB -- no --> DRAFT(["Saved as draft in Home"])

  FAIL -.-> QUEUE["Planned: local draft + retry on reconnect"]
  classDef debt fill:#fde2e2,stroke:#c0392b,color:#7b1d1d
  class ZERO,FAIL debt
```

---

## 6. Build and release pipeline

```mermaid
flowchart LR
  PR["Pull request"] --> CI["GitHub Actions: App test<br/>pnpm install · tsc --noEmit · Jest"]
  CI -- merge --> MAIN["main"]
  MAIN --> CH{"Change type"}
  CH -- "JS / assets only" --> OTA["eas update<br/>→ production channel"]
  CH -- "native deps / config" --> BUILD["eas build -p ios / android<br/>(profile: production)"]
  BUILD --> STORE["App Store / Play Store review"]
  OTA --> DEVICES["Installed apps pick up the update on next launch"]
  STORE --> DEVICES

  LOCAL["Local QA: Maestro E2E<br/>pnpm e2e (.maestro/)"] -.-> PR
```

**Trade-off:** OTA updates ship fixes without store review, but only for JavaScript changes. Anything that touches native code (Expo SDK upgrades, new permissions, `app.config.js`) needs a full store build.

---

## 7. Technical debt and intended future state

| Debt | Where | Impact | Intended state |
|---|---|---|---|
| Media uploads go to an unauthenticated third-party proxy, over **plain HTTP** in the production profile | `lib/utils/S3_proxy.ts`, `eas.json` | Uploads can be intercepted or spoofed; we don't own the storage | Request a presigned S3 POST from the API, then upload directly over HTTPS (see website §2) |
| Denied location permission saves the note at 0,0 | `lib/hooks/useNoteLocation.ts` | Notes appear in the ocean on the map and pollute the research data | Store a null location and ask the user to pick one on the map |
| No offline support | Add-note flow | Field researchers often have poor signal, and a note is lost if a save fails | Persist drafts locally, queue uploads, retry when back online |
| No thumbnails | Library, map modals | Large originals are slow on cellular and use a lot of memory | Use the `thumbnailUri` produced by the planned Lambda |
| Types copied by hand from the API | `types.ts` | The API contract can change without the app noticing | Consume `@lrda/shared` Zod schemas |
| Website docs describe the old architecture | `lrda_website/packages/docs/mobile/architecture.md` (Redux, React Navigation, Yarn) | Misleads new contributors | Point it at this document |
| CI runs typecheck + unit tests only | `.github/workflows/Native.yml` | E2E (Maestro) is manual | Run Maestro on an emulator in CI before releases |
| Public content (about, team, resources) is duplicated from the website | `lib/screens/AboutScreen.tsx`, `TeamPage.tsx`, `ResourceScreen.tsx` | Every client content change has to be made twice | Serve the content from the API or a shared JSON file |
