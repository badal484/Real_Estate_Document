# AI Knowledge Assistant (Real Estate Contract Copilot)

The **AI Knowledge Assistant** provides real-time, legally-grounded answers to arbitrary questions regarding a deal's uploaded contracts, addenda, counter offers, inspection reports, title commitments, and HOA disclosures with **verifiable deep citations**.

---

## 1. Core Architecture & Design Principles

### Non-Negotiable Guardrails
1. **Zero Hallucination:** Answers are derived strictly from the provided deal records and document chunks. If information is not present, the assistant explicitly states what is missing and recommends requesting the necessary document (e.g. HOA addendum or seller disclosure).
2. **Deterministic Server-Side Verification (`citationVerifier.ts`):** Every citation undergoes Unicode NFKC normalization, hyphenation resolution, and quote substring validation against the database chunk text. Hallucinated or imprecise quotes are dropped before delivering the response.
3. **Contract Precedence:** Addenda and Counter Offers take strict precedence over the initial Purchase Agreement. When an addendum modifies a contingency (e.g., extending inspection from 10 to 17 calendar days), the assistant reports the modified term and highlights the override with both source references.
4. **Confirmed vs. Unconfirmed Deadlines:** Dates confirmed by the agent are marked as `CONFIRMED`. Dates computed solely by AI that are still pending agent review are explicitly marked `"unconfirmed, pending agent review"`.
5. **Prompt-Injection Defense:** Document text is wrapped in `<DOC_DATA>` delimiters and treated as untrusted external data. The system prompt instructs Gemini never to follow instructions contained inside document text.

---

## 2. Ingestion & Retrieval Pipeline

```
[Uploaded PDF]
      │
      ▼
extractPagesFromPdf() ── (if text < 30 chars) ──► Gemini Vision OCR (source="ocr")
      │
      ▼
classifyDocument() ────► docType: PURCHASE_AGREEMENT | COUNTER_OFFER | ADDENDUM | ...
      │
      ▼
chunkDocumentPages() ──► Preserves section headers ("14. INSPECTION") & page bounds
      │
      ▼
generateEmbedding() ───► text-embedding-004 vector embeddings
      │
      ▼
PostgreSQL / pgvector ─► Stored in `document_chunks` with HNSW vector index
```

### Dual-Mode Retrieval
- **Full-Context Mode (< 120k tokens):** For typical deal packets (10–60 pages), all indexed pages are injected into Gemini's long-context attention window, guaranteeing complete cross-document visibility and zero chunk-boundary truncation.
- **Hybrid Retrieval Mode (100+ pages):** Core contracts and addenda are always included in full; bulky documents (inspection, HOA, title) are retrieved using vector cosine similarity + full-text keyword matching with Reciprocal Rank Fusion (RRF) and neighbor-page expansion (+/- 1 page).

---

## 3. API Reference

### `POST /api/deals/:id/assistant/ask`
Submit a question regarding the deal.

**Request Body:**
```json
{
  "question": "When does the buyer inspection contingency expire?",
  "conversationId": "optional-conversation-id"
}
```

**Response (JSON or SSE):**
```json
{
  "conversationId": "cuid-123",
  "messageId": "cuid-456",
  "answer": "The buyer inspection contingency expires on **October 14, 2026** (10 calendar days after the October 4 Acceptance Date) [^1]. This deadline is confirmed by the agent [^2].",
  "found": true,
  "isDirectlyAnswerable": true,
  "confidence": 0.95,
  "overrides": [],
  "citations": [
    {
      "id": 1,
      "sourceType": "document",
      "documentId": "doc-1",
      "documentName": "Purchase_Agreement.pdf",
      "pageNumber": 4,
      "section": "14. PROPERTY INSPECTIONS",
      "quote": "Buyer shall have 10 calendar days after Acceptance Date to complete all physical inspections",
      "confidence": 0.98
    },
    {
      "id": 2,
      "sourceType": "deadline",
      "deadlineId": "deadline-1",
      "deadlineLabel": "Inspection Contingency",
      "isConfirmed": true,
      "confidence": 1.0
    }
  ],
  "suggestedFollowUps": [
    "What remedies does the buyer have if repairs are needed?",
    "Who pays for the pest and termite inspection?"
  ]
}
```

### `GET /api/deals/:id/assistant/suggestions`
Returns contextual question chips based on the deal's uploaded document types and extracted clauses.

### `GET /api/deals/:id/assistant/summary`
Returns an executive transaction summary, contingency matrix, and automated risk matrix (unconfirmed dates, missing documents, low confidence clauses).

### `GET /api/deals/:id/assistant/index-status`
Returns document indexing progress (`PENDING` | `INDEXING` | `READY` | `FAILED`) and chunk counts.

### `POST /api/deals/:id/assistant/reindex`
Triggers full background re-extraction, re-classification, and re-indexing for all documents in the deal.
