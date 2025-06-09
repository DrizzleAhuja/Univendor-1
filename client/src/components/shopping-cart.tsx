import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useAuth } from "@/hooks/useAuth";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  isGuest?: boolean;
}

export function ShoppingCart({ isOpen, onClose, cartItems = [], isGuest = false }: ShoppingCartProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { updateQuantity: updateGuestQuantity, removeFromCart: removeFromGuestCart, getCartTotal: getGuestCartTotal } = useGuestCart();

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/cart/${cartItemId}`, { quantity });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update cart item");
      }
      return response.json();
    },
    onMutate: async ({ cartItemId, quantity }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/cart"] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(["/api/cart"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["/api/cart"], (old: any) =>
        old.map((item: any) =>
          Number(item.id) === cartItemId ? { ...item, quantity } : item
        )
      );

      // Return a context object with the snapshotted value
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["/api/cart"], context?.previousCart);
      toast({
        title: "Error",
        description: err.message || "Failed to update cart item",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (cartItemId: number) => {
      const response = await apiRequest("DELETE", `/api/cart/${cartItemId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove item from cart");
      }
      return response.json();
    },
    onMutate: async (cartItemId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/cart"] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(["/api/cart"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["/api/cart"], (old: any) => 
        old.filter((item: any) => Number(item.id) !== cartItemId)
      );

      // Return a context object with the snapshotted value
      return { previousCart };
    },
    onError: (err, cartItemId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["/api/cart"], context?.previousCart);
      toast({
        title: "Error",
        description: err.message || "Failed to remove item from cart",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const handleUpdateQuantity = (item: any, newQuantity: number) => {
    if (isGuest) {
      updateGuestQuantity(item.id, newQuantity);
    } else {
      updateQuantityMutation.mutate({ cartItemId: Number(item.id), quantity: newQuantity });
    }
  };

  const handleRemoveItem = (item: any) => {
    if (isGuest) {
      removeFromGuestCart(item.id);
    } else {
      removeItemMutation.mutate(Number(item.id));
    }
  };

  const total = isGuest 
    ? getGuestCartTotal()
    : cartItems.reduce((sum, item) => sum + ((item?.product?.price ? parseFloat(item.product.price) : 0) * (item?.quantity || 0)), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-xl">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-none">
            <div className="flex justify-between items-center">
              <CardTitle>Shopping Cart</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-600">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b border-gray-200 pb-4">
                    <img 
                      src={item?.product?.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop"}
                      alt={item?.product?.name || "Product"}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item?.product?.name || "Product"}</h4>
                      <p className="text-sm text-gray-600">₹{item?.product?.price || "0.00"}</p>
                      {item?.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      {item?.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                      <div className="flex items-center space-x-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateQuantity(item, Math.max(1, (item.quantity || 1) - 1))}
                          disabled={updateQuantityMutation.isPending || (item.quantity || 0) <= 1}
                        >
                          <i className="fas fa-minus"></i>
                        </Button>
                        <span className="px-3 py-1 bg-gray-100 rounded">{item.quantity || 0}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateQuantity(item, (item.quantity || 0) + 1)}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <i className="fas fa-plus"></i>
                        </Button>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveItem(item)}
                      disabled={removeItemMutation.isPending}
                    >
                      <i className="fas fa-trash text-red-500"></i>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {cartItems && cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
              </div>
              {isGuest ? (
                <div className="space-y-4">
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      // Store current URL to redirect back after login
                      localStorage.setItem('redirect_after_login', '/cart');
                      window.location.href = "/login";
                    }}
                  >
                    Login to Checkout
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Please login to complete your purchase
                  </p>
                </div>
              ) : (
                <Button 
                  className="w-full"
                  size="lg"
                  onClick={() => window.location.href = "/buyer/cart"}
                >
                  Proceed to Checkout
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
