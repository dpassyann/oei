import { Router } from 'express';
import { DOMAINS_FIXTURES } from '../data/domains';

const router = Router();

/**
 * GET /api/v1/domains/:lang
 *
 * Matches `DomainsApiAdapter.getDomainAreas(lang)`, which calls
 * `GET ${apiBaseUrl}/domains/${lang}`. Falls back to `en` if `:lang` has no fixture.
 */
router.get('/:lang', (req, res) => {
  const { lang } = req.params;
  res.json(DOMAINS_FIXTURES[lang] ?? DOMAINS_FIXTURES['en'] ?? []);
});

export default router;
