/**
 * /api/inbound/email — Inbound email parse webhook STUB
 *
 * Mailgun / SendGrid will POST here when an email with a PDF attachment
 * is received. v1: stub that acknowledges the webhook but does nothing yet.
 */

import { Router } from 'express';
import { logger } from '../../utils/logger.js';

const router = Router();

router.post('/email', (req, res) => {
  logger.info('[Inbound stub] Received email webhook', {
    from: req.body?.from,
    subject: req.body?.subject,
  });
  // TODO: parse multipart, extract PDF attachment, create Deal + trigger pipeline
  res.status(200).json({ received: true, message: 'Inbound email parsing not yet implemented' });
});

export default router;
