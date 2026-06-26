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
                <Link href="/shop" className="nav-link">All Sports</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?ageGroup=Men" className="nav-link">Men</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?ageGroup=Women" className="nav-link">Women</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop?ageGroup=Kids" className="nav-link">Kids</Link>
              </li>
              <li className="nav-item">
                <Link href="/shop" className="nav-link">Cricket Gear</Link>
              </li>

              {/* Mega-menu Cricket Bats */}
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
                      <h4 className="mega-col-title">Wood Subcategories</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-bats&subcategory=english-willow-bat">English Willow</Link></li>
                        <li><Link href="/shop?category=cricket-bats&subcategory=kashmir-willow-bat">Kashmir Willow</Link></li>
                        <li><Link href="/shop?category=cricket-bats&subcategory=tennis-cricket-bat">Tennis Cricket</Link></li>
                        <li><Link href="/shop?category=cricket-bats&subcategory=kids-cricket-bat">Kids Bats</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mega-col-title">Bat Sizes</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-bats&size=Short+Handle">Short Handle (SH)</Link></li>
                        <li><Link href="/shop?category=cricket-bats&size=Long+Handle">Long Handle (LH)</Link></li>
                        <li><Link href="/shop?category=cricket-bats&size=Size+6">Size 6</Link></li>
                        <li><Link href="/shop?category=cricket-bats&size=Size+5">Size 5</Link></li>
                      </ul>
                    </div>
                    <div className="mega-promo-card">
                      <h4>English Willow Bats</h4>
                      <p>Premium grade bats handselected for ultimate ping performance.</p>
                      <Link href="/shop?category=cricket-bats" className="btn btn-accent btn-sm">Shop Bats</Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* Mega-menu Cricket Balls */}
              <li className="nav-item">
                <Link href="/shop?category=cricket-balls" className="nav-link">Cricket Balls</Link>
                <div className="mega-menu">
                  <div className="container mega-grid">
                    <div>
                      <h4 className="mega-col-title">Ball Type</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-balls&subcategory=leather-ball">Leather Balls</Link></li>
                        <li><Link href="/shop?category=cricket-balls&subcategory=tennis-ball">Tennis Balls</Link></li>
                        <li><Link href="/shop?category=cricket-balls&subcategory=practice-ball">Practice Balls</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mega-col-title">Color Options</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-balls&color=Red">Red Match Ball</Link></li>
                        <li><Link href="/shop?category=cricket-balls&color=White">White Match Ball</Link></li>
                        <li><Link href="/shop?category=cricket-balls&color=Pink">Pink Match Ball</Link></li>
                      </ul>
                    </div>
                    <div className="mega-promo-card" style={{ gridColumn: 'span 3' }}>
                      <h4>Seam & Bounce</h4>
                      <p>Four-piece leather match balls stitched to perfection. Available in standard weight parameters.</p>
                      <Link href="/shop?category=cricket-balls" className="btn btn-accent btn-sm">Shop Balls</Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* Cricket Shoes */}
              <li className="nav-item">
                <Link href="/shop?category=cricket-shoes" className="nav-link">Cricket Shoes</Link>
                <div className="mega-menu">
                  <div className="container mega-grid">
                    <div>
                      <h4 className="mega-col-title">Sole Type</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-shoes&subcategory=rubber-shoes">Rubber Sole Studs</Link></li>
                        <li><Link href="/shop?category=cricket-shoes&subcategory=spiked-shoes">Metal Spikes</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mega-col-title">Size Options</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=cricket-shoes&size=US+8">US 8</Link></li>
                        <li><Link href="/shop?category=cricket-shoes&size=US+9">US 9</Link></li>
                        <li><Link href="/shop?category=cricket-shoes&size=US+10">US 10</Link></li>
                      </ul>
                    </div>
                    <div className="mega-promo-card" style={{ gridColumn: 'span 3' }}>
                      <h4>Extreme Turf Traction</h4>
                      <p>Run fast, bowl hard, and slide safely with rubber spikes and steel grip shoes.</p>
                      <Link href="/shop?category=cricket-shoes" className="btn btn-accent btn-sm">Browse Shoes</Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* Accessories */}
              <li className="nav-item">
                <Link href="/shop?category=accessories" className="nav-link">Accessories</Link>
                <div className="mega-menu">
                  <div className="container mega-grid">
                    <div>
                      <h4 className="mega-col-title">Grips & Mallets</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=accessories&subcategory=bat-grips">Bat Grips</Link></li>
                        <li><Link href="/shop?category=accessories&subcategory=bat-mallet">Bat Mallets</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mega-col-title">Pitch Gear</h4>
                      <ul className="mega-links">
                        <li><Link href="/shop?category=training-equipment&subcategory=stumps">Wooden Stumps</Link></li>
                        <li><Link href="/shop?category=training-equipment&subcategory=grip-cone">Grip Cones</Link></li>
                      </ul>
                    </div>
                    <div className="mega-promo-card" style={{ gridColumn: 'span 3' }}>
                      <h4>Essential Training Kits</h4>
                      <p>From bat cones to stumps and grip protection packs, keep your kit complete.</p>
                      <Link href="/shop?category=accessories" className="btn btn-accent btn-sm">Shop Accessories</Link>
                    </div>
                  </div>
                </div>
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
