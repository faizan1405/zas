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

    const pages = await prisma.page.findMany({
      orderBy: { title: 'asc' }
    });

    return NextResponse.json({
      success: true,
      pages
    });

  } catch (error) {
    console.error('All pages fetch error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id, title, content } = await request.json();

    if (!id || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Page ID, title and content body are required' },
        { status: 400 }
      );
    }

    const page = await prisma.page.update({
      where: { id },
      data: { title, content }
    }).catch(() => null);

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Page content updated successfully',
      page
    });

  } catch (error) {
    console.error('Page update error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
