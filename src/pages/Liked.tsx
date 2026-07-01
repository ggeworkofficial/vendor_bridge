import { Link } from "react-router-dom";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { useFavorites } from "@/hooks/useFavorites";
import { InventoryProduct } from "@/types/inventory";

const Liked = () => {
  const { favorites, count } = useFavorites();

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                Liked Items
              </h1>
              <p className="text-muted-foreground">
                {count} {count === 1 ? "item" : "items"} liked
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </motion.div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((product, i) => {
              const likedProduct: InventoryProduct = {
                id: product.id,
                name: product.name,
                description: "",
                price: product.price,
                quantity: 0,
                verified: false,
                quality_label: "medium",
                images: [
                  { image_url: product.image, image_name: product.name },
                ],
                category: { id: "", name: "" },
                seller: { id: "", name: product.vendor },
                location: "",
                rating: 0,
                reviewCount: 0,
                posted_by: "vendor",
                approval_status: "approved",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              return (
                <ProductCard
                  key={product.id}
                  product={likedProduct}
                  index={i}
                />
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Liked Items Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start liking products by clicking the heart icon on any product.
              </p>
              <Button asChild>
                <Link to="/">
                  Start Browsing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Liked;
