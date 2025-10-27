import { useEffect, useState } from "react";
import { 
  DollarSign, 
  Megaphone, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Plus,
  Heart,
  MessageCircle,
  Calendar,
  ArrowRight,
  BarChart3,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authService } from "@/services/auth";
import { charityService } from "@/services/charity";
import { toast } from "sonner";
import { getCharityCoverUrl } from "@/lib/storage";

export default function CharityDashboard() {
  const navigate = useNavigate();
  const [charityData, setCharityData] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending'|'approved'|'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonationsMonth: 0,
    totalDonationsAllTime: 0,
    activeCampaigns: 0,
    donorsThisMonth: 0,
    pendingConfirmations: 0,
    newInteractions: 0
  });

  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [recentUpdate, setRecentUpdate] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    loadAnalyticsData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        navigate('/auth/login');
        return;
      }

      // Get charity data
      const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      
      if (!res.ok) {
        toast.error('Failed to load charity data');
        return;
      }

      const me = await res.json();
      const charity = me?.charity;
      
      if (!charity) {
        toast.error('No charity found for this account');
        return;
      }

      setCharityData(charity);
      const status = charity.verification_status as 'pending'|'approved'|'rejected' | undefined;
      if (status) setVerificationStatus(status);

      // Load dashboard stats in parallel
      await Promise.all([
        loadStats(charity.id),
        loadRecentDonations(charity.id),
        loadRecentPosts(charity.id)
      ]);

    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async (charityId: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      // Get donations data
      const donationsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/donations`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      if (donationsRes.ok) {
        const donations = await donationsRes.json();
        const allDonations = donations.data || donations;

        // Calculate stats
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthDonations = allDonations.filter((d: any) => {
          const donationDate = new Date(d.created_at);
          return donationDate.getMonth() === currentMonth && 
                 donationDate.getFullYear() === currentYear &&
                 d.status === 'confirmed';
        });

        const confirmedDonations = allDonations.filter((d: any) => d.status === 'confirmed');
        const pendingDonations = allDonations.filter((d: any) => d.status === 'pending');

        const totalMonth = thisMonthDonations.reduce((sum: number, d: any) => sum + parseFloat(d.amount || 0), 0);
        const totalAllTime = confirmedDonations.reduce((sum: number, d: any) => sum + parseFloat(d.amount || 0), 0);

        // Get unique donors this month
        const uniqueDonors = new Set(thisMonthDonations.map((d: any) => d.donor_id || d.donor_name));

        setStats(prev => ({
          ...prev,
          totalDonationsMonth: totalMonth,
          totalDonationsAllTime: totalAllTime,
          donorsThisMonth: uniqueDonors.size,
          pendingConfirmations: pendingDonations.length
        }));
      }

      // Get campaigns data
      const campaignsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/campaigns`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      if (campaignsRes.ok) {
        const campaigns = await campaignsRes.json();
        const campaignList = campaigns.data || campaigns;
        const activeCampaigns = campaignList.filter((c: any) => c.status === 'active');
        
        setStats(prev => ({
          ...prev,
          activeCampaigns: activeCampaigns.length
        }));
      }

      // Get posts data for interactions count
      const postsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/posts`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      if (postsRes.ok) {
        const posts = await postsRes.json();
        const postList = posts.data || posts;
        
        // Calculate new interactions (likes + comments from recent posts)
        const recentPosts = postList.slice(0, 5);
        const interactions = recentPosts.reduce((sum: number, post: any) => {
          return sum + (post.likes_count || 0) + (post.comments_count || 0);
        }, 0);

        setStats(prev => ({
          ...prev,
          newInteractions: interactions
        }));
      }

    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      // Get charity ID from user
      const userRes = await fetch(
        `${import.meta.env.VITE_API_URL}/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let charityId = null;
      if (userRes.ok) {
        const userData = await userRes.json();
        charityId = userData.charity?.id;
      }

      // Don't proceed if we don't have a charity ID
      if (!charityId) {
        console.warn('No charity ID found');
        return;
      }

      // Get campaign types
      const typesRes = await fetch(
        `${import.meta.env.VITE_API_URL}/analytics/campaigns/types`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let types = [];
      let topType = null;
      if (typesRes.ok) {
        const typesData = await typesRes.json();
        types = typesData.data || [];
        topType = types[0];
      }

      // Get trending campaigns (top performing)
      const trendingRes = await fetch(
        `${import.meta.env.VITE_API_URL}/analytics/campaigns/trending?days=7&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let topCampaign = null;
      let trendingCampaigns = [];
      if (trendingRes.ok) {
        const trendingData = await trendingRes.json();
        trendingCampaigns = trendingData.data || [];
        topCampaign = trendingCampaigns[0];
      }

      // Calculate recent donations summary from recentDonations
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Get all donations for this charity
      const donationsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/donations`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      let donationsThisWeek = 0;
      let donationsThisMonth = 0;
      let donationsLastMonth = 0;
      let uniqueDonorsThisMonth = new Set();
      let returningDonors = 0;

      if (donationsRes.ok) {
        const donationsData = await donationsRes.json();
        const allDonations = donationsData.data || donationsData || [];
        const confirmedDonations = allDonations.filter((d: any) => d.status === 'confirmed');

        confirmedDonations.forEach((d: any) => {
          const donationDate = new Date(d.created_at);
          const amount = parseFloat(d.amount || 0);

          if (donationDate >= oneWeekAgo) {
            donationsThisWeek += amount;
          }
          if (donationDate >= oneMonthAgo) {
            donationsThisMonth += amount;
            if (d.donor_id) uniqueDonorsThisMonth.add(d.donor_id);
          }
          if (donationDate >= twoMonthsAgo && donationDate < oneMonthAgo) {
            donationsLastMonth += amount;
          }
        });

        // Calculate returning donors
        const donorCounts = new Map();
        confirmedDonations.forEach((d: any) => {
          if (d.donor_id) {
            donorCounts.set(d.donor_id, (donorCounts.get(d.donor_id) || 0) + 1);
          }
        });
        returningDonors = Array.from(donorCounts.values()).filter(count => count > 1).length;
      }

      // Calculate trend
      const trend = donationsLastMonth > 0 
        ? ((donationsThisMonth - donationsLastMonth) / donationsLastMonth * 100).toFixed(1)
        : 100;

      // Generate key insight
      let keyInsight = "Keep engaging with your donors to maintain momentum.";
      if (parseFloat(trend) > 10) {
        keyInsight = `Great work! Donations increased by ${trend}% this month. Your campaigns are gaining traction.`;
      } else if (parseFloat(trend) < -10) {
        keyInsight = `Donations decreased by ${Math.abs(parseFloat(trend))}% this month. Consider launching new campaigns or updates.`;
      } else if (topCampaign && topCampaign.donation_count > 5) {
        keyInsight = `"${topCampaign.title}" is trending with ${topCampaign.donation_count} donations this week!`;
      }

      setAnalyticsData({
        topType,
        topCampaign,
        totalTypes: types.length,
        donationsThisWeek,
        donationsThisMonth,
        trend: parseFloat(trend),
        uniqueDonors: uniqueDonorsThisMonth.size,
        returningDonors,
        newDonors: uniqueDonorsThisMonth.size - returningDonors,
        keyInsight,
        trendingType: types[0] // Most common type is already trending
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadRecentDonations = async (charityId: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/donations`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      if (res.ok) {
        const data = await res.json();
        const donations = data.data || data;
        
        // Get confirmed donations, sorted by date
        const confirmed = donations
          .filter((d: any) => d.status === 'confirmed')
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4)
          .map((d: any) => ({
            donor: d.donor_name || 'Anonymous',
            amount: parseFloat(d.amount || 0),
            campaign: d.campaign?.title || 'General Fund',
            date: formatTimeAgo(d.created_at)
          }));

        setRecentDonations(confirmed);
      }
    } catch (error) {
      console.error('Failed to load recent donations:', error);
    }
  };

  const loadRecentPosts = async (charityId: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/posts`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      if (res.ok) {
        const data = await res.json();
        const posts = data.data || data;
        
        if (posts.length > 0) {
          const latest = posts[0];
          setRecentUpdate({
            title: latest.title || 'Untitled Post',
            snippet: latest.content ? latest.content.substring(0, 100) + '...' : 'No content',
            likes: latest.likes_count || 0,
            comments: latest.comments_count || 0,
            date: formatTimeAgo(latest.created_at)
          });
        }
      }
    } catch (error) {
      console.error('Failed to load recent posts:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            VERIFIED
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            PENDING REVIEW
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            ACTION REQUIRED
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const coverImageUrl = getCharityCoverUrl(charityData?.cover_image);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Cover Photo */}
      <div className="relative h-80 overflow-hidden">
        {/* Cover Image */}
        {coverImageUrl ? (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${coverImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        )}
        
        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-end p-8 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {charityData?.name || 'Your Charity Name'}
          </h1>
          <p className="text-lg text-white/90 max-w-3xl">
            {charityData?.mission || 'Empowering communities through sustainable programs and transparent fundraising.'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* 1. Actionable Alerts & To-Do Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Action Required</CardTitle>
            <CardDescription>Important tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {/* Pending Donations */}
            <button
              onClick={() => navigate('/charity/donations')}
              className="flex flex-col items-start p-4 rounded-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {stats.pendingConfirmations}
              </div>
              <div className="text-sm font-medium">Donations Pending</div>
              <div className="text-xs text-muted-foreground">Click to review</div>
            </button>

            {/* Verification Status */}
            <div className="flex flex-col items-start p-4 rounded-lg border-2 border-muted">
              <div className="mb-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mb-2">
                {getVerificationBadge(verificationStatus)}
              </div>
              <div className="text-sm font-medium">Verification Status</div>
              <div className="text-xs text-muted-foreground mt-1">
                {verificationStatus === 'approved' && 'Your charity is verified'}
                {verificationStatus === 'pending' && 'Under admin review'}
                {verificationStatus === 'rejected' && 'Please update documents'}
              </div>
            </div>

            {/* New Interactions */}
            <button
              onClick={() => navigate('/charity/updates')}
              className="flex flex-col items-start p-4 rounded-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.newInteractions}
              </div>
              <div className="text-sm font-medium">New Interactions</div>
              <div className="text-xs text-muted-foreground">Comments & likes</div>
            </button>
          </CardContent>
        </Card>

        {/* 2. Key Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ₱{stats.totalDonationsMonth.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total donations received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Time</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₱{stats.totalDonationsAllTime.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Grand total raised
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Megaphone className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.activeCampaigns}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donors This Month</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.donorsThisMonth}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique supporters
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 3. Analytics Insights - Enhanced */}
        {analyticsData && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Analytics Insights
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Real-time performance metrics and trends</p>
              </div>
              <Button onClick={() => navigate('/charity/analytics')} size="lg" className="shadow-lg">
                View Detailed Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Key Insight Banner */}
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/30 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 mt-0.5">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Key Insight</h3>
                    <p className="text-muted-foreground">{analyticsData.keyInsight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Top-Performing Campaign */}
              {analyticsData.topCampaign && (
                <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/40 hover:border-primary/50 cursor-pointer bg-[#1E2A38]/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-colors">
                        <TrendingUp className="h-6 w-6 text-amber-500" />
                      </div>
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        Top
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Performing</p>
                      <h3 className="font-bold text-lg line-clamp-2 text-[#E0E6ED] min-h-[3.5rem]">
                        {analyticsData.topCampaign.title}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-amber-500">
                          {analyticsData.topCampaign.progress?.toFixed(0) || 0}%
                        </span>
                        <span className="text-xs text-muted-foreground">of goal</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData.topCampaign.donation_count} donations this week
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Donations Summary */}
              <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/40 hover:border-primary/50 bg-[#1E2A38]/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-colors">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        analyticsData.trend > 0 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : analyticsData.trend < 0
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}
                    >
                      {analyticsData.trend > 0 ? '+' : ''}{analyticsData.trend.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Month</p>
                    <h3 className="text-2xl font-bold text-[#E0E6ED]">
                      ₱{analyticsData.donationsThisMonth.toLocaleString()}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ₱{analyticsData.donationsThisWeek.toLocaleString()} this week
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {analyticsData.trend > 0 ? '↑' : analyticsData.trend < 0 ? '↓' : '→'} vs last month
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Donor Engagement */}
              <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/40 hover:border-primary/50 bg-[#1E2A38]/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-colors">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Donor Engagement</p>
                    <h3 className="text-2xl font-bold text-[#E0E6ED]">
                      {analyticsData.uniqueDonors}
                    </h3>
                    <p className="text-xs text-muted-foreground">unique donors this month</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Returning</p>
                        <p className="text-sm font-bold text-blue-500">{analyticsData.returningDonors}</p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">New</p>
                        <p className="text-sm font-bold text-cyan-500">{analyticsData.newDonors}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Campaign Type */}
              {analyticsData.trendingType && (
                <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/40 hover:border-primary/50 bg-[#1E2A38]/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                        <Megaphone className="h-6 w-6 text-purple-500" />
                      </div>
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        Trending
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Most Active Type</p>
                      <h3 className="text-xl font-bold text-[#E0E6ED] capitalize">
                        {analyticsData.trendingType.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData.trendingType.count} active campaign{analyticsData.trendingType.count !== 1 ? 's' : ''}
                      </p>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">Focus on this category for better engagement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* 4. Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your charity operations efficiently</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/charity/donations')} className="flex-1 min-w-[200px]">
              <Plus className="mr-2 h-5 w-5" />
              Log a New Donation
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/charity/updates')} className="flex-1 min-w-[200px]">
              <Plus className="mr-2 h-5 w-5" />
              Create a New Update
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/charity/campaigns')} className="flex-1 min-w-[200px]">
              <Plus className="mr-2 h-5 w-5" />
              Start a New Campaign
            </Button>
          </CardContent>
        </Card>

        {/* 5. Recent Activity Feed */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Donations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>Latest contributions from your supporters</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/charity/donations')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentDonations.length > 0 ? (
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-4">
                    {recentDonations.map((donation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            <span className="font-semibold">{donation.donor}</span> donated{' '}
                            <span className="text-green-600 font-bold">₱{donation.amount.toLocaleString()}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            to {donation.campaign}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {donation.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-[280px] flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h4 className="font-semibold mb-2">No donations yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Confirmed donations will appear here
                    </p>
                    <Button variant="outline" onClick={() => navigate('/charity/donations')}>
                      View All Donations
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Updates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Updates</CardTitle>
                  <CardDescription>Your latest post activity</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/charity/updates')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUpdate ? (
                  <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/charity/updates')}>
                    <h4 className="font-semibold mb-2">{recentUpdate.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {recentUpdate.snippet}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{recentUpdate.likes} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span>{recentUpdate.comments} comments</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <Calendar className="h-4 w-4" />
                        <span>{recentUpdate.date}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg border text-center">
                    <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h4 className="font-semibold mb-2">No updates yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't posted any updates
                    </p>
                  </div>
                )}

                {/* Call to Action */}
                <div className="p-6 rounded-lg border-2 border-dashed border-muted-foreground/25 text-center">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Share Your Impact</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Keep your donors engaged by posting regular updates about your work
                  </p>
                  <Button onClick={() => navigate('/charity/updates')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
