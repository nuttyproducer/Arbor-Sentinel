#!/usr/bin/env bash
# ============================================================================
# Arbor Sentinel — Security Audit Script
# ============================================================================
# CI-compatible security audit. Runs dependency audit, checks security
# headers in built output, scans for exposed secrets, and validates CSP.
#
# Usage: bash scripts/security-audit.sh [--ci]
#   --ci    Exit non-zero on any finding (for CI pipelines)
#
# Exit codes:
#   0 — clean (all checks pass)
#   1 — dependency vulnerabilities found (critical or high)
#   2 — security header issues found
#   3 — potential secrets found
#   4 — mixed findings (bitmask: 1|2|3 = 7, etc.)
#
# Last reviewed: 2026-08-04 — M7-03 Security Hardening
# ============================================================================

set -euo pipefail

CI_MODE=false
if [ "${1:-}" = "--ci" ]; then
  CI_MODE=true
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILURES=0
FLAG_AUDIT=0
FLAG_HEADERS=0
FLAG_SECRETS=0

echo "============================================"
echo " Arbor Sentinel — Security Audit"
echo " CI Mode: $CI_MODE"
echo "============================================"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Dependency Audit
# ---------------------------------------------------------------------------
echo "--- Step 1: Dependency Audit (npm audit) ---"

AUDIT_OUTPUT=$(npm audit --json 2>&1) || true
AUDIT_EXIT=$?

