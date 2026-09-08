import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { success: false, error: 'Code and subtotal are required' },
        { status: 400 }
      );
    }

    const uppercaseCode = code.toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code: uppercaseCode } });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is inactive' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    if (now > expiry) {
      return NextResponse.json(
        { success: false, error: 'Coupon code has expired' },
        { status: 400 }
      );
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'Coupon usage limit reached' },
        { status: 400 }
      );
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { success: false, error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon code applied successfully',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
