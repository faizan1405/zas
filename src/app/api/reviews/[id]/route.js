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

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const { isApproved, reply } = body;

    const safeData = {};
    if (isApproved !== undefined) safeData.isApproved = isApproved;
    if (reply !== undefined) safeData.reply = reply;

    const updatedReview = await prisma.review.update({
      where: { id },
      data: safeData
    });

    // Recalculate average rating of approved reviews for this product
    const approvedReviews = await prisma.review.findMany({
      where: { productId: review.productId, isApproved: true }
    });
    
    const count = approvedReviews.length;
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;

    await prisma.product.update({
      where: { id: review.productId },
      data: { ratingsAverage: average, ratingsCount: count }
    });

    return NextResponse.json({
      success: true,
      message: 'Review moderation updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Review update error:', error);
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

    const deletedReview = await prisma.review.delete({
      where: { id }
    }).catch(() => null);

    if (!deletedReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const approvedReviews = await prisma.review.findMany({
      where: { productId: deletedReview.productId, isApproved: true }
    });
    
    const count = approvedReviews.length;
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;

    await prisma.product.update({
      where: { id: deletedReview.productId },
      data: { ratingsAverage: average, ratingsCount: count }
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
      deletedReview
    });

  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
