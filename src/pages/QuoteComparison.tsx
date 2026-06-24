import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Clock, Truck, DollarSign, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRFQ, getRFQQuotes, updateRFQQuote } from "@/api/bulk.api";
import { createBulkOrder } from "@/api/bulk.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const QuoteComparison = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: rfqData, isLoading: rfqLoading } = useQuery({
    queryKey: ["rfq", id],
    queryFn: () => getRFQ(id),
    enabled: !!id,
  });

  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ["rfq-quotes", id],
    queryFn: () => getRFQQuotes({ rfq_id: id }),
    enabled: !!id,
  });

  const rfq = rfqData?.data;
  const quotes = quotesData?.data?.data ?? [];

  const acceptMutation = useMutation({
    mutationFn: (quoteId: string) => updateRFQQuote(quoteId, { status: "accepted" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfq-quotes", id] });
      queryClient.invalidateQueries({ queryKey: ["rfq", id] });
      toast({ title: "Quote Accepted", description: "Quote has been accepted. Proceeding to order." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to accept quote.", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ quoteId, reason }: { quoteId: string; reason: string }) =>
      updateRFQQuote(quoteId, { status: "rejected" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfq-quotes", id] });
      setRejectDialogOpen(false);
      setRejectionReason("");
      toast({ title: "Quote Rejected", description: "Quote has been rejected." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject quote.", variant: "destructive" });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => createBulkOrder(data),
    onSuccess: () => {
      toast({ title: "Order Created", description: "Your bulk order has been created successfully." });
      navigate("/bulk/orders");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create order.", variant: "destructive" });
    },
  });

  const handleAccept = (quote: any) => {
    acceptMutation.mutate(quote.id);
  };

  const handleReject = () => {
    if (selectedQuote && rejectionReason.trim()) {
      rejectMutation.mutate({ quoteId: selectedQuote.id, reason: rejectionReason.trim() });
    }
  };

  const openRejectDialog = (quote: any) => {
    setSelectedQuote(quote);
    setRejectDialogOpen(true);
  };

  const handleCreateOrder = (quote: any) => {
    if (!user || !rfq) return;

    const payload = {
      rfq_id: rfq.id,
      quote_id: quote.id,
      buyer_id: user.id,
      buyer_name: user.email || "Unknown",
      seller_id: quote.seller_id,
      seller_name: quote.seller_name,
      product_id: rfq.product_id,
      product_name: rfq.product_name,
      quantity: rfq.quantity,
      unit_price: quote.unit_price,
      total_amount: quote.total_price,
      delivery_address: rfq.delivery_location,
    };

    createOrderMutation.mutate(payload);
  };

  if (rfqLoading || quotesLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
          Loading quotes...
        </div>
      </Layout>
    );
  }

  if (!rfq) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">RFQ not found.</div>
      </Layout>
    );
  }

  const pendingQuotes = quotes.filter((q: any) => q.status === "pending");

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Compare Quotes</h1>
          <p className="text-muted-foreground">Review and compare quotes from sellers for your RFQ</p>
        </div>

        {/* RFQ Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>RFQ Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground">Product</Label>
                <p className="font-medium">{rfq.product_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Quantity</Label>
                <p className="font-medium">{rfq.quantity}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Budget</Label>
                <p className="font-medium">{rfq.budget ? `$${rfq.budget.toFixed(2)}` : "Not specified"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Delivery Deadline</Label>
                <p className="font-medium">{new Date(rfq.delivery_deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotes */}
        {pendingQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No pending quotes available for this RFQ.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingQuotes.map((quote: any) => (
              <Card key={quote.id} className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{quote.seller_name}</CardTitle>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-bold text-primary">
                    <DollarSign className="h-5 w-5" />
                    <span>${quote.total_price.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${quote.unit_price.toFixed(2)} per unit × {rfq.quantity} units
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Delivery: {quote.delivery_time} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>{quote.payment_terms}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <Label className="text-muted-foreground">Valid Until</Label>
                    <p>{new Date(quote.valid_until).toLocaleDateString()}</p>
                  </div>

                  {quote.notes && (
                    <div className="text-sm bg-muted/50 p-3 rounded-lg">
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="mt-1">{quote.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openRejectDialog(quote)}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCreateOrder(quote)}
                      disabled={createOrderMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept & Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Accepted/Rejected Quotes */}
        {(quotes.filter((q: any) => q.status !== "pending").length > 0) && (
          <div className="mt-8">
            <h2 className="text-xl font-display font-semibold mb-4">Previous Responses</h2>
            <div className="space-y-3">
              {quotes
                .filter((q: any) => q.status !== "pending")
                .map((quote: any) => (
                  <Card key={quote.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{quote.seller_name}</p>
                          <p className="text-sm text-muted-foreground">${quote.total_price.toFixed(2)}</p>
                        </div>
                        <Badge
                          variant={quote.status === "accepted" ? "default" : "destructive"}
                          className={quote.status === "accepted" ? "bg-green-500" : ""}
                        >
                          {quote.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Quote</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this quote. This will be sent to the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this quote is being rejected..."
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
                "Reject Quote"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default QuoteComparison;
