/**
 * /api/inbound/email — Secure Inbound Webhook Parser & Event Logger
 */

import { Router } from 'express';
import { logger } from '../../utils/logger.js';
import { verifyWebhookSignature, recordWebhookEvent, markWebhookProcessed } from '../../services/webhook.service.js';
import { ingestInboundLead } from '../../services/lead.service.js';

const router = Router();

router.post('/email', async (req, res) => {
  const provider = 'email';
  const signatureHeader = req.headers['x-webhook-signature'] as string | undefined;
  const eventId = (req.body?.eventId || req.headers['x-request-id'] || `email-${Date.now()}`) as string;

  // 1. Signature Verification
  const isValidSig = verifyWebhookSignature({
    provider,
    signatureHeader,
    rawBody: JSON.stringify(req.body),
  });

  if (!isValidSig) {
    logger.warn('[Inbound Webhook] Rejected request with invalid signature header');
    res.status(401).json({ error: 'Invalid webhook signature' });
    return;
  }

  // 2. Idempotency Check & Persistence
  const { event, isDuplicate } = await recordWebhookEvent({
    provider,
    externalEventId: eventId,
    eventType: 'inbound_email',
    payload: req.body,
    organizationId: req.body?.organizationId || null,
  });

  if (isDuplicate) {
    res.status(200).json({ received: true, message: 'Duplicate event ignored' });
    return;
  }

  // 3. Process Inbound Lead
  try {
    if (req.body?.fromName || req.body?.from) {
      await ingestInboundLead({
        fullName: req.body?.fromName || req.body?.from || 'Inbound Email Inquiry',
        email: req.body?.from,
        enquiryText: req.body?.body || req.body?.subject,
        source: 'EMAIL',
        organizationId: req.body?.organizationId || null,
      });
    }

    await markWebhookProcessed(event.id, 'PROCESSED');
    res.status(202).json({ received: true, status: 'PROCESSED', eventId: event.id });
  } catch (err: any) {
    logger.error(`[Inbound Webhook] Processing failed: ${err.message}`);
    await markWebhookProcessed(event.id, 'FAILED', err.message);
    res.status(500).json({ error: 'Webhook processing failure' });
  }
});

export default router;
