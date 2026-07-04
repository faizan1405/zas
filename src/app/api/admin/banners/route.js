import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Banner from 'src/models/Banner';
import { verifyAdmin } from 'src/lib/auth';

// GET: Fetch all homepage banners sorted by displayOrder
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const query = {};
    const isAdminView = searchParams.get('adminView') === 'true';
    if (isAdminView) {
      // Inactive banners are admin-only — require a verified admin token.
      if (!verifyAdmin(request)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Admin access required' },
          { status: 401 }
        );
      }
    } else {
      query.isActive = true;
    }

    const banners = await Banner.find(query).sort({ displayOrder: 1 });

    return NextResponse.json({
      success: true,
      banners
    });

  } catch (error) {
    console.error('Banners fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a banner (Protected: Admin Only)
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
    const { title, image, type } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, error: 'Banner title and image URL are required' },
        { status: 400 }
      );
    }

    const newBanner = await Banner.create({
      ...body,
      displayOrder: body.displayOrder || 0,
      isActive: body.isActive !== undefined ? body.isActive : true
    });

    return NextResponse.json({
      success: true,
      message: 'Banner created successfully',
      banner: newBanner
    });

  } catch (error) {
    console.error('Banner create error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
