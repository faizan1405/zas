import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Coupon from 'src/models/Coupon';
import { verifyAdmin } from 'src/lib/auth';

// 1. GET: Fetch all coupons (Protected: Admin Only)
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

    const coupons = await Coupon.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Create a coupon code (Protected: Admin Only)
export async function POST(request) {
  try {
    await dbConnect();
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, discountType, discountValue, expiryDate } = body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const uppercaseCode = code.toUpperCase();

    // Check code duplicate
    const existingCoupon = await Coupon.findOne({ code: uppercaseCode });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    const newCoupon = await Coupon.create({
      ...body,
      code: uppercaseCode
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      coupon: newCoupon
    });

  } catch (error) {
    console.error('Coupon create error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
