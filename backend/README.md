# Backend OEI (Spring Boot)

Backend Spring Boot 4.1 / Java 25 de la plateforme OEI, en architecture DDD + Hexagonale,
multi-modules Maven, contract-first OpenAPI.

## Vue fonctionnelle

| Domaine | Fonctionnalites principales | Etat actuel |
|---|---|---|
| Membership | Adhésion, lecture de profil membre, droits de base | Partiellement implémenté |
| Identity & Security | Auth OIDC Keycloak, mapping roles JWT -> `ROLE_*` | Implémenté |
| CMS / Content | Lecture/édition de contenus multilingues, publication | Contrat présent, implémentation progressive |
| Certifications | Catalogue, objectifs, déclarations | Contrat présent |
| Institutions | Affiliation, invitations, publications, audit | Contrat présent |
| Events | Gestion d'événements, inscriptions | Contrat présent |
| Store | Commandes, paiement, remboursement | Contrat présent |
| Media | Upload de médias, URL de stockage | Slice de base présente |
| Admin | Templates email, supervision métier, gouvernance | Contrat présent |

> Note: le contrat OpenAPI expose ~90 opérations, alors que seule une partie est branchée
> fonctionnellement aujourd'hui. Les endpoints non implémentés retournent encore `501`.

## Structure des modules

| Module | Rôle |
|---|---|
| `domain/shared` | Ports, value objects, contrats de use-cases (sans Spring/JPA) |
| `domain/core` | Implémentations métier (sans dépendance framework) |
| `infrastructure/security` | Adaptateurs sécurité JWT/Keycloak |
| `infrastructure/persistence` | Entités JPA, repositories, Liquibase |
| `infrastructure/client` | Clients externes (paiement, providers) |
| `infrastructure/mail` | Intégration email (SES/SMTP) |
| `infrastructure/wiring` | Composition root (`OeiWiringConfiguration`) |
| `application/web` | API HTTP (`*Resource`, `*Adapter`, `service.*Service`) |
| `test/architecture` | Règles ArchUnit inter-modules |
| `test/acceptance` | Scénarios Cucumber + Testcontainers |

## Architecture C4 (Mermaid)

### C4 - Niveau 1 (Contexte)

```mermaid
flowchart LR
  user[Visiteur / Membre / Institution / Admin]
  oei[OEI Backend API\nSpring Boot]
  kc[Keycloak\nOIDC Provider]
  pg[(PostgreSQL)]
  s3[(S3 / MinIO)]
  ses[Amazon SES / SMTP]
  pay[Stripe / PayPal]

  user -->|HTTPS JSON| oei
  oei -->|Validation JWT| kc
  oei -->|JDBC| pg
  oei -->|Objets| s3
  oei -->|Email transactionnel| ses
  oei -->|Paiement| pay
```

### C4 - Niveau 2 (Conteneurs internes backend)

```mermaid
flowchart TB
  subgraph app[application/web]
    res[*Resource]
    svc[service.*Service]
  end

  subgraph dom[domain]
    shared[domain-shared\nports/use-cases]
    core[domain-core\nmetier]
  end

  subgraph infra[infrastructure]
    wiring[OeiWiringConfiguration]
    sec[security]
    pers[persistence]
    cli[client]
    mail[mail]
  end

  res --> svc
  svc --> shared
  wiring --> core
  wiring --> sec
  wiring --> pers
  wiring --> cli
  wiring --> mail
  shared -.contrats.-> core
```

## Diagrammes de sequence

### Sequence - Consultation du profil membre

```mermaid
sequenceDiagram
  participant UI as Frontend
  participant API as MembershipResource
  participant SVC as MembershipService
  participant PORT as MembershipLookupPort
  participant ADP as MembershipPersistenceAdapter
  participant DB as PostgreSQL

  UI->>API: GET /api/member/v1/membership (Bearer JWT)
  API->>SVC: getMembership()
  SVC->>PORT: lookupBySubject(subject)
  PORT->>ADP: findBySubject(...)
  ADP->>DB: SELECT ...
  DB-->>ADP: membership row
  ADP-->>SVC: Membership
  SVC-->>API: Membership DTO
  API-->>UI: 200 JSON
```

