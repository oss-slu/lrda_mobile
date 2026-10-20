# System Design Checkpoint — Context (Mobile)

**Artifacts:** [`mobile-design.md`](./mobile-design.md) (6 diagrams) · Shared backend, ERD and note lifecycle: [`lrda_website/docs/design/system-design.md`](https://github.com/oss-slu/lrda_website/blob/main/docs/design/system-design.md)
**Source format:** Mermaid inside Markdown, stored in the repo so the diagrams are versioned with the code and render on GitHub. To edit one, paste it into [mermaid.live](https://mermaid.live).

## What we created and why

The mobile app is a **thin field-capture client** for a shared API. The backend diagrams already live in the website repo, so this set covers only what is specific to mobile:

| Artifact | Why this type |
|---|---|
| Mobile in the system (C4-style) | Shows exactly which services the app talks to, and how auth differs from web |
| Startup and navigation gating (UML state) | Onboarding, auth and the app tabs are gated by route guards, and those guards are the source of most "why am I on this screen" bugs |
| Information architecture | Shows the full screen map, including hidden tabs (add-note, edit-note) that don't appear in the tab bar |
| Module layers | Gives new contributors a dependency rule: screens → hooks/stores → I/O, never the reverse |
| Field capture user flow | The app's core job. It also shows the two failure paths field researchers actually hit |
| Build and release | Explains when a fix can ship over the air and when it needs a store build |

## Key decisions and trade-offs illustrated

- **Expo managed workflow + EAS.** Over-the-air updates ship JavaScript fixes without store review. Native changes still need a full build and review cycle.
- **Declarative route guards (`Stack.Protected`).** It's impossible to reach the tabs without a session. The trade-off is that the app shows nothing while the session is being restored.
- **Bearer token in SecureStore** rather than cookies. This works with React Native's networking, but the client has to manage tokens itself.
- **Zustand + TanStack Query instead of Redux** (migrated). Less boilerplate, but nothing is persisted offline today.

## Current vs. intended state

| Area | Current | Intended |
|---|---|---|
| Media upload | Plain-HTTP RERUM proxy, base64 on iOS | Presigned S3 POST over HTTPS, with thumbnails |
| No location permission | Note saved at 0,0 | Null location; user drops a pin |
| Connectivity | Save fails while offline | Local drafts with a retry queue |
| API types | Hand-copied `types.ts` | Imported from `@lrda/shared` |
| Public content (about, team, resources) | Duplicated from the website | Served from one shared source |

## How these inform development

1. **Highest priority:** the 0,0 location bug and the plain-HTTP uploads (§5, §7). Both corrupt or expose research data.
2. **Offline drafts** matter because field sites often have poor signal. §5 shows where the queue plugs in.
3. **Client content requests** (about, team, resources) change both repos. The IA in §3 shows which screens.
4. **Maintenance rule:** a PR that adds a screen, a store or an external call must update the matching diagram in the same PR.
