import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  logger.error(`[${statusCode}] ${err.message}`, {
    stack: err.stack,
  });

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
    },
  });
}

/** Wrap an async route handler so errors propagate to errorHandler */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/** Create an operational error with HTTP status */
export function createError(message: string, statusCode = 400): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
}
