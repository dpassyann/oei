#!/usr/bin/env bash
# infra/scripts/verify-env.sh
set -euo pipefail

REQUIRED_KEYS=(
  OEI_USER OEI_PASSWORD
  POSTGRES_DB
  MINIO_ROOT_USER
)

ENV_EXAMPLE="infra/.env.example"

if [ ! -f "$ENV_EXAMPLE" ]; then
  echo "MANQUANT: $ENV_EXAMPLE"
  exit 1
fi

missing=0
for key in "${REQUIRED_KEYS[@]}"; do
  if ! grep -q "^${key}=" "$ENV_EXAMPLE"; then
    echo "Clé manquante dans ${ENV_EXAMPLE}: ${key}"
    missing=1
  fi
done

if [ "$missing" -eq 1 ]; then
  exit 1
fi

echo "infra/.env.example contient toutes les clés requises."
