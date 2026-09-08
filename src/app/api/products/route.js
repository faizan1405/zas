import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from 'src/lib/prisma';
import { verifyAdmin } from 'src/lib/auth';
import {
  getPublicProducts,
  buildProductQuery,
  buildProductSort,
  CACHE_TAGS,
} from 'src/lib/storeData';

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = readParams(searchParams);

    const isAdminView = searchParams.get('adminView') === 'true';
    if (isAdminView) {
      if (!verifyAdmin(request)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Admin access required' },
          { status: 401 }
        );
      }
      
      const query = buildProductQuery(params, { includeInactive: true });
      const sort = buildProductSort(params.sort);
      
      const products = await prisma.product.findMany({
        where: query,
        orderBy: sort,
      });
      
      return NextResponse.json({
        success: true,
        count: products.length,
        total: products.length,
        page: 1,
        products,
      });
    }

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

export async function POST(request) {
  try {
    const isAdmin = verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, brand, description, price, mrp, stock, sku, category } = body;

    if (!name || !brand || !description || price === undefined || mrp === undefined || stock === undefined || !sku || !category) {
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json(
        { success: false, error: 'SKU product code already exists' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const productData = {
      ...body,
      slug: finalSlug,
      discount
    };
    
    // In Prisma, we might need to be careful if body has extra fields not in schema, 
    // or if we pass 'id' manually. Usually better to explicitly define, but spreading is fine if client is well behaved.
    // If it fails, it will be caught in catch block.
    // Pass only fields represented by the Prisma model.
    // So let's extract explicitly to be safe:
    const safeData = {
      name: productData.name,
      brand: productData.brand,
      slug: productData.slug,
      description: productData.description,
      specs: productData.specs,
      price: productData.price,
      mrp: productData.mrp,
      discount: productData.discount,
      stock: productData.stock,
      sku: productData.sku,
      variants: productData.variants,
      images: productData.images,
      ratingsAverage: productData.ratings?.average || 0,
      ratingsCount: productData.ratings?.count || 0,
      isFeatured: productData.isFeatured || false,
      isBestSeller: productData.isBestSeller || false,
      isNewArrival: productData.isNewArrival || false,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      category: productData.category,
      subcategory: productData.subcategory,
    };

    const newProduct = await prisma.product.create({
      data: safeData
    });

    revalidateTag(CACHE_TAGS.products);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });

  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
