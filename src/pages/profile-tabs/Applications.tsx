import { useAuth } from "@/features/auth/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Share2, Wrench } from "lucide-react";

const Applications = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started with Your Next Role</CardTitle>
        <CardDescription>Apply to become a seller, reseller, or service provider.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.role !== "seller" && (
          <a href="/seller/application" className="block">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
              <Store className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Apply to Sell</p>
                <p className="text-sm text-muted-foreground">Start selling your products</p>
              </div>
            </Button>
          </a>
        )}
        {user?.role !== "reseller" && (
          <a href="/reseller/apply" className="block">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
              <Share2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Become a Reseller</p>
                <p className="text-sm text-muted-foreground">Earn by sharing products</p>
              </div>
            </Button>
          </a>
        )}
        {user?.role !== "service_provider" && (
          <a href="/skills/register" className="block">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
              <Wrench className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Register as Service Provider</p>
                <p className="text-sm text-muted-foreground">Offer your skills and services</p>
              </div>
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default Applications;