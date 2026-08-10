# OEI Backend

First Spring Boot backend of the OEI (Ordre des Experts Informaticiens) platform.
Maven multi-module DDD + Hexagonal architecture, contract-first OpenAPI, JPA persistence
separated from the domain, ArchUnit-enforced boundaries.

## Modules

```text
backend/
  pom.xml                    parent (Spring Boot 4.1.0 BOM, Java 25, plugin versions)
  domain/
    shared/                  domain-shared  — value objects, enums, ports (no Spring/JPA)
    core/                    domain-core    — use cases; ArchUnit guards domain purity
  infrastructure/
    security/                infrastructure-security — Keycloak JWT resource server starter
    persistence/              infrastructure-persistence — JPA entities, Liquibase, repositories
  application/
    web/                      application-web — REST controllers implementing the generated
                              OpenAPI server interfaces AND the composition root
                              (@SpringBootApplication) — see "Composition root" below
```

Dependency direction: `infrastructure` → `domain-shared`. `application-web` is the one
deliberate exception: it is both the primary HTTP adapter and the composition root, so it
depends on `domain-core` in addition to `domain-shared` and the infrastructure adapters —
there is no separate `application/runtime` module (see the spring-boot-ddd-backend skill's
"Composition root rule": simplicity over strict isolation of the composition root).
`domain-core` never depends on Spring/JPA — enforced by `DomainArchitectureTest` (ArchUnit)
in `domain/core`.

## Building

```bash
cd backend
mvn clean install
```

Generates the OpenAPI server interfaces/DTOs under `application/web/target/generated-sources`,
compiles all modules, runs domain unit tests (JUnit5/AssertJ/Mockito) and the ArchUnit
architecture test.

## OpenAPI contract

`application/web/src/main/resources/openapi/oei-api.yaml` is a copy of
`frontend/oei-web/openapi/oei-api.yaml` (the backend becomes the dev source of truth going
forward; the frontend copy is untouched by this backend). `application-web`'s `pom.xml`:

- generates Spring server interfaces (`interfaceOnly=true`, one default-`501` method per
  operation — only `GET /api/member/v1/membership` is actually implemented so far, see
  `MembershipController`);
- packages the YAML into a distributable `application-web-<version>-openapi-distribution.zip`,
  attached as a Maven artifact with classifier `api` (always built, part of `mvn install`).

### Publishing the contract as an npm package (`@oei/api-contract`)

An **opt-in** Maven profile, `npm-contract`, additionally builds an npm-installable `.tgz`
(via `frontend-maven-plugin` downloading Node/pnpm and running `pnpm pack`), attached with
classifier `npm`:

```bash
mvn -pl application/web -am -Pnpm-contract clean install
```

This is **not** part of the default build: it requires downloading a Node/pnpm toolchain,
which is unnecessary for a Java-only CI build and can fail in network-restricted
environments. Once built, the Angular frontend can consume it, e.g.:

```bash
pnpm add file:../backend/application/web/target/oei-api-contract-0.1.0-SNAPSHOT.tgz
```

(or by publishing the `.tgz`/zip Maven artifacts to an internal registry — out of scope here).

## Local database

`infra/docker-compose.yml` exposes Postgres on `localhost:5432` (dev-local only) and
provisions a dedicated `oei` application database + `oei_app` role via
`infra/postgres-init/01-create-oei-app-db.sh`, separate from the `keycloak`
database/role. `application/web/src/main/resources/application.yml` connects to it via
`OEI_DB_USER`/`OEI_DB_PASSWORD` env vars (defaults are dev-only placeholders, never a real
secret).

Liquibase changelog: `infrastructure/persistence/src/main/resources/db/changelog/`.

## Security

`infrastructure-security` auto-configures an OAuth2 resource server against the OEI
Keycloak realm (`spring.security.oauth2.resourceserver.jwt.issuer-uri`, defaults to
`http://localhost:8081/realms/oei`), maps `realm_access.roles` to `ROLE_*` authorities, and
exposes `SecurityContextPort` (declared in `domain-shared`) so the domain never references
Spring Security types.

## Known TODOs

- Maven Enforcer dependency-direction rules at the parent POM are not wired yet; ArchUnit
  (`DomainArchitectureTest`) covers the domain-purity part of this in the meantime.
- Only `GET /api/member/v1/membership` is implemented; every other one of the ~90
  operations in the contract returns `501 Not Implemented` via the generated interfaces'
  default methods until a corresponding use case/controller is built.
- No integration tests (Testcontainers) yet for `infrastructure-persistence` /
  `infrastructure-security` — only unit tests. Not requested at this bootstrap stage.
