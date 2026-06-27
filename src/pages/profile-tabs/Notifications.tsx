import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Notifications = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-muted-foreground">Receive updates via email</p>
          </div>
          <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">SMS Notifications</p>
            <p className="text-sm text-muted-foreground">Receive updates via text message</p>
          </div>
          <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Order Updates</p>
            <p className="text-sm text-muted-foreground">Get notified about your orders</p>
          </div>
          <Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Marketing Emails</p>
            <p className="text-sm text-muted-foreground">Receive promotions and news</p>
          </div>
          <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
        </div>
      </CardContent>
    </Card>
  );
};

export default Notifications;