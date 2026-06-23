import { useState } from "react";
import { Check, X, Eye, Loader2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSellerApplications, updateSellerApplication } from "@/api/seller-application.api";
import { useToast } from "@/hooks/use-toast";
import type { SellerApplication, SellerApplicationStatus } from "@/types/seller-application";

const SellerApprovalSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SellerApplicationStatus | "all">("all");
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ["seller-applications", { status: statusFilter === "all" ? undefined : statusFilter }],
    queryFn: () => getSellerApplications({ status: statusFilter === "all" ? undefined : statusFilter }),
  });

  const applications = applicationsData?.data?.data ?? [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => updateSellerApplication(id, { status: "approved" }),
    onSuccess: () => {
      toast({ title: "Application Approved", description: "Seller application has been approved." });
      queryClient.invalidateQueries({ queryKey: ["seller-applications"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve application.", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      updateSellerApplication(id, { status: "rejected", rejection_reason: reason }),
    onSuccess: () => {
      toast({ title: "Application Rejected", description: "Seller application has been rejected." });
      setRejectDialogOpen(false);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["seller-applications"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject application.", variant: "destructive" });
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = () => {
    if (selectedApplication && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedApplication.id, reason: rejectionReason.trim() });
    }
  };

  const openViewDialog = (application: SellerApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const openRejectDialog = (application: SellerApplication) => {
    setSelectedApplication(application);
    setRejectDialogOpen(true);
  };

  const filteredApplications = applications.filter((app) =>
    app.business_name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<SellerApplicationStatus, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Seller Applications</h2>
          <p className="text-muted-foreground">Review and approve seller applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="bg-card border rounded-lg">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No seller applications found.
          </div>
        ) : (
          <div className="divide-y">
            {filteredApplications.map((application) => (
              <div key={application.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{application.business_name}</h3>
                      <Badge className={statusColors[application.status]}>{application.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Type:</span> {application.business_type}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {application.city}, {application.region}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {application.phone}
                      </div>
                      <div>
                        <span className="font-medium">Applied:</span> {new Date(application.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-muted-foreground">Categories:</span>{" "}
                      <span className="text-foreground">{application.product_categories.join(", ")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openViewDialog(application)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {application.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(application.id)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openRejectDialog(application)}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seller Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <p className="text-sm font-medium">{selectedApplication.business_name}</p>
                </div>
                <div>
                  <Label>Business Type</Label>
                  <p className="text-sm">{selectedApplication.business_type}</p>
                </div>
                <div>
                  <Label>Tax ID</Label>
                  <p className="text-sm">{selectedApplication.tax_id || "N/A"}</p>
                </div>
                <div>
                  <Label>Business License</Label>
                  <p className="text-sm">{selectedApplication.business_license || "N/A"}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{selectedApplication.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <p className="text-sm">{selectedApplication.address}, {selectedApplication.city}, {selectedApplication.region}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedApplication.description}</p>
              </div>
              <div>
                <Label>Product Categories</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedApplication.product_categories.map((cat) => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              </div>
              {selectedApplication.social_media && (
                <div>
                  <Label>Social Media</Label>
                  <div className="space-y-1 mt-1 text-sm">
                    {selectedApplication.social_media.facebook && (
                      <p><span className="font-medium">Facebook:</span> {selectedApplication.social_media.facebook}</p>
                    )}
                    {selectedApplication.social_media.instagram && (
                      <p><span className="font-medium">Instagram:</span> {selectedApplication.social_media.instagram}</p>
                    )}
                    {selectedApplication.social_media.tiktok && (
                      <p><span className="font-medium">TikTok:</span> {selectedApplication.social_media.tiktok}</p>
                    )}
                    {selectedApplication.social_media.twitter && (
                      <p><span className="font-medium">Twitter:</span> {selectedApplication.social_media.twitter}</p>
                    )}
                  </div>
                </div>
              )}
              {selectedApplication.admin_notes && (
                <div>
                  <Label>Admin Notes</Label>
                  <p className="text-sm mt-1">{selectedApplication.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will be sent to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
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
                "Reject Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerApprovalSection;
