import type { Request, Response, NextFunction } from 'express';
import { verifySessionToken, type SessionUser } from '../services/auth.service.js';
import { createError } from './errorHandler.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

/** Reject requests without a valid `Authorization: Bearer <session JWT>` header. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(createError('Authentication required', 401));
    return;
  }
  try {
    req.user = verifySessionToken(token);
    next();
  } catch (err) {
    next(err);
  }
}
