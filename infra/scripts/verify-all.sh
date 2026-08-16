#!/usr/bin/env bash
# infra/scripts/verify-all.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/verify-structure.sh"
"$SCRIPT_DIR/verify-env.sh"
"$SCRIPT_DIR/verify-keycloak.sh"
"$SCRIPT_DIR/verify-realm.sh"
"$SCRIPT_DIR/verify-login-theme.sh"
"$SCRIPT_DIR/verify-minio.sh"
"$SCRIPT_DIR/verify-mailpit.sh"

echo "Toute l'infra locale (Keycloak, Postgres, MinIO, Mailpit) est opérationnelle."
