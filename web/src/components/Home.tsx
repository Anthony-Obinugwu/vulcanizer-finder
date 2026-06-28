import { MapPin, Search } from 'lucide-react';

interface HomeProps {
  onAllowLocation: () => void;
  loading: boolean;
  error: string | null;
}

export function Home({ onAllowLocation, loading, error }: HomeProps) {
  return (
    <div className="flex-1 flex flex-col px-6 py-12 justify-center items-center text-center">
      <div className="w-24 h-24 bg-vulcan-100 rounded-full flex items-center justify-center mb-8 relative">
        <MapPin className="w-12 h-12 text-vulcan-600 absolute z-10" />
        {loading && (
          <div className="absolute inset-0 rounded-full border-4 border-vulcan-300 border-t-vulcan-600 animate-spin" />
        )}
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
        Find the nearest vulcanizer in seconds.
      </h2>
      
      <p className="text-slate-500 mb-10 text-lg">
        Got a flat tire? We'll locate trusted repair shops around you instantly. No sign-up required.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 w-full text-sm border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={onAllowLocation}
        disabled={loading}
        className="w-full bg-vulcan-600 hover:bg-vulcan-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-vulcan-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
      >
        <MapPin className="w-5 h-5" />
        {loading ? 'Locating...' : 'Allow Location'}
      </button>

      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-slate-50 text-slate-400">or search area</span>
        </div>
      </div>

      <div className="w-full mt-6 relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Enter area (e.g., Ikeja, Lagos)" 
          className="w-full bg-white border border-slate-200 text-slate-900 py-3.5 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-vulcan-500/50 transition-all"
        />
      </div>
    </div>
  );
}
