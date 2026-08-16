#!/usr/bin/env bash
# infra/scripts/verify-mailpit.sh
set -euo pipefail

INFO_URL="http://localhost:8025/api/v1/info"

if ! curl -sf "$INFO_URL" > /dev/null; then
  echo "Mailpit ne répond pas sur $INFO_URL"
  exit 1
fi

echo "Mailpit est UP ($INFO_URL)."

