import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAdmin } from 'src/lib/auth';
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
    const existingBanner = await prisma.banner.findUnique({ where: { id } });

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    const safeData = {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.link !== undefined && { link: body.link }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    };

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: safeData
    }).catch(() => null);

    if (!updatedBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    if (body.image !== undefined && body.image !== existingBanner.image) {
      await deleteImage(existingBanner.image);
    }

    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully',
      banner: updatedBanner
    });

  } catch (error) {
    console.error('Banner update error:', error);
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

    const bannerToDelete = await prisma.banner.findUnique({ where: { id } });
    if (!bannerToDelete) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    const deletedBanner = await prisma.banner.delete({
      where: { id }
    }).catch(() => null);

    if (deletedBanner && bannerToDelete.image) {
      await deleteImage(bannerToDelete.image);
    } else if (!deletedBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
      deletedBanner
    });

  } catch (error) {
    console.error('Banner delete error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
