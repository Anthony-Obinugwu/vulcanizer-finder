import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Vulcanizer } from '../types';
import { VulcanizerCard } from './VulcanizerCard';
import L from 'leaflet';

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customUserIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="12" r="10"%3E%3C/circle%3E%3C/svg%3E',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface Props {
  location: { lat: number; lng: number } | null;
  vulcanizers: Vulcanizer[];
  loading: boolean;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export function Results({ location, vulcanizers, loading }: Props) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-full border-4 border-vulcan-300 border-t-vulcan-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Finding nearby vulcanizers...</p>
      </div>
    );
  }

  const center: [number, number] = location ? [location.lat, location.lng] : [6.5244, 3.3792]; // Fallback to Lagos

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <div className="h-[40vh] w-full relative z-0">
        <MapContainer center={center} zoom={14} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />
          {location && (
            <Marker position={[location.lat, location.lng]} icon={customUserIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          {vulcanizers.map((v) => (
            <Marker key={v.id} position={[v.latitude, v.longitude]}>
              <Popup>
                <div className="font-semibold">{v.business_name}</div>
                <div className="text-sm text-slate-500 mb-1">{v.phone}</div>
                <div className="text-xs">{v.services.join(', ')}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Gradient overlay for smooth transition to list */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 to-transparent z-[400] pointer-events-none" />
      </div>

      <div className="flex-1 px-4 py-6 -mt-4 relative z-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Available Near You</h2>
          <span className="bg-vulcan-100 text-vulcan-700 px-3 py-1 rounded-full text-xs font-semibold">
            {vulcanizers.length} found
          </span>
        </div>

        {vulcanizers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">No vulcanizers found within 10km.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {vulcanizers.map((vulcanizer) => (
              <VulcanizerCard key={vulcanizer.id} vulcanizer={vulcanizer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
