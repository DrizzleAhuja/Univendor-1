import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dummyProducts } from "./storefront-dummy-products";

function ProductCard({ product }: { product: any }) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/product/${product.id}`);
  };

  return (
    <div 
      className="group relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.colors[0].image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.vendor}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          <div className="flex items-center">
            <i className="fas fa-star text-yellow-400 mr-1"></i>
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Storefront() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Categories */}
      <Tabs defaultValue="electronics" className="mb-8">
        <TabsList>
          <TabsTrigger value="electronics">Electronics</TabsTrigger>
          <TabsTrigger value="fashion">Fashion</TabsTrigger>
          <TabsTrigger value="homeGarden">Home & Garden</TabsTrigger>
        </TabsList>
        <TabsContent value="electronics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dummyProducts.electronics.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="fashion">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dummyProducts.fashion.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="homeGarden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dummyProducts.homeGarden.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
