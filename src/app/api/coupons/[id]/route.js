import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAdmin } from 'src/lib/auth';

export async function PUT(request, { params }) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (body.code) {
      body.code = body.code.toUpperCase();
    }

    if (body.expiryDate) {
      body.expiryDate = new Date(body.expiryDate);
    }

    const safeData = {
      ...(body.code !== undefined && { code: body.code }),
      ...(body.discountType !== undefined && { discountType: body.discountType }),
      ...(body.discountValue !== undefined && { discountValue: body.discountValue }),
      ...(body.minOrderValue !== undefined && { minOrderValue: body.minOrderValue }),
      ...(body.expiryDate !== undefined && { expiryDate: body.expiryDate }),
      ...(body.usageLimit !== undefined && { usageLimit: body.usageLimit }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    };

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: safeData
    }).catch(() => null);

    if (!updatedCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon: updatedCoupon
    });

  } catch (error) {
    console.error('Coupon update error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const deletedCoupon = await prisma.coupon.delete({
      where: { id }
    }).catch(() => null);

    if (!deletedCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
      deletedCoupon
    });

  } catch (error) {
    console.error('Coupon delete error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
