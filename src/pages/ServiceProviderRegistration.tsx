import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Briefcase, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createServiceProvider, getMyServiceProvider } from "@/api/service.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";
import { ArrowLeft } from "lucide-react";

const ServiceProviderRegistration = () => {
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

  const { data: existingProvider } = useQuery({
    queryKey: ["service-provider"],
    queryFn: () => getMyServiceProvider(),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createServiceProvider(data),
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your service provider profile has been created.",
      });
      navigate("/skills/marketplace");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

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
      toast({
        title: "Authentication Required",
        description: "Please login to register.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const payload = {
      user_id: user.id,
      full_name: fullName,
      bio,
      skills,
      certifications: certifications.length > 0 ? certifications : null,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      response_time: responseTime ? parseInt(responseTime) : null,
    };

    mutation.mutate(payload);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          Please login to register as a service provider.
        </div>
      </Layout>
    );
  }

  if (existingProvider?.data) {
    const provider = existingProvider.data;
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
              Service Provider Profile
            </h1>
            <p className="text-muted-foreground">Your profile status</p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  Profile{" "}
                  {provider.verified ? "Verified" : "Pending Verification"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {provider.verified
                    ? "Your service provider profile is verified. You can now offer services on the marketplace."
                    : "Your profile is under review. We will notify you once it's verified."}
                </p>
                <div className="bg-muted/50 p-4 rounded-lg text-left">
                  <h3 className="font-medium mb-2">Profile Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {provider.full_name}
                    </p>
                    <p>
                      <span className="font-medium">Hourly Rate:</span>{" "}
                      {provider.hourly_rate
                        ? `$${provider.hourly_rate}/hr`
                        : "Not set"}
                    </p>
                    <p>
                      <span className="font-medium">Rating:</span>{" "}
                      {provider.rating.toFixed(1)} ({provider.review_count}{" "}
                      reviews)
                    </p>
                    <p>
                      <span className="font-medium">Completed Projects:</span>{" "}
                      {provider.total_completed_projects}
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
            Become a Service Provider
          </h1>
          <p className="text-muted-foreground">
            Offer your skills and services on VendorBridge
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Provider Registration</CardTitle>
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

              <div>
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your expertise, experience, and what services you offer..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Skills *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add your skills (press Enter or click Add)
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g., Graphic Design"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Certifications (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add your professional certifications
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g., AWS Certified"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addCertification())
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCertification}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-2"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertification(cert)}
                        className="hover:text-red-500"
                      >
                        ×
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
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="e.g., 25.00"
                  />
                </div>
                <div>
                  <Label htmlFor="responseTime">
                    Response Time (hours) (Optional)
                  </Label>
                  <Input
                    id="responseTime"
                    type="number"
                    min="1"
                    value={responseTime}
                    onChange={(e) => setResponseTime(e.target.value)}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Service Provider Benefits:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Reach thousands of potential clients</li>
                  <li>Secure escrow payments</li>
                  <li>Build your reputation with reviews</li>
                  <li>Flexible pricing options</li>
                  <li>Project management tools</li>
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
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating
                      Profile...
                    </>
                  ) : (
                    "Create Profile"
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

export default ServiceProviderRegistration;
