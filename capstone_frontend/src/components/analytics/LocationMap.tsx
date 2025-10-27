import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCityCoordinates } from '@/data/cityCoordinates';

// Fix leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  data: Array<{
    city: string;
    province?: string;
    region?: string;
    total: number;
    lat?: number;
    lng?: number;
  }>;
  selectedCity?: string;
  onCityClick?: (city: string) => void;
}

export default function LocationMap({ data, selectedCity, onCityClick }: LocationMapProps) {
  // Philippine center coordinates
  const philippinesCenter: [number, number] = [12.8797, 121.774];

  // Get marker size based on campaign count
  const getMarkerRadius = (count: number) => {
    const maxCount = Math.max(...data.map(d => d.total));
    return Math.max(8, Math.min(30, (count / maxCount) * 30));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-[550px] rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(59,130,246,0.15)] border border-slate-700"
    >
      <MapContainer
        center={philippinesCenter}
        zoom={6}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {data.map((location, index) => {
          const coords = getCityCoordinates(location.city);
          if (!coords) return null;

          const radius = getMarkerRadius(location.total);
          const isSelected = selectedCity === location.city;

          return (
            <CircleMarker
              key={`${location.city}-${index}`}
              center={coords}
              radius={radius}
              pathOptions={{
                fillColor: isSelected ? '#3B82F6' : '#0EA5E9',
                fillOpacity: isSelected ? 0.8 : 0.6,
                color: '#fff',
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onCityClick && onCityClick(location.city),
              }}
            >
              <Popup>
                <div className="text-sm p-2">
                  <strong className="text-base text-blue-600">{location.city}</strong>
                  <div className="text-xs text-gray-600 mt-1">{location.province}</div>
                  <div className="text-xs text-gray-600">{location.region}</div>
                  <div className="mt-2 text-base font-semibold text-primary">
                    {location.total} campaign{location.total !== 1 ? 's' : ''}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </motion.div>
  );
}