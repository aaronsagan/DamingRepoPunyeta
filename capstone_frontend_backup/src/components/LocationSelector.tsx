/**
 * Reusable Location Selector Component
 * Hierarchical cascading dropdowns: Region → Province → City → Barangay
 * All fields are required
 */

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, MapPin } from 'lucide-react';
import { getRegions, getProvinces, getCities, getBarangays } from '@/data/philippineLocations';
import { cn } from '@/lib/utils';

export interface LocationData {
  street_address?: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  required?: boolean;
  disabled?: boolean;
  errors?: {
    street_address?: string;
    region?: string;
    province?: string;
    city?: string;
    barangay?: string;
  };
  showFullAddress?: boolean; // Option to show auto-generated full address
  onFullAddressChange?: (fullAddress: string) => void; // Callback for full address
}

export default function LocationSelector({
  value,
  onChange,
  required = true,
  disabled = false,
  errors = {},
  showFullAddress = true,
  onFullAddressChange
}: LocationSelectorProps) {
  const [regions] = useState<string[]>(getRegions());
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);
  const [fullAddress, setFullAddress] = useState<string>('');

  // Load provinces when region changes
  useEffect(() => {
    if (value.region) {
      const provinceList = getProvinces(value.region);
      setProvinces(provinceList);
      
      // Reset dependent fields if province is no longer valid
      if (value.province && !provinceList.includes(value.province)) {
        onChange({ ...value, province: '', city: '', barangay: '' });
        setCities([]);
        setBarangays([]);
      }
    } else {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
    }
  }, [value.region]);

  // Load cities when province changes
  useEffect(() => {
    if (value.region && value.province) {
      const cityList = getCities(value.region, value.province);
      setCities(cityList);
      
      // Reset dependent fields if city is no longer valid
      if (value.city && !cityList.includes(value.city)) {
        onChange({ ...value, city: '', barangay: '' });
        setBarangays([]);
      }
    } else {
      setCities([]);
      setBarangays([]);
    }
  }, [value.region, value.province]);

  // Load barangays when city changes
  useEffect(() => {
    if (value.region && value.province && value.city) {
      const barangayList = getBarangays(value.region, value.province, value.city);
      setBarangays(barangayList);
      
      // Reset barangay if it's no longer valid
      if (value.barangay && !barangayList.includes(value.barangay)) {
        onChange({ ...value, barangay: '' });
      }
    } else {
      setBarangays([]);
    }
  }, [value.region, value.province, value.city]);

  const handleRegionChange = (region: string) => {
    onChange({ region, province: '', city: '', barangay: '' });
  };

  const handleProvinceChange = (province: string) => {
    onChange({ ...value, province, city: '', barangay: '' });
  };

  const handleCityChange = (city: string) => {
    onChange({ ...value, city, barangay: '' });
  };

  const handleBarangayChange = (barangay: string) => {
    onChange({ ...value, barangay });
  };

  const isComplete = value.street_address && value.region && value.province && value.city && value.barangay;

  // Auto-generate full address: street_address, barangay, city, province, region, Philippines
  useEffect(() => {
    const parts = [
      value.street_address,
      value.barangay ? `Brgy. ${value.barangay}` : '',
      value.city,
      value.province,
      value.region
    ].filter(Boolean);
    
    // Always add Philippines at the end if we have any location data
    const newFullAddress = parts.length > 0 ? `${parts.join(', ')}, Philippines` : '';
    setFullAddress(newFullAddress);
    
    if (onFullAddressChange) {
      onFullAddressChange(newFullAddress);
    }
  }, [value.street_address, value.region, value.province, value.city, value.barangay, onFullAddressChange]);

  return (
    <div className="space-y-4">
      {/* Street Address - Required */}
      <div className="space-y-2">
        <Label htmlFor="street_address">
          Street Address {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id="street_address"
          type="text"
          placeholder="e.g., Blk 14 Lot 152 Southville 1"
          value={value.street_address || ''}
          onChange={(e) => onChange({ ...value, street_address: e.target.value })}
          className={cn(errors.street_address && 'border-destructive')}
          disabled={disabled}
        />
        {errors.street_address && (
          <p className="text-sm text-destructive">{errors.street_address}</p>
        )}
      </div>

      {/* Grid layout for efficient space usage (2 columns on medium+ screens) */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Region Selector */}
      <div className="space-y-2">
        <Label htmlFor="region">
          Region {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={value.region}
          onValueChange={handleRegionChange}
          disabled={disabled}
        >
          <SelectTrigger id="region" className={errors.region ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.region && (
          <p className="text-sm text-destructive">{errors.region}</p>
        )}
      </div>

        {/* Province Selector */}
        <div className="space-y-2">
        <Label htmlFor="province">
          Province {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={value.province}
          onValueChange={handleProvinceChange}
          disabled={disabled || !value.region || provinces.length === 0}
        >
          <SelectTrigger id="province" className={errors.province ? 'border-destructive' : ''}>
            <SelectValue placeholder={value.region ? "Select province" : "Select region first"} />
          </SelectTrigger>
          <SelectContent>
            {provinces.length > 0 ? (
              provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">No provinces available</div>
            )}
          </SelectContent>
        </Select>
          {errors.province && (
            <p className="text-sm text-destructive">{errors.province}</p>
          )}
        </div>

        {/* City/Municipality Selector */}
        <div className="space-y-2">
        <Label htmlFor="city">
          City/Municipality {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={value.city}
          onValueChange={handleCityChange}
          disabled={disabled || !value.province || cities.length === 0}
        >
          <SelectTrigger id="city" className={errors.city ? 'border-destructive' : ''}>
            <SelectValue placeholder={value.province ? "Select city/municipality" : "Select province first"} />
          </SelectTrigger>
          <SelectContent>
            {cities.length > 0 ? (
              cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">No cities available</div>
            )}
          </SelectContent>
        </Select>
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        {/* Barangay Selector */}
        <div className="space-y-2">
        <Label htmlFor="barangay">
          Barangay {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={value.barangay}
          onValueChange={handleBarangayChange}
          disabled={disabled || !value.city || barangays.length === 0}
        >
          <SelectTrigger id="barangay" className={errors.barangay ? 'border-destructive' : ''}>
            <SelectValue placeholder={value.city ? "Select barangay" : "Select city first"} />
          </SelectTrigger>
          <SelectContent>
            {barangays.length > 0 ? (
              barangays.map((barangay) => (
                <SelectItem key={barangay} value={barangay}>
                  {barangay}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">No barangays available</div>
            )}
          </SelectContent>
        </Select>
          {errors.barangay && (
            <p className="text-sm text-destructive">{errors.barangay}</p>
          )}
        </div>
      </div>

      {/* Auto-generated Full Address */}
      {showFullAddress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="full_address">Full Address (Auto-generated)</Label>
            {isComplete && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete</span>
              </div>
            )}
          </div>
          <Input
            id="full_address"
            value={fullAddress}
            readOnly
            className="bg-muted"
            placeholder="Address will be generated automatically..."
          />
          <p className="text-xs text-muted-foreground">
            This field is automatically filled based on your selections above.
          </p>
        </div>
      )}
    </div>
  );
}
