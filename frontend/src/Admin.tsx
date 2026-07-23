import { useState, useEffect } from 'react';
import { Loader2, PlusCircle, Users, LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import AnimatedBackground from './components/AnimatedBackground';
import AddArtisanTab from './components/admin/AddArtisanTab';
import ManageArtisansTab from './components/admin/ManageArtisansTab';
import ManageContributorsTab from './components/admin/ManageContributorsTab';

function Admin() {
  const [adminPin, setAdminPin] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPin, setLoginPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'contributors'>('manage');

  // Check session storage on mount
  useEffect(() => {
    const savedPin = sessionStorage.getItem('adminPin');
    if (savedPin) {
      setAdminPin(savedPin);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      // Test the PIN by trying to fetch artisans (since it's protected now)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artisans/all`, {
        headers: { 'x-admin-pin': loginPin }
      });
      
      if (!res.ok) {
        throw new Error('Invalid PIN');
      }
      
      sessionStorage.setItem('adminPin', loginPin);
      setAdminPin(loginPin);
      setIsLoggedIn(true);
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error('Invalid Admin PIN');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminPin');
    setAdminPin('');
    setIsLoggedIn(false);
    setLoginPin('');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#060B18] flex items-center justify-center p-4 relative z-0">
        <AnimatedBackground />
        
        <div className="max-w-md w-full bg-[#0F172A]/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative z-10 text-center">
          <div className="w-16 h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400 mb-8">Enter your secure PIN to access.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                required
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                className="w-full bg-[#060B18]/50 border border-slate-700 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-white focus:ring-2 focus:ring-blue-500/50 outline-none shadow-inner transition-all"
                placeholder="****"
                maxLength={4}
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn || loginPin.length < 4}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Login'}
            </button>
          </form>
          
          <button onClick={() => window.location.href = '/'} className="mt-8 text-sm text-slate-500 hover:text-white transition-colors">
            &larr; Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B18] text-slate-200 flex flex-col md:flex-row relative z-0">
      <AnimatedBackground />
      
      {/* Sidebar Desktop / Topbar Mobile */}
      <div className="md:w-64 bg-[#0F172A]/90 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col relative z-20">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-500" /> Dashboard
          </h1>
        </div>
        
        <nav className="flex-1 px-4 pb-4 md:pb-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
          <button 
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${activeTab === 'manage' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> <span className="hidden md:inline">Manage Artisans</span>
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${activeTab === 'add' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <PlusCircle className="w-5 h-5" /> <span className="hidden md:inline">Add Artisan</span>
          </button>
          <button 
            onClick={() => setActiveTab('contributors')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${activeTab === 'contributors' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Users className="w-5 h-5" /> <span className="hidden md:inline">Contributors</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800/80 hidden md:block">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl w-full transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 relative z-10 overflow-y-auto">
        <div className="md:hidden flex justify-end mb-4">
           <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
             <LogOut className="w-4 h-4" /> Logout
           </button>
        </div>

        {activeTab === 'add' && <AddArtisanTab adminPin={adminPin} />}
        {activeTab === 'manage' && <ManageArtisansTab adminPin={adminPin} />}
        {activeTab === 'contributors' && <ManageContributorsTab adminPin={adminPin} />}
      </div>
    </div>
  );
}

export default Admin;
