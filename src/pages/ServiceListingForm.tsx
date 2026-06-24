import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, Plus, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createService, getMyServiceProvider } from "@/api/service.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const ServiceListingForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"creative" | "technical" | "marketing" | "professional" | "local">("creative");
  const [pricingType, setPricingType] = useState<"hourly" | "project" | "package">("hourly");
  const [price, setPrice] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [revisions, setRevisions] = useState("");
  const [requirements, setRequirements] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);

  const { data: providerData } = useQuery({
    queryKey: ["service-provider"],
    queryFn: () => getMyServiceProvider(),
    enabled: !!user,
  });

  const provider = providerData?.data;

  const mutation = useMutation({
    mutationFn: (data: any) => createService(data),
    onSuccess: () => {
      toast({ title: "Service Created", description: "Your service listing has been created successfully." });
      navigate("/skills/marketplace");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create service. Please try again.", variant: "destructive" });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast({ title: "Too many images", description: "Maximum 5 portfolio images allowed.", variant: "destructive" });
      return;
    }
    setPortfolioImages(files);
  };

  const removeImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !provider) {
      toast({ title: "Authentication Required", description: "Please login and register as a service provider first.", variant: "destructive" });
      navigate("/skills/register");
      return;
    }

    const formData = new FormData();
    formData.append("provider_id", provider.id);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("pricing_type", pricingType);
    formData.append("price", price);
    formData.append("delivery_time", deliveryTime);
    formData.append("revisions", revisions);
    formData.append("requirements", requirements);
    portfolioImages.forEach((img) => formData.append("portfolio_images", img));

    mutation.mutate(formData);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to create a service listing.</div>
      </Layout>
    );
  }

  if (!provider) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          Please register as a service provider first.
          <Button onClick={() => navigate("/skills/register")} className="ml-4">
            Register Now
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Create Service Listing</h1>
          <p className="text-muted-foreground">Offer your services to clients on VendorBridge</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Professional Logo Design"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Service Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your service in detail, what you deliver, and your process..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="local">Local Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricingType">Pricing Type *</Label>
                  <Select value={pricingType} onValueChange={(value: any) => setPricingType(value)}>
                    <SelectTrigger id="pricingType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="project">Project-based</SelectItem>
                      <SelectItem value="package">Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., 50.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryTime">Delivery Time (days) *</Label>
                  <Input
                    id="deliveryTime"
                    type="number"
                    min="1"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="e.g., 3"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="revisions">Revisions Included *</Label>
                  <Input
                    id="revisions"
                    type="number"
                    min="0"
                    value={revisions}
                    onChange={(e) => setRevisions(e.target.value)}
                    placeholder="e.g., 2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Client Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="What information do you need from the client to get started?"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="portfolioImages">
                  <ImageIcon className="h-4 w-4 inline mr-2" />
                  Portfolio Images (Optional)
                </Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload portfolio images (max 5)
                  </p>
                  <Input
                    id="portfolioImages"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("portfolioImages")?.click()}>
                    Select Images
                  </Button>
                </div>
                {portfolioImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {portfolioImages.map((file, idx) => (
                      <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips for a Great Listing:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use a clear, descriptive title</li>
                  <li>Be specific about what you deliver</li>
                  <li>Set competitive pricing based on your experience</li>
                  <li>Include relevant portfolio images</li>
                  <li>Clearly state your revision policy</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="flex-1">
                  {mutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    "Create Service"
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

export default ServiceListingForm;
