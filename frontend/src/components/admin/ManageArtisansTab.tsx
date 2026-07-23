import { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageArtisansTab({ adminPin }: { adminPin: string }) {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArtisans = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artisans/all`, {
        headers: { 'x-admin-pin': adminPin }
      });
      if (!res.ok) throw new Error('Failed to fetch artisans');
      const data = await res.json();
      setArtisans(data);
    } catch (error) {
      toast.error('Failed to load artisans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
  }, [adminPin]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artisans/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Artisan deleted successfully');
      setArtisans(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      toast.error('Failed to delete artisan');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Artisans</h1>
          <p className="text-slate-400">View, edit, or remove service providers</p>
        </div>
        <button onClick={fetchArtisans} className="text-sm text-blue-400 hover:text-blue-300">Refresh</button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900/50 text-slate-300 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Business Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {artisans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No artisans found.</td>
                  </tr>
                ) : (
                  artisans.map(artisan => (
                    <tr key={artisan.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{artisan.business_name}</div>
                        <div className="text-xs text-slate-500">{artisan.owner_name}</div>
                      </td>
                      <td className="px-6 py-4 capitalize">{artisan.category}</td>
                      <td className="px-6 py-4">{artisan.phone || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => alert('Editing coming soon!')} className="text-blue-400 hover:text-blue-300 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(artisan.id, artisan.business_name)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
