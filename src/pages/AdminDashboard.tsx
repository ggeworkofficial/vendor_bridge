import { useState } from "react";
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
import { mockProducts, mockOrders } from "@/lib/mock-data";
import { mockSocialLinks, mockContactPhones, mockPaymentAccounts, type SocialLink, type ContactPhone, type PaymentAccount } from "@/lib/contact-data";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "inventory", label: "Inventory", icon: Package },
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

const mockUsers = [
  { id: "U001", name: "Sarah Kim", email: "sarah@example.com", role: "buyer", orders: 12, joined: "2026-01-15", status: "active" },
  { id: "U002", name: "Mike Ross", email: "mike@example.com", role: "buyer", orders: 8, joined: "2026-02-20", status: "active" },
  { id: "U003", name: "Anna Lee", email: "anna@example.com", role: "contributor", orders: 0, joined: "2026-03-01", status: "active" },
  { id: "U004", name: "James Chen", email: "james@example.com", role: "buyer", orders: 3, joined: "2026-03-10", status: "suspended" },
  { id: "U005", name: "Priya Sharma", email: "priya@example.com", role: "contributor", orders: 0, joined: "2026-03-22", status: "active" },
  { id: "U006", name: "Alex Turner", email: "alex@example.com", role: "buyer", orders: 25, joined: "2025-11-05", status: "active" },
];

const mockSellers = [
  { id: "S001", name: "Artisan Leather Co.", location: "Marrakech, Morocco", products: 14, verified: true, revenue: "$12,400", contact: "+212 555 0101" },
  { id: "S002", name: "Kerala Spice Farm", location: "Kerala, India", products: 8, verified: true, revenue: "$8,200", contact: "+91 555 0202" },
  { id: "S003", name: "Jingdezhen Ceramics", location: "Jingdezhen, China", products: 22, verified: true, revenue: "$15,600", contact: "+86 555 0303" },
  { id: "S004", name: "Bali Bamboo Works", location: "Bali, Indonesia", products: 6, verified: false, revenue: "$3,100", contact: "+62 555 0404" },
  { id: "S005", name: "Nairobi Solar Hub", location: "Nairobi, Kenya", products: 4, verified: false, revenue: "$1,800", contact: "+254 555 0505" },
];

const mockComplaints = [
  { id: "C001", user: "Sarah Kim", orderId: "ORD-001", subject: "Damaged product on arrival", status: "open", priority: "high", date: "2026-04-08", description: "The leather bag had a visible scratch on the front panel when delivered." },
  { id: "C002", user: "Mike Ross", orderId: "ORD-002", subject: "Wrong item delivered", status: "investigating", priority: "high", date: "2026-04-07", description: "Received spice collection instead of the bamboo basket ordered." },
  { id: "C003", user: "Alex Turner", orderId: "ORD-098", subject: "Late delivery", status: "resolved", priority: "medium", date: "2026-04-03", description: "Package arrived 5 days after estimated delivery date." },
  { id: "C004", user: "James Chen", orderId: "ORD-045", subject: "Missing items in order", status: "open", priority: "medium", date: "2026-04-09", description: "Ordered 3 scarves but only received 2 in the package." },
  { id: "C005", user: "Priya Sharma", orderId: "ORD-072", subject: "Quality not as described", status: "investigating", priority: "low", date: "2026-04-05", description: "The honey jar label says organic but tastes different from expected." },
];

const mockLogistics = [
  { id: "SH001", orderId: "ORD-001", carrier: "DHL Express", tracking: "DHL9283746", status: "in_transit", origin: "Marrakech", destination: "San Francisco, CA", eta: "2026-04-12" },
  { id: "SH002", orderId: "ORD-002", carrier: "FedEx", tracking: "FX8374652", status: "processing", origin: "Kerala", destination: "Portland, OR", eta: "2026-04-15" },
  { id: "SH003", orderId: "ORD-098", carrier: "UPS", tracking: "UPS7463829", status: "delivered", origin: "Istanbul", destination: "New York, NY", eta: "2026-04-01" },
  { id: "SH004", orderId: "ORD-045", carrier: "DHL Express", tracking: "DHL6253948", status: "in_transit", origin: "Jingdezhen", destination: "London, UK", eta: "2026-04-14" },
  { id: "SH005", orderId: "ORD-072", carrier: "Local Courier", tracking: "LC9384756", status: "out_for_delivery", origin: "Manuka", destination: "Sydney, AU", eta: "2026-04-10" },
];

