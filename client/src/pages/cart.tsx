import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGuestCart } from "@/hooks/useGuestCart";
import { CheckoutModal } from "@/components/checkout-modal";
import { Link } from "wouter";

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { 
    cartItems: guestCartItems, 
    updateQuantity: updateGuestQuantity, 
    removeFromCart: removeFromGuestCart,
    getCartTotal: getGuestCartTotal,
    clearCart: clearGuestCart
  } = useGuestCart();

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const items = isAuthenticated ? cartItems : guestCartItems;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price);
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!isAuthenticated) {
      removeFromGuestCart(itemId);
      return;
    }

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      refetchCart();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) {
      updateGuestQuantity(itemId, quantity);
      return;
    }

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      refetchCart();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Store current URL to redirect back after login
      localStorage.setItem('redirect_after_login', '/cart');
      window.location.href = "/login";
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setIsCheckoutOpen(false);
    if (isAuthenticated) {
      // Refetch cart data for authenticated users
      refetchCart();
    } else {
      clearGuestCart();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Your cart is empty</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = "/storefront"}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {items.map((item) => (
                <Card key={item.id} className="mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.product?.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop"}
                        alt={item.product?.name || "Product"}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product?.name || "Product"}</h3>
                        <p className="text-sm text-gray-500">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                            disabled={(item.quantity || 0) <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, (item.quantity || 0) + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{(item.product?.price || 0).toFixed(2)} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>₹9.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%)</span>
                      <span>₹{(calculateTotal() * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{(calculateTotal() + 9.99 + (calculateTotal() * 0.08)).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleCheckout}
                    >
                      {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
                    </Button>
                    {!isAuthenticated && (
                      <p className="text-sm text-gray-500 text-center">
                        Please login to complete your purchase
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cartItems}
            onOrderComplete={handleOrderComplete}
          />
        )}
      </div>
    </div>
  );
} 