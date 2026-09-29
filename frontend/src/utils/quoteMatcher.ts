/**
 * Quote Matcher Utility
 *
 * Normalizes text and matches quoted excerpts against PDF text layers.
 * Handles whitespace collapsing, hyphenation at line breaks, ligatures, and smart quotes.
 */

export interface MatchResult {
  matched: boolean;
  startIndex: number;
  endIndex: number;
  normalizedQuote: string;
  exactMatchFound: boolean;
}

/**
 * Normalize string for fuzzy/robust text comparison.
 * - NFKC unicode normalization (converts ligatures like ﬁ -> fi)
 * - Standardizes smart quotes (' ' " " -> ' ' " ")
 * - Replaces dashes/hyphens
 * - Collapses multiple whitespace/newlines into a single space
 */
export function normalizeText(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2') // un-hyphenate line breaks
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Search for a target quote within document text node layer.
 */
export function findQuoteInText(documentText: string, quote: string): MatchResult {
  if (!documentText || !quote) {
    return { matched: false, startIndex: -1, endIndex: -1, normalizedQuote: '', exactMatchFound: false };
  }

  const normDoc = normalizeText(documentText);
  const normQuote = normalizeText(quote);

  if (normQuote.length === 0) {
    return { matched: false, startIndex: -1, endIndex: -1, normalizedQuote: normQuote, exactMatchFound: false };
  }

  // 1. Direct exact match in normalized space
  const exactIndex = normDoc.indexOf(normQuote);
  if (exactIndex !== -1) {
    return {
      matched: true,
      startIndex: exactIndex,
      endIndex: exactIndex + normQuote.length,
      normalizedQuote: normQuote,
      exactMatchFound: true,
    };
  }

  // 2. Substring token chunk match (first 6 words if quote is long)
  const quoteWords = normQuote.split(' ');
  if (quoteWords.length >= 4) {
    const prefixSnippet = quoteWords.slice(0, 5).join(' ');
    const prefixIndex = normDoc.indexOf(prefixSnippet);
    if (prefixIndex !== -1) {
      return {
        matched: true,
        startIndex: prefixIndex,
        endIndex: prefixIndex + normQuote.length,
        normalizedQuote: normQuote,
        exactMatchFound: false,
      };
    }
  }

  return {
    matched: false,
    startIndex: -1,
    endIndex: -1,
    normalizedQuote: normQuote,
    exactMatchFound: false,
  };
}

/**
 * Helper to determine if a text item in react-pdf matches the target quote.
 */
export function isTextItemInQuote(textItemContent: string, quote: string): boolean {
  if (!textItemContent || !quote) return false;
  const normItem = normalizeText(textItemContent);
  const normQuote = normalizeText(quote);
  if (normItem.length < 2 || normQuote.length < 2) return false;
  return normQuote.includes(normItem) || normItem.includes(normQuote);
}
