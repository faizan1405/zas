import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAdmin } from 'src/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = {};
    const isAdminView = searchParams.get('adminView') === 'true';
    if (isAdminView) {
      if (!verifyAdmin(request)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Admin access required' },
          { status: 401 }
        );
      }
    } else {
      query.isActive = true;
    }

    const banners = await prisma.banner.findMany({
      where: query,
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({
      success: true,
      banners
    });

  } catch (error) {
    console.error('Banners fetch error:', error);
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
    const { title, subtitle, image, link, type, displayOrder, isActive } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, error: 'Banner title and image URL are required' },
        { status: 400 }
      );
    }

    const newBanner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || '/shop',
        type: type || 'hero',
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Banner created successfully',
      banner: newBanner
    });

  } catch (error) {
    console.error('Banner create error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
