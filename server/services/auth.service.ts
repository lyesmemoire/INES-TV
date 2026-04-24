import jwt from "jsonwebtoken"

export const generateToken = (user: any) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      tenant_id: user.tenantId,
      role: user.role || "user"
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  )
}
