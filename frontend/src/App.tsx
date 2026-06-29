import { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Drawer } from 'vaul';
import { Analytics } from '@vercel/analytics/react';
import AnimatedBackground from './components/AnimatedBackground';
import { TireRepairIcon } from './components/Icons';

// Code-split the heavy map and list components so they don't block the landing page load
const VulcanizerMap = lazy(() => import('./components/VulcanizerMap'));
const VulcanizerList = lazy(() => import('./components/VulcanizerList'));

export type Vulcanizer = {
  id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  latitude: number;
  longitude: number;
  address: string;
  is_open: boolean;
  rating: number;
  services: string[];
  distance_km: number;
};

function App() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vulcanizers, setVulcanizers] = useState<Vulcanizer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [routeDetails, setRouteDetails] = useState<{ duration: number; distance: number } | null>(null);
  const [routingMode, setRoutingMode] = useState<'driving' | 'walking'>('driving');
  const [routeDestination, setRouteDestination] = useState<Vulcanizer | null>(null);
  const [snap, setSnap] = useState<number>(0.5);
  const [isDark, setIsDark] = useState<boolean>(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Preload the heavy map library in the background 1 second after the landing page is interactive
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./components/VulcanizerMap');
      import('./components/VulcanizerList');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Preload the heavy map library in the background 1 second after the landing page is interactive
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./components/VulcanizerMap');
      import('./components/VulcanizerList');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchRoute = async (dest: Vulcanizer, mode: 'driving' | 'walking') => {
    if (!location) return;
    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/${location.lng},${location.lat};${dest.longitude},${dest.latitude}?geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      );
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        setActiveRoute(data.routes[0].geometry);
        setRouteDetails({
          duration: data.routes[0].duration,
          distance: data.routes[0].distance
        });
        setRouteDestination(dest);
      }
    } catch (err) {
      console.error('Failed to fetch route:', err);
    }
  };

  const handleCancelRoute = () => {
    setActiveRoute(null);
    setRouteDetails(null);
    setRouteDestination(null);
  };

  const handleRoutingModeChange = (mode: 'driving' | 'walking') => {
    setRoutingMode(mode);
    if (routeDestination) {
      fetchRoute(routeDestination, mode);
    }
  };

  const fetchNearby = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vulcanizers/nearby?lat=${lat}&lng=${lng}&radius=10`);
      if (!res.ok) throw new Error('Failed to fetch from backend. Ensure DB migrations are run.');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVulcanizers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = () => {
    setIsLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not supported. Using default location.');
      setLocation({ lat: 6.5244, lng: 3.3792 });
      fetchNearby(6.5244, 3.3792);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        fetchNearby(lat, lng);
      },
      async (error) => {
        console.warn('Geolocation error:', error);
        try {
          const ipRes = await fetch('https://ipwho.is/');
          const ipData = await ipRes.json();
          if (ipData && ipData.success && ipData.latitude && ipData.longitude) {
            setLocation({ lat: ipData.latitude, lng: ipData.longitude });
            fetchNearby(ipData.latitude, ipData.longitude);
          } else {
            throw new Error('IP Location missing coordinates');
          }
        } catch (ipErr) {
          console.error('IP Fallback error:', ipErr);
          setError(`Location access failed completely. Using default location (Lagos) for demo.`);
          setLocation({ lat: 6.5244, lng: 3.3792 });
          fetchNearby(6.5244, 3.3792);
        }
      },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

  if (isLoading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#060B18] relative z-0">
          <AnimatedBackground />
          <div className="relative z-10 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-300">Locating nearest vulcanizers...</p>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  if (location && vulcanizers !== null) {
    return (
      <>
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 md:flex-row overflow-hidden relative">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-[#060B18] z-50">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          </div>
        }>
          {/* Full screen map on mobile, half screen on desktop */}
          <div className="flex-1 relative h-full w-full z-0">
            <VulcanizerMap
              userLocation={location}
              vulcanizers={vulcanizers}
              activeRoute={activeRoute}
              routingMode={routingMode}
              routeDetails={routeDetails}
              routeDestination={routeDestination}
              isDark={isDark}
            />
          </div>

          {/* Desktop List (hidden on mobile) */}
          <div className="hidden md:flex w-[400px] lg:w-[480px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto shadow-xl z-10 flex-col">
            <VulcanizerList
              vulcanizers={vulcanizers}
              onShowRoute={(dest) => fetchRoute(dest, routingMode)}
              onCancelRoute={handleCancelRoute}
              routingMode={routingMode}
              onRoutingModeChange={handleRoutingModeChange}
              routeDestination={routeDestination}
            />
          </div>

          {/* Mobile Bottom Sheet Drawer */}
          <div className="md:hidden">
            <Drawer.Root
              snapPoints={[0.2, 0.5, 0.9]}
              activeSnapPoint={snap}
              setActiveSnapPoint={(val) => setSnap(val as number)}
              open={true}
              dismissible={false}
              modal={false}
              disablePreventScroll={true}
            >
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/5 dark:bg-black/40 pointer-events-none md:hidden" />
                <Drawer.Content
                  className="bg-white dark:bg-slate-900 flex flex-col rounded-t-3xl h-[90dvh] fixed bottom-0 left-0 right-0 z-50 md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] outline-none border border-t-slate-200 dark:border-slate-800"
                >
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-t-3xl flex-shrink-0 cursor-grab active:cursor-grabbing">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 dark:bg-slate-700 mb-1" />
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    <VulcanizerList
                      vulcanizers={vulcanizers}
                      onShowRoute={(dest) => {
                        fetchRoute(dest, routingMode);
                        setSnap(0.2); // Snap down when they click to see the route on map
                      }}
                      onCancelRoute={handleCancelRoute}
                      routingMode={routingMode}
                      onRoutingModeChange={handleRoutingModeChange}
                      routeDestination={routeDestination}
                    />
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </Suspense>
        </div>
        <Analytics />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#060B18] p-6 relative z-0 overflow-hidden">
      <AnimatedBackground />

      <div className="max-w-[420px] w-full bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-800/80 relative z-10">
        <div className="p-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-[#172554] rounded-full flex flex-col items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(37,99,235,0.1)] border border-blue-900/50 overflow-hidden text-blue-400">
            <TireRepairIcon className="w-12 h-12" />
          </div>

          <div className="flex items-center justify-center text-3xl font-bold tracking-tight mb-8">
            <span className="text-white">pump&nbsp;</span>
            <span className="text-[#3b82f6]">me</span>
          </div>

          <h1 className="text-[2.25rem] font-extrabold text-white mb-4 tracking-tight leading-tight">
            You dey find vulcanizer abi?
          </h1>

          <p className="text-slate-400 mb-8 text-lg leading-relaxed">
            Flat tire? Pump a ball?, We'll instantly locate the closest vulcanizers using your current location.
          </p>

          <button
            onClick={requestLocation}
            className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-3 text-lg"
          >
            Allow Location Access
          </button>

          {error && (
            <p className="text-red-400 mt-4 text-sm font-medium">{error}</p>
          )}

          <div className="w-full mt-6">
            <p className="text-slate-500 text-xs italic">
              We only use your location to find vulcanizers near you. It's not stored, so relax.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-slate-500 text-xs">
          © 2026{' '}
          <button
            onClick={() => setShowAbout(true)}
            className="text-slate-400 hover:text-white transition-colors underline underline-offset-4"
          >
            TheseNPCs
          </button>
        </p>
      </div>

      <Drawer.Root open={showAbout} onOpenChange={setShowAbout}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Drawer.Content className="bg-slate-900 flex flex-col rounded-t-[32px] h-[70vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800">
            <div className="p-4 bg-slate-900 rounded-t-[32px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-700 mb-8" />
              <div className="max-w-md mx-auto px-4 pb-8 text-slate-300">
                <p className="text-xs text-slate-400 italic mb-8 leading-relaxed border-l-2 border-blue-900/50 pl-3">
                  "For we are God's handiwork, created in Christ Jesus to do good works, God prepared in advance for us to do." - Ephesians 2:10.
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">About the Project</h2>
                <p className="mb-8 leading-relaxed">
                  Pump Me is an open-source project that helps drivers quickly locate nearby roadside vulcanizers during tire emergencies. It was built to prove that some of the most meaningful software isn't measured by revenue, but by the people it helps.
                </p>
                <h3 className="text-lg font-semibold text-white mb-4">Contributors</h3>
                <ul className="space-y-6">
                  <li className="flex items-center gap-4">
                    <img src="/Hitobashira.svg" alt="Hitobashiraxl" className="w-12 h-12 rounded-full object-cover bg-slate-800 border border-slate-700" />
                    <div>
                      <p className="text-white font-medium">Hitobashiraxl</p>
                      <p className="text-sm text-slate-500">Software Developer / Youtuber</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <img src="/Myke.svg" alt="BadboyMyke" className="w-12 h-12 rounded-full object-cover bg-slate-800 border border-slate-700" />
                    <div>
                      <p className="text-white font-medium">BadboyMyke</p>
                      <p className="text-sm text-slate-500">Frontend Developer / Entrepreneur</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      <Analytics />
    </div>
  );
}

export default App;
