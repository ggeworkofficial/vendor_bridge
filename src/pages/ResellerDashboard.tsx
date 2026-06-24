import { useState } from "react";
import { DollarSign, MousePointer2, ShoppingCart, TrendingUp, Calendar, Link2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResellerAnalytics, getResellerShares, getResellerPayouts, createResellerPayout } from "@/api/reseller.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const ResellerDashboard = () => {
  const user = useAuth((state) => state.user);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["reseller-analytics"],
    queryFn: () => getResellerAnalytics(),
    enabled: !!user,
  });

  const { data: sharesData, isLoading: sharesLoading } = useQuery({
    queryKey: ["reseller-shares"],
    queryFn: () => getResellerShares(),
    enabled: !!user,
  });

  const { data: payoutsData, isLoading: payoutsLoading } = useQuery({
    queryKey: ["reseller-payouts"],
    queryFn: () => getResellerPayouts(),
    enabled: !!user,
  });

  const analytics = analyticsData?.data;
  const shares = sharesData?.data?.data ?? [];
  const payouts = payoutsData?.data?.data ?? [];

  const payoutMutation = useMutation({
    mutationFn: (data: any) => createResellerPayout(data),
    onSuccess: () => {
      toast({ title: "Payout Requested", description: "Your payout request has been submitted." });
      setPayoutDialogOpen(false);
      setPayoutAmount("");
      setPaymentMethod("");
      setPaymentDetails("");
      queryClient.invalidateQueries({ queryKey: ["reseller-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["reseller-analytics"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to request payout.", variant: "destructive" });
    },
  });

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || !paymentMethod || !paymentDetails) {
      toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    payoutMutation.mutate({
      amount: parseFloat(payoutAmount),
      payment_method: paymentMethod,
      payment_details: paymentDetails,
    });
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast({ title: "Link Copied", description: "Share link copied to clipboard." });
    setTimeout(() => setCopiedLink(null), 2000);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to access reseller dashboard.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Reseller Dashboard</h1>
          <p className="text-muted-foreground">Track your earnings and performance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">${analytics?.total_earnings?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <MousePointer2 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{analytics?.total_clicks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold">{analytics?.total_conversions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {analytics?.total_clicks > 0
                      ? ((analytics.total_conversions / analytics.total_clicks) * 100).toFixed(1)
                      : "0"}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="shares" className="space-y-4">
          <TabsList>
            <TabsTrigger value="shares">My Shares</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="request">Request Payout</TabsTrigger>
          </TabsList>

          <TabsContent value="shares">
            <Card>
              <CardHeader>
                <CardTitle>Product Shares</CardTitle>
              </CardHeader>
              <CardContent>
                {sharesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
                    Loading shares...
                  </div>
                ) : shares.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No product shares yet. Start sharing products to earn commissions!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shares.map((share: any) => (
                      <div key={share.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{share.product_name || "Product"}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span><MousePointer2 className="h-3 w-3 inline mr-1" /> {share.total_clicks} clicks</span>
                            <span><ShoppingCart className="h-3 w-3 inline mr-1" /> {share.total_conversions} conversions</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(share.generated_link)}
                          >
                            {copiedLink === share.generated_link ? (
                              <><Check className="h-4 w-4 mr-1" /> Copied</>
                            ) : (
                              <><Copy className="h-4 w-4 mr-1" /> Copy Link</>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {payoutsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
                    Loading payouts...
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No payout history yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payouts.map((payout: any) => (
                      <div key={payout.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">${payout.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{payout.payment_method}</p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              payout.status === "paid"
                                ? "default"
                                : payout.status === "processing"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {payout.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(payout.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request">
            <Card>
              <CardHeader>
                <CardTitle>Request Payout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Available Balance</span>
                      <span className="text-2xl font-bold">${analytics?.total_earnings?.toFixed(2) || "0.00"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Minimum payout: $50.00</p>
                  </div>

                  <form onSubmit={handlePayoutSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="payoutAmount">Amount *</Label>
                      <Input
                        id="payoutAmount"
                        type="number"
                        min="50"
                        step="0.01"
                        max={analytics?.total_earnings || 0}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="paymentDetails">Payment Details *</Label>
                      <Input
                        id="paymentDetails"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                        placeholder="Account number, phone number, or email"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Bank account number, mobile money number, or PayPal email
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={payoutMutation.isPending || !payoutAmount || parseFloat(payoutAmount) < 50}
                    >
                      {payoutMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                      ) : (
                        "Request Payout"
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ResellerDashboard;
