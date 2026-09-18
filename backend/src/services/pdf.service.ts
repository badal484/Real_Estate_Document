/**
 * PDF Service — STUB
 *
 * Will use pdf-parse for text-layer PDFs and Tesseract / AWS Textract
 * as OCR fallback for scanned docs.
 *
 * v1: returns a placeholder response so the route compiles and starts.
 */

import { logger } from '../utils/logger.js';

export interface ExtractedText {
  text: string;
  pageCount: number;
  isOcrFallback: boolean;
}

/**
 * Extract raw text from a PDF file at the given path.
 * TODO: implement with pdf-parse + Tesseract fallback.
 */
export async function extractTextFromPdf(filePath: string): Promise<ExtractedText> {
  logger.info(`[PDF stub] Would extract text from: ${filePath}`);
  return {
    text: '/* PDF extraction not yet implemented */',
    pageCount: 0,
    isOcrFallback: false,
  };
}
