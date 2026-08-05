import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/magic-token";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=MissingMagicToken", req.url));
  }

  const payload = verifyMagicToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login?error=ExpiredOrInvalidMagicToken", req.url));
  }

  // Redirect to /login with magicToken query param so client automatically executes NextAuth sign in
  const redirectUrl = new URL("/login", req.url);
  redirectUrl.searchParams.set("magicToken", token);

  return NextResponse.redirect(redirectUrl);
}
