#!/usr/bin/env bash
# infra/scripts/build-keycloak-extensions.sh
# Compile toutes les extensions Keycloak custom (SPI Java, sous keycloak/extensions/*)
# et copie les jars produits dans keycloak/providers/, qui est monté par docker-compose
# dans /opt/keycloak/providers. `start-dev`/`start` détectent le changement et
# reconstruisent automatiquement le serveur au prochain démarrage (`docker compose up
# --force-recreate keycloak` ou redémarrage du conteneur).
#
# Prérequis : Java 17+ et Maven (brew install maven), une extension = un module Maven
# autonome sous keycloak/extensions/<nom>/pom.xml.
#
# Usage : ./build-keycloak-extensions.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYCLOAK_DIR="$(cd "$SCRIPT_DIR/../../keycloak" && pwd)"
EXTENSIONS_DIR="$KEYCLOAK_DIR/extensions"
PROVIDERS_DIR="$KEYCLOAK_DIR/providers"

if ! command -v mvn >/dev/null 2>&1; then
  echo "Maven introuvable. Installe-le avec : brew install maven"
  exit 1
fi

mkdir -p "$PROVIDERS_DIR"

shopt -s nullglob
for module in "$EXTENSIONS_DIR"/*/pom.xml; do
  module_dir="$(dirname "$module")"
  echo "== Build $(basename "$module_dir") =="
  mvn -f "$module" -q -DskipTests package
  cp "$module_dir"/target/*.jar "$PROVIDERS_DIR/"
done
shopt -u nullglob

echo "Jars copiés dans $PROVIDERS_DIR :"
ls -la "$PROVIDERS_DIR"/*.jar 2>/dev/null || echo "(aucune extension trouvée sous $EXTENSIONS_DIR)"
