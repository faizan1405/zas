import React from 'react';
import HomeClient from './HomeClient';
import { getHomeSections, getPublicCategories } from 'src/lib/storeData';

// Render at request time so newly added admin products always surface, and so the
// build isn't coupled to database availability. The heavy lifting (product +
// category reads) is still cached via unstable_cache with a short revalidation
// window and tag-based invalidation, so this stays cheap under load.
export const dynamic = 'force-dynamic';

// Server Component: prepare only the products the homepage renders (≤4 per grid /
// category row) plus the active category list, then hand them to the interactive
// client shell. The full catalogue is never shipped to the browser. Admin changes
// show up promptly because the caches are tag-invalidated on every product/
// category mutation, backed by a short time-based revalidation window.
export default async function HomePage() {
  const [sections, categories] = await Promise.all([
    getHomeSections(),
    getPublicCategories(),
  ]);

  return <HomeClient sections={sections} categories={categories} />;
}
