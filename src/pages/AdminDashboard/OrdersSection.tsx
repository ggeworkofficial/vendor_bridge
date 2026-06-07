import { useState, useEffect } from "react";
import { Eye, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseDialog, AppDialogHeader, AppDialogFooter, AppDialogSection } from "@/components/ui/app-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrder, updateOrder } from "@/api/order.api";
import { getComplaints, updateComplaint } from "@/api/complaint.api";
import { getComplaintMessages, createComplaintMessage } from "@/api/complaint-message.api";
import { useOrderStore } from "@/features/order/order.store";
import { useComplaintStore } from "@/features/complaint/complaint.store";
import { useComplaintMessageStore } from "@/features/complaint-message/complaint-message.store";
import { useToast } from "@/hooks/use-toast";
import { keepPreviousData } from "@tanstack/react-query";

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

const OrdersSection = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editStatus, setEditStatus] = useState("pending");
  
  // Complaint state
  const [isComplaintsOpen, setIsComplaintsOpen] = useState(false);
  const [selectedOrderIdForComplaints, setSelectedOrderIdForComplaints] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [complaintReply, setComplaintReply] = useState("");
  const [complaintEditStatus, setComplaintEditStatus] = useState<"open" | "investigating" | "resolved">("open");
  const [complaintEditPriority, setComplaintEditPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isUpdatingComplaint, setIsUpdatingComplaint] = useState(false);

  const setOrders = useOrderStore((s) => s.setOrders);
  const selectedOrder = useOrderStore((s) => s.selectedOrder);
  const setSelectedOrder = useOrderStore((s) => s.setSelectedOrder);
  const updateOrderInStore = useOrderStore((s) => s.updateOrder);
  
  const setComplaints = useComplaintStore((s) => s.setComplaints);
  const complaints = useComplaintStore((s) => s.complaints);
  const updateComplaintInStore = useComplaintStore((s) => s.updateComplaint);
  
  const setComplaintMessages = useComplaintMessageStore((s) => s.setComplaintMessages);
  const complaintMessages = useComplaintMessageStore((s) => s.complaintMessages);
  const addComplaintMessage = useComplaintMessageStore((s) => s.addComplaintMessage);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useOrders = (params: any) =>
    useQuery({ queryKey: ["orders", params], queryFn: async () => await getOrders(params), placeholderData: keepPreviousData });

  const useComplaintsQuery = (params: any) =>
    useQuery({
      queryKey: ["complaints", params],
      queryFn: async () => await getComplaints(params),
      enabled: !!selectedOrderIdForComplaints,
    });

  const useComplaintMessagesQuery = (params: any) =>
    useQuery({
      queryKey: ["complaint-messages", params],
      queryFn: async () => await getComplaintMessages(params),
      enabled: !!selectedComplaint,
    });

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

  const complaintsResponse = useComplaintsQuery({
    order_id: selectedOrderIdForComplaints || undefined,
    limit: 100,
  });

  const complaintsData = complaintsResponse.data?.data?.data ?? [];

  const messagesResponse = useComplaintMessagesQuery({
    complaint_id: selectedComplaint?.id || undefined,
    limit: 100,
  });

  const messagesData = messagesResponse.data?.data?.data ?? [];

  useEffect(() => {
    if (complaintsData.length > 0) {
      setComplaints(complaintsData);
    }
  }, [complaintsData, setComplaints]);

  useEffect(() => {
    if (messagesData.length > 0) {
      setComplaintMessages(messagesData);
    }
  }, [messagesData, setComplaintMessages]);

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
      const { data } = await getOrder(selectedOrder.id);
      updateOrderInStore(data);
      setSelectedOrder(data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Order updated", description: "Order status updated." });
      setIsViewOpen(false);
    } catch (err) {
      toast({ title: "Update failed", description: "Unable to update order.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewComplaints = (orderId: string) => {
    setSelectedOrderIdForComplaints(orderId);
    setSelectedComplaint(null);
    setIsComplaintsOpen(true);
  };

  const handleSelectComplaint = (complaint: any) => {
    setSelectedComplaint(complaint);
    setComplaintEditStatus(complaint.status);
    setComplaintEditPriority(complaint.priority);
  };

  const handleSendReply = async () => {
    if (!selectedComplaint || !complaintReply.trim()) return;
    setIsSendingReply(true);
    try {
      const { data } = await createComplaintMessage({
        complaint_id: selectedComplaint.id,
        message: complaintReply.trim(),
      });
      addComplaintMessage(data);
      setComplaintReply("");
      queryClient.invalidateQueries({ queryKey: ["complaint-messages"] });
      toast({ title: "Reply sent" });
    } catch (err) {
      toast({ title: "Send failed", description: "Unable to send reply.", variant: "destructive" });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    setIsUpdatingComplaint(true);
    try {
      const { data } = await updateComplaint(selectedComplaint.id, {
        status: complaintEditStatus,
        priority: complaintEditPriority,
      });
      updateComplaintInStore(data);
      setSelectedComplaint(data);
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast({ title: "Complaint updated" });
    } catch (err) {
      toast({ title: "Update failed", description: "Unable to update complaint.", variant: "destructive" });
    } finally {
      setIsUpdatingComplaint(false);
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewComplaints(o.id)}>
                      <MessageSquare className="h-4 w-4" />
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
      <BaseDialog open={isViewOpen} onOpenChange={setIsViewOpen} maxWidth="2xl">
        <AppDialogHeader title="Order Details" />
        {selectedOrder ? (
          <div className="space-y-4">
            <AppDialogSection title="Order Information">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p><strong>Order ID</strong></p><p>{selectedOrder.id}</p></div>
                <div><p><strong>Customer</strong></p><p>{selectedOrder.user?.full_name}</p><p className="text-xs text-muted-foreground">ID: {selectedOrder.user?.id}</p></div>
                <div><p><strong>Address</strong></p><p className="text-sm">{selectedOrder.address}</p></div>
                <div><p><strong>Total</strong></p><p>${Number(selectedOrder.total_amount).toFixed(2)}</p></div>
                <div><p><strong>Created At</strong></p><p>{selectedOrder.created_at}</p></div>
                <div><p><strong>Updated At</strong></p><p>{selectedOrder.updated_at}</p></div>
              </div>
            </AppDialogSection>
            <AppDialogSection title="Status Update">
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
            </AppDialogSection>
            <AppDialogSection title="Products">
              <div className="space-y-2 mt-2">
                {selectedOrder.products.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <div>Product ID: {p.id}</div>
                    <div>Qty: {p.quantity}</div>
                    <div className="font-medium">${Number(p.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </AppDialogSection>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading order...</p>
        )}
        <AppDialogFooter
          secondaryAction={{ label: "Close", onClick: () => setIsViewOpen(false) }}
          primaryAction={{
            label: "Save Changes",
            onClick: handleSave,
            disabled: isSaving || !selectedOrder,
            loading: isSaving
          }}
        />
      </BaseDialog>
      
      {/* Complaints Dialog */}
      <BaseDialog open={isComplaintsOpen} onOpenChange={(open) => { if (!open) { setIsComplaintsOpen(false); setSelectedOrderIdForComplaints(null); setSelectedComplaint(null); } }} maxWidth="4xl">
        <AppDialogHeader title="Order Complaints" />
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Complaints List */}
          <AppDialogSection title="Complaints">
            {complaints.length === 0 ? (
              <p className="text-sm text-muted-foreground">No complaints for this order.</p>
            ) : (
              <div className="space-y-2">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    onClick={() => handleSelectComplaint(complaint)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedComplaint?.id === complaint.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{complaint.subject}</p>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{complaint.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs capitalize">{complaint.priority}</Badge>
                      <p className="text-xs text-muted-foreground">{complaint.user.full_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppDialogSection>
          
          {/* Complaint Messages */}
          <div className="space-y-4">
            {selectedComplaint ? (
              <>
                <AppDialogSection title="Complaint Details">
                  <div className="space-y-1 text-sm">
                    <div><p className="text-muted-foreground text-xs">Subject</p><p>{selectedComplaint.subject}</p></div>
                    <div><p className="text-muted-foreground text-xs">Description</p><p>{selectedComplaint.description}</p></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Status</Label>
                        <Select value={complaintEditStatus} onValueChange={(v: any) => setComplaintEditStatus(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select value={complaintEditPriority} onValueChange={(v: any) => setComplaintEditPriority(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleUpdateComplaint} disabled={isUpdatingComplaint} className="w-full">
                      {isUpdatingComplaint ? "Updating..." : "Update Complaint"}
                    </Button>
                  </div>
                </AppDialogSection>
                
                <AppDialogSection title="Messages">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {complaintMessages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No messages yet.</p>
                    ) : (
                      complaintMessages.map((msg) => (
                        <div key={msg.id} className={`p-2 rounded-lg ${msg.sender.role === "admin" ? "bg-primary/10 ml-8" : "bg-muted"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-xs">{msg.sender.full_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</p>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      value={complaintReply}
                      onChange={(e) => setComplaintReply(e.target.value)}
                      placeholder="Type your reply..."
                      rows={2}
                    />
                    <Button onClick={handleSendReply} disabled={isSendingReply || !complaintReply.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </AppDialogSection>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Select a complaint to view details and messages.</p>
              </div>
            )}
          </div>
        </div>
        <AppDialogFooter
          secondaryAction={{ label: "Close", onClick: () => { setIsComplaintsOpen(false); setSelectedOrderIdForComplaints(null); setSelectedComplaint(null); } }}
        />
      </BaseDialog>
    </div>
  );
};

export default OrdersSection;
