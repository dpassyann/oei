# Infra locale (Keycloak, Postgres, MinIO) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire tourner en local, via `docker-compose`, une infrastructure complète Keycloak (realm + rôles + thème de login personnalisé) + Postgres + MinIO (buckets publics/privés), vérifiable de bout en bout par des scripts de contrôle, sans toucher au code applicatif frontend/backend.

**Architecture:** Un unique `infra/docker-compose.yml` orchestre 4 services (`postgres`, `keycloak`, `minio`, `minio-init`). Le realm Keycloak est importé automatiquement au démarrage depuis un fichier JSON versionné (`keycloak/realm-export/oei-realm.json`), qui inclut déjà la référence au thème de login personnalisé. Les buckets MinIO sont créés par un conteneur `mc` one-shot qui s'exécute une fois puis s'arrête. Chaque service est vérifié par un script bash indépendant qui interroge son API (pas de test applicatif, puisqu'il n'y a pas encore de code métier — le "test" ici est la vérification opérationnelle du service).

**Tech Stack:** Docker Compose v2, Keycloak (image `quay.io/keycloak/keycloak:25.0`), PostgreSQL 16, MinIO + MinIO Client (`mc`), bash, `curl`, `jq`.

## Global Constraints

- Scope strictement local — pas d'AWS/EC2/Traefik dans ce plan (traité dans un plan ultérieur).
- Nom du realm Keycloak : `oei`.
- Rôles realm Keycloak : `member`, `admin`.
- Buckets MinIO : `oei-public` (lecture anonyme), `oei-membership` (privé).
- Aucun secret en clair dans git : tout mot de passe/clé passe par `infra/.env`, qui est gitignoré ; seul `infra/.env.example` (valeurs factices) est versionné.
- Palette du thème de login Keycloak : bleu nuit `#0a1e3f` (fond), doré `#e8a530` (accents/boutons) — reprise de la maquette `.prompt/maquetteUI.png`.

---

### Task 1: Structure du monorepo et script de vérification

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `content/fr/.gitkeep`, `content/en/.gitkeep`, `content/de/.gitkeep`, `content/es/.gitkeep`, `content/it/.gitkeep`, `content/pt/.gitkeep`
- Create: `frontend/.gitkeep`
- Create: `backend/.gitkeep`
- Create: `keycloak/realm-export/.gitkeep`
- Create: `keycloak/themes/.gitkeep`
- Create: `infra/scripts/.gitkeep`
- Test: `infra/scripts/verify-structure.sh`

**Interfaces:**
- Produces: convention de chemins que toutes les tâches suivantes utilisent (`infra/`, `keycloak/realm-export/`, `keycloak/themes/`, `content/<lang>/`).

