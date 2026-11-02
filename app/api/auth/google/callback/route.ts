import { NextResponse, type NextRequest } from "next/server";
import {
  encodeSession,
  getGoogleConfig,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
} from "../../../../lib/auth";

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
};

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const rawCookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  let savedState = "";
  let verifier = "";
  let returnTo = "/";
  if (rawCookie) {
    try {
      const parsed = JSON.parse(rawCookie) as {
        state?: string;
        verifier?: string;
        returnTo?: string;
      };
      savedState = parsed.state || "";
      verifier = parsed.verifier || "";
      if (parsed.returnTo && parsed.returnTo.startsWith("/")) {
        returnTo = parsed.returnTo;
      }
    } catch {
      // ignore malformed cookie
    }
  }

  const clearStateCookie = (res: NextResponse) => {
    res.cookies.delete(OAUTH_STATE_COOKIE);
    return res;
  };

  if (!code || !state || !savedState || state !== savedState || !verifier) {
    const failUrl = new URL(returnTo, origin);
    failUrl.searchParams.set("auth", "error");
    return clearStateCookie(NextResponse.redirect(failUrl));
  }

  const config = getGoogleConfig(origin);
  if (!config.configured) {
    const failUrl = new URL(returnTo, origin);
    failUrl.searchParams.set("auth", "unconfigured");
    return clearStateCookie(NextResponse.redirect(failUrl));
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        code_verifier: verifier,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenData.access_token) {
      const failUrl = new URL(returnTo, origin);
      failUrl.searchParams.set("auth", "error");
      return clearStateCookie(NextResponse.redirect(failUrl));
    }

    const userRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );
    const userInfo = (await userRes.json()) as GoogleUserInfo;
    if (!userRes.ok || !userInfo.sub || !userInfo.email) {
      const failUrl = new URL(returnTo, origin);
      failUrl.searchParams.set("auth", "error");
      return clearStateCookie(NextResponse.redirect(failUrl));
    }

    const sessionToken = encodeSession({
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split("@")[0] || "User",
      picture: userInfo.picture,
    });

    const successUrl = new URL(returnTo, origin);
    const response = NextResponse.redirect(successUrl);
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https://"),
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    return clearStateCookie(response);
  } catch {
    const failUrl = new URL(returnTo, origin);
    failUrl.searchParams.set("auth", "error");
    return clearStateCookie(NextResponse.redirect(failUrl));
  }
}
