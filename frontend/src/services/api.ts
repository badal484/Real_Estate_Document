/**
 * Typed API client — thin fetch wrapper pointing at the Express backend.
 * All requests go through VITE_API_URL (default: http://localhost:3001/api).
 */

import type {
  Deal,
  CreateDealInput,
  Document as Doc,
  Deadline,
  ConfirmDeadlineInput,
  AuditLog,
  PaginatedResponse,
  User,
  NotificationSetting,
  UpdateNotificationSettingsInput,
  EmailLog,
  EmailPreviewRequest,
  EmailPreviewResponse,
  InboundAddressResponse,
  AssistantAnswer,
  AssistantConversation,
  SuggestedQuestionsResponse,
  DealSummaryResponse,
  IndexStatusResponse,
} from '@/types';
import { authHeaders, notifyUnauthorized } from './session';

const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001/api';

async function send(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  }).catch(() => {
    // fetch only rejects on network failure (server down, offline, CORS)
    throw new Error("We couldn't reach the server. Check your connection and try again.");
  });

  if (!res.ok) {
    if (res.status === 401) notifyUnauthorized();
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }

  return res;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await send(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  signInWithGoogle: (credential: string) =>
    request<{ token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),
  signInAsDemoAgent: () =>
    request<{ token: string; user: User }>('/auth/demo', {
      method: 'POST',
    }),
  me: () => request<{ user: User }>('/auth/me'),
};

// ── Deals ─────────────────────────────────────────────────────────────────────

