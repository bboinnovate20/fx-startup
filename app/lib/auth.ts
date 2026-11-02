import crypto from "node:crypto";
import { cookies } from "next/headers";

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export const SESSION_COOKIE = "fx_session";
export const OAUTH_STATE_COOKIE = "fx_oauth_state";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const DEFAULT_GOOGLE_CLIENT_ID =
  "151269083825-feai7q30iofbomhlq71fs3hluj28asu7.apps.googleusercontent.com";

function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    "fx-swift-session-signing-key-v1"
  );
}

export function getGoogleConfig(origin: string) {
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    DEFAULT_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;
  return {
    clientId: clientId.trim(),
    clientSecret: clientSecret.trim(),
    redirectUri: redirectUri.trim(),
    configured: Boolean(clientId.trim()),
  };
}

function signPayload(payloadB64: string): string {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function encodeSession(user: AuthUser): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ ...user, exp }), "utf8").toString(
    "base64url",
  );
  const sig = signPayload(payload);
  return `${payload}.${sig}`;
}

export function decodeSession(token: string | undefined): AuthUser | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".", 2);
  if (!payload || !sig) return null;
  const expected = signPayload(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AuthUser & { exp?: number };
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (!parsed.sub || !parsed.email) return null;
    return {
      sub: parsed.sub,
      email: parsed.email,
      name: parsed.name || parsed.email,
      picture: parsed.picture,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}

export function createPkcePair() {
  const state = crypto.randomBytes(24).toString("base64url");
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { state, verifier, challenge };
}

export const SESSION_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
