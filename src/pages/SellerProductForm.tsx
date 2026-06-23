import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { createInventory } from "@/api/inventory.api";
import { getCategories } from "@/api/category.api";
import { useQuery } from "@tanstack/react-query";
import type { InventoryQualityLabel } from "@/types/inventory";

const qualityOptions: { value: InventoryQualityLabel; label: string }[] = [
  { value: "high", label: "High Quality" },
  { value: "medium", label: "Medium Quality" },
  { value: "low", label: "Standard Quality" },
];

const SellerProductForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [qualityLabel, setQualityLabel] = useState<InventoryQualityLabel>("medium");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categories = (categoriesData as any)?.data?.data ?? [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast({ title: "Too many images", description: "Maximum 5 images allowed.", variant: "destructive" });
      return;
    }

    setImages(files);
    
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim() || !price || !quantity || !location.trim() || !categoryId) {
      toast({ title: "Validation error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (images.length === 0) {
      toast({ title: "Validation error", description: "Please upload at least one product image.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("quantity", quantity);
      formData.append("quality_label", qualityLabel);
      formData.append("location", location.trim());
      formData.append("category_id", categoryId);
      formData.append("posted_by", "vendor");
      
      images.forEach((image) => {
        formData.append("images", image);
      });

      await createInventory(formData);
      
      toast({ title: "Product Created!", description: "Your product has been submitted for review." });
      navigate("/seller/dashboard");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Unable to create product.";
      toast({ title: "Creation failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/seller/dashboard"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard</Link>
        </Button>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Add New Product</h1>
            <p className="text-muted-foreground">
              Create a new product listing. Your product will be reviewed before going live.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="font-display font-semibold">Basic Information</h3>
              
              <div className="space-y-1">
                <Label>Product Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Description *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product in detail..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Price ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Quality Level *</Label>
                  <Select value={qualityLabel} onValueChange={(value: any) => setQualityLabel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Location *</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Addis Ababa, Ethiopia"
                  required
                />
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="font-display font-semibold">Product Images *</h3>
              <p className="text-sm text-muted-foreground">Upload up to 5 images. First image will be the cover.</p>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB each</p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating Product...</> : "Submit for Review"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SellerProductForm;
