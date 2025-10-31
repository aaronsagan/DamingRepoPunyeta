import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Share2, TrendingUp, Heart, Award, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonated: 0,
    campaignsSupported: 0,
    charitiesHelped: 0,
    donationsMade: 0,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // TODO: Fetch donor stats from API
    // For now, using placeholder data
    setStats({
      totalDonated: 0,
      campaignsSupported: 0,
      charitiesHelped: 0,
      donationsMade: 0,
    });
  }, []);

  const copyProfileLink = () => {
    const link = `${window.location.origin}/donor/profile`;
    navigator.clipboard.writeText(link);
    toast.success('Profile link copied to clipboard!');
  };

  return (
    <div>
      {/* Cover Banner */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
          {/* Avatar */}
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage 
              src={user?.profile_image ? `${API_URL}/storage/${user.profile_image}` : undefined}
              alt={user?.name}
            />
            <AvatarFallback className="text-4xl bg-primary text-primary-foreground font-bold">
              {user?.name?.charAt(0) || 'D'}
            </AvatarFallback>
          </Avatar>

          {/* Name and Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{user?.name || 'Demo Donor'}</h1>
              <Badge className="bg-green-600 hover:bg-green-700">
                <Award className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Helping communities one step at a time
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => navigate('/donor/settings')} className="gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button onClick={copyProfileLink} variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-t-4 border-t-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Raised</p>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">₱{stats.totalDonated.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.campaignsSupported}</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Followers</p>
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{stats.charitiesHelped}</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Updates</p>
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-amber-600">{stats.donationsMade}</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Sections */}
        <div className="grid md:grid-cols-2 gap-6 pb-12">
          {/* About Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Mission</h2>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground">
                Making a difference through charitable giving and community support.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Contact Information</h2>
                  <p className="text-sm text-muted-foreground">Get in touch with us</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Admin Name</p>
                    <p className="font-medium">{user?.name || 'Donor'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email address</p>
                    <p className="font-medium">{user?.email || 'donor@example.com'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vision Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Vision</h2>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground">
                Creating lasting positive impact in communities through consistent support and engagement.
              </p>
            </CardContent>
          </Card>

          {/* Member Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Member Information</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                  <Badge variant="outline">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2025'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                  <Badge variant="outline">Donor</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
