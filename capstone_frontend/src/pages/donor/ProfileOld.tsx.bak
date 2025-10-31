import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Share2, MoreVertical, MapPin, TrendingUp, Heart, Calendar, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");
  
  const [stats, setStats] = useState({
    totalDonated: 0,
    campaignsSupported: 0,
    recentDonations: 0,
    likedCampaigns: 0,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // TODO: Fetch donor stats
    setStats({
      totalDonated: 0,
      campaignsSupported: 0,
      recentDonations: 0,
      likedCampaigns: 0,
    });
  }, []);

  const handleShare = () => {
    const url = `${window.location.origin}/donor/profile`;
    if (navigator.share) {
      navigator.share({
        title: user?.name || 'Donor Profile',
        text: 'Check out my donor profile',
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '₱0';
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const logoUrl = user?.profile_image ? `${API_URL}/storage/${user.profile_image}` : null;

  const statItems = [
    {
      icon: TrendingUp,
      label: "Total Donated",
      value: formatCurrency(stats.totalDonated),
      gradient: "from-emerald-500/20 via-emerald-400/10 to-transparent",
      ring: "ring-emerald-500/30",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
    },
    {
      icon: Calendar,
      label: "Campaigns Supported",
      value: stats.campaignsSupported.toString(),
      gradient: "from-indigo-500/20 via-indigo-400/10 to-transparent",
      ring: "ring-indigo-500/30",
      iconColor: "text-indigo-400",
      valueColor: "text-indigo-400",
    },
    {
      icon: Heart,
      label: "Recent Donations",
      value: stats.recentDonations.toString(),
      gradient: "from-sky-500/20 via-sky-400/10 to-transparent",
      ring: "ring-sky-500/30",
      iconColor: "text-sky-400",
      valueColor: "text-sky-400",
    },
    {
      icon: FileText,
      label: "Liked Campaigns",
      value: stats.likedCampaigns.toString(),
      gradient: "from-fuchsia-500/20 via-fuchsia-400/10 to-transparent",
      ring: "ring-fuchsia-500/30",
      iconColor: "text-fuchsia-400",
      valueColor: "text-fuchsia-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      {/* Profile Header - EXACT copy of charity ProfileHeader structure */}
      <div className="relative bg-gradient-to-br from-orange-50/30 via-pink-50/20 to-blue-50/30 dark:from-orange-950/10 dark:via-pink-950/10 dark:to-blue-950/10">
        {/* Breadcrumb / Back Button */}
        <div className="container mx-auto px-4 lg:px-8 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Cover Photo with Side Margins */}
        <div className="container mx-auto px-4 lg:px-8 pt-4 pb-16">
          <div className="relative h-[280px] lg:h-[340px] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-orange-100/50 via-pink-100/40 to-blue-100/50 dark:from-orange-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
            {/* Decorative background pattern */}
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200/40 via-pink-200/30 to-blue-200/40 dark:from-orange-800/20 dark:via-pink-800/20 dark:to-blue-800/20" />
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="hearts" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M50 70 L30 50 Q20 40 30 30 T50 30 T70 30 Q80 40 70 50 Z" fill="currentColor" opacity="0.1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hearts)"/>
                </svg>
              </div>
            </div>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent dark:from-gray-900/40" />
          </div>
        </div>

        {/* Profile Content - Logo overlaps cover slightly */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative -mt-24 lg:-mt-28">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4 lg:gap-6 lg:pl-6">
              {/* Logo - Slightly overlapping cover bottom */}
              <Avatar className="h-32 w-32 lg:h-40 lg:w-40 ring-6 ring-white dark:ring-gray-900 shadow-2xl transition-transform duration-200 hover:scale-105 bg-white dark:bg-gray-800 lg:ml-8">
                <AvatarImage src={logoUrl || undefined} alt={user?.name} />
                <AvatarFallback className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-[#F2A024] to-orange-500 text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DD'}
                </AvatarFallback>
              </Avatar>

              {/* Info & Actions */}
              <div className="flex-1 pb-2 w-full">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Name & Info */}
                  <div className="flex-1 pt-0">
                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight mb-1">
                      {user?.name || 'Demo Donor'}
                    </h1>
                    
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className="bg-gray-700 hover:bg-gray-600 text-white border-0 px-3 py-1.5 text-sm font-medium">
                        Donor Account
                      </Badge>
                    </div>
                    
                    {user?.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{user.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => navigate('/donor/settings')}
                      className="bg-[#F2A024] hover:bg-[#E89015] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-[#F2A024]"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleShare}
                      className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate('/donor/settings')}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShare}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 pt-6">
        {/* Stats - EXACT copy of ProfileStats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-8">
          {statItems.map((item, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ${item.ring} hover:ring-2 active:scale-[0.98]`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
              <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
                <div>
                  <p className={`text-2xl lg:text-3xl font-extrabold ${item.valueColor}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
                <div className="shrink-0">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                    <item.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${item.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <p className="text-muted-foreground text-sm">
                    Making a difference through charitable giving and community support.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{user?.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Member Information</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Member Since</p>
                    <Badge variant="outline">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2025'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Account Type</p>
                    <Badge variant="outline">Donor</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start supporting campaigns to see your activity here
                </p>
                <Button onClick={() => navigate('/donor/campaigns')}>
                  Explore Campaigns
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
