import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  MapPin, Globe2, BarChart3, Map, TrendingUp, 
  Sparkles, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ChartInsight from './ChartInsight';

const REGION_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F43F5E'];

interface GeographicInsightsTabProps {
  locationData: any[];
  locationSummary: {
    regions: number;
    provinces: number;
    cities: number;
    campaigns: number;
  };
}

const GeographicInsightsTab: React.FC<GeographicInsightsTabProps> = ({
  locationData,
  locationSummary,
}) => {
  // Process location data for charts
  const cityData = locationData
    .filter(loc => loc.city)
    .reduce((acc, loc) => {
      const existing = acc.find(item => item.city === loc.city);
      if (existing) {
        existing.count += 1;
        existing.raised += loc.raised_amount || 0;
      } else {
        acc.push({
          city: loc.city,
          count: 1,
          raised: loc.raised_amount || 0,
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const regionData = locationData
    .filter(loc => loc.region)
    .reduce((acc, loc) => {
      const existing = acc.find(item => item.region === loc.region);
      if (existing) {
        existing.count += 1;
        existing.raised += loc.raised_amount || 0;
      } else {
        acc.push({
          region: loc.region,
          count: 1,
          raised: loc.raised_amount || 0,
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.raised - a.raised);

  const provinceData = locationData
    .filter(loc => loc.province)
    .reduce((acc, loc) => {
      const existing = acc.find(item => item.province === loc.province);
      if (existing) {
        existing.count += 1;
        existing.raised += loc.raised_amount || 0;
      } else {
        acc.push({
          province: loc.province,
          count: 1,
          raised: loc.raised_amount || 0,
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top 3 locations
  const topLocations = cityData.slice(0, 3);

  // Calculate insights
  const topCity = cityData[0];
  const topRegion = regionData[0];
  const totalCampaigns = locationData.length;
  
  const topRegionPercentage = topRegion && totalCampaigns > 0
    ? ((topRegion.count / totalCampaigns) * 100).toFixed(0)
    : 0;

  const generateLocationInsight = () => {
    if (locationData.length === 0) {
      return "No location data available yet. Start adding location details to campaigns to see geographic insights!";
    }

    const parts = [];
    
    if (topCity) {
      parts.push(`${topCity.city} leads with ${topCity.count} campaign${topCity.count !== 1 ? 's' : ''}`);
    }
    
    if (topRegion) {
      parts.push(`${topRegion.region} accounts for ${topRegionPercentage}% of all campaign activity`);
    }

    if (cityData.length >= 3) {
      parts.push(`geographic diversity is growing with campaigns across ${locationSummary.cities} cities`);
    }

    return parts.length > 0
      ? parts.join(', ') + '.'
      : "Campaign locations are being tracked across the Philippines.";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe2 className="w-5 h-5 text-blue-400" />
            <p className="text-xs text-slate-400">Regions</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{locationSummary.regions}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Map className="w-5 h-5 text-emerald-400" />
            <p className="text-xs text-slate-400">Provinces</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{locationSummary.provinces}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <p className="text-xs text-slate-400">Cities</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">{locationSummary.cities}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <p className="text-xs text-slate-400">Campaigns</p>
          </div>
          <p className="text-2xl font-bold text-violet-400">{locationSummary.campaigns}</p>
        </motion.div>
      </div>

      {/* Row 1: Campaign Distribution & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Distribution by City */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="h-full"
        >
          <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border-slate-800 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Campaign Distribution by City</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Top campaign locations</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {cityData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={cityData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis 
                        dataKey="city" 
                        type="category" 
                        stroke="#94a3b8"
                        width={100}
                        style={{ fontSize: '11px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155', 
                          borderRadius: '8px' 
                        }}
                        formatter={(value: any) => [value, 'Campaigns']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#3B82F6" 
                        radius={[0, 8, 8, 0]}
                        animationDuration={1200}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <ChartInsight
                    variant="default"
                    text={topCity 
                      ? `${topCity.city} leads with ${topCity.count} campaign${topCity.count !== 1 ? 's' : ''}, followed by ${cityData[1]?.city || 'other cities'}.`
                      : "Campaign locations are tracked across multiple cities."
                    }
                  />
                </>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No city data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Regional Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="h-full"
        >
          <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border-slate-800 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Globe2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Regional Distribution</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Campaign spread by region</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {regionData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={regionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.region}: ${entry.count}`}
                        outerRadius={90}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="count"
                        paddingAngle={3}
                        animationDuration={1000}
                      >
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155', 
                          borderRadius: '8px' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <ChartInsight
                    variant="success"
                    text={topRegion 
                      ? `${topRegion.region} accounts for ${topRegionPercentage}% of campaign activity with ${topRegion.count} campaigns.`
                      : "Campaigns are distributed across different regions."
                    }
                  />
                </>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <Globe2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No regional data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Row 2: Top 3 Locations & Province Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 3 Campaign Locations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="h-full"
        >
          <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border-slate-800 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Award className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Top 3 Campaign Locations</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Most active cities</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {topLocations.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {topLocations.map((location, idx) => {
                      const maxCount = topLocations[0].count;
                      const percentage = ((location.count / maxCount) * 100).toFixed(0);
                      
                      return (
                        <motion.div
                          key={location.city}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + (idx * 0.1), duration: 0.4 }}
                          className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/30 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                              style={{ 
                                backgroundColor: idx === 0 ? '#F59E0B' : idx === 1 ? '#FBBF24' : idx === 2 ? '#FCD34D' : '#94A3B8',
                                color: 'white' 
                              }}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-slate-200">{location.city}</h4>
                              <p className="text-xs text-slate-400">
                                {location.count} campaign{location.count !== 1 ? 's' : ''} • 
                                ₱{location.raised.toLocaleString()} raised
                              </p>
                            </div>
                            <span className="text-base font-bold text-amber-400">{percentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-900/60 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.9 + (idx * 0.1), duration: 0.8 }}
                              className="h-full bg-amber-500 rounded-full"
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  <ChartInsight
                    variant="warning"
                    text={`Top 5 cities represent ${cityData.slice(0, 5).reduce((sum, loc) => sum + loc.count, 0)} campaigns across ${locationSummary.cities} tracked locations.`}
                  />
                </>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No location rankings available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Province Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="h-full"
        >
          <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border-slate-800 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <Map className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Province Distribution</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Campaign spread by province</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {provinceData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={provinceData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis 
                        dataKey="province" 
                        type="category" 
                        stroke="#94a3b8"
                        width={80}
                        style={{ fontSize: '10px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155', 
                          borderRadius: '8px' 
                        }}
                        formatter={(value: any) => [value, 'Campaigns']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#8B5CF6" 
                        radius={[0, 8, 8, 0]}
                        animationDuration={1200}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <ChartInsight
                    variant="info"
                    text={provinceData[0] 
                      ? `${provinceData[0].province} leads provincial activity with ${provinceData[0].count} campaigns.`
                      : "Campaigns are distributed across different provinces."
                    }
                  />
                </>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <Map className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No province data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Location Insight Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-blue-900/20 border border-blue-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/20">
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              🗺️ Geographic Summary
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              {generateLocationInsight()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GeographicInsightsTab;
