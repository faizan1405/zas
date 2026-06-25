import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import User from 'src/models/User';
import { getAuthUser } from 'src/lib/auth';

// 1. GET: Fetch authenticated user session profile
export async function GET(request) {
  try {
    await dbConnect();
    const tokenUser = getAuthUser(request);
    
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await User.findById(tokenUser._id).select('-password');
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

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Auth check API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 2. PUT: Update user profile addresses (Customer address CRUD sync)
export async function PUT(request) {
  try {
    await dbConnect();
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

    const updatedUser = await User.findByIdAndUpdate(
      tokenUser._id,
      { $set: { addresses } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
