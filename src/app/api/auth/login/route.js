import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import User from 'src/models/User';
import { comparePassword, signToken } from 'src/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check block status
    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended' },
        { status: 403 }
      );
    }

    // Credential login is reserved for administrators. Customers sign in with
    // Google only (see /api/auth/google). Reject non-admin accounts here so the
    // password path cannot be used as a customer login.
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Please sign in with Google.' },
        { status: 403 }
      );
    }

    // Google-provisioned accounts have no password to compare against.
    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT
    const token = signToken({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        wishlist: user.wishlist
      }
    });

    // Set HTTP-only Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
