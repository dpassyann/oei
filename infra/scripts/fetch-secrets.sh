#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_FILE="${1:-$INFRA_DIR/.env}"
SSM_PREFIX="${SSM_PREFIX:-/oei/prod}"
AWS_REGION="${AWS_REGION:-eu-west-3}"
TMP_FILE="$(mktemp)"

cleanup() {
  rm -f "$TMP_FILE"
}
trap cleanup EXIT

mapfile -t PARAMS < <(
  aws ssm get-parameters-by-path \
    --region "$AWS_REGION" \
    --path "$SSM_PREFIX" \
    --with-decryption \
    --recursive \
    --query 'Parameters[*].[Name,Value]' \
    --output text | sort
)

if [ "${#PARAMS[@]}" -eq 0 ]; then
  echo "Aucun paramètre SSM trouvé sous $SSM_PREFIX dans $AWS_REGION" >&2
  exit 1
fi

for row in "${PARAMS[@]}"; do
  name="${row%%$'\t'*}"
  value="${row#*$'\t'}"
  key="${name##*/}"
  printf '%s=%s\n' "$key" "$value" >> "$TMP_FILE"
done

mv "$TMP_FILE" "$OUTPUT_FILE"
chmod 600 "$OUTPUT_FILE"

echo "Secrets SSM exportés vers $OUTPUT_FILE"

