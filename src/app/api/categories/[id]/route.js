import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { revalidateTag } from 'next/cache';
import dbConnect from 'src/lib/mongodb';
import Category from 'src/models/Category';
import { verifyAdmin } from 'src/lib/auth';
import { CACHE_TAGS } from 'src/lib/storeData';

// PUT: Update category details (Protected: Admin Only)
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Auto-update slug if name changes
    if (body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    revalidateTag(CACHE_TAGS.categories, { expire: 0 });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove category (Protected: Admin Only)
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    revalidateTag(CACHE_TAGS.categories, { expire: 0 });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
      deletedCategory
    });

  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
