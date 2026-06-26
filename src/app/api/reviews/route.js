import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Review from 'src/models/Review';
import Product from 'src/models/Product';
import { getAuthUser } from 'src/lib/auth';

// 1. GET: Fetch approved reviews for a specific product
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID parameter is required' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ product: productId, isApproved: true }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Write a product review (Moderate state initially)
export async function POST(request) {
  try {
    await dbConnect();
    const user = getAuthUser(request); // optional, can review as guest
    const { productId, rating, comment, userName, userEmail } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Required review details are missing' },
        { status: 400 }
      );
    }

    const reviewerName = user ? user.name : (userName || 'Anonymous');
    const reviewerEmail = user ? user.email : (userEmail || 'guest@zassports.com');

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const newReview = await Review.create({
      product: productId,
      userName: reviewerName,
      userEmail: reviewerEmail.toLowerCase(),
      rating: Number(rating),
      comment,
      isApproved: false // awaits admin moderation
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted. It will show on the store once approved by admin.',
      review: newReview
    });

  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
