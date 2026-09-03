# Member Space — Current State Audit

Source: reconciled findings from 8 read-only specialist audits (Agents A-H) of the current
repository state (main, commit `ba49daf` + uncommitted working-tree diff). Every claim below
is grounded in a specific file cited by at least one agent; no claim is asserted without a
file reference. Where two agents describe the same model differently, both descriptions are
reconciled explicitly under "Cross-agent reconciliation notes" at the end of each section.

Legend: **Works** = real, wired, end-to-end. **Mocked** = intentionally fake but transparently
labelled as such (Javadoc/OpenAPI says "mocked"). **Broken** = present but non-functional,
inconsistent, or dead code with no explanatory mock label. **Disabled** = deliberately gated
off pending a business/procurement/ADR decision. **Reuse** = keep as template/foundation.
**Needs migration** = concrete follow-up work identified.

---

## 1. Bootstrap / Professional Profile / Onboarding

**Works**
- `GET /api/member/v1/bootstrap` is real end-to-end: OpenAPI contract → `BootstrapService` →
  `BootstrapAdapter` → `GetMemberBootstrapUseCase` → `GetMemberBootstrapService` →
  `BootstrapDtoMapper` → `MemberBootstrapDTO`.
- Missing profile is modeled as a domain state (`ProfileStatus.ONBOARDING_REQUIRED`), never an
  HTTP error — `GetMemberBootstrapService.java`, `ProfileStatus.java` Javadoc explicitly says
  "never map this to HTTP 500".
- `ProfileStatus` enum has all 5 target values (`ONBOARDING_REQUIRED`,
  `ONBOARDING_IN_PROGRESS`, `PROFILE_INCOMPLETE`, `READY`, `SUSPENDED`), mirrored in OpenAPI and
  the Angular type.
- Frontend `bootstrap.guard.ts` + `MemberOnboardingFlowService` correctly redirect into the
  real Smart Onboarding flow (`smart-onboarding.ts/.html`) based on `profileStatus`.
- A named-persona mock adapter (`member-bootstrap-mock.adapter.ts`) exists for frontend-only dev.

**Mocked**
- `MemberBootstrapMockAdapter` is a legitimate hardcoded persona map standing in for the real
  HTTP adapter during frontend dev; none of its personas carry a `cvStatus` field (the model
  doesn't have one yet).

**Broken**
- `CvStatus` enum (`DRAFT`, `READY` only) does **not** match the target spec's CV
  import-pipeline states (`NONE`, `UPLOADED`, `PROCESSING`, `REVIEW_REQUIRED`, `READY`,
  `FAILED`) — it models a different concept (CV content-editing state) and should not be
  confused with the desired bootstrap `cvStatus`.
- `MemberBootstrap` record has **no `cvStatus` field at all** — absent from domain record,
  OpenAPI schema, DTO mapper, frontend model, and mock adapter, end to end.
- `GetMemberBootstrapService.computeProfileStatus()` only ever returns `READY` or
  `PROFILE_INCOMPLETE` (score ≥ 50 threshold) plus `ONBOARDING_REQUIRED`. It never produces
  `ONBOARDING_IN_PROGRESS` or `SUSPENDED` — both are documented in the enum's own Javadoc as
  reachable states but are dead code paths in the real service.

**Disabled**
- Nothing found deliberately feature-flagged off; the two missing states above look like
  unimplemented logic, not intentional gating.

**Reuse**
- `ProfileStatus` enum and its full plumbing — no changes needed.
- The `*Adapter/*Service/*DtoMapper` hexagonal pattern used by Bootstrap is the correct template
  to extend for `cvStatus`.
- Frontend guard/flow signal pattern (`computed(needsOnboarding)`) is ready to extend.

**Needs migration**
- Introduce a distinct CV-document-lifecycle enum (e.g. `CvImportStatus`: `NONE`, `UPLOADED`,
  `PROCESSING`, `REVIEW_REQUIRED`, `READY`, `FAILED`) rather than overloading the existing
  `CvStatus` (which is tied to unrelated CV CRUD/translation code).
- Add `cvStatus` through the full stack: OpenAPI schema, DTO, domain record, service
  computation, frontend model, mock adapter, and any UI reacting to `REVIEW_REQUIRED`/`FAILED`.
- Implement real logic for `ONBOARDING_IN_PROGRESS` (needs a source of truth — likely tied to
  the CV-import pipeline in §3) and `SUSPENDED` (needs an administrative suspension flag,
  currently absent from `Member`/`ProfessionalProfile`/`Membership`).

---

## 2. LinkedIn Integration

**Works**
- Real OAuth 2.0 authorization-code flow (not a stub): `LinkedinOAuthService.ts` builds the
  authorization URL with CSRF `state` stored in `sessionStorage`; `LinkedinAuthorizationClient`
  performs a genuine server-side code-for-token exchange against LinkedIn's OAuth endpoint;
  `LinkedinProfileClient` fetches identity via LinkedIn's official OIDC `/v2/userinfo` (no HTML
  scraping).
