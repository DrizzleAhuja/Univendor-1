import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useGuestCart } from "@/hooks/useGuestCart";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCartIcon } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Get cart items for both authenticated and guest users
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { cartItems: guestCartItems } = useGuestCart();
  const displayItems = isAuthenticated ? cartItems : guestCartItems;
  const totalItems = displayItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

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
            <button
              className="relative p-2 rounded hover:bg-gray-100 transition"
              aria-label="View Cart"
              onClick={() => setLocation('/cart-buyer')}
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

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
    </header>
  );
} 