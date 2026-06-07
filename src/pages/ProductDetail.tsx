import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, BadgeCheck, Star, MapPin, Clock, Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import QualityBadge from "@/components/QualityBadge";
import { useCart } from "@/lib/cart-context";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInventoryItem } from "@/api/inventory.api";
import { getReviews, createReview } from "@/api/review.api";
import { useInventoryStore } from "@/features/inventory/inventory.store";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const setSelectedProduct = useInventoryStore((state) => state.setSelectedProduct);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Reviews state
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewLimit] = useState(10);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isCreatingReview, setIsCreatingReview] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["inventory", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");
      const res = await getInventoryItem(id);
      return res.data;
    },
    enabled: !!id,
  });

  // Sync product to store
  React.useEffect(() => {
    if (product) {
      setSelectedProduct(product);
    }
  }, [product, setSelectedProduct]);

  // Fetch reviews when modal is open
  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", id, { page: reviewPage, limit: reviewLimit }],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");
      return await getReviews({ product_id: id, page: reviewPage, limit: reviewLimit });
    },
    enabled: isReviewsOpen && !!id,
  });

  const reviews = reviewsResponse?.data?.data ?? [];
  const reviewsMeta = reviewsResponse?.data?.meta;

  const handleCreateReview = async () => {
    if (!id) return;
    if (newRating < 1 || newRating > 5) {
      toast({ title: "Invalid rating", description: "Rating must be between 1 and 5.", variant: "destructive" });
      return;
    }
    setIsCreatingReview(true);
    try {
      await createReview({
        product_id: id,
        rating: newRating,
        comment: newComment.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", id] });
      toast({ title: "Review submitted", description: "Thank you for your review!" });
      setNewRating(5);
      setNewComment("");
    } catch (err) {
      toast({ title: "Submit failed", description: "Unable to submit review.", variant: "destructive" });
    } finally {
      setIsCreatingReview(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground text-lg">Product not found.</p>
          <Button asChild className="mt-4">
            <Link to="/">Back to Shop</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const productImage = product.images[0]?.image_url || "";

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop</Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-square bg-muted rounded-lg overflow-hidden"
        >
          <img
            src={productImage}
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
            <QualityBadge quality={product.quality_label} />
            {product.verified && (
              <Badge className="gap-1 bg-primary text-primary-foreground">
                <BadgeCheck className="h-3 w-3" /> Verified Product
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold">{product.name}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button
              onClick={() => setIsReviewsOpen(true)}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              {product.rating} ({product.reviewCount} reviews)
            </button>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {product.location}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last updated: {new Date(product.updated_at).toLocaleDateString()}
          </div>

          <div className="border-t pt-6">
            <div className="flex items-end gap-4 mb-6">
              <span className="text-4xl font-display font-bold">${Number(product.price).toFixed(2)}</span>
              <span className="text-sm text-muted-foreground mb-1">Cash on Delivery available</span>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    qualityLabel: product.quality_label,
                    verified: product.verified,
                    images: [productImage],
                    category: product.category.name,
                    location: product.location,
                    lastUpdated: product.updated_at,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                  })
                }
                className="flex-1"
              >
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
      
      {/* Reviews Dialog */}
      <Dialog open={isReviewsOpen} onOpenChange={(open) => { if (!open) { setIsReviewsOpen(false); setReviewPage(1); } }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Product Reviews</DialogTitle></DialogHeader>
          <div className="space-y-6">
            {/* Reviews List */}
            <div className="space-y-4">
              <h4 className="font-medium">Reviews</h4>
              {reviewsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{review.user.name}</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                      {review.comment && <p className="text-sm">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
              {reviewsMeta && reviewsMeta.total > reviewsMeta.limit && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => setReviewPage((p) => p + 1)} disabled={reviewPage * reviewsMeta.limit >= reviewsMeta.total}>
                    Load More
                  </Button>
                </div>
              )}
            </div>
            
            {/* Create Review Form */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Write a Review</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setNewRating(rating)}
                        className="p-1 hover:bg-accent rounded transition-colors"
                      >
                        <Star className={`h-6 w-6 ${rating <= newRating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Comment (Optional)</Label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateReview} disabled={isCreatingReview} className="w-full">
                  {isCreatingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsReviewsOpen(false); setReviewPage(1); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetail;
