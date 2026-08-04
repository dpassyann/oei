# OEI Mock API

Standalone Express + TypeScript mock server for `frontend/oei-web`, sibling to the
Angular app's `src/` (not part of the Angular build). It is a **third profile**, distinct
from the in-app `*-mock.adapter.ts` (static in-memory data): it lets `*-api.adapter.ts`
(real `HttpClient`) be exercised against a real local HTTP server before the actual Spring
Boot backend exists. See `src/app/infrastructure/adapter/README.md` for the adapter
architecture and `openapi/oei-api.yaml` for the target contract.

**Port:** `8090` (override with `PORT=<port> pnpm dev`)

## Quick start

```bash
cd frontend/oei-web/mock
pnpm install
pnpm dev        # hot-reload via ts-node-dev
```

```bash
pnpm build      # compile to dist/
pnpm start      # run compiled dist/index.js
```

To point the Angular app at this server instead of the in-app mock adapters, run the app
with `dataSource: 'api'` (this server's `GET /config` already advertises that) and
`apiBaseUrl: '/api/v1'` — see `infrastructure/config/runtime-config.ts`.

## Endpoints

| Method | Path                            | Description                                                                          |
| ------ | ------------------------------- | ------------------------------------------------------------------------------------- |
| `GET`  | `/config`                       | Runtime config: `{ dataSource: 'api', apiBaseUrl: '/api/v1' }`                        |
| `GET`  | `/api/v1/content/:lang/:slug`   | Content document; falls back to `en` (`isFallback: true`) if `:lang` has no fixture   |
| `GET`  | `/api/v1/stats/:lang`           | Home page stats (all `value: 0` — no real members/partners/countries yet)            |
| `GET`  | `/api/v1/domains/:lang`         | The 8 domain-of-action categories                                                      |
| `GET`  | `/api/v1/news/:lang?limit=`     | Latest actualités (3 demo items); falls back to `en` if `:lang` has no fixture; `limit` truncates the result |
| `GET`  | `/api/v1/partners/:lang`        | Partners list (3 entries explicitly labelled "démonstration"/"demo")                  |
| `GET`  | `/api/v1/partners/:lang/:id`    | Single partner by id; `404` if `:id` is unknown                                       |
| `POST` | `/api/v1/leads`                 | Livre Blanc email capture; `204` on a syntactically valid email, `400` otherwise. Logs the lead in memory (no persistence). |

### Actualités (`/api/v1/news`) — note on the future real backend

The 3 news items served here are demonstration fixtures matching real, already-happened
project milestones (Livre Blanc publication, site launch, call for working-group
contributions) — see `src/data/news.ts` and
`src/app/infrastructure/adapter/news-mock.adapter.ts` for the honesty rationale.

**Not implemented here (intentionally out of scope):** the real Spring Boot backend
should eventually also expose these actualités as an RSS/Atom feed for external
syndication, e.g. `GET /api/public/v1/news/feed.rss`. This mock server and the frontend
only need the JSON list (`GET /api/v1/news/:lang`) — the RSS/Atom feed is a backend-only
concern documented here so the intent isn't lost, not something to build in this mock or
in the Angular app.

## Fixture data

Each resource has its own fixture file under `src/data/`, kept in sync with the matching
`*-mock.adapter.ts` in the Angular app so both mock layers (in-app mock adapter vs. this
standalone HTTP server) behave identically for the same lang/id:

| Fixture file          | Kept in sync with                                                             |
| ---------------------- | ------------------------------------------------------------------------------ |
| `data/content.ts`       | `content-mock.adapter.ts` — keyed `slug -> lang -> { title, body }`           |
| `data/stats.ts`         | `stats-mock.adapter.ts` — keyed `lang -> Stat[]`                              |
| `data/domains.ts`       | `domains-mock.adapter.ts` — keyed `lang -> DomainArea[]`                      |
| `data/news.ts`          | `news-mock.adapter.ts` — keyed `lang -> NewsItem[]` (plus bonus `category`/`publishedAt` fields not yet in the Angular `NewsItem` model) |
| `data/partners.ts`      | `partner-mock.adapter.ts` — keyed `lang -> Partner[]`                         |
| (leads has no fixture file — captured leads are logged in-memory in `routes/leads.ts`) | `lead-capture-mock.adapter.ts` |

## Project structure

```
mock/
├── src/
│   ├── index.ts          ← Express app, CORS, JSON body parsing, route registration
│   ├── routes/
│   │   ├── config.ts     ← GET /config
│   │   ├── content.ts    ← GET /api/v1/content/:lang/:slug
│   │   ├── stats.ts      ← GET /api/v1/stats/:lang
│   │   ├── domains.ts    ← GET /api/v1/domains/:lang
│   │   ├── news.ts       ← GET /api/v1/news/:lang?limit=
│   │   ├── partners.ts   ← GET /api/v1/partners/:lang, GET /api/v1/partners/:lang/:id
│   │   └── leads.ts      ← POST /api/v1/leads
│   └── data/
│       ├── content.ts
│       ├── stats.ts
│       ├── domains.ts
│       ├── news.ts
│       └── partners.ts
├── package.json           ← Own dependencies (express, cors, ts-node-dev...)
└── tsconfig.json
```
