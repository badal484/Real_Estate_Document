import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import dealsRouter from './api/routes/deals.js';
import documentsRouter from './api/routes/documents.js';
import deadlinesRouter from './api/routes/deadlines.js';
import auditRouter from './api/routes/audit.js';
import inboundRouter from './api/routes/inbound.js';
import notificationsRouter from './api/routes/notifications.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startScheduler } from './services/scheduler.service.js';

export function createApp() {
  const app = express();

  // Start background cron scheduler for deadline alerts
  if (process.env['NODE_ENV'] !== 'test') {
    startScheduler();
  }

  // ── Security & parsing middleware ────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API routes ────────────────────────────────────────────────────────────
  app.use('/api/deals', dealsRouter);
  app.use('/api/deals/:id/documents', documentsRouter);
  app.use('/api/deals/:id/deadlines', deadlinesRouter);
  app.use('/api/deals/:id/notifications', notificationsRouter);
  app.use('/api/deals/:id/audit', auditRouter);
  app.use('/api/inbound', inboundRouter);

  // ── 404 catch-all ─────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
  });

  // ── Global error handler ──────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}

