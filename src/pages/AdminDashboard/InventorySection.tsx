import { useState, useEffect } from "react";
import { Package, Search, Plus, Eye, Edit, Trash2, Image as ImageIcon, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseDialog, AppDialogHeader, AppDialogFooter, AppDialogSection } from "@/components/ui/app-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInventory, getInventoryItem, updateInventory, deleteInventory, createInventory } from "@/api/inventory.api";
import { getProductImages, updateProductImage } from "@/api/product-image.api";
import { getReviews, deleteReview } from "@/api/review.api";
import { useInventoryStore } from "@/features/inventory/inventory.store";
import { useToast } from "@/hooks/use-toast";
import { keepPreviousData } from "@tanstack/react-query";

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    high: "bg-destructive text-destructive-foreground",
    medium: "bg-warning text-warning-foreground",
    low: "bg-muted text-muted-foreground",
  };
  return <Badge className={`text-xs ${styles[priority] || ""}`}>{priority}</Badge>;
};

const InventorySection = () => {
  const [search, setSearch] = useState("");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editQuality, setEditQuality] = useState("medium");
  const [editVerified, setEditVerified] = useState(false);
  const [editLocation, setEditLocation] = useState("");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Product Image Viewer state
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  
  // Admin Review View state
  const [isReviewsViewOpen, setIsReviewsViewOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewLimit] = useState(10);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const setInventory = useInventoryStore((state) => state.setInventory);
  const selectedProduct = useInventoryStore((state) => state.selectedProduct);
  const setSelectedProduct = useInventoryStore((state) => state.setSelectedProduct);
  const updateProduct = useInventoryStore((state) => state.updateProduct);
  const deleteProduct = useInventoryStore((state) => state.deleteProduct);

  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPrice, setCreatePrice] = useState(0);
  const [createQuantity, setCreateQuantity] = useState(0);
  const [createQuality, setCreateQuality] = useState("medium");
  const [createCategoryId, setCreateCategoryId] = useState("");
  const [createSellerId, setCreateSellerId] = useState("");
  const [createLocation, setCreateLocation] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createImages, setCreateImages] = useState<File[]>([]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useInventory = (params: any) => {
    return useQuery({
      queryKey: ["inventory", params],
      queryFn: async () => await getInventory(params),
      placeholderData: keepPreviousData,
    });
  };

  const verifiedParam = verifiedFilter === "all" ? undefined : verifiedFilter;
  const qualityParam = qualityFilter === "all" ? undefined : qualityFilter;
  const response = useInventory({
    page,
    limit,
    search,
    ...(qualityParam ? { quality_label: qualityParam } : {}),
    ...(verifiedParam ? { verified: verifiedParam } : {}),
  });

  const inventory = response.data?.data?.data ?? [];
  const meta = response.data?.data?.meta;

  const loadSelectedProduct = async (id: string) => {
    try {
      const { data } = await getInventoryItem(id);
      setSelectedProduct(data);
      setEditName(data.name);
      setEditDescription(data.description);
      setEditPrice(data.price);
      setEditQuantity(data.quantity);
      setEditQuality(data.quality_label);
      setEditVerified(!!data.verified);
      setEditLocation(data.location);
      setIsViewOpen(true);
    } catch (error) {
      toast({
        title: "Unable to load product",
        description: "Failed to fetch the selected product details.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setCreateImages(Array.from(e.target.files));
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", createName);
      formData.append("description", createDescription);
      formData.append("price", String(createPrice));
      formData.append("quantity", String(createQuantity));
      formData.append("quality_label", createQuality);
      formData.append("verified", "false");
      formData.append("category_id", createCategoryId);
      formData.append("seller_id", createSellerId);
      formData.append("location", createLocation);
      createImages.forEach((file) => {
        formData.append("images", file);
      });
      await createInventory(formData);
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Product created" });
      setIsCreateOpen(false);
    } catch (err) {
      toast({ title: "Create failed", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      const { data } = await updateInventory(selectedProduct.id, {
        name: editName,
        description: editDescription,
        price: editPrice,
        quantity: editQuantity,
        quality_label: editQuality as any,
        verified: editVerified,
        location: editLocation,
      });
      await getInventoryItem(selectedProduct.id);
      updateProduct(data);
      setSelectedProduct(data);
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Product updated", description: "Inventory item saved successfully." });
      setIsViewOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to save product changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteInventory(productToDelete);
      deleteProduct(productToDelete);
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Product removed", description: "Inventory item deleted successfully." });
    } catch (error) {
      toast({ title: "Delete failed", description: "Unable to delete the product.", variant: "destructive" });
    } finally {
      setProductToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleViewImages = async () => {
    if (!selectedProduct) return;
    try {
      const { data } = await getProductImages({ product_id: selectedProduct.id });
      setProductImages(data.data || []);
      setIsImageViewerOpen(true);
    } catch (error) {
      toast({ title: "Unable to load images", description: "Failed to fetch product images.", variant: "destructive" });
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    setIsSettingPrimary(true);
    try {
      await updateProductImage(imageId, { is_primary: true });
      // Reload images
      if (selectedProduct) {
        const { data } = await getProductImages({ product_id: selectedProduct.id });
        setProductImages(data.data || []);
      }
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Primary image updated" });
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to set primary image.", variant: "destructive" });
    } finally {
      setIsSettingPrimary(false);
    }
  };

  const handleViewReviews = async () => {
    if (!selectedProduct) return;
    try {
      const { data } = await getReviews({ product_id: selectedProduct.id, page: reviewPage, limit: reviewLimit });
      setReviews(data.data || []);
      setIsReviewsViewOpen(true);
    } catch (error) {
      toast({ title: "Unable to load reviews", description: "Failed to fetch product reviews.", variant: "destructive" });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setIsDeletingReview(true);
    try {
      await deleteReview(reviewId);
      // Reload reviews
      if (selectedProduct) {
        const { data } = await getReviews({ product_id: selectedProduct.id, page: reviewPage, limit: reviewLimit });
        setReviews(data.data || []);
      }
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Review deleted" });
    } catch (error) {
      toast({ title: "Delete failed", description: "Unable to delete review.", variant: "destructive" });
    } finally {
      setIsDeletingReview(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, qualityFilter, verifiedFilter]);

  useEffect(() => {
    setInventory(inventory);
  }, [inventory, setInventory]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={qualityFilter} onValueChange={setQualityFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quality</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verification</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={product.images?.[0]?.image_url || '../assets/placeholder.png'} alt={product.name} className="h-10 w-10 rounded object-cover" />
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.location}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{product.category.name}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{product.seller.name}</TableCell>
                <TableCell className="font-medium">${Number(product.price).toFixed(2)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell><PriorityBadge priority={product.quality_label} /></TableCell>
                <TableCell>{product.verified ? <Badge className="bg-success/10 text-success text-xs">Verified</Badge> : <Badge variant="outline" className="text-xs">Pending</Badge>}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadSelectedProduct(product.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadSelectedProduct(product.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { loadSelectedProduct(product.id); setTimeout(() => handleViewReviews(), 100); }}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setProductToDelete(product.id); setIsDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {meta && meta.total > meta.limit && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Prev</Button>
            <span>Page {meta.page} of {Math.ceil(meta.total / meta.limit)}</span>
            <Button disabled={page * meta.limit >= meta.total} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        )}
      </div>
      <BaseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} maxWidth="2xl">
        <AppDialogHeader title="Create Product" subtitle="Add a new inventory item to the system" />
        <AppDialogSection title="Product Images">
          <div className="space-y-1">
            <Label>Images</Label>
            <Input type="file" multiple accept="image/*" onChange={handleImageChange} />
            {createImages.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {createImages.map((file, i) => (
                  <div key={i} className="text-xs px-2 py-1 bg-muted rounded">{file.name}</div>
                ))}
              </div>
            )}
          </div>
        </AppDialogSection>
        <AppDialogSection title="Product Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1"><Label>Name</Label><Input value={createName} onChange={(e) => setCreateName(e.target.value)} /></div>
            <div className="col-span-2 space-y-1"><Label>Description</Label><Textarea value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} /></div>
            <div className="space-y-1"><Label>Price</Label><Input type="number" value={createPrice} onChange={(e) => setCreatePrice(Number(e.target.value))} /></div>
            <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={createQuantity} onChange={(e) => setCreateQuantity(Number(e.target.value))} /></div>
            <div className="space-y-1"><Label>Quality</Label><Select value={createQuality} onValueChange={setCreateQuality}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label>Category ID</Label><Input value={createCategoryId} onChange={(e) => setCreateCategoryId(e.target.value)} /></div>
            <div className="space-y-1"><Label>Seller ID</Label><Input value={createSellerId} onChange={(e) => setCreateSellerId(e.target.value)} /></div>
            <div className="col-span-2 space-y-1"><Label>Location</Label><Input value={createLocation} onChange={(e) => setCreateLocation(e.target.value)} /></div>
          </div>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsCreateOpen(false) }}
          primaryAction={{
            label: "Create Product",
            onClick: handleCreate,
            disabled: isCreating,
            loading: isCreating
          }}
        />
      </BaseDialog>
      <BaseDialog open={isViewOpen} onOpenChange={setIsViewOpen} maxWidth="2xl">
        <AppDialogHeader title="Product Details" />
        {selectedProduct ? (
          <div className="space-y-4">
            <AppDialogSection title="Product Preview">
              <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img src={selectedProduct.images?.[0]?.image_url || '../assets/placeholder.png'} alt={selectedProduct.name} className="w-full h-64 object-cover" />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Name</p><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Description</p><Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} /></div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><p className="text-sm text-muted-foreground">Price</p><Input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} /></div>
                    <div className="space-y-1"><p className="text-sm text-muted-foreground">Quantity</p><Input type="number" value={editQuantity} onChange={(e) => setEditQuantity(Number(e.target.value))} /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label>Quality</Label><Select value={editQuality} onValueChange={(value) => setEditQuality(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select></div>
                    <div><Label>Verified</Label><Select value={editVerified.toString()} onValueChange={(value) => setEditVerified(value === "true")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Verified</SelectItem><SelectItem value="false">Unverified</SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Location</p><Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} /></div>
                </div>
              </div>
            </AppDialogSection>
            <AppDialogSection title="Additional Information">
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div><p><strong>Category</strong></p><p>{selectedProduct.category?.name ?? ""}</p></div>
                <div><p><strong>Seller</strong></p><p>{selectedProduct.seller?.name ?? ""}</p></div>
                <div><p><strong>Location</strong></p><p>{selectedProduct.location ?? ""}</p></div>
                <div><p><strong>Rating</strong></p><p>{selectedProduct.rating ?? ""}</p></div>
                <div><p><strong>Review Count</strong></p><p>{selectedProduct.reviewCount ?? ""}</p></div>
                <div><p><strong>Created At</strong></p><p>{selectedProduct.created_at ?? ""}</p></div>
                <div><p><strong>Updated At</strong></p><p>{selectedProduct.updated_at || ""}</p></div>
              </div>
            </AppDialogSection>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading product details...</p>
        )}
        <AppDialogFooter
          secondaryAction={{ label: "Close", onClick: () => setIsViewOpen(false) }}
          primaryAction={{
            label: "Save Changes",
            onClick: handleSave,
            disabled: isSaving || !selectedProduct,
            loading: isSaving
          }}
        />
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={handleViewImages} className="flex-1">
            <ImageIcon className="h-4 w-4 mr-2" />
            View Images
          </Button>
        </div>
      </BaseDialog>
      <BaseDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} maxWidth="md">
        <AppDialogHeader title="Delete Product" subtitle="Are you sure you want to delete this inventory item?" />
        <AppDialogSection>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsDeleteOpen(false) }}
          primaryAction={{
            label: "Delete",
            onClick: handleDelete,
            variant: "destructive"
          }}
        />
      </BaseDialog>
      
      {/* Product Image Viewer Dialog */}
      <BaseDialog open={isImageViewerOpen} onOpenChange={(open) => { if (!open) { setIsImageViewerOpen(false); setProductImages([]); } }} maxWidth="4xl">
        <AppDialogHeader title="Product Images" />
        {productImages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No images for this product.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {productImages.map((image) => (
              <div key={image.id} className="border rounded-lg p-3 space-y-2">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={image.image_url} alt={image.image_name} className="w-full h-full object-cover" />
                  {image.is_primary && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Primary
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground truncate">{image.image_name}</p>
                  {!image.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleSetPrimaryImage(image.id)}
                      disabled={isSettingPrimary}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set as Primary
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <AppDialogFooter
          secondaryAction={{ label: "Close", onClick: () => { setIsImageViewerOpen(false); setProductImages([]); } }}
        />
      </BaseDialog>
      
      {/* Admin Reviews View Dialog */}
      <BaseDialog open={isReviewsViewOpen} onOpenChange={(open) => { if (!open) { setIsReviewsViewOpen(false); setReviews([]); } }} maxWidth="3xl">
        <AppDialogHeader title="Product Reviews" />
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews for this product.</p>
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
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={isDeletingReview}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {review.comment && <p className="text-sm">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
        <AppDialogFooter
          secondaryAction={{ label: "Close", onClick: () => { setIsReviewsViewOpen(false); setReviews([]); } }}
        />
      </BaseDialog>
    </div>
  );
};

export default InventorySection;
