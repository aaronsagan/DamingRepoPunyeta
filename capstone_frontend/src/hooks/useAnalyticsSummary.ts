import { useState, useEffect } from 'react';
import { buildApiUrl, getAuthToken } from '@/lib/api';

export interface AnalyticsSummary {
  total_campaigns: number;
  active_campaigns: number;
  total_donations_amount: number;
  avg_donation: number;
  total_donations_count: number;
}

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  campaign_types?: string[];
  charity_ids?: number[];
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  beneficiary_ids?: number[];
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export function useAnalyticsSummary(filters: AnalyticsFilters = {}) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const url = buildApiUrl(`/donor-analytics/summary?${params.toString()}`);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }
      
      const data = await response.json();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Analytics summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [JSON.stringify(filters)]);

  return { summary, loading, error, refetch: fetchSummary };
}
