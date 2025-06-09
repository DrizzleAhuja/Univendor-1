import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart } from "@/components/shopping-cart";
import { CheckoutModal } from "@/components/checkout-modal";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGuestCart } from "@/hooks/useGuestCart";
import { X, ShoppingCart as ShoppingCartIcon } from "lucide-react";

// Dummy products data with color variants
const dummyProducts = {
  electronics: [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 199.99,
      description: "Premium noise-cancelling headphones",
      colors: [
        { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" },
        { name: "White", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=300" },
        { name: "Rose Gold", hex: "#B76E79", image: "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=300" },
      ],
      vendor: "TechPro",
      rating: 4.5,
      reviews: 128,
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 299.99,
      description: "Advanced fitness tracking and notifications",
      colors: [
        { name: "Space Gray", hex: "#2F2F2F", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300" },
        { name: "Silver", hex: "#C0C0C0", image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300" },
      ],
      vendor: "TechPro",
      rating: 4.8,
      reviews: 245,
    },
  ],
  fashion: [
    {
      id: 3,
      name: "Premium Cotton T-Shirt",
      price: 29.99,
      description: "Comfortable and stylish everyday wear",
      sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
      colors: [
        { name: "Navy", hex: "#000080", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300" },
        { name: "White", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=300" },
        { name: "Gray", hex: "#808080", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300" },
        { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300" },
        { name: "Red", hex: "#FF0000", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300" },
        { name: "Blue", hex: "#0000FF", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300" },
      ],
      vendor: "FashionStyle",
      rating: 4.3,
      reviews: 89,
    },
    {
      id: 4,
      name: "Designer Jeans",
      price: 79.99,
      description: "Premium denim with perfect fit",
      sizes: ["28", "30", "32", "34", "36", "38"],
      colors: [
        { name: "Dark Blue", hex: "#00008B", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300" },
        { name: "Light Blue", hex: "#ADD8E6", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300" },
        { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=300" },
      ],
      vendor: "FashionStyle",
      rating: 4.6,
      reviews: 156,
    },
  ],
  homeGarden: [
    {
      id: 5,
      name: "Modern Table Lamp",
      price: 89.99,
      description: "Elegant design with ambient lighting",
      colors: [
        { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300" },
        { name: "Gold", hex: "#FFD700", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300" },
      ],
      vendor: "HomeDecor",
      rating: 4.4,
      reviews: 67,
    },
    {
      id: 6,
      name: "Indoor Plant Set",
      price: 49.99,
      description: "Set of 3 low-maintenance plants",
      colors: [
        { name: "White Pot", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300" },
        { name: "Terra Cotta", hex: "#E2725B", image: "https://images.unsplash.com/photo-1459156212016-306b6ae9a720?w=300" },
      ],
      vendor: "HomeDecor",
      rating: 4.7,
      reviews: 92,
    },
  ],
};

function ProductCard({ product, onGuestAddToCart, guestAddToCart }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSize) {
        throw new Error("Please select a size");
      }
      if (!selectedColor) {
        throw new Error("Please select a color");
      }

      if (isAuthenticated) {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
            size: selectedSize,
            color: selectedColor.name || selectedColor,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add item to cart");
        }

        return response.json();
      } else {
        // Handle guest cart
        const guestCartItem = {
          id: Math.random().toString(36).substr(2, 9),
          productId: product.id.toString(),
          quantity: 1,
          size: selectedSize,
          color: selectedColor.name || selectedColor,
          name: product.name,
          price: product.price.toString(),
          imageUrl: product.imageUrl || selectedColor.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop"
        };
        guestAddToCart(guestCartItem);
        if (onGuestAddToCart) onGuestAddToCart();
        return { success: true };
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item added to cart",
      });
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setError("Please select both size and color before adding to cart");
      toast({
        title: "Selection Required",
        description: "Please select both size and color before adding to cart",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate();
  };

  return (
    <Card className="group overflow-hidden">
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <img
          src={selectedColor.image}
          alt={product.name}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-center space-x-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg">
            {product.colors.map((color) => (
              <button
                key={color.name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor.name === color.name ? 'border-primary scale-110' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: color.hex }}
                onMouseEnter={() => setSelectedColor(color)}
                onClick={() => setSelectedColor(color)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.vendor}</p>
          </div>
          <span className="font-bold text-primary">${product.price}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        
        {/* Size Selection */}
        {product.sizes && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                    ${selectedSize === size 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection Label */}
        {product.colors && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Color: {selectedColor.name}
            </label>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
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
            <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
          </div>
          <Button 
            onClick={handleAddToCart} 
            size="sm"
            variant={!selectedSize || !selectedColor ? "outline" : "default"}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Storefront() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { cartItems: guestCartItems, addToCart: addToGuestCart, removeFromCart: removeGuestCartItem, updateQuantity: updateGuestCartQuantity } = useGuestCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("electronics");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [search, setSearch] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  // Optimistic update for logged-in cart
  const [optimisticCart, setOptimisticCart] = useState<any[]>([]);
  // Use optimistic cart if logged in, else use items from query
  const displayItems = isAuthenticated ? (optimisticCart.length ? optimisticCart : cartItems) : guestCartItems;

  // Sync optimistic cart with backend after mutation
  const syncCart = async () => {
    setOptimisticCart([]);
    await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  };

  // Cart mutations for logged-in users
  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: number) => {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove item");
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
        description: err.message || "Failed to remove item",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update quantity");
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
        description: err.message || "Failed to update quantity",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  // For logged-in users: remove item in local state, then backend
  const handleRemoveLoggedIn = (itemId: number|string) => {
    const idNum = Number(itemId);
    removeFromCartMutation.mutate(idNum);
  };

  // For logged-in users: update quantity in local state, then backend
  const handleUpdateQuantityLoggedIn = (itemId: number|string, quantity: number) => {
    const idNum = Number(itemId);
    updateQuantityMutation.mutate({ cartItemId: idNum, quantity });
  };

  const totalItems = displayItems.reduce((sum, item) => sum + item.quantity, 0);

  // Flatten all products for search
  const allProducts = [
    ...dummyProducts.electronics,
    ...dummyProducts.fashion,
    ...dummyProducts.homeGarden,
  ];

  // Filter products by search
  const filteredProducts = search.trim()
    ? allProducts.filter((product) =>
        product.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : null;

  // If searching, show all categories with filtered products; else, show by selected category
  const showProducts = search.trim()
    ? filteredProducts
    : dummyProducts[selectedCategory];

  // If searching and no products found
  const noProductsFound = search.trim() && (!filteredProducts || filteredProducts.length === 0);

  // Calculate totals for logged-in users
  const calculateTotal = () => {
    if (!isAuthenticated) {
      return displayItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    }
    return displayItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  // Handle checkout modal
  const handleCheckout = () => setIsCheckoutOpen(true);
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

  // After login or cart migration, always refetch cart and clear optimistic cart
  useEffect(() => {
    if (isAuthenticated) {
      setOptimisticCart([]);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Flipkart-style Navbar with Cart Icon */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-700 cursor-pointer mr-8">SaaSCommerce</h1>
            </Link>
            {/* Search Bar */}
            <div className="flex-1 flex justify-center">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minWidth: 200 }}
              />
            </div>
            {/* Cart Icon and Auth Buttons */}
            <div className="flex items-center ml-8 gap-4">
              {/* Cart Icon Button */}
              <button
                className="relative p-2 rounded hover:bg-gray-100 transition"
                onClick={() => setIsCartOpen(true)}
                aria-label="View Cart"
              >
                <ShoppingCartIcon className="h-6 w-6 text-blue-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = "/api/logout"}
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => window.location.href = "/login"}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* No products found message */}
      {noProductsFound && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-6 text-center text-lg font-semibold">
            No product like this found
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-[70vh] bg-cover bg-center"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920')"
          }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
              <h1 className="text-6xl font-bold mb-4 animate-fade-in">Premium Marketplace</h1>
              <p className="text-xl mb-8 animate-fade-in-delay">Discover amazing products from top vendors</p>
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 animate-fade-in-delay-2"
                onClick={() => {
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Only show category tabs if not searching */}
        {!search.trim() && (
          <Tabs defaultValue={selectedCategory} value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Shop by Category</h2>
              <TabsList className="grid w-full max-w-2xl grid-cols-3 gap-4">
                <TabsTrigger value="electronics" className="py-3">
                  <i className="fas fa-laptop mr-2"></i>
                  Electronics
                </TabsTrigger>
                <TabsTrigger value="fashion" className="py-3">
                  <i className="fas fa-tshirt mr-2"></i>
                  Fashion
                </TabsTrigger>
                <TabsTrigger value="homeGarden" className="py-3">
                  <i className="fas fa-home mr-2"></i>
                  Home & Garden
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        )}
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {showProducts && showProducts.length > 0 && showProducts.map((product) => (
            <ProductCard key={product.id} product={product} onGuestAddToCart={() => setIsCartOpen(true)} guestAddToCart={addToGuestCart} />
          ))}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <div className={`w-96 bg-white border-l border-gray-200 fixed right-0 top-0 h-full transform transition-transform duration-300 ease-in-out z-50 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Shopping Cart ({totalItems} items)</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {displayItems.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg items-center">
                  <img
                    src={isAuthenticated ? (item.product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop") : item.imageUrl}
                    alt={isAuthenticated ? item.product.name : item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{isAuthenticated ? item.product.name : item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="p-1 border rounded"
                        onClick={() => {
                          if (item.quantity > 1) {
                            if (isAuthenticated) {
                              handleUpdateQuantityLoggedIn(item.id, item.quantity - 1);
                            } else {
                              handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1));
                            }
                          }
                        }}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="p-1 border rounded"
                        onClick={() => {
                          if (isAuthenticated) {
                            handleUpdateQuantityLoggedIn(item.id, item.quantity + 1);
                          } else {
                            handleUpdateQuantity(item.id, item.quantity + 1);
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-medium">
                      {isAuthenticated
                        ? `₹${(item.product.price * item.quantity).toFixed(2)}`
                        : `$${(parseFloat(item.price) * item.quantity).toFixed(2)}`}
                    </p>
                    <button
                      className="text-red-500 text-xs mt-2"
                      onClick={() => {
                        if (isAuthenticated) {
                          handleRemoveLoggedIn(item.id);
                        } else {
                          handleRemoveItem(item.id);
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Cart Summary and Checkout */}
            <div className="p-4 border-t">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>{isAuthenticated ? `₹${calculateTotal().toFixed(2)}` : `$${calculateTotal().toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>{isAuthenticated ? `₹9.99` : `$9.99`}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Tax (8%)</span>
                <span>{isAuthenticated ? `₹${(calculateTotal() * 0.08).toFixed(2)}` : `$${(calculateTotal() * 0.08).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>{isAuthenticated ? `₹${(calculateTotal() + 9.99 + (calculateTotal() * 0.08)).toFixed(2)}` : `$${(calculateTotal() + 9.99 + (calculateTotal() * 0.08)).toFixed(2)}`}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={displayItems}
          onOrderComplete={handleOrderComplete}
        />
      </div>
    </div>
  );
}
