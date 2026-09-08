import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from 'src/lib/prisma';
import { verifyAdmin } from 'src/lib/auth';
import { CACHE_TAGS } from 'src/lib/storeData';
import { deleteImage } from 'src/lib/storage';

export async function PUT(request, { params }) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const existingCategory = await prisma.category.findUnique({ where: { id } });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const safeData = {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    };

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: safeData
    }).catch(() => null);

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (body.image !== undefined && body.image !== existingCategory.image) {
      await deleteImage(existingCategory.image);
    }

    revalidateTag(CACHE_TAGS.categories);

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const categoryToDelete = await prisma.category.findUnique({ where: { id } });
    if (!categoryToDelete) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const deletedCategory = await prisma.category.delete({
      where: { id }
    }).catch(() => null);

    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (categoryToDelete.image) {
      await deleteImage(categoryToDelete.image);
    }

    revalidateTag(CACHE_TAGS.categories);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
      deletedCategory
    });

  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
