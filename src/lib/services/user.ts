import { db } from "@/lib/db";

export interface UserData {
  name: string;
  email: string;
  passwordHash: string;
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function createUser(data: UserData) {
  return db.user.create({ data });
}

export async function findVerificationToken(token: string) {
  return db.verificationToken.findUnique({ where: { token } });
}

export async function createVerificationToken(identifier: string, token: string, expires: Date) {
  return db.verificationToken.create({ data: { identifier, token, expires } });
}

export async function deleteVerificationTokensByIdentifier(identifier: string) {
  return db.verificationToken.deleteMany({ where: { identifier } });
}

export async function verifyEmail(email: string, tokenId: string) {
  return db.$transaction([
    db.user.update({ where: { email }, data: { emailVerified: new Date() } }),
    db.verificationToken.delete({ where: { id: tokenId } }),
  ]);
}

export async function resetPassword(email: string, passwordHash: string, tokenId: string) {
  return db.$transaction([
    db.user.update({ where: { email }, data: { passwordHash, tokenVersion: { increment: 1 } } }),
    db.verificationToken.delete({ where: { id: tokenId } }),
  ]);
}

export async function incrementFailedAttempts(email: string, currentAttempts: number, maxAttempts: number, lockoutMinutes: number) {
  return db.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { email } });
    if (!current) return;
    const nextAttempts = current.failedLoginAttempts + 1;
    if (nextAttempts >= maxAttempts) {
      await tx.user.update({
        where: { email },
        data: {
          failedLoginAttempts: 0,
          accountLockedUntil: new Date(Date.now() + lockoutMinutes * 60 * 1000),
        },
      });
    } else {
      await tx.user.update({
        where: { email },
        data: { failedLoginAttempts: nextAttempts },
      });
    }
  });
}

export async function resetFailedAttempts(email: string) {
  return db.user.update({
    where: { email },
    data: { failedLoginAttempts: 0, accountLockedUntil: null },
  });
}
