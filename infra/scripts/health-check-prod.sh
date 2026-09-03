#!/usr/bin/env bash
# infra/scripts/health-check-prod.sh
#
# Diagnostic rapide de toute la chaîne de production en ~30 secondes.
# Usage :
#   ./health-check-prod.sh              # vérifie tout
#   ./health-check-prod.sh --api-only   # API backend seulement
#   ./health-check-prod.sh --front-only # CloudFront + SPA seulement
#
# Codes de sortie :
#   0 = tout OK
#   1 = au moins un test a échoué (voir les ✗ dans la sortie)
#
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="theitorder.global"
API="https://api.${DOMAIN}"
WWW="https://www.${DOMAIN}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
RESET='\033[0m'

FAIL=0

ok()   { echo -e "  ${GREEN}✓${RESET} $*"; }
fail() { echo -e "  ${RED}✗${RESET} $*"; FAIL=1; }
info() { echo -e "  ${YELLOW}→${RESET} $*"; }
section() { echo -e "\n${BOLD}$*${RESET}"; }

# ── Helpers ───────────────────────────────────────────────────────────────────

# http_check <label> <url> <expected_status> [<body_pattern>]
http_check() {
  local label="$1" url="$2" expected_status="$3" pattern="${4:-}"
  local response status body

  response=$(curl --silent --max-time 10 --write-out "\n%{http_code}" "$url" 2>&1) || {
    fail "${label}: curl failed (unreachable?)"
    return
  }

  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n -1)

  if [ "$status" != "$expected_status" ]; then
    fail "${label}: expected HTTP ${expected_status}, got ${status}"
    info "URL: ${url}"
    info "Body (first 200 chars): ${body:0:200}"
    return
  fi

  if [ -n "$pattern" ] && ! echo "$body" | grep -q "$pattern"; then
    fail "${label}: HTTP ${status} but response body does not match '${pattern}'"
    info "Body (first 200 chars): ${body:0:200}"
    return
  fi

  ok "${label}: HTTP ${status}"
}

# cors_check <label> <url>
cors_check() {
  local label="$1" url="$2"
  local header
  header=$(curl --silent --max-time 10 -I \
    -H "Origin: ${WWW}" \
    -H "Access-Control-Request-Method: GET" \
    "$url" | grep -i "access-control-allow-origin" || true)

  if [ -z "$header" ]; then
    fail "${label}: no Access-Control-Allow-Origin header"
  else
    ok "${label}: CORS header present — ${header}"
  fi
}

# ── Mode ──────────────────────────────────────────────────────────────────────
MODE="all"
[ "${1:-}" = "--api-only" ]   && MODE="api"
[ "${1:-}" = "--front-only" ] && MODE="front"

# ── 1. CloudFront / SPA ───────────────────────────────────────────────────────
if [ "$MODE" = "all" ] || [ "$MODE" = "front" ]; then
  section "1 · CloudFront + SPA Angular"

  http_check "Racine www (200)"                "${WWW}/"              200 "<app-root"
  http_check "Deeplink /certifications (200)"  "${WWW}/certifications" 200 "<app-root"
  http_check "Deeplink /neural-network (200)"  "${WWW}/neural-network" 200 "<app-root"
  http_check "Deeplink /vision (200)"          "${WWW}/vision"         200 "<app-root"
  http_check "Deeplink /white-papers (200)"    "${WWW}/white-papers"   200 "<app-root"

  # index.html ne doit PAS avoir un cache immutable
  section "1b · Cache-Control index.html"
  CACHE_HDR=$(curl --silent --max-time 10 -I "${WWW}/index.html" | grep -i cache-control || true)
  if echo "$CACHE_HDR" | grep -qi "no-cache\|no-store\|max-age=0"; then
    ok "index.html cache-control: ${CACHE_HDR}"
  else
    fail "index.html cache-control trop long (redéploiement invisible) : ${CACHE_HDR}"
  fi
fi

# ── 2. API backend via Caddy ─────────────────────────────────────────────────
if [ "$MODE" = "all" ] || [ "$MODE" = "api" ]; then
  section "2 · API backend (Caddy → Spring Boot)"

  http_check "Backend healthcheck"              "${API}/actuator/health"                         200 '"status":"UP"'
  http_check "Content API home (en)"            "${API}/content/en/home"                         200
  http_check "Public API certifications"        "${API}/api/public/v1/recognized-certifications" 200
  cors_check "CORS certifications"              "${API}/api/public/v1/recognized-certifications"
fi

# ── 3. Keycloak ───────────────────────────────────────────────────────────────
if [ "$MODE" = "all" ]; then
  section "3 · Keycloak"

  http_check "Keycloak health"  "https://auth.${DOMAIN}/health/ready" 200 '"status":"UP"'
  http_check "Realm OEI OIDC"   "https://auth.${DOMAIN}/realms/oei/.well-known/openid-configuration" 200 '"issuer"'
fi

# ── Résumé ────────────────────────────────────────────────────────────────────
echo ""
if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}Tous les tests sont OK ✓${RESET}"
else
  echo -e "${RED}${BOLD}Des tests ont échoué — voir les ✗ ci-dessus.${RESET}"
  echo ""
  echo -e "  Pistes de diagnostic :"
  echo -e "  • 403 sur les deeplinks → ${YELLOW}terraform apply${RESET} (custom_error_response 403 CloudFront)"
  echo -e "  • 502 API             → ${YELLOW}docker compose -f infra/docker-compose.prod.yml logs backend --tail=50${RESET}"
  echo -e "  • CORS absent         → ${YELLOW}vérifier Spring Boot CORS ou Caddy header${RESET}"
  echo -e "  • Keycloak KO         → ${YELLOW}docker compose logs keycloak --tail=50${RESET}"
  exit 1
fi

