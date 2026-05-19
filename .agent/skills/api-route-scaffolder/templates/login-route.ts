import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { rateLimit } from "@/middleware/rate-limiter"

export const runtime = "nodejs"

const schema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown"
    const body = await request.json()
    const rateLimitKey = `${ip}_${body.email ?? ""}`
    const { success: withinLimit } = await rateLimit.check(rateLimitKey, 5)
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (user.account_status === "locked") {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.password_hash)

    // Clear sensitive references regardless of outcome (timing-uniform)
    ;(password as unknown) = null

    if (!valid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failed_login_attempts: { increment: 1 } },
      })
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Reset failure counter on success
    await prisma.user.update({
      where: { id: user.id },
      data: { failed_login_attempts: 0 },
    })

    // NextAuth handles session token creation via [...nextauth]/route.ts
    return NextResponse.json(
      { message: "Authenticated" },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
