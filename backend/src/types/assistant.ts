// ─────────────────────────────────────────────────────────────────────────────
// Assistant Types — Backend (B Contract)
// ─────────────────────────────────────────────────────────────────────────────

export interface Citation {
  id: number;
  sourceType: 'document' | 'deadline' | 'deal';
  documentId?: string;
  documentName?: string;
  deadlineId?: string;
  deadlineLabel?: string;
  pageNumber?: number;
  section?: string;
  quote?: string; // Verbatim quote verified against DB chunk text
  relevanceExplanation?: string;
  confidence: number;
  isOcr?: boolean;
  isOverridden?: boolean;
  isConfirmed?: boolean;
}

export interface OverrideInfo {
  original: string;
  overriddenBy: string;
  reason?: string;
}

export interface AssistantAnswer {
  conversationId: string;
  messageId: string;
  answer: string;
  found: boolean;
  isDirectlyAnswerable: boolean;
  confidence: number;
  overrides: OverrideInfo[];
  citations: Citation[];
  suggestedFollowUps: string[];
  createdAt: string;
}

export interface AssistantStatusEvent {
  stage: 'retrieving' | 'reasoning' | 'verifying';
  message: string;
}

export interface PageExtractionResult {
  pageNumber: number;
  text: string;
  source: 'text' | 'ocr';
  tokenCount: number;
}