- Client id/secret externalized correctly (env vars backend-side, `RuntimeConfig`/placeholder
  guard frontend-side).
- Full hexagonal wiring: `LinkedinAuthorizationPort`/`LinkedinIdentityPort` →
  `ImportLinkedinBasicService` → `ProfileImportAdapter`/`ProfileImportService` → two REST
  endpoints in `MemberProfileResource`.
- `ProfileSource` enum (`LINKEDIN_BASIC`/`CV_IMPORTED`/`LINKEDIN_AND_CV`/`MANUAL`) preserves
  provenance on `ProfessionalProfile`.

**Mocked**
- `ProfileImportMockAdapter.importLinkedinBasic*()` returns a canned `DEMO_PROFESSIONAL_PROFILE`
  — a legitimate demo-data mock, not deceptive production code.

**Broken**
- The direct `importLinkedinBasic(accessToken)` raw-token endpoint/port/adapter chain is fully
  wired but never invoked by any UI — dead code, and a latent risk pattern (accepting a bare
  client-supplied bearer token) that the project's own security checklist warns against.
- `LinkedinProfileHttpClient`/`LinkedinBasicProfile` are dead code (superseded by the generated
  `UserInfoApi` client actually in use).
- `MemberProfileResource.importLinkedinBasic(...)` / `...FromAuthorizationCode(...)` are manual
  `@PostMapping`s that do **not** `@Override` the generated `MemberProfileApi` interface, even
  though the OpenAPI contract declares matching `operationId`s — a contract-first bypass with no
  explanatory TODO (unlike the analogous bootstrap case).
- No OIDC nonce validation exists (only `state`/CSRF is checked); no ID-token verification path.

**Disabled**
- No feature flag gates LinkedIn in running code; the spec's suggested
  `LINKEDIN_EXTENDED_PROFILE_ENABLED` env var exists only in a planning doc.

**Reuse**
- Port/adapter split mirrors the Stripe/PayPal pattern — good template for future integrations.
- Frontend OAuth state-validation pattern is reusable for any future third-party connect flow.

**Needs migration**
- No `LinkedInConnection` persistence model exists anywhere (userId, linkedinSubject,
  connectedAt, scopes, tokenMetadata, lastSyncedAt, status are all absent) — the access token is
  used once in-memory and discarded. This is a structural gap, not a missing field.
- No disconnect flow and no audit trail of LinkedIn connect events (both depend on the missing
  persistence model above).
- Remove or explicitly deprecate the unused raw-token `importLinkedinBasic(accessToken)` path.
- Re-run `mvn generate-sources` and migrate the two resource methods to properly `@Override`
  `MemberProfileApi` per repo convention.

---

## 3. CV Import + AI Extraction ("Smart CV Import")

**Works**
- OpenAPI fully specifies the pipeline (upload → extract → AI process → draft → confirm) at
  `/api/member/v1/profile-import/cv[...]`.
- `ProfessionalProfile`/`ProfileSource` already anticipate `CV_IMPORTED`/`LINKEDIN_AND_CV`, but
  nothing sets them yet because no CV-import service exists.
- Frontend has a complete UI/UX flow (`smart-onboarding` pages, `profile-import.port.ts`,
  `profile-import.ts` states `CREATED→...→COMPLETED/FAILED/EXPIRED`) with a mock and a real HTTP
  adapter switched via `RuntimeConfig.isMock()`.

