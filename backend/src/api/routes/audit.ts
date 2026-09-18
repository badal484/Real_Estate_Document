/**
 * /api/deals/:id/audit — Immutable audit log for a deal
 *
 * GET /api/deals/:id/audit  → paginated audit log entries
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../../middleware/errorHandler.js';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const page = parseInt((req.query['page'] as string) ?? '1', 10);
    const limit = parseInt((req.query['limit'] as string) ?? '50', 10);

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throw createError('Deal not found', 404);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { dealId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where: { dealId } }),
    ]);

    res.json({
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }),
);

export default router;
