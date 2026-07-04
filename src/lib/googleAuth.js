// Google OAuth 2.0 helpers (manual flow — no external auth library).
// Credentials come from GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env.
// The redirect URI must exactly match the one authorized in the Google
// Cloud console: {SITE_URL}/api/auth/google/callback

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Base site URL. Prefer the configured public URL; fall back to the request
// origin so local dev / preview deployments still work.
export function getSiteUrl(request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  return request.nextUrl.origin;
}

export function getRedirectUri(request) {
  return `${getSiteUrl(request)}/api/auth/google/callback`;
}
