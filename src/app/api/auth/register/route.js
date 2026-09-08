import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { hashPassword, signToken } from 'src/lib/auth';
import { checkRateLimit } from 'src/lib/rateLimit';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    if (!checkRateLimit(ip, 5, 60000)) {
      return NextResponse.json({ success: false, error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'customer'
      }
    });

    // Create JWT
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
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
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
