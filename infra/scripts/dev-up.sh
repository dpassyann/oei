#!/usr/bin/env bash
# infra/scripts/dev-up.sh
# Usage: ./dev-up.sh [--obs]
#   --obs  démarre aussi le profil observabilité (Grafana, Prometheus, Loki, Promtail, pgAdmin, Mailpit)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

OBS=false
for arg in "$@"; do
  [[ "$arg" == "--obs" ]] && OBS=true
done

if [ ! -f "$INFRA_DIR/.env" ]; then
  echo "infra/.env introuvable — copie infra/.env.example vers infra/.env et adapte les valeurs."
  exit 1
fi

PROFILE_ARGS=()
if [ "$OBS" = true ]; then
  PROFILE_ARGS=(--profile obs)
  echo "Mode observabilité activé : Grafana (3000), Prometheus (9090), Loki (3100), pgAdmin (5050), Mailpit (8025)."
fi

docker compose --env-file "$INFRA_DIR/.env" -f "$INFRA_DIR/docker-compose.yml" "${PROFILE_ARGS[@]}" up -d

echo "Attente de la disponibilité des services (Keycloak peut prendre 30-60s à froid)..."
attempts=0
max_attempts=18
verify_log="$(mktemp "${TMPDIR:-/tmp}/oei-verify-all.XXXXXX")"
trap 'rm -f "$verify_log"' EXIT
until "$SCRIPT_DIR/verify-all.sh" > "$verify_log" 2>&1; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge "$max_attempts" ]; then
    echo "Les services ne sont toujours pas prêts après $((max_attempts * 5))s. Dernier résultat :"
    cat "$verify_log"
    exit 1
  fi
  sleep 5
done
cat "$verify_log"
