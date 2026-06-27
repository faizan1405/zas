'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  PhoneCall, 
  X,
  ChevronDown,
  Menu
} from 'lucide-react';
import { useStore } from 'src/context/StoreContext';

const Header = () => {
  const router = useRouter();
  const { 
    user, 
    cart, 
    wishlist, 
    logoutUser,
    searchQuery,
    setSearchQuery,
    categories
  } = useStore();


  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Cart total quantities
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/shop');
    }
    setShowMobileSearch(false);
  };



  const activeCategories = categories.filter(c => c.isActive);

  return (
    <>
      {/* 1. TOP OFFER BAR */}
      <div className="offer-bar">
        🏏 SHIPPED ALL OVER INDIA | CASH ON DELIVERY AVAILABLE | 7 DAYS EASY RETURN & EXCHANGE 🏏
      </div>

      <header className="main-header">
        <div className="container">
          {/* 2. MAIN HEADER ROW (DESKTOP) */}
          <div className="header-top desktop-only-flex">
            {/* Logo */}
            <Link href="/" className="logo">
              ZAS<span>SPORTS</span>
            </Link>

            {/* Large Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-bar-container">
              <input
                type="text"
                placeholder="Search bats, balls, gloves, shoes, protective gear..."
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


              {/* Support */}
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

              {/* Authentication Portal */}
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

                {user && showUserDropdown && (
                  <div 
                    className="user-dropdown-menu" 
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <Link 
                      href={user.role === 'admin' ? '/admin' : '/account'} 
                      className="dropdown-link"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      {user.role === 'admin' ? 'Admin Dashboard' : 'My Account'}
                    </Link>
                    {user.role !== 'admin' && (
                      <Link 
                        href="/account#orders" 
                        className="dropdown-link"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        My Orders
                      </Link>
                    )}
                    <button 
                      type="button" 
                      className="dropdown-link text-danger" 
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

          {/* 3. MOBILE HEADER ROW */}
          <div className="header-top mobile-only-flex">
            <button 
              type="button" 
              className="mobile-menu-trigger" 
              onClick={() => setShowMobileMenu(true)}
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>

            <Link href="/" className="logo">
              ZAS<span>SPORTS</span>
            </Link>

            <div className="header-actions">
              <button 
                type="button" 
                className="mobile-action-btn"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search size={22} />
              </button>
              <Link href="/wishlist" className="mobile-action-btn position-relative">
                <Heart size={22} />
                {wishlist.length > 0 && <span className="icon-badge">{wishlist.length}</span>}
              </Link>
              <Link href="/cart" className="mobile-action-btn position-relative">
                <ShoppingBag size={22} />
                {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* 4. SECONDARY NAVIGATION (DESKTOP) */}
        <nav className="nav-bar desktop-only-flex">
          <div className="container">
            <ul className="nav-links">
              <li className="nav-item">
                <Link href="/shop?category=cricket-bats" className="nav-link">Cricket Bats</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=cricket-balls" className="nav-link">Cricket Balls</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=cricket-gloves" className="nav-link">Cricket Gloves</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=cricket-pads" className="nav-link">Cricket Pads</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=cricket-helmets" className="nav-link">Cricket Helmets</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=running-shoes" className="nav-link">Running Shoes</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=cricket-shoes" className="nav-link">Cricket Shoes</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=dry-fit-t-shirts" className="nav-link">Dry-Fit T-Shirts</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=track-pants" className="nav-link">Track Pants</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=sports-socks" className="nav-link">Sports Socks</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=badminton-rackets" className="nav-link">Badminton Rackets</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=shuttlecocks" className="nav-link">Shuttlecocks</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=footballs" className="nav-link">Footballs</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=football-shoes" className="nav-link">Football Shoes</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=yoga-mats" className="nav-link">Yoga Mats</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=skipping-ropes" className="nav-link">Skipping Ropes</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=resistance-bands" className="nav-link">Resistance Bands</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=dumbbells" className="nav-link">Dumbbells</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=gym-gloves" className="nav-link">Gym Gloves</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?category=kit-bags" className="nav-link">Kit Bags</Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Mobile Search Bar Toggle Dropdown */}
        {showMobileSearch && (
          <div className="mobile-search-dropdown animate-slide-down">
            <div className="container">
              <form onSubmit={handleSearchSubmit} className="search-bar-container">
                <input
                  type="text"
                  placeholder="Search cricket gear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  autoFocus
                />
                <button type="submit" className="search-btn" aria-label="Search">
                  <Search size={18} />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* 5. MOBILE NAVIGATION CATEGORY DRAWER */}
      {showMobileMenu && (
        <>
          <div className="drawer-overlay" style={{ zIndex: 199 }} onClick={() => setShowMobileMenu(false)} />
          <div className="mobile-category-drawer animate-fade" style={{ zIndex: 200 }}>
            <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 20px', borderBottom: '1px solid var(--bg-light-border)' }}>
              <span className="logo">ZAS<span>SPORTS</span></span>
              <button type="button" onClick={() => setShowMobileMenu(false)}>
                <X size={22} />
              </button>
            </div>
            
            <div className="drawer-body" style={{ padding: '20px 0', overflowY: 'auto', height: 'calc(100% - 70px)' }}>
              <div className="drawer-section">
                <h4 className="drawer-section-title">Sports Categories</h4>
                <ul className="drawer-menu-links">
                  <li>
                    <Link href="/shop" onClick={() => setShowMobileMenu(false)}>
                      All Sports Catalog
                    </Link>
                  </li>
                  {activeCategories.map(cat => (
                    <li key={cat._id}>
                      <Link href={`/shop?category=${cat.slug}`} onClick={() => setShowMobileMenu(false)}>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="drawer-section" style={{ borderTop: '1px solid var(--bg-light-border)', paddingTop: '20px', marginTop: '20px' }}>
                <h4 className="drawer-section-title">Shop by Segment</h4>
                <ul className="drawer-menu-links">
                  <li>
                    <Link href="/shop?ageGroup=Men" onClick={() => setShowMobileMenu(false)}>
                      Men's Section
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?ageGroup=Women" onClick={() => setShowMobileMenu(false)}>
                      Women's Section
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?ageGroup=Kids" onClick={() => setShowMobileMenu(false)}>
                      Kids' Section
                    </Link>
                  </li>
                </ul>
              </div>



              <div className="drawer-section" style={{ borderTop: '1px solid var(--bg-light-border)', paddingTop: '20px', marginTop: '20px' }}>
                <h4 className="drawer-section-title">User Account</h4>
                <ul className="drawer-menu-links">
                  {user ? (
                    <>
                      <li>
                        <Link href={user.role === 'admin' ? '/admin' : '/account'} onClick={() => setShowMobileMenu(false)}>
                          {user.role === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                        </Link>
                      </li>
                      <li>
                        <button 
                          type="button" 
                          className="text-danger" 
                          style={{ width: '100%', textAlign: 'left', fontWeight: 'bold', padding: '12px 20px' }}
                          onClick={() => {
                            logoutUser();
                            setShowMobileMenu(false);
                          }}
                        >
                          Sign Out
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link href="/login" onClick={() => setShowMobileMenu(false)}>
                        Sign In / Register
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/contact" onClick={() => setShowMobileMenu(false)}>
                      Contact Support
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}


    </>
  );
};

export default Header;
