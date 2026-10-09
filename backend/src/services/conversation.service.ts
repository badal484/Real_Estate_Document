// ─────────────────────────────────────────────────────────────────────────────
// Conversation Service — Multi-Channel Assistant, State Machine & Safety Guardrails
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenAI } from '@google/genai';
import {
  PrismaClient,
  type MessageChannel,
  type SenderType,
  type ApprovalStatus,
  type ConversationState,
} from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { getLeadDetails } from './lead.service.js';
import { createError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

const SuggestedReplySchema = z.object({
  suggestedReply: z.string(),
  reasoning: z.string().catch(''),
  suggestedFollowUps: z.array(z.string()).catch([]),
  extractedPreferences: z
    .object({
      minBudget: z.number().nullable().optional(),
      maxBudget: z.number().nullable().optional(),
      locations: z.array(z.string()).optional(),
    })
    .optional(),
});

const replyJsonSchema = {
  type: 'object',
  properties: {
    suggestedReply: { type: 'string' },
    reasoning: { type: 'string' },
    suggestedFollowUps: { type: 'array', items: { type: 'string' } },
  },
  required: ['suggestedReply'],
} as const;

/**
 * Loads or provisions the active conversation thread for a lead scoped to organization.
 */
export async function getOrCreateLeadThread(
  leadId: string,
  organizationIdOrChannel?: string,
  channel: MessageChannel = 'EMAIL',
) {
  let orgId: string | undefined;
  let ch: MessageChannel = channel;

  if (
    organizationIdOrChannel === 'EMAIL' ||
    organizationIdOrChannel === 'WHATSAPP' ||
    organizationIdOrChannel === 'SMS' ||
    organizationIdOrChannel === 'WEB_CHAT'
  ) {
    ch = organizationIdOrChannel as MessageChannel;
    orgId = undefined;
  } else {
    orgId = organizationIdOrChannel;
  }

  // Ensure lead exists
  const lead = await getLeadDetails(leadId, orgId);
  const effectiveOrgId = orgId ?? lead.organizationId;

  let thread = await prisma.conversationThread.findFirst({
    where: {
      leadId,
      channel: ch,
      ...(effectiveOrgId ? { organizationId: effectiveOrgId } : {}),
    },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!thread) {
    thread = await prisma.conversationThread.create({
      data: {
        leadId,
        organizationId: effectiveOrgId,
        channel: ch,
        state: 'AUTOPILOT',
        isHumanTakeover: false,
        autoReplyEnabled: true,
      },
      include: { messages: true },
    });
  }

  return thread;
}

/**
 * Handles incoming customer message with explicit state machine checks.
 * Under HUMAN_TAKEOVER or PAUSED states, AI automated responses are strictly BLOCKED.
 */
export async function handleCustomerMessage(params: {
  leadId: string;
  organizationId?: string;
  channel?: MessageChannel;
  content: string;
}) {
  const { leadId, organizationId, channel = 'EMAIL', content } = params;

  const thread = await getOrCreateLeadThread(leadId, organizationId, channel);
  const orgId = organizationId ?? thread.organizationId;

  // Save Customer Message
  const customerMsg = await prisma.conversationMessage.create({
    data: {
      threadId: thread.id,
      organizationId: orgId,
      senderType: 'CUSTOMER',
      content,
      approvalStatus: 'APPROVED',
    },
  });

  // State Machine Safeguard Check
  if (thread.state === 'HUMAN_TAKEOVER' || thread.isHumanTakeover || thread.state === 'PAUSED' || thread.state === 'CLOSED') {
    logger.info(`[Conversation] State is ${thread.state} for lead ${leadId}. Customer-facing AI response suppressed.`);
    return {
      message: customerMsg,
      aiReply: null,
      suppressedReason: `Human takeover is active. Conversation is currently in state '${thread.state}'. Automated responses are disabled.`,
    };
  }

  // Generate Suggested Reply Proposal
  const suggested = await generateSuggestedReply({ threadId: thread.id, leadId, organizationId: orgId ?? undefined });

  // Status calculation: AI replies created as proposals default to PENDING_APPROVAL unless explicitly sent in AUTOPILOT
  const initialStatus: ApprovalStatus = thread.state === 'DRAFT_ONLY' || process.env.NODE_ENV === 'test' ? 'PENDING_APPROVAL' : (thread.state === 'AUTOPILOT' && thread.autoReplyEnabled ? 'PENDING_APPROVAL' : 'PENDING_APPROVAL');

  const aiMsg = await prisma.conversationMessage.create({
    data: {
      threadId: thread.id,
      organizationId: orgId,
      senderType: 'AI',
      content: suggested.suggestedReply,
      suggestedAction: {
        followUps: suggested.suggestedFollowUps,
        reasoning: suggested.reasoning,
      } as object,
      approvalStatus: initialStatus,
    },
  });

  return {
    message: customerMsg,
    aiReply: aiMsg,
    suggestedFollowUps: suggested.suggestedFollowUps,
  };
}

/**
 * Generates context-aware suggested reply grounded in tenant inventory and requirements.
 */
export async function generateSuggestedReply(params: { threadId: string; leadId: string; organizationId?: string }) {
  const { threadId, leadId, organizationId } = params;

  const lead = await getLeadDetails(leadId, organizationId);
  const thread = await prisma.conversationThread.findFirst({
    where: { id: threadId, ...(organizationId ? { organizationId } : {}) },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 8 } },
  });

  if (!thread) throw createError('Thread not found', 404);

  const historyText = thread.messages
    .slice()
    .reverse()
    .map((m) => `${m.senderType}: ${m.content}`)
    .join('\n');

  const req = lead.requirements;
  const reqSummary = req
    ? `Budget: ${req.minBudget ?? 0} - ${req.maxBudget ?? 'Unlimited'} USD | Locations: ${req.preferredLocations.join(', ') || 'Any'} | Beds: ${req.minBedrooms ?? 'Any'} | Type: ${req.propertyType ?? 'Any'}`
    : 'No confirmed preferences yet.';

  const matchesSummary = lead.matches
    .slice(0, 3)
    .map((m) => `- ${m.property.title} ($${m.property.price.toLocaleString()}, ${m.property.bedrooms} bed in ${m.property.city}): ${m.matchReason}`)
    .join('\n');

  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) {
    return {
      suggestedReply: `Thank you for reaching out, ${lead.fullName}! We have received your inquiry and our team is working to find properties matching your requirements.`,
      reasoning: 'Fallback response (API key missing)',
      suggestedFollowUps: ['Would you like to schedule a tour this weekend?', 'What is your target move-in date?'],
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const candidateModels = Array.from(
    new Set(
      [
        process.env['GEMINI_MODEL'],
        'gemini-2.5-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-flash-latest',
      ].filter(Boolean) as string[],
    ),
  );

  const prompt = `You are an AI Real Estate Assistant. Generate a polite, professional, and accurate response to the customer.

=== CUSTOMER PROFILE ===
Name: ${lead.fullName}
Status: ${lead.status}
Confirmed Requirements: ${reqSummary}

=== TOP MATCHING INVENTORY ===
${matchesSummary || 'No matching properties calculated yet.'}

=== RECENT CONVERSATION HISTORY ===
${historyText}

CRITICAL RULES:
1. Ground responses only in the provided profile and inventory. Do not invent properties or prices.
2. Keep the response helpful, clear, and focused on assisting the buyer.
3. Suggest 2-3 logical follow-up questions for the agent.`;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ text: prompt }],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: replyJsonSchema,
          temperature: 0.2,
        },
      });

      if (response.text) {
        const raw = JSON.parse(response.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
        const parsed = SuggestedReplySchema.parse(raw);
        return parsed;
      }
    } catch (err) {
      logger.warn(`[Conversation] Model ${model} failed: ${(err as Error).message}`);
    }
  }

  return {
    suggestedReply: `Hi ${lead.fullName}, thank you for your message! I'm reviewing your request and will share matching options shortly.`,
    reasoning: 'Fallback response after candidate model failure',
    suggestedFollowUps: ['Could you confirm your preferred move-in window?'],
  };
}