**Mocked**
- The entire "AI extraction" step is mocked **frontend-only**: `profile-import-mock.adapter.ts`
  fabricates a session and advances it through
  `DOCUMENT_UPLOADED→EXTRACTING→AI_PROCESSING→REVIEW_REQUIRED` via `rxjs timer()`, returning a
  static `DEMO_PROFESSIONAL_PROFILE` — no real parsing or AI call ever happens.
- Generic media upload (`UploadMediaAssetService`) is explicitly documented as mocked: no object
  storage wired, bytes never persisted.
- Antivirus/malware scanning is hardcoded `CLEAN` synchronously on every upload — no engine
  wired anywhere.

**Broken**
- **No backend implementation of the CV-import pipeline exists at all.** The generated
  `MemberProfileImportApi` interface (`initiateProfileImportFromCv`, `getProfileImport`,
  `getProfileImportDraft`, `updateProfileImportDraft`, `confirmProfileImport`) defaults every
  method to HTTP 501; zero classes implement it, so the routes aren't even registered.
- The only backend `ProfileImportAdapter` covers only the two LinkedIn methods — no
  `initiateCvImport`/`getImportDraft`/`confirmImport` exists anywhere in the backend.
- The frontend's real (non-mock) `profile-import-api.adapter.ts` calls endpoints that do not
  exist server-side — this flow would fail end-to-end against a live backend.
- No PDF/DOCX parsing library, no Spring AI / Amazon Bedrock / Amazon Textract dependency
  anywhere in the codebase (verified by pom.xml grep).
- No `CvImportPort` or AI-extraction port/use-case exists; only LinkedIn-specific import
  vocabulary is present.
- No CV file storage exists — `Cv`/`CvEntity` only persist manually-entered structured text
  (jsonb), no field for uploaded bytes, no encryption-at-rest.

**Disabled**
- Not disabled — simply absent. The frontend's mock adapter is what actually drives the UI in
  the current default/demo configuration.

**Reuse**
- OpenAPI contract already fully specifies the target shape — implement against it, don't
  redesign it.
- `ImportLinkedinBasicService`/`ProfileSource`/`ProfessionalProfile.withSource()` is the right
  template for a future `ImportCvService`.
- Frontend port/model/pages are already built against the final contract; should need no rework
  once the backend catches up.

**Needs migration**
- Build from scratch: `MemberProfileImportApi`-implementing controller, `ProfileImport`
  aggregate + persistence + status machine, multipart upload with size/MIME validation +
  malware scanning, real object storage (S3/MinIO), text-extraction adapter, AI-extraction
  adapter (Spring AI + Bedrock candidate per stack conventions), draft-review/confirm
  orchestration feeding `ProfessionalProfile`.

**Cross-agent reconciliation note (Agent A vs Agent C on `cvStatus`)**: Agent A frames the
missing `cvStatus` as a bootstrap-contract gap; Agent C frames it as "no CV-import backend
exists at all." Both are consistent — the bootstrap-level `cvStatus` field (§1) should logically
be a projection of the CV-import pipeline's status machine (§3) once built. They should be
designed together, not independently.

---

## 4. Payments / Membership / Entitlements

**Works**
- Full membership domain model (`Membership`, `MembershipTier`, `MembershipStatus` with
  enum-strategy `entitlements()`/`grantsEntitlements()`), `MembershipEntitlement` (14
  capabilities), mirrored 1:1 in OpenAPI and Angular.
- `MembershipFeeTier`/`MembershipFeeAccount`/`MembershipFeePayment` model annual dues, kept
  deliberately distinct from `MembershipTier` per Javadoc.
- A real, fully wired **store-checkout** payment infrastructure: `Payment` state machine,
  `PaymentMethod` (CARD/PAYPAL) enum-strategy delegating to `PaymentProviderPort`,
  `PaymentProviderBinder`, `StripePaymentProviderAdapter`, `PaypalPaymentProviderAdapter` (both
  generated from vendor OpenAPI specs, both unit-tested), consumed end-to-end by
  `PayOrderService`.
- Frontend `MembershipEntitlementService` computes entitlements client-side, deliberately kept
  in sync with backend `MembershipStatus.entitlements()`.

**Mocked**
- `PayMembershipFeeService` is explicitly documented as mocked: every payment is unconditionally
  recorded `PAID`; annual dues are **not** wired to Stripe/PayPal at all (unlike store orders).
