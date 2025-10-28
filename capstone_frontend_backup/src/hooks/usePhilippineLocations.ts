import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl } from '@/lib/api';

const API_URL = getApiUrl();

interface Region {
  code: string;
  name: string;
}

interface Province {
  code: string;
  name: string;
}

interface LocationData {
  regions: Region[];
  provinces: Province[];
  cities: string[];
}

export function usePhilippineLocations() {
  // Step 1: All useState hooks
  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Step 2: All useCallback hooks (before useEffect)
  const loadProvinces = useCallback(async (regionCode: string) => {
    if (!regionCode) {
      setProvinces([]);
      setCities([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading provinces for region code:', regionCode);
      const response = await axios.get(`${API_URL}/locations/regions/${regionCode}/provinces`);
      console.log('Provinces loaded:', response.data.provinces?.length || 0, 'provinces');
      setProvinces(response.data.provinces || []);
      setCities([]);
    } catch (error) {
      console.error('Failed to load provinces for region:', regionCode, error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
      }
      setProvinces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCities = useCallback(async (regionCode: string, provinceCode: string) => {
    if (!regionCode || !provinceCode) {
      setCities([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/locations/regions/${regionCode}/provinces/${provinceCode}/cities`
      );
      setCities(response.data.cities || []);
    } catch (error) {
      console.error('Failed to load cities:', error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const buildFullAddress = useCallback((
    streetAddress: string,
    barangay: string,
    city: string,
    province: string,
    region: string
  ): string => {
    const parts = [
      streetAddress,
      barangay,
      city,
      province,
      region
    ].filter(part => part && part.trim() !== '');

    return parts.join(', ');
  }, []);

  // Step 3: All useEffect hooks (after useCallback)
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoading(true);
        console.log('Loading regions from:', `${API_URL}/locations/regions`);
        const response = await axios.get(`${API_URL}/locations/regions`);
        console.log('Regions loaded:', response.data.regions?.length || 0, 'regions');
        setRegions(response.data.regions || []);
      } catch (error) {
        console.error('Failed to load regions:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response:', error.response?.data);
          console.error('Status:', error.response?.status);
        }
      } finally {
        setLoading(false);
      }
    };

    console.log('API_URL:', API_URL);
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    loadRegions();
  }, []);

  // Step 4: Return
  return {
    regions,
    provinces,
    cities,
    loading,
    loadProvinces,
    loadCities,
    buildFullAddress,
  };
}
