import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateUser } from "@/api/user.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PersonalInfo = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      await updateUser(user.id, { full_name: fullName, email });
      toast({ title: "Profile updated" });
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "An error occurred";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your name and email address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button onClick={handleUpdate}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;