#!/usr/bin/env bash
# infra/scripts/verify-realm.sh
set -euo pipefail

REALM_URL="http://localhost:8081/realms/oei/.well-known/openid-configuration"

if ! curl -sf "$REALM_URL" > /dev/null; then
  echo "Realm 'oei' introuvable sur $REALM_URL"
  exit 1
fi

echo "Realm 'oei' est actif."
