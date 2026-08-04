import { Router } from 'express';
import { NEWS_FIXTURES } from '../data/news';

const router = Router();

/**
 * GET /api/v1/news/:lang?limit=
 *
 * Matches `NewsApiAdapter.getLatestNews(limit, lang)`, which calls
 * `GET ${apiBaseUrl}/news/${lang}?limit=${limit}`. Falls back to `en` if `:lang` has no
 * fixture (same fallback convention as `/api/v1/content/:lang/:slug`).
 *
 * FUTURE BACKEND NOTE: the real Spring Boot backend should eventually also expose these
 * actualités as an RSS/Atom feed for external syndication (e.g.
 * `GET /api/public/v1/news/feed.rss`). That is intentionally NOT implemented here — this
 * mock server and the frontend only need the JSON list. See `mock/README.md`.
 */
router.get('/:lang', (req, res) => {
  const { lang } = req.params;
  const limit = req.query['limit'] ? Number(req.query['limit']) : undefined;

  const items = NEWS_FIXTURES[lang] ?? NEWS_FIXTURES['en'] ?? [];
  const sliced = typeof limit === 'number' && !Number.isNaN(limit) ? items.slice(0, limit) : items;

  res.json(sliced);
});

export default router;
