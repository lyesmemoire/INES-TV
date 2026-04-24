import express, { Request, Response, NextFunction } from 'express';

/**
 * Simple request logger middleware.
 * Logs method, path, status code, and response time.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, path } = req;

  res.on('finish', () => {
    const ms = Date.now() - start;
    const statusColor =
      res.statusCode >= 500 ? '\x1b[31m' : // red
      res.statusCode >= 400 ? '\x1b[33m' : // yellow
      res.statusCode >= 300 ? '\x1b[36m' : // cyan
      '\x1b[32m';                            // green
    console.log(`${statusColor}${method}\x1b[0m ${path} → ${statusColor}${res.statusCode}\x1b[0m (${ms}ms)`);
  });

  next();
}
