/**
 * Storage Service — STUB
 *
 * Local disk in dev (files land in backend/uploads/).
 * Will switch to AWS S3 or Cloudflare R2 in production via STORAGE_DRIVER env var.
 *
 * v1: local disk path is returned as-is.
 */

import { logger } from '../utils/logger.js';

export interface UploadedFile {
  storagePath: string;   // local path (dev) or S3/R2 key (prod)
  publicUrl: string | null;
}

export async function storeFile(localPath: string, _filename: string): Promise<UploadedFile> {
  const driver = process.env['STORAGE_DRIVER'] ?? 'local';

  if (driver === 'local') {
    logger.info(`[Storage] Stored locally at: ${localPath}`);
    return { storagePath: localPath, publicUrl: null };
  }

  // TODO: implement S3 / R2 upload using AWS SDK
  logger.warn(`[Storage stub] Driver "${driver}" not yet implemented — falling back to local`);
  return { storagePath: localPath, publicUrl: null };
}
