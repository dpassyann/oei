#!/usr/bin/env bash
# infra/scripts/verify-env.sh
set -euo pipefail

REQUIRED_KEYS=(
  POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB
  KEYCLOAK_ADMIN KEYCLOAK_ADMIN_PASSWORD
  MINIO_ROOT_USER MINIO_ROOT_PASSWORD
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
