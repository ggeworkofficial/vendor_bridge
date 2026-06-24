import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, Briefcase, DollarSign, MessageCircle, Send, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getService, createServiceRequest } from "@/api/service.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";
import { useOpenGraph } from "@/hooks/useOpenGraph";

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");

  const { data: serviceData, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getService(id),
    enabled: !!id,
  });

  const service = serviceData?.data;

  useOpenGraph({
    title: service?.title || "Service",
    description: service?.description || "",
    image: service?.portfolio_images?.[0] || "",
    url: window.location.href,
  });

  const requestMutation = useMutation({
    mutationFn: (data: any) => createServiceRequest(data),
    onSuccess: () => {
      toast({ title: "Request Sent", description: "Your service request has been sent to the provider." });
      setRequestDialogOpen(false);
      setDescription("");
      setBudget("");
      setDeadline("");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send request. Please try again.", variant: "destructive" });
    },
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to request services.", variant: "destructive" });
      navigate("/login");
      return;
    }

    if (!service) return;

    const payload = {
      service_id: service.id,
      client_id: user.id,
      client_name: user.email || "Unknown",
      description,
      budget: budget ? parseFloat(budget) : null,
      deadline: deadline || null,
    };

    requestMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
          Loading service...
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Service not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className="capitalize">{service.category}</Badge>
                  <Badge variant="secondary" className="capitalize">{service.pricing_type}</Badge>
                </div>
                <CardTitle className="text-2xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold">{service.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({service.review_count} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Briefcase className="h-5 w-5" />
                    <span>{service.orders} orders completed</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{service.description}</p>
                </div>

                {service.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">What I Need From You</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{service.requirements}</p>
                  </div>
                )}

                {service.portfolio_images && service.portfolio_images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Portfolio</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {service.portfolio_images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Portfolio ${idx + 1}`}
                          className="rounded-lg w-full h-40 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No reviews yet. Be the first to review this service!
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {service.provider?.full_name?.charAt(0) || "P"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{service.provider?.full_name || "Provider"}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{service.provider?.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Delivery:</span>
                    <span className="font-medium">{service.delivery_time} days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Revisions:</span>
                    <span className="font-medium">{service.revisions} included</span>
                  </div>
                </div>

                <div className="border-t pt-6 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-3xl font-bold">${service.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {service.pricing_type === "hourly" ? "per hour" : service.pricing_type === "project" ? "per project" : "per package"}
                  </p>
                </div>

                <Button
                  onClick={() => setRequestDialogOpen(true)}
                  className="w-full"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Why Choose Me?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Verified service provider</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Fast response time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Quality guaranteed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Secure escrow payments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Request Dialog */}
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Service Request</DialogTitle>
              <DialogDescription>
                Describe your project requirements to get started with this service.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you need..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget (Optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Your budget"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRequestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={requestMutation.isPending}>
                  {requestMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> Send Request</>
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

export default ServiceDetail;
