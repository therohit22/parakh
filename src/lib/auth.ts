import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: string;
  role: "student" | "admin";
}

export const AUTH_COOKIE_NAME = "parakh_token";

/**
 * Strict cookie flags to safeguard sessions:
 * - httpOnly: prevents client-side JavaScript access (mitigates XSS token theft)
 * - sameSite: "lax": provides CSRF defense for top-level navigations
 * - secure: requires HTTPS in production environments
 */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  path: "/",
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "Please define the JWT_SECRET environment variable inside .env.local"
    );
  }
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(
      "Security Error: JWT_SECRET must be at least 32 characters in production."
    );
  }
  return secret;
}

export function signToken(payload: AuthTokenPayload): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload & AuthTokenPayload;
    if (decoded && typeof decoded === "object" && decoded.userId && decoded.role) {
      return {
        userId: decoded.userId,
        role: decoded.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.substring(AUTH_COOKIE_NAME.length + 1));
}

export function requireAuth(request: Request):
  | { authorized: true; user: AuthTokenPayload }
  | { authorized: false; status: 401; error: string } {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  return { authorized: true, user: payload };
}

export function requireAdmin(request: Request):
  | { authorized: true; user: AuthTokenPayload }
  | { authorized: false; status: 401 | 403; error: string } {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  if (payload.role !== "admin") {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden: Admin access required",
    };
  }

  return { authorized: true, user: payload };
}

