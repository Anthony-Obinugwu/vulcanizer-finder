import { useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import AnimatedBackground from './components/AnimatedBackground';
import Alert from './components/Alert';

function Admin() {
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    phone: '',
    latitude: '',
    longitude: '',
    address: '',
    admin_pin: ''
  });

  const [services, setServices] = useState<Record<string, boolean>>({
    'Tire Pump': true,
    'Tire Repair': false,
    'Wheel Balancing': false,
    'Tube Replacement': false,
    'Tire Sales': false
  });

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (service: string) => {
    setServices((prev) => ({ ...prev, [service]: !prev[service] }));
  };

  const getLocation = () => {
    setIsLocating(true);
    setStatus({ type: null, message: '' });

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setIsLocating(false);
      },
      (error) => {
        toast.error(`Location error: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const selectedServices = Object.entries(services)
      .filter(([_, isSelected]) => isSelected)
      .map(([serviceName]) => serviceName);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vulcanizers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': formData.admin_pin
        },
        body: JSON.stringify({
          business_name: formData.business_name,
          owner_name: formData.owner_name,
          phone: formData.phone,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address,
          services: selectedServices
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit data');
      }

      toast.success('Vulcanizer added successfully!');
      
      // Reset some fields but keep PIN and maybe owner name for consecutive entries
      setFormData((prev) => ({
        ...prev,
        business_name: '',
        latitude: '',
        longitude: '',
        address: ''
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B18] text-slate-200 p-4 md:p-8 relative z-0">
      <AnimatedBackground />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Add Vulcanizer</h1>
            <p className="text-slate-400">Data Collection Panel</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            &larr; Back to Map
          </button>
        </header>

        {status.type && (
          <Alert variant={status.type} message={status.message} className="mb-6" />
        )}

        <form onSubmit={handleSubmit} className="bg-[#0F172A]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
          
          <div className="space-y-4 border-b border-slate-800 pb-6">
            <h2 className="text-xl font-semibold text-white">Authentication</h2>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Admin PIN <span className="text-red-400">*</span></label>
              <input
                type="password"
                name="admin_pin"
                required
                value={formData.admin_pin}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter 4-digit PIN"
              />
            </div>
          </div>

          <div className="space-y-4 border-b border-slate-800 pb-6">
            <h2 className="text-xl font-semibold text-white">Location Data</h2>
            
            <button
              type="button"
              onClick={getLocation}
              disabled={isLocating}
              className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-xl px-4 py-4 flex items-center justify-center gap-2 transition-all font-medium"
            >
              {isLocating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Locating GPS...</>
              ) : (
                <><MapPin className="w-5 h-5" /> Get Current Location</>
              )}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Latitude <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  required
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 6.5244"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Longitude <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  required
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 3.3792"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nearest landmark or street"
              />
            </div>
          </div>

          <div className="space-y-4 border-b border-slate-800 pb-6">
            <h2 className="text-xl font-semibold text-white">Business Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Business Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="business_name"
                required
                value={formData.business_name}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Iya Basira Tyres"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Owner Name</label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="080..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-xl font-semibold text-white">Services Offered</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(services).map(([service, isSelected]) => (
                <label key={service} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'bg-blue-900/30 border-blue-500/50 text-blue-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                    checked={isSelected}
                    onChange={() => handleServiceChange(service)}
                  />
                  <span className="text-sm font-medium">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLocating}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 text-lg"
          >
            {isSubmitting ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Saving to Database...</>
            ) : (
              'Add Vulcanizer'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Admin;
