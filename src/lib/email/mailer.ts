import nodemailer from "nodemailer";
import { EmailNotification } from "@/lib/db/models/EmailNotification";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  userId?: string;
  templateType: string;
}

export async function sendMail({
  to,
  subject,
  html,
  userId,
  templateType,
}: SendMailOptions): Promise<void> {
  // Log email attempt
  const emailLog = await EmailNotification.create({
    user: userId,
    toEmail: to,
    subject,
    templateType,
    status: "pending",
  });

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Smart Tourism"}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    await EmailNotification.findByIdAndUpdate(emailLog._id, {
      status: "sent",
      sentAt: new Date(),
    });
  } catch (error) {
    await EmailNotification.findByIdAndUpdate(emailLog._id, {
      status: "failed",
      errorMessage: (error as Error).message,
    });
    console.error("Failed to send email:", error);
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export function welcomeEmailTemplate(firstName: string, verificationUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Smart Tourism, ${firstName}!</h2>
      <p>Thank you for registering. Please verify your email address to get started.</p>
      <a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:6px;">
        Verify Email
      </a>
      <p style="color:#666;font-size:12px;">Link expires in 24 hours.</p>
    </div>
  `;
}

export function passwordResetTemplate(firstName: string, resetUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${firstName}, we received a request to reset your password.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#ef4444;color:#fff;text-decoration:none;border-radius:6px;">
        Reset Password
      </a>
      <p style="color:#666;font-size:12px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;
}

export function bookingConfirmationTemplate(
  firstName: string,
  bookingNumber: string,
  packageTitle: string,
  travelDate: string,
  totalAmount: number
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Confirmation</h2>
      <p>Hi ${firstName}, your booking has been received!</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Booking Number</strong></td><td style="padding:8px;border:1px solid #ddd;">${bookingNumber}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Package</strong></td><td style="padding:8px;border:1px solid #ddd;">${packageTitle}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Travel Date</strong></td><td style="padding:8px;border:1px solid #ddd;">${travelDate}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Total Amount</strong></td><td style="padding:8px;border:1px solid #ddd;">$${totalAmount}</td></tr>
      </table>
      <p>Our staff will review and confirm your booking shortly.</p>
    </div>
  `;
}

export function bookingStatusTemplate(
  firstName: string,
  bookingNumber: string,
  status: string,
  message?: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Status Update</h2>
      <p>Hi ${firstName}, your booking <strong>${bookingNumber}</strong> has been updated.</p>
      <p>Status: <strong style="text-transform:capitalize;">${status}</strong></p>
      ${message ? `<p>${message}</p>` : ""}
    </div>
  `;
}

export function paymentReceiptTemplate(
  firstName: string,
  invoiceNumber: string,
  amount: number,
  paymentMethod: string,
  date: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Receipt</h2>
      <p>Hi ${firstName}, your payment has been received.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Invoice</strong></td><td style="padding:8px;border:1px solid #ddd;">${invoiceNumber}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Amount</strong></td><td style="padding:8px;border:1px solid #ddd;">$${amount}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Method</strong></td><td style="padding:8px;border:1px solid #ddd;">${paymentMethod}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Date</strong></td><td style="padding:8px;border:1px solid #ddd;">${date}</td></tr>
      </table>
    </div>
  `;
}
