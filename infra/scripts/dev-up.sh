#!/usr/bin/env bash
# infra/scripts/dev-up.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

if [ ! -f "$INFRA_DIR/.env" ]; then
  echo "infra/.env introuvable — copie infra/.env.example vers infra/.env et adapte les valeurs."
  exit 1
fi

docker compose --env-file "$INFRA_DIR/.env" -f "$INFRA_DIR/docker-compose.yml" up -d

echo "Attente de la disponibilité des services..."
sleep 5
"$SCRIPT_DIR/verify-all.sh"
