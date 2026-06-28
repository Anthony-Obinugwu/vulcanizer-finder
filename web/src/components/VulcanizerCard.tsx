import { MapPin, Phone, Star, Clock, AlertCircle } from 'lucide-react';
import { Vulcanizer } from '../types';

interface Props {
  vulcanizer: Vulcanizer;
}

export function VulcanizerCard({ vulcanizer }: Props) {
  const { business_name, rating, is_open, distance_meters, services, phone } = vulcanizer;
  const distanceKm = (distance_meters / 1000).toFixed(1);

  const handleCall = () => {
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${vulcanizer.latitude},${vulcanizer.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="glass-card p-5 mb-4 border-l-4 border-l-vulcan-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-slate-900 leading-tight">{business_name}</h3>
        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-xs font-semibold">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm mb-4">
        <div className={`flex items-center gap-1 font-medium ${is_open ? 'text-green-600' : 'text-red-500'}`}>
          {is_open ? <Clock className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{is_open ? 'Open Now' : 'Closed'}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
        <div className="flex items-center gap-1 text-slate-500">
          <MapPin className="w-4 h-4" />
          <span>{distanceKm} km away</span>
        </div>
      </div>

      <div className="mb-5">
        <ul className="flex flex-wrap gap-2">
          {services.map((service, idx) => (
            <li key={idx} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {service}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleCall}
          className="flex-1 bg-vulcan-50 hover:bg-vulcan-100 text-vulcan-700 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" />
          Call
        </button>
        <button 
          onClick={handleDirections}
          className="flex-1 bg-vulcan-600 hover:bg-vulcan-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-md shadow-vulcan-500/20 flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          Directions
        </button>
      </div>
    </div>
  );
}
