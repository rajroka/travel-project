import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import {
  hashPassword,
  generateEmailVerificationToken,
  signAccessToken,
} from "@/lib/auth/auth";
import { registerSchema } from "@/lib/validations/auth";
import { slugify } from "@/lib/utils/helpers";
import { sendMail, welcomeEmailTemplate } from "@/lib/email/mailer";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { firstName, lastName, email, password, phone } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const { token: verificationToken, expires: verificationExpires } =
      generateEmailVerificationToken();

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: "customer",
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;
    sendMail({
      to: email,
      subject: "Verify your email - Smart Tourism",
      html: welcomeEmailTemplate(firstName, verificationUrl),
      userId: String(user._id),
      templateType: "welcome",
    }).catch(console.error);

    const accessToken = signAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please verify your email.",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
