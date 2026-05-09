import { describe, it, expect, vi } from "vitest"
import { middleware } from "../../middleware"
import { NextRequest, NextResponse } from "next/server"

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    }
  }))
}))

// Mock NextResponse
vi.mock("next/server", () => {
  const mockHeaders = {
    set: vi.fn(),
    get: vi.fn(),
  };
  return {
    NextResponse: {
      next: vi.fn(() => ({ 
        status: 200, 
        headers: mockHeaders 
      })),
      redirect: vi.fn((url) => ({ 
        status: 307, 
        headers: { 
          ...mockHeaders,
          location: url.toString()
        } 
      }))
    }
  };
})

describe("Middleware Unit Tests", () => {
  it("should redirect unauthenticated users from /admin to /login", async () => {
    const req = {
      nextUrl: { pathname: "/admin" },
      cookies: { 
        get: vi.fn().mockReturnValue(undefined),
        getAll: vi.fn().mockReturnValue([])
      },
      headers: new Headers(),
      url: "http://localhost:3000/admin"
    } as unknown as NextRequest

    const res = await middleware(req)
    
    expect(NextResponse.redirect).toHaveBeenCalled()
    // Check if redirect URL contains /login
    const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0][0]
    expect(redirectCall.toString()).toContain("/login")
  })

  it("should allow public routes without redirection", async () => {
    const req = {
      nextUrl: { pathname: "/" },
      cookies: { 
        get: vi.fn(),
        getAll: vi.fn().mockReturnValue([])
      },
      headers: new Headers(),
      url: "http://localhost:3000/"
    } as unknown as NextRequest

    const res = await middleware(req)
    expect(NextResponse.next).toHaveBeenCalled()
  })
})
