import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export interface DonorMilestone {
  id: number;
  key: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  achieved_at: string | null;
  meta: {
    threshold?: number;
    progress?: number;
    [key: string]: any;
  };
  progress: number | null;
  threshold: number | null;
}

export function useDonorMilestones(donorId: string | number) {
  const [milestones, setMilestones] = useState<DonorMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/donors/${donorId}/milestones`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch milestones');
      }

      const data = await response.json();
      setMilestones(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (donorId) {
      fetchMilestones();
    }
  }, [donorId]);

  return { milestones, loading, error, refetch: fetchMilestones };
}
