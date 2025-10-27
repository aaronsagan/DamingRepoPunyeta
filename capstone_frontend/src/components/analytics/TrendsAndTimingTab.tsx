import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Activity,
  Calendar,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { buildApiUrl, getAuthToken } from '@/lib/api';

interface TrendsAndTimingTabProps {
  charityId?: string | number;
}

interface TrendsData {
  campaign_activity: Array<{ month: string; count: number }>;
  donation_trends: Array<{ month: string; amount: number }>;
  cumulative_growth: Array<{ month: string; totalRaised: number }>;
  summary: {
    busiest_month: string;
    most_donations: string;
    avg_duration: number;
    fastest_growth: string;
  };
  insights: string[];
}

const TrendsAndTimingTab: React.FC<TrendsAndTimingTabProps> = ({ charityId }) => {
  const [loading, setLoading] = useState(true);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);

  useEffect(() => {
    fetchTrendsData();
  }, [charityId]);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      console.log('🔍 Fetching trends data with charityId:', charityId);
      console.log('🔍 CharityId type:', typeof charityId);
      
      // Build URL with query params
      const params = new URLSearchParams();
      if (charityId !== undefined && charityId !== null) {
        params.append('charity_id', charityId.toString());
        console.log('✅ Added charity_id to params:', charityId);
      } else {
        console.log('⚠️ No charityId provided, backend will use authenticated user\'s charity');
      }
      
      const url = buildApiUrl(`/analytics/trends${params.toString() ? '?' + params : ''}`);
      console.log('🔍 Request URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Trends data RAW response:', data);
        console.log('📊 Campaign activity:', data.campaign_activity);
        console.log('📊 Donation trends:', data.donation_trends);
        console.log('📊 Summary:', data.summary);
        console.log('📊 Insights:', data.insights);
        setTrendsData(data);
      } else {
        console.error('❌ Trends data request failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch trends: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch trends data:', error);
      // Set empty data on error
      setTrendsData({
        campaign_activity: [],
        donation_trends: [],
        cumulative_growth: [],
        summary: {
          busiest_month: 'N/A',
          most_donations: 'N/A',
          avg_duration: 0,
          fastest_growth: 'N/A',
        },
        insights: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!trendsData) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Failed to load trends data</p>
      </div>
    );
  }

  const hasData =
    (trendsData?.campaign_activity?.length ?? 0) > 0 ||
    (trendsData?.donation_trends?.length ?? 0) > 0 ||
    (trendsData?.cumulative_growth?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* Peak Timing Summary Cards - At Top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Busiest Month */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-xl p-5 border border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 font-medium"
            >
              Peak
            </motion.div>
          </div>
          <p className="text-sm text-slate-400 mb-1">Busiest Month</p>
          <p className="text-2xl font-bold text-blue-400">
            {trendsData?.summary?.busiest_month ?? 'N/A'}
          </p>
        </motion.div>

        {/* Most Donations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-md rounded-xl p-5 border border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium"
            >
              Top
            </motion.div>
          </div>
          <p className="text-sm text-slate-400 mb-1">Most Donations</p>
          <p className="text-2xl font-bold text-emerald-400">
            {trendsData?.summary?.most_donations ?? 'N/A'}
          </p>
        </motion.div>

        {/* Avg Campaign Duration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-md rounded-xl p-5 border border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 font-medium"
            >
              Avg
            </motion.div>
          </div>
          <p className="text-sm text-slate-400 mb-1">Avg Campaign Duration</p>
          <p className="text-2xl font-bold text-amber-400">
            {trendsData?.summary?.avg_duration ?? 0} days
          </p>
        </motion.div>

        {/* Fastest Growing Period */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-md rounded-xl p-5 border border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Zap className="h-5 w-5 text-violet-400" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 font-medium"
            >
              Growth
            </motion.div>
          </div>
          <p className="text-sm text-slate-400 mb-1">Fastest Growth</p>
          <p className="text-2xl font-bold text-violet-400">
            {trendsData?.summary?.fastest_growth ?? 'N/A'}
          </p>
        </motion.div>
      </motion.div>

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center bg-slate-800/40 rounded-xl border border-slate-700/50"
        >
          <div className="p-4 rounded-full bg-slate-700/30 mb-4">
            <Activity className="h-16 w-16 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            No Trends Data Available
          </h3>
          <p className="text-sm text-slate-400 max-w-md">
            Start creating campaigns and receiving donations to see temporal trends and insights
          </p>
        </motion.div>
      ) : (
        <>
          {/* Charts Grid - 2 Columns */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 1. Campaign Activity Over Time */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    Campaign Activity Over Time
                  </h3>
                  <p className="text-xs text-slate-400">
                    Campaigns created each month
                  </p>
                </div>
              </div>

              {(trendsData?.campaign_activity?.length ?? 0) > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={trendsData?.campaign_activity ?? []}>
                      <defs>
                        <linearGradient id="colorCampaigns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        stroke="#475569"
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        stroke="#475569"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '8px',
                          color: '#E2E8F0',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#colorCampaigns)"
                        animationDuration={1200}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Insight */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">
                        {trendsData?.insights?.[0] ??
                          'Campaign creation shows seasonal patterns throughout the year.'}
                      </p>
                    </div>
                  </motion.div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="h-12 w-12 text-slate-500 mb-3" />
                  <p className="text-sm text-slate-400">No campaign activity data</p>
                </div>
              )}
            </motion.div>

            {/* 2. Donation Trends Over Time */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    Donation Trends Over Time
                  </h3>
                  <p className="text-xs text-slate-400">
                    Total donations received monthly
                  </p>
                </div>
              </div>

              {(trendsData?.donation_trends?.length ?? 0) > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={trendsData?.donation_trends ?? []}>
                      <defs>
                        <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        stroke="#475569"
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        stroke="#475569"
                        tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '8px',
                          color: '#E2E8F0',
                        }}
                        formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Amount']}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDonations)"
                        animationDuration={1200}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Insight */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">
                        {trendsData?.insights?.[1] ??
                          'Donation activity peaked during the 4th quarter, indicating higher engagement during holidays.'}
                      </p>
                    </div>
                  </motion.div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-slate-500 mb-3" />
                  <p className="text-sm text-slate-400">No donation trends data</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* 3. Cumulative Growth Line - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <ArrowUpRight className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">
                  Cumulative Growth Over Time
                </h3>
                <p className="text-xs text-slate-400">
                  Running total of funds raised
                </p>
              </div>
            </div>

            {(trendsData?.cumulative_growth?.length ?? 0) > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={trendsData?.cumulative_growth ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: '#94A3B8' }}
                      stroke="#475569"
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#94A3B8' }}
                      stroke="#475569"
                      tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        color: '#E2E8F0',
                      }}
                      formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Total Raised']}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalRaised"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', r: 5 }}
                      activeDot={{ r: 7 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Insight */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="mt-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      {trendsData?.insights?.[2] ??
                        'The cumulative total shows steady month-on-month growth throughout the year.'}
                    </p>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ArrowUpRight className="h-12 w-12 text-slate-500 mb-3" />
                <p className="text-sm text-slate-400">No cumulative growth data</p>
              </div>
            )}
          </motion.div>

          {/* Overall Summary Insight */}
          {(trendsData?.insights?.length ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="p-3 rounded-xl bg-purple-500/20"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </motion.div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-purple-300 mb-2">
                    Timing Summary
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {trendsData?.insights?.join(' ') ?? ''}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default TrendsAndTimingTab;
