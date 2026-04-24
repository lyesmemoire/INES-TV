import { Response, NextFunction } from "express";

export function tenantMiddleware(req: any, res: Response, next: NextFunction) {
  const tenantId = req.headers["x-tenant-id"] || "default";

  req.tenantId = tenantId;

  next();
}
