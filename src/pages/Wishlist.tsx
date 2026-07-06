import { Link } from "react-router-dom";
import { Bookmark, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";
import { InventoryProduct } from "@/types/inventory";

const Wishlist = () => {
  const favorites = useWishlistStore((state) => state.items);
  const count = useWishlistStore((state) => state.count());

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Bookmark className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                My Wishlist
              </h1>
              <p className="text-muted-foreground">
                {count} {count === 1 ? "item" : "items"} saved for later
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

        {/* Wishlist Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((product, i) => {
              const wishlistProduct: InventoryProduct = {
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
                category: { id: "", name: product.category || "" },
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
                  product={wishlistProduct}
                  index={i}
                />
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Your Wishlist is Empty
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start saving products by clicking the bookmark icon on any product.
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

export default Wishlist;