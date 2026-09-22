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
} from '@/types';

const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

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
    const res = await fetch(`${BASE_URL}/deals/${dealId}/documents`, {
      method: 'POST',
      body: form,
      // Do NOT set Content-Type — browser sets it with boundary automatically
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
    }
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
