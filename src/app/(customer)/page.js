import React from 'react';
import HomeClient from './HomeClient';
import { getHomeProducts, getPublicCategories } from 'src/lib/storeData';

// Render at request time so newly added admin products always surface, and so the
// build isn't coupled to database availability. The heavy lifting (product +
// category reads) is still cached via unstable_cache with a short revalidation
// window and tag-based invalidation, so this stays cheap under load.
export const dynamic = 'force-dynamic';

// Server Component: load the catalog + categories on the server (cached, compact
// card fields) and hand them to the interactive client shell. Admin changes show
// up promptly because the caches are tag-invalidated on every product/category
// mutation, backed by a short time-based revalidation window.
export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getHomeProducts(),
    getPublicCategories(),
  ]);

  return <HomeClient products={products} categories={categories} />;
}
