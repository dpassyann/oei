import { Router } from 'express';
import { STATS_FIXTURES } from '../data/stats';

const router = Router();

/**
 * GET /api/v1/stats/:lang
 *
 * Matches `StatsApiAdapter.getHomeStats(lang)`, which calls `GET ${apiBaseUrl}/stats/${lang}`.
 * Falls back to `en` if `:lang` has no fixture.
 */
router.get('/:lang', (req, res) => {
  const { lang } = req.params;
  res.json(STATS_FIXTURES[lang] ?? STATS_FIXTURES['en'] ?? []);
});

export default router;