- [ ] **Step 1: Écrire le script de vérification (échoue tant que la structure n'existe pas)**

```bash
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
```

- [ ] **Step 2: Rendre le script exécutable et le lancer pour vérifier qu'il échoue**

Run: `chmod +x infra/scripts/verify-structure.sh && ./infra/scripts/verify-structure.sh`
Expected: FAIL — liste les dossiers manquants (aucun n'existe encore), code de sortie 1.

- [ ] **Step 3: Créer la structure de dossiers**

```bash
mkdir -p content/{fr,en,de,es,it,pt} frontend backend keycloak/realm-export keycloak/themes infra/scripts
touch content/fr/.gitkeep content/en/.gitkeep content/de/.gitkeep content/es/.gitkeep content/it/.gitkeep content/pt/.gitkeep
touch frontend/.gitkeep backend/.gitkeep keycloak/realm-export/.gitkeep keycloak/themes/.gitkeep
```

- [ ] **Step 4: Créer `.gitignore`**

```gitignore
# Secrets
infra/.env

# Dépendances / builds
node_modules/
dist/
target/
.angular/

# Données locales des conteneurs
infra/data/

# IDE
.idea/
*.iml
```

- [ ] **Step 5: Créer `README.md`**

```markdown
# OEI Platform

Monorepo du site public et de l'espace membre de l'Ordre des Experts Informaticiens.

## Structure

- `frontend/` — Angular (site public + espace membre)
- `backend/` — Spring Boot (API + intégration Keycloak)
- `content/` — Corpus documentaire versionné, par langue
- `keycloak/` — Export de realm, thème de login personnalisé
- `infra/` — docker-compose et scripts d'exploitation locale

## Démarrer l'environnement local

Voir `infra/scripts/dev-up.sh` (ajouté en fin de plan infra).
```

- [ ] **Step 6: Relancer le script de vérification pour confirmer qu'il passe**

Run: `./infra/scripts/verify-structure.sh`
Expected: PASS — `Structure du monorepo OK.`, code de sortie 0.

- [ ] **Step 7: Commit**

```bash
git add .gitignore README.md content frontend backend keycloak infra
git commit -m "chore: scaffold monorepo structure"
```

---

### Task 2: Fichier d'environnement et gestion des secrets

**Files:**
- Create: `infra/.env.example`
- Test: `infra/scripts/verify-env.sh`

**Interfaces:**
- Produces: variables d'environnement consommées par `infra/docker-compose.yml` dans les tâches suivantes : `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`.

- [ ] **Step 1: Écrire le script de vérification (échoue tant que `.env.example` n'existe pas)**

```bash
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
```

- [ ] **Step 2: Rendre exécutable et lancer pour vérifier l'échec**

Run: `chmod +x infra/scripts/verify-env.sh && ./infra/scripts/verify-env.sh`
Expected: FAIL — `MANQUANT: infra/.env.example`, code de sortie 1.

- [ ] **Step 3: Créer `infra/.env.example`**

```dotenv
# Copier ce fichier en infra/.env et remplacer les valeurs avant de lancer docker-compose.
# infra/.env est gitignoré — ne jamais committer de vrais secrets.

POSTGRES_USER=oei
POSTGRES_PASSWORD=changeme
POSTGRES_DB=keycloak

KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=changeme

MINIO_ROOT_USER=oei-minio-admin
MINIO_ROOT_PASSWORD=changeme12345
```

- [ ] **Step 4: Créer une copie locale `infra/.env` (non versionnée) à partir de l'exemple**

Run: `cp infra/.env.example infra/.env`
Expected: fichier `infra/.env` créé (ignoré par git grâce au `.gitignore` de la Task 1).

- [ ] **Step 5: Relancer le script de vérification pour confirmer qu'il passe**

Run: `./infra/scripts/verify-env.sh`
Expected: PASS — `infra/.env.example contient toutes les clés requises.`

- [ ] **Step 6: Commit (uniquement l'exemple, jamais `.env`)**

```bash
git add infra/.env.example infra/scripts/verify-env.sh
git commit -m "chore: add environment variable template"
```

---

### Task 3: docker-compose — Postgres + Keycloak

**Files:**
- Create: `infra/docker-compose.yml`
- Test: `infra/scripts/verify-keycloak.sh`

**Interfaces:**
- Consumes: variables de `infra/.env` (Task 2).
- Produces: service `keycloak` accessible sur `http://localhost:8081` (port hôte choisi pour ne pas entrer en conflit avec un backend Spring Boot ultérieur sur 8080), service `postgres` sur le réseau interne `oei-net` (pas exposé à l'hôte).

- [ ] **Step 1: Écrire le script de vérification (échoue tant que Keycloak ne tourne pas)**

```bash
#!/usr/bin/env bash
# infra/scripts/verify-keycloak.sh
set -euo pipefail

URL="http://localhost:8081/health/ready"

if ! curl -sf "$URL" > /dev/null; then
  echo "Keycloak ne répond pas sur $URL"
  exit 1
fi

echo "Keycloak est UP ($URL)."
```

- [ ] **Step 2: Rendre exécutable et lancer pour vérifier l'échec (rien ne tourne encore)**

Run: `chmod +x infra/scripts/verify-keycloak.sh && ./infra/scripts/verify-keycloak.sh`
Expected: FAIL — `Keycloak ne répond pas sur http://localhost:8081/health/ready`, code de sortie 1.

- [ ] **Step 3: Créer `infra/docker-compose.yml` avec les services `postgres` et `keycloak`**

```yaml
name: oei

networks:
  oei-net:
    driver: bridge

volumes:
  postgres-data:

services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - oei-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10

  keycloak:
    image: quay.io/keycloak/keycloak:25.0
    restart: unless-stopped
    command: start-dev --import-realm --health-enabled=true
    environment:
      KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN}
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      KC_DB_USERNAME: ${POSTGRES_USER}
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "8081:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - oei-net
    healthcheck:
      test: ["CMD-SHELL", "exec 3<>/dev/tcp/localhost/8080 && echo -e 'GET /health/ready HTTP/1.1\\r\\nhost: localhost\\r\\nConnection: close\\r\\n\\r\\n' >&3 && grep -q '\"status\": \"UP\"' <&3"]
      interval: 10s
      timeout: 5s
      retries: 15
```

- [ ] **Step 4: Démarrer les deux services**

Run: `docker compose --env-file infra/.env -f infra/docker-compose.yml up -d postgres keycloak`
Expected: les deux conteneurs démarrent ; `docker compose -f infra/docker-compose.yml ps` montre `postgres` et `keycloak` en `healthy` après ~30-60s.

- [ ] **Step 5: Relancer le script de vérification pour confirmer qu'il passe**

Run: `./infra/scripts/verify-keycloak.sh`
Expected: PASS — `Keycloak est UP (http://localhost:8081/health/ready).`

- [ ] **Step 6: Commit**

```bash
git add infra/docker-compose.yml infra/scripts/verify-keycloak.sh
git commit -m "feat: add postgres and keycloak services to local compose stack"
```

---

### Task 4: Bootstrap du realm Keycloak (`oei`)

**Files:**
- Create: `keycloak/realm-export/oei-realm.json`
- Modify: `infra/docker-compose.yml` (montage du dossier `keycloak/realm-export` dans le conteneur Keycloak)
- Test: `infra/scripts/verify-realm.sh`

**Interfaces:**
- Consumes: service `keycloak` de la Task 3.
- Produces: realm `oei` avec rôles `member` et `admin`, client public `oei-frontend` (PKCE, redirect `http://localhost:4200/*`) — nom de client que le frontend (plan ultérieur) utilisera tel quel.

- [ ] **Step 1: Écrire le script de vérification (échoue tant que le realm n'existe pas)**

```bash
#!/usr/bin/env bash
# infra/scripts/verify-realm.sh
set -euo pipefail

REALM_URL="http://localhost:8081/realms/oei/.well-known/openid-configuration"

if ! curl -sf "$REALM_URL" > /dev/null; then
  echo "Realm 'oei' introuvable sur $REALM_URL"
  exit 1
fi

echo "Realm 'oei' est actif."
```

- [ ] **Step 2: Rendre exécutable et lancer pour vérifier l'échec**

Run: `chmod +x infra/scripts/verify-realm.sh && ./infra/scripts/verify-realm.sh`
Expected: FAIL — `Realm 'oei' introuvable sur http://localhost:8081/realms/oei/.well-known/openid-configuration`.

- [ ] **Step 3: Créer `keycloak/realm-export/oei-realm.json`**

```json
{
  "realm": "oei",
  "enabled": true,
  "displayName": "Ordre des Experts Informaticiens",
  "loginTheme": "oei",
  "sslRequired": "external",
  "roles": {
    "realm": [
      { "name": "member", "description": "Membre de l'OEI (fondateur, agréé, associé ou honneur)" },
      { "name": "admin", "description": "Administrateur habilité à valider les demandes d'adhésion" }
    ]
  },
  "clients": [
    {
      "clientId": "oei-frontend",
      "publicClient": true,
      "protocol": "openid-connect",
      "standardFlowEnabled": true,
      "directAccessGrantsEnabled": false,
      "redirectUris": ["http://localhost:4200/*"],
      "webOrigins": ["http://localhost:4200"],
      "attributes": {
        "pkce.code.challenge.method": "S256"
      }
    }
  ]
}
```

- [ ] **Step 4: Monter le dossier d'export dans le conteneur Keycloak**

Dans `infra/docker-compose.yml`, ajouter le volume au service `keycloak` :

```yaml
  keycloak:
    # ... (inchangé)
    volumes:
      - ../keycloak/realm-export:/opt/keycloak/data/import
```

- [ ] **Step 5: Recréer le conteneur Keycloak pour qu'il importe le realm au démarrage**

Run: `docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --force-recreate keycloak`
Expected: les logs (`docker compose -f infra/docker-compose.yml logs keycloak`) montrent `Imported realm oei`.

- [ ] **Step 6: Relancer le script de vérification pour confirmer qu'il passe**

Run: `./infra/scripts/verify-realm.sh`
Expected: PASS — `Realm 'oei' est actif.`

- [ ] **Step 7: Commit**

```bash
git add keycloak/realm-export/oei-realm.json infra/docker-compose.yml infra/scripts/verify-realm.sh
git commit -m "feat: bootstrap oei keycloak realm with roles and frontend client"
```

---

### Task 5: Thème de login Keycloak personnalisé

**Files:**
- Create: `keycloak/themes/oei/login/theme.properties`
- Create: `keycloak/themes/oei/login/resources/css/oei.css`
- Modify: `infra/docker-compose.yml` (montage du dossier `keycloak/themes`)
- Test: `infra/scripts/verify-login-theme.sh`

**Interfaces:**
- Consumes: realm `oei` de la Task 4 (`loginTheme: "oei"` déjà défini dans `oei-realm.json`).
- Produces: page de login servie sur `http://localhost:8081/realms/oei/protocol/openid-connect/auth?...` avec le CSS `oei.css` référencé — contrat visuel que le bouton « Espace membre » du frontend (plan ultérieur) redirige vers cette page.

- [ ] **Step 1: Écrire le script de vérification (échoue tant que le thème n'est pas servi)**

```bash
#!/usr/bin/env bash
# infra/scripts/verify-login-theme.sh
set -euo pipefail

LOGIN_PAGE_URL="http://localhost:8081/realms/oei/protocol/openid-connect/auth?client_id=oei-frontend&response_type=code&redirect_uri=http://localhost:4200/&scope=openid"

html=$(curl -sf "$LOGIN_PAGE_URL")

if ! echo "$html" | grep -q "oei.css"; then
  echo "Le thème 'oei' n'est pas appliqué (oei.css absent de la page de login)."
  exit 1
fi

echo "Le thème de login 'oei' est bien servi."
```

- [ ] **Step 2: Rendre exécutable et lancer pour vérifier l'échec**

Run: `chmod +x infra/scripts/verify-login-theme.sh && ./infra/scripts/verify-login-theme.sh`
Expected: FAIL — `Le thème 'oei' n'est pas appliqué (oei.css absent de la page de login).`

- [ ] **Step 3: Créer `keycloak/themes/oei/login/theme.properties`**

```properties
parent=keycloak
import=common/keycloak
styles=css/oei.css
```

- [ ] **Step 4: Créer `keycloak/themes/oei/login/resources/css/oei.css`**

```css
:root {
  --oei-navy: #0a1e3f;
  --oei-gold: #e8a530;
}

body {
  background-color: var(--oei-navy) !important;
}

#kc-header, #kc-header-wrapper {
  color: #ffffff;
}

.login-pf-page .card-pf {
  background-color: #ffffff;
  border-top: 4px solid var(--oei-gold);
}

.btn-primary {
  background-color: var(--oei-gold) !important;
  border-color: var(--oei-gold) !important;
  color: var(--oei-navy) !important;
}
```

- [ ] **Step 5: Monter le dossier de thèmes dans le conteneur Keycloak**

Dans `infra/docker-compose.yml`, ajouter au volume du service `keycloak` :

```yaml
  keycloak:
    # ... (inchangé)
    volumes:
      - ../keycloak/realm-export:/opt/keycloak/data/import
      - ../keycloak/themes/oei:/opt/keycloak/themes/oei
```

- [ ] **Step 6: Recréer le conteneur Keycloak pour charger le thème**

Run: `docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --force-recreate keycloak`
Expected: redémarrage propre, aucune erreur de thème dans les logs.

- [ ] **Step 7: Relancer le script de vérification pour confirmer qu'il passe**

Run: `./infra/scripts/verify-login-theme.sh`
Expected: PASS — `Le thème de login 'oei' est bien servi.`

- [ ] **Step 8: Commit**

```bash
git add keycloak/themes infra/docker-compose.yml infra/scripts/verify-login-theme.sh
git commit -m "feat: add custom oei keycloak login theme"
```

---

### Task 6: MinIO + buckets `oei-public` / `oei-membership`

**Files:**
- Modify: `infra/docker-compose.yml` (services `minio` et `minio-init`)
- Test: `infra/scripts/verify-minio.sh`

**Interfaces:**
- Consumes: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` de `infra/.env` (Task 2).
- Produces: endpoint S3 sur `http://localhost:9000`, console sur `http://localhost:9001`, bucket `oei-public` (politique `download` publique) et bucket `oei-membership` (privé) — noms que le backend (plan ultérieur) utilisera tels quels.

- [ ] **Step 1: Écrire le script de vérification (échoue tant que MinIO/les buckets n'existent pas)**

```bash
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
```

- [ ] **Step 2: Rendre exécutable et lancer pour vérifier l'échec**

Run: `chmod +x infra/scripts/verify-minio.sh && ./infra/scripts/verify-minio.sh`
Expected: FAIL — `MinIO ne répond pas sur http://localhost:9000`.

- [ ] **Step 3: Ajouter les services `minio` et `minio-init` à `infra/docker-compose.yml`**

```yaml
  minio:
    image: minio/minio:RELEASE.2024-07-16T23-46-41Z
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
    networks:
      - oei-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 5s
      timeout: 5s
      retries: 10

  minio-init:
    image: minio/mc:RELEASE.2024-07-16T23-46-41Z
    depends_on:
      minio:
        condition: service_healthy
    networks:
      - oei-net
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} &&
      mc mb -p local/oei-public &&
      mc mb -p local/oei-membership &&
      mc anonymous set download local/oei-public &&
      mc anonymous set none local/oei-membership
      "
```

Et ajouter le volume `minio-data:` dans la section `volumes:` en tête de fichier.

- [ ] **Step 4: Démarrer les services MinIO**

Run: `docker compose --env-file infra/.env -f infra/docker-compose.yml up -d minio minio-init`
Expected: `minio` passe `healthy` ; `minio-init` s'exécute puis s'arrête avec le code 0 (`docker compose -f infra/docker-compose.yml ps minio-init` montre `Exited (0)`).

- [ ] **Step 5: Relancer le script de vérification pour confirmer qu'il passe**

Run: `./infra/scripts/verify-minio.sh`
Expected: PASS — `MinIO est UP, buckets 'oei-public' et 'oei-membership' présents.`

- [ ] **Step 6: Commit**

```bash
git add infra/docker-compose.yml infra/scripts/verify-minio.sh
git commit -m "feat: add minio with oei-public and oei-membership buckets"
```

---

### Task 7: Orchestration complète et smoke test

**Files:**
- Create: `infra/scripts/dev-up.sh`
- Create: `infra/scripts/dev-down.sh`
- Create: `infra/scripts/verify-all.sh`
- Modify: `README.md` (instructions de démarrage)

**Interfaces:**
- Consumes: tous les scripts `verify-*.sh` des tâches 1 à 6.
- Produces: point d'entrée unique `./infra/scripts/dev-up.sh` que les plans frontend/backend ultérieurs utiliseront pour disposer d'un environnement prêt.

- [ ] **Step 1: Écrire `infra/scripts/verify-all.sh` (échoue tant que la stack n'est pas levée)**

```bash
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

echo "Toute l'infra locale (Keycloak, Postgres, MinIO) est opérationnelle."
```

- [ ] **Step 2: Arrêter la stack et lancer `verify-all.sh` pour vérifier l'échec**

Run: `docker compose --env-file infra/.env -f infra/docker-compose.yml down && chmod +x infra/scripts/verify-all.sh && ./infra/scripts/verify-all.sh`
Expected: FAIL dès `verify-keycloak.sh` (Keycloak arrêté), code de sortie non nul.

- [ ] **Step 3: Créer `infra/scripts/dev-up.sh`**

```bash
#!/usr/bin/env bash
# infra/scripts/dev-up.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

if [ ! -f "$INFRA_DIR/.env" ]; then
  echo "infra/.env introuvable — copie infra/.env.example vers infra/.env et adapte les valeurs."
  exit 1
fi

docker compose --env-file "$INFRA_DIR/.env" -f "$INFRA_DIR/docker-compose.yml" up -d

echo "Attente de la disponibilité des services..."
sleep 5
"$SCRIPT_DIR/verify-all.sh"
```

- [ ] **Step 4: Créer `infra/scripts/dev-down.sh`**

```bash
#!/usr/bin/env bash
# infra/scripts/dev-down.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

docker compose --env-file "$INFRA_DIR/.env" -f "$INFRA_DIR/docker-compose.yml" down
```

- [ ] **Step 5: Rendre les scripts exécutables et lancer le smoke test complet**

Run: `chmod +x infra/scripts/dev-up.sh infra/scripts/dev-down.sh && ./infra/scripts/dev-up.sh`
Expected: PASS — se termine par `Toute l'infra locale (Keycloak, Postgres, MinIO) est opérationnelle.`

- [ ] **Step 6: Mettre à jour `README.md`**

```markdown
## Démarrer l'environnement local

1. `cp infra/.env.example infra/.env` puis adapter les valeurs.
2. `./infra/scripts/dev-up.sh` — démarre Postgres, Keycloak (realm `oei` + thème de login) et MinIO (buckets `oei-public`/`oei-membership`), puis vérifie que tout est opérationnel.
3. Console Keycloak : http://localhost:8081 (admin défini dans `infra/.env`).
4. Console MinIO : http://localhost:9001 (identifiants définis dans `infra/.env`).
5. `./infra/scripts/dev-down.sh` — arrête la stack.
```

- [ ] **Step 7: Commit final**

```bash
git add infra/scripts/dev-up.sh infra/scripts/dev-down.sh infra/scripts/verify-all.sh README.md
git commit -m "feat: add full local stack orchestration and smoke test"
```
