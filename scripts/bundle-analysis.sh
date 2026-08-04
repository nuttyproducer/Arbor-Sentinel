#!/usr/bin/env bash
# ============================================================================
# Arbor Sentinel — Bundle Analysis Script
# ============================================================================
# CI-compatible bundle check. Builds the app, parses the Vite/Rollup chunk
# report, and validates the bundle against launch performance budgets.
#
# Usage: bash scripts/bundle-analysis.sh [--ci] [--no-build]
#   --ci         Exit non-zero on any budget violation (for CI pipelines)
#   --no-build   Skip the build step; analyze an existing `dist/` directory
#                (requires scripts/build.log next to dist, or --log FILE)
#
# Exit codes:
#   0 — all budgets met
#   1 — main JS bundle too large
#   2 — total initial load too large
#   4 — no dynamic route chunks found (code splitting regressed)
#   8 — map/graph/charts not deferred
#   16 — build failed
#
# Budgets (gzipped, from M7-04 acceptance criteria):
#   main JS bundle  < 300 KB
#   total initial   < 500 KB
#
# Last reviewed: 2026-08-04 — M7-04 Performance Optimization
# ============================================================================

set -euo pipefail

CI_MODE=false
NO_BUILD=false
BUILD_LOG=""
for arg in "$@"; do
  case "$arg" in
    --ci) CI_MODE=true ;;
    --no-build) NO_BUILD=true ;;
    --log=*) BUILD_LOG="${arg#--log=}" ;;
  esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILURES=0
FLAG_MAIN=0
FLAG_TOTAL=0
FLAG_ROUTES=0
FLAG_DEFERRED=0
SCRIPT_OWNS_LOG=false

MAIN_LIMIT_KB=300
TOTAL_LIMIT_KB=500
DIST_DIR="dist"

echo "============================================"
echo " Arbor Sentinel — Bundle Analysis"
echo " CI Mode: $CI_MODE"
echo "============================================"
echo ""

# ---------------------------------------------------------------------------
# Step 0: Build (unless --no-build)
# ---------------------------------------------------------------------------
if [ "$NO_BUILD" = false ]; then
  echo "--- Step 0: Building with Vite ---"
  BUILD_LOG=$(mktemp)
  SCRIPT_OWNS_LOG=true
  # Strip ANSI colour codes so chunk lines are machine-parseable
  if ! npx vite build 2>&1 | sed -r 's/\x1b\[[0-9;]*m//g' > "$BUILD_LOG"; then
    echo -e "${RED} FAIL${NC} — vite build exited non-zero"
    rm -f "$BUILD_LOG"
    exit 16
  fi
  echo -e "${GREEN} PASS${NC} — build succeeded"
else
  if [ -z "$BUILD_LOG" ] || [ ! -f "$BUILD_LOG" ]; then
    echo -e "${RED} FAIL${NC} — --no-build requires --log=<file> (or place the build log at the given path)"
    exit 16
  fi
  echo "--- Step 0: Skipping build (--no-build) ---"
fi

if [ ! -f "$DIST_DIR/index.html" ]; then
  echo -e "${RED} FAIL${NC} — $DIST_DIR/index.html not found"
  rm -f "$BUILD_LOG"
  exit 16
fi

# ---------------------------------------------------------------------------
# Parse chunk report into "filename gzipKB" pairs
# ---------------------------------------------------------------------------
GZIP_MAP=$(mktemp)
cleanup() {
  rm -f "$GZIP_MAP"
  if [ "$SCRIPT_OWNS_LOG" = true ]; then
    rm -f "$BUILD_LOG"
  fi
}
trap cleanup EXIT

# Match lines like:  dist/assets/index-abc.js  696.58 kB │ gzip: 179.85 kB
grep -E 'assets/[A-Za-z0-9._-]+\.js' "$BUILD_LOG" \
  | grep -E 'gzip:' \
  | sed -E 's#.*assets/([A-Za-z0-9._-]+\.js) +[0-9.]+ +kB +│ +gzip: +([0-9.]+) +kB.*#\1 \2#' \
  | sort -u > "$GZIP_MAP"

# ---------------------------------------------------------------------------
# Step 1: Main JS bundle (entry chunk) — < 300 KB gzipped
# ---------------------------------------------------------------------------
echo "--- Step 1: Main JS bundle (< ${MAIN_LIMIT_KB} KB gzipped) ---"

MAIN_FILE=$(grep -oE 'src="/assets/[A-Za-z0-9._-]+\.js"' "$DIST_DIR/index.html" \
  | sed -E 's#.*/([A-Za-z0-9._-]+\.js)"#\1#' | head -1)

if [ -z "$MAIN_FILE" ]; then
  echo -e "${RED} FAIL${NC} — could not locate entry script in $DIST_DIR/index.html"
  FLAG_MAIN=1
else
  MAIN_GZ=$(awk -v f="$MAIN_FILE" '$1 == f { print $2 }' "$GZIP_MAP" | head -1)
  if [ -z "$MAIN_GZ" ]; then
    echo -e "${RED} FAIL${NC} — no gzip size found for entry chunk $MAIN_FILE"
    FLAG_MAIN=1
  else
    echo "   entry chunk: $MAIN_FILE (${MAIN_GZ} kB gzipped)"
    if awk "BEGIN { exit !($MAIN_GZ > $MAIN_LIMIT_KB) }"; then
      echo -e "${RED} FAIL${NC} — main bundle ${MAIN_GZ} kB exceeds ${MAIN_LIMIT_KB} kB"
      FLAG_MAIN=1
    else
      echo -e "${GREEN} PASS${NC} — main bundle ${MAIN_GZ} kB < ${MAIN_LIMIT_KB} kB"
    fi
  fi
