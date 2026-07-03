'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
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
  const subcategoryParam = searchParams.get('subcategory') || '';
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
  const discountParam = searchParams.get('minDiscount') || '';
  const ratingParam = searchParams.get('minRating') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const outOfStockParam = searchParams.get('excludeOutOfStock') === 'true';

  // Fetch filtered products
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        let url = `/api/products?sort=${sortParam}`;
        if (categoryParam) url += `&category=${categoryParam}`;
        if (subcategoryParam) url += `&subcategory=${subcategoryParam}`;
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
        if (discountParam) url += `&minDiscount=${discountParam}`;
        if (ratingParam) url += `&minRating=${ratingParam}`;
        if (outOfStockParam) url += `&excludeOutOfStock=true`;

        const res = await fetch(url, { cache: 'no-store' });
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
    subcategoryParam,
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
    discountParam,
    ratingParam,
    sortParam,
    outOfStockParam
  ]);

  useEffect(() => {
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // URL Query updates
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

  // Static list values matching Zassports catalogs
  const brands = ['Zassports'];
  const colors = ['Red', 'Pink', 'White', 'Yellow', 'Blue', 'Navy Blue', 'Black/Orange'];
  const sizes = ['Short Handle', 'Long Handle', 'Size 6', 'Size 5', 'Size 4', 'Size 3', 'US 8', 'US 9', 'US 10', 'US 11', 'S', 'M', 'L', 'XL'];
  const ageGroups = ['Men', 'Women', 'Kids', 'Junior'];
  const playingLevels = ['Beginner', 'Intermediate', 'Professional'];
  const woodTypes = ['English Willow', 'Kashmir Willow', 'Poplar Wood'];
  const ratings = [
    { label: '4★ & above', value: '4' },
    { label: '3★ & above', value: '3' }
  ];
  const discounts = [
    { label: '10% Off or more', value: '10' },
    { label: '20% Off or more', value: '20' },
    { label: '30% Off or more', value: '30' }
  ];

  // Dynamically listing subcategories depending on main category selections
  const getSubcategories = () => {
    if (categoryParam === 'cricket-bats') {
      return [
        { name: 'Tennis Cricket Bat', slug: 'tennis-cricket-bat' },
        { name: 'English Willow Bat', slug: 'english-willow-bat' },
        { name: 'Kashmir Willow Bat', slug: 'kashmir-willow-bat' },
        { name: 'Kids Cricket Bat', slug: 'kids-cricket-bat' }
      ];
    }
    if (categoryParam === 'cricket-balls') {
      return [
        { name: 'Tennis Ball', slug: 'tennis-ball' },
        { name: 'Leather Ball', slug: 'leather-ball' },
        { name: 'Practice Ball', slug: 'practice-ball' }
      ];
    }
    if (categoryParam === 'cricket-shoes') {
      return [
        { name: 'Adult Cricket Shoes', slug: 'adult-cricket-shoes' },
        { name: 'Kids Cricket Shoes', slug: 'kids-cricket-shoes' },
        { name: 'Spiked Shoes', slug: 'spiked-shoes' },
        { name: 'Rubber Shoes', slug: 'rubber-shoes' }
      ];
    }
    if (categoryParam === 'cricket-clothing') {
      return [
        { name: 'Cricket Jersey', slug: 'cricket-jersey' },
        { name: 'Cricket Track Pants', slug: 'cricket-track-pants' },
        { name: 'Cricket T-Shirts', slug: 'cricket-t-shirts' },
        { name: 'Cricket Shorts', slug: 'cricket-shorts' }
      ];
    }
    if (categoryParam === 'accessories') {
      return [
        { name: 'Bat Grips', slug: 'bat-grips' },
        { name: 'Stumps', slug: 'stumps' },
        { name: 'Bails', slug: 'bails' },
        { name: 'Bat Mallet', slug: 'bat-mallet' },
        { name: 'Grip Cone', slug: 'grip-cone' },
        { name: 'Kit Accessories', slug: 'kit-accessories' }
      ];
    }
    return [];
  };

  const currentSubcats = getSubcategories();
  const categoryName = categoryParam 
    ? categories.find(c => c.slug === categoryParam)?.name || 'Cricket Gear'
    : 'All Cricket Gear';

  const filterSidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', fontFamily: 'Outfit', fontWeight: 800 }}>Filters</h3>
        <button 
          type="button" 
          onClick={clearAllFilters} 
          style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dark-muted)' }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Stock Availability */}
      <div className="filter-group">
        <label className="filter-checkbox-item" style={{ fontWeight: 600 }}>
          <input 
            type="checkbox" 
            checked={outOfStockParam}
            onChange={(e) => updateQuery({ excludeOutOfStock: e.target.checked ? 'true' : '' })}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Sport Category Filter */}
      <div className="filter-group">
        <h4 className="filter-section-title">Sports Category</h4>
        <div className="filter-checkbox-list">
          {categories.map(cat => (
            <label key={cat._id} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={categoryParam === cat.slug}
                onChange={(e) => {
                  handleCheckboxChange('category', cat.slug, e.target.checked);
                  // Wipe subcategory since parent category changes
                  updateQuery({ subcategory: '', category: e.target.checked ? cat.slug : '' });
                }}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subcategory Specific (if bats, balls, clothing selected) */}
      {currentSubcats.length > 0 && (
        <div className="filter-group">
          <h4 className="filter-section-title">Types of {categoryName}</h4>
          <div className="filter-checkbox-list">
            {currentSubcats.map(sub => (
              <label key={sub.slug} className="filter-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={subcategoryParam === sub.slug}
                  onChange={(e) => handleCheckboxChange('subcategory', sub.slug, e.target.checked)}
                />
                <span>{sub.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

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

      {/* Brand (Zassports) */}
      <div className="filter-group">
        <h4 className="filter-section-title">Brand</h4>
        <div className="filter-checkbox-list">
          {brands.map(brnd => (
            <label key={brnd} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={brandParam === brnd}
                onChange={(e) => handleCheckboxChange('brand', brnd, e.target.checked)}
              />
              <span>{brnd}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Wood Type */}
      <div className="filter-group">
        <h4 className="filter-section-title">Type of Wood</h4>
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

      {/* Playing Level / Level of Practice */}
      <div className="filter-group">
        <h4 className="filter-section-title">Level of Practice</h4>
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

      {/* Age Group / Gender */}
      <div className="filter-group">
        <h4 className="filter-section-title">Age / Gender</h4>
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

      {/* Discount Options */}
      <div className="filter-group">
        <h4 className="filter-section-title">Discount Percentage</h4>
        <div className="filter-checkbox-list">
          {discounts.map(disc => (
            <label key={disc.value} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={discountParam === disc.value}
                onChange={(e) => handleCheckboxChange('minDiscount', disc.value, e.target.checked)}
              />
              <span>{disc.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Customer Ratings */}
      <div className="filter-group">
        <h4 className="filter-section-title">Customer Rating</h4>
        <div className="filter-checkbox-list">
          {ratings.map(rtg => (
            <label key={rtg.value} className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={ratingParam === rtg.value}
                onChange={(e) => handleCheckboxChange('minRating', rtg.value, e.target.checked)}
              />
              <span>{rtg.label}</span>
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

      {/* Mobile Filter Button */}
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

        {/* Catalog Main Section */}
        <main className="shop-main">
          {/* Top Sorting Header */}
          <div className="shop-sorting-row" style={{ display: showMobileFilters ? 'none' : 'flex' }}>
            <span className="product-count" style={{ display: 'block' }}>
              We found <span>{products.length}</span> items matching your selection
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

          {/* Collection Chips */}
          <div className="collection-chips">
            <button 
              type="button" 
              className={`collection-chip ${!categoryParam ? 'active' : ''}`}
              onClick={() => updateQuery({ category: '', subcategory: '' })}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat._id}
                type="button" 
                className={`collection-chip ${categoryParam === cat.slug ? 'active' : ''}`}
                onClick={() => updateQuery({ category: cat.slug, subcategory: '' })}
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

      {/* Mobile bottom filter drawer */}
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
