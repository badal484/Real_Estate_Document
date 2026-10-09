import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface WebhookVerificationParams {
  provider: string;
  signatureHeader?: string;
  rawBody: string | Buffer;
  secret?: string;
}

/**
 * Verify webhook HMAC signature in a timing-safe manner.
 */
export function verifyWebhookSignature({ provider, signatureHeader, rawBody, secret }: WebhookVerificationParams): boolean {
  const webhookSecret = secret || process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`] || process.env['WEBHOOK_SECRET'];

  if (webhookSecret && signatureHeader) {
    const computedHmac = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    const signatureBuffer = Buffer.from(signatureHeader.replace(/^sha256=/, ''), 'hex');
    const computedBuffer = Buffer.from(computedHmac, 'hex');

    if (signatureBuffer.length === computedBuffer.length && crypto.timingSafeEqual(signatureBuffer, computedBuffer)) {
      return true;
    }
    return false;
  }

  if (!webhookSecret) {
    logger.warn(`[Webhook] No WEBHOOK_SECRET configured for provider ${provider}. Skipping signature check.`);
    return true;
  }

  return false;
}

/**
 * Persists inbound webhook event with unique deduplication key for idempotency.
 * Returns { isDuplicate: true } if event was previously received and processed.
 */
export async function recordWebhookEvent(params: {
  provider: string;
  externalEventId: string;
  eventType: string;
  payload: any;
  organizationId?: string | null;
}) {
  const { provider, externalEventId, eventType, payload, organizationId } = params;

  const existing = await prisma.webhookEvent.findUnique({
    where: {
      provider_externalEventId: {
        provider,
        externalEventId,
      },
    },
  });

  if (existing) {
    logger.info(`[Webhook Service] Duplicate webhook event ignored: ${provider}/${externalEventId}`);
    return { event: existing, isDuplicate: true };
  }

  const event = await prisma.webhookEvent.create({
    data: {
      provider,
      externalEventId,
      eventType,
      payload: payload as object,
      organizationId,
      status: 'PENDING',
    },
  });

  return { event, isDuplicate: false };
}

/**
 * Marks webhook event as completed or failed safely without throwing if record was cleaned up.
 */
export async function markWebhookProcessed(eventId: string, status: 'PROCESSED' | 'FAILED', error?: string) {
  if (!eventId) return null;
  return prisma.webhookEvent.updateMany({
    where: { id: eventId },
    data: {
      status,
      error,
      processedAt: new Date(),
    },
  });
}
