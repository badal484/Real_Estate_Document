import { readFile } from 'node:fs/promises';
import pdfParse from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger.js';
import type { PageExtractionResult } from '../types/assistant.js';

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

/**
 * Extract per-page structured text from a PDF file.
 * If a page lacks a text layer (< 30 characters), runs Gemini Vision OCR fallback.
 */
export async function extractPagesFromPdf(filePath: string): Promise<PageExtractionResult[]> {
  const buffer = await readFile(filePath);
  const collectedPages: Array<{ pageNumber: number; text: string }> = [];

  let pageIndex = 1;
  const customRender = async (pageData: {
    getTextContent: () => Promise<{ items: Array<{ str: string; transform: number[] }> }>;
  }) => {
    const textContent = await pageData.getTextContent();
    let lastY: number | undefined;
    let pageText = '';

    for (const item of textContent.items) {
      if (lastY === undefined || lastY === item.transform[5]) {
        pageText += (pageText.endsWith(' ') || !pageText ? '' : ' ') + item.str;
      } else {
        pageText += '\n' + item.str;
      }
      lastY = item.transform[5];
    }

    const currentNumber = pageIndex++;
    collectedPages.push({
      pageNumber: currentNumber,
      text: pageText.trim(),
    });

    return pageText;
  };

  try {
    await pdfParse(buffer, { pagerender: customRender });
  } catch (err) {
    logger.warn(`[PDF] Page-by-page extraction error: ${(err as Error).message}. Attempting fallback extraction.`);
  }

  // If pdf-parse failed to produce pages, create at least page 1 from raw extraction
  if (collectedPages.length === 0) {
    const basic = await extractTextFromPdf(filePath);
    if (basic.text.trim()) {
      collectedPages.push({ pageNumber: 1, text: basic.text.trim() });
    }
  }

  // Post-process pages: if text layer is sparse (< 30 chars), attempt OCR
  const results: PageExtractionResult[] = [];
  for (const page of collectedPages) {
    const charCount = page.text.replace(/\s+/g, '').length;
    let finalText = page.text;
    let source: 'text' | 'ocr' = 'text';

    if (charCount < 30 && process.env['GEMINI_API_KEY']) {
      try {
        logger.info(`[PDF] Page ${page.pageNumber} has sparse text (${charCount} chars). Running Gemini OCR...`);
        const ocrText = await runGeminiOcrForPage(buffer, page.pageNumber);
        if (ocrText && ocrText.length > charCount) {
          finalText = ocrText;
          source = 'ocr';
          logger.info(`[PDF] Gemini OCR succeeded for page ${page.pageNumber} (${finalText.length} chars)`);
        }
      } catch (ocrErr) {
        logger.warn(`[PDF] OCR fallback failed for page ${page.pageNumber}: ${(ocrErr as Error).message}`);
      }
    }

    // Estimate token count (roughly ~4 chars per token)
    const tokenCount = Math.max(1, Math.ceil(finalText.length / 4));

    results.push({
      pageNumber: page.pageNumber,
      text: finalText,
      source,
      tokenCount,
    });
  }

  logger.info(`[PDF] Processed ${results.length} pages for ${filePath} (${results.filter(r => r.source === 'ocr').length} OCR)`);
  return results;
}

/**
 * Runs OCR for a specific page using Gemini Vision
 */
async function runGeminiOcrForPage(pdfBuffer: Buffer, pageNumber: number): Promise<string> {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) return '';

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env['GEMINI_MODEL'] ?? 'gemini-3.6-flash';

  const base64Pdf = pdfBuffer.toString('base64');
  const response = await ai.models.generateContent({
    model,
    contents: [
      { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
      {
        text: `Transcribe all visible text on Page ${pageNumber} of this PDF contract/document verbatim.
Preserve paragraph layout, section numbers, titles, and legal wording. Do not add markdown or commentary.`,
      },
    ],
  });

  return response.text?.trim() ?? '';
}
