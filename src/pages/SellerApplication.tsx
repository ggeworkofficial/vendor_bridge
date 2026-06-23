import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { createSellerApplication } from "@/api/seller-application.api";
import { useSellerApplicationStore } from "@/features/seller-application/seller-application.store";
import { useAuth } from "@/features/auth/auth.store";

const categories = [
  "Fashion",
  "Food & Beverages",
  "Home & Living",
  "Electronics",
  "Health & Beauty",
  "Crafts",
  "Agriculture",
  "Industrial",
  "Other",
];

const SellerApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);
  const setApplication = useSellerApplicationStore((state) => state.setApplication);
  
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<"individual" | "company" | "cooperative">("individual");
  const [taxId, setTaxId] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
    twitter: "",
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim() || !phone.trim() || !address.trim() || !city.trim() || !region.trim() || !description.trim()) {
      toast({ title: "Validation error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({ title: "Validation error", description: "Please select at least one product category.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { data } = await createSellerApplication({
        business_name: businessName.trim(),
        business_type: businessType,
        tax_id: taxId.trim() || undefined,
        business_license: businessLicense.trim() || undefined,
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        region: region.trim(),
        description: description.trim(),
        product_categories: selectedCategories,
        social_media: Object.fromEntries(
          Object.entries(socialMedia).filter(([_, value]) => value.trim())
        ) as any,
      });

      setApplication(data);
      toast({ 
        title: "Application Submitted!", 
        description: "Your seller application has been submitted for review. We'll notify you once it's approved." 
      });
      navigate("/profile");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Unable to submit application.";
      toast({ title: "Submission failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground mb-4">Please login to apply as a seller.</p>
          <Button asChild><Link to="/login">Login</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/profile"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Profile</Link>
        </Button>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Become a Seller</h1>
            <p className="text-muted-foreground">
              Apply to sell your products on VendorBridge. Once approved, you can create listings and reach thousands of customers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="font-display font-semibold">Business Information</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Business Name *</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Business Type *</Label>
                  <Select value={businessType} onValueChange={(value: any) => setBusinessType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="cooperative">Cooperative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Tax ID (Optional)</Label>
                  <Input
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="Tax identification number"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Business License (Optional)</Label>
                  <Input
                    value={businessLicense}
                    onChange={(e) => setBusinessLicense(e.target.value)}
                    placeholder="License number"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 911 000 000"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Address *</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>City *</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Addis Ababa"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>State/Region *</Label>
                  <Input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Addis Ababa"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="font-display font-semibold">Product Categories *</h3>
              <p className="text-sm text-muted-foreground">Select the categories of products you plan to sell.</p>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm border-2 transition-colors ${
                      selectedCategories.includes(category)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    {selectedCategories.includes(category) && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="font-display font-semibold">Business Description *</h3>
              <p className="text-sm text-muted-foreground">Tell us about your business and the products you sell.</p>
              
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your business, your products, and what makes you unique..."
                rows={4}
                required
              />
            </div>

            {/* Social Media */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="font-display font-semibold">Social Media (Optional)</h3>
              <p className="text-sm text-muted-foreground">Link your social media accounts for verification.</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Facebook</Label>
                  <Input
                    value={socialMedia.facebook}
                    onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                    placeholder="https://facebook.com/yourbusiness"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Instagram</Label>
                  <Input
                    value={socialMedia.instagram}
                    onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                    placeholder="https://instagram.com/yourbusiness"
                  />
                </div>
                <div className="space-y-1">
                  <Label>TikTok</Label>
                  <Input
                    value={socialMedia.tiktok}
                    onChange={(e) => setSocialMedia({ ...socialMedia, tiktok: e.target.value })}
                    placeholder="https://tiktok.com/@yourbusiness"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Twitter</Label>
                  <Input
                    value={socialMedia.twitter}
                    onChange={(e) => setSocialMedia({ ...socialMedia, twitter: e.target.value })}
                    placeholder="https://twitter.com/yourbusiness"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SellerApplication;
