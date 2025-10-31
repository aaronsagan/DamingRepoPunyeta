import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Heart, TrendingUp, DollarSign, Target, Calendar, Award, Building2 } from 'lucide-react';
import { buildApiUrl, getAuthToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

export default function DonorAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [donorData, setDonorData] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchDonorAnalytics();
    }
  }, [user]);

  const fetchDonorAnalytics = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(buildApiUrl(`/analytics/donors/${user?.id}/summary`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await res.json();
      setDonorData(data);
    } catch (error) {
      console.error('Analytics error:', error);
      toast.error('Failed to load your donation analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = () => {
    if (!donorData) return "Loading your impact...";
    
    const stats = donorData.statistics;
    const topType = donorData.by_type[0];
    
    if (stats.total_donations === 0) {
      return "Start making a difference today! Your first donation can change lives.";
    }
    
    if (topType) {
      return `You've made ${stats.total_donations} donation${stats.total_donations > 1 ? 's' : ''} totaling ₱${stats.total_donated.toLocaleString()}. Your favorite cause is ${topType.label} with ${topType.count} donation${topType.count > 1 ? 's' : ''}.`;
    }
    
    return `You've donated ₱${stats.total_donated.toLocaleString()} across ${stats.total_donations} donation${stats.total_donations > 1 ? 's' : ''}. Thank you for your generosity!`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!donorData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No donation data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = donorData.statistics;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Your Giving Impact</h1>
        <p className="text-muted-foreground">Track your donations and see the difference you're making</p>
      </div>

      {/* Insight Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-green-500/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />
            Your Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{generateInsight()}</p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.total_donated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_donations}</div>
            <p className="text-xs text-muted-foreground">Completed donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.avg_donation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per donation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.pending_amount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">By Type</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="charities">Top Charities</TabsTrigger>
          <TabsTrigger value="recent">Recent Donations</TabsTrigger>
        </TabsList>

        {/* Donations by Type */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Donations by Campaign Type</CardTitle>
              <CardDescription>See which causes you support most</CardDescription>
            </CardHeader>
            <CardContent>
              {donorData.by_type.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={donorData.by_type}
                        dataKey="total"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ label, total }) => `${label}: ₱${total.toLocaleString()}`}
                      >
                        {donorData.by_type.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donorData.by_type.map((type: any, index: number) => (
                      <div key={type.type} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-muted-foreground">{type.count} donation{type.count > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <p className="font-bold">₱{type.total.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No donations yet. Start making an impact today!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Trend */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giving Trend (Last 12 Months)</CardTitle>
              <CardDescription>Your donation activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              {donorData.monthly_trend.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={donorData.monthly_trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'total' ? `₱${value.toLocaleString()}` : value,
                          name === 'total' ? 'Amount' : 'Count'
                        ]}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="total" stroke="#0088FE" strokeWidth={2} name="Amount (₱)" />
                      <Line yAxisId="right" type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={2} name="Donations" />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-3">
                    {donorData.monthly_trend.slice(-6).map((month: any) => (
                      <div key={month.month} className="p-3 rounded-lg border text-center">
                        <p className="text-xs text-muted-foreground">{month.month}</p>
                        <p className="text-lg font-bold">₱{month.total.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{month.count} donation{month.count > 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No donation history available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Charities */}
        <TabsContent value="charities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Charities You Support</CardTitle>
              <CardDescription>Organizations you've donated to most</CardDescription>
            </CardHeader>
            <CardContent>
              {donorData.recent_donations.length > 0 ? (
                (() => {
                  // Group donations by charity
                  const charityMap = new Map();
                  donorData.recent_donations.forEach((donation: any) => {
                    const charityName = donation.charity || 'Unknown';
                    if (!charityMap.has(charityName)) {
                      charityMap.set(charityName, {
                        name: charityName,
                        total: 0,
                        count: 0,
                      });
                    }
                    const charity = charityMap.get(charityName);
                    if (donation.status === 'completed') {
                      charity.total += donation.amount;
                      charity.count += 1;
                    }
                  });

                  // Convert to array and sort
                  const topCharities = Array.from(charityMap.values())
                    .filter(c => c.count > 0)
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 10);

                  return topCharities.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCharities} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                          <Bar dataKey="total" fill="#0088FE" name="Total Donated" />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="mt-6 space-y-3">
                        {topCharities.map((charity, index) => (
                          <div key={charity.name} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{charity.name}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">₱{charity.total.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">{charity.count} donation{charity.count > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No charity donations yet</p>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No donations yet to display charities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Donations */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Your latest contributions</CardDescription>
            </CardHeader>
            <CardContent>
              {donorData.recent_donations.length > 0 ? (
                <div className="space-y-3">
                  {donorData.recent_donations.map((donation: any) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{donation.campaign?.title || 'Direct Donation'}</p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {donation.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{donation.charity}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(donation.donated_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₱{donation.amount.toLocaleString()}</p>
                        {donation.campaign?.type && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {donation.campaign.type.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent donations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Donation Milestones */}
      {stats.first_donation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">First Donation</p>
                  <p className="font-semibold">
                    {new Date(stats.first_donation).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Latest Donation</p>
                  <p className="font-semibold">
                    {new Date(stats.last_donation).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
