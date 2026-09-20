import { readFile } from 'node:fs/promises';
import pdfParse from 'pdf-parse';
import { logger } from '../utils/logger.js';

export interface ExtractedText {
  text: string;
  pageCount: number;
  isOcrFallback: boolean;
}

/**
 * Extract raw text from a PDF file at the given path using pdf-parse.
 */
export async function extractTextFromPdf(filePath: string): Promise<ExtractedText> {
  try {
    const buffer = await readFile(filePath);
    const data = await pdfParse(buffer);
    logger.info(`[PDF] Extracted ${data.text.length} characters across ${data.numpages} pages from ${filePath}`);
    return {
      text: data.text || '',
      pageCount: data.numpages || 0,
      isOcrFallback: false,
    };
  } catch (err) {
    logger.warn(`[PDF] pdf-parse failed for ${filePath}: ${(err as Error).message}`);
    return {
      text: '',
      pageCount: 0,
      isOcrFallback: false,
    };
  }
}