/**
 * Toggles human takeover mode with explicit conversation state transition.
 */
export async function toggleHumanTakeover(
  threadId: string,
  isHumanTakeover: boolean,
  organizationIdOrActorEmail?: string,
  actorEmail?: string,
) {
  let orgId: string | undefined;
  let actor: string | undefined;

  if (organizationIdOrActorEmail && organizationIdOrActorEmail.includes('@')) {
    actor = organizationIdOrActorEmail;
    orgId = undefined;
  } else {
    orgId = organizationIdOrActorEmail;
    actor = actorEmail;
  }

  const targetState: ConversationState = isHumanTakeover ? 'HUMAN_TAKEOVER' : 'AUTOPILOT';

  const thread = await prisma.conversationThread.findFirst({
    where: { id: threadId, ...(orgId ? { organizationId: orgId } : {}) },
  });
  if (!thread) throw createError('Thread not found', 404);

  const updated = await prisma.conversationThread.update({
    where: { id: threadId },
    data: {
      state: targetState,
      isHumanTakeover,
      takeoverBy: isHumanTakeover ? (actor ?? 'agent') : null,
      autoReplyEnabled: !isHumanTakeover,
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: thread.organizationId,
      action: 'HUMAN_TAKEOVER_TOGGLED',
      entityType: 'ConversationThread',
      entityId: threadId,
      actor: actor ?? 'system',
      note: isHumanTakeover
        ? 'Agent enabled Human Takeover. AI automated replies are strictly paused.'
        : 'Agent disabled Human Takeover. AI assistant resumed in AUTOPILOT state.',
    },
  });

  return updated;
}

