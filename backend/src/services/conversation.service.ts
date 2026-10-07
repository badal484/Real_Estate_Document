// ─────────────────────────────────────────────────────────────────────────────
// Conversation Service — Multi-Channel Assistant & Human Takeover Safeguards
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenAI } from '@google/genai';
import { PrismaClient, type MessageChannel, type SenderType, type ApprovalStatus } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { getLeadDetails } from './lead.service.js';

const prisma = new PrismaClient();

const SuggestedReplySchema = z.object({
  suggestedReply: z.string(),
  reasoning: z.string().catch(''),
  suggestedFollowUps: z.array(z.string()).catch([]),
  extractedPreferences: z.object({
    minBudget: z.number().nullable().optional(),
    maxBudget: z.number().nullable().optional(),
    locations: z.array(z.string()).optional(),
  }).optional(),
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
 * Loads or provisions the active conversation thread for a lead.
 */
export async function getOrCreateLeadThread(leadId: string, channel: MessageChannel = 'EMAIL') {
  let thread = await prisma.conversationThread.findFirst({
    where: { leadId, channel },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!thread) {
    thread = await prisma.conversationThread.create({
      data: {
        leadId,
        channel,
        isHumanTakeover: false,
        autoReplyEnabled: false,
      },
      include: { messages: true },
    });
  }

  return thread;
}

/**
 * Appends a customer message to the conversation thread.
 * If Human Takeover is active, AI automated response is SUPPRESSED.
 */
export async function handleCustomerMessage(params: {
  leadId: string;
  channel?: MessageChannel;
  content: string;
}) {
  const { leadId, channel = 'EMAIL', content } = params;

  const thread = await getOrCreateLeadThread(leadId, channel);

  // Save Customer Message
  const customerMsg = await prisma.conversationMessage.create({
    data: {
      threadId: thread.id,
      senderType: 'CUSTOMER',
      content,
      approvalStatus: 'APPROVED',
    },
  });

  // Human Takeover Check
  if (thread.isHumanTakeover) {
    logger.info(`[Conversation] Human takeover active for lead ${leadId}. AI automated response suppressed.`);
    return {
      message: customerMsg,
      aiReply: null,
      suppressedReason: 'Human takeover is active. Agent will respond manually.',
    };
  }

  // Generate Suggested Reply
  const suggested = await generateSuggestedReply({ threadId: thread.id, leadId });

  // Save AI Draft/Approved Message
  const isAutoPilot = thread.autoReplyEnabled ?? false;
  const initialStatus: ApprovalStatus = isAutoPilot ? 'APPROVED' : 'PENDING_APPROVAL';

  const aiMsg = await prisma.conversationMessage.create({
    data: {
      threadId: thread.id,
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
 * Generates context-aware suggested reply based on customer message history and requirements.
 */
export async function generateSuggestedReply(params: { threadId: string; leadId: string }) {
  const { threadId, leadId } = params;

  const lead = await getLeadDetails(leadId);
  const thread = await prisma.conversationThread.findUnique({
    where: { id: threadId },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 8 } },
  });

  if (!thread) throw new Error('Thread not found');

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
 * Toggles human takeover mode for a conversation thread.
 * When enabled, automated replies are BLOCKED on the backend.
 */
export async function toggleHumanTakeover(threadId: string, isHumanTakeover: boolean, actorEmail?: string) {
  const thread = await prisma.conversationThread.update({
    where: { id: threadId },
    data: {
      isHumanTakeover,
      takeoverBy: isHumanTakeover ? (actorEmail ?? 'agent') : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'HUMAN_TAKEOVER_TOGGLED',
      entityType: 'ConversationThread',
      entityId: threadId,
      actor: actorEmail ?? 'system',
      note: isHumanTakeover
        ? 'Agent enabled Human Takeover. AI automated replies are paused.'
        : 'Agent disabled Human Takeover. AI assistant resumed.',
    },
  });

  return thread;
}

/**
 * Approves, edits, or rejects an AI suggested reply message before dispatching.
 */
export async function reviewAiMessage(params: {
  messageId: string;
  status: ApprovalStatus;
  editedContent?: string;
  actorEmail?: string;
}) {
  const { messageId, status, editedContent, actorEmail } = params;

  const existing = await prisma.conversationMessage.findUnique({ where: { id: messageId } });
  if (!existing) throw new Error('Message not found');

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
      action: 'LEAD_UPDATED',
      entityType: 'ConversationMessage',
      entityId: messageId,
      actor: actorEmail ?? 'system',
      note: `AI suggested message reviewed with status: ${status}`,
    },
  });

  return updated;
}

/**
 * Toggles auto-pilot mode for a conversation thread.
 */
export async function toggleAutoPilot(threadId: string, autoReplyEnabled: boolean, actorEmail?: string) {
  const thread = await prisma.conversationThread.update({
    where: { id: threadId },
    data: { autoReplyEnabled },
  });

  await prisma.auditLog.create({
    data: {
      action: 'LEAD_UPDATED',
      entityType: 'ConversationThread',
      entityId: threadId,
      actor: actorEmail ?? 'system',
      note: autoReplyEnabled
        ? 'Auto-Pilot Mode enabled. AI replies are approved & sent automatically.'
        : 'Review Mode enabled. AI replies require human agent approval.',
    },
  });

  return thread;
}
