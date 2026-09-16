import { NextResponse, type NextRequest } from "next/server";
import { getCanonicalPathname } from "@/shared/lib/url";

export function proxy(request: NextRequest) {
  const canonicalPathname = getCanonicalPathname(request.nextUrl.pathname);

  if (canonicalPathname === request.nextUrl.pathname) {
    return NextResponse.next();
  }

  const canonicalUrl = request.nextUrl.clone();
  canonicalUrl.pathname = canonicalPathname;

  return NextResponse.redirect(canonicalUrl, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};
