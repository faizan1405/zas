import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from 'src/lib/mongodb';
import Category from 'src/models/Category';
import { verifyAdmin } from 'src/lib/auth';
import { getPublicCategories, CACHE_TAGS } from 'src/lib/storeData';

// 1. GET: Fetch categories sorted by displayOrder
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminView = searchParams.get('adminView') === 'true';

    // Admin view needs inactive categories too — gate it behind a verified admin
    // token so ?adminView=true can't leak inactive documents to the public.
    if (isAdminView) {
      if (!verifyAdmin(request)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Admin access required' },
          { status: 401 }
        );
      }
      await dbConnect();
      const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 }).lean();
      return NextResponse.json({
        success: true,
        categories: JSON.parse(JSON.stringify(categories)),
      });
    }

    // Public: cached active categories, invalidated on admin category mutations.
    const categories = await getPublicCategories();
    return NextResponse.json({
      success: true,
      categories,
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
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

    revalidateTag(CACHE_TAGS.categories, { expire: 0 });

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
