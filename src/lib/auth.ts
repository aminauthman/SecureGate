import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { checkRateLimit } from "@/lib/rate-limit";
import { findUserByEmail, incrementFailedAttempts, resetFailedAttempts } from "@/lib/services/user";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MINUTES = 15;
const DUMMY_HASH = "$2b$12$PI66rA4K7Dl01YcP0W/76eR5oUrbGulDGtwjYbAuAFyAAOoNDS7By";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const ip = ((req?.headers as Record<string, string>)?.["x-forwarded-for"] || "").split(",")[0]?.trim() || "127.0.0.1";
        const { allowed } = await checkRateLimit(`login:${ip}`);
        if (!allowed) {
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const user = await findUserByEmail(email);

        if (user) {
          const acctAllowed = await checkRateLimit(`login-account:${email}`);
          if (!acctAllowed.allowed) {
            throw new Error("TOO_MANY_ATTEMPTS");
          }
        }

        if (!user) {
          await bcrypt.compare(parsed.data.password, DUMMY_HASH);
          return null;
        }

        if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

        if (!isValid) {
          await incrementFailedAttempts(email, user.failedLoginAttempts, MAX_FAILED_ATTEMPTS, LOCKOUT_DURATION_MINUTES);
          return null;
        }

        await resetFailedAttempts(email);

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified.toISOString(),
          tokenVersion: user.tokenVersion,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth?mode=signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        (token as { emailVerified?: string }).emailVerified = (user as { emailVerified?: string }).emailVerified;
        (token as { tokenVersion?: number }).tokenVersion = (user as { tokenVersion?: number }).tokenVersion;
      }

      if (token.id) {
        const dbUser = await db.user.findUnique({ where: { id: token.id as string }, select: { tokenVersion: true } });
        if (dbUser && (token as { tokenVersion?: number }).tokenVersion !== dbUser.tokenVersion) {
          return { ...token, id: undefined, name: undefined, email: undefined, emailVerified: undefined, tokenVersion: undefined };
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        session.user.name = token.name;
        (session.user as { emailVerified?: string | null }).emailVerified = (token as { emailVerified?: string }).emailVerified ?? null;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
