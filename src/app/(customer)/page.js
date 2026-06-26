'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  RotateCcw, 
  Award, 
  Heart,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useStore } from 'src/context/StoreContext';
import ProductCard from 'src/components/ProductCard';

const HomePage = () => {
  const { cart, wishlist, toggleWishlist, addToCart } = useStore();
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch homepage layout data
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch Banners
        const bannerRes = await fetch('/api/settings'); // settings/api has banners or settings
        // Wait, we seeded banners in db and can fetch settings, let's fetch banners directly or mock them
        // Let's create endpoints or fetch from products
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        
        if (productsData.success) {
          const allProducts = productsData.products;
          setBestSellers(allProducts.filter(p => p.isBestSeller).slice(0, 4));
          setNewArrivals(allProducts.filter(p => p.isNewArrival).slice(0, 4));
          setFeaturedProducts(allProducts.filter(p => p.isFeatured).slice(0, 4));
        }

        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        if (categoriesData.success) {
          setCategories(categoriesData.categories.slice(0, 8));
        }

        // Mock Banners for Slider (Seeded values)
        setBanners([
          {
            title: 'Unleash Your Inner Champion',
            subtitle: 'Explore our premium English Willow bats and protective gear.',
            image: '/images/hero.png',
            link: '/shop?category=cricket-bats'
          },
          {
            title: 'Gear Up For The Match',
            subtitle: 'Special 25% discount on all custom cricket kits and bundles.',
            image: 'https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=1200',
            link: '/shop?category=cricket-kits'
          }
        ]);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Slide controls
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto slide interval
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid var(--bg-light-border)', borderTopColor: 'var(--text-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '15px', color: 'var(--text-dark-muted)', fontWeight: 600 }}>Loading Sports Arena...</p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <div className="homepage-container animate-fade">
      {/* 1. HERO SLIDER BANNER */}
      {banners.length > 0 && (
        <div className="hero-slider">
          <div 
            className="hero-slide" 
            style={{ backgroundImage: `url(${banners[currentSlide].image})` }}
          >
            <div className="hero-content">
              <h1 className="hero-title">
                {banners[currentSlide].title.split(' ').map((word, idx) => 
                  idx === 2 || idx === 3 ? <span key={idx}>{word} </span> : `${word} `
                )}
              </h1>
              <p className="hero-subtitle">{banners[currentSlide].subtitle}</p>
              <Link href={banners[currentSlide].link} className="btn btn-accent">
                Shop Collection <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <button type="button" className="action-btn" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', color: 'white', zIndex: 3 }} onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          <button type="button" className="action-btn" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', color: 'white', zIndex: 3 }} onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* 2. SHOP BY CATEGORY */}
      <section style={{ marginBottom: '60px' }}>
        <div className="section-header">
          <h2>Shop By Category</h2>
          <Link href="/shop" className="guide-link">View All Products <ArrowRight size={14} /></Link>
        </div>
        <div className="category-row">
          {categories.map((cat) => (
            <Link href={`/shop?category=${cat.slug}`} key={cat._id} className="category-card">
              <div className="category-img-box">
                <img src={cat.image} alt={cat.name} />
              </div>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. OFFERS AND DEALS BLOCK */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '60px' }}>
        <div className="mega-promo-card" style={{ minHeight: '220px', backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600)', backgroundSize: 'cover' }}>
          <div>
            <span className="badge badge-sale" style={{ marginBottom: '10px' }}>Limited Offer</span>
            <h3 style={{ fontSize: '1.6rem', color: 'white', fontFamily: 'Outfit', fontWeight: 800 }}>APEX CLUB KIT DEALS</h3>
            <p style={{ color: 'var(--text-light-muted)', fontSize: '0.85rem', marginTop: '6px' }}>Save 20% flat on all complete gear setups. Ready for school leagues.</p>
          </div>
          <Link href="/shop?category=cricket-kits" className="btn btn-accent btn-sm" style={{ alignSelf: 'flex-start' }}>Grab Deal</Link>
        </div>
        <div className="mega-promo-card" style={{ minHeight: '220px', backgroundColor: '#0B0F19', border: '1px solid var(--bg-dark-border)' }}>
          <div>
            <span className="badge badge-featured" style={{ marginBottom: '10px' }}>Coupon Code</span>
            <h3 style={{ fontSize: '1.6rem', color: 'white', fontFamily: 'Outfit', fontWeight: 800 }}>USE PROMO: APEX10</h3>
            <p style={{ color: 'var(--text-light-muted)', fontSize: '0.85rem', marginTop: '6px' }}>Get a fixed $10 discount on any purchase over $80 store-wide.</p>
          </div>
          <Link href="/shop" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', borderColor: 'var(--primary)', color: 'var(--primary)' }}>Shop Products</Link>
        </div>
      </section>

      {/* 4. BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section style={{ marginBottom: '60px' }}>
          <div className="section-header">
            <h2>Best Sellers</h2>
            <Link href="/shop?sort=rating-desc" className="guide-link">See More <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-4">
            {bestSellers.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                isWishlisted={wishlist.includes(product._id)}
                onWishlistToggle={toggleWishlist}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. DYNAMIC FEATURED PROMO (CRICKET KITS FOCUS) */}
      <section className="buying-guide-section" style={{ padding: '50px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px', margin: '60px 0' }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '12px' }}>
            <Sparkles size={16} /> Featured Collection
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'white', lineHeight: '1.1', textTransform: 'uppercase' }}>Professional Protection Series</h2>
          <p style={{ color: 'var(--text-light-muted)', fontSize: '0.95rem', margin: '16px 0 24px', lineHeight: '1.6' }}>
            Don't compromise on safety. Our carbon-reinforced shields, high impact helmets, and multi-flex split gloves are tested up to 140km/h bowling speeds.
          </p>
          <Link href="/shop?category=protection-gear" className="btn btn-accent">Explore Protection Gear</Link>
        </div>
        <div style={{ width: '100%', maxWidth: '400px', height: '280px', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', border: '1px solid var(--bg-dark-border)' }}>
          <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=500" alt="Protection gear setup" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </section>

      {/* 6. NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section style={{ marginBottom: '60px' }}>
          <div className="section-header">
            <h2>New Arrivals</h2>
            <Link href="/shop?sort=createdAt" className="guide-link">See All New <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-4">
            {newArrivals.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                isWishlisted={wishlist.includes(product._id)}
                onWishlistToggle={toggleWishlist}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. TRUST BADGES */}
      <section className="trust-badges">
        <div className="badge-item">
          <Truck size={32} className="badge-icon" />
          <div className="badge-info">
            <h4>Pan India Delivery</h4>
            <p>Deliveries all over India</p>
          </div>
        </div>
        <div className="badge-item">
          <ShieldCheck size={32} className="badge-icon" />
          <div className="badge-info">
            <h4>Genuine Gear</h4>
            <p>100% direct authentic brand</p>
          </div>
        </div>
        <div className="badge-item">
          <RefreshCw size={32} className="badge-icon" />
          <div className="badge-info">
            <h4>Easy Returns</h4>
            <p>7 days return or exchange</p>
          </div>
        </div>
        <div className="badge-item">
          <Award size={32} className="badge-icon" />
          <div className="badge-info">
            <h4>Expert Knocks</h4>
            <p>Professional bat knocking</p>
          </div>
        </div>
      </section>

      {/* 8. BUYING GUIDES SECTION */}
      <section style={{ marginBottom: '60px' }}>
        <div className="section-header">
          <h2>Cricket Gear Buying Guides</h2>
        </div>
        <div className="guide-grid">
          <div className="guide-card">
            <div className="guide-icon"><TrendingUp size={24} /></div>
            <h3>How to Choose a Cricket Bat</h3>
            <p>Understand the critical differences between English Willow, Kashmir Willow, bat weights, sizes, and grains to make the perfect selection.</p>
            <Link href="/about" className="guide-link">Read Guide <ArrowRight size={12} /></Link>
          </div>
          <div className="guide-card">
            <div className="guide-icon"><ShieldCheck size={24} /></div>
            <h3>Protection Sizing Guide</h3>
            <p>Ensure a snug, safe fit for helmets, batting pads, and gloves. Check our detailed measurements sheet to protect against high speed impacts.</p>
            <Link href="/about" className="guide-link">Read Guide <ArrowRight size={12} /></Link>
          </div>
          <div className="guide-card">
            <div className="guide-icon"><Award size={24} /></div>
            <h3>Bat Knocking & Oil Care</h3>
            <p>Learn how to properly oil and knock in your new English Willow bat to compress the fibers, prevent cracking, and maximize boundaries.</p>
            <Link href="/about" className="guide-link">Read Guide <ArrowRight size={12} /></Link>
          </div>
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS */}
      <section className="reviews-section">
        <div className="section-header">
          <h2>Loved By Players</h2>
        </div>
        <div className="review-slider-track">
          <div className="customer-review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-comment">
              "The Apex Pro English Willow bat has outstanding balance and pick-up. Cracking ping right off the middle! Shipping took only 3 days."
            </p>
            <div className="reviewer-meta">
              <div className="reviewer-avatar">R</div>
              <div className="reviewer-info">
                <h5>Rahul Sharma</h5>
                <span>Club Batsman</span>
              </div>
            </div>
          </div>
          <div className="customer-review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-comment">
              "Bought the Complete Duffle Kit for my son. Superb value for money, padding is solid and helmet adjustment fits securely."
            </p>
            <div className="reviewer-meta">
              <div className="reviewer-avatar">M</div>
              <div className="reviewer-info">
                <h5>Marcus Taylor</h5>
                <span>Parent of Junior Player</span>
              </div>
            </div>
          </div>
          <div className="customer-review-card">
            <div className="review-stars">★★★★☆</div>
            <p className="review-comment">
              "Excellent wicket keeping gloves, octopus grip works really well. Used in 4 matches, stitching holds up perfectly."
            </p>
            <div className="reviewer-meta">
              <div className="reviewer-avatar">A</div>
              <div className="reviewer-info">
                <h5>Amit Patel</h5>
                <span>Wicketkeeper</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. MEMBER CLUB CTA */}
      <section style={{ backgroundColor: 'var(--text-dark)', color: 'white', borderRadius: 'var(--border-radius-lg)', padding: '50px', textAlign: 'center', marginTop: '60px' }}>
        <h3 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, color: 'white' }}>JOIN THE APEX CRICKET CLUB</h3>
        <p style={{ color: 'var(--text-light-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '12px auto 24px', lineHeight: '1.5' }}>
          Become a member to get early access to limited edition willow drops, customized laser bat engravings, and special members-only discount coupon releases.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="form-control" 
            style={{ maxWidth: '300px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid var(--bg-dark-border)' }} 
          />
          <button type="button" className="btn btn-accent btn-sm">Subscribe Free</button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
