import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target, Users, MapPin, Calendar, Award, Filter, CheckCircle, Activity, BarChart3, Percent, Heart } from 'lucide-react';
import { buildApiUrl, getAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import { getBeneficiaryLabel } from '@/constants/beneficiaryCategories';
import { motion, AnimatePresence } from 'framer-motion';
import LocationMap from '@/components/analytics/LocationMap';
import LocationFilters from '@/components/analytics/LocationFilters';
import LocationSummaryCards from '@/components/analytics/LocationSummaryCards';
import OverviewSummary from '@/components/analytics/OverviewSummary';
import TrendsAndTimingTab from '@/components/analytics/TrendsAndTimingTab';
import OverviewTab from '@/components/analytics/OverviewTab';
import GeographicInsightsTab from '@/components/analytics/GeographicInsightsTab';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

const CAMPAIGN_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'education', label: 'Education' },
  { value: 'feeding_program', label: 'Feeding Program' },
  { value: 'medical', label: 'Medical' },
  { value: 'disaster_relief', label: 'Disaster Relief' },
  { value: 'environment', label: 'Environment' },
  { value: 'animal_welfare', label: 'Animal Welfare' },
  { value: 'other', label: 'Other' },
];

export default function CharityAnalytics() {
  const [loading, setLoading] = useState(true);
  const [campaignTypes, setCampaignTypes] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [typeStats, setTypeStats] = useState<any>(null);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [trendingExplanation, setTrendingExplanation] = useState<string>('');
  const [trendingDays, setTrendingDays] = useState(30);
  
  // New state for enhanced analytics
  const [summaryMetrics, setSummaryMetrics] = useState<any>(null);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [temporalTrends, setTemporalTrends] = useState<any[]>([]);
  const [fundRanges, setFundRanges] = useState<any[]>([]);
  const [beneficiaryData, setBeneficiaryData] = useState<any[]>([]);
  const [overviewData, setOverviewData] = useState<any>(null);
  
  // Enhanced trending state
  const [growthByType, setGrowthByType] = useState<any[]>([]);
  const [mostImproved, setMostImproved] = useState<any>(null);
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);
  const [timelineView, setTimelineView] = useState<'campaigns' | 'donations'>('donations');
  const [timelineDays, setTimelineDays] = useState(30);
  
  // Location Map & Filtering state
  const [locationSummary, setLocationSummary] = useState({ regions: 0, provinces: 0, cities: 0, campaigns: 0 });
  const [locationFilters, setLocationFilters] = useState<{ regions: string[]; provinces: string[]; cities: string[] }>({ 
    regions: [], 
    provinces: [], 
    cities: [] 
  });
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [filteredLocationData, setFilteredLocationData] = useState<any[]>([]);
  
  // Get user from auth context
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (selectedType !== 'all') {
      fetchTypeStats(selectedType);
      fetchAdvancedStats(selectedType);
      fetchTrendingExplanation(selectedType);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchTrending();
  }, [trendingDays]);
  
  useEffect(() => {
    fetchEnhancedTrendingAnalytics();
  }, []);
  
  useEffect(() => {
    fetchActivityTimeline();
  }, [timelineDays]);
  
  // Location Map useEffects
  useEffect(() => {
    fetchLocationSummary();
    fetchLocationFilters();
  }, []);

  useEffect(() => {
    fetchLocationFilters();
    fetchFilteredLocationData();
  }, [selectedRegion, selectedProvince, selectedCity]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // CRITICAL: Don't fetch if no token (user not logged in)
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Fetch all analytics data in parallel
      const [typesRes, summaryRes, locationRes, trendsRes, rangesRes, beneficiariesRes, overviewRes] = await Promise.all([
        fetch(buildApiUrl('/analytics/campaigns/types'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl('/analytics/summary'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl('/analytics/campaigns/locations'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl('/analytics/campaigns/temporal'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl('/analytics/campaigns/fund-ranges'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl(`/analytics/campaigns/beneficiaries${user?.charity?.id ? '?charity_id=' + user.charity.id : ''}`), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl(`/analytics/overview${user?.charity?.id ? '?charity_id=' + user.charity.id : ''}`), { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const typesData = await typesRes.json();
      setCampaignTypes(typesData.data || []);
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummaryMetrics(summaryData.data || summaryData);
      }
      
      if (locationRes.ok) {
        const locationData = await locationRes.json();
        // Backend returns array directly, not wrapped in { data: [] }
        const dataArray = Array.isArray(locationData) ? locationData : (locationData.data || []);
        setLocationData(dataArray);
        console.log('📍 Location data RAW:', locationData);
        console.log('📍 Location data ARRAY:', dataArray);
        console.log('📍 Location data LENGTH:', dataArray.length);
        console.log('📍 First location item:', dataArray[0]);
      } else {
        console.error('❌ Location data request failed:', locationRes.status, locationRes.statusText);
      }
      
      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTemporalTrends(trendsData.data || []);
        console.log('📈 Temporal trends data loaded:', trendsData);
      }
      
      if (rangesRes.ok) {
        const rangesData = await rangesRes.json();
        setFundRanges(rangesData.data || []);
      }
      
      if (beneficiariesRes.ok) {
        const beneficiariesData = await beneficiariesRes.json();
        setBeneficiaryData(Array.isArray(beneficiariesData) ? beneficiariesData : (beneficiariesData.data || []));
        console.log('💖 Beneficiary data loaded:', beneficiariesData);
      }
      
      if (overviewRes.ok) {
        const overviewResData = await overviewRes.json();
        setOverviewData(overviewResData);
        console.log('📊 Overview data loaded:', overviewResData);
      }

      // Fetch trending
      await fetchTrending();

      // Compute accurate summary metrics from verified donations and campaign goals
      await computeAndSetSummaryMetrics();
    } catch (error) {
      console.error('Analytics error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(buildApiUrl(`/analytics/campaigns/trending?days=${trendingDays}&limit=5`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTrending(data.data || []);
    } catch (error) {
      console.error('Trending error:', error);
    }
  };

  // Compute summary metrics from verified donations and campaign goals for the logged-in charity
  const computeAndSetSummaryMetrics = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Get current user and charity id
      const meRes = await fetch(buildApiUrl('/me'), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!meRes.ok) return;
      const me = await meRes.json();
      const charityId = me?.charity?.id || me?.charity_id || me?.id;
      if (!charityId) return;

      // Fetch donations and campaigns in parallel
      const [donationsRes, campaignsRes] = await Promise.all([
        fetch(buildApiUrl(`/charities/${charityId}/donations`), {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
        fetch(buildApiUrl(`/charities/${charityId}/campaigns`), {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
      ]);

      let donations: any[] = [];
      if (donationsRes.ok) {
        const dData = await donationsRes.json();
        donations = dData.data || dData || [];
      }

      let campaigns: any[] = [];
      if (campaignsRes.ok) {
        const cData = await campaignsRes.json();
        campaigns = cData.data || cData || [];
      }

      const normalizeStatus = (s: any) => String(s || '').toLowerCase();
      const isVerifiedDonation = (d: any) => {
        const s = normalizeStatus(d.status);
        return s === 'confirmed' || s === 'completed' || s === 'verified';
      };

      const toAmount = (x: any) => {
        const n = parseFloat(x ?? 0);
        return isNaN(n) ? 0 : n;
      };

      // Only include verified donations that are linked to a campaign
      const verified = donations.filter((d) => {
        const linked = d.campaign_id || d.campaign?.id;
        return linked && isVerifiedDonation(d);
      });
      const totalRaised = verified.reduce((sum, d) => sum + toAmount(d.amount), 0);
      const totalVerifiedDonations = verified.length;
      const avgDonation = totalVerifiedDonations > 0 ? totalRaised / totalVerifiedDonations : 0;

      const raisedByCampaign = new Map<number, number>();
      verified.forEach((d) => {
        const cid = d.campaign_id || d.campaign?.id;
        if (!cid) return;
        raisedByCampaign.set(cid, (raisedByCampaign.get(cid) || 0) + toAmount(d.amount));
      });

      const ratios: number[] = [];
      campaigns.forEach((c: any) => {
        const goal = toAmount(c.target_amount ?? c.goal_amount);
        if (goal > 0) {
          const cid = c.id;
          const raised = raisedByCampaign.get(cid) ?? 0; // only verified donations counted
          ratios.push((raised / goal) * 100);
        }
      });

      const avg_goal_achievement = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;

      setSummaryMetrics((prev: any) => ({
        ...(prev || {}),
        total_raised: totalRaised,
        avg_donation: avgDonation,
        avg_goal_achievement,
        verified_donations: totalVerifiedDonations,
        campaign_count: campaigns.length,
      }));

      // Compute beneficiary breakdown
      const beneficiaryMap = new Map<string, number>();
      campaigns.forEach((c: any) => {
        const categories = c.beneficiary_category || [];
        if (Array.isArray(categories)) {
          categories.forEach((cat: string) => {
            beneficiaryMap.set(cat, (beneficiaryMap.get(cat) || 0) + 1);
          });
        }
      });

      const beneficiaryBreakdown = Array.from(beneficiaryMap.entries())
        .map(([value, count]) => ({
          value,
          label: getBeneficiaryLabel(value),
          count,
        }))
        .sort((a, b) => b.count - a.count);

      setBeneficiaryData(beneficiaryBreakdown);
    } catch (err) {
      console.error('Failed computing summary metrics:', err);
    }
  };

  const fetchTypeStats = async (type: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(buildApiUrl(`/analytics/campaigns/${type}/stats`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTypeStats(data);
    } catch (error) {
      console.error('Type stats error:', error);
      toast.error('Failed to load type statistics');
    }
  };

  const fetchAdvancedStats = async (type: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(buildApiUrl(`/analytics/campaigns/${type}/advanced`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAdvancedStats(data);
    } catch (error) {
      console.error('Advanced stats error:', error);
    }
  };

  const fetchTrendingExplanation = async (type: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(buildApiUrl(`/analytics/trending-explanation/${type}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTrendingExplanation(data.explanation || '');
    } catch (error) {
      console.error('Trending explanation error:', error);
    }
  };
  
  const fetchEnhancedTrendingAnalytics = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      // Fetch growth by type and most improved in parallel
      const [growthRes, improvedRes] = await Promise.all([
        fetch(buildApiUrl('/analytics/growth-by-type'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl('/analytics/most-improved'), { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      if (growthRes.ok) {
        const growthData = await growthRes.json();
        setGrowthByType(growthData.data || []);
      }
      
      if (improvedRes.ok) {
        const improvedData = await improvedRes.json();
        setMostImproved(improvedData.data || null);
      }
    } catch (error) {
      console.error('Enhanced trending analytics error:', error);
    }
  };
  
  const fetchActivityTimeline = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(
        buildApiUrl(`/analytics/activity-timeline?days=${timelineDays}&group_by=day`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const data = await res.json();
        setActivityTimeline(data.data || []);
      }
    } catch (error) {
      console.error('Activity timeline error:', error);
    }
  };
  
  // Location Map API Calls
  const fetchLocationSummary = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (user?.charity?.id) params.append('charity_id', user.charity.id.toString());
      
      const response = await fetch(
        buildApiUrl(`/analytics/campaigns/location-summary?${params}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLocationSummary(data);
        console.log('📍 Location summary loaded:', data);
      }
    } catch (error) {
      console.error('Failed to load location summary:', error);
    }
  };

  const fetchLocationFilters = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (user?.charity?.id) params.append('charity_id', user.charity.id.toString());
      if (selectedRegion) params.append('region', selectedRegion);
      if (selectedProvince) params.append('province', selectedProvince);
      
      const response = await fetch(
        buildApiUrl(`/analytics/campaigns/location-filters?${params}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLocationFilters(data);
        console.log('🗂️ Location filters loaded:', data);
      }
    } catch (error) {
      console.error('Failed to load location filters:', error);
    }
  };

  const fetchFilteredLocationData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (user?.charity?.id) params.append('charity_id', user.charity.id.toString());
      if (selectedRegion) params.append('region', selectedRegion);
      if (selectedProvince) params.append('province', selectedProvince);
      if (selectedCity) params.append('city', selectedCity);
      
      const response = await fetch(
        buildApiUrl(`/analytics/campaigns/by-location?${params}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const processedData = Array.isArray(data) ? data : [];
        setFilteredLocationData(processedData);
        console.log('🗺️ Filtered location data loaded:', processedData);
      }
    } catch (error) {
      console.error('Failed to load filtered location data:', error);
    }
  };
  
  const handleClearLocationFilters = () => {
    setSelectedRegion('');
    setSelectedProvince('');
    setSelectedCity('');
  };

  const generateInsight = () => {
    if (campaignTypes.length === 0) return "No campaign data available yet.";
    
    const topType = campaignTypes[0];
    const total = campaignTypes.reduce((sum, t) => sum + t.count, 0);
    
    return `${topType.label} campaigns are the most common with ${topType.count} campaigns (${Math.round((topType.count / total) * 100)}% of total). Total active campaigns: ${total}.`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Container with proper margins - matching profile page */}
      <div className="container mx-auto px-4 lg:px-8 pt-6 pb-12 space-y-6">
        {/* Header - matching Campaigns page font sizes */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campaign Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Analyze performance, trends, and campaign activity at a glance
            </p>
          </div>
        </div>

        {/* Key Insight Banner - Slim */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Key Insight: </span>
                <span className="text-sm text-muted-foreground">{generateInsight()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Summary Cards - Matching ProfileStats styling */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-blue-500/30 hover:ring-2 active:scale-[0.98]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-transparent" />
            <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
              <div>
                <p className="text-xl lg:text-2xl font-extrabold text-blue-400">
                  {summaryMetrics?.campaign_count ?? campaignTypes.reduce((sum, t) => sum + t.count, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Campaigns</p>
              </div>
              <div className="shrink-0">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                  <Target className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verified Donations Count */}
          <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-sky-500/30 hover:ring-2 active:scale-[0.98]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/20 via-sky-400/10 to-transparent" />
            <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
              <div>
                <p className="text-xl lg:text-2xl font-extrabold text-sky-400">
                  {summaryMetrics?.verified_donations ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Verified Donations</p>
              </div>
              <div className="shrink-0">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-sky-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-emerald-500/30 hover:ring-2 active:scale-[0.98]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent" />
            <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
              <div>
                <p className="text-xl lg:text-2xl font-extrabold text-emerald-400">
                  ₱{summaryMetrics?.total_raised?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Raised</p>
              </div>
              <div className="shrink-0">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-indigo-500/30 hover:ring-2 active:scale-[0.98]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-indigo-400/10 to-transparent" />
            <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
              <div>
                <p className="text-xl lg:text-2xl font-extrabold text-indigo-400">
                  ₱{summaryMetrics?.avg_donation?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Avg Donation</p>
              </div>
              <div className="shrink-0">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-fuchsia-500/30 hover:ring-2 active:scale-[0.98]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 via-fuchsia-400/10 to-transparent" />
            <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
              <div>
                <p className="text-xl lg:text-2xl font-extrabold text-fuchsia-400">
                  {summaryMetrics?.avg_goal_achievement?.toFixed(0) || '0'}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Avg Goal %</p>
              </div>
              <div className="shrink-0">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 lg:h-6 lg:w-6 text-fuchsia-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs matching ProfileTabs styling */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="w-full mb-4">
            <TabsList className="bg-transparent p-0" role="tablist">
              <div className="flex items-center gap-4">
                <TabsTrigger value="overview" role="tab" className="rounded-lg px-5 py-2 text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground">Campaign Overview</TabsTrigger>
                <TabsTrigger value="distribution" role="tab" className="rounded-lg px-5 py-2 text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground">Geographic Insights</TabsTrigger>
                <TabsTrigger value="trends" role="tab" className="rounded-lg px-5 py-2 text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground">Trends & Timing</TabsTrigger>
              </div>
            </TabsList>
          </div>

          {/* Campaign Overview Tab */}
          <TabsContent value="overview" role="tabpanel" className="mt-6">
            <OverviewTab
              campaignTypes={campaignTypes}
              overviewData={overviewData}
              beneficiaryData={beneficiaryData}
              temporalTrends={temporalTrends}
            />
          </TabsContent>

          {/* Geographic Insights Tab (formerly Distribution) */}
          <TabsContent value="distribution" role="tabpanel" className="mt-6">
            <GeographicInsightsTab
              locationData={locationData}
              locationSummary={locationSummary}
            />
          </TabsContent>

          {/* Trends & Timing Tab */}
          <TabsContent value="trends" role="tabpanel" className="mt-6">
            <TrendsAndTimingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}