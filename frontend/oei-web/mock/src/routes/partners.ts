import { Router } from 'express';
import { PARTNERS_FIXTURES } from '../data/partners';

const router = Router();

/**
 * GET /api/v1/partners/:lang
 *
 * Matches `PartnerApiAdapter.getPartners(lang)`, which calls
 * `GET ${apiBaseUrl}/partners/${lang}`. Falls back to `en` if `:lang` has no fixture.
 */
router.get('/:lang', (req, res) => {
  const { lang } = req.params;
  res.json(PARTNERS_FIXTURES[lang] ?? PARTNERS_FIXTURES['en'] ?? []);
});

/**
 * GET /api/v1/partners/:lang/:id
 *
 * Matches `PartnerApiAdapter.getPartner(id, lang)`, which calls
 * `GET ${apiBaseUrl}/partners/${lang}/${id}`. Responds 404 if `:id` is unknown.
 */
router.get('/:lang/:id', (req, res) => {
  const { lang, id } = req.params;
  const partners = PARTNERS_FIXTURES[lang] ?? PARTNERS_FIXTURES['en'] ?? [];
  const partner = partners.find((candidate) => candidate.id === id);

  if (!partner) {
    res.status(404).json({
      error: 'Not Found',
      message: `No partner fixture for id "${id}"`,
    });
    return;
  }

  res.json(partner);
});

export default router;
