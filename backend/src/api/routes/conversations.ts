// ─────────────────────────────────────────────────────────────────────────────
// /api/leads/:id/conversations — Multi-Channel Conversations & Takeover Routes
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { z } from 'zod';
import {
  getOrCreateLeadThread,
  handleCustomerMessage,
  toggleHumanTakeover,
  toggleAutoPilot,
  reviewAiMessage,
} from '../../services/conversation.service.js';
import { asyncHandler, createError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router({ mergeParams: true });

const PostMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty'),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS', 'WEB_CHAT']).optional(),
});

const TakeoverSchema = z.object({
  isHumanTakeover: z.boolean(),
});

const AutoPilotSchema = z.object({
  autoReplyEnabled: z.boolean(),
});

const ReviewMessageSchema = z.object({
  status: z.enum(['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EDITED']),
  editedContent: z.string().optional(),
});

// ── GET /api/leads/:id/conversations ─────────────────────────────────────────
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const leadId = req.params['id'];
    const thread = await getOrCreateLeadThread(leadId);
    res.json(thread);
  }),
);

// ── POST /api/leads/:id/conversations/messages ──────────────────────────────
router.post(
  '/messages',
  requireAuth,
  asyncHandler(async (req, res) => {
    const leadId = req.params['id'];
    const parsed = PostMessageSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const result = await handleCustomerMessage({
      leadId,
      content: parsed.data.content,
      channel: parsed.data.channel,
    });

    res.status(201).json(result);
  }),
);

// ── POST /api/leads/:id/conversations/takeover ───────────────────────────────
router.post(
  '/takeover',
  requireAuth,
  asyncHandler(async (req, res) => {
    const leadId = req.params['id'];
    const parsed = TakeoverSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const thread = await getOrCreateLeadThread(leadId);
    const updated = await toggleHumanTakeover(
      thread.id,
      parsed.data.isHumanTakeover,
      req.user?.email,
    );

    res.json(updated);
  }),
);

// ── POST /api/leads/:id/conversations/autopilot ──────────────────────────────
router.post(
  '/autopilot',
  requireAuth,
  asyncHandler(async (req, res) => {
    const leadId = req.params['id'];
    const parsed = AutoPilotSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const thread = await getOrCreateLeadThread(leadId);
    const updated = await toggleAutoPilot(
      thread.id,
      parsed.data.autoReplyEnabled,
      req.user?.email,
    );

    res.json(updated);
  }),
);

// ── PATCH /api/leads/:id/conversations/messages/:msgId ───────────────────────
router.patch(
  '/messages/:msgId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = ReviewMessageSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.message, 422);

    const updated = await reviewAiMessage({
      messageId: req.params['msgId'],
      status: parsed.data.status,
      editedContent: parsed.data.editedContent,
      actorEmail: req.user?.email,
    });

    res.json(updated);
  }),
);

export default router;
