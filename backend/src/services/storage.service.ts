/**
 * Storage Service
 *
 * Local disk in dev (files land in backend/uploads/).
 * Production storage is ImageKit — set STORAGE_DRIVER=imagekit and the
 * IMAGEKIT_* env vars to upload documents to ImageKit's media library / CDN.
 */

import { readFile } from 'node:fs/promises';
import ImageKit from 'imagekit';
import { logger } from '../utils/logger.js';

export interface UploadedFile {
  storagePath: string;   // local path (dev) or ImageKit URL (prod)
  publicUrl: string | null;
}

let imagekit: ImageKit | null = null;

function getImageKitClient(): ImageKit {
  if (imagekit) return imagekit;

  const publicKey = process.env['IMAGEKIT_PUBLIC_KEY'];
  const privateKey = process.env['IMAGEKIT_PRIVATE_KEY'];
  const urlEndpoint = process.env['IMAGEKIT_URL_ENDPOINT'];

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      'ImageKit is not configured — set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT',
    );
  }

  imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return imagekit;
}

export async function storeFile(localPath: string, filename: string): Promise<UploadedFile> {
  const driver = process.env['STORAGE_DRIVER'] ?? 'local';

  if (driver === 'local') {
    logger.info(`[Storage] Stored locally at: ${localPath}`);
    return { storagePath: localPath, publicUrl: null };
  }

  if (driver === 'imagekit') {
    const client = getImageKitClient();
    const fileBuffer = await readFile(localPath);

    const result = await client.upload({
      file: fileBuffer,
      fileName: filename,
      folder: process.env['IMAGEKIT_FOLDER'] ?? '/contingency-copilot',
      useUniqueFileName: true,
      isPrivateFile: true,
    });

    logger.info(`[Storage] Uploaded to ImageKit (private): ${result.filePath}`);
    // storagePath is the private file's URL — it will 403 without a signature.
    // Use getSignedDocumentUrl() to hand callers a working, time-limited link.
    return { storagePath: result.url, publicUrl: null };
  }

  logger.warn(`[Storage] Unknown driver "${driver}" — falling back to local`);
  return { storagePath: localPath, publicUrl: null };
}

/**
 * Turns a stored document path into a link the caller can actually open.
 * - local driver: the path is already only reachable from this server, return as-is.
 * - imagekit driver: files are uploaded private, so this signs a URL that
 *   expires after `expireSeconds` (default 15 minutes).
 */
export function getSignedDocumentUrl(storagePath: string, expireSeconds = 900): string {
  const driver = process.env['STORAGE_DRIVER'] ?? 'local';

  if (driver !== 'imagekit') {
    return storagePath;
  }

  const client = getImageKitClient();
  return client.url({ src: storagePath, signed: true, expireSeconds });
}
