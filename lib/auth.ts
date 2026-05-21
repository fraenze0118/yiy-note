import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "yiy-note-dev-secret-change-in-production"
);
const COOKIE_NAME = "yiy-note-token";
const EXPIRES_IN = "7d";

const AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? "admin123";

export async function signToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { username: string };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Cached version for server components — avoids multiple cookie reads */
export const getCachedSession = cache(getSession);

export function validatePassword(password: string): boolean {
  return password === AUTH_PASSWORD;
}

export { COOKIE_NAME, EXPIRES_IN };
