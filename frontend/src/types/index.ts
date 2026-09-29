// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types — mirrors the Prisma schema on the backend.
// Keep in sync with backend/prisma/schema.prisma
// ─────────────────────────────────────────────────────────────────────────────

export type DealStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED';
export type DayType = 'calendar' | 'business';
export type DeadlineStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'MISSED' | 'COMPLETED';
export type AuditAction =
  | 'DOCUMENT_UPLOADED'
  | 'EXTRACTION_STARTED'
  | 'EXTRACTION_COMPLETED'
  | 'DEADLINE_CONFIRMED'
  | 'DEADLINE_EDITED'
  | 'DEADLINE_ACTIVATED'
  | 'ALERT_SENT'
  | 'EMAIL_SENT_TEST'
  | 'EMAIL_INBOUND_RECEIVED'
  | 'DEAL_CREATED'
  | 'DEAL_UPDATED';

export interface Deal {
  id: string;
  propertyAddress: string;
  buyerName: string | null;
  sellerName: string | null;
  acceptanceDate: string | null; // ISO 8601
  status: DealStatus;
  timezone?: string;
  inboundAlias?: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
  deadlines?: Deadline[];
  clauses?: ContingencyClause[];
  _count?: { deadlines: number };
}

export interface Document {
  id: string;
  dealId: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number | null;
  uploadedAt: string;
  docType?: string;
  effectiveDate?: string | null;
  pageCount?: number | null;
  indexStatus?: string;
  indexedAt?: string | null;
}

export interface ContingencyClause {
  id: string;
  dealId: string;
  documentId: string;
  clauseType: string;
  rawText: string;
  pageNumber: number | null;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  confidence: number | null;
  numberOfDays: number | null;
  dayType: DayType | null;
  createdAt: string;
}

export interface Deadline {
  id: string;
  dealId: string;
  clauseId: string;
  label: string;
  computedDate: string;    // ISO 8601
  confirmedDate: string | null;
  dayType: DayType;
  status: DeadlineStatus;
  confirmedBy: string | null;
  confirmedAt: string | null;
  alertSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  clause?: ContingencyClause;
}

export interface AuditLog {
  id: string;
  dealId: string;
  action: AuditAction;
  entityType: string | null;
  entityId: string | null;
  previousValue: unknown;
  newValue: unknown;
  actor: string | null;
  note: string | null;
  createdAt: string;
}

export interface NotificationSettings {
  id?: string;
  dealId: string;
  recipients: string[];
  windows: {
    d3: boolean;
    d1: boolean;
    dayOf: boolean;
    missed: boolean;
  };
  enabled: boolean;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailLog {
  id: string;
  dealId: string;
  deadlineId: string | null;
  window: string;
  template: string;
  recipient: string;
  status: 'PENDING' | 'DELIVERED' | 'BOUNCED' | 'DROPPED' | 'FAILED';
  providerMessageId: string | null;
  error: string | null;
  sentAt: string;
  deadline?: Deadline;
}

export interface InboundAddressInfo {
  inboundAddress: string;
  dealId: string;
  propertyAddress: string;
  instructions: string;
}

// ─── Assistant Types ────────────────────────────────────────────────────────
export type CitationSourceType = 'document' | 'deadline' | 'deal';

export interface Citation {
  id: string;
  sourceType: CitationSourceType;
  documentId?: string;
  documentName?: string;
  deadlineId?: string;
  pageNumber?: number;
  section?: string;
  quote?: string;
  relevanceExplanation?: string;
  confidence?: number;
}

export interface OverrideInfo {
  original: string;
  overriddenBy: string;
}

export interface AssistantMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  found?: boolean;
  isDirectlyAnswerable?: boolean;
  confidence?: number;
  overrides?: OverrideInfo[];
  citations?: Citation[];
  suggestedFollowUps?: string[];
  createdAt: string;
}

export interface AssistantConversation {
  id: string;
  dealId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: AssistantMessage[];
}

export interface RiskItem {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'UNCONFIRMED_DEADLINE' | 'LOW_CONFIDENCE' | 'MISSING_DOC' | 'CONFLICT';
  title: string;
  description: string;
  citationIds?: string[];
}

export interface ExecutiveSummary {
  overview: string;
  risks: RiskItem[];
  citations: Citation[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// ─── API request/response helpers ─────────────────────────────────────────────
export interface CreateDealInput {
  propertyAddress: string;
  buyerName?: string;
  sellerName?: string;
  acceptanceDate?: string; // ISO 8601
}

export interface ConfirmDeadlineInput {
  confirmedDate: string; // ISO 8601
  confirmedBy?: string;
  activate?: boolean;
}

