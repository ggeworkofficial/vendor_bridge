import { useState } from "react";
import { Package, Truck, DollarSign, Clock, Filter, Search, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getBulkOrders } from "@/api/bulk.api";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const BulkOrderDashboard = () => {
  const user = useAuth((state) => state.user);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["bulk-orders"],
    queryFn: () => getBulkOrders(),
  });

  const orders = ordersData?.data?.data ?? [];

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.product_name.toLowerCase().includes(search.toLowerCase()) ||
      order.seller_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openViewDialog = (order: any) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    partial_shipment: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    shipped: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const paymentStatusColors: Record<string, string> = {
    unpaid: "bg-red-500/10 text-red-500 border-red-500/20",
    partial: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    paid: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  const myOrders = orders.filter((order: any) => order.buyer_id === user?.id);
  const sellerOrders = orders.filter((order: any) => order.seller_id === user?.id);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Bulk Orders</h1>
          <p className="text-muted-foreground">Manage your bulk purchase orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{orders.filter((o: any) => o.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Truck className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">{orders.filter((o: any) => ["shipped", "partial_shipment"].includes(o.status)).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${orders.reduce((sum: number, o: any) => sum + o.total_amount, 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product or seller..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="partial_shipment">Partial Shipment</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="my">My Orders</TabsTrigger>
            {user?.role === "seller" && <TabsTrigger value="seller">Seller Orders</TabsTrigger>}
          </TabsList>

          <TabsContent value="all">
            <OrderList orders={filteredOrders} statusColors={statusColors} paymentStatusColors={paymentStatusColors} onView={openViewDialog} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="my">
            <OrderList orders={myOrders.filter((o: any) => {
              const matchesSearch = o.product_name.toLowerCase().includes(search.toLowerCase()) || o.seller_name.toLowerCase().includes(search.toLowerCase());
              const matchesStatus = statusFilter === "all" || o.status === statusFilter;
              return matchesSearch && matchesStatus;
            })} statusColors={statusColors} paymentStatusColors={paymentStatusColors} onView={openViewDialog} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="seller">
            <OrderList orders={sellerOrders.filter((o: any) => {
              const matchesSearch = o.product_name.toLowerCase().includes(search.toLowerCase()) || o.buyer_name.toLowerCase().includes(search.toLowerCase());
              const matchesStatus = statusFilter === "all" || o.status === statusFilter;
              return matchesSearch && matchesStatus;
            })} statusColors={statusColors} paymentStatusColors={paymentStatusColors} onView={openViewDialog} isLoading={isLoading} />
          </TabsContent>
        </Tabs>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Product</Label>
                    <p className="font-medium">{selectedOrder.product_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Quantity</Label>
                    <p>{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Unit Price</Label>
                    <p>${selectedOrder.unit_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-bold text-lg">${selectedOrder.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Buyer</Label>
                    <p>{selectedOrder.buyer_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Seller</Label>
                    <p>{selectedOrder.seller_name}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Delivery Address</Label>
                  <p>{selectedOrder.delivery_address}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <Label className="text-muted-foreground">Order Status</Label>
                    <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Status</Label>
                    <Badge className={paymentStatusColors[selectedOrder.payment_status]}>{selectedOrder.payment_status}</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Created: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedOrder.updated_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

const OrderList = ({ orders, statusColors, paymentStatusColors, onView, isLoading }: any) => {
  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
        No orders found.
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg divide-y">
      {orders.map((order: any) => (
        <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold">{order.product_name}</h3>
                <Badge className={statusColors[order.status]}>{order.status}</Badge>
                <Badge className={paymentStatusColors[order.payment_status]}>{order.payment_status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Seller:</span> {order.seller_name}
                </div>
                <div>
                  <span className="font-medium">Buyer:</span> {order.buyer_name}
                </div>
                <div>
                  <span className="font-medium">Quantity:</span> {order.quantity}
                </div>
                <div>
                  <span className="font-medium">Total:</span> ${order.total_amount.toFixed(2)}
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="font-medium text-muted-foreground">Created:</span>{" "}
                <span className="text-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onView(order)}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BulkOrderDashboard;
