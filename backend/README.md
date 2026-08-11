# OEI Backend

First Spring Boot backend of the OEI (Ordre des Experts Informaticiens) platform.
Maven multi-module DDD + Hexagonal architecture, contract-first OpenAPI, JPA persistence
separated from the domain, explicit Spring wiring (no classpath component scanning),
Maven Enforcer + ArchUnit boundary enforcement.

## Modules

```text
backend/
  pom.xml                       parent (inherits spring-boot-starter-parent directly,
                                Java 25, centralized third-party plugin/library versions)
  domain/
    shared/                     domain-shared  — value objects, enums, ports/use-case
                                 interfaces (no Spring/JPA)
    core/                       domain-core    — use-case implementations; ArchUnit +
                                 Maven Enforcer guard domain purity
  infrastructure/
    security/                   infrastructure-security — Keycloak JWT resource server starter
    persistence/                 infrastructure-persistence — JPA entities, Liquibase, repositories
    wiring/                      infrastructure-wiring — the composition root (see below)
  application/
    web/                         application-web — *Resource/*Adapter/service.*Service HTTP
                                 adapter, executable entry point
  test/
    architecture/                test-architecture — reactor-wide ArchUnit suite (builds last)
```

## Composition root

`infrastructure-wiring`'s `OeiWiringConfiguration` is the **sole class in the project,
outside `domain-core` itself, allowed to import concrete `domain-core` types**. Every
`@Bean` method on it returns a `domain-shared` interface (`GetMyIdentityUseCase`,
`MembershipLookupPort`), constructed from a `domain-core` implementation
(`GetMyIdentityService`) wired with outbound port adapters from
`infrastructure-security`/`infrastructure-persistence`
(`SpringSecurityContextAdapter`, `MembershipPersistenceAdapter`).

`application-web` depends on `domain-shared` + `infrastructure-wiring` — **never on
`domain-core` directly**. There is no separate `application/runtime` module: `application-web`
carries its own executable entry point (`OeiBackendApplication`), and its own
Resource/Adapter/Service wiring for the HTTP layer.

## No classpath component scanning

Every Spring bean in this project is wired explicitly (predictability + AOT/native-image
friendliness):

- `OeiBackendApplication` composes `@SpringBootConfiguration` + `@EnableAutoConfiguration`
  + explicit `@Import(OeiWiringConfiguration.class, WebResourcesConfiguration.class)`
  instead of `@SpringBootApplication` (which carries an implicit `@ComponentScan`).
- `*Resource`, `*Adapter` implementations (`service.*Service`), and infrastructure adapters
  are registered as explicit `@Bean` methods in a `@Configuration(proxyBeanMethods = false)`
  class local to their module (`WebResourcesConfiguration`, `OeiWiringConfiguration`) —
  never discovered via `@Component` + scanning.
- The only exceptions are `@EnableJpaRepositories`/`@EntityScan` on `OeiWiringConfiguration`
  (structural requirements of Spring Data JPA, narrowly scoped to
  `global.oei.infrastructure.persistence`) and Spring Boot's own
  `AutoConfiguration.imports`-based auto-configuration loading (e.g.
  `OeiSecurityAutoConfiguration`), neither of which is classpath component scanning.

## Resource / Adapter / Service naming

- REST controllers are suffixed `Resource`, never `Controller` (`MembershipResource`).
- A `*Resource` injects a same-module `*Adapter` interface
  (`application.web.adapter.MembershipAdapter`), never a `domain-shared` port/use case
  directly.
- The concrete implementation of a `*Adapter` lives in the sibling `service` package
  (`application.web.service.MembershipService`) — never a `*Impl`/`impl` package, which is
  banned project-wide (enforced by `test-architecture`).
- Constructor injection outside the domain uses Lombok `@RequiredArgsConstructor` (with
  `@NonNull` where a null-check used to be hand-written). Lombok is deliberately **not**
  used in `domain-shared`/`domain-core`.

## Building

```bash
cd backend
mvn clean install
```

Generates the OpenAPI server interfaces/DTOs under `application/web/target/generated-sources`,
compiles all modules, runs domain unit tests (JUnit5/AssertJ/Mockito), the single-module
domain-purity ArchUnit test (`domain/core`), and the reactor-wide ArchUnit suite
(`test/architecture`). Maven Enforcer fails the build at `validate` if a Spring/JPA
dependency is ever added to `domain-shared`/`domain-core`.

## OpenAPI contract

`application/web/src/main/resources/openapi/oei-api.yaml` is a copy of
`frontend/oei-web/openapi/oei-api.yaml` (the backend becomes the dev source of truth going
forward; the frontend copy is untouched by this backend). `application-web`'s `pom.xml`:

- generates Spring server interfaces (`interfaceOnly=true`, one default-`501` method per
  operation — only `GET /api/member/v1/membership` is actually implemented so far, see
  `MembershipResource`);
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

- Only `GET /api/member/v1/membership` is implemented; every other one of the ~90
  operations in the contract returns `501 Not Implemented` via the generated interfaces'
  default methods until a corresponding use case/controller is built.
- No integration tests (Testcontainers) yet for `infrastructure-persistence` /
  `infrastructure-security` — only unit tests. Not requested at this bootstrap stage.
- JaCoCo is wired (`prepare-agent`/`report`) on the `domain` parent POM but no coverage
  *threshold* check (`jacoco:check`) is enforced yet — the skill's 100%-domain-coverage
  target is currently aspirational, not machine-enforced.
