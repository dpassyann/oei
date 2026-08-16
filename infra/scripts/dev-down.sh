#!/usr/bin/env bash
# infra/scripts/dev-down.sh
# Usage: ./dev-down.sh [--obs]
#   --obs  arrête aussi les services du profil observabilité
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

OBS=false
for arg in "$@"; do
  [[ "$arg" == "--obs" ]] && OBS=true
done

PROFILE_ARGS=()
if [ "$OBS" = true ]; then
  PROFILE_ARGS=(--profile obs)
fi

if [ "$OBS" = true ]; then
  docker compose --env-file "$INFRA_DIR/.env" -f "$INFRA_DIR/docker-compose.yml" --profile obs down
else
  docker compose --env-file "$INFRA_DIR/.env" -f "$INFRA_DIR/docker-compose.yml" down
fi
