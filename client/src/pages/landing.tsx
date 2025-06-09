import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart } from "@/components/shopping-cart";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGuestCart } from "@/hooks/useGuestCart";
import { X } from "lucide-react";

// Dummy products data with color variants (copied from storefront)
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

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SaaSCommerce Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The complete multi-tenant eCommerce solution for businesses. 
            Create your online store, manage products, and grow your business with our powerful platform.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
          >
            Get Started - Login with Email
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-store text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Tenant Stores</h3>
              <p className="text-gray-600">
                Create and manage multiple storefronts with custom domains and branding.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-secondary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-secondary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Passwordless Auth</h3>
              <p className="text-gray-600">
                Secure email OTP authentication with role-based access control.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-accent bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-line text-accent text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete eCommerce</h3>
              <p className="text-gray-600">
                Full shopping cart, checkout, order management, and analytics.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Perfect for Every Role
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-primary mb-3">Super Admin</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Manage all vendors and domains</li>
                <li>• Platform-wide analytics</li>
                <li>• Subscription management</li>
                <li>• User role control</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-secondary mb-3">Seller</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Product catalog management</li>
                <li>• Order processing</li>
                <li>• Sales analytics</li>
                <li>• Customer communication</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-accent mb-3">Buyer</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Browse multiple stores</li>
                <li>• Shopping cart & wishlist</li>
                <li>• Order tracking</li>
                <li>• Account management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
