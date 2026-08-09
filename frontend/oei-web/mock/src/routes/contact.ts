import { Router } from 'express';

const router = Router();

// In-memory log only — no persistence, no real email is sent. Restarting the server clears it.
const receivedMessages: { name: string; email: string; subject?: string; message: string; receivedAt: string }[] = [];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/v1/contact
 *
 * Matches `ContactApiAdapter.submit(message)`, which calls `POST ${apiBaseUrl}/contact` with
 * body `{ name, email, subject?, message }`. Simulates receiving the public contact form
 * submission: logs it in memory and responds `204` if the payload is valid, `400` otherwise.
 */
router.post('/', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : undefined;
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!name || !EMAIL_PATTERN.test(email) || !message) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Valid "name", "email" and "message" fields are required.',
    });
    return;
  }

  receivedMessages.push({ name, email, subject, message, receivedAt: new Date().toISOString() });
  console.log(`[oei-mock-api] contact message received from ${email} (total: ${receivedMessages.length})`);
  res.status(204).end();
});

export default router;