- `MembershipFeeAccount`'s billing-cycle-due calculation is deferred to the caller (currently a
  frontend mock), not implemented server-side.

**Broken**
- **No server-side enforcement of `MembershipEntitlement` anywhere.** It's used only for
  serializing the entitlements DTO for display; no `@PreAuthorize`/capability guard exists in
  any Resource. Enforcement today is effectively client-side only (bypassable by any direct API
  caller) — this is the most significant security-relevant gap in this domain.

**Disabled**
- None found feature-flagged; the membership-fee real-payment path is simply unimplemented.

**Reuse**
- `Membership`/`MembershipStatus`/`MembershipTier`/`MembershipEntitlement` as-is — contract-frozen
  per ADR-0002, do not rename/reorder.
- The entire Stripe/PayPal `PaymentProviderPort` infrastructure is directly reusable to wire real
  membership-fee charging (template: `PayOrderService`).

**Needs migration**
- Rewire `PayMembershipFeeService` to actually charge via `PaymentMethod`/`PaymentProviderPort`
  instead of the mocked unconditional-`PAID` logic.
- Design and add a genuine server-side entitlement/capability gate (e.g.
  `canUse(memberId, MembershipEntitlement)`) protecting `ARTICLE_SUBMIT`, `EVENT_POST`,
  `BUSINESS_CARD_ORDER`, `CV_EXPORT_PDF`, etc. — currently these rely only on the frontend gate.
- Implement server-side billing-cycle-due calculation for `MembershipFeeAccount`.

**Cross-agent reconciliation note (Agent D vs Agent H on entitlement enforcement)**: Agent D
identifies the *absence* of server-side entitlement checks as a functional gap; Agent H
independently flags the broader absence of authorization-in-depth (broad public-URL allowlist,
no member-level audit log). These are two facets of the same root issue — **authorization
decisions live only in the browser today** — and should be fixed together as one initiative,
not as two separate backlog items.

---

## 5. Wallet / QR / Digital Business Card

**Works**
- Client-side QR rendering is real and scannable: `styled-qr.ts` uses the real `qrcode` npm
  package with error-correction level `H`, OEI navy/gold styling, encoding the card's real
  public URL.
- Full hexagonal wiring end-to-end for wallet passes: domain model, use case, port, persistence
  adapter + Liquibase migration, REST resource, OpenAPI contract, Angular port with both real and
  mock adapters — wired into member card + public verification pages.
- Pass lifecycle (issue/list/revoke/verify) is implemented and covered by unit/integration tests.

