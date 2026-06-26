import React from 'react';
import Link from 'next/link';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import InlineSVG from './InlineSVG';
import { formatINR } from 'src/lib/currency';

const ProductCard = ({ 
  product, 
  isWishlisted = false, 
  onWishlistToggle = () => {}, 
  onAddToCart = () => {} 
}) => {
  if (!product) return null;

  const {
    _id,
    name,
    brand,
    slug,
    price,
    mrp,
    discount,
    stock,
    ratings = { average: 0, count: 0 },
    category,
    images = [],
    isBestSeller,
    isNewArrival
  } = product;

  const hasImage = images && images.length > 0;
  const isOutOfStock = stock <= 0;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle(_id);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      onAddToCart(product);
    }
  };

  return (
    <div className="product-card animate-fade">
      <Link href={`/product/${slug}`} style={{ display: 'block', color: 'inherit' }}>
        <div className="product-image-wrapper">
          {/* Badge Tags */}
          <div className="product-tag">
            {isOutOfStock ? (
              <span className="badge badge-stock-out">Out of stock</span>
            ) : stock <= 5 ? (
              <span className="badge badge-low-stock">Only {stock} Left</span>
            ) : isBestSeller ? (
              <span className="badge badge-featured">Bestseller</span>
            ) : isNewArrival ? (
              <span className="badge badge-new">New</span>
            ) : discount >= 20 ? (
              <span className="badge badge-sale">{discount}% Off</span>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button 
            type="button"
            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlistClick}
            aria-label="Toggle Wishlist"
          >
            <Heart size={18} fill={isWishlisted ? '#EF4444' : 'transparent'} stroke={isWishlisted ? '#EF4444' : 'currentColor'} />
          </button>

          {/* Product Image */}
          {hasImage && !images[0].includes('unsplash.com') ? (
            <img src={images[0]} alt={name} className="product-image" loading="lazy" />
          ) : (
            // Use local high quality SVG vectors for a cleaner sporty presentation
            <InlineSVG type={category} className="product-image" />
          )}
        </div>

        <div className="product-info">
          <span className="product-brand">{brand}</span>
          <h3 className="product-title">{name}</h3>
          
          <div className="product-rating">
            <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
            <span>{ratings.average?.toFixed(1) || '0.0'} ({ratings.count || 0})</span>
          </div>

          <div className="product-price-row">
            <span className="price-sale">{formatINR(price)}</span>
            {mrp > price && (
              <>
                <span className="price-mrp">{formatINR(mrp)}</span>
                <span className="price-discount">-{discount}%</span>
              </>
            )}
          </div>

          <div className="product-card-actions">
            {isOutOfStock ? (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm btn-full"
                disabled
              >
                Out of Stock
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary btn-sm btn-full"
                onClick={handleCartClick}
              >
                <ShoppingBag size={14} /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
