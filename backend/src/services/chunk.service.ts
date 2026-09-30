// ─────────────────────────────────────────────────────────────────────────────
// Chunk Service — Page-Aware & Section-Boundary Semantic Chunking
// Preserves real estate clause headers, paragraph boundaries, and page numbers.
// ─────────────────────────────────────────────────────────────────────────────

import type { PageExtractionResult } from '../types/assistant.js';

export interface GeneratedChunk {
  pageNumber: number;
  chunkIndex: number;
  sectionTitle: string | null;
  content: string;
  tokenCount: number;
  source: 'text' | 'ocr';
}

// Regex patterns to detect section headers in real estate agreements & reports
const SECTION_HEADING_REGEX = /^(?:(?:section|paragraph|item|clause|para\.?)\s+([0-9a-z.]+)|([0-9]{1,2}\.[0-9a-z.]*)|([A-Z0-9_\-\s]{3,40}:))/i;

/**
 * Parses page text and breaks into section/clause chunks without splitting mid-sentence.
 */
export function chunkDocumentPages(
  pages: PageExtractionResult[],
  maxChunkTokens = 600,
): GeneratedChunk[] {
  const chunks: GeneratedChunk[] = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const rawText = page.text.trim();
    if (!rawText) continue;

    // Split page text by double newlines or paragraph breaks
    const paragraphs = rawText.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);

    let currentSectionTitle: string | null = null;
    let currentParagraphs: string[] = [];
    let currentTokens = 0;

    for (const paragraph of paragraphs) {
      // Check if paragraph starts with a section heading
      const lines = paragraph.split('\n');
      const firstLine = lines[0]?.trim() ?? '';
      const headingMatch = firstLine.match(SECTION_HEADING_REGEX);

      if (headingMatch || /^[0-9]{1,2}\.\s+[A-Z\s]{3,}/.test(firstLine)) {
        // If we already have accumulated content and this is a new distinct section, flush chunk
        if (currentParagraphs.length > 0 && currentTokens >= 150) {
          const content = currentParagraphs.join('\n\n');
          chunks.push({
            pageNumber: page.pageNumber,
            chunkIndex: globalChunkIndex++,
            sectionTitle: currentSectionTitle,
            content,
            tokenCount: Math.max(1, Math.ceil(content.length / 4)),
            source: page.source,
          });
          currentParagraphs = [];
          currentTokens = 0;
        }
        currentSectionTitle = firstLine.slice(0, 100);
      }

      const paraTokens = Math.max(1, Math.ceil(paragraph.length / 4));

      // If adding this paragraph exceeds maxChunkTokens and we already have content, flush
      if (currentTokens + paraTokens > maxChunkTokens && currentParagraphs.length > 0) {
        const content = currentParagraphs.join('\n\n');
        chunks.push({
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex++,
          sectionTitle: currentSectionTitle,
          content,
          tokenCount: Math.max(1, Math.ceil(content.length / 4)),
          source: page.source,
        });
        currentParagraphs = [paragraph];
        currentTokens = paraTokens;
      } else {
        currentParagraphs.push(paragraph);
        currentTokens += paraTokens;
      }
    }

    // Flush any remaining paragraphs on the page
    if (currentParagraphs.length > 0) {
      const content = currentParagraphs.join('\n\n');
      chunks.push({
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex++,
        sectionTitle: currentSectionTitle,
        content,
        tokenCount: Math.max(1, Math.ceil(content.length / 4)),
        source: page.source,
      });
    }
  }

  return chunks;
}
