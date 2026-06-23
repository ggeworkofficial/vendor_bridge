import { useState } from "react";
import { Check, X, Eye, Loader2, Search, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory, updateInventory } from "@/api/inventory.api";
import { useToast } from "@/hooks/use-toast";
import type { InventoryProduct, ProductApprovalStatus } from "@/types/inventory";

const ProductApprovalSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductApprovalStatus | "all">("all");
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
  });

  const allProducts = inventoryData?.data?.data ?? [];
  const vendorProducts = allProducts.filter((p) => p.posted_by === "vendor");

  const approveMutation = useMutation({
    mutationFn: (id: string) => updateInventory(id, { approval_status: "approved" }),
    onSuccess: () => {
      toast({ title: "Product Approved", description: "Product has been approved and is now live." });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve product.", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      updateInventory(id, { approval_status: "rejected" } as any),
    onSuccess: () => {
      toast({ title: "Product Rejected", description: "Product has been rejected." });
      setRejectDialogOpen(false);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject product.", variant: "destructive" });
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = () => {
    if (selectedProduct && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedProduct.id, reason: rejectionReason.trim() });
    }
  };

  const openViewDialog = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const openRejectDialog = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setRejectDialogOpen(true);
  };

  const filteredProducts = vendorProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.seller.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<ProductApprovalStatus, string> = {
    draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    pending_review: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Product Approvals</h2>
          <p className="text-muted-foreground">Review and approve vendor-posted products</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name or seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products List */}
      <div className="bg-card border rounded-lg">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No vendor products found.
          </div>
        ) : (
          <div className="divide-y">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <img
                      src={product.images[0]?.image_url || ""}
                      alt={product.name}
                      className="w-20 h-20 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge className={statusColors[product.approval_status]}>{product.approval_status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Seller:</span> {product.seller.name}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> ${product.price.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {product.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Quality:</span> {product.quality_label}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-muted-foreground">Location:</span>{" "}
                        <span className="text-foreground">{product.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openViewDialog(product)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {product.approval_status === "pending_review" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(product.id)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openRejectDialog(product)}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-48 h-48 rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.images[0]?.image_url || ""}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Label>Product Name</Label>
                    <p className="font-medium">{selectedProduct.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price</Label>
                      <p>${selectedProduct.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <p>{selectedProduct.quantity}</p>
                    </div>
                    <div>
                      <Label>Quality Label</Label>
                      <p>{selectedProduct.quality_label}</p>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <p>{selectedProduct.location}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Seller</Label>
                    <p>{selectedProduct.seller.name}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p>{selectedProduct.category.name}</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedProduct.description}</p>
              </div>
              <div>
                <Label>Images</Label>
                <div className="flex gap-2 mt-1">
                  {selectedProduct.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.image_url}
                      alt={`Image ${idx + 1}`}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this product. This will be sent to the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this product is being rejected..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Rejecting...</>
              ) : (
                "Reject Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductApprovalSection;
