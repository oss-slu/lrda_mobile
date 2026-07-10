#!/usr/bin/env bash
# Preflight checks + run the Maestro E2E suite.
#
# Usage:
#   pnpm e2e              run the full suite (.maestro/)
#   pnpm e2e nav_tabs     run a single flow by name
#
# Automates the setup steps that otherwise silently break flows: backend
# health, simulator boot, hardware-keyboard setting, GPS fix (resets on
# every simulator reboot), Metro health, and a warm app launch.
set -euo pipefail

cd "$(dirname "$0")/.."

APP_ID="register.edu.slu.cs.oss.lrda"
SIM_LOCATION="38.6357,-90.2340"
API_HEALTH="http://localhost:3002/api/health"
METRO_STATUS="http://localhost:8081/status"
METRO_LOG="/tmp/lrda-metro.log"

fail() { printf '\033[31m✖ %s\033[0m\n' "$*"; exit 1; }
ok()   { printf '\033[32m✔ %s\033[0m\n' "$*"; }

# 1. Backend API (run from the sibling lrda_website repo)
curl -sf -m 3 "$API_HEALTH" > /dev/null \
  || fail "Backend not responding at $API_HEALTH. In lrda_website: pnpm api:docker:up && pnpm dev:api"
ok "Backend API healthy"

# 2. Simulator booted
if ! xcrun simctl list devices booted | grep -q Booted; then
  echo "No booted simulator; booting the first available iPhone..."
  UDID=$(xcrun simctl list devices available | grep iPhone | grep -m1 -oE '[0-9A-F-]{36}')
  [ -n "$UDID" ] || fail "No available iPhone simulator found"
  xcrun simctl boot "$UDID"
  open -a Simulator
  sleep 10
fi
ok "Simulator booted"

# 3. Hardware keyboard must be off or simulated typing never lands
HK=$(defaults read com.apple.iphonesimulator ConnectHardwareKeyboard 2>/dev/null || echo unset)
if [ "$HK" != "0" ]; then
  defaults write com.apple.iphonesimulator ConnectHardwareKeyboard -bool false
  fail "ConnectHardwareKeyboard was on; turned it off. Quit and reopen Simulator.app, then rerun."
fi
ok "Hardware keyboard off"

# 4. GPS fix (silently resets on simulator reboot)
xcrun simctl location booted set "$SIM_LOCATION"
ok "GPS fix set ($SIM_LOCATION)"

# 5. Metro dev server
if ! curl -sf -m 2 "$METRO_STATUS" | grep -q running; then
  echo "Metro not running; starting (log: $METRO_LOG)..."
  nohup pnpm start > "$METRO_LOG" 2>&1 &
  for _ in $(seq 1 30); do
    curl -sf -m 2 "$METRO_STATUS" 2>/dev/null | grep -q running && break
    sleep 2
  done
  curl -sf -m 2 "$METRO_STATUS" | grep -q running || fail "Metro failed to start; see $METRO_LOG"
fi
ok "Metro running"

# 6. Fresh app launch so the first flow doesn't pay the bundle-build wait
xcrun simctl terminate booted "$APP_ID" 2>/dev/null || true
xcrun simctl launch booted "$APP_ID" > /dev/null \
  || fail "App $APP_ID is not installed on the simulator. Run: pnpm ios"
echo "Warming up the app bundle..."
sleep 15
ok "App launched"

# 7. Run Maestro
if [ $# -gt 0 ]; then
  exec maestro test ".maestro/$1.yaml"
fi
exec maestro test .maestro/
