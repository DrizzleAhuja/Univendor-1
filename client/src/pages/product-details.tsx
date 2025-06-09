import { useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { dummyProducts } from "./storefront-dummy-products";
import { X, ShoppingCart } from "lucide-react";
import { ShoppingCart as ShoppingCartComponent } from "@/components/shopping-cart";
import { CheckoutModal } from "@/components/checkout-modal";

interface ProductDetailsProps {
  id: string;
  name: string;
  price: number;
  mrp: number;
  description: string;
  colors: Array<{
    name: string;
    hex: string;
    image: string;
  }>;
  sizes: string[];
  vendor: string;
  rating: number;
  reviews: number;
}

export default function ProductDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { addToCart: addToGuestCart, cartItems: guestCartItems, removeFromCart: removeGuestCartItem, updateQuantity: updateGuestCartQuantity } = useGuestCart();
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string; image: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Get cart items for authenticated users
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  // Add to cart mutation for authenticated users
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          size: selectedSize,
          color: selectedColor?.name || selectedColor,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item added to cart",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Find the product from dummy data
  const product = [...dummyProducts.electronics, ...dummyProducts.fashion, ...dummyProducts.homeGarden]
    .find(p => p.id === id);

  if (!product) {
    return <div>Product not found</div>;
  }

  // Set initial color if not set
  if (!selectedColor && product.colors.length > 0) {
    setSelectedColor(product.colors[0]);
  }

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = () => {
    if (!selectedColor) {
      toast({
        title: "Error",
        description: "Please select a color",
        variant: "destructive",
      });
      return;
    }

    if (product.sizes && !selectedSize) {
      toast({
        title: "Error",
        description: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    if (isAuthenticated) {
      addToCartMutation.mutate();
    } else {
      addToGuestCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price.toString(),
        imageUrl: selectedColor.image,
        color: selectedColor.name,
        size: selectedSize,
        quantity: 1,
      });

      toast({
        title: "Success",
        description: "Item added to cart",
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // TODO: Navigate to checkout
  };

  // Calculate total items in cart
  const totalItems = isAuthenticated 
    ? (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
    : (guestCartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Get display items based on auth state
  const displayItems = isAuthenticated ? cartItems : guestCartItems;

  // Handle checkout
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
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  };

  // Remove item for guest cart
  const handleRemoveItem = (itemId: string) => {
    removeGuestCartItem(itemId);
  };

  // Update quantity for guest cart
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateGuestCartQuantity(itemId, quantity);
  };

  // Calculate total
  const calculateTotal = () => {
    if (!isAuthenticated) {
      return displayItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    }
    return displayItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Details Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={selectedColor?.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.colors.length > 1 && (
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      selectedColor?.name === color.name ? "border-primary scale-110" : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-lg text-gray-500">{product.vendor}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
              <span className="text-lg text-gray-500 line-through">₹{product.mrp}</span>
              <span className="text-sm font-medium text-green-600">{discount}% off</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star text-sm ${
                      i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor?.name === color.name ? "border-primary scale-110" : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Offers */}
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Available Offers</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <i className="fas fa-tag text-green-600 mt-1"></i>
                  <span>Special Price Get extra 10% off (price inclusive of discount)</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-tag text-green-600 mt-1"></i>
                  <span>Bank Offer 5% Cashback on Flipkart Axis Bank Card</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-tag text-green-600 mt-1"></i>
                  <span>Partner Offer Sign up for Flipkart Pay Later and get Flipkart Gift Card worth ₹100*</span>
                </li>
              </ul>
            </Card>

            {/* Delivery Info */}
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Delivery Options</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <i className="fas fa-truck text-green-600"></i>
                  <span>Free Delivery by Tomorrow</span>
                </p>
                <p className="flex items-center gap-2">
                  <i className="fas fa-undo text-green-600"></i>
                  <span>7 Days Replacement Policy</span>
                </p>
              </div>
            </Card>

            {/* Add to Cart and Buy Now Buttons */}
            <div className="flex gap-4">
              <Button 
                className="flex-1"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className={`text-sm text-gray-600 ${!showFullDescription && "line-clamp-3"}`}>
                {product.description}
              </p>
              <button
                className="text-sm text-primary hover:underline mt-1"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? "Show Less" : "Show More"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCartComponent
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={displayItems}
        isGuest={!isAuthenticated}
      />

      {/* Checkout Modal - Only show for authenticated users */}
      {isAuthenticated && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderComplete={handleOrderComplete}
          cartItems={displayItems}
          total={calculateTotal()}
        />
      )}
    </div>
  );
} 