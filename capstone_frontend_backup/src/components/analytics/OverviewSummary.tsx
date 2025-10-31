import { motion } from 'framer-motion';
import { TrendingUp, Coins, Activity, Target, CheckCircle, Gauge, Award, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OverviewData {
  total_campaigns: number;
  total_raised: number;
  average_donation: number;
  average_goal_achievement: number;
  total_verified_donations: number;
  active_campaigns: number;
  completed_campaigns: number;
  top_campaign: {
    title: string;
    progress: number;
    raised_amount: number;
    goal_amount: number;
  } | null;
}

interface OverviewSummaryProps {
  data: OverviewData;
  loading?: boolean;
}

export default function OverviewSummary({ data, loading }: OverviewSummaryProps) {
  const [animatedValues, setAnimatedValues] = useState({
    total_campaigns: 0,
    total_raised: 0,
    average_donation: 0,
    average_goal_achievement: 0,
    total_verified_donations: 0,
    active_campaigns: 0,
    completed_campaigns: 0,
  });

  // Simple number animation
  useEffect(() => {
    if (!loading && data) {
      const duration = 1000; // 1 second
      const steps = 30;
      const interval = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setAnimatedValues({
          total_campaigns: Math.round(data.total_campaigns * progress),
          total_raised: Math.round(data.total_raised * progress),
          average_donation: Math.round(data.average_donation * progress),
          average_goal_achievement: Math.round(data.average_goal_achievement * progress * 10) / 10,
          total_verified_donations: Math.round(data.total_verified_donations * progress),
          active_campaigns: Math.round(data.active_campaigns * progress),
          completed_campaigns: Math.round(data.completed_campaigns * progress),
        });
        
        if (step >= steps) {
          clearInterval(timer);
          setAnimatedValues({
            total_campaigns: data.total_campaigns,
            total_raised: data.total_raised,
            average_donation: data.average_donation,
            average_goal_achievement: data.average_goal_achievement,
            total_verified_donations: data.total_verified_donations,
            active_campaigns: data.active_campaigns,
            completed_campaigns: data.completed_campaigns,
          });
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [data, loading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = [
    {
      title: 'Total Campaigns',
      value: animatedValues.total_campaigns,
      icon: BarChart3,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      glowColor: 'shadow-blue-500/20',
    },
    {
      title: 'Total Raised',
      value: formatCurrency(animatedValues.total_raised),
      icon: Coins,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      glowColor: 'shadow-emerald-500/20',
    },
    {
      title: 'Average Donation',
      value: formatCurrency(animatedValues.average_donation),
      icon: TrendingUp,
      color: 'cyan',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
      glowColor: 'shadow-cyan-500/20',
    },
    {
      title: 'Goal Achievement',
      value: `${animatedValues.average_goal_achievement}%`,
      icon: Target,
      color: 'violet',
      bgColor: 'bg-violet-500/10',
      textColor: 'text-violet-400',
      borderColor: 'border-violet-500/20',
      glowColor: 'shadow-violet-500/20',
    },
    {
      title: 'Verified Donations',
      value: animatedValues.total_verified_donations,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20',
      glowColor: 'shadow-green-500/20',
    },
    {
      title: 'Active Campaigns',
      value: animatedValues.active_campaigns,
      icon: Activity,
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/20',
    },
    {
      title: 'Completed Campaigns',
      value: animatedValues.completed_campaigns,
      icon: Gauge,
      color: 'pink',
      bgColor: 'bg-pink-500/10',
      textColor: 'text-pink-400',
      borderColor: 'border-pink-500/20',
      glowColor: 'shadow-pink-500/20',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`bg-slate-800/40 border ${metric.borderColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-default`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${metric.bgColor} border ${metric.borderColor}`}>
                  <Icon className={`h-6 w-6 ${metric.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{metric.title}</p>
                <p className={`text-3xl font-bold ${metric.textColor}`}>
                  {metric.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Top Campaign Highlight */}
      {data.top_campaign && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-lg"
          style={{
            boxShadow: '0 0 30px rgba(245,158,11,0.15)'
          }}
        >
          <div className="flex items-start gap-4">
            <motion.div
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(245,158,11,0.2)' }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Award className="h-6 w-6 text-amber-400" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-300 mb-1">Top Performing Campaign</p>
              <h3 className="text-xl font-bold text-amber-400 mb-3">{data.top_campaign.title}</h3>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    {formatCurrency(data.top_campaign.raised_amount)} raised of {formatCurrency(data.top_campaign.goal_amount)}
                  </span>
                  <span className="text-amber-400 font-bold">{data.top_campaign.progress}%</span>
                </div>
                <div className="h-3 w-full bg-slate-900/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(data.top_campaign.progress, 100)}%` }}
                    transition={{ delay: 1, duration: 1.2, ease: 'easeInOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{
                      boxShadow: '0 0 10px rgba(245,158,11,0.5)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
