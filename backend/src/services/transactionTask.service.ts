// ─────────────────────────────────────────────────────────────────────────────
// Transaction Task Service — Non-Contingency Milestone Obligations & Human Review
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenAI } from '@google/genai';
import { PrismaClient, type TaskStatus } from '@prisma/client';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import { extractTextFromPdf } from './pdf.service.js';
import { computeContractDeadline } from './dateEngine.service.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

const ExtractedTaskSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional().catch(null),
  numberOfDays: z.number().nullable().optional().catch(null),
  dayType: z.enum(['calendar', 'business']).nullable().optional().catch('calendar'),
  amount: z.number().nullable().optional().catch(null),
  assignedToRole: z.string().nullable().optional().catch(null),
});

const TaskExtractionResponseSchema = z.object({
  tasks: z.array(ExtractedTaskSchema).catch([]),
});

const taskJsonSchema = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          numberOfDays: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
          dayType: { anyOf: [{ type: 'string', enum: ['calendar', 'business'] }, { type: 'null' }] },
          amount: { anyOf: [{ type: 'number' }, { type: 'null' }] },
          assignedToRole: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        },
        required: ['title'],
      },
    },
  },
  required: ['tasks'],
} as const;

/**
 * Extracts non-contingency transaction milestone tasks from a document (e.g. Escrow deposit, Title review, HOA docs).
 */
export async function extractTransactionTasksFromPdf(filePath: string, dealId: string, documentId: string) {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) throw new Error('Deal not found');

  const baseDate = deal.acceptanceDate ?? new Date();
  const apiKey = process.env['GEMINI_API_KEY'];

  if (!apiKey) {
    logger.warn('[Task Extractor] GEMINI_API_KEY missing. Returning fallback sample tasks.');
    return createSampleTasks(dealId, documentId, baseDate);
  }

  const pdfData = await readFile(filePath, { encoding: 'base64' });
  const textResult = await extractTextFromPdf(filePath);
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analyze this real estate agreement/addendum and extract ALL non-contingency transactional obligations and milestones.
Examples: Earnest money deposit delivery, Seller property disclosure delivery, HOA document package delivery, Preliminary title commitment review, Pest inspection report submission, Final walkthrough inspection, Closing funds wire transfer.

For each task:
1. title: Human-readable task name (e.g. "Deliver Initial Earnest Money Deposit").
2. description: Quoted contract excerpt establishing the obligation.
3. numberOfDays: Number of days from Acceptance Date (or explicit milestone).
4. dayType: "calendar" or "business".
5. amount: Monetary amount if explicitly stated (e.g., deposit amount in USD), else null.
6. assignedToRole: "BUYER", "SELLER", "ESCROW_AGENT", or "LISTING_AGENT".`;

  const candidateModels = Array.from(
    new Set(
      [
        process.env['GEMINI_MODEL'],
        'gemini-2.5-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
      ].filter(Boolean) as string[],
    ),
  );

  let extractedTasks: z.infer<typeof ExtractedTaskSchema>[] = [];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          { inlineData: { mimeType: 'application/pdf', data: pdfData } },
          { text: `TEXT LAYER:\n${textResult.text.slice(0, 40000)}` },
          { text: prompt },
        ],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: taskJsonSchema,
          temperature: 0,
        },
      });

      if (response.text) {
        const raw = JSON.parse(response.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
        const parsed = TaskExtractionResponseSchema.parse(raw);
        extractedTasks = parsed.tasks;
        logger.info(`[Task Extractor] Extracted ${extractedTasks.length} milestone tasks using ${model}`);
        break;
      }
    } catch (err) {
      logger.warn(`[Task Extractor] Model ${model} failed: ${(err as Error).message}`);
    }
  }

  if (extractedTasks.length === 0) {
    return createSampleTasks(dealId, documentId, baseDate);
  }

  const createdTasks = [];
  for (const t of extractedTasks) {
    const numDays = t.numberOfDays && t.numberOfDays > 0 ? t.numberOfDays : 3;
    const { deadline: dueDate } = computeContractDeadline(baseDate, numDays, t.dayType === 'business' ? 'business' : 'calendar');

    const taskRecord = await prisma.transactionTask.create({
      data: {
        dealId,
        sourceDocumentId: documentId,
        title: t.title,
        description: t.description ?? null,
        dueDate,
        amount: t.amount ?? null,
        assignedTo: t.assignedToRole ?? 'BUYER',
        isHumanReviewed: false, // Must be explicitly reviewed by agent!
        status: 'PENDING',
      },
    });

    createdTasks.push(taskRecord);
  }

  await prisma.auditLog.create({
    data: {
      dealId,
      action: 'TASK_EXTRACTED',
      entityType: 'TransactionTask',
      actor: 'system',
      note: `Extracted ${createdTasks.length} transaction obligations for human review.`,
    },
  });

  return createdTasks;
}

function createSampleTasks(dealId: string, documentId: string, baseDate: Date) {
  const depositDueDate = new Date(baseDate.getTime() + 3 * 86400000);
  const hoaDueDate = new Date(baseDate.getTime() + 7 * 86400000);

  return Promise.all([
    prisma.transactionTask.create({
      data: {
        dealId,
        sourceDocumentId: documentId,
        title: 'Deliver Initial Earnest Money Deposit',
        description: 'Buyer shall deliver earnest money deposit to Escrow Holder within 3 calendar days after acceptance.',
        dueDate: depositDueDate,
        amount: 10000,
        assignedTo: 'BUYER',
        isHumanReviewed: false,
        status: 'PENDING',
      },
    }),
    prisma.transactionTask.create({
      data: {
        dealId,
        sourceDocumentId: documentId,
        title: 'Seller HOA Disclosure Package Delivery',
        description: 'Seller to provide full HOA covenants, bylaws, and financial disclosures to buyer within 7 calendar days.',
        dueDate: hoaDueDate,
        amount: null,
        assignedTo: 'SELLER',
        isHumanReviewed: false,
        status: 'PENDING',
      },
    }),
  ]);
}

/**
 * Reviews, approves, or modifies an extracted transaction task.
 */
export async function reviewTransactionTask(params: {
  taskId: string;
  dueDate?: string;
  title?: string;
  amount?: number;
  assignedTo?: string;
  status?: TaskStatus;
  actorEmail?: string;
}) {
  const { taskId, dueDate, title, amount, assignedTo, status, actorEmail } = params;

  const existing = await prisma.transactionTask.findUnique({ where: { id: taskId } });
  if (!existing) throw new Error('Transaction task not found');

  const updated = await prisma.transactionTask.update({
    where: { id: taskId },
    data: {
      title: title ?? existing.title,
      dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
      amount: amount !== undefined ? amount : existing.amount,
      assignedTo: assignedTo ?? existing.assignedTo,
      status: status ?? 'IN_PROGRESS',
      isHumanReviewed: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      dealId: existing.dealId,
      action: status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_APPROVED',
      entityType: 'TransactionTask',
      entityId: taskId,
      actor: actorEmail ?? 'system',
      previousValue: existing as object,
      newValue: updated as object,
    },
  });

  return updated;
}
