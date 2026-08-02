/**
 * OEI Mock API — Express + TypeScript
 *
 * Standalone mock server for `frontend/oei-web`, sibling to the Angular
 * app's `src/`. Serves:
 * - Runtime config      → GET /config
 * - Content documents    → GET /api/v1/content/:lang/:slug
 *
 * Usage: `pnpm dev` (hot-reload) or `pnpm build && pnpm start`.
 */
import cors from 'cors';
import express from 'express';
import configRouter from './routes/config';
import contentRouter from './routes/content';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8090;

app.use(cors());

app.use('/config', configRouter);
app.use('/api/v1/content', contentRouter);

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
