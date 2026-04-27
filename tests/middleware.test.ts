import { describe, it, expect } from "vitest"

describe("Middleware Security", () => {
  it("should block requests without auth on protected routes", async () => {
    const res = await fetch("http://localhost:3000/api/stream/1")
    expect(res.status).toBe(401)
  })

  it("should enforce rate limits", async () => {
    const promises = Array(100).fill(null).map(() =>
      fetch("http://localhost:3000/api/stream/1", {
        headers: { "Authorization": "Bearer valid-token" }
      })
    )
    
    const results = await Promise.all(promises)
    const rateLimited = results.filter(r => r.status === 429)
    
    expect(rateLimited.length).toBeGreaterThan(0)
  })

  it("should kick duplicate sessions", async () => {
    // Login device A
    await fetch("/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ token: "user1", deviceId: "deviceA" })
    })

    // Login device B (should kick A)
    const res = await fetch("/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ token: "user1", deviceId: "deviceB" })
    })

    const data = await res.json()
    expect(data.kicked).toBe(true)
  })
})
