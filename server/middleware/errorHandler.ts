import pkg, { Request, Response, NextFunction } from 'express';
const { Router } = pkg;

/**
 * Global error handler middleware.
 * Catches any error passed via next(err) and returns a structured JSON error response.
 */
import logger from '../services/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`[ErrorHandler] Unhandled error on ${req.method} ${req.path}: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    status: 'error',
    message: 'Internal server error. Please try again.',
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
  });
}
