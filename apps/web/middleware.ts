import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

type ExtendedUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  tenantId: string | null;
  tenantSlug: string | null;
  tenantPlan: string | null;
  role: string;
};

export default auth((req: NextRequest & { auth: Session | null }) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/") && req.method === "OPTIONS") {
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return new NextResponse(null, { status: 204, headers });
  }

  const session = req.auth;

  const isAuthPage = pathname.startsWith("/auth/");
  const isVerifyEmailPage = pathname.startsWith("/auth/verify-email");
  const isOrgSetupPage = pathname.startsWith("/organization/setup");
  const isRootPage = pathname === "/";

  if (session) {
    const hasTenant = Boolean((session.user as ExtendedUser)?.tenantId);

    if (isAuthPage && !isVerifyEmailPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!hasTenant && !isOrgSetupPage && !isVerifyEmailPage) {
      return NextResponse.redirect(new URL("/organization/setup", req.url));
    }
  }

  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return response;
  }

  return NextResponse.next();
});

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api/|_next/|.*\\.).*)"],
};

export const runtime = "nodejs";
