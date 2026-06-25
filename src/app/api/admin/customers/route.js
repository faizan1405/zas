import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import User from 'src/models/User';
import { verifyAdmin } from 'src/lib/auth';

// GET: List all customers (Protected: Admin Only)
export async function GET(request) {
  try {
    await dbConnect();
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      customers
    });

  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Block/Unblock customer account (Protected: Admin Only)
export async function PUT(request) {
  try {
    await dbConnect();
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id, isBlocked } = await request.json();

    if (!id || isBlocked === undefined) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and block status are required' },
        { status: 400 }
      );
    }

    const customer = await User.findOneAndUpdate(
      { _id: id, role: 'customer' },
      { $set: { isBlocked } },
      { new: true }
    ).select('-password');

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Customer account ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      customer
    });

  } catch (error) {
    console.error('Customer block error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
