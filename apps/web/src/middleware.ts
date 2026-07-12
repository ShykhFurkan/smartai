import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh session cookies and retrieve authenticated user
  const { supabaseResponse, user } = await updateSession(request);

  // Extract user role from Supabase user metadata
  const role = user?.user_metadata?.role;

  // Protect Admin dashboard routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "platform-admin") {
      return NextResponse.redirect(new URL("/", request.url)); // Access Denied redirect
    }
  }

  // Protect Recruiter & Company routes
  if (pathname.startsWith("/recruiter") || pathname.startsWith("/company")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "recruiter" && role !== "company-admin" && role !== "platform-admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect Candidate dashboard / profile routes
  if (pathname.startsWith("/candidate")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "candidate" && role !== "platform-admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

// Config to specify matching route paths
export const config = {
  matcher: [
    "/admin/:path*",
    "/recruiter/:path*",
    "/company/:path*",
    "/candidate/:path*",
  ],
};
