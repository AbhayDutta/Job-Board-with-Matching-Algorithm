import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Protect dashboard routes
  if (path.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role;

    // Direct CANDIDATE users away from EMPLOYER dashboard routes
    if (path.startsWith("/dashboard/employer") && role !== "EMPLOYER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Direct EMPLOYER users away from CANDIDATE dashboard routes
    if (path.startsWith("/dashboard/candidate") && role !== "CANDIDATE") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
