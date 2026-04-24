import { Request, Response, NextFunction } from "express";

/**
 * Middleware de transition - Geo Access
 * Désactivé temporairement pour le déploiement v2.1
 */
export function requireGeoAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // TODO: Réimplémenter la logique Géo-IP si nécessaire
  next();
}
