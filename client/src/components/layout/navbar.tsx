import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/hooks/useGuestCart";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart } from "lucide-react";
import { ShoppingCart as ShoppingCartComponent } from "@/components/shopping-cart";
import { useQuery } from "@tanstack/react-query";

// Custom event type for cart updates
const CART_UPDATE_EVENT = 'guest-cart-update';

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems: guestCartItems, getCartItemsCount } = useGuestCart();
  const [cartCount, setCartCount] = useState(0);

  // Get cart items for authenticated users
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  // Update cart count whenever items change
  useEffect(() => {
    const count = isAuthenticated 
      ? (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
      : getCartItemsCount();
    setCartCount(count);
  }, [cartItems, guestCartItems, isAuthenticated, getCartItemsCount]);

  // Listen for guest cart updates
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      if (!isAuthenticated) {
        const count = getCartItemsCount();
        setCartCount(count);
      }
    };

    window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate as EventListener);
    };
  }, [isAuthenticated, getCartItemsCount]);

  // Get display items based on auth state
  const displayItems = isAuthenticated ? cartItems : guestCartItems;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-700 cursor-pointer mr-8">SaaSCommerce</h1>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: 200 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Cart Icon and Auth Buttons */}
          <div className="flex items-center ml-8 gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setLocation("/cart-buyer")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
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

      {/* Shopping Cart Sidebar */}
      <ShoppingCartComponent
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={displayItems}
        isGuest={!isAuthenticated}
      />
    </header>
  );
} 