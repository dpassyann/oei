#!/usr/bin/env bash
# infra/scripts/verify-structure.sh
set -euo pipefail

REQUIRED_PATHS=(
  "content/fr" "content/en" "content/de" "content/es" "content/it" "content/pt"
  "frontend" "backend"
  "keycloak/realm-export" "keycloak/themes"
  "infra/scripts"
)

missing=0
for path in "${REQUIRED_PATHS[@]}"; do
  if [ ! -d "$path" ]; then
    echo "MANQUANT: $path"
    missing=1
  fi
done

if [ "$missing" -eq 1 ]; then
  echo "Structure incomplète."
  exit 1
fi

echo "Structure du monorepo OK."
