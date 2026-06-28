import { Navigation, Clock, Wrench, Star, Map as MapIcon, Car, Footprints, MapPin } from 'lucide-react';
import { CallIcon, ShowRouteIcon, CancelRouteIcon } from './Icons';
import type { Vulcanizer } from '../App';

interface VulcanizerListProps {
  vulcanizers: Vulcanizer[];
  onShowRoute: (v: Vulcanizer) => void;
  onCancelRoute: () => void;
  routingMode: 'driving' | 'walking';
  onRoutingModeChange: (mode: 'driving' | 'walking') => void;
  routeDestination: Vulcanizer | null;
}

export default function VulcanizerList({
  vulcanizers,
  onShowRoute,
  onCancelRoute,
  routingMode,
  onRoutingModeChange,
  routeDestination
}: VulcanizerListProps) {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">So na who go pump me like this?</h2>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg mb-2">
          <button
            onClick={() => onRoutingModeChange('driving')}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${routingMode === 'driving' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <Car className="w-4 h-4 mr-2" /> Driving
          </button>
          <button
            onClick={() => onRoutingModeChange('walking')}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${routingMode === 'walking' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <Footprints className="w-4 h-4 mr-2" /> Walking
          </button>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-sm">{vulcanizers.length} results found</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-25 space-y-4">
        {vulcanizers.map((v) => (
          <div key={v.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-shadow group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {v.business_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${v.is_open ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                    {v.is_open ? 'Open Now' : 'Closed'}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                    <Star className="w-4 h-4 text-amber-400 mr-1 fill-amber-400" />
                    {v.rating}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl px-3 py-2 border border-blue-100 dark:border-blue-900/30">
                  <Navigation className="w-4 h-4 mr-1.5" />
                  <span className="font-bold">{v.distance_km.toFixed(1)}</span>
                  <span className="text-xs ml-0.5 font-medium">km</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                <Wrench className="w-4 h-4 mr-2 mt-0.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="leading-tight">{v.services.join(' • ')}</span>
              </div>
              <div className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="leading-tight">{v.address}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <a
                  href={`tel:${v.phone}`}
                  className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <CallIcon className="w-5 h-5" />
                  Call
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <MapIcon className="w-4 h-4" />
                  Google Maps
                </a>
              </div>
              {routeDestination?.id === v.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onShowRoute(v)}
                    className="flex-[7] font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 border border-green-200 dark:border-green-800"
                  >
                    <ShowRouteIcon className="w-4 h-4" />
                    Viewing Route
                  </button>
                  <button
                    onClick={onCancelRoute}
                    className="flex-[3] font-medium py-2.5 rounded-xl flex items-center justify-center transition-colors bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800"
                    aria-label="Cancel Route"
                  >
                    <CancelRouteIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onShowRoute(v)}
                  className="w-full font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                >
                  <ShowRouteIcon className="w-4 h-4" />
                  Show Route on Map
                </button>
              )}
            </div>
          </div>
        ))}

        {vulcanizers.length === 0 && (
          <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 mt-4">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No vulcanizers found</h3>
            <p className="text-slate-500">Try expanding your search area or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
