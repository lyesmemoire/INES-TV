import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    tenantId: string
    role: string
  }
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenant_id,
      role: decoded.role || "user"
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" })
  }
}
