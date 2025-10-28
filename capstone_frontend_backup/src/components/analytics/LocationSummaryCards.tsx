import { motion } from 'framer-motion';
import { MapPin, Building2, Map, Target } from 'lucide-react';

interface LocationSummaryCardsProps {
  regions: number;
  provinces: number;
  cities: number;
  campaigns: number;
}

export default function LocationSummaryCards({
  regions,
  provinces,
  cities,
  campaigns,
}: LocationSummaryCardsProps) {
  const stats = [
    { label: 'Regions', value: regions, icon: Map, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Provinces', value: provinces, icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Cities', value: cities, icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Campaigns', value: campaigns, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}