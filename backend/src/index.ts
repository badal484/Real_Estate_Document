import 'dotenv/config';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

const app = createApp();

app.listen(PORT, () => {
  logger.info(`🏠 Contingency Deadline Copilot API running on http://localhost:${PORT}`);
  logger.info(`   Health: http://localhost:${PORT}/health`);
  logger.info(`   Deals:  http://localhost:${PORT}/api/deals`);
  logger.info(`   Env:    ${process.env['NODE_ENV'] ?? 'development'}`);
});
