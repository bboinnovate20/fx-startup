import { NextResponse, type NextRequest } from "next/server";
import {
  createPkcePair,
  getGoogleConfig,
  OAUTH_STATE_COOKIE,
} from "../../../lib/auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/";
  const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/";
  const config = getGoogleConfig(origin);

  if (!config.configured) {
    const url = new URL(safeReturnTo, origin);
    url.searchParams.set("auth", "unconfigured");
    return NextResponse.redirect(url);
  }

  const { state, verifier, challenge } = createPkcePair();
  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(
    OAUTH_STATE_COOKIE,
    JSON.stringify({ state, verifier, returnTo: safeReturnTo }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https://"),
      path: "/",
      maxAge: 600,
    },
  );
  return response;
}
