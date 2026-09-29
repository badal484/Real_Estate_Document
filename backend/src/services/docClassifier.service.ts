// ─────────────────────────────────────────────────────────────────────────────
// Document Classifier Service
// Classifies document type & extracts effective dates using Gemini structured outputs
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import type { DocType } from '@prisma/client';

export interface DocClassificationResult {
  docType: DocType;
  effectiveDate: Date | null;
  confidence: number;
  reasoning: string;
}

const ClassificationSchema = z.object({
  docType: z.enum([
    'PURCHASE_AGREEMENT',
    'COUNTER_OFFER',
    'ADDENDUM',
    'INSPECTION_REPORT',
    'HOA_DISCLOSURE',
    'TITLE_COMMITMENT',
    'OTHER',
  ]).catch('OTHER'),
  effectiveDate: z.string().nullable().optional().catch(null),
  confidence: z.number().min(0).max(1).catch(0.8),
  reasoning: z.string().catch(''),
});

const classificationJsonSchema = {
  type: 'object',
  properties: {
    docType: {
      type: 'string',
      enum: [
        'PURCHASE_AGREEMENT',
        'COUNTER_OFFER',
        'ADDENDUM',
        'INSPECTION_REPORT',
        'HOA_DISCLOSURE',
        'TITLE_COMMITMENT',
        'OTHER',
      ],
    },
    effectiveDate: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    confidence: { type: 'number' },
    reasoning: { type: 'string' },
  },
  required: ['docType', 'confidence'],
} as const;

/**
 * Classifies a document from its filename and first few pages of text.
 */
export async function classifyDocument(params: {
  filename: string;
  sampleText: string;
}): Promise<DocClassificationResult> {
  const { filename, sampleText } = params;
  const apiKey = process.env['GEMINI_API_KEY'];

  if (!apiKey) {
    logger.warn('[Classifier] GEMINI_API_KEY missing, defaulting to heuristic classification');
    return heuristicClassification(filename);
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env['GEMINI_MODEL'] ?? 'gemini-3.6-flash';

  const prompt = `Classify this real estate document based on its filename and text excerpt.
Filename: "${filename}"
Excerpt:
"""
${sampleText.slice(0, 10000)}
"""

Classify the docType as one of:
- PURCHASE_AGREEMENT: Main residential/commercial purchase agreement or contract
- COUNTER_OFFER: Seller or buyer counter offer form
- ADDENDUM: Addendum, amendment, repair agreement modifying original terms
- INSPECTION_REPORT: Physical, termite, sewer, or roof inspection findings
- HOA_DISCLOSURE: Homeowner association covenants, bylaws, budget, or disclosures
- TITLE_COMMITMENT: Title insurance preliminary report, Schedule A/B exceptions
- OTHER: General real estate disclosure or unrelated document

Extract effectiveDate (YYYY-MM-DD) if stated on the document (acceptance date, signing date, or addendum date), otherwise null.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ text: prompt }],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: classificationJsonSchema,
        temperature: 0.1,
      },
    });

    const raw = JSON.parse(response.text ?? '{}');
    const parsed = ClassificationSchema.parse(raw);

    let parsedDate: Date | null = null;
    if (parsed.effectiveDate) {
      const d = new Date(parsed.effectiveDate);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    return {
      docType: parsed.docType as DocType,
      effectiveDate: parsedDate,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
    };
  } catch (err) {
    logger.warn(`[Classifier] Gemini classification failed: ${(err as Error).message}, using heuristic fallback`);
    return heuristicClassification(filename);
  }
}

function heuristicClassification(filename: string): DocClassificationResult {
  const lower = filename.toLowerCase();
  if (lower.includes('counter')) {
    return { docType: 'COUNTER_OFFER', effectiveDate: null, confidence: 0.7, reasoning: 'Filename match' };
  }
  if (lower.includes('addendum') || lower.includes('amendment')) {
    return { docType: 'ADDENDUM', effectiveDate: null, confidence: 0.7, reasoning: 'Filename match' };
  }
  if (lower.includes('inspect')) {
    return { docType: 'INSPECTION_REPORT', effectiveDate: null, confidence: 0.7, reasoning: 'Filename match' };
  }
  if (lower.includes('hoa') || lower.includes('covenant') || lower.includes('bylaw')) {
    return { docType: 'HOA_DISCLOSURE', effectiveDate: null, confidence: 0.7, reasoning: 'Filename match' };
  }
  if (lower.includes('title') || lower.includes('prelim')) {
    return { docType: 'TITLE_COMMITMENT', effectiveDate: null, confidence: 0.7, reasoning: 'Filename match' };
  }
  if (lower.includes('agreement') || lower.includes('contract') || lower.includes('purchase')) {
    return { docType: 'PURCHASE_AGREEMENT', effectiveDate: null, confidence: 0.7, reasoning: 'Filename match' };
  }
  return { docType: 'OTHER', effectiveDate: null, confidence: 0.5, reasoning: 'Default fallback' };
}
