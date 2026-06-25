import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Review from 'src/models/Review';
import { verifyAdmin } from 'src/lib/auth';

// GET: Fetch all reviews for admin moderation (Protected: Admin Only)
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

    const reviews = await Review.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error('All reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
