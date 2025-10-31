import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Heart, TrendingUp, MapPin, Lightbulb, Info } from 'lucide-react';
import { useAnalyticsSummary, AnalyticsFilters } from '@/hooks/useAnalyticsSummary';
import { useAnalyticsQuery } from '@/hooks/useAnalyticsQuery';
import { MetricCards } from '@/components/analytics/MetricCards';
import { FiltersPanel } from '@/components/analytics/FiltersPanel';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

export default function DonorAnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    granularity: 'daily',
  });
  const [appliedFilters, setAppliedFilters] = useState<AnalyticsFilters>({
    granularity: 'daily',
  });

  const { summary, loading: summaryLoading } = useAnalyticsSummary(appliedFilters);
  const { data, loading: dataLoading } = useAnalyticsQuery(appliedFilters);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    toast.success('Filters applied');
  };

  const handleResetFilters = () => {
    const resetFilters = { granularity: 'daily' as const };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    toast.info('Filters reset');
  };

  const generateInsights = () => {
    if (!data) return [];
    
    const insights: string[] = [];
    
    // Campaign type insight
    if (data.campaign_type_distribution.length > 0) {
      const topType = data.campaign_type_distribution[0];
      insights.push(`${topType.label} campaigns are most common with ${topType.count} campaigns (${topType.percentage}% of total).`);
    }
    
    // Top trending
    if (data.top_trending_campaigns.length > 0) {
      const top = data.top_trending_campaigns[0];
      insights.push(`"${top.title}" by ${top.charity} is the top trending campaign with ${top.donation_count} recent donations.`);
    }
    
    // Location insight
    if (data.location_distribution.regions.length > 0) {
      const topRegion = data.location_distribution.regions[0];
      insights.push(`${topRegion.region} has the most campaigns (${topRegion.campaign_count}) with an average of ₱${topRegion.avg_raised.toLocaleString()} raised per campaign.`);
    }
    
    return insights;
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="container mx-auto px-4 lg:px-8 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Campaign Analytics</h1>
          <p className="text-muted-foreground">
            Explore site-wide campaign trends, locations, and impact
          </p>
        </div>

        {/* Metric Cards */}
        <div className="mb-6">
          <MetricCards summary={summary} loading={summaryLoading} />
        </div>

        {/* Main Content: Left = Charts, Right = Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Main Charts (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="distribution">Distribution</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {dataLoading ? (
                  <Skeleton className="h-96" />
                ) : (
                  <>
                    {/* Campaign Type Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5" />
                          Campaign Type Distribution
                        </CardTitle>
                        <CardDescription>Most common types of campaigns</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={data?.campaign_type_distribution || []}
                              dataKey="count"
                              nameKey="label"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ label, percentage }) => `${label}: ${percentage}%`}
                            >
                              {(data?.campaign_type_distribution || []).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value} campaigns`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Top Trending Campaigns */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Top Trending Campaigns
                        </CardTitle>
                        <CardDescription>Campaigns with most recent activity</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data?.top_trending_campaigns.slice(0, 5) || []} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="title" type="category" width={150} />
                            <Tooltip formatter={(value: number) => `${value} donations`} />
                            <Bar dataKey="donation_count" fill="#0088FE" name="Donations" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Top Charities */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Charities by Donations</CardTitle>
                        <CardDescription>Organizations receiving most support</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(data?.charity_rankings || []).slice(0, 5).map((charity, index) => (
                            <div key={charity.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium">{charity.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {charity.campaign_count} campaigns • {charity.donation_count} donations
                                  </p>
                                </div>
                              </div>
                              <p className="font-bold">₱{charity.total_raised.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Distribution Tab */}
              <TabsContent value="distribution" className="space-y-6 mt-6">
                {dataLoading ? (
                  <Skeleton className="h-96" />
                ) : (
                  <>
                    {/* Location Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Location Distribution
                        </CardTitle>
                        <CardDescription>Campaigns by region</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(data?.location_distribution.regions || []).slice(0, 10).map((location, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                              <div>
                                <p className="font-medium">{location.region}</p>
                                <p className="text-sm text-muted-foreground">
                                  {location.campaign_count} campaigns
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₱{location.total_raised.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">
                                  Avg: ₱{location.avg_raised.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Beneficiary Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Beneficiary Types</CardTitle>
                        <CardDescription>Who benefits from campaigns</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data?.beneficiary_breakdown || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `${value} campaigns`} />
                            <Bar dataKey="campaign_count" fill="#00C49F" name="Campaigns" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-6 mt-6">
                {dataLoading ? (
                  <Skeleton className="h-96" />
                ) : (
                  <>
                    {/* Donation Growth */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Donation Growth Over Time</CardTitle>
                        <CardDescription>Total donations and counts per period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={data?.donations_time_series || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip formatter={(value: number, name: string) => [
                              name === 'total' ? `₱${value.toLocaleString()}` : value,
                              name === 'total' ? 'Amount' : 'Count'
                            ]} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="total" stroke="#0088FE" strokeWidth={2} name="Amount (₱)" />
                            <Line yAxisId="right" type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={2} name="Donations" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Campaign Frequency */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Frequency</CardTitle>
                        <CardDescription>New campaigns launched per period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data?.campaign_frequency_time_series || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="#FFBB28" name="Total Campaigns" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Smart Insights
                    </CardTitle>
                    <CardDescription>Auto-generated analysis from your filters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dataLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {generateInsights().map((insight, index) => (
                          <div key={index} className="flex gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                        
                        {/* Why This Matters */}
                        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 border">
                          <h4 className="font-semibold mb-2">Why This Matters</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Understanding campaign frequency helps identify consistent charitable organizations</li>
                            <li>• Beneficiary data shows where community needs are concentrated</li>
                            <li>• Location insights reveal geographic areas with active philanthropy</li>
                            <li>• Trending campaigns indicate current community priorities and urgent causes</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Filters (1 column) */}
          <div className="lg:col-span-1">
            <FiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
