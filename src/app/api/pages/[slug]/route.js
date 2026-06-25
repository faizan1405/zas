import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Page from 'src/models/Page';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;

    const page = await Page.findOne({ slug });
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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
