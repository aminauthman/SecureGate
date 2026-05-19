import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "SecureGate <noreply@securegate.iam>";

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_dummy12345") {
    console.log(`[DEV] Verification email to ${email}: ${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`);
    return true;
  }

  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your email address",
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background-color: #f8fafc; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">SecureGate IAM</h1>
      <p style="color: #64748b; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
        Click the button below to verify your email address and activate your account.
      </p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
        Verify Email
      </a>
      <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">
        This link expires in 24 hours. If you did not create an account, you can ignore this email.
      </p>
    </div>
  </body>
</html>`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}
