"use server";

import { createMagicToken } from "@/lib/magic-token";
import { sendMagicLinkEmail } from "@/lib/email";

export async function sendMagicLinkAction({
  email,
  name,
  role = "CANDIDATE",
}: {
  email: string;
  name?: string;
  role?: "CANDIDATE" | "EMPLOYER";
}) {
  try {
    const rawEmail = email?.trim().toLowerCase();
    if (!rawEmail || !rawEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const token = createMagicToken(rawEmail, name, role);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const magicLinkUrl = `${baseUrl}/api/auth/magic-link?token=${token}`;

    const res = await sendMagicLinkEmail({
      to: rawEmail,
      magicLinkUrl,
      userName: name,
    });

    if (!res.success) {
      console.warn("[MagicLink Action] Email send issue:", res.error);
    }

    return {
      success: true,
      magicLinkUrl,
      simulated: res.simulated || !process.env.RESEND_API_KEY,
      message: res.success
        ? "Magic link sent to your email! Check your inbox."
        : `Magic link created! (Resend Notice: ${res.error})`,
    };
  } catch (err: any) {
    console.error("[MagicLink Action Exception]:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred sending the magic link.",
    };
  }
}