if [ "$AUDIT_EXIT" -ne 0 ]; then
  # Parse the JSON output for vulnerability counts
  CRITICAL=$(echo "$AUDIT_OUTPUT" | node -e "
    try {
      const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
      const crit = Object.values(d.vulnerabilities || {}).filter(v => v.severity === 'critical').length;
      const high = Object.values(d.vulnerabilities || {}).filter(v => v.severity === 'high').length;
      console.log(crit + ' ' + high);
    } catch(e) { console.log('? ?'); }
  " 2>/dev/null || echo "? ?")

  CRIT_COUNT=$(echo "$CRITICAL" | cut -d' ' -f1)
  HIGH_COUNT=$(echo "$CRITICAL" | cut -d' ' -f2)

  echo -e "${RED} FAIL${NC} — Critical: $CRIT_COUNT, High: $HIGH_COUNT"

  if [ "$CRIT_COUNT" != "0" ] && [ "$CRIT_COUNT" != "?" ]; then
    echo "   Critical vulnerabilities must be fixed before launch."
    FLAG_AUDIT=1
  fi

  if [ "$HIGH_COUNT" != "0" ] && [ "$HIGH_COUNT" != "?" ]; then
    echo "   High vulnerabilities must be reviewed and documented."
    if [ "$CI_MODE" = true ]; then
      FLAG_AUDIT=1
    else
      echo "   (non-CI mode: warning only; use --ci to enforce)"
    fi
  fi
else
  echo -e "${GREEN} PASS${NC} — No vulnerabilities found"
fi

echo ""

# ---------------------------------------------------------------------------
# Step 2: Security Headers Check
# ---------------------------------------------------------------------------
echo "--- Step 2: Security Headers ---"

# Check _headers file for required directives
HEADERS_FILE="public/_headers"
REQUIRED_HEADERS=(
  "Content-Security-Policy"
  "Strict-Transport-Security"
  "X-Content-Type-Options"
  "Referrer-Policy"
  "Permissions-Policy"
)

HEADER_ISSUES=0
for header in "${REQUIRED_HEADERS[@]}"; do
  if grep -q "$header" "$HEADERS_FILE" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $header"
  else
    echo -e "  ${RED}✗${NC} $header — MISSING from $HEADERS_FILE"
    HEADER_ISSUES=$((HEADER_ISSUES + 1))
  fi
done

# Check for upgrade-insecure-requests in CSP
if grep -q "upgrade-insecure-requests" "$HEADERS_FILE"; then
  echo -e "  ${GREEN}✓${NC} upgrade-insecure-requests"
else
  echo -e "  ${YELLOW}⚠${NC} upgrade-insecure-requests — not found in CSP"
  HEADER_ISSUES=$((HEADER_ISSUES + 1))
fi

# Check for frame-ancestors
if grep -q "frame-ancestors" "$HEADERS_FILE"; then
  echo -e "  ${GREEN}✓${NC} frame-ancestors"
else
  echo -e "  ${RED}✗${NC} frame-ancestors — MISSING"
  HEADER_ISSUES=$((HEADER_ISSUES + 1))
fi

# Check index.html CSP meta tag
if grep -q "upgrade-insecure-requests" "index.html"; then
  echo -e "  ${GREEN}✓${NC} CSP meta tag in index.html"
else
  echo -e "  ${YELLOW}⚠${NC} CSP meta tag may be out of sync with _headers"
  HEADER_ISSUES=$((HEADER_ISSUES + 1))
fi

if [ "$HEADER_ISSUES" -gt 0 ]; then
  echo -e "${RED} FAIL${NC} — $HEADER_ISSUES header issue(s) found"
  FLAG_HEADERS=1
else
  echo -e "${GREEN} PASS${NC} — All security headers present"
fi

echo ""

# ---------------------------------------------------------------------------
# Step 3: Secret Scanning
# ---------------------------------------------------------------------------
echo "--- Step 3: Secret Scanning ---"

SECRET_PATTERNS=(
  "sk-[a-zA-Z0-9]{32,}"           # OpenAI/API keys
  "eyJ[a-zA-Z0-9_-]{20,}"         # JWT tokens (Supabase keys)
  "sbp_[a-zA-Z0-9]{32,}"          # Supabase service keys
  "supabase_service_role_key"     # Service role key references
)

SECRET_FINDS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
  # Search staged and working-tree files, exclude .env.example and node_modules
  MATCHES=$(git grep -n "$pattern" -- ':!.env.example' ':!node_modules' ':!dist' ':!.git' ':!scripts/security-audit.sh' 2>/dev/null | grep -v "VITE_SUPABASE" | grep -v "ANON_KEY" || true)
  if [ -n "$MATCHES" ]; then
    echo -e "  ${RED}✗${NC} Potential secret found matching: $pattern"
    echo "$MATCHES" | while IFS= read -r line; do
      echo "      $line"
    done
    SECRET_FINDS=$((SECRET_FINDS + 1))
  else
    echo -e "  ${GREEN}✓${NC} No matches for: $pattern"
  fi
done

if [ "$SECRET_FINDS" -gt 0 ]; then
  echo -e "${RED} FAIL${NC} — $SECRET_FINDS potential secret(s) found"
  FLAG_SECRETS=1
else
  echo -e "${GREEN} PASS${NC} — No exposed secrets detected"
fi

echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo "============================================"
echo " Security Audit Summary"
echo "============================================"

if [ "$FLAG_AUDIT" -eq 0 ] && [ "$FLAG_HEADERS" -eq 0 ] && [ "$FLAG_SECRETS" -eq 0 ]; then
  echo -e "${GREEN} ALL CHECKS PASSED${NC}"
  EXIT_CODE=0
else
  EXIT_CODE=$((FLAG_AUDIT * 1 + FLAG_HEADERS * 2 + FLAG_SECRETS * 4))
  echo -e "${RED} ISSUES FOUND (exit code: $EXIT_CODE)${NC}"

  if [ "$FLAG_AUDIT" -ne 0 ]; then
    echo "   Dependencies: vulnerabilities found"
  fi
  if [ "$FLAG_HEADERS" -ne 0 ]; then
    echo "   Headers: issues detected"
  fi
  if [ "$FLAG_SECRETS" -ne 0 ]; then
    echo "   Secrets: potential exposures found"
  fi
fi

exit "$EXIT_CODE"
