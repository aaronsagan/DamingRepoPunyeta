import { useState, useEffect } from 'react';
import { buildApiUrl, getAuthToken } from '@/lib/api';
import { AnalyticsFilters } from './useAnalyticsSummary';

export interface CampaignTypeDistribution {
  type: string;
  label: string;
  count: number;
  total_raised: number;
  percentage: number;
}

export interface TrendingCampaign {
  id: number;
  title: string;
  type: string;
  charity: string;
  target_amount: number;
  current_amount: number;
  donation_count: number;
  total_amount: number;
  avg_amount: number;
  progress: number;
}

export interface CharityRanking {
  id: number;
  name: string;
  campaign_count: number;
  total_raised: number;
  donation_count: number;
}

export interface DonationTimeSeries {
  period: string;
  count: number;
  total: number;
  average: number;
}

export interface CampaignFrequencySeries {
  period: string;
  types: Record<string, number>;
  total: number;
}

export interface LocationData {
  region?: string;
  province?: string;
  city?: string;
  campaign_count: number;
  total_raised: number;
  avg_raised: number;
}

export interface BeneficiaryData {
  id: number;
  name: string;
  campaign_count: number;
  total_raised: number;
  avg_raised: number;
}

export interface AnalyticsQueryResult {
  campaign_type_distribution: CampaignTypeDistribution[];
  top_trending_campaigns: TrendingCampaign[];
  charity_rankings: CharityRanking[];
  donations_time_series: DonationTimeSeries[];
  campaign_frequency_time_series: CampaignFrequencySeries[];
  location_distribution: {
    regions: LocationData[];
    provinces: LocationData[];
    cities: LocationData[];
  };
  beneficiary_breakdown: BeneficiaryData[];
}

export function useAnalyticsQuery(filters: AnalyticsFilters = {}) {
  const [data, setData] = useState<AnalyticsQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const url = buildApiUrl('/donor-analytics/query');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const result = await response.json();
      
      // Calculate percentages for campaign type distribution
      const total = result.campaign_type_distribution.reduce((sum: number, item: CampaignTypeDistribution) => sum + item.count, 0);
      result.campaign_type_distribution = result.campaign_type_distribution.map((item: CampaignTypeDistribution) => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      }));
      
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Analytics query error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, loading, error, refetch: fetchData };
}
