import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { CheckoutModal } from "@/components/checkout-modal";
import { ShoppingCart } from "@/components/shopping-cart";

export default function Cart() {
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ["/api/cart"],
  });

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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setIsCheckoutOpen(false);
    refetchCart();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {cartItems.length === 0 ? (
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
              {cartItems.map((item) => (
                <Card key={item.id} className="mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop"}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantityMutation.mutate({
                                  cartItemId: item.id,
                                  quantity: item.quantity - 1
                                });
                              }
                            }}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateQuantityMutation.mutate({
                                cartItemId: item.id,
                                quantity: item.quantity + 1
                              });
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{item.product.price} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCartMutation.mutate(item.id)}
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

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          onOrderComplete={handleOrderComplete}
        />
      </div>
    </DashboardLayout>
  );
} 