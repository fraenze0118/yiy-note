import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "yiy-note-dev-secret-change-in-production"
);

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("yiy-note-token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const authed = await isAuthenticated(request);

  // Redirect unauthenticated users from protected pages to login
  if (!authed && request.nextUrl.pathname === "/notes/new") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login page while already authenticated, redirect to home
  if (authed && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/new", "/login"],
};