### Sequence - Upload media (happy path)

```mermaid
sequenceDiagram
  participant UI as Frontend
  participant API as MediaResource
  participant UC as UploadMediaAssetUseCase
  participant STO as MediaStoragePort
  participant OBJ as S3/MinIO

  UI->>API: POST /api/member/v1/media
  API->>UC: upload(command)
  UC->>STO: store(binary, metadata)
  STO->>OBJ: PutObject
  OBJ-->>STO: key/url
  STO-->>UC: MediaAsset
  UC-->>API: result
  API-->>UI: 201
```

## Diagramme de classes (vue logique simplifiee)

```mermaid
classDiagram
  class MembershipResource {
    +getMembership(): ResponseEntity
  }

  class MembershipAdapter {
    <<interface>>
    +getMembership(): MembershipResponseDTO
  }

  class MembershipService {
    -GetMyIdentityUseCase getMyIdentity
    -MembershipLookupPort membershipLookup
    +getMembership(): MembershipResponseDTO
  }

  class OeiWiringConfiguration {
    +getMyIdentityUseCase(...)
    +membershipLookupPort(...)
  }

  class GetMyIdentityUseCase {
    <<interface>>
    +execute(): Identity
  }

  class MembershipLookupPort {
    <<interface>>
    +lookupBySubject(subject): Membership
  }

  MembershipResource --> MembershipAdapter
  MembershipAdapter <|.. MembershipService
  MembershipService --> GetMyIdentityUseCase
  MembershipService --> MembershipLookupPort
  OeiWiringConfiguration ..> MembershipService
```

## Diagramme de deploiement

```mermaid
flowchart LR
  subgraph LocalDev
    fe[Angular dev server :4300]
    be[Spring Boot :8080]
    kc[Keycloak :8081]
    db[(PostgreSQL :5432)]
    minio[(MinIO :9000)]
  end

  fe -->|/api| be
  be --> kc
  be --> db
  be --> minio

  subgraph Production
    cf[CloudFront + S3 static]
    caddy[Caddy reverse proxy]
    ec2[EC2 Docker Compose]
    be2[Backend container]
    kc2[Keycloak container]
    db2[(PostgreSQL container)]
  end

  cf --> caddy
  caddy --> be2
  caddy --> kc2
  be2 --> db2
```

## Contrat OpenAPI (source unique)

- Fichier source: `backend/application/web/src/main/resources/openapi/oei-api.yaml`
- Generation serveur: `openapi-generator-maven-plugin` (interfaces Spring + DTO)
- Packaging contrat local npm: `backend/application/web/target/npm-package`
- Consommation frontend: `file:../../backend/application/web/target/npm-package`

Flux CI/deploiement:

1. backend `mvn ... process-resources` (ou `package`)
2. frontend `pnpm run generate:api`
3. build/test frontend/backend

## Build et verification

```bash
cd backend
mvn clean verify
```

Build cible deploy (sans tests, deja executes en CI):

```bash
cd backend
mvn -B clean package -pl application/web -am -DskipTests
```

## Qualite et garde-fous

- `Maven Enforcer` bloque l'introduction de deps Spring/JPA dans `domain/*`
- `ArchUnit` valide les frontières de packages et dépendances inter-modules
- `Checkstyle` sur convention code
- `Cucumber` pour acceptance tests
- `Liquibase` pour versionner le schema DB

## Limites connues

- Une partie significative du contrat OpenAPI reste a implémenter côté application.
- Les tests d'intégration couvrent encore inégalement tous les sous-domaines.
- Le seuil de couverture automatisé `jacoco:check` n'est pas encore verrouillé globalement.
