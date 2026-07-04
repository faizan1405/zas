'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Toast from 'src/components/Toast';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    storeName: 'Zassports',
    contactNumber: '8860654659',
    whatsappNumber: '918860654659',
    email: 'info@zassports.com',
    address: 'Main road, Deepak Vihar, near Indus Valley Public School, Khora Colony, Noida Sec 62, Uttar Pradesh - 201309',
    shippingCharges: 100,
    freeShippingMinAmount: 999,
    codEnabled: true,
    onlinePaymentEnabled: true,
    taxPercent: 12,
    gstDetails: '09AACCZ4143L1ZY',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://www.instagram.com/zas.india?igsh=MWx2cTk1Z2g3czZlNA%3D%3D&utm_source=qr',
      twitter: 'https://twitter.com',
      youtube: 'https://youtube.com/@brandedmalikboss?si=z7IYvk_dR1mPFkVH'
    }
  });
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'deliverable' | 'undeliverable'
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / snackbar notifications (used by cart actions)
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});
  const toastSeq = useRef(0);

  // 1. Initial mounting checks
  useEffect(() => {
    // Read local storage for guest session backups
    const localCart = localStorage.getItem('zas_cart');
    if (localCart) {
      try { setCart(JSON.parse(localCart)); } catch (e) {}
    }
    
    const localWishlist = localStorage.getItem('zas_wishlist');
    if (localWishlist) {
      try { setWishlist(JSON.parse(localWishlist)); } catch (e) {}
    }

    const localPincode = localStorage.getItem('zas_pincode');
    if (localPincode) {
      setPincode(localPincode);
      setPincodeStatus('deliverable'); // default mock check
    }

    // Load store settings, user details, and categories from APIs
    fetchSettings();
    fetchCategories();
    checkCurrentUser();
  }, []);

  // 2. Local storage syncing for Cart
  useEffect(() => {
    localStorage.setItem('zas_cart', JSON.stringify(cart));
  }, [cart]);

  // 3. Local storage syncing for Wishlist
  useEffect(() => {
    localStorage.setItem('zas_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Core API fetches
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.log('Error fetching store settings:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories.filter(c => c.isActive));
      }
    } catch (err) {
      console.log('Error fetching categories:', err);
    }
  };

  const checkCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        // If user logged in, sync remote cart/wishlist if available
        if (data.user.wishlist) {
          setWishlist(data.user.wishlist);
        }
      }
    } catch (err) {
      console.log('User session not logged in.');
    }
  };

  // Toast notification helpers ------------------------------------------------
  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
  };

  const showToast = (toast) => {
    const duration = toast.duration || 3500;
    // A dedupeKey gives a stable id so repeated clicks refresh the same toast
    // instead of stacking a new one each time.
    const id = toast.dedupeKey ? `k:${toast.dedupeKey}` : `t:${++toastSeq.current}`;

    setToasts((prev) => {
      let next = toast.dedupeKey
        ? prev.filter((t) => t.dedupeKey !== toast.dedupeKey)
        : prev.slice();
      next.push({ ...toast, id });
      // Never let more than 3 notifications stack up at once.
      const MAX_VISIBLE = 3;
      if (next.length > MAX_VISIBLE) {
        next = next.slice(next.length - MAX_VISIBLE);
      }
      return next;
    });

    // Reset the auto-dismiss timer (covers the refreshed-toast case too).
    if (toastTimers.current[id]) clearTimeout(toastTimers.current[id]);
    toastTimers.current[id] = setTimeout(() => dismissToast(id), duration);
  };

  const showCartToast = (product, alreadyInCart) => {
    const image =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : null;

    showToast({
      type: alreadyInCart ? 'info' : 'success',
      title: alreadyInCart
        ? 'Quantity updated in your cart'
        : 'Product added to cart successfully',
      name: product.name,
      image,
      dedupeKey: `cart-${product._id}`,
      duration: 3500,
      action: { label: 'View Cart', href: '/cart' },
    });
  };

  // Clear any pending timers when the provider unmounts.
  useEffect(() => {
    return () => {
      Object.values(toastTimers.current).forEach(clearTimeout);
      toastTimers.current = {};
    };
  }, []);

  // Cart operations
  const addToCart = (product, selectedVariant = {}, quantity = 1, options = {}) => {
    const { silent = false } = options;
    try {
      if (!product || !product._id) {
        if (!silent) {
          showToast({
            type: 'error',
            title: "Couldn't add to cart",
            message: 'Something went wrong. Please try again.',
            duration: 4000,
          });
        }
        return { success: false, alreadyInCart: false };
      }

      // Was this exact product + variant already in the cart? (drives the message)
      const alreadyInCart = cart.some(
        (item) =>
          item.product._id === product._id &&
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
      );

      setCart((prevCart) => {
        // Find matching item index by ID and variant parameters
        const existingIndex = prevCart.findIndex(
          (item) =>
            item.product._id === product._id &&
            JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        );

        if (existingIndex > -1) {
          const newCart = [...prevCart];
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + quantity,
          };
          return newCart;
        } else {
          return [...prevCart, { product, selectedVariant, quantity }];
        }
      });

      if (!silent) showCartToast(product, alreadyInCart);
      return { success: true, alreadyInCart };
    } catch (err) {
      console.log('Error adding to cart:', err);
      if (!silent) {
        showToast({
          type: 'error',
          title: "Couldn't add to cart",
          message: 'Something went wrong. Please try again.',
          duration: 4000,
        });
      }
      return { success: false, alreadyInCart: false };
    }
  };

  const removeFromCart = (productId, selectedVariant = {}) => {
    setCart((prevCart) => 
      prevCart.filter(
        (item) => 
          !(item.product._id === productId && 
            JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
      )
    );
  };

  const updateCartQty = (productId, selectedVariant = {}, qty) => {
    if (qty <= 0) {
      removeFromCart(productId, selectedVariant);
      return;
    }
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (
          item.product._id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        ) {
          return { ...item, quantity: qty };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = async (productId) => {
    // If not logged in, just toggle in local state
    let updatedWishlist = [];
    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(id => id !== productId);
    } else {
      updatedWishlist = [...wishlist, productId];
    }
    setWishlist(updatedWishlist);

    // If logged in, update remote database
    if (user) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        });
      } catch (err) {
        console.log('Error syncing wishlist to DB:', err);
      }
    }
  };

  // Pincode validation helper (Decathlon style checker)
  const verifyPincode = async (code) => {
    if (!code || !/^[1-9][0-9]{5}$/.test(code)) {
      setPincodeStatus('undeliverable');
      return false;
    }
    
    // Delivery to all over India is enabled for any valid 6-digit pincode
    setPincode(code);
    localStorage.setItem('zas_pincode', code);
    setPincodeStatus('deliverable');
    return true;
  };

  const clearPincode = () => {
    setPincode('');
    setPincodeStatus(null);
    localStorage.removeItem('zas_pincode');
  };

  // Authentication controllers
  const loginUser = (userData) => {
    setUser(userData);
    if (userData.wishlist) {
      setWishlist(userData.wishlist);
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setWishlist([]);
      localStorage.removeItem('zas_wishlist');
    } catch (err) {
      console.log('Error logging out:', err);
    }
  };

  return (
    <StoreContext.Provider value={{
      user,
      cart,
      wishlist,
      categories,
      settings,
      pincode,
      pincodeStatus,
      searchQuery,
      setSearchQuery,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      toggleWishlist,
      verifyPincode,
      clearPincode,
      loginUser,
      logoutUser,
      refreshUser: checkCurrentUser,
      showToast,
      dismissToast
    }}>
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
