import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBusinessVerification, getMyBusinessVerification } from "@/api/bulk.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const BusinessVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<"importer" | "manufacturer" | "wholesaler" | "cooperative">("importer");
  const [businessLicense, setBusinessLicense] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);

  const { data: existingVerification } = useQuery({
    queryKey: ["business-verification"],
    queryFn: () => getMyBusinessVerification(),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createBusinessVerification(data),
    onSuccess: () => {
      toast({ title: "Verification Submitted", description: "Your business verification has been submitted for review." });
      navigate("/profile");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit verification. Please try again.", variant: "destructive" });
    },
  });

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast({ title: "Too many files", description: "Maximum 5 documents allowed.", variant: "destructive" });
      return;
    }
    setDocuments(files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to submit verification.", variant: "destructive" });
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("business_name", businessName);
    formData.append("business_type", businessType);
    formData.append("business_license", businessLicense);
    formData.append("tax_id", taxId);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("website", website);
    documents.forEach((doc) => formData.append("documents", doc));

    mutation.mutate(formData);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to submit business verification.</div>
      </Layout>
    );
  }

  if (existingVerification?.data) {
    const verification = existingVerification.data;
    return (
      <Layout>
        <div className="container py-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Business Verification</h1>
            <p className="text-muted-foreground">Your verification status</p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Verification {verification.status}</h2>
                <p className="text-muted-foreground mb-6">
                  {verification.status === "approved"
                    ? "Your business has been verified. You can now access bulk buying features."
                    : verification.status === "pending"
                    ? "Your verification is under review. We will notify you once it's processed."
                    : verification.rejection_reason}
                </p>
                <div className="bg-muted/50 p-4 rounded-lg text-left">
                  <h3 className="font-medium mb-2">Submitted Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Business:</span> {verification.business_name}</p>
                    <p><span className="font-medium">Type:</span> {verification.business_type}</p>
                    <p><span className="font-medium">License:</span> {verification.business_license}</p>
                    <p><span className="font-medium">Tax ID:</span> {verification.tax_id}</p>
                    <p><span className="font-medium">Submitted:</span> {new Date(verification.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Business Verification</h1>
          <p className="text-muted-foreground">Verify your business to access bulk buying features</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select value={businessType} onValueChange={(value: any) => setBusinessType(value)}>
                  <SelectTrigger id="businessType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="importer">Importer</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="wholesaler">Wholesaler</SelectItem>
                    <SelectItem value="cooperative">Cooperative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessLicense">Business License Number *</Label>
                  <Input
                    id="businessLicense"
                    value={businessLicense}
                    onChange={(e) => setBusinessLicense(e.target.value)}
                    placeholder="License number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID *</Label>
                  <Input
                    id="taxId"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="Tax identification number"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full business address"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 911 123 456"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="business@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>

              <div>
                <Label htmlFor="documents">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Supporting Documents *
                </Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload business license, tax certificate, and other relevant documents
                  </p>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("documents")?.click()}>
                    Select Files
                  </Button>
                </div>
                {documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {documents.map((doc, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground">
                        {doc.name} ({(doc.size / 1024).toFixed(1)} KB)
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Required Documents:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Business License (PDF or Image)</li>
                  <li>Tax Certificate (PDF or Image)</li>
                  <li>Company Registration Document (PDF or Image)</li>
                  <li>Any additional certifications (PDF or Image)</li>
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
                    "Submit Verification"
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

export default BusinessVerification;
