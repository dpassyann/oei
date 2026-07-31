#!/usr/bin/env bash
# infra/scripts/verify-minio.sh
set -euo pipefail

if ! curl -sf "http://localhost:9000/minio/health/live" > /dev/null; then
  echo "MinIO ne répond pas sur http://localhost:9000"
  exit 1
fi

# Le bucket public doit être listable anonymement (politique 'download').
if ! curl -sf "http://localhost:9000/oei-public/" > /dev/null; then
  echo "Bucket 'oei-public' absent ou non accessible publiquement."
  exit 1
fi

# Le bucket privé doit exister mais refuser l'accès anonyme (403/401 attendu, pas 404).
status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:9000/oei-membership/")
if [ "$status" = "404" ]; then
  echo "Bucket 'oei-membership' n'existe pas (404)."
  exit 1
fi

echo "MinIO est UP, buckets 'oei-public' et 'oei-membership' présents."
