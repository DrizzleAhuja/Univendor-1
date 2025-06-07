import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function BuyerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => 
    sum + parseFloat(order.total), 0
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Account</h2>
          <p className="text-gray-600">View your orders, cart, and account settings</p>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                  <i className="fas fa-shopping-bag text-primary text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cart Items</p>
                  <p className="text-3xl font-bold text-gray-900">{cartItems.length}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <i className="fas fa-shopping-cart text-orange-600 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded-lg">
                  <i className="fas fa-dollar-sign text-secondary text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Order History</CardTitle>
              <Link href="/storefront">
                <Button variant="outline" size="sm">
                  <i className="fas fa-shopping-cart mr-2"></i>
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-600 mb-4">No orders yet. Start shopping!</p>
                <Link href="/storefront">
                  <Button>Browse Stores</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'shipped' ? 'outline' :
                          'destructive'
                        }
                        className="text-sm px-3 py-1"
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <img 
                              src={item.product?.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&h=60&fit=crop"} 
                              alt={item.product?.name || "Product"}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product?.name}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}
                              </p>
                              {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                              {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                            </div>
                            <p className="font-semibold text-gray-900">
                              ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Vendor: {order.vendor?.name}</p>
                          {order.shippingAddress && (
                            <p className="text-sm text-gray-600">
                              Shipping to: {order.shippingAddress.address}, {order.shippingAddress.city}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-xl font-bold text-gray-900">₹{parseFloat(order.total).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <i className="fas fa-eye mr-2"></i>
                        View Details
                      </Button>
                      {order.status === 'shipped' && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <i className="fas fa-truck mr-2"></i>
                          Track Package
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <i className="fas fa-redo mr-2"></i>
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
