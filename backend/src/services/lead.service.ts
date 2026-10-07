// ─────────────────────────────────────────────────────────────────────────────
// Lead Service — AI Lead Collection, Normalization, Deduplication & Requirement Extraction
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenAI } from '@google/genai';
import { PrismaClient, type LeadPriority, type LeadStatus, type LeadSource } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

// ── Zod Validation Schemas for Structured Requirement Extraction ──────────────

export const RequirementExtractionSchema = z.object({
  minBudget: z.number().nullable().optional().catch(null),
  maxBudget: z.number().nullable().optional().catch(null),
  preferredLocations: z.array(z.string()).catch([]),
  propertyType: z.string().nullable().optional().catch(null),
  minBedrooms: z.number().nullable().optional().catch(null),
  maxBedrooms: z.number().nullable().optional().catch(null),
  possessionTimeline: z.string().nullable().optional().catch(null),
  summaryNotes: z.string().catch(''),
  clarificationNeeded: z.array(z.string()).catch([]),
});

export type ExtractedRequirements = z.infer<typeof RequirementExtractionSchema>;

const requirementJsonSchema = {
  type: 'object',
  properties: {
    minBudget: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    maxBudget: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    preferredLocations: { type: 'array', items: { type: 'string' } },
    propertyType: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    minBedrooms: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
    maxBedrooms: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
    possessionTimeline: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    summaryNotes: { type: 'string' },
    clarificationNeeded: { type: 'array', items: { type: 'string' } },
  },
  required: ['preferredLocations', 'summaryNotes'],
} as const;

// ── Helper: Normalization ─────────────────────────────────────────────────────

export function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 3 && trimmed.includes('@') ? trimmed : null;
}

export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 ? digits : null;
}

// ── Deterministic Priority Calculation ───────────────────────────────────────

export function calculateLeadPriority(params: {
  maxBudget?: number | null;
  possessionTimeline?: string | null;
  hasPhone?: boolean;
}): LeadPriority {
  const { maxBudget, possessionTimeline, hasPhone } = params;
  const timelineLower = (possessionTimeline || '').toLowerCase();

  if (timelineLower.includes('immediate') || timelineLower.includes('asap') || timelineLower.includes('30')) {
    return 'URGENT';
  }
  if ((maxBudget && maxBudget > 750000) || timelineLower.includes('60')) {
    return 'HIGH';
  }
  if (hasPhone || maxBudget) {
    return 'MEDIUM';
  }
  return 'LOW';
}

// ── Service Core Functions ───────────────────────────────────────────────────

export interface InboundLeadInput {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  source?: LeadSource;
  externalId?: string | null;
  enquiryText?: string | null;
  organizationId?: string | null;
}

/**
 * Normalizes incoming lead details, detects duplicates by externalId or email/phone,
 * creates or updates lead record, and extracts customer requirements via Gemini.
 */
export async function ingestInboundLead(input: InboundLeadInput) {
  const normEmail = normalizeEmail(input.email);
  const normPhone = normalizePhone(input.phone);
  const source = input.source ?? 'WEBSITE_FORM';

  logger.info(`[Lead Service] Ingesting lead: "${input.fullName}" (${normEmail ?? normPhone ?? 'No contact'})`);

  // 1. Deduplication Search
  let existingLead = null;

  if (input.externalId) {
    existingLead = await prisma.lead.findUnique({
      where: { externalId: input.externalId },
      include: { requirements: true },
    });
  }

  if (!existingLead && normEmail) {
    existingLead = await prisma.lead.findFirst({
      where: { email: normEmail },
      include: { requirements: true },
    });
  }

  if (!existingLead && normPhone) {
    existingLead = await prisma.lead.findFirst({
      where: { phone: normPhone },
      include: { requirements: true },
    });
  }

  let lead;

  if (existingLead) {
    logger.info(`[Lead Service] Duplicate lead detected. Updating Lead ID: ${existingLead.id}`);
    lead = await prisma.lead.update({
      where: { id: existingLead.id },
      data: {
        fullName: input.fullName || existingLead.fullName,
        email: normEmail ?? existingLead.email,
        phone: normPhone ?? existingLead.phone,
        status: existingLead.status === 'LOST' ? 'NEW' : existingLead.status,
      },
      include: { requirements: true },
    });

    await prisma.auditLog.create({
      data: {
        action: 'LEAD_UPDATED',
        entityType: 'Lead',
        entityId: lead.id,
        actor: 'system',
        note: `Inbound enquiry received from existing lead (${source})`,
      },
    });
  } else {
    lead = await prisma.lead.create({
      data: {
        organizationId: input.organizationId ?? null,
        source,
        externalId: input.externalId ?? null,
        fullName: input.fullName,
        email: normEmail,
        phone: normPhone,
        status: 'NEW',
        priority: 'MEDIUM',
      },
      include: { requirements: true },
    });

    await prisma.auditLog.create({
      data: {
        action: 'LEAD_CREATED',
        entityType: 'Lead',
        entityId: lead.id,
        actor: 'system',
        note: `New lead created from ${source}`,
      },
    });
  }

  // 2. Requirements Extraction if Enquiry Text Provided
  if (input.enquiryText && input.enquiryText.trim().length > 5) {
    await extractAndPersistRequirements(lead.id, input.enquiryText);
  }

  return getLeadDetails(lead.id);
}

