/**
 * OEI Mock API — Express + TypeScript
 *
 * Standalone mock server for `frontend/oei-web`, sibling to the Angular
 * app's `src/`. Serves:
 * - Runtime config      → GET /config
 * - Content documents    → GET /api/v1/content/:lang/:slug
 * - Home stats           → GET /api/v1/stats/:lang
 * - Domain areas         → GET /api/v1/domains/:lang
 * - Latest news          → GET /api/v1/news/:lang?limit=
 * - Partners             → GET /api/v1/partners/:lang, GET /api/v1/partners/:lang/:id
 * - Lead capture         → POST /api/v1/leads
 * - Contact form         → POST /api/v1/contact
 *
 * Usage: `pnpm dev` (hot-reload) or `pnpm build && pnpm start`.
 */
import cors from 'cors';
import express from 'express';
import configRouter from './routes/config';
import contactRouter from './routes/contact';
import contentRouter from './routes/content';
import domainsRouter from './routes/domains';
import leadsRouter from './routes/leads';
import newsRouter from './routes/news';
import partnersRouter from './routes/partners';
import statsRouter from './routes/stats';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8090;

app.use(cors());
app.use(express.json());

app.use('/config', configRouter);
app.use('/api/v1/content', contentRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/domains', domainsRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/partners', partnersRouter);
app.use('/api/v1/leads', leadsRouter);
app.use('/api/v1/contact', contactRouter);

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: `Endpoint ${req.method} ${req.path} does not exist`,
  });
});

app.listen(PORT, () => {
  console.log(`[oei-mock-api] listening on http://localhost:${PORT}`);
});
