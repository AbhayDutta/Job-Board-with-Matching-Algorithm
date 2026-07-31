import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

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

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
