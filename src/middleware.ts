import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAuthPage = nextUrl.pathname.startsWith("/auth/login") || 
                     nextUrl.pathname.startsWith("/auth/register") ||
                     nextUrl.pathname.startsWith("/db-test");

  if (isAuthPage) {
    if (isLoggedIn && nextUrl.pathname.startsWith("/auth/login")) {
      const role = (req.auth?.user as any)?.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
      if (role === "TEACHER") return NextResponse.redirect(new URL("/teacher/dashboard", nextUrl));
      if (role === "STUDENT") return NextResponse.redirect(new URL("/student/dashboard", nextUrl));
    }
    return null;
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  const role = (req.auth?.user as any)?.role;
  if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }
  if (nextUrl.pathname.startsWith("/teacher") && role !== "TEACHER") {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }
  if (nextUrl.pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
