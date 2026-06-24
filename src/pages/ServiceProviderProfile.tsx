import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, Briefcase, Star, Clock, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updateServiceProvider, getMyServiceProvider } from "@/api/service.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const ServiceProviderProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [availability, setAvailability] = useState<"available" | "busy" | "offline">("available");
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);

  const { data: providerData, isLoading } = useQuery({
    queryKey: ["service-provider"],
    queryFn: () => getMyServiceProvider(),
    enabled: !!user,
  });

  const provider = providerData?.data;

  const mutation = useMutation({
    mutationFn: (data: any) => updateServiceProvider(user?.id || "", data),
    onSuccess: () => {
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      toast({ title: "Too many images", description: "Maximum 10 portfolio images allowed.", variant: "destructive" });
      return;
    }
    setPortfolioImages(files);
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addCertification = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput("");
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to update profile.", variant: "destructive" });
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("bio", bio);
    formData.append("skills", JSON.stringify(skills));
    formData.append("certifications", JSON.stringify(certifications));
    if (hourlyRate) formData.append("hourly_rate", hourlyRate);
    if (responseTime) formData.append("response_time", responseTime);
    formData.append("availability", availability);
    portfolioImages.forEach((img) => formData.append("portfolio_images", img));

    mutation.mutate(formData);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to access your profile.</div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
          Loading profile...
        </div>
      </Layout>
    );
  }

  if (!provider) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          Service provider profile not found. Please register first.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Service Provider Profile</h1>
          <p className="text-muted-foreground">Manage your service provider profile</p>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{provider.rating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                  <p className="text-2xl font-bold">{provider.total_completed_projects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold">{provider.response_time}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold capitalize">{provider.availability}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName || provider.full_name}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  value={bio || provider.bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your expertise, experience, and what services you offer..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Skills *</Label>
                <p className="text-sm text-muted-foreground mb-2">Add your skills (press Enter or click Add)</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g., Graphic Design"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(skills.length > 0 ? skills : provider.skills || []).map((skill: any) => (
                    <span
                      key={typeof skill === "string" ? skill : skill}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {typeof skill === "string" ? skill : skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(typeof skill === "string" ? skill : skill)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Certifications (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">Add your professional certifications</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g., AWS Certified"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" variant="outline" onClick={addCertification}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(certifications.length > 0 ? certifications : provider.certifications || []).map((cert: any) => (
                    <span
                      key={typeof cert === "string" ? cert : cert}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-2"
                    >
                      {typeof cert === "string" ? cert : cert}
                      <button
                        type="button"
                        onClick={() => removeCertification(typeof cert === "string" ? cert : cert)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($) (Optional)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={hourlyRate || (provider.hourly_rate ? provider.hourly_rate.toString() : "")}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="e.g., 25.00"
                  />
                </div>
                <div>
                  <Label htmlFor="responseTime">Response Time (hours) (Optional)</Label>
                  <Input
                    id="responseTime"
                    type="number"
                    min="1"
                    value={responseTime || (provider.response_time ? provider.response_time.toString() : "")}
                    onChange={(e) => setResponseTime(e.target.value)}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="availability">Availability Status *</Label>
                <Select value={availability} onValueChange={(value: any) => setAvailability(value)}>
                  <SelectTrigger id="availability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="portfolioImages">
                  <Upload className="h-4 w-4 inline mr-2" />
                  Portfolio Images (Optional)
                </Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload portfolio images (max 10)
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
                  <div className="mt-2 text-sm text-muted-foreground">
                    {portfolioImages.length} image(s) selected
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="flex-1">
                  {mutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                  ) : (
                    "Update Profile"
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

export default ServiceProviderProfile;
