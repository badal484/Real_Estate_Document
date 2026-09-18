/**
 * /api/deals/:id/documents — PDF upload + list
 *
 * POST  /api/deals/:id/documents  → upload PDF (multer), store, trigger extraction pipeline
 * GET   /api/deals/:id/documents  → list documents for a deal
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadMiddleware } from '../../middleware/upload.js';
import { storeFile } from '../../services/storage.service.js';
import { extractTextFromPdf } from '../../services/pdf.service.js';
import { extractClausesFromText } from '../../services/ai.service.js';
import { asyncHandler, createError } from '../../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// ── GET /api/deals/:id/documents ──────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const docs = await prisma.document.findMany({
      where: { dealId: req.params['id'] },
      orderBy: { uploadedAt: 'desc' },
    });
    res.json(docs);
  }),
);

// ── POST /api/deals/:id/documents ─────────────────────────────────────────
router.post(
  '/',
  uploadMiddleware.single('file'),
  asyncHandler(async (req, res) => {
    const dealId = req.params['id'];
    const file = req.file;
    if (!file) throw createError('No file uploaded', 400);

    // Verify deal exists
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throw createError('Deal not found', 404);

    // Store file (local disk in dev)
    const { storagePath } = await storeFile(file.path, file.originalname);

    // Persist document record
    const document = await prisma.document.create({
      data: {
        dealId,
        filename: file.originalname,
        storagePath,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    });

    // Log upload
    await prisma.auditLog.create({
      data: {
        dealId,
        action: 'DOCUMENT_UPLOADED',
        entityType: 'Document',
        entityId: document.id,
        actor: 'system',
        newValue: { filename: file.originalname, sizeBytes: file.size },
      },
    });

    // ── Extraction pipeline (stubs — will be real in next phase) ──────────
    logger.info(`[Pipeline] Starting extraction for document ${document.id}`);

    await prisma.auditLog.create({
      data: { dealId, action: 'EXTRACTION_STARTED', entityType: 'Document', entityId: document.id, actor: 'system' },
    });

    // Step 1: PDF text extraction (stub)
    const { text } = await extractTextFromPdf(storagePath);

    // Step 2: AI clause extraction (stub)
    const { clauses } = await extractClausesFromText(text, dealId);
    logger.info(`[Pipeline] Extracted ${clauses.length} clauses (stub)`);

    await prisma.auditLog.create({
      data: { dealId, action: 'EXTRACTION_COMPLETED', entityType: 'Document', entityId: document.id, actor: 'system' },
    });

    res.status(201).json({
      document,
      extractedClauses: clauses.length,
      message: 'Document uploaded. Extraction pipeline is a stub — implement pdf.service and ai.service next.',
    });
  }),
);

export default router;
