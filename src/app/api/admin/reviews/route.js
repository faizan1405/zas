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

    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true, slug: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error('All reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
