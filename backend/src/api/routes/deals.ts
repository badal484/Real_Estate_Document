/**
 * /api/deals — CRUD for Deals (purchase agreements)
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler, createError } from '../../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

// ── Validation schemas ─────────────────────────────────────────────────────

const CreateDealSchema = z.object({
  propertyAddress: z.string().min(1),
  buyerName: z.string().optional(),
  sellerName: z.string().optional(),
  acceptanceDate: z.string().datetime().optional(), // ISO 8601
});

const PatchDealSchema = CreateDealSchema.partial().extend({
  status: z.enum(['ACTIVE', 'CLOSED', 'CANCELLED']).optional(),
});

// ── GET /api/deals ────────────────────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { deadlines: true } } },
    });
    res.json(deals);
  }),
);

// ── POST /api/deals ───────────────────────────────────────────────────────
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = CreateDealSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const { propertyAddress, buyerName, sellerName, acceptanceDate } = parsed.data;
    const deal = await prisma.deal.create({
      data: {
        propertyAddress,
        buyerName,
        sellerName,
        acceptanceDate: acceptanceDate ? new Date(acceptanceDate) : undefined,
        auditLogs: {
          create: {
            action: 'DEAL_CREATED',
            entityType: 'Deal',
            actor: 'system',
            newValue: { propertyAddress },
          },
        },
      },
    });
    res.status(201).json(deal);
  }),
);

// ── GET /api/deals/:id ────────────────────────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params['id'] },
      include: {
        documents: true,
        deadlines: { include: { clause: true }, orderBy: { computedDate: 'asc' } },
        clauses: true,
      },
    });
    if (!deal) throw createError('Deal not found', 404);
    res.json(deal);
  }),
);

// ── PATCH /api/deals/:id ──────────────────────────────────────────────────
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const parsed = PatchDealSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const existing = await prisma.deal.findUnique({ where: { id: req.params['id'] } });
    if (!existing) throw createError('Deal not found', 404);

    const updated = await prisma.deal.update({
      where: { id: req.params['id'] },
      data: {
        ...parsed.data,
        acceptanceDate: parsed.data.acceptanceDate ? new Date(parsed.data.acceptanceDate) : undefined,
        auditLogs: {
          create: {
            action: 'DEAL_UPDATED',
            entityType: 'Deal',
            actor: 'system',
            previousValue: existing as object,
            newValue: parsed.data as object,
          },
        },
      },
    });
    res.json(updated);
  }),
);

export default router;
