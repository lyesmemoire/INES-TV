import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Injects a unique requestId (Correlation ID) into every request.
 * Header: x-request-id
 */
export function traceMiddleware(req: any, res: Response, next: NextFunction) {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  
  req.id = requestId;
  res.setHeader("x-request-id", requestId);
  
  next();
}
