import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { User, Movie } from '../types';
import { movieService } from '../services/movieService';

interface DashboardPageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, setUser }) => {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  React.useEffect(() => {
    const fetchMovies = async () => {
      const data = await movieService.getMovies();
      setAllMovies(data);
    };
    fetchMovies();
  }, []);

  if (!user) return <Navigate to="/login" />;

  const downloadedMovies = allMovies.filter(m => user.downloads.includes(m.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDownloading(true);
    setBulkProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        setBulkProgress(100);
        setTimeout(() => {
          setIsBulkDownloading(false);
          setSelectedIds([]);
          
          // Simulate multiple downloads
          selectedIds.forEach(id => {
            const movie = allMovies.find(m => m.id === id);
            if (movie) {
              const blob = new Blob([`Simulated Bulk Stream Output for ${movie.title}`], { type: 'text/plain' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${movie.title.replace(/\s+/g, '_')}_Mukunzi_Vault.mp4`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }
          });
        }, 500);
      } else {
        setBulkProgress(progress);
      }
    }, 100);
  };

  return (
    <div className="pt-24 pb-24 bg-[#05070a] min-h-screen">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative p-10 bg-[#11141b] rounded-[35px] border border-white/5 overflow-hidden mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/5 to-transparent"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px]"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-orange-500 p-1 rotate-2 transition-transform hover:rotate-0 duration-500">
                <div className="w-full h-full rounded-[14px] bg-[#05070a] flex items-center justify-center text-3xl font-black italic text-white">
                  {user.name[0]}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full border-2 border-[#11141b] flex items-center justify-center text-white">
                <i className="fa-solid fa-crown text-[10px]"></i>
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">{user.name}</h1>
                <span className="px-2 py-0.5 bg-orange-600 text-white text-[8px] font-black rounded-full uppercase tracking-widest">MEMBER</span>
              </div>
              <p className="text-slate-500 font-bold mb-4 text-xs">{user.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-white italic tracking-tighter">{user.downloads.length}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Downloads</span>
                </div>
                <div className="w-[1px] h-8 bg-slate-800 hidden md:block"></div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-blue-500 italic tracking-tighter">Unlimited</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Bandwidth</span>
                </div>
                <div className="w-[1px] h-8 bg-slate-800 hidden md:block"></div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-orange-500 italic tracking-tighter">Gold</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Account Tier</span>
                </div>
              </div>
            </div>

            <div className="md:ml-auto">
              <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border border-white/5">
                Vault Settings
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
              <i className="fa-solid fa-bolt-lightning text-orange-500 text-sm"></i>
              Cinema Vault
            </h2>
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDownload}
                disabled={isBulkDownloading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-blue-900/20"
              >
                {isBulkDownloading ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Syncing {bulkProgress}%
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-down"></i>
                    Download Selected ({selectedIds.length})
                  </>
                )}
              </button>
            )}
          </div>
          <div className="h-[1px] flex-1 mx-6 bg-white/5"></div>
          <span className="text-slate-600 font-black uppercase text-[8px] tracking-widest">{downloadedMovies.length} ARCHIVED</span>
        </div>

        {downloadedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {downloadedMovies.map(movie => (
              <div key={movie.id} className="group relative">
                <div 
                  onClick={() => toggleSelect(movie.id)}
                  className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.includes(movie.id) ? 'bg-blue-600 border-blue-600' : 'bg-black/40 border-white/20 opacity-0 group-hover:opacity-100'}`}
                >
                  {selectedIds.includes(movie.id) && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                </div>
                <Link to={`/movie/${movie.id}`} className={`block relative aspect-video rounded-xl overflow-hidden mb-3 shadow-xl border transition-all group-hover:-translate-y-1 duration-300 ${selectedIds.includes(movie.id) ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-white/5 group-hover:border-blue-500/50'}`}>
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover transition-all duration-700" />
                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <i className="fa-solid fa-play text-white text-xl"></i>
                  </div>
                </Link>
                <h3 className="text-[11px] font-black text-white uppercase italic tracking-tighter group-hover:text-blue-500 transition-colors">{movie.title}</h3>
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">{movie.year} • {movie.category}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#11141b] rounded-[35px] border border-white/5">
            <div className="w-16 h-16 bg-[#05070a] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
              <i className="fa-solid fa-layer-group text-2xl text-slate-700"></i>
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tighter mb-4">Vault Empty</h3>
            <p className="text-slate-600 mb-8 max-w-xs mx-auto font-bold uppercase tracking-widest text-[8px]">Start building your private cinema archive today.</p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95">
              Browse Masterpieces
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;