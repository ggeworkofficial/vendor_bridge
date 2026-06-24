import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DollarSign, Clock, Check, X, Loader2, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getServiceProposals, updateServiceProposal, createServiceProject } from "@/api/service.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const ServiceProposals = () => {
  const { id: requestId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: proposalsData, isLoading } = useQuery({
    queryKey: ["service-proposals", requestId],
    queryFn: () => getServiceProposals({ request_id: requestId }),
    enabled: !!requestId,
  });

  const proposals = proposalsData?.data?.data ?? [];

  const acceptMutation = useMutation({
    mutationFn: (proposalId: string) => updateServiceProposal(proposalId, { status: "accepted" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-proposals", requestId] });
      toast({ title: "Proposal Accepted", description: "You can now proceed with the project." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to accept proposal.", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ proposalId, reason }: { proposalId: string; reason: string }) =>
      updateServiceProposal(proposalId, { status: "rejected" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-proposals", requestId] });
      setRejectDialogOpen(false);
      setRejectionReason("");
      toast({ title: "Proposal Rejected", description: "Proposal has been rejected." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject proposal.", variant: "destructive" });
    },
  });

  const projectMutation = useMutation({
    mutationFn: (data: any) => createServiceProject(data),
    onSuccess: () => {
      toast({ title: "Project Created", description: "Your project has been created successfully." });
      navigate("/skills/projects");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project.", variant: "destructive" });
    },
  });

  const handleAccept = (proposal: any) => {
    acceptMutation.mutate(proposal.id);
  };

  const handleReject = () => {
    if (selectedProposal && rejectionReason.trim()) {
      rejectMutation.mutate({ proposalId: selectedProposal.id, reason: rejectionReason.trim() });
    }
  };

  const openRejectDialog = (proposal: any) => {
    setSelectedProposal(proposal);
    setRejectDialogOpen(true);
  };

  const handleCreateProject = (proposal: any) => {
    if (!user || !proposal) return;

    const payload = {
      service_id: proposal.service_id,
      request_id: proposal.request_id,
      proposal_id: proposal.id,
      client_id: user.id,
      client_name: user.email || "Unknown",
      provider_id: proposal.provider_id,
      provider_name: proposal.provider_name,
      agreed_price: proposal.proposed_price,
      escrow_amount: proposal.proposed_price,
      start_date: new Date().toISOString().split('T')[0],
      deadline: proposal.proposed_delivery,
    };

    projectMutation.mutate(payload);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to view proposals.</div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
          Loading proposals...
        </div>
      </Layout>
    );
  }

  const pendingProposals = proposals.filter((p: any) => p.status === "pending");

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Proposals</h1>
          <p className="text-muted-foreground">Review and compare proposals from service providers</p>
        </div>

        {pendingProposals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No pending proposals available for this request.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingProposals.map((proposal: any) => (
              <Card key={proposal.id} className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {proposal.provider_name?.charAt(0) || "P"}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{proposal.provider_name}</h3>
                          <p className="text-sm text-muted-foreground">Service Provider</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Proposed Price</p>
                            <p className="text-2xl font-bold">${proposal.proposed_price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Delivery Date</p>
                            <p className="text-lg font-medium">{new Date(proposal.proposed_delivery).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Cover Letter</p>
                        <p className="text-sm">{proposal.cover_letter}</p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>Valid Until: {new Date(proposal.valid_until).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRejectDialog(proposal)}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCreateProject(proposal)}
                        disabled={projectMutation.isPending}
                      >
                        {projectMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                        ) : (
                          <><Check className="h-4 w-4 mr-1" /> Accept & Start Project</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Previous Responses */}
        {proposals.filter((p: any) => p.status !== "pending").length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-display font-semibold mb-4">Previous Responses</h2>
            <div className="space-y-3">
              {proposals
                .filter((p: any) => p.status !== "pending")
                .map((proposal: any) => (
                  <Card key={proposal.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{proposal.provider_name}</p>
                          <p className="text-sm text-muted-foreground">${proposal.proposed_price.toFixed(2)}</p>
                        </div>
                        <Badge
                          variant={proposal.status === "accepted" ? "default" : "destructive"}
                          className={proposal.status === "accepted" ? "bg-green-500" : ""}
                        >
                          {proposal.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Proposal</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this proposal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Rejection Reason *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this proposal is being rejected..."
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
                  "Reject Proposal"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ServiceProposals;
