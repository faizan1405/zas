import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      page
    });

  } catch (error) {
    console.error('Page fetch API error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