/**
 * Uses Gemini to extract structured requirements from text, updates LeadRequirement & Priority.
 */
export async function extractAndPersistRequirements(leadId: string, text: string) {
  const apiKey = process.env['GEMINI_API_KEY'];
  let extracted: ExtractedRequirements = {
    minBudget: null,
    maxBudget: null,
    preferredLocations: [],
    propertyType: null,
    minBedrooms: null,
    maxBedrooms: null,
    possessionTimeline: null,
    summaryNotes: text.slice(0, 500),
    clarificationNeeded: [],
  };

  if (apiKey) {
    const ai = new GoogleGenAI({ apiKey });
    const candidateModels = Array.from(
      new Set(
        [
          process.env['GEMINI_MODEL'],
          'gemini-2.5-flash-lite',
          'gemini-3.5-flash-lite',
          'gemini-3.5-flash',
          'gemini-3.8-flash',
        ].filter(Boolean) as string[],
      ),
    );

    const prompt = `Analyze this real estate customer enquiry message and extract structured buyer/renter preferences.

<<UNTRUSTED_CONTENT source="customer_enquiry">>
${text}
<</UNTRUSTED_CONTENT>>

Extract:
1. minBudget & maxBudget (in USD, positive numbers or null).
2. preferredLocations (array of neighborhood or city names).
3. propertyType (e.g., "CONDO", "SINGLE_FAMILY", "TOWNHOUSE", "MULTI_FAMILY", or null).
4. minBedrooms & maxBedrooms (integer numbers or null).
5. possessionTimeline (e.g. "IMMEDIATE", "30_DAYS", "60_DAYS", "90_DAYS", or null).
6. summaryNotes (concise synthesis of what buyer wants).
7. clarificationNeeded (array of missing critical preference items).`;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ text: prompt }],
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: requirementJsonSchema,
            temperature: 0,
          },
        });

        if (response.text) {
          const raw = JSON.parse(response.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
          extracted = RequirementExtractionSchema.parse(raw);
          logger.info(`[Lead Service] Extracted requirements for lead ${leadId} using ${model}`);
          break;
        }
      } catch (err) {
        logger.warn(`[Lead Service] Model ${model} extraction failed: ${(err as Error).message}`);
      }
    }
  }

  // Update LeadRequirement row
  const reqRecord = await prisma.leadRequirement.upsert({
    where: { leadId },
    create: {
      leadId,
      minBudget: extracted.minBudget,
      maxBudget: extracted.maxBudget,
      preferredLocations: extracted.preferredLocations,
      propertyType: extracted.propertyType,
      minBedrooms: extracted.minBedrooms,
      maxBedrooms: extracted.maxBedrooms,
      possessionTimeline: extracted.possessionTimeline,
      notes: extracted.summaryNotes,
      rawAiExtraction: extracted as unknown as object,
    },
    update: {
      minBudget: extracted.minBudget ?? undefined,
      maxBudget: extracted.maxBudget ?? undefined,
      preferredLocations: extracted.preferredLocations.length > 0 ? extracted.preferredLocations : undefined,
      propertyType: extracted.propertyType ?? undefined,
      minBedrooms: extracted.minBedrooms ?? undefined,
      maxBedrooms: extracted.maxBedrooms ?? undefined,
      possessionTimeline: extracted.possessionTimeline ?? undefined,
      notes: extracted.summaryNotes || undefined,
      rawAiExtraction: extracted as unknown as object,
    },
  });

  // Re-evaluate Lead Priority
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (lead) {
    const computedPriority = calculateLeadPriority({
      maxBudget: reqRecord.maxBudget,
      possessionTimeline: reqRecord.possessionTimeline,
      hasPhone: !!lead.phone,
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { priority: computedPriority },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: 'LEAD_REQUIREMENTS_EXTRACTED',
      entityType: 'LeadRequirement',
      entityId: reqRecord.id,
      actor: 'system',
      newValue: {
        maxBudget: reqRecord.maxBudget,
        locations: reqRecord.preferredLocations,
        propertyType: reqRecord.propertyType,
      },
    },
  });

  return reqRecord;
}

