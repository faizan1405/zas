import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { getAuthUser } from 'src/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID parameter is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    const { productId, rating, comment, userName, userEmail } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Required review details are missing' },
        { status: 400 }
      );
    }

    const reviewerName = user ? user.name : (userName || 'Anonymous');
    const reviewerEmail = user ? user.email : (userEmail || 'guest@zassports.com');

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const newReview = await prisma.review.create({
      data: {
        productId,
        userName: reviewerName,
        userEmail: reviewerEmail.toLowerCase(),
        rating: Number(rating),
        comment,
        isApproved: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted. It will show on the store once approved by admin.',
      review: newReview
    });

  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
