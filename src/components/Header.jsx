'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  User, 
  Heart, 
  ShoppingBag, 
  HelpCircle, 
  PhoneCall, 
  Check, 
  X,
  ChevronDown
} from 'lucide-react';
import { useStore } from 'src/context/StoreContext';

const Header = () => {
  const router = useRouter();
  const { 
    user, 
    cart, 
    wishlist, 
    pincode, 
    pincodeStatus, 
    verifyPincode, 
    clearPincode,
    logoutUser,
    searchQuery,
    setSearchQuery
  } = useStore();

  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Cart total quantities
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/shop');
    }
  };

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim()) {
      verifyPincode(pinInput.trim());
      setShowPinModal(false);
    }
  };

  return (
    <>
      {/* 1. TOP OFFER BAR */}
      <div className="offer-bar">
        🏏 SHIPPED ALL OVER INDIA | CASH ON DELIVERY AVAILABLE | 7 DAYS EASY RETURN & EXCHANGE 🏏
      </div>

      <header className="main-header">
        <div className="container">
          {/* 2. MAIN HEADER ROW */}
          <div className="header-top">
            {/* Logo */}
            <Link href="/" className="logo">
              ZAS<span>SPORTS</span>
            </Link>

            {/* Large Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-bar-container">
              <input
                type="text"
                placeholder="Search bats, balls, gloves, pads, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn" aria-label="Search">
                <Search size={18} />
              </button>
            </form>

            {/* Header Action Items */}
            <div className="header-actions">
              {/* Delivery Pincode Checker */}
              <div 
                className="pincode-checker" 
                onClick={() => {
                  setPinInput(pincode);
                  setShowPinModal(true);
                }}
              >
                <MapPin size={16} className="text-dark" />
                <span>
                  {pincode ? `Deliver to: ${pincode}` : 'Select pincode'}
                </span>
                {pincodeStatus === 'deliverable' && <Check size={12} className="text-success" />}
                {pincodeStatus === 'undeliverable' && <X size={12} className="text-danger" />}
              </div>

              {/* Store Locator / Support */}
              <Link href="/contact" className="action-icon-btn">
                <PhoneCall size={20} />
                <span>Support</span>
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist" className="action-icon-btn">
                <Heart size={20} />
                <span>Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="icon-badge">{wishlist.length}</span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="action-icon-btn">
                <ShoppingBag size={20} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="icon-badge">{cartCount}</span>
                )}
              </Link>

              {/* Authentication User Portal */}
              <div className="position-relative" style={{ position: 'relative' }}>
                {user ? (
                  <div 
                    className="action-icon-btn" 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    style={{ cursor: 'pointer' }}
                  >
                    <User size={20} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Profile <ChevronDown size={10} />
                    </span>
                  </div>
                ) : (
                  <Link href="/login" className="action-icon-btn">
                    <User size={20} />
                    <span>Sign In</span>
                  </Link>
                )}

                {/* User Options Dropdown */}
                {user && showUserDropdown && (
                  <div 
                    className="admin-modal-overlay" 
                    style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      right: 0, 
                      left: 'auto',
                      width: '200px', 
                      height: 'auto', 
                      backgroundColor: 'white', 
                      boxShadow: 'var(--shadow-lg)', 
                      borderRadius: 'var(--border-radius-md)', 
                      border: '1px solid var(--bg-light-border)',
                      zIndex: 102, 
                      padding: '10px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <Link 
                      href={user.role === 'admin' ? '/admin' : '/account'} 
                      className="btn-sm" 
                      style={{ padding: '8px 20px', width: '100%', textAlign: 'left', display: 'block', fontSize: '0.85rem' }}
                      onClick={() => setShowUserDropdown(false)}
                    >
                      {user.role === 'admin' ? 'Admin Dashboard' : 'My Account'}
                    </Link>
                    {user.role !== 'admin' && (
                      <Link 
                        href="/account#orders" 
                        className="btn-sm" 
                        style={{ padding: '8px 20px', width: '100%', textAlign: 'left', display: 'block', fontSize: '0.85rem' }}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        My Orders
                      </Link>
                    )}
                    <button 
                      type="button" 
                      className="btn-sm text-danger" 
                      style={{ padding: '8px 20px', width: '100%', textAlign: 'left', display: 'block', fontWeight: 600, fontSize: '0.85rem' }}
                      onClick={() => {
                        logoutUser();
                        setShowUserDropdown(false);
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. MEGA MENU NAVIGATION BAR */}
        <nav className="nav-bar">
          <div className="container">
            <ul className="nav-links">
              {/* Category: Cricket Bats */}
              <li className="nav-item">
                <Link href="/shop?category=cricket-bats" className="nav-link">Cricket Bats</Link>
                <div className="mega-menu">
                  <div className="container mega-grid">
                    <div>
                      <h4 className="mega-col-title">Wood Profile</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-bats&woodType=English+Willow">English Willow Bats</Link></li>
                        <li><Link href="/shop?category=cricket-bats&woodType=Kashmir+Willow">Kashmir Willow Bats</Link></li>
                        <li><Link href="/shop?category=cricket-bats&woodType=Poplar+Wood">Poplar Wood Bats</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mega-col-title">Level & Playing</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-bats&level=Professional">Professional Bats</Link></li>
                        <li><Link href="/shop?category=cricket-bats&level=Intermediate">Intermediate Bats</Link></li>
                        <li><Link href="/shop?category=cricket-bats&level=Beginner">Beginner Bats</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mega-col-title">Bat Sizes</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-bats&size=Short+Handle">Short Handle (SH)</Link></li>
                        <li><Link href="/shop?category=cricket-bats&size=Long+Handle">Long Handle (LH)</Link></li>
                        <li><Link href="/shop?category=cricket-bats&size=Size+6">Junior Size 6</Link></li>
                        <li><Link href="/shop?category=cricket-bats&size=Size+5">Junior Size 5</Link></li>
                      </ul>
                    </div>
                    <div className="mega-promo-card">
                      <h4>Zassports English Willow</h4>
                      <p>Premium Grade 1 Willow engineered for boundary hitters.</p>
                      <Link href="/shop?category=cricket-bats" className="btn btn-accent btn-sm">Shop Now</Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* Category: Cricket Balls */}
              <li className="nav-item">
                <Link href="/shop?category=cricket-balls" className="nav-link">Cricket Balls</Link>
                <div className="mega-menu">
                  <div className="container mega-grid">
                    <div>
                      <h4 className="mega-col-title">Ball Type</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-balls&ballType=Leather+ball">Match Leather Balls</Link></li>
                        <li><Link href="/shop?category=cricket-balls&ballType=Tennis+ball">Heavy Tennis Balls</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mega-col-title">Color Options</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-balls&color=Red">Red Match Balls</Link></li>
                        <li><Link href="/shop?category=cricket-balls&color=Pink">Pink Day-Night Balls</Link></li>
                        <li><Link href="/shop?category=cricket-balls&color=Yellow">Yellow Tennis Balls</Link></li>
                      </ul>
                    </div>
                    <div className="mega-promo-card" style={{ gridColumn: 'span 3' }}>
                      <h4>Seam & Swing Excellence</h4>
                      <p>Traditional alum-tanned 4-piece leather balls hand-stitched for extreme swing.</p>
                      <Link href="/shop?category=cricket-balls" className="btn btn-accent btn-sm">Browse Balls</Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* Category: Cricket Kits */}
              <li className="nav-item">
                <Link href="/shop?category=cricket-kits" className="nav-link">Cricket Kits</Link>
              </li>

              {/* Category: Protection Gear */}
              <li className="nav-item">
                <Link href="/shop?category=protection-gear" className="nav-link">Protection Gear</Link>
                <div className="mega-menu">
                  <div className="container mega-grid">
                    <div>
                      <h4 className="mega-col-title">Protection</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=protection-gear&type=helmets">Helmets</Link></li>
                        <li><Link href="/shop?category=protection-gear&type=pads">Batting Pads</Link></li>
                        <li><Link href="/shop?category=protection-gear&type=gloves">Batting Gloves</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mega-col-title">Guards</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=protection-gear&type=thigh">Thigh Guards</Link></li>
                        <li><Link href="/shop?category=protection-gear&type=arm">Arm Guards</Link></li>
                        <li><Link href="/shop?category=protection-gear&type=abdominal">Abdominal Guards</Link></li>
                      </ul>
                    </div>
                    <div className="mega-promo-card" style={{ gridColumn: 'span 3' }}>
                      <h4>Armored Defender series</h4>
                      <p>High impact protection compliance. Rated for 140km/h speeds.</p>
                      <Link href="/shop?category=protection-gear" className="btn btn-accent btn-sm">View Gear</Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* Category: Shoes */}
              <li className="nav-item">
                <Link href="/shop?category=shoes" className="nav-link">Shoes</Link>
              </li>

              {/* Category: Jerseys */}
              <li className="nav-item">
                <Link href="/shop?category=jerseys" className="nav-link">Jerseys</Link>
              </li>

              {/* Category: Bags */}
              <li className="nav-item">
                <Link href="/shop?category=bags" className="nav-link">Bags</Link>
              </li>

              {/* Category: Accessories */}
              <li className="nav-item">
                <Link href="/shop?category=accessories" className="nav-link">Accessories</Link>
              </li>

              {/* Segment Filtering: Men */}
              <li className="nav-item">
                <Link href="/shop?ageGroup=Men" className="nav-link">Men</Link>
              </li>

              {/* Segment Filtering: Women */}
              <li className="nav-item">
                <Link href="/shop?ageGroup=Women" className="nav-link">Women</Link>
              </li>

              {/* Segment Filtering: Kids */}
              <li className="nav-item">
                <Link href="/shop?ageGroup=Kids" className="nav-link">Kids</Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* 4. PINCODE CHECKER MODAL */}
      {showPinModal && (
        <div className="admin-modal-overlay" style={{ zIndex: 250 }}>
          <div className="admin-modal animate-slide-up" style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header">
              <h3>Delivery Pincode</h3>
              <button 
                type="button" 
                onClick={() => setShowPinModal(false)}
                style={{ color: 'var(--text-dark-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePincodeSubmit} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dark-muted)', lineHeight: '1.4' }}>
                Enter your pincode to check product delivery availability and estimated shipping times.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. 110001, 90210"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="form-control"
                  style={{ flexGrow: 1 }}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm">Verify</button>
              </div>
              {pincode && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid var(--bg-light-border)', paddingTop: '10px' }}>
                  <span>Currently: {pincode} ({pincodeStatus})</span>
                  <button 
                    type="button" 
                    className="text-danger" 
                    style={{ fontWeight: 600 }}
                    onClick={() => {
                      clearPincode();
                      setPinInput('');
                      setShowPinModal(false);
                    }}
                  >
                    Clear Location
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
