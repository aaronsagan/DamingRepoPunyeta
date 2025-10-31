import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Bell, Eye, Lock, AlertTriangle, Trash2, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface AccountSettingsTabProps {
  accountSettings: any;
  setAccountSettings: (settings: any) => void;
  markAsChanged: () => void;
  charityId?: number;
}

export default function AccountSettingsTab({ accountSettings, setAccountSettings, markAsChanged, charityId }: AccountSettingsTabProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleToggleSetting = (key: string, value: boolean) => {
    setAccountSettings((prev: any) => ({ ...prev, [key]: value }));
    markAsChanged();
  };

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
      // TODO: API call to change password
      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      // TODO: API call to deactivate
      toast.success("Account deactivated");
      setIsDeactivateDialogOpen(false);
      logout();
      navigate('/');
    } catch (error) {
      toast.error("Failed to deactivate account");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      // TODO: API call to delete
      toast.success("Account deleted");
      setIsDeleteDialogOpen(false);
      logout();
      navigate('/');
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how you receive updates and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive general email notifications about your account
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={accountSettings.email_notifications}
              onCheckedChange={(checked) => handleToggleSetting('email_notifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="donation-alerts">Donation Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone donates to your campaigns
              </p>
            </div>
            <Switch
              id="donation-alerts"
              checked={accountSettings.donation_alerts}
              onCheckedChange={(checked) => handleToggleSetting('donation_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="campaign-updates">Campaign Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your campaign performance
              </p>
            </div>
            <Switch
              id="campaign-updates"
              checked={accountSettings.campaign_updates}
              onCheckedChange={(checked) => handleToggleSetting('campaign_updates', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="comment-notifications">Comment Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone comments on your posts or campaigns
              </p>
            </div>
            <Switch
              id="comment-notifications"
              checked={accountSettings.comment_notifications}
              onCheckedChange={(checked) => handleToggleSetting('comment_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control your organization's visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your organization profile visible to the public
              </p>
            </div>
            <Switch
              id="profile-visibility"
              checked={accountSettings.profile_visibility === 'public'}
              onCheckedChange={(checked) => 
                handleToggleSetting('profile_visibility', checked ? 'public' : 'private')
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your password regularly to keep your account secure
                </p>
              </div>
            </div>
            <Button onClick={() => setIsPasswordDialogOpen(true)}>
              Change Password
            </Button>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Use a strong password with at least 8 characters, including uppercase, lowercase, and numbers.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These actions are permanent and cannot be undone. Please proceed with extreme caution.
            </AlertDescription>
          </Alert>

          {/* Deactivate Account */}
          <div className="p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Deactivate Account
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Temporarily disable your account. You can reactivate it later by logging in.
                </p>
                <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1 list-disc list-inside">
                  <li>Your profile will be hidden from public view</li>
                  <li>Active campaigns will be paused</li>
                  <li>You can reactivate anytime</li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40"
                onClick={() => setIsDeactivateDialogOpen(true)}
              >
                Deactivate
              </Button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-destructive mb-1">
                  Delete Account Permanently
                </h4>
                <p className="text-sm text-destructive/80 mb-3">
                  Permanently delete your account and all associated data. This action cannot be reversed.
                </p>
                <ul className="text-xs text-destructive/70 space-y-1 list-disc list-inside">
                  <li>All campaigns will be deleted</li>
                  <li>Donation history will be removed</li>
                  <li>All data will be permanently erased</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
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
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-amber-600">Deactivate Account</DialogTitle>
            <DialogDescription>
              Your account will be temporarily disabled. You can reactivate it by logging in again.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your profile will be hidden and campaigns paused, but all data will be preserved.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-amber-200 text-amber-600"
              onClick={handleDeactivateAccount}
            >
              Deactivate Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account Permanently</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              All campaigns, donations, and data will be permanently erased.
            </AlertDescription>
          </Alert>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <span className="font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
