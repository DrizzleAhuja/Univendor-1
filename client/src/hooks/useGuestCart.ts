import { useState, useEffect } from 'react';

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

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('guest_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
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
      return [...prevItems, { ...item, id: Math.random().toString(36).substr(2, 9) }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };
} 