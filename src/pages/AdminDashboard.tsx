import { useEffect, useState, type ChangeEvent } from "react";
import {
  BarChart3, Package, Truck, ShoppingBag, Users, Store,
  AlertTriangle, TrendingUp, Home, Search, MoreHorizontal,
  Edit, Trash2, Eye, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, Mail, Phone, MapPin, Star, BadgeCheck,
  MessageSquare, ArrowUpRight, ArrowDownRight, DollarSign,
  Globe, CreditCard, Receipt, Plus, Upload, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import logo from "@/assets/logo.png";
import { mockOrders } from "@/lib/mock-data";
import { mockProducts } from "@/lib/mock-products";
import { mockSocialLinks, mockContactPhones, type SocialLink, type ContactPhone } from "@/lib/contact-data";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, getUsers, UserQueryParam, updateUserAdmin } from "@/api/user.api";
import { getInventory, getInventoryItem, updateInventory, deleteInventory, createInventory } from "@/api/inventory.api";
import { getOrders, getOrder, updateOrder } from "@/api/order.api";
import { getLogistics, getLogisticsItem, createLogistics, updateLogistics } from "@/api/logistics.api";
import { getPaymentAccounts, getPaymentAccount, createPaymentAccount, updatePaymentAccount, deletePaymentAccount } from "@/api/payment-account.api";
import { getReceipts, getReceipt, createReceipt, updateReceipt } from "@/api/receipt.api";
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from "@/api/category.api";
import { getSellers, getSeller, createSeller, updateSeller, deleteSeller } from "@/api/seller.api";
import { useUserStore } from "@/features/user/user.store";
import { useInventoryStore } from "@/features/inventory/inventory.store";
import { useOrderStore } from "@/features/order/order.store";
import { useLogisticsStore } from "@/features/logistics/logistics.store";
import { usePaymentAccountStore } from "@/features/payment-account.store";
import { useReceiptStore } from "@/features/receipt.store";
import { useCategoryStore } from "@/features/category.store";
import { useSellerStore } from "@/features/seller.store";
import { useToast } from "@/hooks/use-toast";
import { keepPreviousData } from "@tanstack/react-query";


const sections = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "inventory", label: "Inventory", icon: Package },
  { key: "categories", label: "Categories", icon: CreditCard },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "payments", label: "Payments & Receipts", icon: Receipt },
  { key: "logistics", label: "Logistics", icon: Truck },
  { key: "users", label: "Users", icon: Users },
  { key: "sellers", label: "Sellers", icon: Store },
  { key: "complaints", label: "Complaints", icon: AlertTriangle },
  { key: "contact", label: "Contact & Social", icon: Globe },
  { key: "reports", label: "Reports", icon: TrendingUp },
];

// ─── Helpers ─────────────────────────────────────────────────

const StatCard = ({ label, value, change, positive = true, icon: Icon }: { label: string; value: string; change: string; positive?: boolean; icon?: React.ElementType }) => (
  <div className="bg-card border rounded-lg p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    </div>
    <p className="text-2xl font-display font-bold mt-1">{value}</p>
    <p className={`text-xs mt-1 flex items-center gap-1 ${positive ? "text-success" : "text-destructive"}`}>
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {change}
    </p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
    open: "bg-warning/10 text-warning border-warning/20",
    investigating: "bg-primary/10 text-primary border-primary/20",
    resolved: "bg-success/10 text-success border-success/20",
    confirmed: "bg-primary/10 text-primary border-primary/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    delivered: "bg-success/10 text-success border-success/20",
    out_for_delivery: "bg-secondary/10 text-secondary border-secondary/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    in_transit: "bg-primary/10 text-primary border-primary/20",
    processing: "bg-warning/10 text-warning border-warning/20",
    paid: "bg-success/10 text-success border-success/20",
    unpaid: "bg-destructive/10 text-destructive border-destructive/20",
    verified: "bg-success/10 text-success border-success/20",
    pending_review: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <Badge variant="outline" className={`text-xs capitalize ${styles[status] || ""}`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    high: "bg-destructive text-destructive-foreground",
    medium: "bg-warning text-warning-foreground",
    low: "bg-muted text-muted-foreground",
  };
  return <Badge className={`text-xs ${styles[priority] || ""}`}>{priority}</Badge>;
};

// ─── Mock Data ───────────────────────────────────────────────

// Mock sellers removed - using backend integration

const mockComplaints = [
  { id: "C001", user: "Sarah Kim", orderId: "ORD-001", subject: "Damaged product on arrival", status: "open", priority: "high", date: "2026-04-08", description: "The leather bag had a visible scratch on the front panel when delivered." },
  { id: "C002", user: "Mike Ross", orderId: "ORD-002", subject: "Wrong item delivered", status: "investigating", priority: "high", date: "2026-04-07", description: "Received spice collection instead of the bamboo basket ordered." },
  { id: "C003", user: "Alex Turner", orderId: "ORD-098", subject: "Late delivery", status: "resolved", priority: "medium", date: "2026-04-03", description: "Package arrived 5 days after estimated delivery date." },
  { id: "C004", user: "James Chen", orderId: "ORD-045", subject: "Missing items in order", status: "open", priority: "medium", date: "2026-04-09", description: "Ordered 3 scarves but only received 2 in the package." },
  { id: "C005", user: "Priya Sharma", orderId: "ORD-072", subject: "Quality not as described", status: "investigating", priority: "low", date: "2026-04-05", description: "The honey jar label says organic but tastes different from expected." },
];



// legacy `allOrders` mock removed; admin orders now fetched from backend

const mockReceipts = [
  { id: "R001", orderId: "ORD-156", customer: "Sarah K.", amount: "$89.99", method: "full", account: "CBE - 1000012345678", uploadedAt: "2026-04-09 10:30", status: "approved", note: "" },
  { id: "R002", orderId: "ORD-155", customer: "Mike R.", amount: "$43.65", method: "advance", account: "Telebirr - 0911000000", uploadedAt: "2026-04-08 14:22", status: "approved", note: "30% advance paid" },
  { id: "R003", orderId: "ORD-153", customer: "James C.", amount: "$15.23", method: "advance", account: "Awash - 0142001234567", uploadedAt: "2026-04-07 09:15", status: "pending_review", note: "Blurry image" },
  { id: "R004", orderId: "ORD-150", customer: "Emma W.", amount: "$67.99", method: "full", account: "CBE Birr - 0911000000", uploadedAt: "2026-04-04 16:45", status: "approved", note: "" },
];

// ─── Section Components ──────────────────────────────────────

