import { useMemo, useState, useRef } from 'react';
// @ts-ignore
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/mapbox';
import { Navigation, Plus, Minus, LocateFixed } from 'lucide-react';
import { TireVulcanizerIcon, UserPinIcon } from './Icons';
import type { Vulcanizer } from '../App';
import 'mapbox-gl/dist/mapbox-gl.css';

interface VulcanizerMapProps {
  userLocation: { lat: number; lng: number };
  vulcanizers: Vulcanizer[];
  activeRoute?: any;
  routingMode?: 'driving' | 'walking';
  routeDetails?: { duration: number; distance: number } | null;
  routeDestination?: Vulcanizer | null;
  isDark?: boolean;
}

export default function VulcanizerMap({ userLocation, vulcanizers, activeRoute, routingMode, routeDetails, routeDestination, isDark }: VulcanizerMapProps) {
  const [popupInfo, setPopupInfo] = useState<Vulcanizer | null>(null);
  const mapRef = useRef<any>(null);

  const pins = useMemo(
    () =>
      vulcanizers.map((v) => (
        <Marker
          key={v.id}
          longitude={v.longitude}
          latitude={v.latitude}
          anchor="bottom"
          onClick={(e: any) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(v);
          }}
        >
          <TireVulcanizerIcon 
            className={`w-8 h-8 cursor-pointer transition-transform hover:scale-110 text-red-500 drop-shadow-md ${
              activeRoute && routeDestination?.id !== v.id
                ? 'opacity-50 grayscale text-slate-400'
                : ''
            }`} 
          />
        </Marker>
      )),
    [vulcanizers, activeRoute, routeDestination]
  );

  return (
    <div className="relative w-full h-full">
      {routeDetails && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-full shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 z-10 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${routingMode === 'walking' ? 'bg-green-500' : 'bg-blue-600 dark:bg-blue-500'}`} />
            <span className="font-extrabold text-slate-900 dark:text-white">
              {Math.ceil(routeDetails.duration / 60)} min
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold border-l border-slate-200 dark:border-slate-800 pl-3">
            {(routeDetails.distance / 1000).toFixed(1)} km
          </span>
        </div>
      )}

      <Map
      ref={mapRef}
      initialViewState={{
        longitude: userLocation.lng,
        latitude: userLocation.lat,
        zoom: 13
      }}
      mapStyle={isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12'}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN || ''}
      style={{ width: '100%', height: '100%' }}
    >
      
      {/* Route Layer */}
      {activeRoute && (
        <Source id="route-source" type="geojson" data={{ type: 'Feature', properties: {}, geometry: activeRoute }}>
          <Layer 
            id="route-layer"
            type="line"
            source="route-source"
            layout={{
              'line-join': 'round',
              'line-cap': 'round'
            }}
            paint={{
              'line-color': routingMode === 'walking' ? '#22c55e' : '#2563eb',
              'line-width': 6,
              'line-opacity': 0.8,
              'line-dasharray': routingMode === 'walking' ? [2, 2] : [1, 0]
            }}
          />
          <Layer 
            id="route-arrows"
            type="symbol"
            source="route-source"
            layout={{
              'symbol-placement': 'line',
              'text-field': '➤',
              'text-size': 16,
              'symbol-spacing': 100,
              'text-keep-upright': false
            }}
            paint={{
              'text-color': '#ffffff',
              'text-halo-color': routingMode === 'walking' ? '#22c55e' : '#2563eb',
              'text-halo-width': 2
            }}
          />
        </Source>
      )}

      {/* User Location Marker */}
      <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping" />
          <UserPinIcon className="w-8 h-8 animate-pulse drop-shadow-md relative z-10 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-full" />
        </div>
      </Marker>

      {pins}

      {popupInfo && (
        <Popup
          anchor="top"
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          onClose={() => setPopupInfo(null)}
          className="rounded-xl shadow-xl z-50 mapbox-popup-dark"
          maxWidth="300px"
        >
          <div className="p-2 min-w-[200px] bg-white dark:bg-slate-900 rounded-xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{popupInfo.business_name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{popupInfo.distance_km.toFixed(1)} km away</p>
            <div className="flex gap-2">
              <a 
                href={`tel:${popupInfo.phone}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Call Now
              </a>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${popupInfo.latitude},${popupInfo.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-lg transition-colors"
              >
                <Navigation className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Popup>
      )}
    </Map>

    {/* Custom Map Controls */}
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-20">
      <button 
        onClick={() => mapRef.current?.zoomIn()}
        className="p-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-700"
        aria-label="Zoom In"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button 
        onClick={() => mapRef.current?.zoomOut()}
        className="p-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-700"
        aria-label="Zoom Out"
      >
        <Minus className="w-5 h-5" />
      </button>
      <button 
        onClick={() => mapRef.current?.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14, duration: 1500 })}
        className="p-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-700"
        aria-label="Recenter Map"
      >
        <LocateFixed className="w-5 h-5" />
      </button>
    </div>

    </div>
  );
}
