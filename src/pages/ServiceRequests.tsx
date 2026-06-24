import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Clock, DollarSign, MessageCircle, Loader2, Check, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServiceRequests, createServiceProposal } from "@/api/service.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const ServiceRequests = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [proposedPrice, setProposedPrice] = useState("");
  const [proposedDelivery, setProposedDelivery] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["service-requests"],
    queryFn: () => getServiceRequests(),
    enabled: !!user,
  });

  const requests = requestsData?.data?.data ?? [];

  const myRequests = requests.filter((r: any) => r.client_id === user?.id);
  const incomingRequests = requests.filter((r: any) => r.service?.provider_id === user?.id);

  const proposalMutation = useMutation({
    mutationFn: (data: any) => createServiceProposal(data),
    onSuccess: () => {
      toast({ title: "Proposal Sent", description: "Your proposal has been sent to the client." });
      setProposalDialogOpen(false);
      setProposedPrice("");
      setProposedDelivery("");
      setCoverLetter("");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send proposal. Please try again.", variant: "destructive" });
    },
  });

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedRequest) return;

    const payload = {
      request_id: selectedRequest.id,
      provider_id: user.id,
      proposed_price: parseFloat(proposedPrice),
      proposed_delivery: proposedDelivery,
      cover_letter: coverLetter,
    };

    proposalMutation.mutate(payload);
  };

  const openProposalDialog = (request: any) => {
    setSelectedRequest(request);
    setProposalDialogOpen(true);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to view service requests.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Service Requests</h1>
          <p className="text-muted-foreground">Manage your service requests and proposals</p>
        </div>

        <Tabs defaultValue="incoming" className="space-y-4">
          <TabsList>
            {user.role === "service_provider" && (
              <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
            )}
            <TabsTrigger value="my">My Requests</TabsTrigger>
          </TabsList>

          {user.role === "service_provider" && (
            <TabsContent value="incoming">
              <Card>
                <CardHeader>
                  <CardTitle>Requests for Your Services</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
                      Loading requests...
                    </div>
                  ) : incomingRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No incoming requests yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {incomingRequests.map((request: any) => (
                        <Card key={request.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{request.service?.title || "Service"}</h3>
                                  <Badge variant={request.status === "open" ? "default" : "secondary"}>
                                    {request.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  From: {request.client_name}
                                </p>
                                <p className="text-sm mb-3 line-clamp-2">{request.description}</p>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                  {request.budget && (
                                    <span><DollarSign className="h-3 w-3 inline mr-1" /> Budget: ${request.budget.toFixed(2)}</span>
                                  )}
                                  {request.deadline && (
                                    <span><Clock className="h-3 w-3 inline mr-1" /> Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              {request.status === "open" && (
                                <Button size="sm" onClick={() => openProposalDialog(request)}>
                                  <Send className="h-4 w-4 mr-1" /> Send Proposal
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="my">
            <Card>
              <CardHeader>
                <CardTitle>My Service Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
                    Loading requests...
                  </div>
                ) : myRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    You haven't sent any service requests yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map((request: any) => (
                      <Card key={request.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{request.service?.title || "Service"}</h3>
                                <Badge variant={request.status === "open" ? "default" : "secondary"}>
                                  {request.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                Provider: {request.service?.provider?.full_name || "Unknown"}
                              </p>
                              <p className="text-sm mb-3 line-clamp-2">{request.description}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                {request.budget && (
                                  <span><DollarSign className="h-3 w-3 inline mr-1" /> Budget: ${request.budget.toFixed(2)}</span>
                                )}
                                {request.deadline && (
                                  <span><Clock className="h-3 w-3 inline mr-1" /> Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/skills/${request.service_id}`)}>
                              <MessageCircle className="h-4 w-4 mr-1" /> View Service
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Proposal Dialog */}
        <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Proposal</DialogTitle>
              <DialogDescription>
                Submit your proposal for this service request.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendProposal} className="space-y-4">
              <div>
                <Label htmlFor="proposedPrice">Proposed Price ($) *</Label>
                <Input
                  id="proposedPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="Your proposed price"
                  required
                />
              </div>
              <div>
                <Label htmlFor="proposedDelivery">Delivery Date *</Label>
                <Input
                  id="proposedDelivery"
                  type="date"
                  value={proposedDelivery}
                  onChange={(e) => setProposedDelivery(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why you're the best fit for this project..."
                  rows={4}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setProposalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={proposalMutation.isPending}>
                  {proposalMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> Send Proposal</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ServiceRequests;
