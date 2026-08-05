import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "fitboard-auth-secret-keys-neon-postgress-3453";

export interface MagicLinkPayload {
  email: string;
  name?: string;
  role?: "CANDIDATE" | "EMPLOYER";
  exp: number; // Expiry timestamp (ms)
}

/**
 * Creates a cryptographically signed Magic Link token valid for 15 minutes.
 */
export function createMagicToken(email: string, name?: string, role: "CANDIDATE" | "EMPLOYER" = "CANDIDATE"): string {
  const payload: MagicLinkPayload = {
    email: email.trim().toLowerCase(),
    name: name?.trim(),
    role,
    exp: Date.now() + 15 * 60 * 1000, // 15 minutes validity
  };

  const jsonStr = JSON.stringify(payload);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(base64Data)
    .digest("base64url");

  return `${base64Data}.${signature}`;
}

/**
 * Verifies and decodes a Magic Link token.
 * Returns payload if valid, null if expired or tampered with.
 */
export function verifyMagicToken(token: string): MagicLinkPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Data, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(base64Data)
      .digest("base64url");

    if (signature !== expectedSig) {
      console.warn("[MagicToken] Token signature verification failed.");
      return null;
    }

    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
    const payload: MagicLinkPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.exp) {
      console.warn("[MagicToken] Token has expired.");
      return null;
    }

    return payload;
  } catch (err) {
    console.error("[MagicToken] Error verifying token:", err);
    return null;
  }
}
