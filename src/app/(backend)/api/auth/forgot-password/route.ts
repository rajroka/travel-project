import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { generatePasswordResetToken } from "@/lib/auth/auth";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendMail, passwordResetTemplate } from "@/lib/email/mailer";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 422 }
      );
    }

    const { email } = parsed.data;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { success: true, message: "If that email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    const { token, expires } = generatePasswordResetToken();
    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await user.save();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    sendMail({
      to: email,
      subject: "Reset your password - Smart Tourism",
      html: passwordResetTemplate(user.firstName, resetUrl),
      userId: String(user._id),
      templateType: "password_reset",
    }).catch(console.error);

    return NextResponse.json(
      { success: true, message: "If that email exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
