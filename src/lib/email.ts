import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const FROM_EMAIL = process.env.SMTP_FROM || "SecureGate <noreply@securegate.iam>";

let transporter: Transporter | null = null;
let etherealUrl: string | null = null;

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.VERCEL_BRANCH_URL) return `https://${process.env.VERCEL_BRANCH_URL}`;
  return "http://localhost:3000";
}

async function initTransporter(): Promise<Transporter | null> {
  if (process.env.SMTP_HOST && process.env.SMTP_HOST !== "smtp.example.com") {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Skip Ethereal fallback on Vercel — SMTP must be configured
  if (process.env.VERCEL) {
    console.error("[Nodemailer] SMTP not configured — set SMTP_* env vars in Vercel project settings");
    return null;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealUrl = "https://ethereal.email/messages";
    console.log("[Nodemailer] Using Ethereal Email for development");
    console.log(`[Nodemailer] View emails at: ${etherealUrl}`);
    console.log(`[Nodemailer] Username: ${testAccount.user}`);
    console.log(`[Nodemailer] Password: ${testAccount.pass}`);

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.error("[Nodemailer] Failed to create Ethereal test account:", err);
    return null;
  }
}

async function getTransporter(): Promise<Transporter | null> {
  if (!transporter) {
    transporter = await initTransporter();
  }
  return transporter;
}

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const tp = await getTransporter();
  if (!tp) {
    if (process.env.VERCEL) {
      console.error(`[Vercel] Email NOT sent to ${options.to} — configure SMTP_* env vars`);
    } else {
      console.log(`[DEV] Email would be sent to ${options.to}`);
      console.log(`[DEV] Subject: ${options.subject}`);
    }
    return false;
  }

  try {
    const info = await tp.sendMail({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (etherealUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Nodemailer] Preview: ${previewUrl}`);
      }
    }

    return true;
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl?: string
): Promise<boolean> {
  const verificationUrl = `${baseUrl || getBaseUrl()}/verify-email/${token}`;

  return sendMail({
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
        This link expires in 15 minutes. If you did not create an account, you can ignore this email.
      </p>
    </div>
  </body>
</html>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  baseUrl?: string
): Promise<boolean> {
  const resetUrl = `${baseUrl || getBaseUrl()}/reset-password?token=${token}`;

  return sendMail({
    to: email,
    subject: "Reset your password",
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background-color: #f8fafc; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">SecureGate IAM</h1>
      <p style="color: #64748b; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
        Click the button below to reset your password. This link expires in 15 minutes.
      </p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
        Reset Password
      </a>
      <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">
        If you did not request a password reset, you can ignore this email.
      </p>
    </div>
  </body>
</html>`,
  });
}
