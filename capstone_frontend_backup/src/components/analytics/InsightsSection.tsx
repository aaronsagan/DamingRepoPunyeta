import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MapPin, 
  Heart, 
  Activity,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { buildApiUrl, getAuthToken } from '@/lib/api';

interface InsightsData {
  current_total: number;
  previous_total: number;
  change: number;
  top_type: string | null;
  top_type_label: string | null;
  top_type_amount: number;
  top_beneficiary: string | null;
  top_beneficiary_count: number;
  top_location: string | null;
  top_location_count: number;
  avg_campaigns_per_week: number;
  repeat_donor_percentage: number;
  total_donors: number;
  repeat_donors: number;
}

interface InsightsSectionProps {
  charityId?: number;
}

const InsightsSection: React.FC<InsightsSectionProps> = ({ charityId }) => {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      const params = new URLSearchParams();
      if (charityId) params.append('charity_id', charityId.toString());

      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(buildApiUrl(`/analytics/insights?${params}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
        console.log('✨ Insights data loaded:', result);
      } else {
        console.error('Failed to fetch insights:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [charityId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-slate-800/50 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-800/50 rounded animate-pulse" />
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900/60 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Narrative Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-900/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isPositiveChange = data.change >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Insights & Summary</h2>
            <p className="text-sm text-slate-400 mt-1">AI-generated insights from your analytics data</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg
                   flex items-center gap-2 text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Donation Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/70 to-slate-800/70 
                     border border-slate-700 rounded-xl p-5 hover:shadow-lg hover:shadow-emerald-500/10 
                     transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                          ${isPositiveChange 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'}`}>
              {isPositiveChange ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(data.change).toFixed(1)}%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{formatCurrency(data.current_total)}</p>
            <p className="text-xs text-slate-400">Total Donations (30 days)</p>
            <p className="text-xs text-slate-500">vs {formatCurrency(data.previous_total)} last month</p>
          </div>
        </motion.div>

        {/* Top Campaign Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/70 to-slate-800/70 
                     border border-slate-700 rounded-xl p-5 hover:shadow-lg hover:shadow-blue-500/10 
                     transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-400">{data.top_type_label || 'N/A'}</p>
            <p className="text-xs text-slate-400">Top Campaign Type</p>
            <p className="text-xs text-slate-500">{formatCurrency(data.top_type_amount)} raised</p>
          </div>
        </motion.div>

        {/* Top Beneficiary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/70 to-slate-800/70 
                     border border-slate-700 rounded-xl p-5 hover:shadow-lg hover:shadow-violet-500/10 
                     transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-violet-400">{data.top_beneficiary || 'N/A'}</p>
            <p className="text-xs text-slate-400">Most Supported Group</p>
            <p className="text-xs text-slate-500">{data.top_beneficiary_count} campaign{data.top_beneficiary_count !== 1 ? 's' : ''}</p>
          </div>
        </motion.div>

        {/* Top Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/70 to-slate-800/70 
                     border border-slate-700 rounded-xl p-5 hover:shadow-lg hover:shadow-amber-500/10 
                     transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <MapPin className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-amber-400">{data.top_location || 'N/A'}</p>
            <p className="text-xs text-slate-400">Most Active Location</p>
            <p className="text-xs text-slate-500">{data.top_location_count} campaign{data.top_location_count !== 1 ? 's' : ''}</p>
          </div>
        </motion.div>
      </div>

      {/* Narrative Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donation Trend Narrative */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-800/60 
                     border border-slate-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">💰 Donation Trend</h3>
              <p className="text-base text-slate-300 leading-relaxed">
                {isPositiveChange ? (
                  <>
                    Excellent progress! Total donations <span className="text-emerald-400 font-semibold">increased by {data.change.toFixed(1)}%</span> compared 
                    to last month, reaching <span className="font-semibold">{formatCurrency(data.current_total)}</span>. 
                    Your campaigns are gaining momentum.
                  </>
                ) : (
                  <>
                    Donations <span className="text-amber-400 font-semibold">decreased by {Math.abs(data.change).toFixed(1)}%</span> from 
                    last month. Consider refreshing campaign strategies or launching new initiatives to boost engagement.
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Top Campaign Type Narrative */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-800/60 
                     border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Heart className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">🎯 Top Performing Type</h3>
              <p className="text-base text-slate-300 leading-relaxed">
                {data.top_type_label ? (
                  <>
                    <span className="text-blue-400 font-semibold">{data.top_type_label}</span> campaigns performed best, 
                    raising <span className="font-semibold">{formatCurrency(data.top_type_amount)}</span>. 
                    This category resonates strongly with your donor community.
                  </>
                ) : (
                  <>No campaign type data available yet. Start creating campaigns to see insights.</>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Beneficiary Narrative */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-800/60 
                     border border-slate-800 rounded-xl p-6 hover:border-violet-500/30 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-500/10 rounded-lg">
              <Users className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">🧑‍🤝‍🧑 Beneficiary Focus</h3>
              <p className="text-base text-slate-300 leading-relaxed">
                {data.top_beneficiary ? (
                  <>
                    <span className="text-violet-400 font-semibold">{data.top_beneficiary}</span> were the most supported group, 
                    featured in <span className="font-semibold">{data.top_beneficiary_count}</span> campaign{data.top_beneficiary_count !== 1 ? 's' : ''}. 
                    Your efforts are making a significant impact on this community.
                  </>
                ) : (
                  <>Add beneficiary information to your campaigns to track which groups you're helping most.</>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Location & Activity Narrative */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-800/60 
                     border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <MapPin className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">📍 Geographic Reach</h3>
              <p className="text-base text-slate-300 leading-relaxed">
                {data.top_location ? (
                  <>
                    Most campaigns were launched in <span className="text-amber-400 font-semibold">{data.top_location}</span>, 
                    with <span className="font-semibold">{data.top_location_count}</span> active project{data.top_location_count !== 1 ? 's' : ''}. 
                    Consider expanding to new areas to broaden your impact.
                  </>
                ) : (
                  <>Add location details to campaigns to understand your geographic reach better.</>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Campaign Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-800/60 
                     border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">📈 Campaign Activity</h3>
              <p className="text-base text-slate-300 leading-relaxed">
                You're launching an average of <span className="text-cyan-400 font-semibold">{data.avg_campaigns_per_week}</span> campaigns 
                per week. {data.avg_campaigns_per_week >= 3 
                  ? "Great momentum! Maintain this pace to keep donors engaged." 
                  : "Consider increasing campaign frequency to maintain donor engagement and visibility."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Donor Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-800/60 
                     border border-slate-800 rounded-xl p-6 hover:border-rose-500/30 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-500/10 rounded-lg">
              <Heart className="w-6 h-6 text-rose-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">💝 Donor Loyalty</h3>
              <p className="text-base text-slate-300 leading-relaxed">
                <span className="text-rose-400 font-semibold">{data.repeat_donor_percentage}%</span> of donors 
                ({data.repeat_donors} out of {data.total_donors}) made multiple donations in the past 60 days. 
                {data.repeat_donor_percentage >= 40 
                  ? " Excellent retention! Your supporters are highly engaged." 
                  : " Focus on donor stewardship programs to encourage repeat giving."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-900/20 to-cyan-900/20 
                   border border-blue-500/30 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-xl font-bold text-white">🎯 Recommended Actions</h3>
            <ul className="space-y-2 text-slate-300">
              {isPositiveChange && (
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Capitalize on positive momentum by launching similar campaigns</span>
                </li>
              )}
              {data.top_type_label && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Consider creating more {data.top_type_label.toLowerCase()} campaigns—they're performing well</span>
                </li>
              )}
              {data.repeat_donor_percentage < 40 && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">!</span>
                  <span>Implement donor recognition programs to improve retention rates</span>
                </li>
              )}
              {data.avg_campaigns_per_week < 2 && (
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">!</span>
                  <span>Increase campaign frequency to maintain donor awareness and engagement</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">✓</span>
                <span>Share success stories from {data.top_beneficiary || 'beneficiary groups'} to inspire more donations</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InsightsSection;