fi

echo ""

# ---------------------------------------------------------------------------
# Step 2: Total initial load — < 500 KB gzipped
# ---------------------------------------------------------------------------
echo "--- Step 2: Total initial JS (< ${TOTAL_LIMIT_KB} KB gzipped) ---"

INITIAL_FILES=$(grep -oE '(src|href)="/assets/[A-Za-z0-9._-]+\.js"' "$DIST_DIR/index.html" \
  | sed -E 's#.*/([A-Za-z0-9._-]+\.js)"#\1#' | sort -u)

if [ -z "$INITIAL_FILES" ]; then
  echo -e "${RED} FAIL${NC} — no initial JS chunks found in $DIST_DIR/index.html"
  FLAG_TOTAL=1
else
  TOTAL_GZ=$(printf '%s\n' "$INITIAL_FILES" \
    | while read -r f; do awk -v f="$f" '$1 == f { print $2 }' "$GZIP_MAP"; done \
    | awk '{ s += $1 } END { printf "%.2f", s }')

  echo "   initial chunks:"
  printf '%s\n' "$INITIAL_FILES" | while read -r f; do
    size=$(awk -v f="$f" '$1 == f { print $2 }' "$GZIP_MAP" | head -1)
    echo "     $f — ${size:-?} kB gzipped"
  done
  echo "   total: ${TOTAL_GZ} kB gzipped"

  if awk "BEGIN { exit !($TOTAL_GZ > $TOTAL_LIMIT_KB) }"; then
    echo -e "${RED} FAIL${NC} — initial load ${TOTAL_GZ} kB exceeds ${TOTAL_LIMIT_KB} kB"
    FLAG_TOTAL=1
  else
    echo -e "${GREEN} PASS${NC} — initial load ${TOTAL_GZ} kB < ${TOTAL_LIMIT_KB} kB"
  fi
fi

echo ""

# ---------------------------------------------------------------------------
# Step 3: Dynamic route chunks present
# ---------------------------------------------------------------------------
echo "--- Step 3: Route-level code splitting ---"

ALL_JS=$(awk '{ print $1 }' "$GZIP_MAP" | sort -u)
DEFERRED_JS=$(comm -13 <(printf '%s\n' "$INITIAL_FILES" | sort) <(printf '%s\n' "$ALL_JS"))
ROUTE_COUNT=$(printf '%s\n' "$DEFERRED_JS" | grep -cE '\.js$' || true)

echo "   deferred chunks: $ROUTE_COUNT (route pages + heavy vendor libs)"
if [ "$ROUTE_COUNT" -lt 10 ]; then
  echo -e "${RED} FAIL${NC} — expected a healthy set of dynamic route chunks, found only $ROUTE_COUNT"
  FLAG_ROUTES=1
else
  echo -e "${GREEN} PASS${NC} — $ROUTE_COUNT deferred chunks (routes lazy-loaded)"
fi

echo ""

# ---------------------------------------------------------------------------
# Step 4: Heavy vendor libs deferred (map / charts / graph)
# ---------------------------------------------------------------------------
echo "--- Step 4: Heavy vendor libs deferred ---"

for LIB in vendor-map vendor-charts vendor-graph; do
  if printf '%s\n' "$INITIAL_FILES" | grep -q "^${LIB}-"; then
    echo -e "${RED} FAIL${NC} — ${LIB} is in the initial load"
    FLAG_DEFERRED=1
  else
    chunk=$(printf '%s\n' "$DEFERRED_JS" | grep "^${LIB}-" | head -1)
    if [ -n "$chunk" ]; then
      echo -e "${GREEN} PASS${NC} — ${LIB} deferred (${chunk})"
    else
      echo -e "${YELLOW} WARN${NC} — ${LIB} chunk not found (may not be bundled)"
    fi
  fi
done

echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo "============================================"
echo " Bundle Analysis Summary"
echo "============================================"

if [ "$FLAG_MAIN" -eq 0 ] && [ "$FLAG_TOTAL" -eq 0 ] && [ "$FLAG_ROUTES" -eq 0 ] && [ "$FLAG_DEFERRED" -eq 0 ]; then
  echo -e "${GREEN} ALL BUDGETS MET${NC}"
  EXIT_CODE=0
else
  EXIT_CODE=$((FLAG_MAIN * 1 + FLAG_TOTAL * 2 + FLAG_ROUTES * 4 + FLAG_DEFERRED * 8))
  echo -e "${RED} BUDGET VIOLATIONS (exit code: $EXIT_CODE)${NC}"
  [ "$FLAG_MAIN" -ne 0 ] && echo "   Main bundle exceeds ${MAIN_LIMIT_KB} kB"
  [ "$FLAG_TOTAL" -ne 0 ] && echo "   Initial load exceeds ${TOTAL_LIMIT_KB} kB"
  [ "$FLAG_ROUTES" -ne 0 ] && echo "   Route code splitting missing"
  [ "$FLAG_DEFERRED" -ne 0 ] && echo "   Heavy vendor libs in initial load"
fi

echo ""
echo "Bundle report written to: $DIST_DIR/stats.html (open in a browser)"

exit "$EXIT_CODE"
