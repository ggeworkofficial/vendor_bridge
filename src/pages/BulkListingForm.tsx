import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { createBulkListing } from "@/api/bulk.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

interface TieredPricing {
  min_quantity: number;
  unit_price: number;
}

const BulkListingForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [productId, setProductId] = useState("");
  const [listingType, setListingType] = useState<"retail" | "bulk" | "both">("bulk");
  const [minOrderQuantity, setMinOrderQuantity] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [incoterms, setIncoterms] = useState("EXW");
  const [leadTime, setLeadTime] = useState("");
  const [sampleAvailable, setSampleAvailable] = useState(false);
  const [samplePrice, setSamplePrice] = useState("");
  const [tieredPricing, setTieredPricing] = useState<TieredPricing[]>([
    { min_quantity: 1, unit_price: 0 },
  ]);

  const mutation = useMutation({
    mutationFn: (data: any) => createBulkListing(data),
    onSuccess: () => {
      toast({ title: "Bulk Listing Created", description: "Your bulk listing has been created successfully." });
      navigate("/seller/dashboard");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create bulk listing. Please try again.", variant: "destructive" });
    },
  });

  const addPricingTier = () => {
    setTieredPricing([...tieredPricing, { min_quantity: 0, unit_price: 0 }]);
  };

  const removePricingTier = (index: number) => {
    if (tieredPricing.length > 1) {
      setTieredPricing(tieredPricing.filter((_, i) => i !== index));
    }
  };

  const updatePricingTier = (index: number, field: keyof TieredPricing, value: string) => {
    const updated = [...tieredPricing];
    updated[index][field] = parseFloat(value) || 0;
    setTieredPricing(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to create a bulk listing.", variant: "destructive" });
      navigate("/login");
      return;
    }

    const payload = {
      product_id: productId,
      listing_type: listingType,
      min_order_quantity: parseInt(minOrderQuantity),
      tiered_pricing: tieredPricing,
      available_quantity: parseInt(availableQuantity),
      location,
      incoterms,
      lead_time: parseInt(leadTime),
      sample_available: sampleAvailable,
      sample_price: sampleAvailable ? parseFloat(samplePrice) : null,
    };

    mutation.mutate(payload);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to create a bulk listing.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Create Bulk Listing</h1>
          <p className="text-muted-foreground">Set up bulk pricing and terms for your product</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="productId">Product ID *</Label>
                <Input
                  id="productId"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Enter product ID"
                  required
                />
              </div>

              <div>
                <Label htmlFor="listingType">Listing Type *</Label>
                <Select value={listingType} onValueChange={(value: any) => setListingType(value)}>
                  <SelectTrigger id="listingType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail Only</SelectItem>
                    <SelectItem value="bulk">Bulk Only</SelectItem>
                    <SelectItem value="both">Both Retail & Bulk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrderQuantity">Minimum Order Quantity *</Label>
                  <Input
                    id="minOrderQuantity"
                    type="number"
                    min="1"
                    value={minOrderQuantity}
                    onChange={(e) => setMinOrderQuantity(e.target.value)}
                    placeholder="e.g., 10"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="availableQuantity">Available Quantity *</Label>
                  <Input
                    id="availableQuantity"
                    type="number"
                    min="1"
                    value={availableQuantity}
                    onChange={(e) => setAvailableQuantity(e.target.value)}
                    placeholder="e.g., 1000"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Tiered Pricing *</Label>
                <p className="text-sm text-muted-foreground mb-3">Set different prices for different quantity tiers</p>
                <div className="space-y-3">
                  {tieredPricing.map((tier, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <Label htmlFor={`min-qty-${index}`} className="text-xs">Min Quantity</Label>
                        <Input
                          id={`min-qty-${index}`}
                          type="number"
                          min="1"
                          value={tier.min_quantity || ""}
                          onChange={(e) => updatePricingTier(index, "min_quantity", e.target.value)}
                          placeholder="Min qty"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`unit-price-${index}`} className="text-xs">Unit Price ($)</Label>
                        <Input
                          id={`unit-price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={tier.unit_price || ""}
                          onChange={(e) => updatePricingTier(index, "unit_price", e.target.value)}
                          placeholder="Price"
                          required
                        />
                      </div>
                      {tieredPricing.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePricingTier(index)}
                          className="mt-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addPricingTier} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Pricing Tier
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Addis Ababa, Ethiopia"
                  required
                />
              </div>

              <div>
                <Label htmlFor="incoterms">Incoterms *</Label>
                <Select value={incoterms} onValueChange={setIncoterms}>
                  <SelectTrigger id="incoterms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                    <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                    <SelectItem value="CIF">CIF - Cost, Insurance, Freight</SelectItem>
                    <SelectItem value="DAP">DAP - Delivered at Place</SelectItem>
                    <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="leadTime">Lead Time (days) *</Label>
                <Input
                  id="leadTime"
                  type="number"
                  min="1"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  placeholder="e.g., 7"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sampleAvailable"
                  checked={sampleAvailable}
                  onChange={(e) => setSampleAvailable(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="sampleAvailable" className="cursor-pointer">Sample Available</Label>
              </div>

              {sampleAvailable && (
                <div>
                  <Label htmlFor="samplePrice">Sample Price ($)</Label>
                  <Input
                    id="samplePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={samplePrice}
                    onChange={(e) => setSamplePrice(e.target.value)}
                    placeholder="e.g., 25.00"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/seller/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="flex-1">
                  {mutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    "Create Bulk Listing"
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

export default BulkListingForm;
