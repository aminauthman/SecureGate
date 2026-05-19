import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours (security.md mandate)
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Validate payload boundaries
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: parsed.data.email.toLowerCase() },
          });

          if (!user) {
            // Identity discovery / enumeration defense (identical execution time placeholder)
            await bcrypt.compare(parsed.data.password, "$2a$10$NotRealPasswordHashPlaceholderForTimingUniformity");
            return null;
          }

          const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

          // Resource cleansing: nullify references to credentials
          credentials.password = "";
          parsed.data.password = "";

          if (!isValid) {
            return null;
          }

          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          return {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified.toISOString(),
          };
        } catch {
          // Diagnostic protection: Never return raw stack traces or database errors
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "secure-gate-fallback-secret-key-123456",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        (token as { emailVerified?: string }).emailVerified = (user as { emailVerified?: string }).emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; email?: string | null; emailVerified?: string | null }).id = token.id as string;
        (session.user as { emailVerified?: string | null }).emailVerified = (token as { emailVerified?: string }).emailVerified ?? null;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
