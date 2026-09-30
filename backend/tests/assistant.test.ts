// ─────────────────────────────────────────────────────────────────────────────
// Assistant Backend Unit Tests
// Tests chunking, quote normalization, verification, overrides, and security
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from '@jest/globals';
import { chunkDocumentPages } from '../src/services/chunk.service.js';
import {
  normalizeTextForMatching,
  isQuotePresentOnPage,
  verifyCitations,
} from '../src/services/citationVerifier.js';
import type { Citation } from '../src/types/assistant.js';

describe('Chunk Service', () => {
  it('chunks text by page and respects real-estate section boundaries', () => {
    const samplePages = [
      {
        pageNumber: 1,
        text: `1. PARTIES: Buyer John Doe and Seller Jane Smith agree as follows.

14. INSPECTION CONTINGENCY:
Buyer shall have 10 calendar days after Acceptance Date to complete all physical inspections of the Property.

15. FINANCING CONTINGENCY:
Buyer shall have 21 calendar days to obtain written loan commitment.`,
        source: 'text' as const,
        tokenCount: 80,
      },
    ];

    const chunks = chunkDocumentPages(samplePages, 100);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks.some(c => c.content.includes('INSPECTION CONTINGENCY'))).toBe(true);
  });
});

describe('Citation Verifier & Normalization', () => {
  it('normalizes smart quotes, non-breaking spaces, and hyphenations', () => {
    const raw = 'Buyer’s “inspec-\ntion” period is\u00A010 days.';
    const normalized = normalizeTextForMatching(raw);
    expect(normalized).toBe("buyer's \"inspection\" period is 10 days.");
  });

  it('correctly matches valid verbatim quotes on a page', () => {
    const pageText = `14. INSPECTION CONTINGENCY: Buyer shall have 10 calendar days after Acceptance Date to complete all physical inspections and deliver written notice of disapproval or requested repairs.`;
    const quote = `Buyer shall have 10 calendar days after Acceptance Date to complete all physical inspections`;

    expect(isQuotePresentOnPage(quote, pageText)).toBe(true);
  });

  it('DROPS fabricated quotes that do not exist in the document text', () => {
    const pageText = `14. INSPECTION CONTINGENCY: Buyer shall have 10 calendar days to complete inspections.`;
    const fakeQuote = `Seller agrees to credit $15,000 for roof replacement and HVAC repairs.`;

    expect(isQuotePresentOnPage(fakeQuote, pageText)).toBe(false);

    const testCitations: Citation[] = [
      {
        id: 1,
        sourceType: 'document',
        documentId: 'doc-1',
        pageNumber: 1,
        quote: fakeQuote,
        confidence: 0.9,
      },
    ];

    const result = verifyCitations({
      answer: 'The seller will provide a $15,000 credit [^1].',
      citations: testCitations,
      chunks: [{ documentId: 'doc-1', pageNumber: 1, content: pageText, source: 'text' }],
      validDeadlineIds: new Set(),
    });

    expect(result.droppedCitationsCount).toBe(1);
    expect(result.verifiedCitations.length).toBe(0);
    expect(result.verifiedAnswer).not.toContain('[^1]');
  });

  it('validates deadline IDs against active deal deadlines', () => {
    const testCitations: Citation[] = [
      {
        id: 1,
        sourceType: 'deadline',
        deadlineId: 'valid-deadline-123',
        deadlineLabel: 'Inspection Contingency',
        confidence: 1.0,
      },
      {
        id: 2,
        sourceType: 'deadline',
        deadlineId: 'fake-deadline-999',
        deadlineLabel: 'Ghost Deadline',
        confidence: 1.0,
      },
    ];

    const result = verifyCitations({
      answer: 'Inspection is set for Oct 14 [^1]. Ghost deadline is Oct 20 [^2].',
      citations: testCitations,
      chunks: [],
      validDeadlineIds: new Set(['valid-deadline-123']),
    });

    expect(result.verifiedCitations.length).toBe(1);
    expect(result.verifiedCitations[0].deadlineId).toBe('valid-deadline-123');
    expect(result.droppedCitationsCount).toBe(1);
  });
});
