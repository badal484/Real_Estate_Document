/**
 * AI Extraction Service — STUB
 *
 * Will call Claude via @anthropic-ai/sdk to extract contingency clauses
 * from raw PDF text, returning structured JSON with citations and confidence.
 *
 * v1: stub only — no real API calls made.
 */

import { logger } from '../utils/logger.js';

export interface ExtractedClause {
  clauseType: string;        // e.g. "inspection", "financing", "appraisal"
  rawText: string;           // exact quoted text from PDF
  pageNumber: number | null;
  numberOfDays: number | null;
  dayType: 'calendar' | 'business' | null;
  confidence: number;        // 0.0 – 1.0
  boundingBox: {
    x: number; y: number; width: number; height: number;
  } | null;
}

export interface ExtractionResult {
  clauses: ExtractedClause[];
  model: string;
  tokensUsed: number;
}

/**
 * Extract contingency clauses from PDF text using Claude.
 * TODO: implement with @anthropic-ai/sdk structured JSON extraction.
 */
export async function extractClausesFromText(
  _pdfText: string,
  _dealId: string,
): Promise<ExtractionResult> {
  logger.info('[AI stub] Claude extraction not yet implemented');
  return {
    clauses: [],
    model: 'stub',
    tokensUsed: 0,
  };
}
