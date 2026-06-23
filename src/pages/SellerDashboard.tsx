import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Plus, Edit, Trash2, Eye, BarChart3, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";
import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/api/inventory.api";
import type { InventoryProduct } from "@/types/inventory";

const SellerDashboard = () => {
  const user = useAuth((state) => state.user);
  const [activeTab, setActiveTab] = useState("products");

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
    enabled: !!user?.id,
  });

  const products = inventoryData?.data?.data ?? [];

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.approval_status === "approved").length,
    pendingReview: products.filter((p) => p.approval_status === "pending_review").length,
    totalSales: products.reduce((sum, p) => sum + (p.quantity || 0), 0),
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and track your sales</p>
          </div>
          <Button asChild>
            <Link to="/seller/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-display font-bold mt-1">{stats.totalProducts}</p>
          </div>
          <div className="bg-card border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Active Products</p>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-display font-bold mt-1 text-success">{stats.activeProducts}</p>
          </div>
          <div className="bg-card border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-display font-bold mt-1 text-warning">{stats.pendingReview}</p>
          </div>
          <div className="bg-card border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-display font-bold mt-1">{stats.totalSales}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="bg-card border rounded-lg">
              <div className="p-6 border-b">
                <h3 className="font-display font-semibold">My Products</h3>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't listed any products yet.</p>
                  <Button asChild>
                    <Link to="/seller/products/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                      <img
                        src={product.images[0]?.image_url || ""}
                        alt={product.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              product.approval_status === "approved"
                                ? "default"
                                : product.approval_status === "pending_review"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {product.approval_status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Qty: {product.quantity}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/product/${product.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/seller/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-display font-semibold mb-4">Orders</h3>
              <p className="text-muted-foreground">Order management coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-display font-semibold mb-4">Analytics</h3>
              <p className="text-muted-foreground">Analytics dashboard coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-display font-semibold mb-4">Settings</h3>
              <p className="text-muted-foreground">Settings panel coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
