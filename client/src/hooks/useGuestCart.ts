import { useState } from 'react';

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => 
        i.productId === item.productId && 
        i.size === item.size && 
        i.color === item.color
      );

      if (existingItem) {
        return prevItems.map(i => 
          i.productId === item.productId && 
          i.size === item.size && 
          i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prevItems, item];
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