import { NextResponse, type NextRequest } from "next/server";
import { getGoogleConfig, getSessionUser } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  const config = getGoogleConfig(request.nextUrl.origin);
  return NextResponse.json({
    user,
    configured: config.configured,
  });
}
