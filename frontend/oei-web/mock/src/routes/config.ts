import { Router } from 'express';

const router = Router();

/**
 * GET /config
 * Runtime configuration consumed by the Angular app's config adapter, telling
 * it to talk to this mock API server for content instead of using the
 * built-in in-app mock adapter.
 */
router.get('/', (_req, res) => {
  res.json({
    dataSource: 'api',
    apiBaseUrl: '/api/v1',
  });
});

export default router;
