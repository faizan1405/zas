import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Page from 'src/models/Page';
import { verifyAdmin } from 'src/lib/auth';

// GET: Fetch all editable corporate page documents (Protected: Admin Only)
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

    const pages = await Page.find({}).sort({ title: 1 });

    return NextResponse.json({
      success: true,
      pages
    });

  } catch (error) {
    console.error('All pages fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update page details/content (Protected: Admin Only)
export async function PUT(request) {
  try {
    await dbConnect();
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

    const page = await Page.findByIdAndUpdate(
      id,
      { $set: { title, content, updatedAt: Date.now() } },
      { new: true }
    );

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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
