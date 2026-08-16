#!/usr/bin/env bash
# infra/scripts/verify-login-theme.sh
set -euo pipefail

# Le client oei-frontend impose PKCE (S256, cf. Task 4), donc l'URL doit
# inclure un code_challenge valide pour atteindre effectivement la page de
# login (sans PKCE, Keycloak redirige avec une erreur invalid_request avant
# même de rendre le thème).
CODE_VERIFIER="abcdefghij0123456789abcdefghij0123456789abc"
CODE_CHALLENGE=$(printf '%s' "$CODE_VERIFIER" | openssl dgst -sha256 -binary | openssl base64 | tr '+/' '-_' | tr -d '=')

LOGIN_PAGE_URL="http://localhost:8081/realms/oei/protocol/openid-connect/auth?client_id=oei-frontend&response_type=code&redirect_uri=http://localhost:4300/&scope=openid&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256"

html=$(curl -sf "$LOGIN_PAGE_URL")

if ! echo "$html" | grep -q "oei.css"; then
  echo "Le thème 'oei' n'est pas appliqué (oei.css absent de la page de login)."
  exit 1
fi

echo "Le thème de login 'oei' est bien servi."
