import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import User from 'src/models/User';
import { signToken } from 'src/lib/auth';
import { GOOGLE_TOKEN_URL, GOOGLE_USERINFO_URL, getRedirectUri } from 'src/lib/googleAuth';

// GET /api/auth/google/callback
// Google redirects here with ?code & ?state. We verify state (CSRF), exchange
// the code for an access token, load the Google profile, then find-or-create
// the customer, issue our own JWT session cookie, and send them to /account.
export async function GET(request) {
  const loginUrl = (err) => new URL(`/login${err ? `?error=${err}` : ''}`, request.url);

  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const oauthError = searchParams.get('error');

    // User declined consent (or Google returned an error).
    if (oauthError) {
      return NextResponse.redirect(loginUrl('access_denied'));
    }

    // CSRF: state must match the cookie we set in /api/auth/google.
    const savedState = request.cookies.get('oauth_state')?.value;
    if (!code || !state || !savedState || state !== savedState) {
      return NextResponse.redirect(loginUrl('oauth_state'));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(loginUrl('oauth_config'));
    }

    // 1. Exchange authorization code for an access token.
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(request),
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(loginUrl('oauth_token'));
    }

    const { access_token } = await tokenRes.json();
    if (!access_token) {
      return NextResponse.redirect(loginUrl('oauth_token'));
    }

    // 2. Fetch the Google profile.
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!profileRes.ok) {
      console.error('Google userinfo fetch failed:', await profileRes.text());
      return NextResponse.redirect(loginUrl('oauth_profile'));
    }

    const profile = await profileRes.json();
    const { id: googleId, email, name, picture, verified_email } = profile;

    if (!email) {
      return NextResponse.redirect(loginUrl('oauth_profile'));
    }
    // Only trust verified Google emails — prevents hijacking an account that
    // shares the same email address.
    if (verified_email === false) {
      return NextResponse.redirect(loginUrl('email_unverified'));
    }

    await dbConnect();

    const normalizedEmail = email.toLowerCase();

    // 3. Find-or-create. Existing accounts (including old credential customers)
    // are linked by email so their orders/addresses/wishlist are preserved.
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.isBlocked) {
        return NextResponse.redirect(loginUrl('blocked'));
      }
      // Backfill Google fields on first Google sign-in for an existing account.
      let dirty = false;
      if (!user.googleId) { user.googleId = googleId; dirty = true; }
      if (!user.avatar && picture) { user.avatar = picture; dirty = true; }
      if (user.provider !== 'google' && !user.password) { user.provider = 'google'; dirty = true; }
      if (dirty) await user.save();
    } else {
      user = await User.create({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        provider: 'google',
        googleId,
        avatar: picture,
        role: 'customer',
        addresses: [],
        wishlist: []
      });
    }

    // 4. Issue our session JWT (same shape/cookie as credential login).
    const token = signToken({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.redirect(new URL('/account', request.url));

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax'
    });

    // Clear the one-time CSRF state cookie.
    response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' });

    return response;

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(loginUrl('oauth_failed'));
  }
}
