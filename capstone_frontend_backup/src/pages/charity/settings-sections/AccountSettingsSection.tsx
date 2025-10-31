import { useState, useEffect } from "react";
import { Save, Building2, Mail, Phone, MapPin, Globe, Clock, User, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AccountSettingsSection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Admin Info
    adminName: user?.name || "",
    adminEmail: user?.email || "",
    adminPhone: "",
    adminPosition: "Administrator",
    // Organization Info
    organizationName: user?.charity?.name || "",
    orgEmail: user?.charity?.email || "",
    orgPhone: user?.charity?.phone || "",
    address: user?.charity?.address || "",
    website: user?.charity?.website || "",
    timezone: "UTC+8",
    language: "en",
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: API call to update account settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Account settings updated successfully");
    } catch (error) {
      toast.error("Failed to update account settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-muted-foreground">Manage your personal and organization information</p>
      </div>

      {/* Personal Admin Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>Your account details as the charity administrator</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name *</Label>
              <Input
                id="admin-name"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-position" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Position/Title
              </Label>
              <Input
                id="admin-position"
                value={formData.adminPosition}
                onChange={(e) => setFormData({ ...formData, adminPosition: e.target.value })}
                placeholder="e.g., Executive Director"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Personal Email *
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Personal Phone
              </Label>
              <Input
                id="admin-phone"
                type="tel"
                value={formData.adminPhone}
                onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                placeholder="+63 XXX XXX XXXX"
              />
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg border">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Account Type:</span>
                <span className="text-muted-foreground">Charity Administrator</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Member Since:</span>
                <span className="text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Account Status:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Organization Information
          </CardTitle>
          <CardDescription>Update your charity's public details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name *</Label>
            <Input
              id="org-name"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              placeholder="Enter organization name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Official Email Address *
              </Label>
              <Input
                id="org-email"
                type="email"
                value={formData.orgEmail}
                onChange={(e) => setFormData({ ...formData, orgEmail: e.target.value })}
                placeholder="contact@charity.org"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Number
              </Label>
              <Input
                id="org-phone"
                type="tel"
                value={formData.orgPhone}
                onChange={(e) => setFormData({ ...formData, orgPhone: e.target.value })}
                placeholder="+63 XXX XXX XXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address / Headquarters Location
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your organization's address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.yourcharity.org"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Regional Preferences
          </CardTitle>
          <CardDescription>Set your timezone and language preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC+8">UTC+8 (Philippine Time)</SelectItem>
                  <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                  <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                  <SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fil">Filipino</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
