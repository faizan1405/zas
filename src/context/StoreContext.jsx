'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    storeName: 'Apex Cricket',
    contactNumber: '+1 (555) 123-4567',
    whatsappNumber: '+15551234567',
    email: 'support@apexcricket.com',
    address: '123 Cricket Stadium Road, Sports City',
    shippingCharges: 10,
    freeShippingMinAmount: 100,
    codEnabled: true,
    onlinePaymentEnabled: true,
    taxPercent: 12,
  });
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'deliverable' | 'undeliverable'
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Initial mounting checks
  useEffect(() => {
    // Read local storage for guest session backups
    const localCart = localStorage.getItem('apex_cart');
    if (localCart) {
      try { setCart(JSON.parse(localCart)); } catch (e) {}
    }
    
    const localWishlist = localStorage.getItem('apex_wishlist');
    if (localWishlist) {
      try { setWishlist(JSON.parse(localWishlist)); } catch (e) {}
    }

    const localPincode = localStorage.getItem('apex_pincode');
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
    localStorage.setItem('apex_cart', JSON.stringify(cart));
  }, [cart]);

  // 3. Local storage syncing for Wishlist
  useEffect(() => {
    localStorage.setItem('apex_wishlist', JSON.stringify(wishlist));
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
      const res = await fetch('/api/categories');
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

  // Cart operations
  const addToCart = (product, selectedVariant = {}, quantity = 1) => {
    setCart((prevCart) => {
      // Find matching item index by ID and variant parameters
      const existingIndex = prevCart.findIndex(
        (item) => 
          item.product._id === product._id && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { product, selectedVariant, quantity }];
      }
    });
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
    if (!code || code.length < 5) {
      setPincodeStatus('undeliverable');
      return false;
    }
    
    // Simulate pincode checker
    // In India/US: standard regex match. Let's make digits 1-8 deliverable, 9/0 undeliverable
    const firstDigit = code.charAt(0);
    const isValid = ['1', '2', '3', '4', '5', '6', '7', '8'].includes(firstDigit);
    
    setPincode(code);
    localStorage.setItem('apex_pincode', code);

    if (isValid) {
      setPincodeStatus('deliverable');
      return true;
    } else {
      setPincodeStatus('undeliverable');
      return false;
    }
  };

  const clearPincode = () => {
    setPincode('');
    setPincodeStatus(null);
    localStorage.removeItem('apex_pincode');
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
      localStorage.removeItem('apex_wishlist');
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
      refreshUser: checkCurrentUser
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
