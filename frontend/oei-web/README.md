# OEI Frontend (Angular)

SPA Angular 22 de la plateforme OEI: site public multilingue, espace membre,
espace institution, back-office admin, et consommation API contract-first.

## Vue fonctionnelle

| Domaine | Fonctionnalites principales | Mode |
|---|---|---|
| Site public | Pages institutionnelles, contenus multilingues, livre blanc | Mock + API |
| Membre | Profil, adhésion, badges, objectifs de certification | Mock + API |
| Institution | Profil public, invitations, publications, audit | Mock + API |
| CMS | Parcours de contribution/relecture/publication | API prioritaire |
| Events | Liste, detail, inscriptions | Mock + API |
| Admin | Catalogue certifications, templates email, gouvernance contenus | API prioritaire |
| Identity | Login OIDC Keycloak, autorisations par roles | API |

## Architecture C4 (Mermaid)

### C4 - Niveau 1 (Contexte)

```mermaid
flowchart LR
  actor[Visiteur / Membre / Admin]
  spa[OEI Web\nAngular 22]
  api[OEI Backend\nSpring Boot API]
  kc[Keycloak OIDC]
  content[(Corpus Markdown versionné)]

  actor -->|HTTPS| spa
  spa -->|REST JSON| api
  spa -->|OIDC Code + PKCE| kc
  api -->|lecture contenu| content
```

### C4 - Niveau 2 (Conteneurs frontend)

```mermaid
flowchart TB
  subgraph presentation[Presentation]
    pages[Pages / Components]
  end

  subgraph app[Application]
    services[application/service/*]
    runtime[RuntimeConfig]
  end

  subgraph domain[Domain]
    ports[domain/port/*]
    models[domain/model/*]
  end

  subgraph infra[Infrastructure]
    adapters[adapter/*ApiAdapter, *MockAdapter]
    gen[api/generated\nOpenAPI client]
    oidc[OIDC auth]
  end

  pages --> services
  services --> ports
  services --> runtime
  ports <--> adapters
  adapters --> gen
  oidc --> pages
  models --> services
```

## Diagrammes de sequence

### Sequence - Consultation de contenu public

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant P as Public Page
  participant S as PublicContentApplicationService
  participant A as ContentApiAdapter
  participant B as Backend

  U->>P: Ouvre /fr/home
  P->>S: getHomeContent(lang)
  S->>A: fetchBySlug(lang, "home")
  A->>B: GET /content/{lang}/home
  B-->>A: markdown + metadata
  A-->>S: Document
  S-->>P: ViewModel
  P-->>U: Rendu HTML
```

### Sequence - Connexion OIDC et appel API membre

```mermaid
sequenceDiagram
  participant U as Membre
  participant FE as Angular App
  participant KC as Keycloak
  participant API as Backend

  U->>FE: Clique "Se connecter"
  FE->>KC: Authorization Code + PKCE
  KC-->>FE: Access token JWT
  FE->>API: GET /api/member/v1/membership (Bearer)
  API-->>FE: Membership JSON
  FE-->>U: Espace membre
```

## Diagramme de classes (vue logique simplifiee)

```mermaid
classDiagram
  class RuntimeConfig {
    +isMock(): boolean
    +apiBaseUrl(): string
  }

  class ContentRepositoryPort {
    <<interface>>
    +getHomeContent(lang): Observable~Document~
  }

  class ContentApplicationService {
    -contentRepository: ContentRepositoryPort
    +getHomeContent(lang)
  }

  class ContentApiAdapter {
    +getHomeContent(lang)
  }

  class ContentMockAdapter {
    +getHomeContent(lang)
  }

  class HomePageComponent {
    +ngOnInit()
  }

  ContentRepositoryPort <|.. ContentApiAdapter
  ContentRepositoryPort <|.. ContentMockAdapter
  ContentApplicationService --> ContentRepositoryPort
  HomePageComponent --> ContentApplicationService
  ContentApplicationService --> RuntimeConfig
```

## Diagramme de deploiement

```mermaid
flowchart LR
  subgraph DevLocal
    browser[Navigateur]
    ng[Angular dev server :4300]
    be[Backend :8080]
    kc[Keycloak :8081]
  end

  browser --> ng
  ng -->|proxy /api| be
  ng -->|OIDC| kc

  subgraph Production
    cf[CloudFront]
    s3[(S3 static assets)]
    api[Backend API]
    auth[Keycloak]
  end

  browser --> cf
  cf --> s3
  browser --> api
  browser --> auth
```

## Services applicatifs (extraits)

| Service | Responsabilite |
|---|---|
| `member-application.service.ts` | Lecture/édition du profil membre |
| `membership-application.service.ts` | Flux d'adhésion et état membership |
| `badge-application.service.ts` | Consultation badges et progression |
| `content-application.service.ts` | Accès contenu CMS |
| `public-content-application.service.ts` | Rendu contenu public multilingue |
| `institution-account-application.service.ts` | Espace institution |
| `admin-certification-catalog-application.service.ts` | Back-office certifications |
| `admin-email-templates-application.service.ts` | Back-office templates email |
| `event-application.service.ts` | Gestion d'événements |
| `event-registration-application.service.ts` | Inscriptions événements |

## Contrat API et generation OpenAPI

- Entrée générateur: `openapitools.json`
- Contrat consommé: `node_modules/@oei/api-contract/oei-api.yaml`
- Sortie générée: `src/app/infrastructure/api/generated`

Commandes:

```bash
cd frontend/oei-web
pnpm run generate:api
```

La commande exécute d'abord la préparation backend (`mvn ... process-resources`) puis la
génération Typescript Angular.

## Run, test, build

Dev local:

```bash
cd frontend/oei-web
pnpm install
pnpm run start
```

Tests unitaires:

```bash
cd frontend/oei-web
pnpm run test
```

E2E:

```bash
cd frontend/oei-web
pnpm run e2e
```

Build standard:

```bash
cd frontend/oei-web
pnpm run build
```

Build pipeline (avec regen API):

```bash
cd frontend/oei-web
pnpm run build:api
```

## Notes techniques

- `RuntimeConfig` permet le basculement `mock` / `api` sans recompiler.
- `proxy.conf.json` redirige `/api` vers le backend local en dev.
- Les contenus `content/` sont copiés dans `public/assets/content/` par script.
- `pnpm.overrides.lmdb` est un contournement CI/sandbox; si cache Angular réactivé, revoir.
