# Standalone Mock API Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a standalone Express + TypeScript mock HTTP server at `frontend/oei-web/mock/` that mirrors the `openapi/oei-api.yaml` contract exactly, so `RuntimeConfig.dataSource === 'api'` can be tested end-to-end against real HTTP requests without a live Spring Boot backend — and so the eventual real backend can be built as a near-mechanical translation of this server's routes.

**Architecture:** One Express router file per resource (`content`, `leads`, `stats`, `domains`, `news`, `partners`), each returning fixture data matching the corresponding OpenAPI schema. A `/config` route returns `{ dataSource: 'api', apiBaseUrl: '/api/v1' }` so the Angular app's `RuntimeConfig.load()` can pick this server up directly when pointed at it. This is a completely separate concern from the in-app `*MockAdapter` classes (which remain the `dataSource: 'mock'` default) — this server exists purely to exercise the HTTP/`*ApiAdapter` code path.

**Tech Stack:** Node, TypeScript, Express, `cors`. `ts-node-dev` for hot reload. Modeled on `/Users/ydeungoue/projects/aegis/frontend/aegis-dashboard/mock` (simplicity) and `/Users/ydeungoue/projects/iap/iap-apps-ui/mock` (router-per-resource structure) — read both before starting, do not introduce dependencies neither of them needs (no `multer`/file upload, no `morgan` unless you want request logging, which is optional and welcome but not required).

## Global Constraints

- Location: `frontend/oei-web/mock/` (sibling to `src/`, not part of the Angular build).
- Port: verify free before finalizing (`lsof -tiTCP:8090`) — 8090 is proposed, adjust if occupied, matching the project's established convention of checking for port collisions with the sibling `aegis` project before finalizing.
- Every route's response shape must match its corresponding schema in `frontend/oei-web/openapi/oei-api.yaml` exactly — if the contract doesn't yet have a path this task needs, add it to the contract first (contract-first, matching this project's established convention).
- Mock data must be honest (no fabricated real-world claims — matches every other honesty rule already established in this project: partners clearly marked as demo, no invented member counts, etc.).
- No changes to `frontend/oei-web/src/app/**` in this plan — this plan only adds the standalone `mock/` server and a proxy config entry; it does not touch application code (avoids conflicts with any other plan running in parallel against `src/app/`).

---

### Task 1: Scaffold + `/config` + `/content` route

**Files:**
- Create: `frontend/oei-web/mock/package.json`, `tsconfig.json`, `README.md`
- Create: `frontend/oei-web/mock/src/index.ts`
- Create: `frontend/oei-web/mock/src/routes/config.ts`, `content.ts`
- Create: `frontend/oei-web/mock/src/data/content.ts` (fixture matching `ContentDocument` schema, at least `fr`/`en` for the `home` slug)

- [ ] Verify port availability (`lsof -tiTCP:8090`), adjust if occupied.
- [ ] Scaffold `package.json` (`express`, `cors`, devDeps `typescript`, `ts-node-dev`, `@types/express`, `@types/cors`, `@types/node`), `tsconfig.json`.
- [ ] Implement `src/index.ts`: Express app, `cors()`, mounts `config` and `content` routers, listens on the verified port, logs the listening URL on start.
- [ ] Implement `GET /config` → `{ dataSource: 'api', apiBaseUrl: '/api/v1' }`.
- [ ] Implement `GET /api/v1/content/:lang/:slug` → looks up the fixture data, falls back to `en` with `isFallback: true` for unknown `lang`, matching the existing `ContentMockAdapter`'s fallback behavior exactly (for consistency between the two mock layers).
- [ ] Verify manually: `pnpm dev` inside `mock/`, `curl http://localhost:<port>/config`, `curl http://localhost:<port>/api/v1/content/fr/home` — both return correct JSON.
- [ ] Commit: `feat: scaffold standalone mock API server with config and content routes`

---

### Task 2: Remaining resource routes (leads, stats, domains, news, partners)

**Files:**
- Create: `frontend/oei-web/mock/src/routes/leads.ts`, `stats.ts`, `domains.ts`, `news.ts`, `partners.ts`
- Create matching fixture files under `mock/src/data/`
- Modify: `frontend/oei-web/mock/src/index.ts` (mount the new routers)
- Modify: `frontend/oei-web/openapi/oei-api.yaml` if any of these paths aren't in the contract yet (check against the home-richness plan's Task 1 port shapes: `Stat`, `DomainArea`, `NewsItem`, `Partner` — add corresponding OpenAPI schemas/paths if missing, matching those exact field names)

**Routes:**
- `POST /api/v1/leads` → accepts `{ email: string }`, returns `204` on valid email, `400` on malformed.
- `GET /api/v1/stats` → array of `{ label, value }`, all `value: 0` (honest, no real data yet).
- `GET /api/v1/domains` → array of `{ icon, title, description }`, the 8 real domain-of-action categories (Cybersécurité, Intelligence Artificielle, Informatique Verte, Logiciels Critiques, Formation Continue, Architecture & Qualité, Protection des Données, Éthique & Société).
- `GET /api/v1/news?limit=` → empty array (honest — no real actualités exist yet).
- `GET /api/v1/partners` and `GET /api/v1/partners/:id` → 2-3 entries clearly named as demo data (e.g. `"Partenaire de démonstration"`), never real organization names presented as confirmed partnerships.

- [ ] Implement each route + fixture.
- [ ] Update/add OpenAPI schemas/paths as needed.
- [ ] Verify manually with `curl` against every new route.
- [ ] Update `mock/README.md` with the full route table (method, path, description) — mirroring the clarity of `iap-apps-ui/mock/README.md`.
- [ ] Commit: `feat: add leads, stats, domains, news, and partners mock routes`

---

### Task 3: Wire an alternate proxy profile for API-mode testing

**Files:**
- Create: `frontend/oei-web/proxy.api-mode.conf.json` (separate from the existing `proxy.conf.json`, which stays as the default mock-mode config)
- Modify: `frontend/oei-web/package.json` (add a `start:api-mode` script: `ng serve --proxy-config proxy.api-mode.conf.json`)
- Modify: `frontend/oei-web/mock/README.md` (document how to run frontend + mock server together for API-mode testing)

**Behavior:** `proxy.api-mode.conf.json` forwards `/api` and `/config` to the mock server's port (e.g. `http://localhost:8090`), so running `pnpm start:api-mode` (frontend) alongside `pnpm dev` (mock server, from `mock/`) exercises the full `dataSource: 'api'` HTTP path end-to-end, without touching the default `pnpm start` (mock-mode) experience at all.

- [ ] Create the alternate proxy config and npm script.
- [ ] Manually verify: run both servers, open the app, toggle to API mode via the language-switcher-adjacent `RuntimeConfig` (or `localStorage` override if no UI toggle exists yet), confirm real HTTP requests hit the mock server and render correctly.
- [ ] Document the two-server workflow in `mock/README.md`.
- [ ] Commit: `feat: add API-mode proxy profile for testing against the standalone mock server`
