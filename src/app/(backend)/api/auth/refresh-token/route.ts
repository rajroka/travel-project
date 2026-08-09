import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/auth";

/**
 * POST /api/auth/refresh-token
 * Exchange a valid refresh token (from httpOnly cookie) for a new access token.
 * Used by API clients (mobile, Postman) that authenticated via POST /api/auth/login.
 * Browser users should use Better Auth's session cookie instead.
 */
export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token not found. Please log in again." },
        { status: 401 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);

    const newAccessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Access token refreshed",
        data: { accessToken: newAccessToken },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid or expired refresh token. Please log in again." },
      { status: 401 }
    );
  }
}
