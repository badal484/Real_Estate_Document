import 'dotenv/config';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';
import { initAlertCron } from './services/alert.service.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

const app = createApp();
const server = createServer(app);

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Stop the existing backend process or set PORT to another available port.`);
    process.exitCode = 1;
    return;
  }

  logger.error(`Failed to start backend: ${error.message}`);
  process.exitCode = 1;
});

server.listen(PORT, () => {
  logger.info(`🏠 Contingency Deadline Copilot API running on http://localhost:${PORT}`);
  logger.info(`   Health: http://localhost:${PORT}/health`);
  logger.info(`   Deals:  http://localhost:${PORT}/api/deals`);
  logger.info(`   Env:    ${process.env['NODE_ENV'] ?? 'development'}`);

  // Initialize automated contingency deadline alerts
  initAlertCron();
});
