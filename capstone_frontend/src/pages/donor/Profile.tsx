import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Share2, TrendingUp, Heart, Award, DollarSign, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonated: 0,
    campaignsSupported: 0,
    recentDonations: 0,
    likedCampaigns: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("Making a difference through charitable giving and community support.");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDonorData();
  }, []);

  const fetchDonorData = async () => {
    try {
      // TODO: Fetch from API
      // For now using placeholder
      setStats({
        totalDonated: 0,
        campaignsSupported: 0,
        recentDonations: 0,
        likedCampaigns: 0,
      });
      setRecentActivity([]);
    } catch (error) {
      console.error('Error fetching donor data:', error);
    }
  };

  const handleSaveBio = () => {
    // TODO: API call to save bio
    toast.success('Bio updated successfully');
    setEditingBio(false);
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/donor/profile`;
    navigator.clipboard.writeText(link);
    toast.success('Profile link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button - Outside Banner */}
      <div className="bg-[#0a1628] px-6 py-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-white/10 -ml-2"
          onClick={() => navigate(-1)}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
      </div>

      {/* Cover Banner */}
      <div className="relative h-64 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
          {/* Avatar */}
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl bg-orange-500">
            <AvatarImage 
              src={user?.profile_image ? `${API_URL}/storage/${user.profile_image}` : undefined}
              alt={user?.name}
            />
            <AvatarFallback className="text-4xl bg-orange-500 text-white font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'D'}
            </AvatarFallback>
          </Avatar>

          {/* Name and Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">{user?.name || 'Demo Donor'}</h1>
              <Badge className="bg-gray-700 hover:bg-gray-600 text-white border-0">
                Donor Account
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>{user?.address || '123 Donor Street, Manila'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/donor/settings')} 
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button 
              onClick={copyProfileLink} 
              variant="outline" 
              size="icon"
              className="border-gray-600 hover:bg-gray-800"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards - Donor Specific */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-8">
          <Card className="bg-[#0d2b3e] border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Total Donated</p>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-500">₱{stats.totalDonated.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1e2347] border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Campaigns Supported</p>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Award className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-500">{stats.campaignsSupported}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0d2535] border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Recent Donations</p>
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-cyan-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-cyan-500">{stats.recentDonations}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#2b1b47] border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Liked Campaigns</p>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Heart className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-500">{stats.likedCampaigns}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="about" className="mb-8">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* About / Mission */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">About</h2>
                    {!editingBio ? (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingBio(true)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingBio(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleSaveBio}
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingBio ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-3 border rounded-md bg-background min-h-[100px] resize-none"
                      placeholder="Tell others about yourself..."
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {bio}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">Contact Information</h2>
                      <p className="text-sm text-muted-foreground">Get in touch</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Email address</p>
                        <p className="font-medium truncate">{user?.email || 'donor@example.com'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Member Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Member Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Member Since</p>
                    <Badge variant="outline" className="text-sm">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2025'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Account Type</p>
                    <Badge variant="outline" className="text-sm">Donor</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <Badge className="bg-green-600 text-sm">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest donations and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No recent activity yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start supporting campaigns to see your activity here
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/donor/campaigns')}
                    >
                      Explore Campaigns
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                        </div>
                        <Badge variant="outline">{activity.amount}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
