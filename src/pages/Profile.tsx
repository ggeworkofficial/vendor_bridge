import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api/client";
import { updateUser } from "@/api/user.api";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    console.log("User data:", user);
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
    }
  }, [user]);

  

  const handleUpdate = async () => {
    try {
      await updateUser(user.id, { full_name: fullName, email });
      toast({
        title: "Profile updated",
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || 
        error?.message ||              
        "An error occurred";

      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (!user) return <div>Please login first</div>;

  return (
    <div className="container max-w-md py-10 space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="space-y-2">
        <label>Full Name</label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label>Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <Button onClick={handleUpdate} className="w-full">
        Save Changes
      </Button>
    </div>
  );
};

export default Profile;