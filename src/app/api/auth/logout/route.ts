import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { validateCsrfOrigin } from "@/lib/security";

export async function POST(request: Request) {
  const csrfCheck = validateCsrfOrigin(request);
  if (!csrfCheck.valid) {
    return NextResponse.json(
      { ok: false, error: csrfCheck.error },
      { status: csrfCheck.status || 403 }
    );
  }

  const response = NextResponse.json(
    { ok: true, message: "Logged out successfully" },
    { status: 200 }
  );

  // Clear cookie with maxAge 0
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}
