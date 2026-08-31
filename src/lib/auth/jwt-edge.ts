/**
 * Edge-runtime-safe JWT verification.
 * Uses the Web Crypto API (available in both Edge and Node.js runtimes)
 * instead of the Node.js `crypto` module or `jsonwebtoken`.
 *
 * Only decodes and verifies the signature — does NOT require any Node.js APIs.
 */

function base64urlDecode(str: string): Uint8Array {
  // Pad and convert base64url to base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export interface EdgeJwtPayload {
  userId: string;
  email: string;
  role: "customer" | "staff" | "admin";
  exp?: number;
  iat?: number;
}

/**
 * Verify a JWT using Web Crypto (HMAC-SHA256).
 * Returns the decoded payload or null if invalid / expired.
 */
export async function verifyJwtEdge(
  token: string,
  secret: string
): Promise<EdgeJwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;

    // Import the key
    const keyData = new TextEncoder().encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(keyData),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify signature
    const sigBytes = base64urlDecode(sigB64);
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const valid = await crypto.subtle.verify("HMAC", key, toArrayBuffer(sigBytes), toArrayBuffer(data));
    if (!valid) return null;

    // Decode payload
    const payloadJson = new TextDecoder().decode(base64urlDecode(payloadB64));
    const payload = JSON.parse(payloadJson) as EdgeJwtPayload;

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
