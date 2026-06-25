import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from 'src/lib/mongodb';
import Review from 'src/models/Review';
import Product from 'src/models/Product';
import { verifyAdmin } from 'src/lib/auth';

// PUT: Approve / Reply to a review (Protected: Admin Only)
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const { isApproved, reply } = body;

    if (isApproved !== undefined) {
      review.isApproved = isApproved;
    }
    if (reply !== undefined) {
      review.reply = reply;
    }

    await review.save();

    // Recalculate average rating of approved reviews for this product
    const approvedReviews = await Review.find({ product: review.product, isApproved: true });
    const count = approvedReviews.length;
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;

    await Product.findByIdAndUpdate(review.product, {
      'ratings.average': average,
      'ratings.count': count
    });

    return NextResponse.json({
      success: true,
      message: 'Review moderation updated successfully',
      review
    });

  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove review (Protected: Admin Only)
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Recalculate product ratings after delete
    const approvedReviews = await Review.find({ product: deletedReview.product, isApproved: true });
    const count = approvedReviews.length;
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;

    await Product.findByIdAndUpdate(deletedReview.product, {
      'ratings.average': average,
      'ratings.count': count
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
      deletedReview
    });

  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
