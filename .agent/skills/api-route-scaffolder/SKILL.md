# SKILL: api-route-scaffolder

## 1. Objective

Generate Next.js API route handlers and server actions for the SecureGate auth IAM layer. Every route must integrate rate limiting, Zod validation, Bcrypt hashing (where applicable), NextAuth session management, and generic error responses per `security.md`.

---

## 2. Route Map

```text
app/api/auth/
├── signup/route.ts           # POST - Register new user
├── login/route.ts            # POST - Authenticate + return session
├── logout/route.ts           # POST - Destroy session
├── verify-email/route.ts     # POST - Confirm email token
├── forgot-password/route.ts  # POST - Send reset email
├── reset-password/route.ts   # POST - Apply new password
└── [...nextauth]/route.ts    # NextAuth catch-all
```

File naming: `route.ts` for Next.js App Router handlers.

---

## 3. Scaffolding Command

```text
npm run scaffold:route -- name=auth.signup
```

Or manually create:
```text
app/api/auth/signup/
└── route.ts
```

---

## 4. Route Handler Template

```tsx
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { rateLimit } from "@/middleware/rate-limiter"
import { sendVerificationEmail } from "@/services/notification-worker"

const schema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(12).max(128),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit
    const ip = request.headers.get("x-forwarded-for") ?? "unknown"
    const { success: withinLimit } = await rateLimit.check(ip, 5)
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    }

    // 2. Validate input
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // 3. Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 409 }
      )
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // 5. Create user
    const user = await prisma.user.create({
      data: { email, password_hash: passwordHash },
    })

    // 6. Send verification email (background)
    await sendVerificationEmail(user.id, user.email)

    // 7. Nullify sensitive reference
    ;(password as unknown) = null
    ;(passwordHash as unknown) = null

    return NextResponse.json(
      { message: "Account created. Check your email to verify." },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
```

---

## 5. Server Action Template

For forms that benefit from progressive enhancement:

```tsx
"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { signIn } from "next-auth/react"
import prisma from "@/lib/prisma"
import { rateLimit } from "@/middleware/rate-limiter"

const loginSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1),
})

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const ip = headers().get("x-forwarded-for") ?? "unknown"

  const { success: withinLimit } = await rateLimit.check(`${ip}_login`, 5)
  if (!withinLimit) return { error: "Too many requests. Try again later." }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) return { error: "Invalid email or password" }

  const { email, password } = parsed.data

  try {
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) return { error: "Invalid email or password" }
    return {}
  } catch {
    return { error: "Something went wrong. Please try again." }
  }
}
```

---

## 6. Security Middleware Integration (by route)

| Route | Rate Limit Key | Limit | Crypto | Auth Required |
|---|---|---|---|---|
| `POST /signup` | IP | 5/min | bcryptjs hash | No |
| `POST /login` | IP + email | 5/min | bcryptjs compare | No |
| `POST /logout` | IP | 10/min | None | Yes (NextAuth) |
| `POST /verify-email` | IP + token | 5/min | None | No |
| `POST /forgot-password` | IP | 5/min | crypto random token | No |
| `POST /reset-password` | IP + token | 5/min | bcryptjs hash | No |

---

## 7. Verification Checklist

After scaffolding a route, confirm:

- [ ] Rate limiter check runs before any business logic
- [ ] Zod schema validates all inputs before processing
- [ ] Passwords hashed with bcryptjs (>=12 salt rounds)
- [ ] Generic error messages returned (no stack traces, no "user not found")
- [ ] HTTP 429 returned with `Retry-After` header when rate limited
- [ ] Sensitive variables nullified after use (`password = null`)
- [ ] Route uses proper HTTP method (`POST` for state changes, never `GET`)
- [ ] NextAuth session used for authenticated routes (not manual token checks)
- [ ] `try/catch` wraps all logic to prevent unhandled rejections
- [ ] Response follows consistent JSON shape: `{ error?: string, message?: string, data?: T }`
