import { useState } from "react";
import { Eye, EyeOff, Users, Mail, Save, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function PrivacySection() {
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showDonorList: true,
    emailVisibility: "registered_only",
    showCampaignStats: true,
    allowComments: true,
    showTeamMembers: true,
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Privacy settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Privacy & Data</h2>
        <p className="text-muted-foreground">Control who can see your information and how it's shared</p>
      </div>

      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Profile Visibility
          </CardTitle>
          <CardDescription>Control who can view your charity profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={privacy.profileVisibility}
            onValueChange={(value) => setPrivacy({ ...privacy, profileVisibility: value })}
          >
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-sm text-muted-foreground">
                    Anyone can view your charity profile and campaigns
                  </p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="registered_only" id="registered" />
              <Label htmlFor="registered" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Registered Donors Only</p>
                  <p className="text-sm text-muted-foreground">
                    Only registered users can view your full profile
                  </p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Private</p>
                  <p className="text-sm text-muted-foreground">
                    Profile is hidden from public view
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Setting your profile to private will hide it from search results and public listings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Donor & Campaign Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Donor & Campaign Privacy
          </CardTitle>
          <CardDescription>Manage what information is publicly visible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="show-donors">Show Donor List</Label>
              <p className="text-sm text-muted-foreground">
                Display the list of donors on your campaigns (names only, amounts hidden)
              </p>
            </div>
            <Switch
              id="show-donors"
              checked={privacy.showDonorList}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, showDonorList: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="show-stats">Show Campaign Statistics</Label>
              <p className="text-sm text-muted-foreground">
                Display detailed campaign statistics and progress publicly
              </p>
            </div>
            <Switch
              id="show-stats"
              checked={privacy.showCampaignStats}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, showCampaignStats: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="show-team">Show Team Members</Label>
              <p className="text-sm text-muted-foreground">
                Display your team members on your public profile
              </p>
            </div>
            <Switch
              id="show-team"
              checked={privacy.showTeamMembers}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, showTeamMembers: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="allow-comments">Allow Comments</Label>
              <p className="text-sm text-muted-foreground">
                Let donors and visitors comment on your campaigns and updates
              </p>
            </div>
            <Switch
              id="allow-comments"
              checked={privacy.allowComments}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, allowComments: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Visibility
          </CardTitle>
          <CardDescription>Control who can see your contact email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={privacy.emailVisibility}
            onValueChange={(value) => setPrivacy({ ...privacy, emailVisibility: value })}
          >
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="public" id="email-public" />
              <Label htmlFor="email-public" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-sm text-muted-foreground">
                    Email is visible to everyone
                  </p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="registered_only" id="email-registered" />
              <Label htmlFor="email-registered" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Registered Users Only</p>
                  <p className="text-sm text-muted-foreground">
                    Only registered donors can see your email
                  </p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="hidden" id="email-hidden" />
              <Label htmlFor="email-hidden" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Hidden</p>
                  <p className="text-sm text-muted-foreground">
                    Email is not displayed publicly
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
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
