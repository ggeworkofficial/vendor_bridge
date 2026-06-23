import { useParams } from "react-router-dom";
import { MapPin, Star, Package, Clock, Calendar, CheckCircle2, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/api/inventory.api";
import { TrustBadge } from "@/components/TrustBadge";
import ProductCard from "@/components/ProductCard";

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
  });

  const allProducts = inventoryData?.data?.data ?? [];
  const sellerProducts = allProducts.filter((p: any) => p.seller.id === id);
  
  // Mock seller data - in real app, this would come from API
  const seller = {
    id: id || "",
    name: sellerProducts[0]?.seller?.name || "Seller Name",
    location: sellerProducts[0]?.location || "Addis Ababa, Ethiopia",
    rating: 4.5,
    reviewCount: 128,
    totalProducts: sellerProducts.length,
    joinDate: "2024-01-15",
    responseTime: "2 hours",
    verified: true,
    description: "Quality products sourced directly from local suppliers. We specialize in authentic Ethiopian goods with a focus on traditional craftsmanship and modern design.",
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Seller Header */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <Store className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-display font-bold">{seller.name}</h1>
                {seller.verified && (
                  <Badge className="gap-1 bg-primary text-primary-foreground">
                    <CheckCircle2 className="h-3 w-3" /> Verified Seller
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span>{seller.rating}</span>
                  <span>({seller.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{seller.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{seller.totalProducts} products</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">{seller.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(seller.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Response time: {seller.responseTime}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Contact Seller</Button>
              <Button>Follow</Button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-xl font-display font-semibold mb-4">Products by {seller.name}</h2>
          {sellerProducts.length === 0 ? (
            <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
              This seller hasn't listed any products yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sellerProducts.map((product: any, index: number) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SellerProfile;
