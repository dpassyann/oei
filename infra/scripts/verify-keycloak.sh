#!/usr/bin/env bash
# infra/scripts/verify-keycloak.sh
set -euo pipefail

URL="http://localhost:8081/health/ready"

if ! curl -sf "$URL" > /dev/null; then
  echo "Keycloak ne répond pas sur $URL"
  exit 1
fi

echo "Keycloak est UP ($URL)."
