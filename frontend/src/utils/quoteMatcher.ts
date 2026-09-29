// ─────────────────────────────────────────────────────────────────────────────
// Quote Matcher Utility
// Client-side text normalization & matching for highlighting verified quotes in PDF
// ─────────────────────────────────────────────────────────────────────────────

export interface QuoteMatchResult {
  isMatched: boolean;
  matchSnippet?: string;
  confidence: number;
}

/**
 * Normalizes text for matching across PDF text items:
 * - Unicode NFKC normalization
 * - Converts curly quotes / apostrophes to straight ASCII
 * - Replaces non-breaking spaces
 * - Collapses multiple spaces and newlines
 */
export function normalizeClientText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a target quote matches in page text, with tolerance for OCR/whitespace differences.
 */
export function findQuoteInPage(quote: string, pageText: string): QuoteMatchResult {
  const normQuote = normalizeClientText(quote);
  const normPage = normalizeClientText(pageText);

  if (!normQuote || !normPage) {
    return { isMatched: false, confidence: 0 };
  }

  if (normPage.includes(normQuote)) {
    return { isMatched: true, matchSnippet: quote, confidence: 1.0 };
  }

  // Partial tolerance for longer quotes
  if (normQuote.length > 50) {
    const subLen = Math.floor(normQuote.length * 0.7);
    const startPart = normQuote.slice(0, subLen);
    const endPart = normQuote.slice(normQuote.length - subLen);

    if (normPage.includes(startPart) || normPage.includes(endPart)) {
      return { isMatched: true, matchSnippet: quote, confidence: 0.85 };
    }
  }

  return { isMatched: false, confidence: 0 };
}
