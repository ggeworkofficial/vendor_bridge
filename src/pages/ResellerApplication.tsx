import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Facebook, Instagram, Twitter, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createResellerApplication,
  getMyResellerApplication,
} from "@/api/reseller.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";
import { ArrowLeft } from "lucide-react";

const ResellerApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [marketingExperience, setMarketingExperience] = useState("");
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

  const { data: existingApplication } = useQuery({
    queryKey: ["reseller-application"],
    queryFn: () => getMyResellerApplication(),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createResellerApplication(data),
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your reseller application has been submitted for review.",
      });
      navigate("/profile");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCategoryToggle = (category: string) => {
    if (preferredCategories.includes(category)) {
      setPreferredCategories(preferredCategories.filter((c) => c !== category));
    } else {
      setPreferredCategories([...preferredCategories, category]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to apply.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const payload = {
      full_name: fullName,
      email,
      phone,
      social_media_accounts: {
        facebook: facebook || null,
        instagram: instagram || null,
        tiktok: tiktok || null,
        twitter: twitter || null,
      },
      marketing_experience: marketingExperience,
      preferred_categories: preferredCategories,
    };

    mutation.mutate(payload);
  };

  const categories = [
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Beauty & Personal Care",
    "Food & Beverages",
    "Sports & Outdoors",
    "Toys & Games",
    "Automotive",
    "Books & Media",
    "Health & Wellness",
  ];

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          Please login to apply as a reseller.
        </div>
      </Layout>
    );
  }

  if (existingApplication?.data) {
    const application = existingApplication.data;
    return (
      <Layout>
        <div className="container py-8 max-w-3xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-3xl font-display font-bold mb-2">
              Reseller Application
            </h1>
            <p className="text-muted-foreground">Your application status</p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div
                  className={`text-2xl font-semibold mb-2 ${
                    application.status === "approved"
                      ? "text-green-500"
                      : application.status === "pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </div>
                <p className="text-muted-foreground mb-6">
                  {application.status === "approved"
                    ? "Congratulations! You are now a verified reseller. Start sharing products and earning commissions."
                    : application.status === "pending"
                      ? "Your application is under review. We will notify you once it's processed."
                      : application.rejection_reason}
                </p>
                <div className="bg-muted/50 p-4 rounded-lg text-left">
                  <h3 className="font-medium mb-2">Application Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {application.full_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {application.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {application.phone}
                    </p>
                    <p>
                      <span className="font-medium">Commission Rate:</span>{" "}
                      {application.commission_rate}%
                    </p>
                    <p>
                      <span className="font-medium">Submitted:</span>{" "}
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-display font-bold mb-2">
            Become a Reseller
          </h1>
          <p className="text-muted-foreground">
            Share products and earn commissions on every sale
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reseller Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
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
              </div>

              <div>
                <Label className="mb-3 block">Social Media Accounts *</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <Input
                      placeholder="Facebook profile URL"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <Input
                      placeholder="Instagram profile URL"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5" />
                    <Input
                      placeholder="TikTok profile URL"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <Input
                      placeholder="Twitter/X profile URL"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="marketingExperience">
                  Marketing Experience *
                </Label>
                <Textarea
                  id="marketingExperience"
                  value={marketingExperience}
                  onChange={(e) => setMarketingExperience(e.target.value)}
                  placeholder="Describe your marketing experience, audience size, and previous campaigns..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label className="mb-3 block">
                  Preferred Product Categories *
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select categories you're interested in promoting
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                        preferredCategories.includes(category)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Commission Structure:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>5-10% commission on VendorBridge-curated products</li>
                  <li>8-15% commission on vendor-posted products</li>
                  <li>Performance bonuses for top resellers</li>
                  <li>30-day cookie attribution window</li>
                  <li>Weekly payout options</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
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

export default ResellerApplication;
