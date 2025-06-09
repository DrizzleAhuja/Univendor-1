import { useState, useEffect, useCallback } from 'react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  imageUrl: string;
  color?: string;
  size?: string;
  quantity: number;
}

// Create a custom event for cart updates
const CART_UPDATE_EVENT = 'guest-cart-update';

export function useGuestCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load from localStorage if available
    try {
      const stored = localStorage.getItem('guest_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage and dispatch event on change
  useEffect(() => {
    localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    // Dispatch custom event when cart changes
    window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT, { detail: cartItems }));
  }, [cartItems]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent<CartItem[]>) => {
      setCartItems(event.detail);
    };

    window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate as EventListener);
    };
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems(prevItems => {
      // Check if item already exists with same color and size
      const existingItemIndex = prevItems.findIndex(
        existingItem => 
          existingItem.productId === item.productId && 
          existingItem.color === item.color && 
          existingItem.size === item.size
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return updatedItems;
      }

      // Add new item if it doesn't exist
      const newItems = [...prevItems, { ...item, id: Math.random().toString(36).substr(2, 9) }];
      // Force immediate update
      setTimeout(() => {
        setCartItems([...newItems]);
      }, 0);
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      // Force immediate update
      setTimeout(() => {
        setCartItems([...newItems]);
      }, 0);
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      // Force immediate update
      setTimeout(() => {
        setCartItems([...newItems]);
      }, 0);
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  }, [cartItems]);

  const getCartItemsCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  };
} 