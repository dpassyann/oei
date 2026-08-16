# Faire tourner OEI en local — frontend + backend, mode mock ou mode API réelle

Ce document explique comment lancer le site en local dans les deux modes possibles :

- **Mode mock** (par défaut) : le frontend Angular fonctionne seul, avec des données de démonstration générées en mémoire (aucun backend, aucune base de données requise).
- **Mode API réelle** : le frontend parle au vrai backend Spring Boot, lui-même connecté à Postgres et Keycloak.

Vous pouvez basculer de l'un à l'autre **sans recompiler**, juste en changeant une valeur.

---

## 1. Le mécanisme de bascule mock ↔ API

Tout repose sur un seul service Angular : `RuntimeConfig`
(`frontend/oei-web/src/app/infrastructure/config/runtime-config.ts`).

Il détermine le mode actif dans cet ordre de priorité :

1. **Une bascule manuelle enregistrée dans le navigateur** (`localStorage`, clé `oei-data-source`) — la plus prioritaire, posée par un appel à `RuntimeConfig.setDataSource('mock' | 'api')` (voir §4 pour le faire depuis la console du navigateur).
2. **Le fichier `public/config.json`**, servi tel quel par Angular à l'URL `/config` :
   ```json
   {
     "dataSource": "mock",
     "apiBaseUrl": "/api/v1"
   }
   ```
   `dataSource` vaut `"mock"` ou `"api"`. `apiBaseUrl` est le préfixe utilisé par les adapters `*ApiAdapter` pour construire leurs URLs (`/api/v1/...`) — à ne changer que si vous exposez le backend ailleurs qu'en local derrière le proxy Angular.
3. **Par défaut, si rien de tout ça n'est disponible** : `mock`.

Chaque port de domaine (`ContentPort`, `NetworkGraphPort`, `SalaryBenchmarkPort`, etc.) est câblé dans `app.config.ts` avec un `if (RuntimeConfig.isMock()) { ... MockAdapter ... } else { ... ApiAdapter ... }`. Le composant lui-même ne sait jamais dans quel mode il tourne.

---

## 2. Mode mock — le plus simple, pour travailler sur l'UI

Aucun service externe requis (pas de Docker, pas de backend, pas de base de données).

```bash
cd frontend/oei-web
pnpm install                # une seule fois
pnpm run start              # = node scripts/copy-content-assets.mjs && ng serve --proxy-config proxy.conf.json
```

Le site est servi sur **http://localhost:4300** (voir `angular.json`, le port par défaut a été changé de 4200 à 4300 dans ce projet).

Vérifiez que `frontend/oei-web/public/config.json` contient bien :

```json
{
  "dataSource": "mock",
  "apiBaseUrl": "/api/v1"
}
```

C'est la valeur par défaut du dépôt — vous n'avez normalement rien à faire.

---

## 3. Mode API réelle — frontend + backend + Postgres + Keycloak

### 3.1. Démarrer l'infrastructure (Postgres, Keycloak, MinIO)

```bash
cd infra
cp .env.example .env        # une seule fois, puis ajustez si besoin (voir tableau §3.4)
docker compose up -d
docker compose ps           # attendez que postgres/keycloak soient "healthy"
```

Cela expose :
- **Postgres** sur `localhost:5432` (base `keycloak` pour Keycloak, base `oei` créée automatiquement par `infra/postgres-init/01-create-oei-app-db.sh` pour le backend applicatif).
- **Keycloak** sur `localhost:8081` (réalm `oei` importé automatiquement, client `oei-frontend`).
- **MinIO** sur `localhost:9000` (console sur `9001`) — utilisé uniquement en local pour simuler S3 (en production, réel S3, voir `.prompt/deployment/`).

### 3.2. Démarrer le backend Spring Boot

```bash
cd backend
mvn clean install -DskipTests        # une seule fois, ou après un git pull
mvn spring-boot:run -pl application/web
```

Le backend écoute par défaut sur **http://localhost:8080** (aucun `server.port` custom dans `application.yml`).

Variables d'environnement reconnues par le backend (`backend/application/web/src/main/resources/application.yml`) — **toutes ont une valeur par défaut cohérente avec `infra/docker-compose.yml`**, vous n'avez rien à définir pour un simple run local :

