# Home Page Richness + Full Content i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the home page visually in line with `.prompt/maquetteUI.png` (stats bar, domains-of-action grid, actualités excerpt, resources excerpt, partners row) using the established DDD mock/API port pattern, add a Partners feature (domain + mock/API adapters + `/partenaires` page), and make every static page's body content (not just nav/interface strings) actually change when the language switches.

**Architecture:** New domain ports (`StatsPort`, `DomainsPort`, `NewsPort`, `PartnerRepositoryPort`) + application services + mock/API adapter pairs, mirroring `ContentRepositoryPort`/`ContentApplicationService` exactly. Static page content (À propos, Nos missions, Déontologie, Certifications, Actualités, Contact, Mentions légales, Plan du site, Ressources, Membres fondateurs) moves from hardcoded French HTML into the existing `I18nService` translation dictionaries (FR real, EN real translation, DE/ES/IT/PT = FR copy per established convention), read via `i18n.translate()` in each page's template.

**Tech Stack:** Same as existing scaffold (Angular 22, pnpm, DDD layers).

## Global Constraints

- No fabricated data anywhere (stats show `0+` honestly, actualités shows the honest empty state, partners in mock mode are clearly demo data).
- Navy `#0a1e3f` / gold `#e8a530` palette.
- Every `@for` needs `track`.
- No inline templates/styles.
- i18n keys follow the existing nested-JSON dotted-path convention (`section.subsection.key`).
- DE/ES/IT/PT translation files get the FR text verbatim (not translated yet) — never "TBD".

---

### Task 1: Domain layer — Stats, Domains, News, Partner ports

**Files:**
- Create: `frontend/oei-web/src/app/domain/model/stat.ts`, `domain-area.ts`, `news-item.ts`, `partner.ts` (+ `.spec.ts` for each)
- Create: `frontend/oei-web/src/app/domain/port/stats.port.ts`, `domains.port.ts`, `news.port.ts`, `partner-repository.port.ts`

**Interfaces (exact shapes later tasks depend on):**
```typescript
// stat.ts
export interface Stat { readonly label: string; readonly value: number; }
// domain-area.ts
export interface DomainArea { readonly icon: string; readonly title: string; readonly description: string; }
// news-item.ts
export interface NewsItem { readonly title: string; readonly excerpt: string; readonly imageUrl: string; readonly path: string; }
// partner.ts
export interface Partner { readonly id: string; readonly name: string; readonly logoUrl: string; readonly description: string; readonly websiteUrl: string; readonly category: string; }
```
Ports: `StatsPort { getHomeStats(): Promise<Stat[]> }`, `DomainsPort { getDomainAreas(): Promise<DomainArea[]> }`, `NewsPort { getLatestNews(limit: number): Promise<NewsItem[]> }`, `PartnerRepositoryPort { getPartners(): Promise<Partner[]>; getPartner(id: string): Promise<Partner> }` — each with its own `InjectionToken`.

- [ ] Implement each model (plain interface + `createX()` freeze helper, TDD, mirroring `Document`/`createDocument`) and each port + token.
- [ ] Run `pnpm test --watch=false`, all new specs pass.
- [ ] Commit: `feat: add domain models and ports for stats, domains, news, partners`

---

### Task 2: Application services

**Files:**
- Create: `application/service/home-sections-application.service.ts` (+ `.spec.ts`) — one service orchestrating `StatsPort`, `DomainsPort`, `NewsPort` (three small methods: `getStats()`, `getDomainAreas()`, `getLatestNews(limit)`)
- Create: `application/service/partner-application.service.ts` (+ `.spec.ts`) — `getPartners()`, `getPartner(id)`

- [ ] Implement both services (TDD, fake ports in tests), mirroring `ContentApplicationService`'s style.
- [ ] Run full test suite, no regressions.
- [ ] Commit: `feat: add application services for home sections and partners`

---

### Task 3: Infrastructure adapters + wiring

**Files:**
- Create: `infrastructure/adapter/stats-mock.adapter.ts`, `stats-api.adapter.ts` (+ specs)
- Create: `infrastructure/adapter/domains-mock.adapter.ts`, `domains-api.adapter.ts` (+ specs)
- Create: `infrastructure/adapter/news-mock.adapter.ts`, `news-api.adapter.ts` (+ specs)
- Create: `infrastructure/adapter/partner-mock.adapter.ts`, `partner-api.adapter.ts` (+ specs)
- Modify: `app.config.ts` (4 more `useFactory` blocks, same `RuntimeConfig.isMock()` pattern)

