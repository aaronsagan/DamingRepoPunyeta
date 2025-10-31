import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export interface DonorProfile {
  id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string;
  location: string | null;
  member_since: string;
  total_donated: number;
  campaigns_supported_count: number;
  recent_donations_count: number;
  liked_campaigns_count: number;
  achievements_preview: Array<{
    title: string;
    icon: string;
    achieved_at: string;
  }>;
  is_owner: boolean;
}

export async function updateDonorImage(
  donorId: number,
  file: File,
  type: 'profile' | 'cover'
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) throw new Error('Authentication required');

    const form = new FormData();
    form.append(type === 'profile' ? 'profile_image' : 'cover_image', file);

    const response = await fetch(`${API_URL}/donors/${donorId}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update image');
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An error occurred',
    };
  }
}

export function useDonorProfile(donorId: string | number) {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/donors/${donorId}`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch donor profile');
      }

      const data = await response.json();
      setProfile(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (donorId) {
      fetchProfile();
    }
  }, [donorId]);

  return { profile, loading, error, refetch: fetchProfile };
}

export async function updateDonorProfile(
  donorId: number, 
  data: { bio?: string; address?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/donors/${donorId}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return { success: true };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'An error occurred' 
    };
  }
}
