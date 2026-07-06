import { Link } from "react-router-dom";
import {
  ShoppingCart,
  BadgeCheck,
  Star,
  MapPin,
  Store,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryProduct } from "@/types/inventory";
import { useCart } from "@/lib/cart-context";
import { motion } from "framer-motion";
import { TrustBadge } from "./TrustBadge";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/features/favorites/favorites.store";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";

const ProductCard = ({
  product,
  index = 0,
}: {
  product: InventoryProduct;
  index?: number;
}) => {
  const { addItem } = useCart();

  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const saved = isFavorite(product.id);
  
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const bookmarked = isInWishlist(product.id);

  const productImage = product.images[0]?.image_url || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            src={productImage}
            alt={product.name}
            loading="lazy"
            width={640}
            height={640}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <TrustBadge
              postedBy={product.posted_by}
              sellerName={product.seller.name}
              className="text-xs"
            />
          </div>
          {/* Heart button — MUST be inside the relative container above */}
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: productImage,
                vendor: product.seller.name,
                category: product.category.name,
              }}
              size="sm"
            />
          </div>
        </div>{" "}
        {/* ← closes relative aspect-square */}
      </Link>
      <div className="p-4 space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
            <span>{product.rating}</span>
          </div>
          <span>·</span>
          <span>{product.reviewCount} reviews</span>
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide",
              product.quality_label === "high"
                ? "bg-emerald-500/15 text-emerald-400"
                : product.quality_label === "medium"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-red-500/15 text-red-400",
            )}
          >
            {product.quality_label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{product.location}</span>
        </div>
        {product.posted_by === "vendor" && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Store className="h-3 w-3" />
            <span className="truncate">{product.seller.name}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <span className="text-lg font-display font-bold">
              ${Number(product.price).toFixed(2)}
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  product.quantity <= 5 && product.quantity > 0
                    ? "border-destructive text-destructive bg-destructive/10"
                    : product.quantity <= 10 && product.quantity > 0
                      ? "border-warning text-warning bg-warning/10"
                      : product.quantity > 0
                        ? "border-success text-success bg-success/10"
                        : "border-muted text-muted-foreground",
                )}
              >
                {product.quantity > 0
                  ? `${product.quantity} in stock`
                  : "Out of stock"}
              </Badge>
              {product.quantity <= 5 && product.quantity > 0 && (
                <span className="text-[10px] text-destructive font-medium">
                  Low stock
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-8 w-8 transition-colors",
                bookmarked
                  ? "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600"
                  : "hover:text-yellow-500 hover:border-yellow-400",
              )}
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: productImage,
                  vendor: product.seller.name,
                });
              }}
            >
              <Bookmark
                className={cn("h-4 w-4", bookmarked && "fill-current")}
              />
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                addItem({
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  qualityLabel: product.quality_label,
                  verified: product.verified,
                  images: [product.images[0]?.image_url || ""],
                  category: product.category.name,
                  location: product.location,
                  lastUpdated: product.updated_at,
                  rating: product.rating,
                  reviewCount: product.reviewCount,
                });
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
