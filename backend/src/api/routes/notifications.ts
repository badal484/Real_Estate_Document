/**
 * /api/deals/:id/notifications — Notification preferences, templates, test emails, and audit delivery logs.
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler, createError } from '../../middleware/errorHandler.js';
import { sendEmail, generateTemplate } from '../../services/email.service.js';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

const UpdateSettingsSchema = z.object({
  recipients: z.array(z.string().email()),
  windows: z.object({
    d3: z.boolean(),
    d1: z.boolean(),
    dayOf: z.boolean(),
    missed: z.boolean(),
  }),
  enabled: z.boolean(),
  timezone: z.string().min(1),
});

const SendTestSchema = z.object({
  to: z.string().email(),
});

const SendSummarySchema = z.object({
  to: z.array(z.string().email()).min(1),
});

const PreviewSchema = z.object({
  template: z.enum(['3d', '1d', 'dayOf', 'missed', 'summary', 'docs_received']),
  deadlineId: z.string().optional(),
});

// ── GET /settings ─────────────────────────────────────────────────────────────
router.get(
  '/settings',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    let settings = await prisma.notificationSetting.findUnique({
      where: { dealId },
    });

    if (!settings) {
      // Default to deal owner's email or fallback
      const userEmail = req.user?.email ? [req.user.email] : [];
      settings = await prisma.notificationSetting.create({
        data: {
          dealId,
          recipients: userEmail,
          window3d: true,
          window1d: true,
          windowDayOf: true,
          windowMissed: true,
          enabled: true,
          timezone: 'America/New_York',
        },
      });
    }

    res.json({
      id: settings.id,
      dealId: settings.dealId,
      recipients: (settings.recipients as string[]) || [],
      window3d: settings.window3d,
      window1d: settings.window1d,
      windowDayOf: settings.windowDayOf,
      windowMissed: settings.windowMissed,
      enabled: settings.enabled,
      timezone: settings.timezone,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    });
  }),
);

// ── PUT /settings ─────────────────────────────────────────────────────────────
router.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const parsed = UpdateSettingsSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const { recipients, windows, enabled, timezone } = parsed.data;

    const settings = await prisma.notificationSetting.upsert({
      where: { dealId },
      create: {
        dealId,
        recipients,
        window3d: windows.d3,
        window1d: windows.d1,
        windowDayOf: windows.dayOf,
        windowMissed: windows.missed,
        enabled,
        timezone,
      },
      update: {
        recipients,
        window3d: windows.d3,
        window1d: windows.d1,
        windowDayOf: windows.dayOf,
        windowMissed: windows.missed,
        enabled,
        timezone,
      },
    });

    res.json({
      id: settings.id,
      dealId: settings.dealId,
      recipients: (settings.recipients as string[]) || [],
      window3d: settings.window3d,
      window1d: settings.window1d,
      windowDayOf: settings.windowDayOf,
      windowMissed: settings.windowMissed,
      enabled: settings.enabled,
      timezone: settings.timezone,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    });
  }),
);

// ── POST /test ────────────────────────────────────────────────────────────────
router.post(
  '/test',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const parsed = SendTestSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throw createError('Deal not found', 404);

    const address = deal.propertyAddress;
    const testTpl = generateTemplate('3d', {
      dealAddress: address,
      deadlineLabel: 'Inspection Contingency (Test Alert)',
      dueDate: new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      dealId,
    });

    const result = await sendEmail({
      to: parsed.data.to,
      subject: `[Test Verification] ${testTpl.subject}`,
      html: testTpl.html,
      text: testTpl.text,
    });

    // Record email log
    await prisma.emailLog.create({
      data: {
        dealId,
        recipient: parsed.data.to,
        template: '3d',
        status: result.success ? 'SENT' : 'BOUNCED',
        providerMessageId: result.messageId ?? null,
        errorMessage: result.error ?? null,
      },
    });

    // Record audit action
    await prisma.auditLog.create({
      data: {
        dealId,
        action: 'EMAIL_SENT_TEST',
        entityType: 'EmailLog',
        actor: req.user?.email ?? 'system',
        note: `Test email dispatched to ${parsed.data.to} via Resend`,
      },
    });

    if (!result.success) {
      throw createError(result.error || 'Failed to dispatch test email', 500);
    }

    res.json({
      sent: true,
      message: `Test email dispatched successfully to ${parsed.data.to}`,
      messageId: result.messageId,
    });
  }),
);

// ── POST /summary ─────────────────────────────────────────────────────────────
router.post(
  '/summary',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const parsed = SendSummarySchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { deadlines: { orderBy: { computedDate: 'asc' } } },
    });
    if (!deal) throw createError('Deal not found', 404);

    const deadlines = deal.deadlines.map((d) => ({
      label: d.label,
      status: d.status,
      dueDate: (d.confirmedDate ?? d.computedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }));

    const summaryTpl = generateTemplate('summary', {
      dealAddress: deal.propertyAddress,
      buyerName: deal.buyerName ?? undefined,
      sellerName: deal.sellerName ?? undefined,
      deadlines,
      dealId,
    });

    let sentCount = 0;
    for (const recipient of parsed.data.to) {
      const result = await sendEmail({
        to: recipient,
        subject: summaryTpl.subject,
        html: summaryTpl.html,
        text: summaryTpl.text,
      });

      await prisma.emailLog.create({
        data: {
          dealId,
          recipient,
          template: 'summary',
          status: result.success ? 'SENT' : 'BOUNCED',
          providerMessageId: result.messageId ?? null,
          errorMessage: result.error ?? null,
        },
      });

      if (result.success) sentCount++;
    }

    res.json({ sent: true, count: sentCount });
  }),
);

// ── POST /preview ─────────────────────────────────────────────────────────────
router.post(
  '/preview',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const parsed = PreviewSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { deadlines: true },
    });
    if (!deal) throw createError('Deal not found', 404);

    let targetDeadline = deal.deadlines[0];
    if (parsed.data.deadlineId) {
      const found = deal.deadlines.find((d) => d.id === parsed.data.deadlineId);
      if (found) targetDeadline = found;
    }

    const dueDateStr = targetDeadline
      ? (targetDeadline.confirmedDate ?? targetDeadline.computedDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

    const preview = generateTemplate(parsed.data.template, {
      dealAddress: deal.propertyAddress,
      deadlineLabel: targetDeadline?.label ?? 'Inspection Contingency',
      dueDate: dueDateStr,
      buyerName: deal.buyerName ?? 'Jane Buyer',
      sellerName: deal.sellerName ?? 'John Seller',
      deadlines: deal.deadlines.map((d) => ({
        label: d.label,
        status: d.status,
        dueDate: (d.confirmedDate ?? d.computedDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      })),
      dealId,
    });

    res.json(preview);
  }),
);

// ── GET /log ──────────────────────────────────────────────────────────────────
router.get(
  '/log',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const logs = await prisma.emailLog.findMany({
      where: { dealId },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });

    res.json(
      logs.map((log) => ({
        id: log.id,
        dealId: log.dealId,
        deadlineId: log.deadlineId,
        recipient: log.recipient,
        template: log.template,
        status: log.status,
        providerMessageId: log.providerMessageId,
        errorMessage: log.errorMessage,
        sentAt: log.sentAt.toISOString(),
      })),
    );
  }),
);

// ── GET /inbound-address ──────────────────────────────────────────────────────
router.get(
  '/inbound-address',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throw createError('Deal not found', 404);

    const domain = process.env['INBOUND_EMAIL_DOMAIN'] ?? 'deals.contingencycopilot.com';
    const alias = deal.inboundAlias ?? `deal-${deal.id.slice(-6)}`;
    const inboundEmail = `${alias}@${domain}`;

    res.json({
      inboundEmail,
      domain,
      dealId,
      dealAddress: deal.propertyAddress,
      instructions: `Forward signed counters, addenda, or inspection reports directly to ${inboundEmail} to auto-index them to this deal.`,
    });
  }),
);

export default router;