**Mock data (honest demo content, not fabricated real-world claims):**
- Stats: all 4 entries at `value: 0` (Membres fondateurs, Partenaires académiques, Pays concernés, Certifications en développement) — matches the Membres fondateurs page's existing honesty rule.
- Domains: the 8 real domain-of-action cards from the mockup (Cybersécurité, Intelligence Artificielle, Informatique Verte, Logiciels Critiques, Formation Continue, Architecture & Qualité, Protection des Données, Éthique & Société) — these are real, already-decided content categories from the project's own vision documents, not fabricated.
- News: mock adapter returns an **empty array** (honest — no real actualités exist yet); the Home component must render the same "aucune actualité publiée pour le moment" state as the existing `/actualites` page, not fabricate demo articles.
- Partners: mock adapter returns 2-3 entries clearly marked as demo (e.g. name `"Partenaire de démonstration"`) — NOT real organization names/logos (IEEE/ACM/EPFL/UNESCO from the mockup are illustrative only, not actual confirmed partners; do not imply a real partnership that doesn't exist).

- [ ] Implement all 8 adapters (API adapters follow the `RuntimeConfig.apiBaseUrl()` pattern, calling `/api/v1/stats`, `/api/v1/domains`, `/api/v1/news?limit=`, `/api/v1/partners`).
- [ ] Wire all 4 ports in `app.config.ts`.
- [ ] Run full test suite + build.
- [ ] Commit: `feat: add mock/api adapters for home sections and partners, wire into app.config`

---

### Task 4: Home page — stats bar, domains grid, actualités, ressources excerpt, partners row

**Files:**
- Modify: `presentation/pages/home/home.ts`, `.html`, `.scss`, `.spec.ts`
- Create: i18n keys for all new static labels (section titles, domain card titles/descriptions) in all 6 language JSON files (`public/i18n/*.json`)

**Behavior:**
- `Home` injects `HomeSectionsApplicationService` and `PartnerApplicationService`, loads stats/domains/news/partners the same reactive way as the hero content (`effect()` re-running on `i18n.currentLang()` change, wrapped in `pendingTasks.run`).
- Render, in order: hero (existing) → stats bar (4 numbers) → domains grid (8 cards) → two-column actualités + ressources excerpt (ressources excerpt = the existing `resourceLinks` list truncated to 3 + "Voir toutes les ressources" link to `/ressources`) → partners row (logos, linking to `/partenaires`).
- Empty/honest states: stats show `0+`, actualités shows the honest empty-state message (reuse wording from `/actualites`), partners row hides entirely if the list is empty (rather than showing an empty section header).

- [ ] Implement per the above, TDD the component (assert stat count, domain card count, honest empty states, partners row presence/absence).
- [ ] Add all new interface-label i18n keys to `fr.json`/`en.json` (real translations) and mirror to `de/es/it/pt.json` (FR copy).
- [ ] Run full test suite + build + e2e (extend `e2e/smoke.spec.ts` or add a new spec asserting the new sections render).
- [ ] Manually verify visually against `.prompt/maquetteUI.png` (screenshot comparison) — note remaining gaps as deferred.
- [ ] Commit: `feat: build out home page sections (stats, domains, news, resources, partners) matching the mockup`

---

### Task 5: Partenaires page

**Files:**
- Create: `presentation/pages/partenaires/partenaires.ts` (+ `.html`, `.scss`, `.spec.ts`)
- Modify: `app.routes.ts`, `site-header.ts`/`.html` (add nav entry or keep discoverable via home's "voir tous les partenaires" link — your call, avoid overcrowding the header nav further; a home-page link plus footer/plan-du-site entry is enough), `plan-du-site.ts`

- [ ] Implement the page: lists all partners with logo/name/description/link/category.
- [ ] Add to `plan-du-site` and route table.
- [ ] Write spec, run full suite + build.
- [ ] Commit: `feat: add partenaires listing page`

---

### Task 6: Full i18n of existing static page content

**Files:**
- Modify: `a-propos.html`/`.ts`, `nos-missions.html`/`.ts`, `deontologie.html`/`.ts`, `certifications.html`/`.ts`, `actualites.html`/`.ts`, `contact.html`/`.ts`, `mentions-legales.html`/`.ts`, `plan-du-site.html`/`.ts`, `ressources.html`/`.ts`, `membres-fondateurs.html`/`.ts` (inject `I18nService`, replace hardcoded French text with `i18n.translate('page.key')` calls)
- Modify: all 6 `public/i18n/*.json` files (add every page's body content as new nested keys, e.g. `apropos.vision.title`, `apropos.vision.body`, `apropos.mission.title`, `apropos.mission.body`, etc. — one key per distinct block of text)

**Behavior:** when a user picks a language via the switcher, every page's body content re-renders in that language, not just the header/footer/nav. Since only FR and EN have real translations for now, DE/ES/IT/PT show the FR text (never raw keys, never "TBD") — matching the interface-strings precedent already set.

- [ ] For each page listed above: extract every static text block into a new i18n key, add the key to `fr.json` (verbatim existing text) and `en.json` (real English translation), mirror to `de/es/it/pt.json` (FR copy), replace the hardcoded HTML text with `{{ i18n.translate('key') }}` calls, inject `I18nService` in the component if not already present.
- [ ] Update each page's `.spec.ts` to assert against the new translate-driven rendering (the existing "heading renders" assertions likely still pass unchanged since `translate()` falls back to the raw key only if the dictionary hasn't loaded — verify each spec still passes; if a spec's `TestBed` doesn't provide a populated `I18nService`, either provide one or assert against the i18n key structure instead of literal rendered text, whichever fits the existing test pattern in this codebase).
- [ ] Add an e2e test: switch to English on a content-heavy page (e.g. `/a-propos`) and assert the Vision/Mission body text actually changes language (not just nav labels).
- [ ] Run full test suite + build + e2e.
- [ ] Commit: `feat: internationalize all static page content (not just interface strings)`
