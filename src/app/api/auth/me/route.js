import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { getAuthUser } from 'src/lib/auth';

// 1. GET: Fetch authenticated user session profile
export async function GET(request) {
  try {
    const tokenUser = getAuthUser(request);
    
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.id }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isBlocked) {
      const response = NextResponse.json(
        { success: false, error: 'Account has been suspended' },
        { status: 403 }
      );
      response.cookies.set('token', '', {
        httpOnly: true,
        maxAge: 0,
        path: '/'
      });
      return response;
    }

    // Exclude password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Auth check API error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// 2. PUT: Update user profile addresses (Customer address CRUD sync)
export async function PUT(request) {
  try {
    const tokenUser = getAuthUser(request);

    if (!tokenUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { addresses } = await request.json();

    if (!addresses) {
      return NextResponse.json(
        { success: false, error: 'Addresses data required' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: tokenUser.id },
      data: { addresses }
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