export const dealsApi = {
  list: () => request<Deal[]>('/deals'),
  get:  (id: string) => request<Deal>(`/deals/${id}`),
  create: (data: CreateDealInput) =>
    request<Deal>('/deals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateDealInput>) =>
    request<Deal>(`/deals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Documents ─────────────────────────────────────────────────────────────────

export const documentsApi = {
  list: (dealId: string) => request<Doc[]>(`/deals/${dealId}/documents`),
  upload: async (dealId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    // Do NOT set Content-Type — browser sets it with boundary automatically
    const res = await send(`/deals/${dealId}/documents`, { method: 'POST', body: form });
    return res.json();
  },
};

// ── Deadlines ─────────────────────────────────────────────────────────────────

export const deadlinesApi = {
  list: (dealId: string) => request<Deadline[]>(`/deals/${dealId}/deadlines`),
  confirm: (dealId: string, deadlineId: string, data: ConfirmDeadlineInput) =>
    request<Deadline>(`/deals/${dealId}/deadlines/${deadlineId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Audit ─────────────────────────────────────────────────────────────────────

export const auditApi = {
  list: (dealId: string, page = 1, limit = 50) =>
    request<PaginatedResponse<AuditLog>>(
      `/deals/${dealId}/audit?page=${page}&limit=${limit}`,
    ),
};

// ── Notifications (Email Contract) ────────────────────────────────────────────

export const notificationsApi = {
  getSettings: (dealId: string) =>
    request<NotificationSetting>(`/deals/${dealId}/notifications/settings`),
  updateSettings: (dealId: string, data: UpdateNotificationSettingsInput) =>
    request<NotificationSetting>(`/deals/${dealId}/notifications/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  sendTestEmail: (dealId: string, to: string) =>
    request<{ sent: boolean; message: string }>(`/deals/${dealId}/notifications/test`, {
      method: 'POST',
      body: JSON.stringify({ to }),
    }),
  sendSummaryEmail: (dealId: string, to: string[]) =>
    request<{ sent: boolean; count: number }>(`/deals/${dealId}/notifications/summary`, {
      method: 'POST',
      body: JSON.stringify({ to }),
    }),
  previewTemplate: (dealId: string, data: EmailPreviewRequest) =>
    request<EmailPreviewResponse>(`/deals/${dealId}/notifications/preview`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getLogs: (dealId: string) =>
    request<EmailLog[]>(`/deals/${dealId}/notifications/log`),
  getInboundAddress: (dealId: string) =>
    request<InboundAddressResponse>(`/deals/${dealId}/notifications/inbound-address`),
};

// ── Assistant (AI Knowledge Assistant Contract) ───────────────────────────────

export const assistantApi = {
  ask: (dealId: string, data: { question: string; conversationId?: string }) =>
    request<AssistantAnswer>(`/deals/${dealId}/assistant/ask`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSuggestions: (dealId: string) =>
    request<SuggestedQuestionsResponse>(`/deals/${dealId}/assistant/suggestions`),
  getSummary: (dealId: string) =>
    request<DealSummaryResponse>(`/deals/${dealId}/assistant/summary`),
  listConversations: (dealId: string) =>
    request<AssistantConversation[]>(`/deals/${dealId}/assistant/conversations`),
  getConversation: (dealId: string, conversationId: string) =>
    request<AssistantConversation>(`/deals/${dealId}/assistant/conversations/${conversationId}`),
  reindex: (dealId: string) =>
    request<{ message: string; documentCount: number }>(`/deals/${dealId}/assistant/reindex`, {
      method: 'POST',
    }),
  getIndexStatus: (dealId: string) =>
    request<IndexStatusResponse>(`/deals/${dealId}/assistant/index-status`),
};

// ── Feature 1: AI Leads API ───────────────────────────────────────────────────

export const leadsApi = {
  list: (params?: { search?: string; status?: string; priority?: string }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'undefined') {
          cleanParams[k] = String(v);
        }
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return request<any[]>(`/leads${query ? `?${query}` : ''}`);
  },
  get: (id: string) => request<any>(`/leads/${id}`),
  create: (data: { fullName: string; email?: string; phone?: string; enquiryText?: string; source?: string }) =>
    request<any>('/leads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateRequirements: (id: string, data: any) =>
    request<any>(`/leads/${id}/requirements`, { method: 'PATCH', body: JSON.stringify(data) }),
  extractRequirements: (id: string, enquiryText: string) =>
    request<any>(`/leads/${id}/extract`, { method: 'POST', body: JSON.stringify({ enquiryText }) }),
};

// ── Feature 2: Conversation & Human Takeover API ──────────────────────────────

export const conversationsApi = {
  getThread: (leadId: string) => request<any>(`/leads/${leadId}/conversations`),
  sendMessage: (leadId: string, content: string, channel = 'EMAIL') =>
    request<any>(`/leads/${leadId}/conversations/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, channel }),
    }),
  toggleTakeover: (leadId: string, isHumanTakeover: boolean) =>
    request<any>(`/leads/${leadId}/conversations/takeover`, {
      method: 'POST',
      body: JSON.stringify({ isHumanTakeover }),
    }),
  toggleAutoPilot: (leadId: string, autoReplyEnabled: boolean) =>
    request<any>(`/leads/${leadId}/conversations/autopilot`, {
      method: 'POST',
      body: JSON.stringify({ autoReplyEnabled }),
    }),
  reviewMessage: (leadId: string, msgId: string, status: string, editedContent?: string) =>
    request<any>(`/leads/${leadId}/conversations/messages/${msgId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, editedContent }),
    }),
};

// ── Feature 3: Property Inventory & Matcher API ──────────────────────────────

export const propertiesApi = {
  list: (params?: { search?: string; minPrice?: number; maxPrice?: number; bedrooms?: number; city?: string }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'undefined') {
          cleanParams[k] = String(v);
        }
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return request<any[]>(`/properties${query ? `?${query}` : ''}`);
  },
  create: (data: any) => request<any>('/properties', { method: 'POST', body: JSON.stringify(data) }),
  getLeadMatches: (leadId: string) => request<any[]>(`/leads/${leadId}/matches`),
  refreshLeadMatches: (leadId: string) =>
    request<any>(`/leads/${leadId}/matches/refresh`, { method: 'POST' }),
};

// ── Feature 4: Transaction Obligations & Tasks API ───────────────────────────

export const tasksApi = {
  list: (dealId: string) => request<any[]>(`/deals/${dealId}/tasks`),
  extractFromDoc: (dealId: string, documentId: string) =>
    request<any[]>(`/deals/${dealId}/tasks/extract`, {
      method: 'POST',
      body: JSON.stringify({ documentId }),
    }),
  reviewTask: (dealId: string, taskId: string, data: any) =>
    request<any>(`/deals/${dealId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Feature 5: Portfolio Knowledge Base API ──────────────────────────────────

export const knowledgeApi = {
  ask: (question: string) =>
    request<AssistantAnswer>('/knowledge/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  getDocuments: () => request<any[]>('/knowledge/documents'),
};

