import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Calendar, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createRFQ } from "@/api/bulk.api";
import { getInventory } from "@/api/inventory.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const RFQForm = () => {
  const navigate = useNavigate();
  const { id: productId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [quantity, setQuantity] = useState("");
  const [budget, setBudget] = useState("");
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [specifications, setSpecifications] = useState("");

  const { data: inventoryData } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
    enabled: !!productId,
  });

  const product = inventoryData?.data?.data?.find((p: any) => p.id === productId);

  const mutation = useMutation({
    mutationFn: (data: any) => createRFQ(data),
    onSuccess: () => {
      toast({ title: "RFQ Submitted", description: "Your request for quote has been submitted successfully." });
      navigate("/bulk/orders");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit RFQ. Please try again.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to submit an RFQ.", variant: "destructive" });
      navigate("/login");
      return;
    }

    if (!productId) {
      toast({ title: "Error", description: "Product ID is required.", variant: "destructive" });
      return;
    }

    const payload = {
      buyer_id: user.id,
      buyer_name: user.email || "Unknown",
      product_id: productId,
      product_name: product?.name || "Unknown Product",
      quantity: parseInt(quantity),
      budget: budget ? parseFloat(budget) : null,
      delivery_deadline: deliveryDeadline,
      delivery_location: deliveryLocation,
      specifications,
    };

    mutation.mutate(payload);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to submit an RFQ.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Request for Quote</h1>
          <p className="text-muted-foreground">Submit a bulk purchase request and receive quotes from sellers</p>
        </div>

        {product && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={product.images[0]?.image_url || ""}
                  alt={product.name}
                  className="w-20 h-20 rounded-md object-cover"
                />
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <p className="text-sm font-medium mt-1">Current Price: ${product.price.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>RFQ Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="quantity">Quantity Required *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 500"
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
                  placeholder="e.g., 5000.00"
                />
              </div>

              <div>
                <Label htmlFor="deliveryDeadline">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Delivery Deadline *
                </Label>
                <Input
                  id="deliveryDeadline"
                  type="date"
                  value={deliveryDeadline}
                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="deliveryLocation">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Delivery Location *
                </Label>
                <Input
                  id="deliveryLocation"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g., Addis Ababa, Ethiopia"
                  required
                />
              </div>

              <div>
                <Label htmlFor="specifications">
                  <Package className="h-4 w-4 inline mr-2" />
                  Specifications & Requirements *
                </Label>
                <Textarea
                  id="specifications"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="Describe your requirements in detail (quality standards, packaging, certifications, etc.)"
                  rows={6}
                  required
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips for a better RFQ:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Be specific about quality requirements and standards</li>
                  <li>Include packaging specifications if needed</li>
                  <li>Mention any required certifications or compliance</li>
                  <li>Set a realistic delivery deadline</li>
                  <li>Provide a budget range if you have one</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="flex-1">
                  {mutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit RFQ"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RFQForm;
