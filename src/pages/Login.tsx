import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import logo from "@/assets/logo.png";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: isRegister ? "Account Created!" : "Welcome back!", description: "Redirecting..." });
    setTimeout(() => navigate("/"), 1000);
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
            <div><Label>Full Name</Label><Input required placeholder="Full Name" /></div>
          )}
          <div><Label>Email</Label><Input required type="email" placeholder="you@example.com" /></div>
          <div><Label>Password</Label><Input required type="password" placeholder="••••••••" /></div>
          {isRegister && (
            <div><Label>Confirm Password</Label><Input required type="password" placeholder="••••••••" /></div>
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
