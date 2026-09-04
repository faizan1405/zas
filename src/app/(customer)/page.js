import React from 'react';
import { getHomeSections, getPublicCategories } from 'src/lib/storeData';
import HomeClient from 'src/app/(customer)/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [sections, categories] = await Promise.all([
    getHomeSections(),
    getPublicCategories(),
  ]);

  return <HomeClient sections={sections} categories={categories} />;
}
