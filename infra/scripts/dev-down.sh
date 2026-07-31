#!/usr/bin/env bash
# infra/scripts/dev-down.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

docker compose --env-file "$INFRA_DIR/.env" -f "$INFRA_DIR/docker-compose.yml" down
