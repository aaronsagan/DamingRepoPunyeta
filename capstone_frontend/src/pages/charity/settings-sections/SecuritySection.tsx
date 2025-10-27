import { useState } from "react";
import { Lock, Shield, Key, Activity, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SecuritySection() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const recentLogins = [
    { device: "Windows PC", location: "Manila, Philippines", time: "2 hours ago", current: true },
    { device: "Mobile App", location: "Quezon City, Philippines", time: "1 day ago", current: false },
    { device: "Chrome Browser", location: "Makati, Philippines", time: "3 days ago", current: false },
  ];

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      // TODO: API call
      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      // TODO: API call
      setIs2FAEnabled(enabled);
      toast.success(enabled ? "2FA enabled successfully" : "2FA disabled");
    } catch (error) {
      toast.error("Failed to update 2FA settings");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security & Access Control</h2>
        <p className="text-muted-foreground">Manage your account security and access settings</p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Password
          </CardTitle>
          <CardDescription>Update your password regularly to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
            </div>
            <Button onClick={() => setIsPasswordDialogOpen(true)}>Change Password</Button>
          </div>

          <Alert className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Enable Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Require a verification code in addition to your password
                </p>
              </div>
            </div>
            <Switch checked={is2FAEnabled} onCheckedChange={handleToggle2FA} />
          </div>

          {is2FAEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                2FA is active. You'll need your authentication app to sign in.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Login Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Login Activity
          </CardTitle>
          <CardDescription>Recent sign-ins and device locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogins.map((login, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{login.device}</p>
                    <p className="text-xs text-muted-foreground">{login.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{login.time}</p>
                  {login.current && (
                    <Badge variant="outline" className="mt-1 text-xs">Current Session</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
