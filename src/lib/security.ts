/**
 * Parakh Security Utilities (Day 12)
 *
 * Implements lightweight, zero-dependency origin/referer validation for cookie-authenticated state mutations.
 * In production, compares the request's Origin/Referer against the Host header to block cross-site request forgery.
 * In development, allows localhost and 127.0.0.1 for seamless developer experience.
 */

export interface CsrfCheckResult {
  valid: boolean;
  status?: 403;
  error?: string;
}

export function validateCsrfOrigin(request: Request): CsrfCheckResult {
  const method = request.method.toUpperCase();
  // Safe HTTP read methods are exempt from CSRF validation
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { valid: true };
  }

  const hostHeader = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  // In non-browser contexts (e.g., CLI tools, unit tests) where neither Origin nor Referer is sent
  if (!originHeader && !refererHeader) {
    return { valid: true };
  }

  const allowedHosts: string[] = [];
  if (hostHeader) allowedHosts.push(hostHeader.toLowerCase());
  if (forwardedHost) allowedHosts.push(forwardedHost.toLowerCase());
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      allowedHosts.push(new URL(process.env.NEXT_PUBLIC_APP_URL).host.toLowerCase());
    } catch {
      // Ignore invalid URL
    }
  }

  if (originHeader) {
    try {
      const originUrl = new URL(originHeader);
      const originHost = originUrl.host.toLowerCase();

      if (allowedHosts.includes(originHost)) {
        return { valid: true };
      }

      // Allow localhost in local development
      if (
        process.env.NODE_ENV !== "production" &&
        (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1")
      ) {
        return { valid: true };
      }
    } catch {
      return { valid: false, status: 403, error: "Invalid Origin header format" };
    }
  } else if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      const refererHost = refererUrl.host.toLowerCase();

      if (allowedHosts.includes(refererHost)) {
        return { valid: true };
      }

      // Allow localhost in local development
      if (
        process.env.NODE_ENV !== "production" &&
        (refererUrl.hostname === "localhost" || refererUrl.hostname === "127.0.0.1")
      ) {
        return { valid: true };
      }
    } catch {
      return { valid: false, status: 403, error: "Invalid Referer header format" };
    }
  }

  return {
    valid: false,
    status: 403,
    error: "Cross-site mutation request blocked by origin verification",
  };
}
