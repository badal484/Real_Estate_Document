/**
 * /api/deals/:id/notifications — Notification Settings, Logs, Previews & Inbound Info
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler, createError } from '../../middleware/errorHandler.js';
import { sendEmail } from '../../services/email.service.js';
import { renderEmailTemplate } from '../../services/emailTemplates.js';
import { logger } from '../../utils/logger.js';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

const NotificationSettingSchema = z.object({
  recipients: z.array(z.string().email()),
  windows: z.object({
    d3: z.boolean(),
    d1: z.boolean(),
    dayOf: z.boolean(),
    missed: z.boolean(),
  }),
  enabled: z.boolean(),
  timezone: z.string().default('America/Los_Angeles'),
});

// ── GET /api/deals/:id/notifications/settings ─────────────────────────────
router.get(
  '/settings',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    let settings = await prisma.notificationSetting.findUnique({
      where: { dealId },
    });

    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: {
          dealId,
          recipients: ['agent@contingencycopilot.com'],
          d3: true,
          d1: true,
          dayOf: true,
          missed: true,
          enabled: true,
          timezone: 'America/Los_Angeles',
        },
      });
    }

    res.json({
      id: settings.id,
      dealId: settings.dealId,
      recipients: settings.recipients,
      windows: {
        d3: settings.d3,
        d1: settings.d1,
        dayOf: settings.dayOf,
        missed: settings.missed,
      },
      enabled: settings.enabled,
      timezone: settings.timezone,
    });
  }),
);

// ── PUT /api/deals/:id/notifications/settings ─────────────────────────────
router.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const parsed = NotificationSettingSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const { recipients, windows, enabled, timezone } = parsed.data;

    const settings = await prisma.notificationSetting.upsert({
      where: { dealId },
      create: {
        dealId,
        recipients,
        d3: windows.d3,
        d1: windows.d1,
        dayOf: windows.dayOf,
        missed: windows.missed,
        enabled,
        timezone,
      },
      update: {
        recipients,
        d3: windows.d3,
        d1: windows.d1,
        dayOf: windows.dayOf,
        missed: windows.missed,
        enabled,
        timezone,
      },
    });

    // Also update deal timezone
    await prisma.deal.update({
      where: { id: dealId },
      data: { timezone },
    });

    res.json({
      id: settings.id,
      dealId: settings.dealId,
      recipients: settings.recipients,
      windows: {
        d3: settings.d3,
        d1: settings.d1,
        dayOf: settings.dayOf,
        missed: settings.missed,
      },
      enabled: settings.enabled,
      timezone: settings.timezone,
    });
  }),
);

// ── POST /api/deals/:id/notifications/test ────────────────────────────────
router.post(
  '/test',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const { to } = req.body || {};

    if (!to || typeof to !== 'string') throw createError('Recipient "to" email is required', 400);

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throw createError('Deal not found', 404);

    const rendered = renderEmailTemplate('3-day', {
      dealId,
      propertyAddress: deal.propertyAddress,
      deadlineLabel: 'Sample Test Contingency',
      deadlineDate: new Date(),
    });

    const result = await sendEmail({
      to,
      subject: `[TEST ALERT] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
    });

    await prisma.auditLog.create({
      data: {
        dealId,
        action: 'EMAIL_SENT_TEST',
        entityType: 'Deal',
        entityId: dealId,
        actor: 'user',
        newValue: { recipient: to, providerMessageId: result.providerMessageId, success: result.success },
      },
    });

    await prisma.emailLog.create({
      data: {
        dealId,
        window: 'test',
        template: 'test-email',
        recipient: to,
        status: result.success ? 'DELIVERED' : 'FAILED',
        providerMessageId: result.providerMessageId,
        error: result.error,
      },
    });

    res.json({
      success: result.success,
      providerMessageId: result.providerMessageId,
      message: result.success ? `Test alert sent successfully to ${to}` : `Failed: ${result.error}`,
    });
  }),
);

// ── POST /api/deals/:id/notifications/summary ─────────────────────────────
router.post(
  '/summary',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const { to } = req.body || {};
    const recipients: string[] = Array.isArray(to) ? to : typeof to === 'string' ? [to] : [];

    if (!recipients.length) throw createError('At least one recipient email in "to" is required', 400);

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { deadlines: true, documents: true },
    });
    if (!deal) throw createError('Deal not found', 404);

    const rendered = renderEmailTemplate('deal-summary', {
      dealId,
      propertyAddress: deal.propertyAddress,
      documentCount: deal.documents.length,
    });

    let sentCount = 0;
    for (const recipient of recipients) {
      const result = await sendEmail({
        to: recipient,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });

      if (result.success) {
        sentCount++;
        await prisma.emailLog.create({
          data: {
            dealId,
            window: 'summary',
            template: 'deal-summary',
            recipient,
            status: 'DELIVERED',
            providerMessageId: result.providerMessageId,
          },
        });
      }
    }

    res.json({
      sentCount,
      recipients,
      message: `Deal summary sent to ${sentCount} recipients`,
    });
  }),
);

// ── POST /api/deals/:id/notifications/preview ─────────────────────────────
router.post(
  '/preview',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const { template, deadlineId } = req.body || {};

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throw createError('Deal not found', 404);

    let deadlineLabel = 'Inspection Contingency';
    let deadlineDate: Date = new Date();

    if (deadlineId) {
      const d = await prisma.deadline.findUnique({ where: { id: deadlineId } });
      if (d) {
        deadlineLabel = d.label;
        deadlineDate = d.confirmedDate || d.computedDate;
      }
    }

    const rendered = renderEmailTemplate(template || '3-day', {
      dealId,
      propertyAddress: deal.propertyAddress,
      deadlineLabel,
      deadlineDate,
    });

    res.json({
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  }),
);

// ── GET /api/deals/:id/notifications/log ──────────────────────────────────
router.get(
  '/log',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const logs = await prisma.emailLog.findMany({
      where: { dealId },
      include: { deadline: true },
      orderBy: { sentAt: 'desc' },
    });
    res.json(logs);
  }),
);

// ── GET /api/deals/:id/notifications/inbound-address ──────────────────────
router.get(
  '/inbound-address',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    let deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throw createError('Deal not found', 404);

    const domain = process.env['INBOUND_EMAIL_DOMAIN'] || 'inbound.contingencycopilot.com';
    const shortId = deal.id.slice(-8).toLowerCase();

    if (!deal.inboundAlias) {
      deal = await prisma.deal.update({
        where: { id: dealId },
        data: { inboundAlias: shortId },
      });
    }

    const alias = deal.inboundAlias || shortId;
    const inboundAddress = `deal-${alias}@${domain}`;

    res.json({
      inboundAddress,
      dealId: deal.id,
      propertyAddress: deal.propertyAddress,
      instructions: `Forward any purchase agreement PDF to ${inboundAddress}. It will automatically extract contingencies and notify configured recipients.`,
    });
  }),
);

// ── POST /api/deals/notifications/webhook/events (SendGrid Event Webhook) ─
router.post(
  '/webhook/events',
  asyncHandler(async (req, res) => {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      const { sg_message_id, event: eventType, email } = event || {};
      if (!sg_message_id) continue;

      const providerId = String(sg_message_id).split('.')[0];
      const newStatus = eventType === 'delivered' ? 'DELIVERED' : eventType === 'bounce' ? 'BOUNCED' : eventType === 'dropped' ? 'DROPPED' : 'FAILED';

      await prisma.emailLog.updateMany({
        where: {
          OR: [
            { providerMessageId: providerId },
            { recipient: email, status: 'PENDING' },
          ],
        },
        data: { status: newStatus },
      });
    }

    res.status(200).json({ received: true });
  }),
);

export default router;
