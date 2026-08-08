# Android Google Maps Key Rotation (deferred)

Status as of 2026-08-08: **not done**. The Android app currently ships a revoked
Google Maps key, so the map tab is broken for all installed copies until the
steps below are completed.

## Background

In July 2026 the shared Google Maps API key (used by both the website and this
app) was scraped and abused by third parties, running up Places API charges on
the `lrda-75cf4` GCP project. All old keys were revoked on 2026-08-08. The
website now uses two locked-down keys (a referrer-restricted browser key for
map tiles and an IP-restricted server key behind an API proxy at
`/api/places/*`). The Android app needs its own key; iOS uses Apple Maps and
needs nothing.

The key baked into published APKs is extractable by anyone, which is the likely
leak vector. The fix is an Android-restricted key: it only works when the call
comes from an app with a matching package name AND signing-certificate SHA-1,
and it is limited to Maps SDK for Android (whose map loads are free), so a
scraped copy is useless and cannot generate charges.

## Steps

1. In GCP Console (project `lrda-75cf4`) enable **Maps SDK for Android**
   (APIs & Services -> Library) if it is not already enabled.
2. APIs & Services -> Credentials -> Create credentials -> API key. Edit it:
   - Application restrictions -> **Android apps** -> add an entry per
     certificate below (package name + SHA-1).
   - API restrictions -> Restrict key -> **Maps SDK for Android** only.
3. Put the key in `eas.json` under `MAP_API_KEY`, replacing the
   `REPLACE_WITH_ANDROID_RESTRICTED_KEY` placeholder (safe to commit once
   restricted), bump `versionCode` in `app.config.js`, then
   `eas build -p android` and submit.

Note: on 2026-08-08 the `eas.json` production env was also updated for the
Better Auth / PostgreSQL migration -- it now sets `AUTH_API_URL` and
`API_BASE_URL` to `https://api.wheresreligion.org` and drops the unused
Firebase variables (the old Firebase key was revoked in the same incident).
The next production build is therefore the migrated app; verify the mobile
migration is release-ready before submitting.

## Certificate entries

Package name for every entry: `register.edu.slu.cs.oss.lrda`

| Certificate | SHA-1 | How to get it |
| --- | --- | --- |
| Local debug keystore | `E8:F2:D7:E4:DA:8B:58:87:57:B3:9C:79:19:6F:58:F6:6E:BA:44:A1` | Already extracted (from `~/.android/debug.keystore` on Jacob's machine). Covers `expo run:android` dev builds. |
| EAS build keystore | (run command) | `npx eas-cli@latest credentials -p android`, select Android -> production; covers APKs installed directly from EAS. |
| Play App Signing key | (blocked on console access) | See below. Covers everything installed from the Play Store -- the one that matters for real users. |

## Getting the Play App Signing SHA-1 (no Play Console access yet)

Google re-signs the app on delivery, so Play installs do not use the EAS
keystore signature. Options:

- Ask whoever at SLU administers the Play listing to read it from
  Play Console -> Test and release -> Setup -> App signing ("App signing key
  certificate" SHA-1). Any viewer role can see it; it is not sensitive.
- Or extract it from any device with the app installed from Play:
  `adb shell pm path register.edu.slu.cs.oss.lrda`, `adb pull <path>`, then
  `keytool -printcert -jarfile <apk>`.

## Important: no rebuild needed for the Play SHA-1

The SHA-1 restriction lives on the key in GCP, not in the app. Ship the new
build with the key as soon as the key exists (with just the debug and EAS
entries); when the Play App Signing SHA-1 is added to the key later, maps start
working immediately for every already-installed copy of that build.
