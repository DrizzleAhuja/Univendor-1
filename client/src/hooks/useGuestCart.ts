import { useState, useEffect } from 'react';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  name: string;
  imageUrl: string;
  size?: string;
  color?: string;
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
    setCartItems(prevItems => [
      ...prevItems,
      { ...item, id: Math.random().toString(36).substr(2, 9) }
    ]);
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
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
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