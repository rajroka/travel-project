import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import crypto from "crypto";

/**
 * GET /api/imagekit/auth
 * Generates a one-time token/signature/expire for client-side ImageKit uploads.
 * The v7 SDK removed getAuthenticationParameters() — we generate it manually
 * using HMAC-SHA1 of expire with the private key, which is the same algorithm
 * ImageKit uses.
 */
export async function GET(req: NextRequest) {
  try {
    await requireSession(req);

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY as string;
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400; // valid for 40 min
    const toSign = token + expire;
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(toSign)
      .digest("hex");

    return NextResponse.json(
      {
        success: true,
        data: { token, expire, signature },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status)
      return NextResponse.json(
        { success: false, message: e.message },
        { status: e.status }
      );
    return NextResponse.json({ success: false, message: "Auth failed" }, { status: 500 });
  }
}