/**
 * Returns complete details for a single lead.
 */
export async function getLeadDetails(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      requirements: true,
      conversations: {
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      },
      matches: {
        include: { property: true },
        orderBy: { matchScore: 'desc' },
      },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });

  if (!lead) throw new Error('Lead not found');
  return lead;
}

/**
 * Returns filtered list of leads.
 */
export async function getLeads(params: {
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  organizationId?: string;
}) {
  const { search, status, priority, organizationId } = params;

  const whereClause: Record<string, unknown> = {};

  const isValidString = (val?: string) => val && val !== 'undefined' && val !== 'null' && val.trim().length > 0;

  if (isValidString(organizationId)) whereClause['organizationId'] = organizationId;
  if (isValidString(status as string)) whereClause['status'] = status;
  if (isValidString(priority as string)) whereClause['priority'] = priority;

  if (isValidString(search)) {
    const q = search!.trim();
    whereClause['OR'] = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ];
  }

  return prisma.lead.findMany({
    where: whereClause,
    include: {
      requirements: true,
      _count: { select: { matches: true, conversations: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * Manual edit of structured lead requirements by agent.
 */
export async function updateLeadRequirements(
  leadId: string,
  data: Partial<ExtractedRequirements>,
  actorEmail?: string,
) {
  const existing = await prisma.leadRequirement.findUnique({ where: { leadId } });

  const updated = await prisma.leadRequirement.upsert({
    where: { leadId },
    create: {
      leadId,
      minBudget: data.minBudget ?? null,
      maxBudget: data.maxBudget ?? null,
      preferredLocations: data.preferredLocations ?? [],
      propertyType: data.propertyType ?? null,
      minBedrooms: data.minBedrooms ?? null,
      maxBedrooms: data.maxBedrooms ?? null,
      possessionTimeline: data.possessionTimeline ?? null,
      notes: data.summaryNotes ?? null,
    },
    update: {
      minBudget: data.minBudget !== undefined ? data.minBudget : existing?.minBudget,
      maxBudget: data.maxBudget !== undefined ? data.maxBudget : existing?.maxBudget,
      preferredLocations: data.preferredLocations !== undefined ? data.preferredLocations : existing?.preferredLocations,
      propertyType: data.propertyType !== undefined ? data.propertyType : existing?.propertyType,
      minBedrooms: data.minBedrooms !== undefined ? data.minBedrooms : existing?.minBedrooms,
      maxBedrooms: data.maxBedrooms !== undefined ? data.maxBedrooms : existing?.maxBedrooms,
      possessionTimeline: data.possessionTimeline !== undefined ? data.possessionTimeline : existing?.possessionTimeline,
      notes: data.summaryNotes !== undefined ? data.summaryNotes : existing?.notes,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'LEAD_UPDATED',
      entityType: 'LeadRequirement',
      entityId: updated.id,
      actor: actorEmail ?? 'system',
      note: 'Customer requirements manually updated by agent',
    },
  });

  return updated;
}
