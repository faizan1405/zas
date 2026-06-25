import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Category from 'src/models/Category';
import { verifyAdmin } from 'src/lib/auth';

// 1. GET: Fetch all active categories sorted by displayOrder
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Build query filters
    const query = {};
    const isAdminView = searchParams.get('adminView') === 'true';
    if (!isAdminView) {
      query.isActive = true;
    }

    const categories = await Category.find(query).sort({ displayOrder: 1 });

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Create a category (Protected: Admin Only)
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

    const { name, displayOrder, image, isActive } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Auto-create slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name/slug already exists' },
        { status: 400 }
      );
    }

    const newCategory = await Category.create({
      name,
      slug,
      image,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: newCategory
    });

  } catch (error) {
    console.error('Category create error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
