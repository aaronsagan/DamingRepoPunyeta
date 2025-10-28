import { useState } from "react";
import { Link2, Facebook, Twitter, Instagram, CreditCard, Key, Save, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function IntegrationSection() {
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
  });
  const [apiKeys, setApiKeys] = useState({
    paymentGateway: "",
    analytics: "",
  });

  const [connectedServices, setConnectedServices] = useState({
    facebook: false,
    twitter: false,
    instagram: false,
    paymentGateway: false,
  });

  const handleConnectSocial = (platform: string) => {
    setConnectedServices(prev => ({ ...prev, [platform]: !prev[platform as keyof typeof prev] }));
    toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} ${connectedServices[platform as keyof typeof connectedServices] ? 'disconnected' : 'connected'}`);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Integration settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integration Settings</h2>
        <p className="text-muted-foreground">Connect external services and manage API keys</p>
      </div>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Social Media Connections
          </CardTitle>
          <CardDescription>Link your social media accounts to share updates automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Facebook */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Facebook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Facebook</p>
                <p className="text-sm text-muted-foreground">
                  {connectedServices.facebook ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectedServices.facebook && (
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              <Button
                variant={connectedServices.facebook ? "outline" : "default"}
                onClick={() => handleConnectSocial('facebook')}
              >
                {connectedServices.facebook ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>

          {/* Twitter/X */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                <Twitter className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="font-medium">X (Twitter)</p>
                <p className="text-sm text-muted-foreground">
                  {connectedServices.twitter ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectedServices.twitter && (
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              <Button
                variant={connectedServices.twitter ? "outline" : "default"}
                onClick={() => handleConnectSocial('twitter')}
              >
                {connectedServices.twitter ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>

          {/* Instagram */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Instagram</p>
                <p className="text-sm text-muted-foreground">
                  {connectedServices.instagram ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectedServices.instagram && (
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              <Button
                variant={connectedServices.instagram ? "outline" : "default"}
                onClick={() => handleConnectSocial('instagram')}
              >
                {connectedServices.instagram ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Gateway */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Gateway
          </CardTitle>
          <CardDescription>Configure your payment processing settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Payment Gateway Integration</p>
                <p className="text-sm text-muted-foreground">
                  {connectedServices.paymentGateway ? "Active" : "Not configured"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectedServices.paymentGateway && (
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              <Button
                variant={connectedServices.paymentGateway ? "outline" : "default"}
                onClick={() => handleConnectSocial('paymentGateway')}
              >
                {connectedServices.paymentGateway ? "Disconnect" : "Configure"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Key Management
          </CardTitle>
          <CardDescription>Manage API keys for connected services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-api">Payment Gateway API Key</Label>
            <Input
              id="payment-api"
              type="password"
              value={apiKeys.paymentGateway}
              onChange={(e) => setApiKeys({ ...apiKeys, paymentGateway: e.target.value })}
              placeholder="Enter your API key"
            />
            <p className="text-xs text-muted-foreground">
              Keep your API keys secure and never share them publicly
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="analytics-api">Analytics API Key (Optional)</Label>
            <Input
              id="analytics-api"
              type="password"
              value={apiKeys.analytics}
              onChange={(e) => setApiKeys({ ...apiKeys, analytics: e.target.value })}
              placeholder="Enter your analytics API key"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
