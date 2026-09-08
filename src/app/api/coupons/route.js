import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAdmin } from 'src/lib/auth';

export async function GET(request) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, discountType, discountValue, expiryDate, minOrderValue, usageLimit, isActive } = body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const uppercaseCode = code.toUpperCase();

    const existingCoupon = await prisma.coupon.findUnique({ where: { code: uppercaseCode } });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: uppercaseCode,
        discountType,
        discountValue,
        expiryDate: new Date(expiryDate),
        minOrderValue: minOrderValue || 0,
        usageLimit: usageLimit || 100,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      coupon: newCoupon
    });

  } catch (error) {
    console.error('Coupon create error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
