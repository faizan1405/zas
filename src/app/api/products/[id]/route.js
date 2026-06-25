import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from 'src/lib/mongodb';
import Product from 'src/models/Product';
import { verifyAdmin } from 'src/lib/auth';

// GET: Fetch product by ID or by Slug
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const product = await Product.findOne(query);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Product fetch details error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update product details (Protected: Admin Only)
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
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Auto-calculate discount if price/mrp changes
    if (body.price !== undefined || body.mrp !== undefined) {
      const product = await Product.findById(id);
      if (product) {
        const finalPrice = body.price !== undefined ? body.price : product.price;
        const finalMrp = body.mrp !== undefined ? body.mrp : product.mrp;
        body.discount = finalMrp > finalPrice ? Math.round(((finalMrp - finalPrice) / finalMrp) * 100) : 0;
      }
    }

    // Auto-update slug if name changes
    if (body.name) {
      const newSlug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existingSlug = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      body.slug = existingSlug ? `${newSlug}-${Date.now()}` : newSlug;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove product from database (Protected: Admin Only)
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
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deletedProduct
    });

  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
