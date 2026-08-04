import { Router } from 'express';

const router = Router();

// In-memory log only — no persistence, no real email is sent. Restarting the server clears it.
const capturedLeads: { email: string; capturedAt: string }[] = [];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/v1/leads
 *
 * Matches `LeadCaptureApiAdapter.submit(email)`, which calls
 * `POST ${apiBaseUrl}/leads` with body `{ email }`. Simulates the Livre Blanc lead capture:
 * logs the email in memory and responds `204` on a syntactically valid email, `400` otherwise.
 */
router.post('/', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

  if (!EMAIL_PATTERN.test(email)) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'A valid "email" field is required.',
    });
    return;
  }

  capturedLeads.push({ email, capturedAt: new Date().toISOString() });
  console.log(`[oei-mock-api] lead captured: ${email} (total: ${capturedLeads.length})`);
  res.status(204).end();
});

export default router;
