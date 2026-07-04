import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { GOOGLE_AUTH_URL, getRedirectUri } from 'src/lib/googleAuth';

// GET /api/auth/google
// Kicks off the Google OAuth flow: generates a CSRF state token, stashes it in
// a short-lived HTTP-only cookie, and redirects the user to Google's consent
// screen. Google returns to /api/auth/google/callback.
export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL('/login?error=oauth_config', request.url));
  }

  const state = randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(request),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    include_granted_scopes: 'true',
    prompt: 'select_account',
    state
  });

  const response = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);

  // CSRF guard — verified in the callback. Short lived, HTTP-only.
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
    sameSite: 'lax'
  });

  return response;
}