| Variable | Défaut | À quoi ça sert |
|---|---|---|
| `OEI_DB_USER` | `oei_app` | Utilisateur Postgres applicatif (créé par `infra/postgres-init/01-create-oei-app-db.sh`, distinct du compte admin `oei` partagé par Keycloak) |
| `OEI_DB_PASSWORD` | `changeme` | Mot de passe de ce même utilisateur — doit correspondre à `OEI_APP_PASSWORD` dans `infra/.env` |
| `OEI_OIDC_ISSUER_URI` | `http://localhost:8081/realms/oei` | Issuer OIDC que le backend utilise pour valider les JWT Keycloak (resource server) |

Ne changez ces valeurs que si vous avez vous-même modifié `infra/.env` (par exemple un autre mot de passe) — dans ce cas, exportez les variables correspondantes avant de lancer `mvn spring-boot:run`, par exemple :

```bash
export OEI_DB_PASSWORD=monAutreMotDePasse
mvn spring-boot:run -pl application/web
```

### 3.3. Démarrer le frontend en mode API

```bash
cd frontend/oei-web
```

Éditez `public/config.json` :

```json
{
  "dataSource": "api",
  "apiBaseUrl": "/api/v1"
}
```

Puis lancez le serveur de dev comme d'habitude :

```bash
pnpm run start
```

Le fichier `proxy.conf.json` a été complété pour relayer les appels `/api/**` vers `http://localhost:8080` (le backend) — sans ça, le navigateur enverrait les requêtes vers le serveur de dev Angular lui-même (port 4300) et obtiendrait des 404. Vérifiez qu'il contient bien :

```json
{
  "/config": {
    "target": "http://localhost:4300",
    "pathRewrite": { "^/config": "/config.json" },
    "changeOrigin": true
  },
  "/api": {
    "target": "http://localhost:8080",
    "changeOrigin": true
  }
}
```

Ouvrez **http://localhost:4300** : le frontend appelle désormais le vrai backend. La connexion (bouton "Se connecter") redirige vers Keycloak (`http://localhost:8081/realms/oei`, client `oei-frontend`) exactement comme en production.

### 3.4. Variables `infra/.env` (Docker Compose)

| Variable | Défaut (`.env.example`) | À quoi ça sert |
|---|---|---|
| `OEI_USER` | `oei` | Compte admin partagé Postgres + admin Keycloak |
| `OEI_PASSWORD` | `changeme` | Mot de passe de ce compte admin, réutilisé aussi par MinIO |
| `POSTGRES_DB` | `keycloak` | Base de données propre à Keycloak (ne pas confondre avec la base `oei` applicative, créée séparément) |
| `MINIO_ROOT_USER` | `oei-minio-admin` | Compte admin MinIO (simulateur S3 local) |
| `OEI_APP_PASSWORD` | `changeme` | Mot de passe du rôle Postgres applicatif `oei_app` — doit correspondre à `OEI_DB_PASSWORD` côté backend (§3.2) |

Ces valeurs sont dev-only ; **ne jamais les réutiliser en production** (voir `.prompt/deployment/deploiement-aws.md`, qui utilise SSM Parameter Store pour les vrais secrets).

---

## 4. Basculer rapidement sans changer de fichier (console navigateur)

Si le site tourne déjà (dans n'importe quel mode), vous pouvez forcer l'autre mode directement depuis la console DevTools du navigateur, sans recharger `config.json` ni relancer `ng serve` :

```js
// Passer en mode API réelle
localStorage.setItem('oei-data-source', 'api');
location.reload();

// Revenir en mode mock
localStorage.setItem('oei-data-source', 'mock');
location.reload();

// Oublier la bascule manuelle et revenir au comportement de public/config.json
localStorage.removeItem('oei-data-source');
location.reload();
```

C'est utile pour comparer rapidement le rendu mock vs réel sans changer de configuration ni relancer les serveurs.

---

## 5. Résumé express

| Je veux...                                      | À faire                                                                                                                                                 |
|-------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Travailler sur l'UI sans rien installer d'autre | `pnpm run start` dans `frontend/oei-web`, rien d'autre (mode mock par défaut)                                                                           |
| Tester contre le vrai backend                   | `docker compose up -d` (infra) + `mvn spring-boot:run -pl application/web` (backend) + `dataSource: "api"` dans `public/config.json` + `pnpm run start` |
| Basculer à la volée sans rien relancer          | `localStorage.setItem('oei-data-source', 'api')                                                                                                         |'mock')` puis `location.reload()` dans la console du navigateur |
