/**
 * Alert Service
 *
 * Real email alert delivery (SendGrid) + SMS stub (Twilio).
 * Integration with scheduler and notification routes.
 */

import { PrismaClient } from '@prisma/client';
import { sendEmail } from './email.service.js';
import { renderEmailTemplate } from './emailTemplates.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface AlertPayload {
  to: string; // phone number (SMS) or email address
  dealId: string;
  deadlineId?: string;
  deadlineLabel: string;
  deadlineDate: Date;
  daysUntilDeadline?: number;
  templateName?: string;
}

export async function sendSmsAlert(payload: AlertPayload): Promise<void> {
  logger.info(`[Alert SMS stub] Would SMS ${payload.to}: "${payload.deadlineLabel}" due ${payload.deadlineDate.toDateString()}`);
  // SMS stub untouched per instructions
}

export async function sendEmailAlert(payload: AlertPayload): Promise<boolean> {
  const deal = await prisma.deal.findUnique({
    where: { id: payload.dealId },
  });

  if (!deal) {
    logger.warn(`[Alert] Cannot send email alert: Deal ${payload.dealId} not found`);
    return false;
  }

  const templateKey = payload.templateName || (payload.daysUntilDeadline === 3 ? 'd3' : payload.daysUntilDeadline === 1 ? 'd1' : payload.daysUntilDeadline === 0 ? 'day_of' : 'd3');

  const rendered = renderEmailTemplate(templateKey, {
    dealId: deal.id,
    propertyAddress: deal.propertyAddress,
    deadlineLabel: payload.deadlineLabel,
    deadlineDate: payload.deadlineDate,
  });

  const result = await sendEmail({
    to: payload.to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });

  // Log email to database
  if (payload.deadlineId) {
    await prisma.emailLog.create({
      data: {
        dealId: deal.id,
        deadlineId: payload.deadlineId,
        window: templateKey,
        template: templateKey,
        recipient: payload.to,
        status: result.success ? 'DELIVERED' : 'FAILED',
        providerMessageId: result.providerMessageId,
        error: result.error,
      },
    }).catch((err) => {
      logger.warn(`[Alert] Unique constraint or logging error on EmailLog: ${err.message}`);
    });
  }

  if (result.success) {
    await prisma.auditLog.create({
      data: {
        dealId: deal.id,
        action: 'ALERT_SENT',
        entityType: 'Deadline',
        entityId: payload.deadlineId,
        actor: 'system',
        newValue: { recipient: payload.to, template: templateKey, providerMessageId: result.providerMessageId },
      },
    });
  }

  return result.success;
}

export async function scheduleAlerts(dealId: string): Promise<void> {
  logger.info(`[Alert] Active deadline alert schedule requested for deal ${dealId}`);
}
