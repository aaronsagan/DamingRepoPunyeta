import { useState } from "react";
import { Bell, Mail, MessageSquare, Users, Megaphone, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function NotificationSection() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    donationAlerts: true,
    campaignUpdates: true,
    platformAnnouncements: true,
    volunteerSignups: true,
    commentNotifications: true,
    monthlyReports: true,
    weeklyDigest: false,
  });

  const handleToggle = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Preferences</h2>
        <p className="text-muted-foreground">Choose how you want to receive updates and alerts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>Manage email notification settings</CardDescription>
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
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="donation-alerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Donation Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified immediately when someone donates to your campaigns
              </p>
            </div>
            <Switch
              id="donation-alerts"
              checked={notifications.donationAlerts}
              onCheckedChange={(checked) => handleToggle('donationAlerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="campaign-updates" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Campaign Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your campaign performance and milestones
              </p>
            </div>
            <Switch
              id="campaign-updates"
              checked={notifications.campaignUpdates}
              onCheckedChange={(checked) => handleToggle('campaignUpdates', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="platform-announcements" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Platform Announcements
              </Label>
              <p className="text-sm text-muted-foreground">
                Stay informed about new features and platform updates
              </p>
            </div>
            <Switch
              id="platform-announcements"
              checked={notifications.platformAnnouncements}
              onCheckedChange={(checked) => handleToggle('platformAnnouncements', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="volunteer-signups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Volunteer Sign-ups
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when volunteers sign up for your events
              </p>
            </div>
            <Switch
              id="volunteer-signups"
              checked={notifications.volunteerSignups}
              onCheckedChange={(checked) => handleToggle('volunteerSignups', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="comment-notifications" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments & Interactions
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone comments on your posts or campaigns
              </p>
            </div>
            <Switch
              id="comment-notifications"
              checked={notifications.commentNotifications}
              onCheckedChange={(checked) => handleToggle('commentNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Digest & Reports
          </CardTitle>
          <CardDescription>Periodic summaries and reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="monthly-reports">Monthly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive monthly performance reports and analytics
              </p>
            </div>
            <Switch
              id="monthly-reports"
              checked={notifications.monthlyReports}
              onCheckedChange={(checked) => handleToggle('monthlyReports', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="weekly-digest">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Get a weekly summary of all activities and updates
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={notifications.weeklyDigest}
              onCheckedChange={(checked) => handleToggle('weeklyDigest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