const DashboardSection = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Total Revenue" value="$24,580" change="12% this month" icon={DollarSign} />
      <StatCard label="Active Orders" value="156" change="8% this week" icon={ShoppingBag} />
      <StatCard label="Total Products" value="432" change="12 pending review" icon={Package} />
      <StatCard label="Registered Users" value="1,847" change="23 today" icon={Users} />
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border rounded-lg p-5">
        <h3 className="font-display font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3 text-sm">
          {/* {allOrders.slice(0, 4).map((o) => (
            <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div><span className="font-medium">{o.id}</span><span className="text-muted-foreground ml-2">{o.customer}</span></div>
              <div className="flex items-center gap-3"><span>{o.amount}</span><StatusBadge status={o.status} /></div>
            </div>
          ))} */}
        </div>
      </div>
      <div className="bg-card border rounded-lg p-5">
        <h3 className="font-display font-semibold mb-4">Pending Actions</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b"><span>Products awaiting verification</span><Badge>5</Badge></div>
          <div className="flex items-center justify-between py-2 border-b"><span>Receipts pending review</span><Badge variant="destructive">{mockReceipts.filter(r => r.status === "pending_review").length}</Badge></div>
          <div className="flex items-center justify-between py-2 border-b"><span>Unresolved complaints</span><Badge variant="destructive">2</Badge></div>
          <div className="flex items-center justify-between py-2"><span>Seller verification requests</span><Badge>4</Badge></div>
        </div>
      </div>
    </div>
  </div>
);

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

    queryClient.invalidateQueries({
      queryKey: ["inventory"],
    });

    toast({ title: "Product created" });

    setIsCreateOpen(false);
  } catch (err) {
    toast({
      title: "Create failed",
      variant: "destructive",
    });
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

      await getInventoryItem(selectedProduct.id); // Refetch to get updated data with relations

      updateProduct(data);
      setSelectedProduct(data);
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
      toast({
        title: "Product updated",
        description: "Inventory item saved successfully.",
      });
      setIsViewOpen(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Unable to save product changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteInventory(productToDelete);
      deleteProduct(productToDelete);
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
      toast({
        title: "Product removed",
        description: "Inventory item deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Unable to delete the product.",
        variant: "destructive",
      });
    } finally {
      setProductToDelete(null);
      setIsDeleteOpen(false);
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => loadSelectedProduct(product.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => loadSelectedProduct(product.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        setProductToDelete(product.id);
                        setIsDeleteOpen(true);
                      }}
                    >
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
            <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
              Prev
            </Button>
            <span>
              Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
            </span>
            <Button disabled={page * meta.limit >= meta.total} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogContent className="max-w-2xl">
        <div className="col-span-2 space-y-1">
        <Label>Images</Label>

        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />

        {createImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {createImages.map((file, i) => (
              <div
                key={i}
                className="text-xs px-2 py-1 bg-muted rounded"
              >
                {file.name}
              </div>
            ))}
          </div>
        )}
        </div>
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Add a new inventory item to the system
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="col-span-2 space-y-1">
            <Label>Name</Label>
            <Input value={createName} onChange={(e) => setCreateName(e.target.value)} />
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-1">
            <Label>Description</Label>
            <Textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
            />
          </div>

          {/* Price */}
          <div className="space-y-1">
            <Label>Price</Label>
            <Input
              type="number"
              value={createPrice}
              onChange={(e) => setCreatePrice(Number(e.target.value))}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={createQuantity}
              onChange={(e) => setCreateQuantity(Number(e.target.value))}
            />
          </div>

          {/* Quality */}
          <div className="space-y-1">
            <Label>Quality</Label>
            <Select value={createQuality} onValueChange={setCreateQuality}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category ID */}
          <div className="space-y-1">
            <Label>Category ID</Label>
            <Input
              value={createCategoryId}
              onChange={(e) => setCreateCategoryId(e.target.value)}
            />
          </div>

          {/* Seller ID */}
          <div className="space-y-1">
            <Label>Seller ID</Label>
            <Input
              value={createSellerId}
              onChange={(e) => setCreateSellerId(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="col-span-2 space-y-1">
            <Label>Location</Label>
            <Input
              value={createLocation}
              onChange={(e) => setCreateLocation(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
            Cancel
          </Button>

          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>

          {selectedProduct ? (
            <div className="space-y-4">
              <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img src={selectedProduct.images?.[0]?.image_url || '../assets/placeholder.png'} alt={selectedProduct.name} className="w-full h-64 object-cover" />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <Input 
                        type="number" 
                        value={editPrice} 
                        onChange={(e) => setEditPrice(Number(e.target.value))} 
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <Input type="number" value={editQuantity} onChange={(e) => setEditQuantity(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Quality</Label>
                      <Select value={editQuality} onValueChange={(value) => setEditQuality(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Verified</Label>
                      <Select value={editVerified.toString()} onValueChange={(value) => setEditVerified(value === "true")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Verified</SelectItem>
                          <SelectItem value="false">Unverified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div>
                  <p><strong>Category</strong></p>
                  <p>{selectedProduct.category?.name ?? ""}</p>
                </div>
                <div>
                  <p><strong>Seller</strong></p>
                  <p>{selectedProduct.seller?.name ?? ""}</p>
                </div>
                <div>
                  <p><strong>Location</strong></p>
                  <p>{selectedProduct.location ?? ""}</p>
                </div>
                <div>
                  <p><strong>Rating</strong></p>
                  <p>{selectedProduct.rating ?? ""}</p>
                </div>
                <div>
                  <p><strong>Review Count</strong></p>
                  <p>{selectedProduct.reviewCount ?? ""}</p>
                </div>
                <div>
                  <p><strong>Created At</strong></p>
                  <p>{selectedProduct.created_at ?? ""}</p>
                </div>
                <div>
                  <p><strong>Updated At</strong></p>
                  <p>{selectedProduct.updated_at || ""}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading product details...</p>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button onClick={handleSave} disabled={isSaving || !selectedProduct}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>Are you sure you want to delete this inventory item?</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CategorySection = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [editName, setEditName] = useState("");

  const categories = useCategoryStore((state) => state.categories);
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setSelectedCategory = useCategoryStore((state) => state.setSelectedCategory);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const removeCategory = useCategoryStore((state) => state.removeCategory);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useCategories = (params: any) =>
    useQuery({
      queryKey: ["categories", params],
      queryFn: async () => await getCategories(params),
      placeholderData: keepPreviousData,
    });

  const response = useCategories({
    page,
    limit,
    ...(search ? { search } : {}),
    sort,
    order,
  });

  const categoriesData = response.data?.data?.data ?? [];
  const categoriesMeta = response.data?.data?.meta;

  useEffect(() => {
  if (!response.data?.data?.data) return;

  setCategories(response.data.data.data); // 👈 ONLY ARRAY
}, [response.data?.data?.data]);

  const loadCategoryDetails = async (id: string) => {
    try {
      const { data } = await getCategory(id);
      setSelectedCategory(data);
      setEditName(data.name);
      setIsViewOpen(true);
    } catch (error) {
      toast({
        title: "Unable to load category",
        description: "Failed to fetch category details.",
        variant: "destructive",
      });
    }
  };

  const loadCategoryForEdit = async (id: string) => {
    try {
      const { data } = await getCategory(id);
      setSelectedCategory(data);
      setEditName(data.name);
      setIsEditOpen(true);
    } catch (error) {
      toast({
        title: "Unable to load category",
        description: "Failed to fetch category details.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCategory = async () => {
    if (!createName.trim()) {
      toast({ title: "Validation error", description: "Name is required.", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const { data } = await createCategory({ name: createName.trim() });
      addCategory(data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category created" });
      setIsCreateOpen(false);
      setCreateName("");
    } catch (error) {
      toast({ title: "Create failed", description: "Unable to create category.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    if (!editName.trim()) {
      toast({ title: "Validation error", description: "Name is required.", variant: "destructive" });
      return;
    }
    console.log("Updating category with name:", editName);

    setIsSaving(true);
    try {
     const d = await updateCategory(selectedCategory.id, { name: editName.trim() });
     console.log("Update response:", d);
      const { data } = await getCategory(selectedCategory.id); // Refetch to get updated data
      updateCategory(data);
      setSelectedCategory(data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category updated" });
      setIsEditOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: error.message.data || error.message || "Unable to update category.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete);
      removeCategory(categoryToDelete);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category deleted" });
    } catch (error) {
      toast({ title: "Delete failed", description: "Unable to delete category.", variant: "destructive" });
    } finally {
      setCategoryToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, sort, order]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <h3 className="font-display font-semibold">Categories</h3>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search categories..." />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as "name" | "created_at")}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by name</SelectItem>
            <SelectItem value="created_at">Sort by created</SelectItem>
          </SelectContent>
        </Select>
        <Select value={order} onValueChange={(v) => setOrder(v as "asc" | "desc")}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(category.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(category.updated_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadCategoryDetails(category.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadCategoryForEdit(category.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        setCategoryToDelete(category.id);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {categoriesMeta && categoriesMeta.total > categoriesMeta.limit && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
            Prev
          </Button>
          <span>Page {categoriesMeta.page} of {Math.ceil(categoriesMeta.total / categoriesMeta.limit)}</span>
          <Button disabled={page * categoriesMeta.limit >= categoriesMeta.total} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={createName} onChange={(e) => setCreateName(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory} disabled={isCreating}>{isCreating ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedCategory(null); }}>Cancel</Button>
            <Button onClick={handleUpdateCategory} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogDescription>{selectedCategory?.name}</DialogDescription>
          </DialogHeader>
          {selectedCategory ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Category ID</p>
                <p className="font-medium">{selectedCategory.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Created At</p>
                <p className="font-medium text-xs">{new Date(selectedCategory.created_at).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Name</p>
                <p className="font-medium">{selectedCategory.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Updated At</p>
                <p className="font-medium text-xs">{new Date(selectedCategory.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading category...</p>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsViewOpen(false); setSelectedCategory(null); }}>Close</Button>
            <Button onClick={() => { if (selectedCategory) { setIsViewOpen(false); setIsEditOpen(true); } }} disabled={!selectedCategory}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this category?</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const OrdersSection = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editStatus, setEditStatus] = useState("pending");

  const setOrders = useOrderStore((s) => s.setOrders);
  const selectedOrder = useOrderStore((s) => s.selectedOrder);
  const setSelectedOrder = useOrderStore((s) => s.setSelectedOrder);
  const updateOrderInStore = useOrderStore((s) => s.updateOrder);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useOrders = (params: any) =>
    useQuery({ queryKey: ["orders", params], queryFn: async () => await getOrders(params), placeholderData: keepPreviousData });

  const statusParam = statusFilter === "all" ? undefined : statusFilter;
  const paymentStatusParam = paymentStatusFilter === "all" ? undefined : paymentStatusFilter;
  const paymentMethodParam = paymentMethodFilter === "all" ? undefined : paymentMethodFilter;

  const response = useOrders({
    page,
    limit,
    ...(statusParam ? { status: statusParam } : {}),
    ...(paymentStatusParam ? { payment_status: paymentStatusParam } : {}),
    ...(paymentMethodParam ? { payment_method: paymentMethodParam } : {}),
  });

  const orders = response.data?.data?.data ?? [];
  const meta = response.data?.data?.meta;

  const loadSelected = async (id: string) => {
    try {
      const { data } = await getOrder(id);
      setSelectedOrder(data);
      setEditStatus(data.status);
      setIsViewOpen(true);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load order details.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!selectedOrder) return;
    setIsSaving(true);
    try {
       await updateOrder(selectedOrder.id, { status: editStatus as any });
      
      const { data } = await getOrder(selectedOrder.id); // Refetch to get updated data with relations
      updateOrderInStore(data);
      setSelectedOrder(data);
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      toast({ title: "Order updated", description: "Order status updated." });
      setIsViewOpen(false);
    } catch (err) {
      toast({ title: "Update failed", description: "Unable to update order.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => setPage(1), [statusFilter, paymentStatusFilter, paymentMethodFilter]);
  useEffect(() => setOrders(orders), [orders, setOrders]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="out_for_delivery">In Transit</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={paymentStatusFilter} onValueChange={(v) => setPaymentStatusFilter(v)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentMethodFilter} onValueChange={(v) => setPaymentMethodFilter(v)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="advance">Advance</SelectItem>
            <SelectItem value="cod">Cash on Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.id}</TableCell>
                <TableCell>{o.user?.full_name}</TableCell>
                <TableCell>{o.products?.length ?? 0}</TableCell>
                <TableCell className="font-medium">${Number(o.total_amount).toFixed(2)}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell><Badge variant="outline" className="text-xs capitalize">{o.payment_status}</Badge></TableCell>
                <TableCell><Badge variant="outline" className="text-xs capitalize">{o.payment_method}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{o.created_at}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadSelected(o.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {meta && meta.total > meta.limit && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span>Page {meta.page} of {Math.ceil(meta.total / meta.limit)}</span>
            <Button disabled={page * meta.limit >= meta.total} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p><strong>Order ID</strong></p>
                  <p>{selectedOrder.id}</p>
                </div>
                <div>
                  <p><strong>Customer</strong></p>
                  <p>{selectedOrder.user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">ID: {selectedOrder.user?.id}</p>
                </div>
                <div>
                  <p><strong>Address</strong></p>
                  <p className="text-sm">{selectedOrder.address}</p>
                </div>
                <div>
                  <p><strong>Total</strong></p>
                  <p>${Number(selectedOrder.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p><strong>Created At</strong></p>
                  <p>{selectedOrder.created_at}</p>
                </div>
                <div>
                  <p><strong>Updated At</strong></p>
                  <p>{selectedOrder.updated_at}</p>
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="font-medium">Products</h4>
                <div className="space-y-2 mt-2">
                  {selectedOrder.products.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm">
                      <div>Product ID: {p.id}</div>
                      <div>Qty: {p.quantity}</div>
                      <div className="font-medium">${Number(p.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading order...</p>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button onClick={handleSave} disabled={isSaving || !selectedOrder}>{isSaving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PaymentsSection = () => {
  const [accountSearch, setAccountSearch] = useState("");
  const [accountPage, setAccountPage] = useState(1);
  const [accountLimit] = useState(10);
  const [isAccountCreateOpen, setIsAccountCreateOpen] = useState(false);
  const [isAccountEditOpen, setIsAccountEditOpen] = useState(false);
  const [isAccountDeleteOpen, setIsAccountDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [accountCreateType, setAccountCreateType] = useState<"bank" | "telebirr" | "cbe_birr">("bank");
  const [accountCreateLabel, setAccountCreateLabel] = useState("");
  const [accountCreateName, setAccountCreateName] = useState("");
  const [accountCreateNumber, setAccountCreateNumber] = useState("");
  const [accountCreateDetails, setAccountCreateDetails] = useState("");
  const [accountEditType, setAccountEditType] = useState<"bank" | "telebirr" | "cbe_birr">("bank");
  const [accountEditLabel, setAccountEditLabel] = useState("");
  const [accountEditName, setAccountEditName] = useState("");
  const [accountEditNumber, setAccountEditNumber] = useState("");
  const [accountEditDetails, setAccountEditDetails] = useState("");
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [isAccountCreating, setIsAccountCreating] = useState(false);

  const [receiptSearch, setReceiptSearch] = useState("");
  const [receiptStatus, setReceiptStatus] = useState<"all" | "pending_review" | "approved" | "rejected">("all");
  const [receiptMethod, setReceiptMethod] = useState<"all" | "full" | "advance" | "cod">("all");
  const [receiptPage, setReceiptPage] = useState(1);
  const [receiptLimit] = useState(10);
  const [isReceiptViewOpen, setIsReceiptViewOpen] = useState(false);
  const [isReceiptUploadOpen, setIsReceiptUploadOpen] = useState(false);
  const [isReceiptCreating, setIsReceiptCreating] = useState(false);
  const [isReceiptSaving, setIsReceiptSaving] = useState(false);
  const [receiptUploadOrderId, setReceiptUploadOrderId] = useState("");
  const [receiptUploadAccount, setReceiptUploadAccount] = useState("");
  const [receiptUploadNote, setReceiptUploadNote] = useState("");
  const [receiptUploadFile, setReceiptUploadFile] = useState<File | null>(null);
  const [receiptEditStatus, setReceiptEditStatus] = useState<"pending_review" | "approved" | "rejected">("pending_review");
  const [receiptEditNote, setReceiptEditNote] = useState("");

  
  const selectedPaymentAccount = usePaymentAccountStore((state) => state.selectedPaymentAccount);
  const setPaymentAccounts = usePaymentAccountStore((state) => state.setPaymentAccounts);
  const setSelectedPaymentAccount = usePaymentAccountStore((state) => state.setSelectedPaymentAccount);
  const addPaymentAccount = usePaymentAccountStore((state) => state.addPaymentAccount);
  const updatePaymentAccountInStore = usePaymentAccountStore((state) => state.updatePaymentAccount);
  const removePaymentAccount = usePaymentAccountStore((state) => state.removePaymentAccount);

  const selectedReceipt = useReceiptStore((state) => state.selectedReceipt);
  const setReceipts = useReceiptStore((state) => state.setReceipts);
  const setSelectedReceipt = useReceiptStore((state) => state.setSelectedReceipt);
  const addReceipt = useReceiptStore((state) => state.addReceipt);
  const updateReceiptInStore = useReceiptStore((state) => state.updateReceipt);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const usePaymentAccountsQuery = (params: any) =>
    useQuery({
      queryKey: ["payment-accounts", params],
      queryFn: async () => await getPaymentAccounts(params),
      placeholderData: keepPreviousData,
    });
  const useReceiptsQuery = (params: any) =>
    useQuery({
      queryKey: ["receipts", params],
      queryFn: async () => await getReceipts(params),
      placeholderData: keepPreviousData,
    });

  const paymentAccountsResponse = usePaymentAccountsQuery({
    page: accountPage,
    limit: accountLimit,
    ...(accountSearch ? { search: accountSearch } : {}),
    order: "asc",
  });
  const paymentAccounts =
  paymentAccountsResponse.data?.data?.data ?? [];


  const receiptStatusParam = receiptStatus === "all" ? undefined : receiptStatus;
  const receiptMethodParam = receiptMethod === "all" ? undefined : receiptMethod;

  const receiptsResponse = useReceiptsQuery({
    page: receiptPage,
    limit: receiptLimit,
    ...(receiptSearch ? { search: receiptSearch } : {}),
    ...(receiptStatusParam ? { status: receiptStatusParam } : {}),
    ...(receiptMethodParam ? { payment_method: receiptMethodParam } : {}),
    sort: "created_at",
    order: "desc",
  });
  const receipts =
    receiptsResponse.data?.data?.data ?? [];
  const receiptMeta = receiptsResponse.data?.data?.meta;
  const accountMeta = paymentAccountsResponse.data?.data?.meta;

  const paymentAccountsData = paymentAccountsResponse.data?.data?.data ?? [];
  const receiptsData = receiptsResponse.data?.data?.data ?? [];

  const pendingCount = receiptsData.filter((receipt) => receipt.status === "pending_review").length;
  const approvedCount = receiptsData.filter((receipt) => receipt.status === "approved").length;
  const totalCollected = receiptsData.reduce((sum, receipt) => sum + Number(receipt.amount || "0"), 0);

  const loadPaymentAccount = async (id: string) => {
    try {
      const { data } = await getPaymentAccount(id);
      setSelectedPaymentAccount(data);
      setAccountEditType(data.type);
      setAccountEditLabel(data.label);
      setAccountEditName(data.account_name);
      setAccountEditNumber(data.account_number);
      setAccountEditDetails(data.details ?? "");
      setIsAccountEditOpen(true);
    } catch (error) {
      toast({ title: "Unable to load account", description: "Failed to retrieve payment account details.", variant: "destructive" });
    }
  };

  const handleCreatePaymentAccount = async () => {
    if (!accountCreateLabel || !accountCreateName || !accountCreateNumber) {
      toast({ title: "Validation error", description: "Fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsAccountCreating(true);
    try {
      const { data } = await createPaymentAccount({
        type: accountCreateType,
        label: accountCreateLabel,
        account_name: accountCreateName,
        account_number: accountCreateNumber,
        details: accountCreateDetails || undefined,
      });

      addPaymentAccount(data);
      queryClient.invalidateQueries({ queryKey: ["payment-accounts"] });
      toast({ title: "Payment account created" });
      setIsAccountCreateOpen(false);
      setAccountCreateType("bank");
      setAccountCreateLabel("");
      setAccountCreateName("");
      setAccountCreateNumber("");
      setAccountCreateDetails("");
    } catch (error) {
      toast({ title: "Create failed", description: "Unable to create payment account.", variant: "destructive" });
    } finally {
      setIsAccountCreating(false);
    }
  };

  const handleUpdatePaymentAccount = async () => {
    if (!selectedPaymentAccount) return;
    setIsAccountSaving(true);
    try {
      const { data } = await updatePaymentAccount(selectedPaymentAccount.id, {
        type: accountEditType,
        label: accountEditLabel,
        account_name: accountEditName,
        account_number: accountEditNumber,
        details: accountEditDetails || undefined,
      });

      updatePaymentAccountInStore(data);
      setSelectedPaymentAccount(data);
      queryClient.invalidateQueries({ queryKey: ["payment-accounts"] });
      toast({ title: "Payment account updated" });
      setIsAccountEditOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to save payment account.", variant: "destructive" });
    } finally {
      setIsAccountSaving(false);
    }
  };

  const handleDeletePaymentAccount = async () => {
    if (!accountToDelete) return;
    try {
      await deletePaymentAccount(accountToDelete);
      removePaymentAccount(accountToDelete);
      queryClient.invalidateQueries({ queryKey: ["payment-accounts"] });
      toast({ title: "Payment account deleted" });
    } catch (error) {
      toast({ title: "Delete failed", description: "Unable to remove payment account.", variant: "destructive" });
    } finally {
      setAccountToDelete(null);
      setIsAccountDeleteOpen(false);
    }
  };

  const loadReceipt = async (id: string) => {
    try {
      const { data } = await getReceipt(id);
      setSelectedReceipt(data);
      setReceiptEditStatus(data.status);
      setReceiptEditNote(data.note);
      setIsReceiptViewOpen(true);
    } catch (error) {
      toast({ title: "Unable to load receipt", description: "Failed to retrieve receipt details.", variant: "destructive" });
    }
  };

  const handleCreateReceipt = async () => {
    if (!receiptUploadOrderId || !receiptUploadAccount || !receiptUploadFile) {
      toast({ title: "Validation error", description: "Order, account and image are required.", variant: "destructive" });
      return;
    }

    setIsReceiptCreating(true);
    try {
      const formData = new FormData();
      formData.append("order_id", receiptUploadOrderId);
      formData.append("account", receiptUploadAccount);
      formData.append("note", receiptUploadNote);
      formData.append("images", receiptUploadFile);

      const { data } = await createReceipt(formData);
      addReceipt(data);
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast({ title: "Receipt uploaded" });
      setIsReceiptUploadOpen(false);
      setReceiptUploadOrderId("");
      setReceiptUploadAccount("");
      setReceiptUploadNote("");
      setReceiptUploadFile(null);
    } catch (error) {
      toast({ title: "Upload failed", description: "Unable to upload receipt.", variant: "destructive" });
    } finally {
      setIsReceiptCreating(false);
    }
  };

  const handleSaveReceipt = async () => {
    if (!selectedReceipt) return;
    setIsReceiptSaving(true);
    try {
      const { data } = await updateReceipt(selectedReceipt.id, {
        status: receiptEditStatus,
        note: receiptEditNote,
      });

      updateReceiptInStore(data);
      setSelectedReceipt(data);
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast({ title: "Receipt updated" });
      setIsReceiptViewOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to save receipt.", variant: "destructive" });
    } finally {
      setIsReceiptSaving(false);
    }
  };


  useEffect(() => setAccountPage(1), [accountSearch]);
  // useEffect(() => setReceiptPage(1), [receiptSearch, receiptStatus, receiptMethod]);
  //   useEffect(() => {
  //     setPaymentAccounts(paymentAccountsData);
  //   }, [paymentAccountsData]);
  // useEffect(() => setReceipts(receiptsData), [receiptsData, setReceipts]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending Review" value={String(pendingCount)} change="Needs attention" positive={false} icon={Receipt} />
        <StatCard label="Approved" value={String(approvedCount)} change="This week" icon={CheckCircle} />
        <StatCard label="Total Collected" value={`$${totalCollected.toFixed(2)}`} change="From receipts" icon={DollarSign} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <h3 className="font-display font-semibold">Payment Accounts</h3>
          <Button onClick={() => setIsAccountCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Account
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={accountSearch} onChange={(e) => setAccountSearch(e.target.value)} className="pl-9" placeholder="Search accounts..." />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {paymentAccounts.map((account) => (
            <div key={account.id} className="border rounded-lg p-4 flex flex-col justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{account.label}</p>
                <p className="text-xs text-muted-foreground">{account.account_name} · {account.account_number}</p>
                <Badge variant="outline" className="text-xs capitalize mt-2">{account.type.replace("_", " ")}</Badge>
              </div>
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadPaymentAccount(account.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setAccountToDelete(account.id); setIsAccountDeleteOpen(true); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {accountMeta && accountMeta.total > accountMeta.limit && (
          <div className="flex items-center justify-center gap-4 mt-3">
            <Button disabled={accountPage === 1} onClick={() => setAccountPage((current) => current - 1)}>Prev</Button>
            <span>Page {accountMeta.page} of {Math.ceil(accountMeta.total / accountMeta.limit)}</span>
            <Button disabled={accountPage * accountMeta.limit >= accountMeta.total} onClick={() => setAccountPage((current) => current + 1)}>Next</Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <h3 className="font-display font-semibold">Uploaded Receipts</h3>
          <Button variant="secondary" onClick={() => setIsReceiptUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Receipt
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={receiptSearch} onChange={(e) => setReceiptSearch(e.target.value)} className="pl-9" placeholder="Search receipts..." />
          </div>
          <Select value={receiptStatus} onValueChange={(v) => setReceiptStatus(v as any)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={receiptMethod} onValueChange={(v) => setReceiptMethod(v as any)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="advance">Advance</SelectItem>
              <SelectItem value="cod">Cash on Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.id}</TableCell>
                  <TableCell className="font-medium">{receipt.order.id}</TableCell>
                  <TableCell>{receipt.order.user.full_name}</TableCell>
                  <TableCell className="font-medium">${receipt.amount}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{receipt.payment_method}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{receipt.account}</TableCell>
                  <TableCell><StatusBadge status={receipt.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{receipt.created_at}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadReceipt(receipt.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {receiptMeta && receiptMeta.total > receiptMeta.limit && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button disabled={receiptPage === 1} onClick={() => setReceiptPage((current) => current - 1)}>Prev</Button>
            <span>Page {receiptMeta.page} of {Math.ceil(receiptMeta.total / receiptMeta.limit)}</span>
            <Button disabled={receiptPage * receiptMeta.limit >= receiptMeta.total} onClick={() => setReceiptPage((current) => current + 1)}>Next</Button>
          </div>
        )}
      </div>

      <Dialog open={isAccountCreateOpen} onOpenChange={setIsAccountCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Payment Account</DialogTitle>
            <DialogDescription>Create a new payment account for transfers.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={accountCreateType} onValueChange={(v: any) => setAccountCreateType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="telebirr">Telebirr</SelectItem>
                  <SelectItem value="cbe_birr">CBE Birr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Label</Label>
              <Input value={accountCreateLabel} onChange={(e) => setAccountCreateLabel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Account Name</Label>
              <Input value={accountCreateName} onChange={(e) => setAccountCreateName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Account Number</Label>
              <Input value={accountCreateNumber} onChange={(e) => setAccountCreateNumber(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Details</Label>
              <Textarea value={accountCreateDetails} onChange={(e) => setAccountCreateDetails(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAccountCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePaymentAccount} disabled={isAccountCreating}>{isAccountCreating ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAccountEditOpen} onOpenChange={(open) => !open && setSelectedPaymentAccount(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payment Account</DialogTitle>
            <DialogDescription>Update payment account details.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={accountEditType} onValueChange={(v: any) => setAccountEditType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="telebirr">Telebirr</SelectItem>
                  <SelectItem value="cbe_birr">CBE Birr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Label</Label>
              <Input value={accountEditLabel} onChange={(e) => setAccountEditLabel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Account Name</Label>
              <Input value={accountEditName} onChange={(e) => setAccountEditName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Account Number</Label>
              <Input value={accountEditNumber} onChange={(e) => setAccountEditNumber(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Details</Label>
              <Textarea value={accountEditDetails} onChange={(e) => setAccountEditDetails(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsAccountEditOpen(false); setSelectedPaymentAccount(null); }}>Cancel</Button>
            <Button onClick={handleUpdatePaymentAccount} disabled={isAccountSaving}>{isAccountSaving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAccountDeleteOpen} onOpenChange={setIsAccountDeleteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete Payment Account</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this payment account?</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAccountDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeletePaymentAccount}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptUploadOpen} onOpenChange={setIsReceiptUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
            <DialogDescription>Upload a receipt for a customer order.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Order ID</Label>
              <Input value={receiptUploadOrderId} onChange={(e) => setReceiptUploadOrderId(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Account</Label>
              <Input value={receiptUploadAccount} onChange={(e) => setReceiptUploadAccount(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Note</Label>
              <Textarea value={receiptUploadNote} onChange={(e) => setReceiptUploadNote(e.target.value)} rows={3} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Receipt Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setReceiptUploadFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReceiptUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateReceipt} disabled={isReceiptCreating}>{isReceiptCreating ? "Uploading..." : "Upload"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptViewOpen} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
            <DialogDescription>{selectedReceipt?.id}</DialogDescription>
          </DialogHeader>
          {selectedReceipt ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Receipt ID</p>
                  <p className="font-medium">{selectedReceipt.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Order ID</p>
                  <p className="font-medium">{selectedReceipt.order.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Customer Name</p>
                  <p className="font-medium">{selectedReceipt.order.user.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Customer ID</p>
                  <p className="font-medium text-xs">{selectedReceipt.order.user.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Amount</p>
                  <p className="font-medium">${selectedReceipt.amount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Payment Method</p>
                  <p className="font-medium capitalize">{selectedReceipt.payment_method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Account</p>
                  <p className="font-medium">{selectedReceipt.account}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge variant="outline" className="text-xs capitalize">{selectedReceipt.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Created At</p>
                  <p className="font-medium text-xs">{selectedReceipt.created_at}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Updated At</p>
                  <p className="font-medium text-xs">{selectedReceipt.updated_at}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={receiptEditStatus} onValueChange={(v: any) => setReceiptEditStatus(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Note</Label>
                  <Textarea value={receiptEditNote} onChange={(e) => setReceiptEditNote(e.target.value)} rows={3} />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Receipt Image</p>
                  <img src={selectedReceipt.file_url} alt="Receipt" className="w-full rounded-lg border" />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsReceiptViewOpen(false); setSelectedReceipt(null); }}>Close</Button>
            <Button onClick={handleSaveReceipt} disabled={isReceiptSaving || !selectedReceipt}>{isReceiptSaving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const UsersSection = () => {
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const setSelectedUser = useUserStore((state) => state.setSelectedUser);
  const selectedUser = useUserStore((state) => state.selectedUser);
  const [isViewOpen, setIsViewOpen] = useState(false);
  type Role = "admin" | "buyer" | "contributor";
  type Status = "active" | "suspended";

  const [editRole, setEditRole] = useState<Role>("buyer");
  const [editStatus, setEditStatus] = useState<Status>("active");
  const { toast } = useToast();
  

  const useUsers = (params: UserQueryParam) => {
    return useQuery({ 
      queryKey: ["users", params],
      queryFn: async () => await getUsers(params)
    });
    
  };
  const role = roleFilter === "all" ? undefined : (roleFilter as 'buyer' | 'contributor' | 'admin');
    const response = useUsers({
      page,
      limit,
      search,
      ...(role ? { role } : {}),
  });

  const meta = response.data?.data?.meta;
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="buyer">Buyers</SelectItem>
            <SelectItem value="contributor">Contributors</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {response.data?.data?.data.map((u) => (
              <TableRow key={u.id}>
                <TableCell><div><p className="font-medium text-sm">{u.full_name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></TableCell>
                <TableCell><Badge variant="outline" className="text-xs capitalize">{u.role}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.created_at}</TableCell>
                <TableCell><StatusBadge status={u.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { 
                      setSelectedUser(u); 
                      setEditRole(u.role);
                      setEditStatus(u.status);
                      setIsViewOpen(true); 
                      }}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="h-4 w-4" /></Button>
                    {u.status === "active" ? <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><XCircle className="h-4 w-4" /></Button> : <Button variant="ghost" size="icon" className="h-8 w-8 text-success"><CheckCircle className="h-4 w-4" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {meta && meta.total > meta.limit && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span>
            Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
          </span>

          <Button
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
      </div>
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {selectedUser && (
          <div className="space-y-2">
            <p><strong>ID:</strong> {selectedUser.id}</p>
            <p><strong>Name:</strong> {selectedUser.full_name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <div>
              <label>Role</label>

              <Select value={editRole} onValueChange={(value) => setEditRole(value as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Status</label>

              <Select value={editStatus} onValueChange={(value) => setEditStatus(value as Status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p><strong>Created:</strong> {selectedUser.created_at}</p>
            <p><strong>Updated:</strong> {selectedUser.updated_at}</p>
          </div>
        )}
        <Button
          onClick={async () => {
            try {
              await updateUserAdmin(selectedUser.id, {
                role: editRole,
                status: editStatus,
              });
              
            } catch(error ) {
              const message = error.data.message || error.data || "An error occurred while updating the user.";
              toast({
                title: "Error",
                description: message,
                variant: "destructive",
              });
            }
          setIsViewOpen(false);
            
          }} 
        >
          Save Changes
        </Button>
      </DialogContent>
      
    </Dialog>
    </div>
  );
};

const SellersSection = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState<string | null>(null);
  const [createUserId, setCreateUserId] = useState("");
  const [createName, setCreateName] = useState("");
  const [createLocation, setCreateLocation] = useState("");
  const [createContact, setCreateContact] = useState("");
  const [createVerified, setCreateVerified] = useState(false);
  const [editUserId, setEditUserId] = useState("");
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editVerified, setEditVerified] = useState(false);

  const sellers = useSellerStore((state) => state.sellers);
  const selectedSeller = useSellerStore((state) => state.selectedSeller);
  const setSellers = useSellerStore((state) => state.setSellers);
  const setSelectedSeller = useSellerStore((state) => state.setSelectedSeller);
  const addSeller = useSellerStore((state) => state.addSeller);
  const updateSellerInStore = useSellerStore((state) => state.updateSeller);
  const removeSeller = useSellerStore((state) => state.removeSeller);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useSellersQuery = (params: any) =>
    useQuery({
      queryKey: ["sellers", params],
      queryFn: async () => await getSellers(params),
      placeholderData: keepPreviousData,
    });

  const response = useSellersQuery({
    page,
    limit,
    ...(search ? { search } : {}),
    sort,
    order,
  });

  const sellersData = response.data?.data?.data ?? [];
  const sellersMeta = response.data?.data?.meta;

  useEffect(() => {
    if (!response.data?.data?.data) return;
    setSellers(response.data.data.data);
  }, [response.data?.data?.data, setSellers]);

  const loadSellerDetails = async (id: string) => {
    try {
      const { data } = await getSeller(id);
      setSelectedSeller(data);
      setEditUserId(data.user.id);
      setEditName(data.name);
      setEditLocation(data.location);
      setEditContact(data.contact);
      setEditVerified(data.verified);
      setIsViewOpen(true);
    } catch (error) {
      toast({
        title: "Unable to load seller",
        description: "Failed to fetch seller details.",
        variant: "destructive",
      });
    }
  };

  const loadSellerForEdit = async (id: string) => {
    try {
      const { data } = await getSeller(id);
      setSelectedSeller(data);
      setEditUserId(data.user.id);
      setEditName(data.name);
      setEditLocation(data.location);
      setEditContact(data.contact);
      setEditVerified(data.verified);
      setIsEditOpen(true);
    } catch (error) {
      toast({
        title: "Unable to load seller",
        description: "Failed to fetch seller details.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSeller = async () => {
    if (!createName.trim() || !createLocation.trim() || !createContact.trim() || !createUserId.trim()) {
      toast({ title: "Validation error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const { data } = await createSeller({
        user_id: createUserId.trim(),
        name: createName.trim(),
        location: createLocation.trim(),
        contact: createContact.trim(),
        verified: createVerified,
      });
      addSeller(data);
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast({ title: "Seller created" });
      setIsCreateOpen(false);
      setCreateUserId("");
      setCreateName("");
      setCreateLocation("");
      setCreateContact("");
      setCreateVerified(false);
    } catch (error) {
      toast({ title: "Create failed", description: "Unable to create seller.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSeller = async () => {
    if (!selectedSeller) return;
    if (!editName.trim() || !editLocation.trim() || !editContact.trim() || !editUserId.trim()) {
      toast({ title: "Validation error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await updateSeller(selectedSeller.id, {
        user_id: editUserId.trim(),
        name: editName.trim(),
        location: editLocation.trim(),
        contact: editContact.trim(),
        verified: editVerified,
      });
      const { data } = await getSeller(selectedSeller.id);
      updateSellerInStore(data);
      setSelectedSeller(data);
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast({ title: "Seller updated" });
      setIsEditOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to update seller.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSeller = async () => {
    if (!sellerToDelete) return;
    try {
      await deleteSeller(sellerToDelete);
      removeSeller(sellerToDelete);
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast({ title: "Seller deleted" });
    } catch (error) {
      toast({ title: "Delete failed", description: "Unable to delete seller.", variant: "destructive" });
    } finally {
      setSellerToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, sort, order]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <h3 className="font-display font-semibold">Sellers</h3>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Seller
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search sellers..." />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as "name" | "created_at")}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by name</SelectItem>
            <SelectItem value="created_at">Sort by created</SelectItem>
          </SelectContent>
        </Select>
        <Select value={order} onValueChange={(v) => setOrder(v as "asc" | "desc")}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seller Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell className="font-medium">{seller.name}</TableCell>
                <TableCell>{seller.user.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{seller.location}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{seller.contact}</TableCell>
                <TableCell>{seller.products}</TableCell>
                <TableCell>
                  {seller.verified ? (
                    <Badge className="bg-success/10 text-success text-xs gap-1"><BadgeCheck className="h-3 w-3" /> Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(seller.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadSellerDetails(seller.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadSellerForEdit(seller.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        setSellerToDelete(seller.id);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sellersMeta && sellersMeta.total > sellersMeta.limit && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
            Prev
          </Button>
          <span>Page {sellersMeta.page} of {Math.ceil(sellersMeta.total / sellersMeta.limit)}</span>
          <Button disabled={page * sellersMeta.limit >= sellersMeta.total} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Seller</DialogTitle>
            <DialogDescription>Create a new seller account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>User ID</Label>
              <Input value={createUserId} onChange={(e) => setCreateUserId(e.target.value)} placeholder="UUID" />
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Seller Name" />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input value={createLocation} onChange={(e) => setCreateLocation(e.target.value)} placeholder="City, Country" />
            </div>
            <div className="space-y-1">
              <Label>Contact</Label>
              <Input value={createContact} onChange={(e) => setCreateContact(e.target.value)} placeholder="Phone Number" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={createVerified}
                onChange={(e) => setCreateVerified(e.target.checked)}
                className="rounded border-border"
              />
              <Label className="mb-0">Verified</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSeller} disabled={isCreating}>{isCreating ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setSelectedSeller(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Seller</DialogTitle>
            <DialogDescription>Update seller information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>User ID</Label>
              <Input value={editUserId} onChange={(e) => setEditUserId(e.target.value)} placeholder="UUID" />
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Seller Name" />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="City, Country" />
            </div>
            <div className="space-y-1">
              <Label>Contact</Label>
              <Input value={editContact} onChange={(e) => setEditContact(e.target.value)} placeholder="Phone Number" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editVerified}
                onChange={(e) => setEditVerified(e.target.checked)}
                className="rounded border-border"
              />
              <Label className="mb-0">Verified</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedSeller(null); }}>Cancel</Button>
            <Button onClick={handleUpdateSeller} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={(open) => !open && setSelectedSeller(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
            <DialogDescription>{selectedSeller?.name}</DialogDescription>
          </DialogHeader>
          {selectedSeller ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Seller ID</p>
                <p className="font-medium">{selectedSeller.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Owner</p>
                <p className="font-medium">{selectedSeller.user.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Owner ID</p>
                <p className="font-medium text-xs">{selectedSeller.user.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Contact</p>
                <p className="font-medium">{selectedSeller.contact}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Location</p>
                <p className="font-medium">{selectedSeller.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Products</p>
                <p className="font-medium">{selectedSeller.products}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Verified</p>
                <p className="font-medium">{selectedSeller.verified ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Created Date</p>
                <p className="font-medium text-xs">{new Date(selectedSeller.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Updated Date</p>
                <p className="font-medium text-xs">{new Date(selectedSeller.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading seller...</p>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsViewOpen(false); setSelectedSeller(null); }}>Close</Button>
            <Button onClick={() => { if (selectedSeller) { setIsViewOpen(false); setIsEditOpen(true); } }} disabled={!selectedSeller}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete Seller</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this seller?</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSeller}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LogisticsSection = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Create form state
  const [createOrderId, setCreateOrderId] = useState("");
  const [createCarrier, setCreateCarrier] = useState("");
  const [createTrackingNumber, setCreateTrackingNumber] = useState("");
  const [createStatus, setCreateStatus] = useState<"processing" | "in_transit" | "out_for_delivery" | "delivered">("processing");
  const [createOrigin, setCreateOrigin] = useState("");
  const [createDestination, setCreateDestination] = useState("");
  const [createEstimatedEta, setCreateEstimatedEta] = useState("");

  // Edit form state
  const [editCarrier, setEditCarrier] = useState("");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");
  const [editStatus, setEditStatus] = useState<"processing" | "in_transit" | "out_for_delivery" | "delivered">("processing");
  const [editOrigin, setEditOrigin] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editEstimatedEta, setEditEstimatedEta] = useState("");

  const setLogistics = useLogisticsStore((s) => s.setLogistics);
  const selectedLogistics = useLogisticsStore((s) => s.selectedLogistics);
  const setSelectedLogistics = useLogisticsStore((s) => s.setSelectedLogistics);
  const addLogisticsToStore = useLogisticsStore((s) => s.addLogistics);
  const updateLogisticsInStore = useLogisticsStore((s) => s.updateLogistics);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useLogisticsQuery = (params: any) =>
    useQuery({
      queryKey: ["logistics", params],
      queryFn: async () => await getLogistics(params),
      placeholderData: keepPreviousData,
    });

  const statusParam = statusFilter === "all" ? undefined : statusFilter;
  const response = useLogisticsQuery({
    page,
    limit,
    ...(search ? { search } : {}),
    ...(statusParam ? { status: statusParam } : {}),
  });

  const logistics = response.data?.data?.data ?? [];
  const meta = response.data?.data?.meta;

  // Calculate stats from current page data
  const inTransitCount = logistics.filter((l) => l.status === "in_transit").length;
  const outForDeliveryCount = logistics.filter((l) => l.status === "out_for_delivery").length;
  const deliveredCount = logistics.filter((l) => l.status === "delivered").length;

  const loadSelected = async (id: string) => {
    try {
      const { data } = await getLogisticsItem(id);
      // console.log("Loaded logistics item:", data);
      setSelectedLogistics(data);
      setEditCarrier(data.carrier);
      setEditTrackingNumber(data.tracking_number);
      setEditStatus(data.status);
      setEditOrigin(data.origin);
      setEditDestination(data.destination);
      setEditEstimatedEta(data.estimated_eta);
      setIsViewOpen(true);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load logistics details.",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async () => {
    // Validate
    if (!createOrderId || !createCarrier || !createTrackingNumber || !createOrigin || !createDestination || !createEstimatedEta) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data } = await createLogistics({
        order_id: createOrderId,
        carrier: createCarrier,
        tracking_number: createTrackingNumber,
        status: createStatus,
        origin: createOrigin,
        destination: createDestination,
        estimated_eta: createEstimatedEta,
      });

      addLogisticsToStore(data);
      queryClient.invalidateQueries({ queryKey: ["logistics"] });

      toast({ title: "Logistics created", description: "New shipment record added." });

      // Reset form
      setCreateOrderId("");
      setCreateCarrier("");
      setCreateTrackingNumber("");
      setCreateStatus("processing");
      setCreateOrigin("");
      setCreateDestination("");
      setCreateEstimatedEta("");
      setIsCreateOpen(false);
    } catch (err) {
      toast({
        title: "Create failed",
        description: "Unable to create logistics record.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedLogistics) return;
    setIsSaving(true);
    try {
       await updateLogistics(selectedLogistics.id, {
        carrier: editCarrier,
        tracking_number: editTrackingNumber,
        status: editStatus,
        origin: editOrigin,
        destination: editDestination,
        estimated_eta: editEstimatedEta,
      });

      const { data } = await getLogisticsItem(selectedLogistics.id);
      updateLogisticsInStore(data);
      setSelectedLogistics(data);
      queryClient.invalidateQueries({ queryKey: ["logistics"] });

      toast({ title: "Logistics updated", description: "Shipment record saved." });
      setIsViewOpen(false);
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Unable to update logistics record.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => setPage(1), [search, statusFilter]);
  useEffect(() => setLogistics(logistics), [logistics, setLogistics]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="In Transit" value={String(inTransitCount)} change="Current shipments" icon={Truck} />
        <StatCard label="Out for Delivery" value={String(outForDeliveryCount)} change="Being delivered" icon={Package} />
        <StatCard label="Delivered" value={String(deliveredCount)} change="Completed" icon={CheckCircle} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Logistics
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logistics ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Tracking Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logistics.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium text-sm">{l.id}</TableCell>
                <TableCell className="font-medium text-sm">{l.order_id}</TableCell>
                <TableCell className="text-sm">{l.order?.user?.full_name}</TableCell>
                <TableCell className="text-sm">{l.carrier}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{l.tracking_number}</TableCell>
                <TableCell>
                  <StatusBadge status={l.status} />
                </TableCell>
                <TableCell className="text-sm">{l.origin}</TableCell>
                <TableCell className="text-sm">{l.destination}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.estimated_eta}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => loadSelected(l.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {meta && meta.total > meta.limit && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <span>
              Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
            </span>
            <Button disabled={page * meta.limit >= meta.total} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Logistics Record</DialogTitle>
            <DialogDescription>Create a new shipment tracking record</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Order ID</Label>
              <Input
                value={createOrderId}
                onChange={(e) => setCreateOrderId(e.target.value)}
                placeholder="e.g., ORD-001"
              />
            </div>

            <div className="space-y-1">
              <Label>Carrier</Label>
              <Input
                value={createCarrier}
                onChange={(e) => setCreateCarrier(e.target.value)}
                placeholder="e.g., DHL Express"
              />
            </div>

            <div className="space-y-1">
              <Label>Tracking Number</Label>
              <Input
                value={createTrackingNumber}
                onChange={(e) => setCreateTrackingNumber(e.target.value)}
                placeholder="e.g., DHL29293946"
              />
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={createStatus} onValueChange={(v: any) => setCreateStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Estimated ETA</Label>
              <Input
                type="date"
                value={createEstimatedEta}
                onChange={(e) => setCreateEstimatedEta(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Origin</Label>
              <Input
                value={createOrigin}
                onChange={(e) => setCreateOrigin(e.target.value)}
                placeholder="e.g., Kerala"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Destination</Label>
              <Input
                value={createDestination}
                onChange={(e) => setCreateDestination(e.target.value)}
                placeholder="e.g., Portland, OR"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Logistics Details</DialogTitle>
            <DialogDescription>{selectedLogistics?.id}</DialogDescription>
          </DialogHeader>

          {selectedLogistics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Logistics ID</p>
                  <p className="font-medium">{selectedLogistics.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Order ID</p>
                  <p className="font-medium">{selectedLogistics.order_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Customer</p>
                  <p className="font-medium">{selectedLogistics.order?.user?.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Customer ID</p>
                  <p className="font-medium text-xs">{selectedLogistics.order?.user?.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Created At</p>
                  <p className="font-medium text-xs">{selectedLogistics.created_at}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Updated At</p>
                  <p className="font-medium text-xs">{selectedLogistics.updated_at}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-1">
                  <Label>Carrier</Label>
                  <Input value={editCarrier} onChange={(e) => setEditCarrier(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label>Tracking Number</Label>
                  <Input value={editTrackingNumber} onChange={(e) => setEditTrackingNumber(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Origin</Label>
                  <Input value={editOrigin} onChange={(e) => setEditOrigin(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label>Destination</Label>
                  <Input value={editDestination} onChange={(e) => setEditDestination(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label>Estimated ETA</Label>
                  <Input
                    type="date"
                    value={editEstimatedEta}
                    onChange={(e) => setEditEstimatedEta(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !selectedLogistics}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ContactAdminSection = () => {
  const [socialLinks, setSocialLinks] = useState(mockSocialLinks);
  const [phones, setPhones] = useState(mockContactPhones);
  const [editDialog, setEditDialog] = useState<{ type: "social" | "phone" | null; item?: any }>({ type: null });

  const deleteSocial = (id: string) => setSocialLinks((prev) => prev.filter((l) => l.id !== id));
  const deletePhone = (id: string) => setPhones((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Social Media Links</h3>
          <Button size="sm" onClick={() => setEditDialog({ type: "social" })}><Plus className="h-4 w-4 mr-1" /> Add Link</Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socialLinks.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.platform}</TableCell>
                  <TableCell>{l.label}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{l.type}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{l.url}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditDialog({ type: "social", item: l })}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSocial(l.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Phone Numbers</h3>
          <Button size="sm" onClick={() => setEditDialog({ type: "phone" })}><Plus className="h-4 w-4 mr-1" /> Add Phone</Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {phones.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div><p className="font-medium text-sm">{p.label}</p><p className="text-muted-foreground text-sm">{p.number}</p></div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditDialog({ type: "phone", item: p })}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePhone(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          <button onClick={() => setEditDialog({ type: "phone" })} className="border-2 border-dashed rounded-lg p-4 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Phone
          </button>
        </div>
      </div>

      <Dialog open={editDialog.type !== null} onOpenChange={() => setEditDialog({ type: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDialog.item ? "Edit" : "Add"} {editDialog.type === "social" ? "Social Link" : "Phone Number"}</DialogTitle>
          </DialogHeader>
          {editDialog.type === "social" ? (
            <div className="space-y-3">
              <div><Label>Platform</Label><Input defaultValue={editDialog.item?.platform} placeholder="e.g. Telegram, Facebook" /></div>
              <div><Label>Label</Label><Input defaultValue={editDialog.item?.label} placeholder="e.g. Follow us on Telegram" /></div>
              <div><Label>URL</Label><Input defaultValue={editDialog.item?.url} placeholder="https://..." /></div>
              <div>
                <Label>Type</Label>
                <Select defaultValue={editDialog.item?.type || "follow"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow">Follow (channels, pages)</SelectItem>
                    <SelectItem value="message">Message (direct chat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div><Label>Label</Label><Input defaultValue={editDialog.item?.label} placeholder="e.g. Main Office" /></div>
              <div><Label>Phone Number</Label><Input defaultValue={editDialog.item?.number} placeholder="+251 ..." /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ type: null })}>Cancel</Button>
            <Button onClick={() => setEditDialog({ type: null })}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ReportsSection = () => (
  <div className="space-y-6">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Monthly Revenue" value="$24,580" change="12% vs last month" icon={DollarSign} />
      <StatCard label="Avg. Order Value" value="$68.40" change="5% increase" icon={ShoppingBag} />
      <StatCard label="Customer Retention" value="78%" change="3% improvement" icon={Users} />
      <StatCard label="Return Rate" value="2.1%" change="0.3% decrease" positive={false} icon={AlertTriangle} />
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border rounded-lg p-5">
        <h3 className="font-display font-semibold mb-4">Revenue by Category</h3>
        <div className="space-y-3">
          {[
            { name: "Fashion", revenue: "$8,603", pct: 35 },
            { name: "Food & Beverages", revenue: "$6,882", pct: 28 },
            { name: "Home & Living", revenue: "$5,408", pct: 22 },
            { name: "Electronics", revenue: "$3,687", pct: 15 },
          ].map((c) => (
            <div key={c.name} className="space-y-1">
              <div className="flex justify-between text-sm"><span>{c.name}</span><span className="font-medium">{c.revenue}</span></div>
              <Progress value={c.pct} className="h-2" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card border rounded-lg p-5">
        <h3 className="font-display font-semibold mb-4">Monthly Trend</h3>
        <div className="space-y-3 text-sm">
          {[
            { month: "January", revenue: "$18,200", orders: 112 },
            { month: "February", revenue: "$19,800", orders: 128 },
            { month: "March", revenue: "$22,100", orders: 145 },
            { month: "April (MTD)", revenue: "$24,580", orders: 156 },
          ].map((m) => (
            <div key={m.month} className="flex items-center justify-between py-2 border-b last:border-0">
              <span>{m.month}</span>
              <div className="flex items-center gap-4"><span className="text-muted-foreground">{m.orders} orders</span><span className="font-semibold w-20 text-right">{m.revenue}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-card border rounded-lg p-5">
      <h3 className="font-display font-semibold mb-4">Top Products</h3>
      <div className="space-y-3">
        {mockProducts.slice(0, 5).map((p, i) => (
          <div key={p.id} className="flex items-center gap-4 py-2 border-b last:border-0">
            <span className="text-lg font-display font-bold text-muted-foreground w-6">#{i + 1}</span>
            <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
            <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></div>
            <div className="text-right"><p className="font-semibold text-sm">${(p.price * (p.reviewCount / 2)).toFixed(0)}</p><p className="text-xs text-muted-foreground">{Math.floor(p.reviewCount / 2)} sold</p></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────

const AdminDashboard = () => {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionContent: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    inventory: <InventorySection />,
    categories: <CategorySection />,
    orders: <OrdersSection />,
    payments: <PaymentsSection />,
    logistics: <LogisticsSection />,
    users: <UsersSection />,
    sellers: <SellersSection />,
    // complaints: <ComplaintsSection />,
    contact: <ContactAdminSection />,
    reports: <ReportsSection />,
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-card border-r flex flex-col transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 border-b h-16 shrink-0">
          <img src={logo} alt="VendorBridge" className="h-8 w-8 shrink-0" width={32} height={32} />
          {!collapsed && <span className="font-display font-bold text-sm whitespace-nowrap">Admin Panel</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => { setActive(s.key); setMobileOpen(false); }}
              title={collapsed ? s.label : undefined}
              className={`flex items-center gap-3 w-full rounded-md text-sm font-medium transition-colors ${
                collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
              } ${
                active === s.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{s.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t space-y-1">
          <Button variant="ghost" size="sm" asChild className={`w-full ${collapsed ? "justify-center px-2" : "justify-start"}`}>
            <Link to="/">
              <Home className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="ml-2">Back to Store</span>}
            </Link>
          </Button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors justify-center"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${collapsed ? "lg:ml-[68px]" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-lg px-6 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-lg capitalize">{sections.find(s => s.key === active)?.label || active}</h1>
          <Badge className="ml-auto bg-success text-success-foreground">System Online</Badge>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {sectionContent[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
