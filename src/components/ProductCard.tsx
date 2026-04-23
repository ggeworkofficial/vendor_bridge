import { Link } from "react-router-dom";
import { ShoppingCart, BadgeCheck, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { motion } from "framer-motion";

const qualityColors: Record<string, string> = {
  high: "bg-success text-success-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-destructive text-destructive-foreground",
};

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addItem } = useCart();

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
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={640}
            height={640}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge className={qualityColors[product.qualityLabel] + " text-xs"}>
              {product.qualityLabel}
            </Badge>
            {product.verified && (
              <Badge variant="secondary" className="gap-1 text-xs bg-primary text-primary-foreground">
                <BadgeCheck className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
        </div>
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
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{product.location}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-display font-bold">${product.price.toFixed(2)}</span>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
