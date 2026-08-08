import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  const token = request.cookies.get("tf_session")?.value;
  const session = await decrypt(token);

  if (isAdminRoute && !isLoginPage && !session?.userId) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
  }
  if (isLoginPage && session?.userId) {
    return NextResponse.redirect(new URL("/admin", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