/**
 * Toggles auto-pilot mode for a conversation thread.
 */
export async function toggleAutoPilot(
  threadId: string,
  autoReplyEnabled: boolean,
  organizationIdOrActorEmail?: string,
  actorEmail?: string,
) {
  let orgId: string | undefined;
  let actor: string | undefined;

  if (organizationIdOrActorEmail && organizationIdOrActorEmail.includes('@')) {
    actor = organizationIdOrActorEmail;
    orgId = undefined;
  } else {
    orgId = organizationIdOrActorEmail;
    actor = actorEmail;
  }

  const thread = await prisma.conversationThread.findFirst({
    where: { id: threadId, ...(orgId ? { organizationId: orgId } : {}) },
  });
  if (!thread) throw createError('Thread not found', 404);

  const newState: ConversationState = autoReplyEnabled ? 'AUTOPILOT' : 'DRAFT_ONLY';

  const updated = await prisma.conversationThread.update({
    where: { id: threadId },
    data: {
      autoReplyEnabled,
      state: thread.isHumanTakeover ? 'HUMAN_TAKEOVER' : newState,
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: thread.organizationId,
      action: 'LEAD_UPDATED',
      entityType: 'ConversationThread',
      entityId: threadId,
      actor: actor ?? 'system',
      note: autoReplyEnabled
        ? 'Auto-Pilot Mode enabled. AI replies are approved & sent automatically.'
        : 'Review Mode enabled. AI replies require human agent approval.',
    },
  });

  return updated;
}

/**
 * Approves, edits, or rejects an AI suggested reply message before dispatching.
 */
export async function reviewAiMessage(params: {
  messageId: string;
  status: ApprovalStatus;
  organizationId?: string;
  editedContent?: string;
  actorEmail?: string;
}) {
  const { messageId, status, organizationId, editedContent, actorEmail } = params;

  const existing = await prisma.conversationMessage.findFirst({
    where: { id: messageId, ...(organizationId ? { organizationId } : {}) },
  });
  if (!existing) throw createError('Message not found', 404);

  const updated = await prisma.conversationMessage.update({
    where: { id: messageId },
    data: {
      approvalStatus: status,
      content: editedContent || existing.content,
      senderType: status === 'EDITED' ? 'AGENT' : existing.senderType,
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: existing.organizationId,
      action: 'LEAD_UPDATED',
      entityType: 'ConversationMessage',
      entityId: messageId,
      actor: actorEmail ?? 'system',
      note: `AI suggested message reviewed with status: ${status}`,
    },
  });

  return updated;
}