const allOrders = [
  { id: "ORD-156", customer: "Sarah K.", items: 1, amount: "$89.99", status: "confirmed", payment: "paid", paymentMethod: "full", date: "2026-04-09" },
  { id: "ORD-155", customer: "Mike R.", items: 3, amount: "$145.50", status: "delivered", payment: "paid", paymentMethod: "advance", date: "2026-04-08" },
  { id: "ORD-154", customer: "Anna L.", items: 1, amount: "$62.00", status: "out_for_delivery", payment: "paid", paymentMethod: "cod", date: "2026-04-08" },
  { id: "ORD-153", customer: "James C.", items: 2, amount: "$50.75", status: "pending", payment: "unpaid", paymentMethod: "advance", date: "2026-04-07" },
  { id: "ORD-152", customer: "Alex T.", items: 4, amount: "$198.00", status: "delivered", payment: "paid", paymentMethod: "full", date: "2026-04-06" },
  { id: "ORD-151", customer: "Priya S.", items: 1, amount: "$18.75", status: "cancelled", payment: "unpaid", paymentMethod: "cod", date: "2026-04-05" },
  { id: "ORD-150", customer: "Emma W.", items: 2, amount: "$67.99", status: "confirmed", payment: "paid", paymentMethod: "full", date: "2026-04-04" },
];

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
          {allOrders.slice(0, 4).map((o) => (
            <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div><span className="font-medium">{o.id}</span><span className="text-muted-foreground ml-2">{o.customer}</span></div>
              <div className="flex items-center gap-3"><span>{o.amount}</span><StatusBadge status={o.status} /></div>
            </div>
          ))}
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const filtered = mockProducts.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Fashion">Fashion</SelectItem>
            <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
            <SelectItem value="Home & Living">Home & Living</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
          </SelectContent>
        </Select>
        <Button><Package className="h-4 w-4 mr-2" /> Add Product</Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    <div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{p.location}</p></div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{p.category}</Badge></TableCell>
                <TableCell className="font-medium">${p.price.toFixed(2)}</TableCell>
                <TableCell><Badge className={`text-xs ${p.qualityLabel === "high" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{p.qualityLabel}</Badge></TableCell>
                <TableCell>{p.verified ? <Badge className="bg-success/10 text-success text-xs gap-1"><BadgeCheck className="h-3 w-3" />Verified</Badge> : <Badge variant="outline" className="text-xs text-muted-foreground gap-1"><Clock className="h-3 w-3" />Pending</Badge>}</TableCell>
                <TableCell><div className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-secondary text-secondary" />{p.rating}</div></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const OrdersSection = () => {
  const [tab, setTab] = useState("all");
  const filteredOrders = tab === "all" ? allOrders : allOrders.filter((o) => o.status === tab);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({allOrders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="out_for_delivery">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.id}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell>{o.items}</TableCell>
                <TableCell className="font-medium">{o.amount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">
                    {o.paymentMethod === "cod" ? "Cash on Delivery" : o.paymentMethod === "advance" ? "Advance (30%)" : "Full Payment"}
                  </Badge>
                </TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell><StatusBadge status={o.payment} /></TableCell>
                <TableCell className="text-muted-foreground text-sm">{o.date}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const PaymentsSection = () => {
  const [selected, setSelected] = useState<typeof mockReceipts[0] | null>(null);
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? mockReceipts : mockReceipts.filter((r) => r.status === tab);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending Review" value={String(mockReceipts.filter(r => r.status === "pending_review").length)} change="Needs attention" positive={false} icon={Receipt} />
        <StatCard label="Approved" value={String(mockReceipts.filter(r => r.status === "approved").length)} change="This week" icon={CheckCircle} />
        <StatCard label="Total Collected" value="$201.87" change="Via transfers" icon={DollarSign} />
      </div>

      <div>
        <h3 className="font-display font-semibold mb-3">Payment Accounts</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {mockPaymentAccounts.map((acc) => (
            <div key={acc.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{acc.label}</p>
                <p className="text-xs text-muted-foreground">{acc.accountName} · {acc.accountNumber}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          <button className="border-2 border-dashed rounded-lg p-4 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Payment Account
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold mb-3">Uploaded Receipts</h3>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({mockReceipts.length})</TabsTrigger>
            <TabsTrigger value="pending_review">Pending Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="border rounded-lg overflow-hidden mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.orderId}</TableCell>
                  <TableCell>{r.customer}</TableCell>
                  <TableCell className="font-medium">{r.amount}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{r.method === "advance" ? "Advance 30%" : "Full"}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.account}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Receipt {selected?.id}</DialogTitle>
            <DialogDescription>Order {selected?.orderId} · {selected?.customer}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground text-xs">Amount</p><p className="font-semibold">{selected?.amount}</p></div>
              <div><p className="text-muted-foreground text-xs">Method</p><p className="font-medium capitalize">{selected?.method}</p></div>
              <div><p className="text-muted-foreground text-xs">Account Used</p><p className="font-medium">{selected?.account}</p></div>
              <div><p className="text-muted-foreground text-xs">Uploaded</p><p className="font-medium">{selected?.uploadedAt}</p></div>
            </div>
            <div className="bg-muted/50 rounded-lg p-8 flex flex-col items-center gap-2">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Receipt image preview</p>
              <p className="text-xs text-muted-foreground">(In production, the uploaded receipt image would display here)</p>
            </div>
            {selected?.note && <p className="text-sm bg-accent/50 p-3 rounded-lg"><span className="font-medium">Note:</span> {selected.note}</p>}
            <div><Label>Admin Note</Label><Textarea placeholder="Add a note about this receipt..." rows={2} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button variant="destructive">Reject</Button>
            <Button className="bg-success hover:bg-success/90">Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const UsersSection = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const filtered = mockUsers.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

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
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell><div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></TableCell>
                <TableCell><Badge variant="outline" className="text-xs capitalize">{u.role}</Badge></TableCell>
                <TableCell>{u.orders}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.joined}</TableCell>
                <TableCell><StatusBadge status={u.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="h-4 w-4" /></Button>
                    {u.status === "active" ? <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><XCircle className="h-4 w-4" /></Button> : <Button variant="ghost" size="icon" className="h-8 w-8 text-success"><CheckCircle className="h-4 w-4" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const SellersSection = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <p className="text-sm text-muted-foreground">Internal seller tracking — not visible to buyers</p>
      <Button><Store className="h-4 w-4 mr-2" /> Add Seller</Button>
    </div>
    <div className="grid gap-4">
      {mockSellers.map((s) => (
        <div key={s.id} className="bg-card border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-display font-semibold">{s.name}</h4>
              {s.verified ? <Badge className="bg-success/10 text-success text-xs gap-1"><BadgeCheck className="h-3 w-3" />Verified</Badge> : <Badge variant="outline" className="text-xs text-muted-foreground">Unverified</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{s.location}</span>
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{s.contact}</span>
              <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{s.products} products</span>
            </div>
          </div>
          <div className="text-right"><p className="font-display font-bold text-lg">{s.revenue}</p><p className="text-xs text-muted-foreground">Total revenue</p></div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button>
            {!s.verified && <Button size="sm"><CheckCircle className="h-4 w-4 mr-1" />Verify</Button>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ComplaintsSection = () => {
  const [selected, setSelected] = useState<typeof mockComplaints[0] | null>(null);
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? mockComplaints : mockComplaints.filter((c) => c.status === tab);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({mockComplaints.length})</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="investigating">Investigating</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-card border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelected(c)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{c.id}</span>
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
                <h4 className="font-semibold">{c.subject}</h4>
                <p className="text-sm text-muted-foreground mt-1">By {c.user} · Order {c.orderId} · {c.date}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MessageSquare className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <DialogDescription>{selected?.id} · {selected?.user} · Order {selected?.orderId}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2"><PriorityBadge priority={selected?.priority || "low"} /><StatusBadge status={selected?.status || "open"} /></div>
            <p className="text-sm">{selected?.description}</p>
            <div><label className="text-sm font-medium mb-1 block">Admin Response</label><Textarea placeholder="Type your response..." rows={3} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button variant="destructive">Escalate</Button>
            <Button>Mark Resolved</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LogisticsSection = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="In Transit" value="23" change="5 new today" icon={Truck} />
      <StatCard label="Out for Delivery" value="8" change="3 arriving today" icon={Package} />
      <StatCard label="Delivered (30d)" value="342" change="12% vs last month" icon={CheckCircle} />
    </div>
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shipment</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>ETA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockLogistics.map((l) => (
            <TableRow key={l.id}>
              <TableCell><div><p className="font-medium text-sm">{l.id}</p><p className="text-xs text-muted-foreground">{l.tracking}</p></div></TableCell>
              <TableCell className="font-medium">{l.orderId}</TableCell>
              <TableCell>{l.carrier}</TableCell>
              <TableCell className="text-sm"><span className="text-muted-foreground">{l.origin}</span><span className="mx-1">→</span><span>{l.destination}</span></TableCell>
              <TableCell><StatusBadge status={l.status} /></TableCell>
              <TableCell className="text-sm">{l.eta}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

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
    orders: <OrdersSection />,
    payments: <PaymentsSection />,
    logistics: <LogisticsSection />,
    users: <UsersSection />,
    sellers: <SellersSection />,
    complaints: <ComplaintsSection />,
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
