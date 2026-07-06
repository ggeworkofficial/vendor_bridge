import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  Package,
  Heart,
  Clock,
  Bookmark,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";
import { useCart } from "@/lib/cart-context";
import { useInventoryStore } from "@/features/inventory/inventory.store";
import { useFavoritesStore } from "@/features/favorites/favorites.store";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";
import { InventoryProduct } from "@/types/inventory";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const inventory = useInventoryStore((state) => state.inventory);
  const savedCount = useFavoritesStore((state) => state.count());
  const favorites = useFavoritesStore((state) => state.favorites);
  const wishlistCount = useWishlistStore((state) => state.count());
  const wishlistItems = useWishlistStore((state) => state.items);
  const [recPage, setRecPage] = useState(1);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;
  
  const getCategory = (id: string) =>
    inventory.find((p) => p.id === id)?.category?.name;

  const likedCategories = favorites.map((f) => getCategory(f.id)).filter(Boolean);
  const wishlistCategories = wishlistItems.map((w) => getCategory(w.id)).filter(Boolean);
  
  const interestedCategories = [...new Set([...likedCategories, ...wishlistCategories])];

  // Build recommendations: match categories, exclude already liked/wishlisted, shuffle, take 4
  const likedIds = new Set(favorites.map((f) => f.id));
  const wishlistIds = new Set(wishlistItems.map((w) => w.id));
  const excludedIds = new Set([...likedIds, ...wishlistIds]);

  const ITEMS_PER_PAGE = 8;

  const allRecommendations = interestedCategories.length > 0
    ? inventory
        .filter((p) => 
          interestedCategories.includes(p.category?.name) &&
          !excludedIds.has(p.id)
        )
        .sort(() => Math.random() - 0.5)
    : inventory
        .filter((p) => !excludedIds.has(p.id))
        .sort(() => Math.random() - 0.5);

  const recommendations = allRecommendations.slice(0, recPage * ITEMS_PER_PAGE);
  const hasMoreRecs = recommendations.length < allRecommendations.length;

  const recentlyViewed = inventory.slice(4, 8);

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome back, {user.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link to="/cart" className="block">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{itemCount}</p>
                    <p className="text-xs text-muted-foreground">Cart Items</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </Card>
          <Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link to="/orders" className="block">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Package className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </Card>
          <Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link to="/liked" className="block">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{savedCount}</p>
                    <p className="text-xs text-muted-foreground">Liked Items</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </Card>
          <Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link to="/orders" className="block">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <Link to="/wishlist" className="block">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Bookmark
                    className={cn(
                      "h-5 w-5 text-yellow-500",
                      wishlistCount > 0 && "fill-yellow-500",
                    )}
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold">{wishlistCount}</p>
                  <p className="text-xs text-muted-foreground">My Wishlist</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/cart">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Cart
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/orders">
              <Package className="mr-2 h-4 w-4" />
              My Orders
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/profile">View Profile</Link>
          </Button>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Recently Viewed
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">See All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewed.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}

{/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Recommended for You
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">Browse All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            {hasMoreRecs && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={() => setRecPage(p => p + 1)}>
                  Load More
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
