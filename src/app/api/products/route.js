import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Product from 'src/models/Product';
import { verifyAdmin } from 'src/lib/auth';

// Always run at request time so newly added/updated products appear immediately.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 1. GET: Fetch products with comprehensive dynamic search filters and sorting
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Build Mongoose Query Filters
    const query = {};
    
    // Customer search vs Admin search (Admin can fetch disabled products as well)
    const isAdminView = searchParams.get('adminView') === 'true';
    if (!isAdminView) {
      query.isActive = true;
    }

    // Text Search Matcher (Name, brand, description)
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Direct Category Filter
    const category = searchParams.get('category');
    if (category) {
      query.category = category;
    }

    // Brand exact (case-insensitive) Matcher
    const brand = searchParams.get('brand');
    if (brand) {
      query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    // Variant Level Filters
    const size = searchParams.get('size');
    if (size) {
      query['variants.sizes'] = size;
    }

    const color = searchParams.get('color');
    if (color) {
      query['variants.colors'] = { $regex: new RegExp(`^${color}$`, 'i') };
    }

    const ageGroup = searchParams.get('ageGroup');
    if (ageGroup) {
      query['variants.ageGroups'] = ageGroup;
    }

    const playingLevel = searchParams.get('playingLevel');
    if (playingLevel) {
      query['variants.playingLevels'] = playingLevel;
    }

    const ballType = searchParams.get('ballType');
    if (ballType) {
      query['variants.ballTypes'] = ballType;
    }

    const woodType = searchParams.get('woodType');
    if (woodType) {
      query['variants.batWoodTypes'] = woodType;
    }

    const handOrientation = searchParams.get('handOrientation');
    if (handOrientation) {
      query['variants.handOrientations'] = handOrientation;
    }

    const subcategory = searchParams.get('subcategory');
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Price Bounds
    const minPrice = Number(searchParams.get('minPrice'));
    const maxPrice = Number(searchParams.get('maxPrice'));
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    // Discount Filter
    const minDiscount = Number(searchParams.get('minDiscount'));
    if (minDiscount) {
      query.discount = { $gte: minDiscount };
    }

    // Rating Filter
    const minRating = Number(searchParams.get('minRating'));
    if (minRating) {
      query['ratings.average'] = { $gte: minRating };
    }

    // Stock Exclusion
    const excludeOutOfStock = searchParams.get('excludeOutOfStock') === 'true';
    if (excludeOutOfStock) {
      query.stock = { $gt: 0 };
    }

    // Featured Flags
    const isFeatured = searchParams.get('isFeatured');
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    
    const isBestSeller = searchParams.get('isBestSeller');
    if (isBestSeller === 'true') {
      query.isBestSeller = true;
    }

    const isNewArrival = searchParams.get('isNewArrival');
    if (isNewArrival === 'true') {
      query.isNewArrival = true;
    }

    // Execute sorting
    const sortParam = searchParams.get('sort');
    let sortQuery = { createdAt: -1 }; // default newest

    if (sortParam === 'price-asc') sortQuery = { price: 1 };
    else if (sortParam === 'price-desc') sortQuery = { price: -1 };
    else if (sortParam === 'rating-desc') sortQuery = { 'ratings.average': -1 };
    else if (sortParam === 'discount-desc') sortQuery = { discount: -1 };

    const products = await Product.find(query).sort(sortQuery);

    return NextResponse.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Create a product (Protected: Admin Only)
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

    const body = await request.json();
    const { name, brand, description, price, mrp, stock, sku, category } = body;

    // Validate required fields
    if (!name || !brand || !description || price === undefined || mrp === undefined || stock === undefined || !sku || !category) {
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Check SKU duplicate
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return NextResponse.json(
        { success: false, error: 'SKU product code already exists' },
        { status: 400 }
      );
    }

    // Compute automatic slug & discount percent
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    // Check slug duplicate
    const existingSlug = await Product.findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const productData = {
      ...body,
      slug: finalSlug,
      discount
    };

    const newProduct = await Product.create(productData);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });

  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
