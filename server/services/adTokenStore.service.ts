import crypto from "crypto"
import { prisma } from "../lib/prisma"

export const AdTokenStore = {
  /**
   * 🎲 GENERATION: Create a hashed ad token ledger entry.
   * Truth is in Postgres.
   */
  async createToken(data: {
    userId: string
    tenantId: string
    provider: string
    ecpmSnapshot: number
    segment: string
  }): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")

    await prisma.adToken.create({
      data: {
        tokenHash,
        userId: data.userId,
        tenantId: data.tenantId,
        provider: data.provider,
        status: "SERVED",
        ecpmSnapshot: data.ecpmSnapshot,
        expiresAt: new Date(Date.now() + 60 * 1000) // 1m TTL
      }
    })

    return rawToken
  },

  /**
   * 🛡️ CONSUMPTION: Atomic State Transition (SERVED -> IMPRESSED)
   * Prevents double-spend and race conditions.
   */
  async consumeToken(rawToken: string): Promise<any | null> {
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")

    try {
      // ⚡ ATOMIC UPDATE: Only update if status is 'SERVED'
      const updateResult = await prisma.adToken.updateMany({
        where: {
          tokenHash,
          status: "SERVED",
          expiresAt: { gt: new Date() }
        },
        data: {
          status: "IMPRESSED"
        }
      })

      // If count is 0, the token was already consumed, expired or doesn't exist
      if (updateResult.count === 0) {
        return null
      }

      // Fetch the updated record for result propagation
      return await prisma.adToken.findUnique({
        where: { tokenHash }
      })
    } catch (e) {
      console.error("✕ [AdTokenStore] Atomic consumption failed:", e)
      return null
    }
  }
}


