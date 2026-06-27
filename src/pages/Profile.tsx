import { ArrowLeft, User, Shield, Bell, Settings, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/auth.store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/components/theme-provider";

// Tab components
import PersonalInfo from "./profile-tabs/PersonalInfo";
import Security from "./profile-tabs/Security";
import Notifications from "./profile-tabs/Notifications";
import Preferences from "./profile-tabs/Preferences";
import DangerZone from "./profile-tabs/DangerZone";
import Applications from "./profile-tabs/Applications";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <div>Please login first</div>;

  return (
    <>
      {/* Back button */}
      <div className="container py-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </Button>
      </div>

      <div className="container max-w-5xl py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="text-2xl">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user?.full_name || "User"}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-primary capitalize">{user?.role || "Buyer"}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4 hidden sm:inline" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4 hidden sm:inline" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:inline" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="h-4 w-4 hidden sm:inline" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2">
              <FileText className="h-4 w-4 hidden sm:inline" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4 hidden sm:inline" />
              Danger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalInfo />
          </TabsContent>

          <TabsContent value="security">
            <Security />
          </TabsContent>

          <TabsContent value="notifications">
            <Notifications />
          </TabsContent>

          <TabsContent value="preferences">
            <Preferences />
          </TabsContent>

          <TabsContent value="applications">
            <Applications />
          </TabsContent>

          <TabsContent value="danger">
            <DangerZone />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Profile;