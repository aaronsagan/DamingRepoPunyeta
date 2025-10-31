import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePhilippineLocations } from '@/hooks/usePhilippineLocations';
import { cn } from '@/lib/utils';

interface PhilippineAddressFormProps {
  values: {
    street_address: string;
    barangay: string;
    city: string;
    province: string;
    region: string;
    full_address: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export function PhilippineAddressForm({
  values,
  errors,
  onChange,
  disabled = false,
}: PhilippineAddressFormProps) {
  const { regions, provinces, cities, loading, loadProvinces, loadCities, buildFullAddress } =
    usePhilippineLocations();

  // Auto-update full address when any field changes
  useEffect(() => {
    const fullAddr = buildFullAddress(
      values.street_address,
      values.barangay,
      values.city,
      values.province,
      values.region
    );
    if (fullAddr !== values.full_address) {
      onChange('full_address', fullAddr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.street_address, values.barangay, values.city, values.province, values.region, buildFullAddress]);

  // Load provinces when region changes
  useEffect(() => {
    if (values.region && regions.length > 0) {
      const selectedRegion = regions.find((r) => r.name === values.region);
      if (selectedRegion) {
        console.log('Loading provinces for region:', selectedRegion.name, 'code:', selectedRegion.code);
        loadProvinces(selectedRegion.code);
      } else {
        console.warn('Selected region not found:', values.region);
      }
    }
  }, [values.region, regions, loadProvinces]);

  // Load cities when province changes
  useEffect(() => {
    if (values.region && values.province && regions.length > 0 && provinces.length > 0) {
      const selectedRegion = regions.find((r) => r.name === values.region);
      const selectedProvince = provinces.find((p) => p.name === values.province);
      
      if (selectedRegion && selectedProvince) {
        console.log('Loading cities for province:', selectedProvince.name, 'code:', selectedProvince.code);
        loadCities(selectedRegion.code, selectedProvince.code);
      }
    }
  }, [values.region, values.province, regions, provinces, loadCities]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionName = e.target.value;
    console.log('Region selected:', regionName);
    
    // Update all fields at once to prevent multiple re-renders
    if (regionName) {
      onChange('region', regionName);
      onChange('province', '');
      onChange('city', '');
    } else {
      onChange('region', '');
      onChange('province', '');
      onChange('city', '');
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    console.log('Province selected:', provinceName);
    
    if (provinceName) {
      onChange('province', provinceName);
      onChange('city', '');
    } else {
      onChange('province', '');
      onChange('city', '');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="street_address">
          Street Address / Building
        </Label>
        <Input
          id="street_address"
          value={values.street_address}
          onChange={(e) => onChange('street_address', e.target.value)}
          placeholder="e.g., 123 Charity Street, Bldg A"
          className={cn(errors.street_address && 'border-destructive')}
          disabled={disabled}
        />
        {errors.street_address && (
          <p className="text-sm text-destructive">{errors.street_address}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="region">
            Region
          </Label>
          <select
            id="region"
            value={values.region}
            onChange={handleRegionChange}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              errors.region && 'border-destructive'
            )}
            disabled={disabled || loading}
          >
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region.code} value={region.name}>
                {region.name}
              </option>
            ))}
          </select>
          {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">
            Province
          </Label>
          <select
            id="province"
            value={values.province}
            onChange={handleProvinceChange}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              errors.province && 'border-destructive'
            )}
            disabled={disabled || loading || !values.region}
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.name}>
                {province.name}
              </option>
            ))}
          </select>
          {errors.province && <p className="text-sm text-destructive">{errors.province}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">
            City / Municipality
          </Label>
          <select
            id="city"
            value={values.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              errors.city && 'border-destructive'
            )}
            disabled={disabled || loading || !values.province}
          >
            <option value="">Select City/Municipality</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="barangay">Barangay (Optional)</Label>
          <Input
            id="barangay"
            value={values.barangay}
            onChange={(e) => onChange('barangay', e.target.value)}
            placeholder="e.g., Malate"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_address">Full Address (Auto-generated)</Label>
        <Input
          id="full_address"
          value={values.full_address}
          readOnly
          className="bg-muted"
          placeholder="Address will be generated automatically..."
        />
        <p className="text-xs text-muted-foreground">
          This field is automatically filled based on your selections above.
        </p>
      </div>
    </div>
  );
}
