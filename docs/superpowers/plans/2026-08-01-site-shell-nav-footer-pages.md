# Site Shell (Nav, Footer, Pages, Downloads, Real Login) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current single-page mock scaffold into a real, navigable site: persistent header nav + footer on every page (matching `.prompt/maquetteUI.png`), routed stub pages for every nav item, a Ressources/Téléchargements page displaying the two white paper cover SVGs, and a working "Espace membre" button that redirects to the real Keycloak login.

**Architecture:** A `SiteShell` presentation component wraps `<router-outlet>` in `app.html` (header + footer persist across route changes; only the routed page content swaps). New routed page components live under `presentation/pages/`. The Keycloak redirect uses a small, framework-agnostic `KeycloakAuthService` in `presentation/auth/` (pure UI-triggered navigation to Keycloak's `/auth` endpoint with PKCE — no token exchange/session handling yet, that is explicitly out of scope for this plan and belongs to a dedicated future auth plan).

**Tech Stack:** Same as the existing scaffold (Angular 22, pnpm, DDD layers, `@angular/router`).

## Global Constraints

- Palette: navy `#0a1e3f` / gold `#e8a530`, matching the existing home page and `.prompt/maquetteUI.png`.
- Every `@for` must have `track`.
- No inline templates/styles — every component is `.ts` + `.html` + `.scss` (+ `.spec.ts`).
- This plan does NOT implement full OIDC token exchange, session persistence, or route guards — only the login-button redirect. Say so explicitly in any user-facing copy (no page should imply a completed login flow that doesn't exist yet).
- The Keycloak realm's `oei-frontend` client currently has `redirectUris: ["http://localhost:4200/*"]` (set in the infra plan) but the frontend actually serves on port 4300 in dev — this mismatch must be fixed as part of this plan (update `keycloak/realm-export/oei-realm.json` and recreate the Keycloak container to pick up the change).
- Reuse the docker-compose sandboxed-verification convention already established for the infra repo: `docker compose --project-directory infra --env-file infra/env.local -f infra/docker-compose.yml <cmd>` (never `--project-directory .`).

---

### Task 1: SiteShell — persistent header nav + footer

**Files:**
- Create: `frontend/oei-web/src/app/presentation/components/site-header/site-header.ts` (+ `.html`, `.scss`, `.spec.ts`)
- Create: `frontend/oei-web/src/app/presentation/components/site-footer/site-footer.ts` (+ `.html`, `.scss`, `.spec.ts`)
- Modify: `frontend/oei-web/src/app/app.ts`, `frontend/oei-web/src/app/app.html`
- Modify: `frontend/oei-web/src/app/presentation/pages/home/home.html` (remove the header markup now owned by `SiteHeader` — keep only the hero section)
- Modify: `frontend/oei-web/src/app/presentation/pages/home/home.ts` / `.spec.ts` if the header removal affects them

**Interfaces:**
- `SiteHeader` renders nav links as `routerLink`s to: `/` (Accueil), `/a-propos`, `/nos-missions`, `/deontologie`, `/certifications`, `/ressources`, `/actualites`, `/contact` — plus the existing `oei-language-switcher` and an "Espace membre" button (wired in Task 4, a plain non-functional button for now is fine — Task 4 adds the click handler).
- `SiteFooter` renders: a short quote (reuse `« Le numérique est notre bien commun. Les experts informaticiens en sont les gardiens. » — Ordre des Experts Informaticiens`), a static (non-functional) newsletter email input + button, social icon placeholders (LinkedIn/X/YouTube/Medium — plain `<a>` with `#` href for now), legal links (`/mentions-legales`, `/plan-du-site` — Task 2 creates these), and a copyright line.

- [ ] Implement `SiteHeader` and `SiteFooter` as standalone components (navy header bar, footer with navy background per the mockup), each importing `RouterLink`/`RouterLinkActive` for nav highlighting.
- [ ] Wire both into `app.html`: `<oei-site-header /><router-outlet /><oei-site-footer />`, update `app.ts`'s imports.
- [ ] Remove the now-duplicated header markup from `home.html` (keep the hero `<main>` block only); update `home.spec.ts` if it asserted on the removed header content.
- [ ] Write component specs for `SiteHeader`/`SiteFooter` asserting the nav link count (8) and that each has a real, non-empty `routerLink`.
- [ ] Run `pnpm build` and `NODE_OPTIONS=--no-experimental-webstorage pnpm test --watch=false` — must pass with no regressions (home page e2e smoke test from the prior plan may need a small selector update if it queried header elements now moved — check `e2e/smoke.spec.ts` and update if needed, keeping its intent).
- [ ] Commit: `feat: add persistent site header (nav) and footer`

---

### Task 2: Routed stub pages for every nav item

**Files:**
- Create one component per page (`.ts`+`.html`+`.scss`+`.spec.ts`) under `frontend/oei-web/src/app/presentation/pages/`: `a-propos/`, `nos-missions/`, `deontologie/`, `certifications/`, `actualites/`, `contact/`, `mentions-legales/`, `plan-du-site/`
- Modify: `frontend/oei-web/src/app/app.routes.ts`

**Content guidance (real, on-topic short copy — not "TBD"/lorem ipsum):**
- **À propos**: adapt from `.prompt/02-Vision-Mission-Manifeste.md`'s Vision + Mission (2 short paragraphs).
- **Nos missions**: the manifesto's 6 numbered commitments ("Définir ce qu'est un expert informaticien...", etc.) as a list.
- **Déontologie**: 2-3 sentences explaining the code of ethics is in development, referencing the glossary's definition of "Code de déontologie" vs "Charte".
- **Certifications**: 2-3 sentences on the planned certification framework (levels Praticien→Fellow), referencing the glossary.
- **Actualités**: a simple "aucune actualité publiée pour le moment" placeholder state — this is legitimately empty content at this stage, say so plainly rather than inventing fake news items.
- **Contact**: a static mailto link or contact statement (no working form yet — out of scope) plus a one-line note that a real contact form is planned.
- **Mentions légales**: minimal placeholder noting the association's legal status is being finalized (per `.prompt/05-Roadmap-Administrative-Technique.md`) — do not assert a legal entity exists yet.
- **Plan du site**: a simple list of all routes with links (can reuse `SiteHeader`'s route list).

- [ ] Implement each page component with the content above, each `@Component` importing only what it needs (most need no imports beyond `RouterLink` for internal links).
- [ ] Add all 8 routes to `app.routes.ts` (component-per-path, flat routes, no lazy loading needed at this scale).
- [ ] Write a spec per page asserting its heading text renders (minimal but real assertions, not snapshot-only).
- [ ] Run `pnpm build` + full test suite — must pass.
- [ ] Commit: `feat: add routed stub pages for all nav items`

---

### Task 3: Ressources/Téléchargements page with the white paper cover SVGs

**Files:**
- Create: `frontend/oei-web/public/assets/livre-blanc/couverture-oei.svg` (copy of `.prompt/couverture_livre_blanc_oei.svg`)
- Create: `frontend/oei-web/public/assets/livre-blanc/quatrieme-couverture-oei.svg` (copy of `.prompt/quatrieme_couverture_oei_editable.svg`)
- Modify: `frontend/oei-web/src/app/presentation/pages/ressources/ressources.ts` (+ `.html`, `.scss`, `.spec.ts`) — this REPLACES the plain "Ressources" stub page from Task 2's route (same route, richer content) — if Task 2 already created a bare `ressources` page, extend it here rather than duplicating.
- Modify: `frontend/oei-web/src/app/app.routes.ts` if the route path changes.

**Content:**
- A "Livre Blanc" section showing both cover images side by side (front cover `couverture-oei.svg`, back cover `quatrieme-couverture-oei.svg`) as real rendered `<img>` previews (not just links) — this is the user's explicit requirement: "le preview doit montrer ces svg".
- Below the previews, a list matching the mockup's "Nos ressources" panel: Code de déontologie, Référentiel de compétences, Livre Blanc, Mentions & Positions, Rapports & Études — each a stub link (route to the relevant Task 2 page where one exists, e.g. Code de déontologie → `/deontologie`; otherwise a "à venir" label, not a dead broken link).
- The Livre Blanc's actual markdown content (`content/fr/200-WHITE-PAPERS/livre-blanc-complet.md`) is NOT rendered inline in this task (that requires the content-loading pipeline from the design spec, a separate future task) — this page only shows the cover previews and a note "version complète en cours de finalisation".
- **Email-gated free PDF download.** Business decision (2026-08-01): the Livre Blanc PDF is distributed free, but behind a mandatory email capture (lead generation for founding-member recruitment — not monetization). Implement this the same way `ContentRepositoryPort` was done: a new `domain/port/lead-capture.port.ts` (`LeadCapturePort { submit(email: string): Promise<void> }`, `LEAD_CAPTURE_PORT` injection token), an `application/service/lead-capture-application.service.ts` (`submitEmail(email: string): Promise<{ success: boolean }>`, basic email format validation before calling the port), and two infrastructure adapters: `LeadCaptureMockAdapter` (resolves successfully, logs to console — no real backend yet) and `LeadCaptureApiAdapter` (POSTs to `/api/v1/leads`, same `RuntimeConfig.apiBaseUrl()` pattern as `ContentApiAdapter`), wired via the same `useFactory`-on-`RuntimeConfig.isMock()` pattern in `app.config.ts`. The Ressources page shows an email input + "Recevoir le PDF gratuitement" button gating the PDF download link/section — the actual PDF file doesn't exist yet (out of scope, the print-edition plan in `.prompt/edition-livre-physique/` covers that separately), so after a successful submit, show "Merci — le PDF vous sera envoyé dès sa finalisation" rather than a broken download link.

- [ ] Copy both SVG files into `public/assets/livre-blanc/` (verify they render correctly as standalone SVG files first — open/inspect them).
- [ ] Implement `LeadCapturePort`/`LeadCaptureApplicationService`/both adapters (TDD, mirroring the `ContentRepositoryPort` pattern from the prior plan), wire into `app.config.ts`.
- [ ] Implement the Ressources page with the cover preview gallery, resource list, and the email-gated download form.
- [ ] Write specs: adapter tests (mock + `HttpTestingController` for the API adapter), application service test (email validation rejects malformed input before calling the port), and a page spec asserting both `<img>` elements are present with correct `src`/non-empty `alt`, plus the form's happy-path (valid email → success message shown).
- [ ] Run `pnpm build` + full test suite.
- [ ] Commit: `feat: add resources page with white paper previews and email-gated PDF download`

---

### Task 3bis: "Membres fondateurs" page — honest, no fabricated numbers

**Files:**
- Create: `frontend/oei-web/src/app/presentation/pages/membres-fondateurs/membres-fondateurs.ts` (+ `.html`, `.scss`, `.spec.ts`)
- Modify: `frontend/oei-web/src/app/app.routes.ts`, `frontend/oei-web/src/app/presentation/components/site-header/site-header.ts` (add a 9th nav entry or a footer link — your call on where it fits best without overcrowding the header nav; a footer link plus a CTA from the home page hero is reasonable)

**Content — business decision (2026-08-01):** display the founding-member fee tiers (Étudiant, Membre, Membre fondateur, Membre soutien) as an informational table, and a "members supporting the initiative" count. Since there is no real member yet and no backend to query, **do not display a fabricated number** ("47 membres fondateurs" is explicitly a hypothetical example from external advice, not real data). Instead:
- Show the fee tiers table with real, stated amounts (use the amounts from the guidance: Étudiant 20€, Membre 50€, Membre fondateur 100€, Membre soutien 250€ — these are business-decision amounts, not fabricated, treat them as real content to display).
- Show an honest state for the count: "Mouvement en cours de constitution — soyez parmi les premiers membres fondateurs" instead of any number, with a CTA button to a not-yet-built adhésion form (route to `/contact` for now, or link the `mailto:` contact — whichever Task 2's Contact page provides — with a note "le formulaire d'adhésion en ligne arrive bientôt").
- Frame the copy per the guidance's explicit instruction: never "achetez mon livre" framing — always "soutenez un mouvement."

- [ ] Implement the page with the fee table and the honest zero-state messaging above.
- [ ] Add a discoverable link to it (footer and/or home hero CTA).
- [ ] Write a spec asserting the fee table renders all 4 tiers and that no hardcoded member count string is present (test should fail if someone later reintroduces a fabricated number).
- [ ] Run `pnpm build` + full test suite.
- [ ] Commit: `feat: add founding members page with fee tiers, no fabricated member count`

---

### Task 4: Espace membre — real Keycloak login redirect + realm port fix

**Files:**
- Create: `frontend/oei-web/src/app/presentation/auth/keycloak-auth.service.ts` (+ `.spec.ts`)
- Modify: `frontend/oei-web/src/app/presentation/components/site-header/site-header.ts` (wire the "Espace membre" button's click handler)
- Modify: `keycloak/realm-export/oei-realm.json` (fix `redirectUris`/`webOrigins` from port 4200 to 4300 — the frontend's actual documented dev port per the design spec)

**Behavior:**
- `KeycloakAuthService.login(): void` generates a PKCE `code_verifier`/`code_challenge` pair (Web Crypto API, `crypto.subtle.digest('SHA-256', ...)`, base64url-encoded), stores the verifier in `sessionStorage` (needed later for the token exchange step — not implemented in this plan), and navigates the browser (`window.location.href = ...`) to:
  `http://localhost:8081/realms/oei/protocol/openid-connect/auth?client_id=oei-frontend&response_type=code&redirect_uri=http://localhost:4300/&scope=openid&code_challenge=<challenge>&code_challenge_method=S256`
- The Keycloak base URL (`http://localhost:8081`) should come from a small config constant, not hardcoded inline in multiple places — put it in `keycloak-auth.service.ts` itself (this plan does not need a full runtime-config entry for it, keep it simple).
- `SiteHeader`'s "Espace membre" button calls `keycloakAuth.login()` on click.
- This plan explicitly does NOT implement the callback/token-exchange step — clicking the button takes the user to a real, working Keycloak login page (using the custom OEI theme from the infra plan) and stops there. Note this clearly in the component/report.

- [ ] Update `keycloak/realm-export/oei-realm.json`: change `redirectUris` to `["http://localhost:4300/*"]` and `webOrigins` to `["http://localhost:4300"]`.
- [ ] Recreate the Keycloak container to pick up the realm change: `docker compose --project-directory infra --env-file infra/env.local -f infra/docker-compose.yml up -d --force-recreate keycloak` (from repo root), wait for healthy, verify with `./infra/scripts/verify-realm.sh`.
- [ ] Implement `KeycloakAuthService` with a unit test verifying `login()` correctly constructs the authorization URL (assert on the URL's query params — client_id, response_type, redirect_uri, scope, code_challenge_method — without needing a real browser navigation in the test; a test-only override of the navigation call is acceptable, e.g. injecting a navigable/document abstraction).
- [ ] Wire the button in `SiteHeader`.
- [ ] Manually verify end-to-end: run `pnpm start` (port 4300), click "Espace membre", confirm it lands on the real Keycloak login page (themed) with no redirect_uri mismatch error.
- [ ] Run the full test suite + build.
- [ ] Commit: `feat: wire Espace membre button to real Keycloak login redirect`

---

### Task 5: Final visual pass + e2e coverage

**Files:**
- Modify: `frontend/oei-web/e2e/smoke.spec.ts` (or add `frontend/oei-web/e2e/navigation.spec.ts`)

**Behavior:**
- Add an e2e test that visits each of the 8 routed pages from Task 2/3 and asserts the header/footer are present on every one (proving the shell persists across navigation) and the page renders a non-empty heading.
- Add an e2e test that clicking "Espace membre" navigates away from the app to a URL containing `realms/oei/protocol/openid-connect/auth` (Playwright can assert on `page.url()` after the click without needing Keycloak to actually be running in CI — if Keycloak isn't reachable in this environment, use `page.route()` to intercept the navigation or simply assert on the anchor/button's resulting `window.location` change synchronously before the browser actually completes the cross-origin navigation, whichever is more reliable in practice; document whichever approach is used).
- Run `pnpm e2e` — all pass.
- Manually re-verify visual fidelity against `.prompt/maquetteUI.png` for the header/footer specifically (palette, spacing) and note any remaining gaps as deferred/minor.

- [ ] Implement the two new e2e tests.
- [ ] Run `pnpm e2e`, confirm green.
- [ ] Commit: `test: add e2e coverage for site navigation and login redirect`
