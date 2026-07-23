import { useEffect, useMemo, useRef } from 'react';
import { Navigation, Clock, Wrench, Star, Map as MapIcon, Car, Footprints, MapPin, Volume2 } from 'lucide-react';
import { CallIcon, ShowRouteIcon, CancelRouteIcon } from './Icons';
import type { Artisan } from '../App';

interface ArtisanListProps {
  artisans: Artisan[];
  onShowRoute: (v: Artisan) => void;
  onCancelRoute: () => void;
  routingMode: 'driving' | 'walking';
  onRoutingModeChange: (mode: 'driving' | 'walking') => void;
  routeDestination: Artisan | null;
  selectedArtisanId?: string | null;
}

export default function ArtisanList({
  artisans,
  onShowRoute,
  onCancelRoute,
  routingMode,
  onRoutingModeChange,
  routeDestination,
  selectedArtisanId
}: ArtisanListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sortedArtisans = useMemo(() => {
    if (!selectedArtisanId) return artisans;
    const selected = artisans.find(a => a.id === selectedArtisanId);
    if (!selected) return artisans;
    const others = artisans.filter(a => a.id !== selectedArtisanId);
    return [selected, ...others];
  }, [artisans, selectedArtisanId]);

  useEffect(() => {
    if (selectedArtisanId && scrollContainerRef.current) {
      // Since we moved it to the top, just scroll the container to the top
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedArtisanId]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md sticky top-0 z-20 pb-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight mb-4">Who you need is not too far from you..</h2>

        <div className="flex items-center justify-between gap-4 mb-2">
          <button
            onClick={() => onRoutingModeChange('driving')}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${routingMode === 'driving' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <Car className="w-4 h-4 mr-2" /> Driving
          </button>

          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
            I am
          </span>

          <button
            onClick={() => onRoutingModeChange('walking')}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${routingMode === 'walking' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <Footprints className="w-4 h-4 mr-2" /> Walking
          </button>
        </div>

        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-4">{artisans.length} results found</p>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {sortedArtisans.map((v) => (
          <div
            key={v.id}
            id={`artisan-card-${v.id}`}
            className={`bg-[#0F172A]/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg transition-all group ${selectedArtisanId === v.id ? 'border-2 border-blue-500 shadow-[0_4px_30px_rgba(59,130,246,0.3)]' : 'border border-slate-700/50 hover:border-blue-500/30 hover:shadow-[0_4px_25px_rgba(59,130,246,0.15)]'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors tracking-wide">
                  {v.business_name}
                </h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tracking-wide ${v.mobility_type === 'MOBILE' ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/50' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                    {v.mobility_type === 'MOBILE' ? 'MOBILE VENDOR' : 'FIXED SHOP'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tracking-wide ${v.is_open ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                    {v.is_open ? 'OPEN NOW' : 'CLOSED'}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                    <Star className="w-4 h-4 text-amber-400 mr-1 fill-amber-400" />
                    {v.rating}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-center bg-blue-900/20 text-blue-400 rounded-xl px-3 py-2 border border-blue-800/40 shadow-inner">
                  <Navigation className="w-4 h-4 mr-1.5" />
                  <span className="font-bold text-base">{v.distance_km.toFixed(1)}</span>
                  <span className="text-xs ml-0.5 font-medium">km</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-start text-sm text-slate-300">
                <Wrench className="w-4 h-4 mr-2 mt-0.5 text-slate-500 flex-shrink-0" />
                <span className="leading-tight font-medium">{v.services.join(' • ')}</span>
              </div>
              <div className="flex items-start text-sm text-slate-300">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-500 flex-shrink-0" />
                <span className="leading-tight">{v.address}</span>
              </div>
              {v.sound_signal && (
                <div className="flex items-start text-sm text-blue-200 bg-blue-900/20 p-2.5 rounded-lg border border-blue-800/40 mt-3">
                  <Volume2 className="w-4 h-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0 animate-pulse" />
                  <span className="leading-tight italic">Listen for: {v.sound_signal}</span>
                </div>
              )}
              {v.mobility_type === 'MOBILE' && v.hotspots && v.hotspots.length > 0 && (
                <div className="flex flex-col text-sm text-slate-300 bg-[#060B18]/50 p-3 rounded-xl border border-slate-800/80 mt-3">
                  <span className="font-bold mb-2 text-[10px] tracking-widest uppercase text-slate-500">Active Hotspots Near You</span>
                  {v.hotspots.map((h: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-800/50 last:border-0 last:pb-0">
                      <span className="font-medium text-slate-300">{h.location_name}</span>
                      <span className="font-bold text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded-md border border-blue-800/30">{h.start_time.slice(0, 5)} - {h.end_time.slice(0, 5)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <a
                  href={`tel:${v.phone}`}
                  className="flex-1 bg-slate-800/80 border border-slate-700 hover:border-slate-500 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                >
                  <CallIcon className="w-5 h-5 text-blue-400" />
                  Call
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-slate-800/80 border border-slate-700 hover:border-slate-500 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                >
                  <MapIcon className="w-4 h-4 text-emerald-400" />
                  Google Maps
                </a>
              </div>
              {routeDestination?.id === v.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onShowRoute(v)}
                    className="flex-[7] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  >
                    <ShowRouteIcon className="w-4 h-4" />
                    Viewing Route
                  </button>
                  <button
                    onClick={onCancelRoute}
                    className="flex-[3] font-bold py-2.5 rounded-xl flex items-center justify-center transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                    aria-label="Cancel Route"
                  >
                    <CancelRouteIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onShowRoute(v)}
                  className="w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] border border-blue-500/50"
                >
                  <ShowRouteIcon className="w-4 h-4" />
                  Show Route on Map
                </button>
              )}
            </div>
          </div>
        ))}

        {artisans.length === 0 && (
          <div className="text-center p-8 bg-[#0F172A]/50 rounded-2xl border border-slate-800/50 mt-4 backdrop-blur-sm">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1 tracking-wide">No artisans found</h3>
            <p className="text-slate-400">Try expanding your search area or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
