// ─────────────────────────────────────────────────────────────────────────────
// /api/leads — AI Lead Management API Routes with Tenant Isolation
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { z } from 'zod';
import {
  ingestInboundLead,
  getLeads,
  getLeadDetails,
  updateLeadRequirements,
  extractAndPersistRequirements,
} from '../../services/lead.service.js';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const InboundLeadSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  source: z.enum(['WEBSITE_FORM', 'PORTAL_INQUIRY', 'WHATSAPP', 'EMAIL', 'MANUAL']).optional(),
  externalId: z.string().optional().nullable(),
  enquiryText: z.string().optional().nullable(),
  organizationId: z.string().optional().nullable(),
});

const UpdateLeadSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedUserId: z.string().optional().nullable(),
});

const RequirementUpdateSchema = z.object({
  minBudget: z.number().nullable().optional(),
  maxBudget: z.number().nullable().optional(),
  preferredLocations: z.array(z.string()).optional(),
  propertyType: z.string().nullable().optional(),
  minBedrooms: z.number().nullable().optional(),
  maxBedrooms: z.number().nullable().optional(),
  possessionTimeline: z.string().nullable().optional(),
  summaryNotes: z.string().optional(),
});

const ExtractInputSchema = z.object({
  enquiryText: z.string().min(5, 'Enquiry text must be at least 5 characters'),
});

// ── POST /api/leads/inbound (Public / Webhook Ingestion) ─────────────────────
router.post(
  '/inbound',
  asyncHandler(async (req, res) => {
    const parsed = InboundLeadSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const lead = await ingestInboundLead(parsed.data);
    res.status(201).json(lead);
  }),
);

// ── GET /api/leads (Authenticated List) ───────────────────────────────────────
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const search = req.query['search'] as string | undefined;
    const status = req.query['status'] as any;
    const priority = req.query['priority'] as any;

    const leads = await getLeads({ search, status, priority, organizationId: orgId });
    res.json(leads);
  }),
);

// ── POST /api/leads (Manual Agent Creation) ──────────────────────────────────
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const parsed = InboundLeadSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const lead = await ingestInboundLead({
      ...parsed.data,
      source: parsed.data.source ?? 'MANUAL',
      organizationId: orgId,
    });
    res.status(201).json(lead);
  }),
);

// ── GET /api/leads/:id ────────────────────────────────────────────────────────
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const lead = await getLeadDetails(req.params['id'], orgId);
    res.json(lead);
  }),
);

// ── PATCH /api/leads/:id ──────────────────────────────────────────────────────
router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const parsed = UpdateLeadSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const leadId = req.params['id'];
    const existing = await prisma.lead.findFirst({
      where: { id: leadId, organizationId: orgId },
    });
    if (!existing) throw createError('Lead not found', 404);

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: parsed.data,
      include: { requirements: true },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        action: 'LEAD_UPDATED',
        entityType: 'Lead',
        entityId: leadId,
        actor: req.user?.email ?? 'system',
        previousValue: existing as object,
        newValue: parsed.data as object,
      },
    });

    res.json(updated);
  }),
);

// ── PATCH /api/leads/:id/requirements ───────────────────────────────────────
router.patch(
  '/:id/requirements',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const parsed = RequirementUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const leadId = req.params['id'];
    const updated = await updateLeadRequirements(leadId, parsed.data, orgId, req.user?.email);
    res.json(updated);
  }),
);

// ── POST /api/leads/:id/extract ──────────────────────────────────────────────
router.post(
  '/:id/extract',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const parsed = ExtractInputSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const leadId = req.params['id'];
    const requirements = await extractAndPersistRequirements(leadId, parsed.data.enquiryText, orgId);
    res.json(requirements);
  }),
);

export default router;
