import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Clock, XCircle, Loader, MessageSquare, Plus, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getOrders } from "@/api/order.api";
import { getComplaints, createComplaint } from "@/api/complaint.api";
import { getComplaintMessages, createComplaintMessage } from "@/api/complaint-message.api";
import { useOrderStore } from "@/features/order/order.store";
import { useComplaintStore } from "@/features/complaint/complaint.store";
import { useComplaintMessageStore } from "@/features/complaint-message/complaint-message.store";
import { useToast } from "@/hooks/use-toast";
import type { OrderStatus } from "@/types/order";

const statusConfig: Record<OrderStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: "bg-muted text-muted-foreground", label: "Pending" },
  confirmed: { icon: <Package className="h-4 w-4" />, color: "bg-primary text-primary-foreground", label: "Confirmed" },
  out_for_delivery: { icon: <Truck className="h-4 w-4" />, color: "bg-secondary text-secondary-foreground", label: "Out for Delivery" },
  delivered: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-success text-success-foreground", label: "Delivered" },
  cancelled: { icon: <XCircle className="h-4 w-4" />, color: "bg-destructive text-destructive-foreground", label: "Cancelled" },
  rejected: { icon: <XCircle className="h-4 w-4" />, color: "bg-destructive text-destructive-foreground", label: "Rejected" },
};

const statusSteps: OrderStatus[] = ["pending", "confirmed", "out_for_delivery", "delivered"];

const Orders = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const setOrders = useOrderStore((s) => s.setOrders);
  
  // Complaint state
  const [isCreateComplaintOpen, setIsCreateComplaintOpen] = useState(false);
  const [isViewComplaintsOpen, setIsViewComplaintsOpen] = useState(false);
  const [selectedOrderIdForComplaints, setSelectedOrderIdForComplaints] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintReply, setComplaintReply] = useState("");
  const [isCreatingComplaint, setIsCreatingComplaint] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  const setComplaints = useComplaintStore((s) => s.setComplaints);
  const complaints = useComplaintStore((s) => s.complaints);
  const addComplaint = useComplaintStore((s) => s.addComplaint);
  
  const setComplaintMessages = useComplaintMessageStore((s) => s.setComplaintMessages);
  const complaintMessages = useComplaintMessageStore((s) => s.complaintMessages);
  const addComplaintMessage = useComplaintMessageStore((s) => s.addComplaintMessage);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ["orders", { page, limit }],
    queryFn: async () => await getOrders({ page, limit }),
    placeholderData: keepPreviousData,
  });

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

  const orders = response?.data?.data ?? [];
  const meta = response?.data?.meta;

  useEffect(() => {
    setOrders(orders);
  }, [orders, setOrders]);

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

  const handleCreateComplaint = async (orderId: string) => {
    if (!complaintSubject.trim() || !complaintDescription.trim()) {
      toast({ title: "Validation error", description: "Subject and description are required.", variant: "destructive" });
      return;
    }
    setIsCreatingComplaint(true);
    try {
      const { data } = await createComplaint({
        order_id: orderId,
        subject: complaintSubject.trim(),
        description: complaintDescription.trim(),
      });
      addComplaint(data);
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast({ title: "Complaint created", description: "Your complaint has been submitted." });
      setIsCreateComplaintOpen(false);
      setComplaintSubject("");
      setComplaintDescription("");
    } catch (err) {
      toast({ title: "Create failed", description: "Unable to create complaint.", variant: "destructive" });
    } finally {
      setIsCreatingComplaint(false);
    }
  };

  const handleViewComplaints = (orderId: string) => {
    setSelectedOrderIdForComplaints(orderId);
    setSelectedComplaint(null);
    setIsViewComplaintsOpen(true);
  };

  const handleSelectComplaint = (complaint: any) => {
    setSelectedComplaint(complaint);
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

  if (isLoading && orders.length === 0) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center items-center">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground mb-4">Unable to load orders.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No orders yet.</p>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => {
                const config = statusConfig[order.status];
                const currentStep = statusSteps.indexOf(order.status as OrderStatus);
                return (
                  <div key={order.id} className="bg-card border rounded-lg p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-display font-bold text-lg">{order.id}</span>
                        <span className="text-sm text-muted-foreground ml-3">Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={config.color + " gap-1"}>{config.icon} {config.label}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{order.payment_status}</Badge>
                      </div>
                    </div>

                    {/* Progress */}
                    {order.status !== "cancelled" && order.status !== "rejected" && (
                      <div className="flex items-center gap-1">
                        {statusSteps.map((step, i) => (
                          <div key={step} className="flex items-center flex-1">
                            <div className={`h-2 flex-1 rounded-full ${i <= currentStep ? "bg-primary" : "bg-muted"}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1">
                      {order.products.map((product) => (
                        <div key={product.id} className="flex justify-between text-sm">
                          <span>
                            Product: {product.id.substring(0, 8)}... × {product.quantity}
                          </span>
                          <span>${(Number(product.price) * product.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-between text-sm border-t pt-3">
                      <div className="text-muted-foreground">
                        <span className="capitalize">Payment: {order.payment_method}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold">Total: ${Number(order.total_amount).toFixed(2)}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrderIdForComplaints(order.id);
                              setIsCreateComplaintOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Create Complaint
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewComplaints(order.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            View Complaints
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {meta && meta.total > meta.limit && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                  Prev
                </Button>
                <span className="text-sm">
                  Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
                </span>
                <Button
                  disabled={page * meta.limit >= meta.total}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Create Complaint Dialog */}
      <Dialog open={isCreateComplaintOpen} onOpenChange={(open) => { if (!open) { setIsCreateComplaintOpen(false); setSelectedOrderIdForComplaints(null); setComplaintSubject(""); setComplaintDescription(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Complaint</DialogTitle>
            <DialogDescription>Submit a complaint about your order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
                placeholder="Brief summary of your complaint"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                placeholder="Detailed description of your complaint"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsCreateComplaintOpen(false); setSelectedOrderIdForComplaints(null); setComplaintSubject(""); setComplaintDescription(""); }}>Cancel</Button>
            <Button onClick={() => selectedOrderIdForComplaints && handleCreateComplaint(selectedOrderIdForComplaints)} disabled={isCreatingComplaint}>
              {isCreatingComplaint ? "Submitting..." : "Submit Complaint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Complaints Dialog */}
      <Dialog open={isViewComplaintsOpen} onOpenChange={(open) => { if (!open) { setIsViewComplaintsOpen(false); setSelectedOrderIdForComplaints(null); setSelectedComplaint(null); } }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order Complaints</DialogTitle></DialogHeader>
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Complaints List */}
            <div className="space-y-4">
              <h4 className="font-medium">Complaints</h4>
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
                        <Badge variant="outline" className="text-xs capitalize">{complaint.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{complaint.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs capitalize">{complaint.priority}</Badge>
                        <p className="text-xs text-muted-foreground">{new Date(complaint.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Complaint Messages */}
            <div className="space-y-4">
              {selectedComplaint ? (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium">Complaint Details</h4>
                    <div className="space-y-1 text-sm">
                      <div><p className="text-muted-foreground text-xs">Subject</p><p>{selectedComplaint.subject}</p></div>
                      <div><p className="text-muted-foreground text-xs">Description</p><p>{selectedComplaint.description}</p></div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{selectedComplaint.status}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{selectedComplaint.priority}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Messages</h4>
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
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Select a complaint to view details and messages.</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsViewComplaintsOpen(false); setSelectedOrderIdForComplaints(null); setSelectedComplaint(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Orders;
