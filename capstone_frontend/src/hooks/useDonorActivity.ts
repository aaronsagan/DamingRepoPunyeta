import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export interface DonorDonation {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  donated_at: string;
  campaign: {
    id: number;
    title: string;
    slug: string;
    cover_image: string | null;
  } | null;
  charity: {
    id: number;
    name: string;
  } | null;
  receipt_url: string | null;
  is_anonymous: boolean;
  purpose: string;
  ocr_verified: boolean;
  manually_verified: boolean;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export function useDonorActivity(donorId: string | number, perPage: number = 10) {
  const [donations, setDonations] = useState<DonorDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  const fetchActivity = async (currentPage: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/donors/${donorId}/activity?per_page=${perPage}&page=${currentPage}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch donor activity');
      }

      const data = await response.json();
      setDonations(data.data);
      setMeta({
        current_page: data.meta?.current_page || data.current_page,
        last_page: data.meta?.last_page || data.last_page,
        per_page: data.meta?.per_page || data.per_page,
        total: data.meta?.total || data.total,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (donorId) {
      fetchActivity(page);
    }
  }, [donorId, page]);

  const loadMore = () => {
    if (meta && page < meta.last_page) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const hasMore = meta ? page < meta.last_page : false;

  return { 
    donations, 
    loading, 
    error, 
    meta, 
    loadMore, 
    hasMore,
    refetch: () => fetchActivity(page)
  };
}
