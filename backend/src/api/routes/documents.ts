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
import { extractClausesFromPdf } from '../../services/ai.service.js';
import { computeDeadlinesForDeal } from '../../services/deadline.service.js';
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
router.post('/',uploadMiddleware.single('file'),
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

    // ── Gemini extraction pipeline ───────────────────────────────────────
    logger.info(`[Pipeline] Starting extraction for document ${document.id}`);

    await prisma.auditLog.create({
      data: { dealId, action: 'EXTRACTION_STARTED', entityType: 'Document', entityId: document.id, actor: 'system' },
    });

    const extraction = await extractClausesFromPdf(storagePath);
    const clauses = await Promise.all(
      extraction.clauses.map((clause) =>
        prisma.contingencyClause.create({
          data: {
            dealId,
            documentId: document.id,
            clauseType: clause.clauseType,
            rawText: clause.rawText,
            pageNumber: clause.pageNumber,
            numberOfDays: clause.numberOfDays,
            dayType: clause.dayType,
            confidence: clause.confidence,
            ...(clause.boundingBox ? { boundingBox: clause.boundingBox } : {}),
          },
        }),
      ),
    );

    const baseAcceptanceDate = deal.acceptanceDate ?? new Date();
    const deadlines = await computeDeadlinesForDeal(dealId, baseAcceptanceDate, clauses);
    logger.info(`[Pipeline] Extracted ${clauses.length} clauses and computed ${deadlines.length} deadlines`);

    await prisma.auditLog.create({
      data: {
        dealId,
        action: 'EXTRACTION_COMPLETED',
        entityType: 'Document',
        entityId: document.id,
        actor: 'system',
        newValue: { clauses: clauses.length, deadlines: deadlines.length, model: extraction.model },
      },
    });

    res.status(201).json({
      document,
      extractedClauses: clauses.length,
      computedDeadlines: deadlines.length,
      message: 'Document uploaded and contingency extraction completed.',
    });
  }),
);

export default router;
