import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from 'src/lib/mongodb';
import Product from 'src/models/Product';
import { verifyAdmin } from 'src/lib/auth';
import {
  getPublicProducts,
  buildProductQuery,
  buildProductSort,
  CACHE_TAGS,
} from 'src/lib/storeData';

// Collect the public listing params into a plain, serializable object. Keeping
// this shape stable is what lets the cached query key correctly.
function readParams(searchParams) {
  return {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    ageGroup: searchParams.get('ageGroup') || '',
    playingLevel: searchParams.get('playingLevel') || '',
    ballType: searchParams.get('ballType') || '',
    woodType: searchParams.get('woodType') || '',
    handOrientation: searchParams.get('handOrientation') || '',
    subcategory: searchParams.get('subcategory') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minDiscount: searchParams.get('minDiscount') || '',
    minRating: searchParams.get('minRating') || '',
    excludeOutOfStock: searchParams.get('excludeOutOfStock') === 'true',
    isFeatured: searchParams.get('isFeatured') === 'true',
    isBestSeller: searchParams.get('isBestSeller') === 'true',
    isNewArrival: searchParams.get('isNewArrival') === 'true',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '0',
  };
}

// 1. GET: Fetch products with search filters, sorting and optional pagination.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = readParams(searchParams);

    // Admin view can see inactive products and always reads fresh (never cached),
    // returning full documents for the management screens.
    const isAdminView = searchParams.get('adminView') === 'true';
    if (isAdminView) {
      await dbConnect();
      const query = buildProductQuery(params, { includeInactive: true });
      const sort = buildProductSort(params.sort);
      const products = await Product.find(query).sort(sort).lean();
      const json = JSON.parse(JSON.stringify(products));
      return NextResponse.json({
        success: true,
        count: json.length,
        total: json.length,
        page: 1,
        products: json,
      });
    }

    // Public view: cached, compact card fields, optional pagination.
    const { products, total, page, limit } = await getPublicProducts(params);
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

    return NextResponse.json({
      success: true,
      count: products.length,
      total,
      page,
      limit,
      totalPages,
      hasMore: limit > 0 ? page < totalPages : false,
      products,
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
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

    // Drop the cached public listings so the new product appears immediately.
    revalidateTag(CACHE_TAGS.products);

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
