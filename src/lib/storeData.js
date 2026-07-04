import { unstable_cache } from 'next/cache';
import dbConnect from 'src/lib/mongodb';
import Product from 'src/models/Product';
import Category from 'src/models/Category';
import Setting from 'src/models/Setting';

// Cache tags used for on-demand invalidation from the admin mutation routes.
export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  settings: 'settings',
};

// Compact projection: exactly the fields product cards and listing filters need.
// Heavy fields (description, specs, full variant matrices) are intentionally omitted
// from listings — the product-detail endpoint still returns the complete document.
export const PRODUCT_CARD_FIELDS =
  'name brand slug price mrp discount stock ratings category subcategory images isBestSeller isNewArrival isFeatured createdAt';

// Escape user-provided text before using it inside a RegExp so a value like
// "a.*b" or "(" can't blow up or alter the query.
export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Build a Mongoose filter from plain primitive params (no request object) so the
// same builder is safe to call inside a cached function and from the admin path.
export function buildProductQuery(p = {}, { includeInactive = false } = {}) {
  const query = {};
  if (!includeInactive) query.isActive = true;

  if (p.search) {
    const rx = new RegExp(escapeRegex(p.search), 'i');
    query.$or = [{ name: rx }, { brand: rx }, { description: rx }];
  }

  if (p.category) query.category = p.category;
  if (p.brand) query.brand = new RegExp(`^${escapeRegex(p.brand)}$`, 'i');
  if (p.size) query['variants.sizes'] = p.size;
  if (p.color) query['variants.colors'] = new RegExp(`^${escapeRegex(p.color)}$`, 'i');
  if (p.ageGroup) query['variants.ageGroups'] = p.ageGroup;
  if (p.playingLevel) query['variants.playingLevels'] = p.playingLevel;
  if (p.ballType) query['variants.ballTypes'] = p.ballType;
  if (p.woodType) query['variants.batWoodTypes'] = p.woodType;
  if (p.handOrientation) query['variants.handOrientations'] = p.handOrientation;
  if (p.subcategory) query.subcategory = p.subcategory;

  const minPrice = Number(p.minPrice) || 0;
  const maxPrice = Number(p.maxPrice) || 0;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  const minDiscount = Number(p.minDiscount) || 0;
  if (minDiscount) query.discount = { $gte: minDiscount };

  const minRating = Number(p.minRating) || 0;
  if (minRating) query['ratings.average'] = { $gte: minRating };

  if (p.excludeOutOfStock) query.stock = { $gt: 0 };
  if (p.isFeatured) query.isFeatured = true;
  if (p.isBestSeller) query.isBestSeller = true;
  if (p.isNewArrival) query.isNewArrival = true;

  return query;
}

export function buildProductSort(sort) {
  if (sort === 'price-asc') return { price: 1 };
  if (sort === 'price-desc') return { price: -1 };
  if (sort === 'rating-desc') return { 'ratings.average': -1 };
  if (sort === 'discount-desc') return { discount: -1 };
  return { createdAt: -1 }; // default: newest
}

// Cached public product listing (active products only, compact card fields).
// Keyed on the full params object; revalidates on a short window and on-demand
// via revalidateTag('products') after any admin product mutation.
export const getPublicProducts = unstable_cache(
  async (params = {}) => {
    await dbConnect();
    const query = buildProductQuery(params);
    const sort = buildProductSort(params.sort);
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(0, Number(params.limit) || 0);

    let cursor = Product.find(query).select(PRODUCT_CARD_FIELDS).sort(sort).lean();
    let total;
    if (limit > 0) {
      total = await Product.countDocuments(query);
      cursor = cursor.skip((page - 1) * limit).limit(limit);
    }
    const products = await cursor;
    if (limit <= 0) total = products.length;

    // Plain JSON-safe objects (ObjectId/Date -> string) so the cache stores
    // serializable data and consumers get the same shape as the API response.
    return { products: JSON.parse(JSON.stringify(products)), total, page, limit };
  },
  ['public-products-v1'],
  { tags: [CACHE_TAGS.products], revalidate: 60 }
);

// Convenience for server components that need the full active catalog (homepage).
export async function getHomeProducts() {
  const { products } = await getPublicProducts({});
  return products;
}

// Cached active categories, ordered by displayOrder.
export const getPublicCategories = unstable_cache(
  async () => {
    await dbConnect();
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();
    return JSON.parse(JSON.stringify(categories));
  },
  ['public-categories-v1'],
  { tags: [CACHE_TAGS.categories], revalidate: 300 }
);

// Cached store settings document (or null if none exists yet).
export const getPublicSettings = unstable_cache(
  async () => {
    await dbConnect();
    const settings = await Setting.findOne().lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : null;
  },
  ['public-settings-v1'],
  { tags: [CACHE_TAGS.settings], revalidate: 300 }
);
