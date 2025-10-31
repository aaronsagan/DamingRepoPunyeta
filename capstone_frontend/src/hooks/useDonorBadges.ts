import { useState, useEffect } from 'react';
import { DonorBadge } from '@/components/donor/BadgeList';

const API_URL = import.meta.env.VITE_API_URL;

export function useDonorBadges(donorId: string | number) {
  const [badges, setBadges] = useState<DonorBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        const response = await fetch(`${API_URL}/donors/${donorId}/badges`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBadges(data.data || []);
        } else {
          // If endpoint doesn't exist yet, use mock data based on profile achievements
          setBadges(generateMockBadges());
        }
      } catch (error) {
        // Fallback to mock badges
        setBadges(generateMockBadges());
      } finally {
        setLoading(false);
      }
    };

    if (donorId) {
      fetchBadges();
    }
  }, [donorId]);

  return { badges, loading };
}

// Mock badges generator - will be replaced when backend endpoint is ready
function generateMockBadges(): DonorBadge[] {
  return [
    {
      name: 'First Donation',
      description: 'Made your first charitable donation',
      icon: 'Heart',
      earned: true,
    },
    {
      name: 'Generous Giver',
      description: 'Donated over ₱10,000',
      icon: 'Award',
      earned: false,
    },
    {
      name: 'Community Supporter',
      description: 'Supported 5 different campaigns',
      icon: 'Users',
      earned: false,
    },
    {
      name: 'Consistent Donor',
      description: 'Made donations for 3 consecutive months',
      icon: 'Calendar',
      earned: false,
    },
  ];
}
