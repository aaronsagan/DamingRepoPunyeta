import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign, Activity, TrendingDown, Award } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { buildApiUrl, getAuthToken } from '@/lib/api';

interface TrendsData {
  donations: Array<{ date: string; total: number; count: number }>;
  campaigns: Array<{ date: string; total: number }>;
  trending_campaigns: Array<{
    id: number;
    title: string;
    goal_amount: number;
    raised_amount: number;
    period_raised: number;
    progress: number;
  }>;
  date_range: number;
}

interface TrendsSectionProps {
  charityId?: number;
}

export default function TrendsSection({ charityId }: TrendsSectionProps) {
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    fetchTrendsData(dateRange);
  }, [dateRange, charityId]);

  const fetchTrendsData = async (range: number) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const url = buildApiUrl(`/analytics/trends?range=${range}${charityId ? `&charity_id=${charityId}` : ''}`);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrendsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-10 animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!trendsData) return null;

  // Calculate total stats
  const totalDonations = trendsData.donations.reduce((sum, d) => sum + d.total, 0);
  const totalCampaigns = trendsData.campaigns.reduce((sum, c) => sum + c.total, 0);
  const avgDonationPerDay = trendsData.donations.length > 0 
    ? totalDonations / trendsData.donations.length 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header with Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            Trends & Activity Insights
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Track donation and campaign performance over time</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg p-1 border border-slate-700/50">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                dateRange === days
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">Total Donations</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalDonations)}</p>
          <p className="text-xs text-slate-500 mt-1">Last {dateRange} days</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">New Campaigns</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{totalCampaigns}</p>
          <p className="text-xs text-slate-500 mt-1">Created recently</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Calendar className="h-5 w-5 text-violet-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">Avg Per Day</p>
          </div>
          <p className="text-2xl font-bold text-violet-400">{formatCurrency(avgDonationPerDay)}</p>
          <p className="text-xs text-slate-500 mt-1">Daily average</p>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Donation Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="p-8 pb-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Donation Growth</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Daily donation trends</p>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendsData.donations.map(d => ({
                date: formatDate(d.date),
                total: d.total,
                count: d.count
              }))}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#CBD5E1' }}
                  stroke="#475569"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#CBD5E1' }}
                  stroke="#475569"
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-4 backdrop-blur-sm"
                        >
                          <p className="font-semibold text-base mb-2 text-slate-100">{payload[0].payload.date}</p>
                          <p className="text-sm text-slate-300">Amount: <span className="font-bold text-emerald-400">{formatCurrency(payload[0].value as number)}</span></p>
                          <p className="text-sm text-slate-300">Count: <span className="font-bold text-blue-400">{payload[0].payload.count}</span></p>
                        </motion.div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fill="url(#colorDonations)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Campaign Creation Trend */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="p-8 pb-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Campaign Launches</h3>
                <p className="text-sm text-muted-foreground mt-0.5">New campaign creation trend</p>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData.campaigns.map(c => ({
                date: formatDate(c.date),
                total: c.total
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#CBD5E1' }}
                  stroke="#475569"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#CBD5E1' }}
                  stroke="#475569"
                  allowDecimals={false}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-4 backdrop-blur-sm"
                        >
                          <p className="font-semibold text-base mb-2 text-slate-100">{payload[0].payload.date}</p>
                          <p className="text-sm text-slate-300">Campaigns: <span className="font-bold text-blue-400">{payload[0].value}</span></p>
                        </motion.div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Trending Campaigns */}
      {trendsData.trending_campaigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="p-10 pb-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground">Trending Campaigns</h3>
                <p className="text-sm text-muted-foreground mt-1">Most active campaigns in the last {dateRange} days</p>
              </div>
            </div>
          </div>

          <div className="px-10 pb-10">
            <div className="space-y-4">
              {trendsData.trending_campaigns.map((campaign, idx) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1), duration: 0.4 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold shadow-lg flex-shrink-0"
                      style={{
                        backgroundColor: idx === 0 ? '#F59E0B' : idx === 1 ? '#FBBF24' : idx === 2 ? '#FCD34D' : '#94A3B8',
                        color: 'white'
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                        {campaign.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm text-slate-400">
                            {formatCurrency(campaign.period_raised)} <span className="text-slate-500">raised this period</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-400">{campaign.progress}%</p>
                      <p className="text-xs text-slate-500">of goal</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-slate-900/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(campaign.progress, 100)}%` }}
                      transition={{ 
                        delay: 0.6 + (idx * 0.1),
                        duration: 1,
                        ease: 'easeInOut'
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ boxShadow: '0 0 10px rgba(245,158,11,0.4)' }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                    <span>{formatCurrency(campaign.raised_amount)} raised</span>
                    <span>Goal: {formatCurrency(campaign.goal_amount)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
