/**
 * /api/deals/:id/deadlines — View and confirm/edit deadlines
 *
 * GET   /api/deals/:id/deadlines          → list all deadlines for a deal
 * PATCH /api/deals/:id/deadlines/:dId     → confirm or edit a deadline date
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler, createError } from '../../middleware/errorHandler.js';
import { scheduleAlerts } from '../../services/alert.service.js';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

const ConfirmDeadlineSchema = z.object({
  confirmedDate: z.string().datetime(),        // ISO 8601 — user can override computed date
  confirmedBy: z.string().min(1).optional(),   // agent name or email
  activate: z.boolean().optional(),            // true → status becomes ACTIVE + schedule alerts
});

// ── GET /api/deals/:id/deadlines ──────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const deadlines = await prisma.deadline.findMany({
      where: { dealId: req.params['id'] },
      include: { clause: true },
      orderBy: { computedDate: 'asc' },
    });
    res.json(deadlines);
  }),
);

// ── PATCH /api/deals/:id/deadlines/:dId ──────────────────────────────────
router.patch(
  '/:dId',
  asyncHandler(async (req, res) => {
    const parsed = ConfirmDeadlineSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const existing = await prisma.deadline.findUnique({ where: { id: req.params['dId'] } });
    if (!existing) throw createError('Deadline not found', 404);

    const { confirmedDate, confirmedBy, activate } = parsed.data;
    const isEdit = new Date(confirmedDate).getTime() !== existing.computedDate.getTime();
    const newStatus = activate ? 'ACTIVE' : 'CONFIRMED';

    const updated = await prisma.deadline.update({
      where: { id: req.params['dId'] },
      data: {
        confirmedDate: new Date(confirmedDate),
        confirmedBy,
        confirmedAt: new Date(),
        status: newStatus,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        dealId: existing.dealId,
        action: isEdit ? 'DEADLINE_EDITED' : 'DEADLINE_CONFIRMED',
        entityType: 'Deadline',
        entityId: existing.id,
        previousValue: { computedDate: existing.computedDate, status: existing.status },
        newValue: { confirmedDate, status: newStatus, confirmedBy },
        actor: confirmedBy ?? 'system',
      },
    });

    // If activating, schedule alerts (stub)
    if (activate) {
      await scheduleAlerts(existing.dealId);
      await prisma.auditLog.create({
        data: {
          dealId: existing.dealId,
          action: 'DEADLINE_ACTIVATED',
          entityType: 'Deadline',
          entityId: existing.id,
          actor: confirmedBy ?? 'system',
        },
      });
    }

    res.json(updated);
  }),
);

export default router;
