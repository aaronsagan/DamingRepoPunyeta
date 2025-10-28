import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Crown, TrendingUp, Users, Heart, Building } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface LeaderboardEntry {
  id: number;
  name: string;
  profile_image?: string;
  logo_path?: string;
  total_donated?: number;
  total_received?: number;
  donation_count: number;
}

interface LeaderboardStats {
  summary: {
    total_donations: number;
    total_donation_count: number;
    total_donors: number;
    average_donation: number;
  };
  monthly_trends: Array<{
    year: number;
    month: number;
    total_amount: number;
    donation_count: number;
  }>;
}

export default function Leaderboard() {
  const [topDonors, setTopDonors] = useState<LeaderboardEntry[]>([]);
  const [topCharities, setTopCharities] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all_time");
  const [type, setType] = useState("donors");

  useEffect(() => {
    fetchLeaderboardData();
  }, [period, type]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch period-based leaderboard
      const leaderboardResponse = await axios.get("/api/leaderboard/period", {
        params: { period, type, limit: 20 }
      });

      if (type === "donors") {
        setTopDonors(Array.isArray(leaderboardResponse.data?.results) ? leaderboardResponse.data.results : []);
      } else {
        setTopCharities(Array.isArray(leaderboardResponse.data?.results) ? leaderboardResponse.data.results : []);
      }

      // Fetch overall stats
      const statsResponse = await axios.get("/api/leaderboard/stats");
      setStats(statsResponse.data);

    } catch (error) {
      toast.error("Failed to fetch leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRankBadge = (rank: number) => {
    const colors = {
      1: "bg-yellow-100 text-yellow-800 border-yellow-200",
      2: "bg-gray-100 text-gray-800 border-gray-200",
      3: "bg-amber-100 text-amber-800 border-amber-200",
    };

    const color = colors[rank as keyof typeof colors] || "bg-blue-100 text-blue-800 border-blue-200";

    return (
      <Badge className={`${color} border`}>
        #{rank}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentData = (type === "donors" ? topDonors : topCharities) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Recognizing our top contributors and performers</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Total Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.summary?.total_donations ?? 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats?.summary?.total_donation_count ?? 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats?.summary?.total_donors ?? 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Average Donation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.summary?.average_donation ?? 0)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Time Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_time">All Time</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donors">Top Donors</SelectItem>
                  <SelectItem value="charities">Top Charities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {type === "donors" ? "Top Donors" : "Top Performing Charities"}
          </CardTitle>
          <CardDescription>
            {period.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())} rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(Array.isArray(currentData) ? currentData : []).map((entry, index) => {
              const rank = index + 1;
              return (
                <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-lg border ${rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    {getRankIcon(rank)}
                    {getRankBadge(rank)}
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={entry.profile_image || entry.logo_path} />
                    <AvatarFallback>
                      {entry.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-semibold">{entry.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {entry.donation_count} {type === "donors" ? "donations" : "donations received"}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatCurrency(entry.total_donated || entry.total_received || 0)}
                    </div>
                    {rank <= 3 && (
                      <Badge variant="outline" className="text-xs">
                        {rank === 1 ? "Champion" : rank === 2 ? "Runner-up" : "3rd Place"}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {(Array.isArray(currentData) ? currentData.length : 0) === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data available for the selected period.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recognition Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Thank You to All Our Contributors!</h3>
            <p className="text-muted-foreground">
              Every donation, no matter the size, makes a difference in someone's life. 
              Together, we're building a better world through generosity and compassion.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
