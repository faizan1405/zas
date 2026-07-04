// Google OAuth 2.0 helpers (manual flow — no external auth library).
// Credentials come from GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env.
// The redirect URI must exactly match the one authorized in the Google
// Cloud console: {SITE_URL}/api/auth/google/callback

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// The Google OAuth redirect URI must match, byte-for-byte, the one registered
// in the Google Cloud console. In production we therefore never derive it from
// the incoming request (that yields *.vercel.app preview hosts or an unexpected
// www/non-www variant) and we reject a localhost NEXT_PUBLIC_SITE_URL that was
// accidentally carried over from .env.
const CANONICAL_PROD_URL = 'https://zassports.com';

// Strip trailing slashes and normalize the zassports.com apex (www → non-www)
// so we can't emit duplicate slashes or a www variant that Google won't match.
function normalizeSiteUrl(url) {
  let normalized = url.trim().replace(/\/+$/, '');
  normalized = normalized.replace(/^(https?:\/\/)www\.zassports\.com/i, '$1zassports.com');
  return normalized;
}

// Base site URL. Prefer the configured public URL; fall back to the request
// origin so local dev / preview deployments still work.
export function getSiteUrl(request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (process.env.NODE_ENV === 'production') {
    if (configured) {
      const normalized = normalizeSiteUrl(configured);
      // Ignore anything that can't be the real public site (localhost, LAN,
      // Vercel preview hosts) and fall back to the canonical domain.
      if (!/localhost|127\.0\.0\.1|\.vercel\.app/i.test(normalized)) {
        return normalized;
      }
    }
    return CANONICAL_PROD_URL;
  }

  if (configured) return normalizeSiteUrl(configured);
  return request.nextUrl.origin;
}

export function getRedirectUri(request) {
  return `${getSiteUrl(request)}/api/auth/google/callback`;
}
