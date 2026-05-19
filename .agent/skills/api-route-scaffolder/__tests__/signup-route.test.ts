// signup route test example
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "../templates/signup-route"

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock("@/middleware/rate-limiter", () => ({
  rateLimit: { check: vi.fn() },
}))

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn(() => "hashed_password") },
}))

const mockJson = (body: unknown) =>
  new NextRequest("http://localhost", {
    method: "POST",
    headers: { "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify(body),
  })

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 429 when rate limited", async () => {
    const { rateLimit } = await import("@/middleware/rate-limiter")
    vi.mocked(rateLimit.check).mockResolvedValue({ success: false })

    const res = await POST(mockJson({ email: "test@test.com", password: "Password123!" }))
    expect(res.status).toBe(429)
  })

  it("returns 400 for invalid email", async () => {
    const { rateLimit } = await import("@/middleware/rate-limiter")
    vi.mocked(rateLimit.check).mockResolvedValue({ success: true })

    const res = await POST(mockJson({ email: "not-an-email", password: "Password123!" }))
    expect(res.status).toBe(400)
  })

  it("returns 409 for duplicate email", async () => {
    const { rateLimit } = await import("@/middleware/rate-limiter")
    vi.mocked(rateLimit.check).mockResolvedValue({ success: true })

    const prisma = await import("@/lib/prisma")
    vi.mocked(prisma.default.user.findUnique).mockResolvedValue({ id: "existing" } as any)

    const res = await POST(mockJson({ email: "existing@test.com", password: "Password123!" }))
    expect(res.status).toBe(409)
  })

  it("returns 201 on successful signup", async () => {
    const { rateLimit } = await import("@/middleware/rate-limiter")
    vi.mocked(rateLimit.check).mockResolvedValue({ success: true })

    const prisma = await import("@/lib/prisma")
    vi.mocked(prisma.default.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.default.user.create).mockResolvedValue({ id: "new-user" } as any)

    const res = await POST(mockJson({ email: "new@test.com", password: "StrongPass123!" }))
    expect(res.status).toBe(201)
  })
})
