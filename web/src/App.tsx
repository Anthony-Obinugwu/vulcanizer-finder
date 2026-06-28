import { useState } from 'react';
import { Home } from './components/Home';
import { Results } from './components/Results';
import { Vulcanizer } from './types';
import { fetchNearbyVulcanizers } from './lib/api';

function App() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [vulcanizers, setVulcanizers] = useState<Vulcanizer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationAllow = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        try {
          const data = await fetchNearbyVulcanizers(latitude, longitude);
          setVulcanizers(data);
        } catch (err) {
          setError('Failed to fetch nearby vulcanizers. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Unable to retrieve your location. Please check your permissions.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-vulcan-600 to-vulcan-400 bg-clip-text text-transparent">
            Vulcanizer Finder
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full relative">
        {!location && !loading && vulcanizers.length === 0 ? (
          <Home onAllowLocation={handleLocationAllow} loading={loading} error={error} />
        ) : (
          <Results location={location} vulcanizers={vulcanizers} loading={loading} />
        )}
      </main>
    </div>
  );
}

export default App;
