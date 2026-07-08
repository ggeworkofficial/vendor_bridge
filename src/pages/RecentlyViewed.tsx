import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Trash2, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { useRecentlyViewedStore } from "@/features/recently-viewed/recentlyViewed.store";
import { useInventoryStore } from "@/features/inventory/inventory.store";

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const items = useRecentlyViewedStore((state) => state.items);
  const clearHistory = useRecentlyViewedStore((state) => state.clearHistory);
  const removeView = useRecentlyViewedStore((state) => state.removeView);
  const inventory = useInventoryStore((state) => state.inventory);

  const viewedProducts = items.map((item) => {
    const product = inventory.find((p) => p.id === item.id);
    return { item, product };
  });

  return (
    <Layout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                <Clock className="h-6 w-6 text-muted-foreground" />
                Recently Viewed
              </h1>
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"} in your
                history
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Clear your entire browsing history?")) {
                  clearHistory();
                }
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          )}
        </motion.div>

        {/* Empty state */}
        {viewedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-4"
          >
            <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">No recently viewed items</h2>
            <p className="text-muted-foreground">
              Products you browse will appear here.
            </p>
            <Button asChild>
              <Link to="/">Start Browsing</Link>
            </Button>
          </motion.div>
        )}

        {/* Product grid */}
        {viewedProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {viewedProducts.map(({ item, product }, index) => {
              if (!product) {
                // Ghost card for deleted/unavailable product
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card rounded-lg border overflow-hidden opacity-60"
                  >
                    <div className="relative aspect-square bg-muted flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-40"
                        />
                      ) : null}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <PackageX className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium px-4 text-center">
                          Removed from inventory or no longer available
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-display font-semibold text-sm line-clamp-1 text-muted-foreground">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        ${Number(item.price).toFixed(2)} ·{" "}
                        {new Date(item.viewedAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => removeView(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </motion.div>
                );
              }

              return (
                <ProductCard key={product.id} product={product} index={index} />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecentlyViewed;
