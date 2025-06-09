import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/hooks/useGuestCart";
import { CheckoutModal } from "@/components/checkout-modal";

export default function CartBuyer() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
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

  const displayItems = isAuthenticated ? cartItems : guestCartItems;
  const totalItems = displayItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: number) => {
      await apiRequest("DELETE", `/api/cart/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${cartItemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const handleRemoveItem = (itemId: string | number) => {
    if (isAuthenticated) {
      removeFromCartMutation.mutate(Number(itemId));
    } else {
      removeFromGuestCart(String(itemId));
    }
  };

  const handleUpdateQuantity = (itemId: string | number, quantity: number) => {
    if (isAuthenticated) {
      updateQuantityMutation.mutate({ cartItemId: Number(itemId), quantity });
    } else {
      updateGuestQuantity(String(itemId), quantity);
    }
  };

  const calculateTotal = () => {
    if (isAuthenticated) {
      return displayItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
    }
    return getGuestCartTotal();
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Store current URL to redirect back after login
      localStorage.setItem('redirect_after_login', '/cart-buyer');
      window.location.href = "/login";
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setIsCheckoutOpen(false);
    if (isAuthenticated) {
      refetchCart();
    } else {
      clearGuestCart();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      {displayItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Your cart is empty</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = "/"}
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {displayItems.map((item) => (
              <Card key={item.id} className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={isAuthenticated ? item.product.imageUrl : item.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop"}
                      alt={isAuthenticated ? item.product.name : item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {isAuthenticated ? item.product.name : item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{isAuthenticated 
                          ? (Number(item.product.price) * item.quantity).toFixed(2)
                          : (parseFloat(item.price) * item.quantity).toFixed(2)
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{isAuthenticated 
                          ? Number(item.product.price).toFixed(2)
                          : parseFloat(item.price).toFixed(2)
                        } each
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
                    Proceed to Checkout
                  </Button>
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
          cartItems={displayItems}
          onOrderComplete={handleOrderComplete}
        />
      )}
    </div>
  );
} 