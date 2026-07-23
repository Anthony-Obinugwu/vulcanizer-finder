import { useState, useEffect, useRef } from 'react';
import { Loader2, Trash2, Plus, UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageContributorsTab({ adminPin }: { adminPin: string }) {
  const [contributors, setContributors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newContributor, setNewContributor] = useState({
    name: '',
    role: ''
  });

  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
    base64: string;
    contentType: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const fetchContributors = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contributors`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setContributors(data);
    } catch (error) {
      toast.error('Failed to load contributors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContributors();
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file,
          preview: e.target?.result as string,
          base64: e.target?.result as string,
          contentType: file.type
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    // Handle PNG/JPG - Resize to 500x500 center crop
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = 500;
        canvas.height = 500;
        
        // Calculate center crop
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 500, 500);
        
        const base64 = canvas.toDataURL('image/webp', 0.9);
        setSelectedImage({
          file,
          preview: base64,
          base64,
          contentType: 'image/webp' // Always upload optimized webp
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast.error('Please upload an image for the contributor.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Step 1: Upload the image
      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          base64Data: selectedImage.base64,
          fileName: selectedImage.file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'), // Sanitize filename
          contentType: selectedImage.contentType
        })
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const uploadData = await uploadRes.json();
      
      // Step 2: Create the contributor
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contributors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          name: newContributor.name,
          role: newContributor.role,
          image_url: uploadData.url
        })
      });
      
      if (!res.ok) throw new Error('Failed to create contributor');
      const { data } = await res.json();
      
      toast.success('Contributor added!');
      setContributors([...contributors, data]);
      setNewContributor({ name: '', role: '' });
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('An error occurred while adding the contributor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from contributors?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contributors/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Contributor removed');
      setContributors(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      toast.error('Failed to delete contributor');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Add Contributor</h1>
          <p className="text-sm text-slate-400">Add a new team member to the About page.</p>
        </header>

        <form onSubmit={handleAdd} className="bg-[#0F172A]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 shadow-2xl space-y-4">
          
          {/* Custom Drag & Drop Image Uploader */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Profile Image <span className="text-red-400">*</span></label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !selectedImage && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all ${
                selectedImage 
                  ? 'border-blue-500/50 bg-[#060B18]/50' 
                  : isDragging 
                    ? 'border-blue-400 bg-blue-500/10' 
                    : 'border-slate-700 hover:border-slate-500 bg-[#0F172A]/80 cursor-pointer'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/svg+xml,image/png,image/jpeg,image/webp" 
                className="hidden" 
              />
              
              {selectedImage ? (
                <div className="relative group p-2">
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                    <img src={selectedImage.preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-2 truncate px-2">{selectedImage.file.name}</p>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">Click or Drag & Drop</p>
                  <p className="text-xs text-slate-500">SVG, PNG, JPG (Auto-resized to 500x500)</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              value={newContributor.name}
              onChange={(e) => setNewContributor({ ...newContributor, name: e.target.value })}
              className="w-full bg-[#0F172A]/80 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none text-sm shadow-inner transition-all"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Role <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              value={newContributor.role}
              onChange={(e) => setNewContributor({ ...newContributor, role: e.target.value })}
              className="w-full bg-[#0F172A]/80 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none text-sm shadow-inner transition-all"
              placeholder="e.g. Frontend Developer"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !selectedImage}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Plus className="w-4 h-4" /> Add Contributor</>}
          </button>
        </form>
      </div>

      <div className="md:col-span-2">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Current Contributors</h1>
          <button onClick={fetchContributors} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Refresh</button>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20 bg-[#0F172A]/90 rounded-2xl border border-slate-800">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-[#0F172A]/90 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden divide-y divide-slate-800/50">
            {contributors.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic">No contributors added yet.</div>
            ) : (
              contributors.map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-full object-cover bg-slate-800 border border-slate-700" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{c.name}</p>
                      <p className="text-sm text-slate-500">{c.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(c.id, c.name)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
