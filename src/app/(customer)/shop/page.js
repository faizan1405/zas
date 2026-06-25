'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { useStore } from 'src/context/StoreContext';
import ProductCard from 'src/components/ProductCard';

const ShopContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, wishlist, toggleWishlist, addToCart, categories } = useStore();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Price input state
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');

  // Read URL query params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const brandParam = searchParams.get('brand') || '';
  const sizeParam = searchParams.get('size') || '';
  const ageGroupParam = searchParams.get('ageGroup') || '';
  const levelParam = searchParams.get('playingLevel') || '';
  const ballParam = searchParams.get('ballType') || '';
  const woodParam = searchParams.get('woodType') || '';
  const handParam = searchParams.get('handOrientation') || '';
  const colorParam = searchParams.get('color') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const outOfStockParam = searchParams.get('excludeOutOfStock') === 'true';

  // 1. Fetch filtered products from API whenever query params change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        // Build url matching exact parameters
        let url = `/api/products?sort=${sortParam}`;
        if (categoryParam) url += `&category=${categoryParam}`;
        if (searchParam) url += `&search=${encodeURIComponent(searchParam)}`;
        if (brandParam) url += `&brand=${brandParam}`;
        if (sizeParam) url += `&size=${sizeParam}`;
        if (ageGroupParam) url += `&ageGroup=${ageGroupParam}`;
        if (levelParam) url += `&playingLevel=${levelParam}`;
        if (ballParam) url += `&ballType=${ballParam}`;
        if (woodParam) url += `&woodType=${woodParam}`;
        if (handParam) url += `&handOrientation=${handParam}`;
        if (colorParam) url += `&color=${colorParam}`;
        if (minPriceParam) url += `&minPrice=${minPriceParam}`;
        if (maxPriceParam) url += `&maxPrice=${maxPriceParam}`;
        if (outOfStockParam) url += `&excludeOutOfStock=true`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching filtered products:', err);
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [
    categoryParam,
    searchParam,
    brandParam,
    sizeParam,
    ageGroupParam,
    levelParam,
    ballParam,
    woodParam,
    handParam,
    colorParam,
    minPriceParam,
    maxPriceParam,
    sortParam,
    outOfStockParam
  ]);

  // Sync inputs with URL params
  useEffect(() => {
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // 2. URL Update Helpers
  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/shop?${params.toString()}`);
  };

  const handleCheckboxChange = (key, value, isChecked) => {
    updateQuery({ [key]: isChecked ? value : '' });
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    updateQuery({ minPrice: minPriceInput, maxPrice: maxPriceInput });
  };

  const clearAllFilters = () => {
    router.push('/shop');
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  // Static list values based on seeded data
  const brands = ['Apex'];
  const colors = ['Red', 'Pink', 'Yellow', 'White', 'Navy Blue', 'Black/Orange', 'Obsidian Black'];
  const sizes = ['Short Handle', 'Long Handle', 'Harrow', 'Size 6', 'Size 5', 'Size 4', 'Size 3', 'US 8', 'US 9', 'US 10', 'US 11', 'S', 'M', 'L', 'XL'];
  const ageGroups = ['Men', 'Women', 'Kids', 'Junior'];
  const playingLevels = ['Beginner', 'Intermediate', 'Professional'];
  const ballTypes = ['Tennis ball', 'Leather ball'];
  const woodTypes = ['English Willow', 'Kashmir Willow', 'Poplar Wood'];
  const handOrientations = ['Right Hand', 'Left Hand'];

  const categoryName = categoryParam 
    ? categories.find(c => c.slug === categoryParam)?.name || 'Cricket Gear'
    : 'All Cricket Gear';

  const filterSidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', fontFamily: 'Outfit' }}>Filters</h3>
        <button 
          type="button" 
          onClick={clearAllFilters} 
          style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dark-muted)' }}
        >
          <RotateCcw size={12} /> Reset All
        </button>
      </div>

      {/* Exclude Out of Stock toggle */}
      <div className="filter-group">
        <label className="filter-checkbox-item" style={{ fontWeight: 600 }}>
          <input 
            type="checkbox" 
            checked={outOfStockParam}
            onChange={(e) => updateQuery({ excludeOutOfStock: e.target.checked ? 'true' : '' })}
          />
          <span>Exclude Out of Stock</span>
        </label>
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <h4 className="filter-section-title">Category</h4>
        <div className="filter-checkbox-list">
          {categories.map(cat => (
            <label key={cat._id} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={categoryParam === cat.slug}
                onChange={(e) => handleCheckboxChange('category', cat.slug, e.target.checked)}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="filter-group">
        <h4 className="filter-section-title">Price Range</h4>
        <form onSubmit={handlePriceSubmit} className="price-range-inputs">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
          />
          <span>-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '6px 10px' }}>Go</button>
        </form>
      </div>

      {/* Playing Level */}
      <div className="filter-group">
        <h4 className="filter-section-title">Playing Level</h4>
        <div className="filter-checkbox-list">
          {playingLevels.map(lvl => (
            <label key={lvl} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={levelParam === lvl}
                onChange={(e) => handleCheckboxChange('playingLevel', lvl, e.target.checked)}
              />
              <span>{lvl}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Age Group */}
      <div className="filter-group">
        <h4 className="filter-section-title">Age Group</h4>
        <div className="filter-checkbox-list">
          {ageGroups.map(grp => (
            <label key={grp} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={ageGroupParam === grp}
                onChange={(e) => handleCheckboxChange('ageGroup', grp, e.target.checked)}
              />
              <span>{grp}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bat Wood Type (Visible under Bats category or generally) */}
      <div className="filter-group">
        <h4 className="filter-section-title">Bat Wood</h4>
        <div className="filter-checkbox-list">
          {woodTypes.map(wood => (
            <label key={wood} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={woodParam === wood}
                onChange={(e) => handleCheckboxChange('woodType', wood, e.target.checked)}
              />
              <span>{wood}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ball Type */}
      <div className="filter-group">
        <h4 className="filter-section-title">Ball Type</h4>
        <div className="filter-checkbox-list">
          {ballTypes.map(ball => (
            <label key={ball} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={ballParam === ball}
                onChange={(e) => handleCheckboxChange('ballType', ball, e.target.checked)}
              />
              <span>{ball}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Hand Orientation */}
      <div className="filter-group">
        <h4 className="filter-section-title">Hand Orientation</h4>
        <div className="filter-checkbox-list">
          {handOrientations.map(hand => (
            <label key={hand} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={handParam === hand}
                onChange={(e) => handleCheckboxChange('handOrientation', hand, e.target.checked)}
              />
              <span>{hand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="filter-group">
        <h4 className="filter-section-title">Size</h4>
        <div className="filter-checkbox-list">
          {sizes.map(sz => (
            <label key={sz} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={sizeParam === sz}
                onChange={(e) => handleCheckboxChange('size', sz, e.target.checked)}
              />
              <span>{sz}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="filter-group">
        <h4 className="filter-section-title">Color</h4>
        <div className="filter-checkbox-list">
          {colors.map(col => (
            <label key={col} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={colorParam === col}
                onChange={(e) => handleCheckboxChange('color', col, e.target.checked)}
              />
              <span>{col}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container animate-fade">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-dark)' }}>Shop</span>
        {categoryParam && (
          <>
            <span>/</span>
            <span style={{ color: 'var(--text-dark)' }}>{categoryName}</span>
          </>
        )}
      </div>

      {/* Category Banner */}
      <div className="category-banner" style={{ backgroundImage: 'linear-gradient(rgba(11, 15, 25, 0.75), rgba(11, 15, 25, 0.75)), url(https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200)' }}>
        <div className="category-banner-content">
          <h1>{categoryName}</h1>
          {searchParam && <p style={{ marginTop: '8px', color: 'var(--text-light-muted)' }}>Search results for: <strong>"{searchParam}"</strong></p>}
        </div>
      </div>

      {/* Mobile Filters Header */}
      <div className="mobile-filter-bar">
        <button 
          type="button" 
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal size={14} /> Filter & Sort
        </button>
        <span className="product-count">
          Showing <span>{products.length}</span> Products
        </span>
      </div>

      <div className="shop-layout">
        {/* Desktop Filter Sidebar */}
        <aside className="filter-sidebar">
          {filterSidebarContent}
        </aside>

        {/* Shop Main Section */}
        <main className="shop-main">
          {/* Top Sort Header */}
          <div className="shop-sorting-row" style={{ display: showMobileFilters ? 'none' : 'flex' }}>
            <span className="product-count" style={{ display: 'block' }}>
              We found <span>{products.length}</span> items matching your search
            </span>
            <div className="sort-select-box">
              <span>Sort By:</span>
              <select 
                value={sortParam}
                onChange={(e) => updateQuery({ sort: e.target.value })}
              >
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Customer Rating</option>
                <option value="discount-desc">Discount Percentage</option>
              </select>
            </div>
          </div>

          {/* Related Collection Chips */}
          <div className="collection-chips">
            <button 
              type="button" 
              className={`collection-chip ${!categoryParam ? 'active' : ''}`}
              onClick={() => updateQuery({ category: '' })}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat._id}
                type="button" 
                className={`collection-chip ${categoryParam === cat.slug ? 'active' : ''}`}
                onClick={() => updateQuery({ category: cat.slug })}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--bg-light-border)', borderTopColor: 'var(--text-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '10px', color: 'var(--text-dark-muted)' }}>Refreshing stock catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'white', border: '1px solid var(--bg-light-border)', borderRadius: 'var(--border-radius-md)' }}>
              <SlidersHorizontal size={48} style={{ color: 'var(--text-dark-muted)', marginBottom: '15px' }} />
              <h3>No Matches Found</h3>
              <p style={{ color: 'var(--text-dark-muted)', marginTop: '8px' }}>We couldn't find any products matching your specific combinations of filters.</p>
              <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '20px' }} onClick={clearAllFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="grid grid-3 animate-fade">
              {products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  isWishlisted={wishlist.includes(product._id)}
                  onWishlistToggle={toggleWishlist}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide Drawer */}
      {showMobileFilters && (
        <>
          <div className="drawer-overlay" onClick={() => setShowMobileFilters(false)} />
          <div className="filter-drawer">
            <div className="drawer-header">
              <h3>Refine Store</h3>
              <button type="button" onClick={() => setShowMobileFilters(false)}>
                <X size={20} />
              </button>
            </div>
            
            {/* Mobile Sort selector */}
            <div className="form-group" style={{ marginBottom: '20px', borderBottom: '1px solid var(--bg-light-border)', paddingBottom: '20px' }}>
              <label className="form-label">Sort Catalog</label>
              <select 
                value={sortParam}
                onChange={(e) => updateQuery({ sort: e.target.value })}
                className="form-control"
              >
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Customer Rating</option>
                <option value="discount-desc">Discount Percentage</option>
              </select>
            </div>

            {/* Sidebar contents */}
            {filterSidebarContent}

            <button 
              type="button" 
              className="btn btn-primary btn-full"
              style={{ marginTop: '30px', position: 'sticky', bottom: 0 }}
              onClick={() => setShowMobileFilters(false)}
            >
              Apply Filter Profiles
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading Shop Content...</div>}>
      <ShopContent />
    </Suspense>
  );
}
