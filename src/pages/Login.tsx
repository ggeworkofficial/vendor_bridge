import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import logo from "@/assets/logo.png";
import { login, register } from "@/api/auth.api";
import { useAuth } from "@/features/auth/auth.store";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const setUser = useAuth((state) => state.setUser);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (isRegister) {
        const name = formData.get("full_name") as string;
        alert(name);
        await register({ full_name: name, email, password });
        toast({
          title: "Registration successful",
          description: "You can now log in with your credentials",
        });
        setIsRegister(false);
      } else {
        const response = await login({ email, password });
        setUser(response.data.user);
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.data.user.full_name}!`,
        });
        navigate("/");
      }

    } catch(error) {
      const message =
        error?.response?.data?.message || 
        error?.message ||              
        "An error occurred";

      toast({
        title: "Authentication failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container py-16 max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="VendorBridge" className="h-16 w-16 mx-auto mb-4" width={64} height={64} />
          <h1 className="text-2xl font-display font-bold">{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRegister ? "Join VendorBridge marketplace" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 space-y-4">
          {isRegister && (
            <div><Label>Full Name</Label><Input name="full_name" required placeholder="Full Name" /></div>
          )}
          <div><Label>Email</Label><Input name="email" required type="email" placeholder="you@example.com" /></div>
          <div><Label>Password</Label><Input name="password" required type="password" placeholder="••••••••" /></div>
          {isRegister && (
            <div><Label>Confirm Password</Label><Input name="confirm_password" required type="password" placeholder="••••••••" /></div>
          )}
          <Button type="submit" className="w-full">{isRegister ? "Create Account" : "Sign In"}</Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-primary font-medium hover:underline">
            {isRegister ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
