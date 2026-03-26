export function resolveSafeReturnUrl(
  returnUrl: unknown,
  allowedOrigins: readonly string[],
  fallbackPath = "/tokens",
): string {
  if (typeof returnUrl === "string") {
    try {
      const parsed = new URL(returnUrl);
      if (allowedOrigins.includes(parsed.origin)) {
        return parsed.toString();
      }
    } catch {
      // Invalid URL inputs fall through to safe default.
    }
  }

  return `${allowedOrigins[0]}${fallbackPath}`;
}
