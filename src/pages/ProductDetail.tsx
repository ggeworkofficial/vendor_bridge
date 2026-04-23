import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, BadgeCheck, Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import QualityBadge from "@/components/QualityBadge";
import { mockProducts } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import { motion } from "framer-motion";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground text-lg">Product not found.</p>
          <Button asChild className="mt-4"><Link to="/">Back to Shop</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop</Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-square bg-muted rounded-lg overflow-hidden"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              width={640}
              height={640}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-2">
              <QualityBadge quality={product.qualityLabel} />
              {product.verified && (
                <Badge className="gap-1 bg-primary text-primary-foreground">
                  <BadgeCheck className="h-3 w-3" /> Verified Product
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold">{product.name}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-secondary text-secondary" />
                {product.rating} ({product.reviewCount} reviews)
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {product.location}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last updated: {product.lastUpdated}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-end gap-4 mb-6">
                <span className="text-4xl font-display font-bold">${product.price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground mb-1">Cash on Delivery available</span>
              </div>

              <div className="flex gap-3">
                <Button size="lg" onClick={() => addItem(product)} className="flex-1">
                  <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/cart">View Cart</Link>
                </Button>
              </div>
            </div>

            <div className="bg-accent rounded-lg p-4 text-sm text-accent-foreground">
              <p className="font-semibold mb-1">🛡️ VendorBridge Trust Guarantee</p>
              <p>This product is sourced and verified by our quality team. We handle all pricing, listing, and order fulfillment.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
