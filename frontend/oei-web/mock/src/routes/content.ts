import { Router } from 'express';
import { CONTENT_FIXTURES } from '../data/content';

const router = Router();

/**
 * GET /api/v1/content/:lang/:slug
 *
 * Looks up the fixture for the requested slug/lang. If the slug is unknown,
 * responds 404. If the slug is known but the requested lang has no
 * translation, falls back to `en` and marks the response `isFallback: true`
 * — this mirrors `ContentMockAdapter.getHomeContent` exactly, so the
 * standalone mock server and the in-app mock adapter behave identically.
 */
router.get('/:lang/:slug', (req, res) => {
  const { lang, slug } = req.params;
  const fixturesForSlug = CONTENT_FIXTURES[slug];

  if (!fixturesForSlug) {
    res.status(404).json({
      error: 'Not Found',
      message: `No content fixture for slug "${slug}"`,
    });
    return;
  }

  const fixture = fixturesForSlug[lang];
  if (fixture) {
    res.json({ slug, lang, title: fixture.title, body: fixture.body, isFallback: false });
    return;
  }

  const fallback = fixturesForSlug['en'];
  if (!fallback) {
    res.status(404).json({
      error: 'Not Found',
      message: `No content fixture for slug "${slug}" and no "en" fallback available`,
    });
    return;
  }

  res.json({ slug, lang: 'en', title: fallback.title, body: fallback.body, isFallback: true });
});

export default router;
