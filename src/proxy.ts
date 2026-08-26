import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (forwardedHost ?? request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const isProductionHost = host === "leaningoakranch.com" || host === "www.leaningoakranch.com";

  if (isProductionHost && (host !== "www.leaningoakranch.com" || protocol !== "https")) {
    const destination = request.nextUrl.clone();
    destination.protocol = "https";
    destination.hostname = "www.leaningoakranch.com";
    destination.port = "";
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
