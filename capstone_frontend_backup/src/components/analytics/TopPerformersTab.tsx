import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  TrendingUp,
  Target,
  Users,
  Sparkles,
  Medal,
  Star,
  Crown,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { buildApiUrl, getAuthToken } from '@/lib/api';

interface TopPerformersTabProps {
  charityId?: string;
}

interface TopCampaign {
  id: number;
  name: string;
  charity: string;
  raised: number;
  goal_percent: number;
  donations: number;
}

interface TopCharity {
  name: string;
  campaigns: number;
  totalRaised: number;
  avgGoalPercent: number;
}

interface TopDonor {
  name: string;
  total: number;
  campaigns: number;
}

interface PerformersData {
  top_campaigns: TopCampaign[];
  top_charities: TopCharity[];
  top_donors: TopDonor[];
  insights: string[];
}

const TopPerformersTab: React.FC<TopPerformersTabProps> = ({ charityId }) => {
  const [loading, setLoading] = useState(true);
  const [performersData, setPerformersData] = useState<PerformersData | null>(null);

  useEffect(() => {
    fetchPerformersData();
  }, [charityId]);

  const fetchPerformersData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const params = new URLSearchParams();
      if (charityId) {
        params.append('charity_id', charityId.toString());
      }
      
      const url = buildApiUrl(`/analytics/campaigns/top-performers${params.toString() ? '?' + params : ''}`);
      console.log('🏆 Fetching top performers from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🏆 Top performers response:', result);
        
        // Map backend response to frontend format
        const mappedCampaigns = (result.data || []).map((campaign: any) => ({
          id: campaign.id,
          name: campaign.title, // Backend uses 'title', frontend uses 'name'
          charity: campaign.charity,
          raised: campaign.raised_amount, // Backend uses 'raised_amount', frontend uses 'raised'
          goal_percent: campaign.progress, // Backend uses 'progress', frontend uses 'goal_percent'
          donations: campaign.donation_count, // Backend uses 'donation_count', frontend uses 'donations'
        }));
        
        console.log('🏆 Mapped campaigns:', mappedCampaigns);
        
        setPerformersData({
          top_campaigns: mappedCampaigns,
          top_charities: [],
          top_donors: [],
          insights: [],
        });
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.error('Failed to fetch top performers data:', error);
      setPerformersData({
        top_campaigns: [],
        top_charities: [],
        top_donors: [],
        insights: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-slate-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-slate-400';
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 border-yellow-500/30';
    if (rank === 2) return 'bg-slate-500/20 border-slate-500/30';
    if (rank === 3) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-slate-700/20 border-slate-700/30';
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

  if (!performersData) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Failed to load top performers data</p>
      </div>
    );
  }

  const hasData =
    (performersData?.top_campaigns?.length ?? 0) > 0 ||
    (performersData?.top_charities?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      {!hasData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center bg-slate-800/40 rounded-xl border border-slate-700/50"
        >
          <div className="p-4 rounded-full bg-slate-700/30 mb-4">
            <Trophy className="h-16 w-16 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            No Performance Data Available
          </h3>
          <p className="text-sm text-slate-400 max-w-md">
            Start creating successful campaigns to see top performers and rankings
          </p>
        </motion.div>
      ) : (
        <>
          {/* Top Campaigns Leaderboard */}
          {(performersData?.top_campaigns?.length ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Top Campaigns Leaderboard
                  </h3>
                  <p className="text-xs text-slate-400">
                    Highest-performing campaigns by fundraising success
                  </p>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300 w-20">Rank</TableHead>
                      <TableHead className="text-slate-300">Campaign</TableHead>
                      <TableHead className="text-slate-300">Charity</TableHead>
                      <TableHead className="text-slate-300 text-right">Raised</TableHead>
                      <TableHead className="text-slate-300 text-right">Goal %</TableHead>
                      <TableHead className="text-slate-300 text-right">Donations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performersData.top_campaigns.map((campaign, index) => (
                      <motion.tr
                        key={campaign.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="border-slate-700 hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getMedalIcon(index + 1)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-100">
                          {campaign.name}
                        </TableCell>
                        <TableCell className="text-slate-300">{campaign.charity}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-green-400">
                            ₱{campaign.raised.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress 
                              value={Math.min(campaign.goal_percent, 100)} 
                              className="w-20 h-2"
                            />
                            <span className={`font-semibold ${campaign.goal_percent >= 100 ? 'text-green-400' : 'text-blue-400'}`}>
                              {campaign.goal_percent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-slate-300">
                          {campaign.donations}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {performersData.top_campaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className={`p-4 rounded-xl border ${getRankBgColor(index + 1)} backdrop-blur-sm`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getMedalIcon(index + 1)}</span>
                        <div>
                          <h4 className="font-semibold text-slate-100">{campaign.name}</h4>
                          <p className="text-xs text-slate-400">{campaign.charity}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-slate-400">Raised</p>
                        <p className="font-bold text-green-400 text-sm">
                          ₱{(campaign.raised / 1000).toFixed(0)}k
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Goal</p>
                        <p className="font-bold text-blue-400 text-sm">{campaign.goal_percent}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Donors</p>
                        <p className="font-bold text-slate-300 text-sm">{campaign.donations}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Insight */}
              {performersData.insights[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {performersData.insights[0]}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Top Charities Grid */}
          {(performersData?.top_charities?.length ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Award className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Top Charities
                  </h3>
                  <p className="text-xs text-slate-400">
                    Most successful organizations by total fundraising
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {performersData.top_charities.slice(0, 3).map((charity, index) => (
                  <motion.div
                    key={charity.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className={`relative overflow-hidden border ${getRankBgColor(index + 1)} backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        {/* Rank Badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                          className="text-5xl mb-3"
                        >
                          {getMedalIcon(index + 1)}
                        </motion.div>

                        {/* Charity Name */}
                        <h4 className="font-bold text-lg text-slate-100 mb-1">
                          {charity.name}
                        </h4>

                        {/* Campaigns Count */}
                        <p className="text-sm text-slate-400 mb-3">
                          {charity.campaigns} campaign{charity.campaigns !== 1 ? 's' : ''}
                        </p>

                        {/* Total Raised */}
                        <div className="mb-4">
                          <p className="text-xs text-slate-400 mb-1">Total Raised</p>
                          <p className="text-2xl font-bold text-green-400">
                            ₱{charity.totalRaised.toLocaleString()}
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full">
                          <Progress 
                            value={charity.avgGoalPercent} 
                            className="h-3 mb-2"
                          />
                          <p className="text-xs text-slate-400">
                            <span className="font-semibold text-blue-400">{charity.avgGoalPercent}%</span> avg goal success
                          </p>
                        </div>

                        {/* Decoration */}
                        {index === 0 && (
                          <motion.div
                            className="absolute -top-2 -right-2"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Crown className="h-8 w-8 text-yellow-400" />
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Insight */}
              {performersData.insights[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {performersData.insights[1]}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Top Donors Table (Optional) */}
          {(performersData?.top_donors?.length ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Top Donors
                  </h3>
                  <p className="text-xs text-slate-400">
                    Generous contributors making the biggest impact
                  </p>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300 w-20">Rank</TableHead>
                      <TableHead className="text-slate-300">Donor</TableHead>
                      <TableHead className="text-slate-300 text-right">Total Donated</TableHead>
                      <TableHead className="text-slate-300 text-right">Campaigns</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performersData.top_donors.map((donor, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                        className="border-slate-700 hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell>
                          <span className="text-2xl">{getMedalIcon(index + 1)}</span>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-100">
                          {donor.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-purple-400">
                            ₱{donor.total.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-slate-300">
                          {donor.campaigns}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {performersData.top_donors.map((donor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                    className={`p-4 rounded-xl border ${getRankBgColor(index + 1)} backdrop-blur-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getMedalIcon(index + 1)}</span>
                        <div>
                          <h4 className="font-semibold text-slate-100">{donor.name}</h4>
                          <p className="text-xs text-slate-400">{donor.campaigns} campaigns</p>
                        </div>
                      </div>
                      <p className="font-bold text-purple-400">
                        ₱{(donor.total / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Insight */}
              {performersData.insights[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {performersData.insights[2]}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Overall Performance Summary */}
          {(performersData?.insights?.length ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="p-3 rounded-xl bg-blue-500/20"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Trophy className="h-6 w-6 text-blue-400" />
                </motion.div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-blue-300 mb-2">
                    Performance Summary
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {performersData.insights.slice(0, 3).join(' ')}
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

export default TopPerformersTab;
