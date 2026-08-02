# OEI Mock API

Standalone Express + TypeScript mock server for `frontend/oei-web`, sibling to the
Angular app's `src/` (not part of the Angular build).

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

## Endpoints

| Method | Path                          | Description                                                          |
| ------ | ----------------------------- | ---------------------------------------------------------------------|
| `GET`  | `/config`                     | Runtime config: `{ dataSource: 'api', apiBaseUrl: '/api/v1' }`       |
| `GET`  | `/api/v1/content/:lang/:slug` | Content document; falls back to `en` (`isFallback: true`) if `:lang` has no fixture |

## Fixture data

Lives in `src/data/content.ts`, keyed `slug -> lang -> { title, body }`. Kept in sync
with the in-app fallback fixtures in
`../src/app/infrastructure/adapter/content-mock.adapter.ts` so both mock layers
behave identically for the same slug/lang.

## Project structure

```
mock/
├── src/
│   ├── index.ts          ← Express app, CORS, route registration
│   ├── routes/
│   │   ├── config.ts     ← GET /config
│   │   └── content.ts    ← GET /api/v1/content/:lang/:slug
│   └── data/
│       └── content.ts    ← Fixture data (single source of truth)
├── package.json           ← Own dependencies (express, cors, ts-node-dev...)
└── tsconfig.json
```