**Mocked**
- Every `WalletPass` is hardcoded `mocked=true`, status `MOCKED`, serial `MOCK-<uuid>` —
  `CreateWalletPassService` is documented as "the sole place allowed to construct one." No real
  signed `.pkpass` (Apple) or signed pass object (Google) is ever generated ("no publisher
  certificate available").
- OpenAPI explicitly labels the wallet section "mocked", each endpoint summary states no real
  signed rendering exists, referencing "ADR 0002 §Wallet."
- Frontend `WalletApiAdapter` forcibly re-wraps every pass to guarantee `mocked:true`
  client-side too, "so the guarantee never depends on backend discipline alone."
- `DigitalBusinessCard` is likewise fully mocked: hardcoded fake `qrCodeUrl`/`vCardUrl`, never
  persisted (regenerated on every call).

**Broken**
- None found — the mocked code paths work exactly as designed; no crashes or unlabelled dead
  code in this domain.

**Disabled**
- Real Apple/Google Wallet pass issuance is explicitly out of scope for V1 per a referenced "ADR
  0002" comment (wallet activatable once publisher accounts/certificates exist) — a deliberate
  business/procurement gate, not unfinished code.

**Reuse**
- The full hexagonal skeleton (port, persistence, resource, OpenAPI, Liquibase changelog) is
  reusable as-is; only `CreateWalletPassService`'s body needs replacing once certificates exist.
- Frontend `WalletPort`/adapters and `StyledQr` canvas renderer are production-ready.

**Needs migration**
- No `AppleWalletAdapter`/`GoogleWalletAdapter` exist anywhere (confirmed via repo-wide search
  for `pkpass`, `passkit`, `walletobjects`) — zero scaffolding beyond the mocked domain model.
- No configuration keys exist for Apple Team ID/Pass Type Identifier/signing cert or Google
  service-account JSON.
- **ADR 0002 itself was not found as a file anywhere in the repo** (no `docs/adr/*0002*` match)
  — it is referenced repeatedly in code comments but its actual decision content is unverified
  beyond paraphrase. This should be resolved before further wallet work (see open questions).

---

## 6. Professional Neural Network (Salary Transparency)

**Works**
- Full hexagonal implementation: `NetworkGraphPort`, `SalaryInsightPort`/`GetSalaryInsightUseCase`
  wired via `NetworkResource` implementing the generated `PublicNetworkApi` (contract-first).
- The anonymity threshold (5 declarations, per project memory) is centrally enforced:
  `GetSalaryInsightUseCase.MIN_ANONYMIZED_SAMPLE_SIZE = 5` and the frontend
  `anonymization.ts` constant are documented as intentionally duplicated and kept in sync.
  `GetSalaryInsightService` is the sole enforcement point, returning HTTP 204 (a value state,
  not an error) when below threshold.
- Real persistence: `CompensationDeclarationEntity`/`Repository` with a JPQL aggregate query
  (MIN/MAX/COUNT/currency/period); `NetworkDomain`/`NetworkTopic`/`NetworkExpert` persisted and
  reused directly from real/demo member rows (no synthetic identities).
- Frontend is genuinely dynamic, not hardcoded: switches between
  `NetworkGraphMockAdapter`/`NetworkGraphApiAdapter` via `RuntimeConfig.isMock()`, same pattern
  as ~40 other ports in `app.config.ts`.
- Deterministic demo dataset seeded via Liquibase (50 demo members, 32 compensation rows, 9
  domains/18 topics/50 experts).

**Mocked**
- `NetworkGraphMockAdapter` (416 lines) remains as the default frontend-only mock when
  `RuntimeConfig.dataSource === 'mock'`.

**Broken**
- The anonymized salary pool is **entirely static demo seed data with no live write path.** A
  member's own `ProfessionalProfile.currentCompensation` is explicitly documented as *not* wired
  into `compensation_declaration` — the feature can only ever reflect the 32 seeded rows, never a
  real member's declaration, until this link is built.
- Demo topic/certification coverage is intentionally partial (18 of ~54 topics seeded, DOMAIN-
  only compensation rows, no TOPIC/CERTIFICATION rows) with an explicit TODO in the seed file.

**Disabled**
- None found.

**Reuse**
- The hexagonal shape (`NetworkGraphPort`/`SalaryInsightPort` in domain-shared,
  `GetSalaryInsightService` as sole anonymity-rule enforcer, adapter layering) is a solid
  template to extend for additional exploration dimensions.
- The `RuntimeConfig.isMock()` adapter-swap convention needs no new plumbing for this feature.
- The dual-source `MIN_ANONYMIZED_SAMPLE_SIZE` pattern is the already-complete implementation of
  the project memory's "seuil anonymat 5 déclarations" requirement.

**Needs migration**
- Wire `ProfessionalProfile.currentCompensation` submission (or a dedicated opt-in declaration
  flow — decision needed, see open questions) into `compensation_declaration` INSERTs tied to a
  member's node type/id.
- Expand the demo seed from 18 to ~54 topics for front/back parity (explicit TODO already
  present).
- Add TOPIC/CERTIFICATION-level seed rows if those endpoints are expected to return data before
  real declarations exist.
- No modeling yet exists for exploration dimensions beyond node type + country (e.g. seniority,
  company size) if the "multi-dimensional exploration engine" spec requires them.

**Cross-agent reconciliation note (Agent F vs project memory)**: Project memory states the
network "must become dynamic/backend" with a "seuil anonymat 5 déclarations" and "contrat
modélisé avant implémentation." Agent F confirms the anonymity threshold and contract are
already fully modeled and enforced server-side — that part of the memory's goal is **already
done**. What remains open (and is the real ambiguity) is whether "dynamique/backend" was meant
to also cover the live member-declaration write path, which is explicitly NOT wired yet. See
open questions below.

---

## 7. Security / Privacy (cross-cutting)

**Works**
- CORS is a strict allowlist (`CorsConfiguration.java`) — real origins only, credentials only
  combined with named origins, never `"*"`.
- Two-filter-chain auth model (`OeiSecurityAutoConfiguration.java`): public allowlist (Order 1)
  + Keycloak-JWT-required catch-all (Order 2); CSRF disabled but justified by stateless
  bearer-token auth (no cookies) — confirmed consistent with frontend `RuntimeConfig`.
- OIDC issuer resolution is consistent between environments and commits, no hardcoded mismatch.
- Prod DB/Keycloak admin credentials are sourced purely from env vars with no baked-in default.
- Institution-level audit logging is real and wired end-to-end (port + persistence + Liquibase
  migration + resources).
- Test coverage exists for member-facing resources (`AdminMembersResourceTest`,
  `MemberProfileResourceTest`, `MembershipServiceTest`, one Cucumber feature).
- Keycloak `CONFIGURE_TOTP` required-action is defined and `enabled=true` (MFA available, opt-in).

**Broken (security-critical — highest priority in the whole audit)**
- **Unprotected secret-looking files sit untracked and un-gitignored in the working tree**:
  `oei-prod-key.pem` (repo root), `.prompt/local/oei-prod-secrets.txt`,
  `.prompt/local/oei-prod.env`. `git check-ignore -v` returns nothing for all three — the
  `.gitignore` only excludes literal `.env`/`*.local.env`, not these patterns. A plain
  `git add -A` would stage a production private key and prod secrets into git history. **This
  is a live, unmitigated risk and should be fixed before any further commit in this repo.**
- Keycloak has no `bruteForceProtected`/`failureFactor` configured, and no `passwordPolicy` — no
  lockout policy, weak passwords accepted.
- MFA/TOTP is defined but `defaultAction=false` — never enforced, opt-in only.
- No rate limiting anywhere in the backend (verified by repo-wide grep) — public endpoints and
  the Keycloak login path are unthrottled.
- Audit logging exists only for Institution — no equivalent for member-level admin
  edits/deletions or membership-fee payment events.
- The public-URL allowlist (`/api/v1/**`, `/content/**`, `/actuator/prometheus`) is overly broad
  — a blanket unauthenticated bypass for entire path prefixes, and internal metrics are exposed
  without auth.
- Caddy security headers (HSTS, X-Frame-Options, etc.) are applied only to the `grafana.`
  vhost — `api.theitorder.global` and `auth.theitorder.global` (the actual API and Keycloak
  endpoint) have none.
- Cucumber membership coverage is a single happy-path scenario — no negative/authorization
  scenarios despite `AdminMembersResource` existing.

**Disabled**
- CSRF protection explicitly disabled on both filter chains — acceptable given stateless
  bearer-token auth (no cookies), confirmed consistent with frontend behavior.

**Reuse**
- The two-filter-chain pattern is clean and reusable — only the allowlist *contents* need
  tightening, not the pattern.
- The Institution audit-log pattern (port + entity/adapter + Liquibase changelog) is the right
  template to replicate for member-level audit logging.

**Needs migration**
- Add `.gitignore` rules for `oei-prod*.pem`/`oei-prod*.env`/`oei-prod*secrets*` immediately, and
  verify (via `git log --all --source`) that none of the three flagged files have ever been
  committed — if they have, secret rotation + history rewrite is required.
- Enable Keycloak `bruteForceProtected` + a `passwordPolicy` before go-live.
- Flip `CONFIGURE_TOTP` `defaultAction` to `true` (or scope to admin/institution roles at
  minimum).
- Introduce request rate limiting (Bucket4j filter or Caddy `rate_limit` directive) on public
  endpoints and the Keycloak login path.
- Extend audit logging to member profile/admin mutations and membership-fee payment events.
- Narrow `/api/v1/**`/`/content/**` public matchers to precise sub-paths; add security headers
  to the `api.`/`auth.` Caddy blocks.
- Expand `membership.feature` with negative/authorization scenarios.

---

## Cross-agent reconciliation summary

| Overlap | Agents | Reconciliation |
|---|---|---|
| Server-side authorization gap | D, H | Same root cause (browser-only authorization); should be one fix initiative, not two backlog items — see §4/§7. |
| CV import `cvStatus` | A, C | A finds the contract gap at the bootstrap DTO level; C finds the entire pipeline missing at the service level. Design together: bootstrap `cvStatus` should project the CV-import status machine once built (§1/§3). |
| ADR 0002 (Wallet) | E, D (payments contract-freeze mentions ADRs generally) | No ADR 0002 file exists anywhere in the repo (`docs/adr/*0002*` not found) — only paraphrased in code comments across two independent audits. Treat as an open question, not a verified decision, until the actual document is located or written. |
| Salary-transparency "dynamic/backend" milestone | F, project memory | The anonymity-threshold/contract part of the memory's goal is done; the live-declaration write path is explicitly not — see §6 note. |
| Secrets hygiene | G, H | Both independently found `oei-prod-key.pem`/`oei-prod-secrets.txt`/`oei-prod.env` untracked and ungitignored. Confirmed by two agents from different angles (CI/CD file inventory vs. security review) — treat as fully corroborated, highest-confidence finding in this whole audit. |

---

## Open questions for the owner (prioritized, merged across all agents)

1. **[Security, urgent]** Have `oei-prod-key.pem`, `.prompt/local/oei-prod-secrets.txt`, or
   `.prompt/local/oei-prod.env` ever been staged/committed in git history? (Agents G, H — could
   not run full history inspection in sandbox; run `git log --all --source -- oei-prod-key.pem`
   etc. directly.)
2. **[Payments/Entitlements]** Is `canUse(userId, capability)` expected as a literal new
   interface, or is reusing `MembershipStatus.entitlements()` server-side inside existing
   Resources sufficient? Not found verbatim anywhere in the codebase. (Agent D)
3. **[CV import]** Should `cvStatus` reuse/extend the existing `Cv.status` (DRAFT/READY), or is
   it an entirely new orthogonal import-pipeline concept? Existing `CvStatus` semantics don't map
   onto the target `NONE/UPLOADED/PROCESSING/REVIEW_REQUIRED/READY/FAILED` states. (Agent A)
4. **[Bootstrap]** What data source should determine `ONBOARDING_IN_PROGRESS` vs
   `ONBOARDING_REQUIRED`, and what determines `SUSPENDED`? No persisted "onboarding session" or
   suspension flag was found anywhere in the domain model. (Agent A)
5. **[Wallet]** ADR 0002 is referenced repeatedly in code comments but the document itself was
   not found in the repo under any `docs/adr/` path — its actual scope/decision is unverified
   beyond paraphrase. Does it exist elsewhere, or does it need to be written down? (Agent E)
6. **[Salary transparency]** What should trigger a `compensation_declaration` row — the member's
   `ProfessionalProfile.currentCompensation` field directly, a separate opt-in "contribute to
   salary transparency" action, or something else? This contract decision is not yet made in
   code. (Agent F)
7. **[CI/CD]** Could not verify from the sandbox whether GitHub repo/environment variables
   (`AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `FRONTEND_S3_BUCKET`,
   `FRONTEND_CLOUDFRONT_DISTRIBUTION_ID`) actually exist and are correctly set (`gh` auth
   returned 401 in sandbox) — must be checked via `gh variable list` against the real repo.
   (Agent G)
8. **[CI/CD]** Is the GitHub repo `dpassyann/oei` public or private? If private, does the EC2
   instance's `git fetch` have credentials provisioned anywhere (none found in Terraform/user_data)?
   (Agent G)
9. **[LinkedIn]** Is the unused `importLinkedinBasic(accessToken)` raw-token endpoint kept
   intentionally for a future mobile client doing its own OAuth, or is it dead code to remove?
   (Agent B)
10. **[Neural network]** Is the current backend-driven graph + anonymized-insight state (with a
    static demo declaration pool) already considered the completed "dynamique/backend"
    milestone from project memory, or does that milestone also require the live
    member-declaration write path? (Agent F, reconciled against project memory)
11. **[Security]** Is Keycloak `CONFIGURE_TOTP` `defaultAction=false` an intentional phased
    rollout (MFA optional now, enforced later) or an oversight? Not stated anywhere in the realm
    export or commit messages. (Agent H)
12. **[Wallet/CV/LinkedIn — general]** Whether any AWS Secrets Manager entries, Apple
    Developer/Google Wallet accounts, or design docs under `.prompt/` (not fully inspected by
    every agent) already answer some of the above was out of scope for this read-only pass and
    should be checked before committing to any of these designs. (Agents C, E)
